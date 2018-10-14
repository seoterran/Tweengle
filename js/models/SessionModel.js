!(function(exports, undefined) {

  exports.SessionModel = Backbone.Model.extend({
    defaults: {
           subscriberName : null, //teacher
           publisherName : null,//student
           subscriberID : null,//teacher
           publisherID : null,//student
           time : 0,
           startTime : null,
           endTime: null,
           language : null,
           rate : null,
           point: null,
           me: null,
           sessionID:null,
           status:false,
           timeRemaining:null,
           free:false
         },
    //idAttribute: "uid",
    urlRoot: '/session'
 });
  
  
  }(window, jQuery));  