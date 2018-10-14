!(function(exports, undefined) {

  exports.ChatContentModel = Backbone.Model.extend({
    defaults: {
           uid1 : null,
           uid2: null,
           name1 : null,
           name2: null,
           turnToRead: null,
           content : null
           //description : null,
           //point : null, 
           //profileURL : null,
           //language: null
         },
    urlRoot: '/ChatContent'
  });
  
  
  }(window, jQuery));  