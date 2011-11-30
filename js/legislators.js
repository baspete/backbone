"use strict"

$(function(){
  var sunlightBaseUrl = "http://services.sunlightlabs.com/api/legislators.getList.json?apikey=7efa89de59164c85aaff5cc5774df43f&";
  var sunlightParams = {
    "state":"CA",
    "title":"Sen",
  };

  var Filter = Backbone.Model.extend({
    initialize: function(){
      // set the values from the global "sunlightParams object"      
      this.set(sunlightParams);
      // on change, update the global "sunlightParams" object
      this.bind("change",function(){
        sunlightParams = this.toJSON();
      })
    } 
  });

  var FilterView = Backbone.View.extend({
    el: $("#filter"),
    template: _.template($('#filter_template').html()),
    initialize: function(){
      this.render();
    },
    events: {
      "change select": "changed",
    },
    render: function() {
      this.el.html(this.template());
      // set values based on model
      $("#state").val(this.model.get("state"));
      $("#title").val(this.model.get("title"));
      $("#party").val(this.model.get("party"));
      return this;
    },
    changed: function(e) {
      var target = $(e.currentTarget),
          data = {};
      data[target.attr('name')] = target.attr('value');
      this.model.set(data);
    }
  });

  var Legislator = Backbone.Model.extend({
    initialize: function(){
      // FACEBOOK
      //  TODO: this should be getting a model, not setting this stuff directly
      var avatar_url = "http://graph.facebook.com/"+this.get("facebook_id")+"/picture";
      var wall_url = "http://www.facebook.com/"+this.get("facebook_id");
      this.set({"fb":{"avatar_url": avatar_url, "wall_url": wall_url}});
      // TWITTER
      // extend the legislators model with the models returned from the TweetsList collection
      if(this.get("twitter_id") !== "" ){
        var tweets = new TweetsList({"twitter_id":this.get("twitter_id")});
        var l = this;
        tweets.bind("all", function(){
          l.set({"tweets":tweets.toJSON()});
          console.log("Legislator tweets changed: ",l.toJSON().tweets);
          l.change();
        });
      }
    }
  });
  
  var LegislatorsList = Backbone.Collection.extend({
    model: Legislator,
    url: function(){
      for(var i in sunlightParams){
        if(sunlightParams[i] === "undefined" || sunlightParams[i] === ""){
          delete sunlightParams[i];
        }
      }
      return sunlightBaseUrl + $.param(sunlightParams);
    },
    initialize: function(){
      this.fetch({
        success: function(items) {
          items.each(function(data) {
            var model = new Legislator(data.get("legislator"))
            var view = new LegislatorView(model);
          });
         }
      })
    },
    sync: function(method, model, options){  
      options.cache    = true; // sunlightlabs needs this to return jsonp
      options.jsonp    = "jsonp"; // sunlightlabs needs this to return jsonp
      options.dataType = "jsonp";  // by tell backbone.js to use jsonp
      return Backbone.sync(method, model, options);  
    },
    parse: function(response){
      return(response.response.legislators); // just return the array, not the whole object
    }
  });

  var LegislatorView = Backbone.View.extend({
    model: Legislator,
    template: _.template($('#legislator_template').html()),
    initialize: function() {
      this.render();
      this.model.bind('change', function(){
      console.log("View changed")
      });
    },
    changed: function(){
    },
    render: function() {
      var l = this.attributes;
      $("#legislators").append(this.template(l));
      console.log("LegislatorView: ",l, ", tweets: ",l.tweets)
      return this;
    }
  });

  var Tweet = Backbone.Model.extend({
    initialize: function(){
      if(this.get("user") !== undefined){
 //       console.log("New Tweet @" + this.get("user").name + ": " + this.get("text"));
      }
    }
  });

  var TweetsList = Backbone.Collection.extend({
    model: Tweet,
    url: function(){
      var baseUrl = "https://api.twitter.com/1/statuses/user_timeline.json";
      var data =  {
        include_entities: true,
        exclude_replies: true,
        include_rts: true,
        count: 3,
        screen_name: (this.toJSON()[0].twitter_id)
      };
      return baseUrl + "?callback=?&" + $.param(data); // jsonp here
    },
    initialize: function(){
      // console.log("Tweets initialized with id: ",this.toJSON()[0].twitter_id);
      this.fetch();
    }
  });

  // Here's the app. Seems to me this is more of an object factory
  // and an event dispatcher combined.
  var LegislatorsApp = Backbone.Model.extend({
    initialize: function(){

      var legislators = new LegislatorsList();

      var filter = new Filter().bind("change",function(){
        $("#legislators").empty();
        legislators.initialize();
      });

      var filterView = new FilterView({model:filter});

    }
  })

  // load app
  window.legislatorsApp = new LegislatorsApp();
});