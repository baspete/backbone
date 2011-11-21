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
      var avatar_url = "http://graph.facebook.com/"+this.get("facebook_id")+"/picture";
      var wall_url = "http://www.facebook.com/"+this.get("facebook_id");
      this.set({"fb":{"avatar_url": avatar_url, "wall_url": wall_url}});
      console.log("created legislator: ", this.toJSON())
    }
  });
  
  var LegislatorsList = Backbone.Collection.extend({
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
    template: _.template($('#legislator_template').html()),
    initialize: function(){
      this.render();
    },
    render: function() {
      var l = this.attributes;
      console.log("view: ",l)
      $("#legislators").append(this.template(l));
      return this;
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