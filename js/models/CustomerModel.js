!(function(exports, undefined) {

  exports.CustomerModel = Backbone.Model.extend({
    defaults: {
           id : null,
           name : null,
           fid: null,
          // connected : false,
           //status : 'offline',
           rate : null,
           language: null,
           time: null,
           point: 0
           //description : null,
           //point : null, 
           //profileURL : null,
         },

   // urlRoot: '/customer'
  });
  
  
  }(window, jQuery));  