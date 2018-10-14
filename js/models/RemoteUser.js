/* -----------------------------------------------------------------------------------------------
 * Remote User Model
 * ----------------------------------------------------------------------------------------------*/
/* global Backbone, _, log */
/* exported RemoteUser */

// Prevent leaking into global scope
!(function(exports, undefined) {

  exports.RemoteUser = Backbone.Model.extend({

    defaults: {
      name: null,
      status: 'online',//not offline? maybe doesn't matter
      // NOTE: this is a derived property but it makes templating easier
      available: true,
      uid : null, // JW
      sid: null, //JW
      social:null,    
      subjects: null,// JW
      subjectsByName: '',
      rate: null, // JW
      belongTo:null, // JW
      imgSrc:null,
      noPic:null,
      timeRemaining:null
        
    },
    idAttribute: 'uid',
    urlRoot: '/users',
    // NOTE: 'offline' isn't a status the remote user object would be removed
    allStatuses: ['online', 'unavailable'],

    // NOTE: explicitly stating the available statuses allows more 'available' or 'unavailable'
    // statuses to be defined later
    availableStatuses: ['online'],

    initialize: function(attrs, options) {
      var self=this;
         /*    */
      if (!options.presenceSession) {
        throw Error('Remote user cannot be initialized without a presence session');
      }
      this.presenceSession = options.presenceSession;
        /*    */
      if (!options.connection) {
        throw Error('Remote user cannot be initialized without a connection');
      }
      this.connection = options.connection;

      var connectionData = JSON.parse(this.connection.data);
      console.log('remoteUser connectionData '+connectionData.subjectsByName+' '+connectionData.rate);//JW
      
      this.set('name', connectionData.name);
      //this.set('nickname', connectionData.nickname);
      this.set('uid', connectionData.uid);//JW no uid when logging in for the first time -->fixed?
      this.set('sid', connectionData.sid);//JW
      this.set('subjects', connectionData.subjects);//JW
      this.set('subjectsByName', connectionData.subjectsByName);//JW
      this.set('rate', connectionData.rate);//JW
      this.set('belongTo', connectionData.belongTo);//JW
      this.set('social', connectionData.social);//JW 
      this.set('imgSrc', connectionData.imgSrc);//JW 
     // this.set('timeRemaining', connectionData.timeRamaining);//JW 
    //  this.set('noPic', connectionData.noPic);//JW 
        /*
        var imgSrc;
        if(this.get('social')==1){
            imgSrc='//graph.facebook.com/'+this.get('sid') + '/picture?type=small';
            self.set('imgSrc',imgSrc);//JW 
        } else{
             Kakao.init('71cdcc100c74d63a58378236762320d9');
             Kakao.API.request({
              url: '/v1/user/me',
              success: function(res) {
                 console.log('katalk API: '+res.id+'/'+res.properties.nickname);
                 imgSrc=res.properties.thumbnail_image;
                  self.set('imgSrc',imgSrc);//JW 
              },
              fail: function(error) {
                console.log(JSON.stringify(error));
              }
            });
        }
        */
      //this.set('website', connectionData.website);//JW
     /*
      this.chattingModalView = new ChattingModalView({
        model: App.me,
        el: $('#chat-modal'),
        dispatcher: App,
        connection: this.connection
      });
    */    
        
        
    
      this.presenceSession.on('signal:' + this.connection.connectionId + '~status',
                              this.remoteStatusUpdated,
                              this);
                              
      this.on('change:status', this.statusChanged, this);
    },

    statusChanged: function(self, status) {
      log.info('RemoteUser: statusChanged', status);
      this.set('available', _.include(this.availableStatuses, status));
    },

    remoteStatusUpdated: function(event) {
      log.info('RemoteUser: remoteStatusUpdated', event);
      this.set('status', event.data);
    },
    updateStatus: function(status){
      console.log('status update :'+this.uid+'/'+status);
      this.set('status',status);    
      this.save({}, {
                type: 'PUT',
                success: function (model, response) {
                    console.log("remoteUser save success");
                },
                error: function (model, response) {
                    console.log("remoteUser save error");
                }
            });
      
    },
    match: function ( keyword,name ) {
     // this.selector = select;
      var result=false;
      if(name!='')
          result=this.get('name').toLowerCase().includes( name.toLowerCase());
      else if(keyword!='All')   {
          
          //result=this.get('language').toLowerCase().includes(keyword.toLowerCase());
          var temp=this.get('subjects');
          if(temp)
            result=temp[keyword];
      }
     
     // result3=result1 && result2;
      console.log('remoteUser match : '+keyword+'/'+result);
      return result;
   }
  });

}(window));
