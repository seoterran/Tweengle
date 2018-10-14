!(function(exports, undefined) {

  exports.UserModel = Backbone.Model.extend({
    defaults: {
           uid : null,
           name : null,
           sid: null,
           social:null,
           imgSrc:null,
           imgSrc2:null,
           connected : false,
           status : 'offline',
           rate : null,
           subjects: null,
           subjectsByName:null,
           belongTo : null
           //point : null, 
           //profileURL : null,
           
         },
    idAttribute: 'uid',
    urlRoot: '/allusers'
  });
  
  
  }(window, jQuery));  