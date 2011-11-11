
$(function(){
  
  window.Legislator = Backbone.Model.extend({
    initialize: function(){
      console.log("Created Legislator",this.get("legislator"));
    }
  });
  
  window.LegislatorList = Backbone.Collection.extend({
    model: Legislator,
    url: "http://services.sunlightlabs.com/api/legislators.getList.json?apikey=7efa89de59164c85aaff5cc5774df43f&state=CA&title=Rep",
    sync: function(method, model, options){  
      options.cache = true; // sunlightlabs needs this to return jsonp
      options.jsonp = "jsonp"; // sunlightlabs needs this to return jsonp
      options.dataType = "jsonp";  // by tell backbone.js to use jsonp
      return Backbone.sync(method, model, options);  
    },
    parse: function(response){
      return(response.response.legislators);
    }
  });

  window.LegislatorView = Backbone.View.extend({
    template: _.template($('#legislator_template').html()),
    render: function() {
      var l = this.model.toJSON().legislator;
      console.log("view: ",this.model.toJSON())
      $("#legislators").append(this.template(l));
      return this;
    }
  });

  // load legislators
  window.legislators = new LegislatorList()

  legislators.fetch({
    success: function(collection, response) {
      collection.each(function(Legislator) {
        var view = new LegislatorView({
          model: Legislator
        });
        view.render();
      });
     }
   });
  
});