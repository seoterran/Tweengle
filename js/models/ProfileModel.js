!(function(exports, undefined) {

  exports.ProfileModel = Backbone.Model.extend({
    defaults: {
           uid : null,
           sid:null,
           social:null,
           mine: null,
           name : null,
           connected : null,
           status : null,
           language: null,
           rate : 0,
           description : null,
           profileURL : 'aaa',
           website: null,
           isTeacher:false,
           nickname:null,
           email:null,
           paypal:null,
           belongTo:null,
           point : null, 
           pointEarned: null,
           pointSpent: null,
           cashable:null,
           subjects:null,
           subjectsByName:'',
           imgSrc:null,
           imgSrc2:null,
           bank:null,
           account:null,
           education:null,
           experience:null,
           interest:null,
           videoTutor:false,
           freeMins:'0',
           noPic:false,
           noProfile:false,
           timeRemaining:null,
           accHolder:null
            //area1:null,
           //area2:null,
         },
    idAttribute: "uid",
    urlRoot: '/listdata'
  });
  
  
  }(window, jQuery));  