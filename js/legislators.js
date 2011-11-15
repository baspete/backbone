
$(function(){
  
  var sunlightBaseUrl = "http://services.sunlightlabs.com/api/legislators.getList.json?apikey=7efa89de59164c85aaff5cc5774df43f&";
  
  var Filter = Backbone.Model.extend({
    change: function(){
      $("#legislators").empty();
      var params = this.toJSON();
      // sending empty query params breaks 
      for(var i in params){
        if(params[i] === "undefined" || params[i] === ""){
          delete params[i];
        }
      }
      // This is ghetto. How to bind here?
      legislators.url = sunlightBaseUrl + $.param(params);
      legislators.initialize();
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
      console.log("Created Legislator",this.get("legislator"));
    }
  });
  
  var LegislatorList = Backbone.Collection.extend({
    url: sunlightBaseUrl,
    initialize: function(){
      this.fetch({
        success: function(collection) {
          collection.each(function(Legislator) {
            var view = new LegislatorView({
              model: Legislator
            });
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
      var l = this.model.toJSON().legislator;
      $("#legislators").append(this.template(l));
      return this;
    }
  });

  // load filters
  window.filterView = new FilterView({model:(new Filter())});
  // load legislators
  window.legislators = new LegislatorList()

});