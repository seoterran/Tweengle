!(function(exports, undefined) {

  exports.ProfileEditModel = Backbone.Model.extend({
    defaults: {
           name : "name~~ ",
           language: null,
           uid : null
         },
    urlRoot: '/profile'
  });
  
  
  }(window, jQuery));  