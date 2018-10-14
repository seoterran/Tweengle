/* -----------------------------------------------------------------------------------------------
 * Chat Model
 * ----------------------------------------------------------------------------------------------*/
/* global OT, Backbone, _, log */
/* exported Chat */

// Prevent leaking into global scope
!(function(exports, undefined) {

  exports.Chat = Backbone.Model.extend({

    defaults: {
      subscriberName: null
    },

    videoProperties: {
      insertDefaultUI: true,//default
      insertMode: 'append',
      width: '100%',
      height: '100%',
      showControls: true,
      style: {
        buttonDisplayMode: 'off',
        audioLevelDisplayMode: 'on',
         
      }
    },

    initialize: function(attrs, options) {
      if (!options.localUser) {
        log.error('Chat: initialize() cannot be called without a local user');
        return;
      }
      this.localUser = options.localUser;

      if (!options.invitation) {
        log.error('Chat: initialize() cannot be called without an invitation');
        return;
      }
      this.invitation = options.invitation;

      this.set('subscriberName', this.invitation.get('remoteUser').get('name'));
      this.audio=true;
      this.video=true;
     // this.cameraPublished=false;
      this.cameraSubscriber=null;
      
      this.extensionId ='gipamokahomnoiindojdfmdeokpcakho';//ihjkcndkmgckhioeepihkmjhncjnamhh';
      OT.registerScreenSharingExtension('chrome', this.extensionId,2); 
        
      //this.screenSharingPublisher=0;
   //  $.getScript("/semantic/semantic.min.js");
    },

    start: function(publisherEl, subscriberEl) {
      var self = this,
          _start;
      console.log('Chat: start');

      _start = function () {
        self.subscriberEl = subscriberEl;
        //OT.setLogLevel(OT.DEBUG);
        self.session = OT.initSession(self.invitation.get('apiKey'),
                                      self.invitation.get('sessionId'));
          
        OT.log(self.invitation.get('sessionId'));
        self.session.on('sessionConnected', self.sessionConnected, self)
                    .on('sessionDisconnected', self.sessionDisconnected, self)
                    .on('streamCreated', self.streamCreated, self)
                    .on('connectionCreated', self.connectionCreated, self)
                    .on('connectionDestroyed', self.connectionDestroyed, self)
                    //.on('streamDestroyed', self.streamDestroyed, self);
          
        self.session.connect(self.invitation.get('token'),function (error) {
          if (error) {
            console.log("Failed to connect: ", error.message);
            
            if (error.code == 1006) {
              alert("You are not connected to the internet. Check your network connection.");
            }   
            self.end();
            return;  
          } else {
            console.log("Connected");
            //document.getElementById('stop').style.visibility = "hidden"; 
          }
        });

        self.publisher = OT.initPublisher(publisherEl, self.videoProperties,function(error){
            if(error){
                console.log(' initPublisher failure for camera');
                //chatting stop code required
            }
            else {
                console.log(' initPublisher success for camera');
                self.trigger('started');   
            }
        });
      };

      this.verifyInvitationReady(function() {
        self.verifyUserStatus(_start);
      });
    },
    checkBrowser: function(){
        var isChrome = !!window.chrome && !!window.chrome.webstore;  
        if(isChrome){
            console.log('browser check: this is Chrome');
            return 1;
        }
        else {
            console.log('browser check: this is not Chrome');
            return 2;
        }
    },
    end: function() {
      console.log('Chat: end');
     // var isChrome = !!window.chrome && !!window.chrome.webstore;  
      $('#iframeHolder').html('');
      
      if(this.checkBrowser()!=1){   //not chrome 
            this.session.unpublish(this.publisher); // not works in Chrome
            this.session.unpublish(this.screenSharingPublisher);
       }
      //  alert('end');
      this.session.disconnect();  // -->sessionDisconnected event -> sessionDisconnected()  seems why not always?
    },
    backToChatMode: function(){
        //alert('backToChatMode');
        
        this.cameraSubscriber.element.style.position='fixed'; //not working since second time
        this.cameraSubscriber.element.style.width='99%'; //82%;
        this.cameraSubscriber.element.style.height='99%';
        this.cameraSubscriber.element.style.zIndex='310';
        this.cameraSubscriber.element.style.left='5px';
        this.cameraSubscriber.element.style.top='5px';//81px';
        this.cameraSubscriber.element.style.border='1px solid black';
        this.cameraSubscriber.element.style.borderRadius='5px';
        
        this.publisher.element.style.position='fixed';
        this.publisher.element.style.zIndex='330';
        //this.publisher.element.style.left='87%';
        this.publisher.element.style.right='1em';
        //this.publisher.element.style.top='240px';
        this.publisher.element.style.top='15px';
        this.publisher.element.style.width='150px';
        this.publisher.element.style.height='150px';
        this.publisher.element.style.border='1px solid black'; 
        this.publisher.element.style.borderRadius='5px';
        
        document.getElementById('chat-tool').style.zIndex='360';//bottom-bar disappearing issue
      },
    leftTopSubscriber:function(){
        this.cameraSubscriber.element.style.position='fixed'; //not working since second time
        this.cameraSubscriber.element.style.width='150px';
        this.cameraSubscriber.element.style.height='150px';
        this.cameraSubscriber.element.style.top='1%';//'85px';
        this.cameraSubscriber.element.style.border='1px solid black';
        this.cameraSubscriber.element.style.left='1em';//'88%';
        //  this.cameraSubscriber.element.style.zIndex='350';
      },
    rightTopPublisher:function(){
        this.publisher.element.style.position='fixed';
        this.publisher.element.style.right='1em';
        this.publisher.element.style.top='1%';//245px';
        this.publisher.element.style.width='150px';
        this.publisher.element.style.height='150px';
        this.publisher.element.style.border='1px solid black'; 

        //  this.publisher.element.style.zIndex='350';
        //  this.publisher.element.style.left='88%';
        // this.publisher.element.style.border='';
          /*
        var elem = document.getElementById("testDiv");
        this.tempEle=this.publisher.element;
        this.publisher.element=elem;
        */
        
    },
    tempMode:function(){
        this.leftTopSubscriber();
        this.rightTopPublisher();
    },
    startBoard: function(){
        console.log('Chat: startBoard');
              //this.cameraSubscriber.element.style.float='right';
         //this.cameraSubscriber.element.style.clear='both';
          // this.cameraSubscriber.element.style.left='1227px';
       // document.getElementById("timer").style.zIndex='0';
       // this.screenSubscriber.element.style.width='0px';
     
        if(this.screenSubscriber){
             this.screenSubscriber.element.style.zIndex=0;
             this.screenSubscriber.subscribeToVideo(false);
             this.screenSubscriber.subscribeToAudio(false);
        }
        this.tempMode();
    }, 
    stopBoard: function(){
        console.log('Chat: startBoard');
        if(this.screenSubscriber){//during screen sharing
            this.screenSubscriber.subscribeToVideo(true);
            this.screenSubscriber.subscribeToAudio(true);
            this.screenSubscriber.element.style.zIndex=300;
        }
        else
            this.backToChatMode();
        return;
        //this.publisher.element.style.clear='both';
       // this.publisher.element=this.tempEle;
        
   
    //      document.getElementById("video-holder").appendChild(this.cameraSubscriber.element);
       
        /*
        this.cameraSubscriber.element.style.position='absolute'; 
        this.cameraSubscriber.element.style.zIndex='100';
        this.cameraSubscriber.element.style.left='0';
        this.cameraSubscriber.element.style.top='0';
        this.cameraSubscriber.element.style.width='100%';
        this.cameraSubscriber.element.style.height='38em';
        this.cameraSubscriber.element.style.border='';
        
         this.publisher.element.style.position='static';//absolute';
        this.publisher.element.style.zIndex='200';
        this.publisher.element.style.right='1em';
        this.publisher.element.style.top='1%';
    
        this.publisher.element.style.width='20%';
        this.publisher.element.style.height='10em';
      

         this.publisher.element.style.border='';
        */
       
            //not working from here
        //var pub=document.createElement("div");
 
       // document.getElementById("video-holder").appendChild(this.publisher.element); //not necessary
       
    },
    sessionConnected: function() {
      var self=this;
      console.log('Chat: sessionConnected');
     
      this.session.publish(this.publisher,null,function(error){
          if (error) {
            console.log('Chat: could not publish:'+error.message);
            self.end();  
          } else {
            console.log("Chat: Published a stream.");
          //  self.cameraPublished=true;  
            self.trigger('published');
          }
      });
    },
      /*
    getStatus: function(){
        console.log('getStatus:'+this.cameraSubscribed+'/'+this.cameraPublished);
        if(this.cameraSubscribed && this.cameraPublished)
            return 2;
        else if(this.cameraSubscribed || this.cameraPublished)
            return 1;
        else
            return 0;
    },
    */
       
    stopshare: function() {
        var self=this;
        console.log('Chat: stopshare:'+this.screenSharingPublisher);  
        //document.getElementById('stop').style.visibility = "hidden";
        //document.getElementById('share').style.visibility = "visible";
        if(this.screenSharingPublisher){
            this.session.unpublish(this.screenSharingPublisher);
            this.screenSharingPublisher=null;
        }
        
        this.video=true;
        this.resumeVideo();
       
        setTimeout(function() {
              console.log('Chat: camera switch: ' +self.video);
              //$('#cameraSelect-on').attr("checked",self.video); //why not working
             if(self.video)  
                 $('#cameraSelect').checkbox('set checked');
             else
                 $('#cameraSelect').checkbox('set unchecked');
              }, 2000); 
    },
    
    stopAudio:  function() {
          console.log('Chat: stop audio'); 
       //   this.audio=!this.audio;
          this.publisher.publishAudio(false);
      },
    resumeAudio:  function() {
          console.log('Chat: resume audio'); 
         // this.audio=!this.audio;
          this.publisher.publishAudio(true);
      },
    stopVideo:  function() {
          console.log('Chat: stop video'); 
         // this.video=!this.video;
          this.publisher.publishVideo(false);
      },
    resumeVideo:  function() {
          console.log('Chat: resume video'); 
         // this.video=!this.video;
          this.publisher.publishVideo(true);
      },
    addExtention: function(){
         var self=this;
          console.log('Chat: install'); 
         // var extentionID='ihjkcndkmgckhioeepihkmjhncjnamhh';
         // var link='https://chrome.google.com/webstore/detail/'+this.extentionID;
         // var isChrome = !!window.chrome && !!window.chrome.webstore;  
          if(this.checkBrowser()==1){ //chrome
            
            if(!window.chrome.app.isInstalled){
               // window.open ("addtochrome.html", "", "height=150,width=300");
                /*
              var test=  document.createElement('div');  
                test.innerHTML='<p>fdafdas</p>';
                alert(test.innerHTML);
                */
                 self.localUser.dispatcher.installModalView.show();
               // chrome.webstore.install(); //extensions::webstore:34 Uncaught Chrome Web Store installations can only be initated by a user gesture.
            }
            else
                console.log('extention already installed');
         }
    },
    initPublisher: function(){
        var self=this;
        
        var screenContainerElement = document.createElement('div'); 
        
        var screenSharingPublisher= OT.initPublisher(
                  screenContainerElement, //'screen-preview',     
                  {videoSource: 'application',
                      //videoSource: 'screen',
                      /*
                   width: '100%',
                   height: '100%',
                   insertMode: 'append'*/
                  
                  },//screen
                  function(error){
                      //alert('OT.initPublisher');
                      
                      if (error) {
                         console.log('Chat: initPublisher failure: ' + error.message+'/'+ error.code+'/'+self.session.capabilities);
                          
                         if(error.code==1500){
                             //if((self.checkBrowser()!=1)&&(!$('#shareSelect-on').is(':checked'))) //not chrome
                             if((self.checkBrowser()!=1)&&( $('#shareSelect').checkbox('is checked'))) { //not chrome
                                  //self.localUser.dispatcher.installModalView.show();
                                
                                 
                                 /*
                                  self.session.forceUnpublish(screenSharingPublisher, function (error) {
                                  if (error) {
                                      console.log('forceUnpublish failure: '+error);
                                    } else {
                                      console.log("Connection forced to disconnect: " );
                                    }
                                  });
                                 */
                             }
                              
                            // screenSharingPublisher=null;
                         }
                         alert('화면공유가 취소 되었습니다.(Code:'+error.code+')');
                         console.log('initPublisher:'+error.message);
                         //$('#shareSelect-on').attr("checked",false);  
                         $('#shareSelect').checkbox('set unchecked');  //->self.session.unpublish(screenSharingPublisher);
                      }else{
                        // alert('screenSharingPublisher: '+screenSharingPublisher);  
                         
                        
                    }
                    OT.setLogLevel(1);
              });
              screenSharingPublisher.on('accessDenied', function(event) {
                             //screenSharingPublisher = self.initPublisher();
                             //$('#shareSelect').checkbox('set unchecked');//not seems to work -> self.stopshare();
                             alert('accessDenied');
                            
                            //s self.session.unpublish(screenSharingPublisher); //not enough
                        });
            /*
              screenSharingPublisher.on('accessDialogClosed', function(event) {
                             //screenSharingPublisher = self.initPublisher();
                             //$('#shareSelect').checkbox('set unchecked');
                             //alert('accessDialogClosed');
                             //self.session.unpublish(screenSharingPublisher);
                        });
            */
              screenSharingPublisher.on('accessAllowed', function (event) {
                                    //session.publish(publisher);
                    //alert('accessAllowed');
                    self.session.publish(screenSharingPublisher, function(error) {
                         //alert(' self.session.publish2');   
                           if (error) {
                                console.log('Could not share the screen: ' + error.message);
                                alert('Could not share the screen: ' + error.message);
                                //$('#shareSelect-on').attr("checked",false);
                                $('#shareSelect').checkbox('set unchecked');
                                // self.session.unpublish(screenSharingPublisher);
                           }else{
                               // $('#shareSelect-on').attr("selected",true); //not working..
                                self.screenSharingPublisher=screenSharingPublisher;
                               // document.getElementById('stop').style.visibility = "visible";
                            //  document.getElementById('share').style.visibility = "hidden";
                                
                                /*
                                this.video=false;
                                self.publisher.publishVideo(this.video);
                                $('#cameraSelect').checkbox('set unchecked');
                                */
                               
                                
                                console.log('Chat: Publish for screen success '); 
                               
                                OT.getDevices(function(error,devices){  
                                      if(error){

                                      }else{
                                          //console.log('OT.getDevices:');

                                          var audioInputDevices = devices.filter(function(element) {
                                            return element.kind == "audioInput";
                                          });
                                          var videoInputDevices = devices.filter(function(element) {
                                            return element.kind == "videoInput";
                                          });
                                          for (var i = 0; i < audioInputDevices.length; i++) {
                                            console.log("audio input device: ", audioInputDevices[i].label);
                                          }
                                          for (i = 0; i < videoInputDevices.length; i++) {
                                            console.log("video input device: ", videoInputDevices[i].label);
                                          }
                                    }
                                });
                               
                               /* screenSharingPublisher.addEventListener('mediaStopped',function(){
                                                                                   //  $('#shareSelect-on').attr("checked",false);
                                                                                    $('#shareSelect').checkbox('set unchecked');
                                                                                     self.stopshare();} );*/
                                screenSharingPublisher.on('mediaStopped',function(event){
                                                                                   //  $('#shareSelect-on').attr("checked",false);
                                                                                    $('#shareSelect').checkbox('set unchecked');
                                                                                     self.stopshare();
                                                        } );
                            }
                        });
                    
                        });
            return screenSharingPublisher;
    },
    screenshare: function() {
       var self=this; 
       console.log('Chat: screenshare');
       
       OT.setLogLevel(5);
       //$('#shareSelect-on').attr("selected",false); 
       OT.checkScreenSharingCapability(function(response) {
            console.log('Chat: checkScreenSharingCapability');  
            if (!response.supported || response.extensionRegistered === false) {
              console.log('This browser does not support screen sharing.');
             // $('#shareSelect-on').attr("checked",false);
                $('#shareSelect').checkbox('set unchecked');//correct?
            }
            else if (response.extensionInstalled === false && (response.extensionRequired) ) {  
          // else if (response.extensionInstalled === false  ) {  
              console.log('Please install the screen sharing extension and load your app over https.');
            //  self.addExtention();  
              if(self.checkBrowser()==1){ //chrome
                if(!window.chrome.app.isInstalled){
                    self.localUser.dispatcher.installModalView.show();
                   // chrome.webstore.install(); //extensions::webstore:34 Uncaught Chrome Web Store installations can only be initated by a user gesture.
                } else
                    console.log('Chrome extention already installed');
              }else{
                  alert('화면공유를 위해서는 화상통화를 중지하고 화면공유용 익스텐션을 설치하여야 합니다. ');
              }
            //$('#shareSelect-on').attr("checked",false);   
                 $('#shareSelect').checkbox('set unchecked');
            }else {
              // Screen sharing is available. Publish the screen.
              console.log('Chat: Screen sharing is available');  
              //alert('1');    
                
             // screenContainerElement.setAttribute('id', 'screens');
            //  screenContainerElement.setAttribute('class', 'screens');
              OT.getDevices(function(error,devices){
                  if(error){
                      
                  }else{
                      //console.log('OT.getDevices:');
                                  
                      var audioInputDevices = devices.filter(function(element) {
                        return element.kind == "audioInput";
                      });
                      var videoInputDevices = devices.filter(function(element) {
                        return element.kind == "videoInput";
                      });
                      for (var i = 0; i < audioInputDevices.length; i++) {
                        console.log("audio input device: ", audioInputDevices[i].label);
                      }
                      for (i = 0; i < videoInputDevices.length; i++) {
                        console.log("video input device: ", videoInputDevices[i].label);
                      }
                  }
              });
                
               // alert('getVedioTracks');
              // console.log('mediaStream.getVedioTracks1: '+ mediaStream.getVedioTracks());
              var screenSharingPublisher = self.initPublisher();
              //  console.log('mediaStream.getVedioTracks2: '+ mediaStream.getVedioTracks());
             if(screenSharingPublisher){
              
            
             }else
                 alert('no screenSharingPublisher');
            }
          });
    },
      
    mediaStoppedBypublisher: function(event){
        var self=this;
        self.stopshare();//why not working?
    },
    streamDestroyed: function(event) {
        event.preventDefault();
        console.log("streamDestroyed " + event.stream.name + " ended. " + event.reason +'/'+  this.cameraSubscriber+','+this.screenSubscriber);
        
    },
     
    streamCreated: function(event) {
    //  console.log('Chat: streamCreated');
        
       var self=this;
       var subOptions = {insertMode: 'replace'};
       if(event.stream.videoType === 'screen') {
          console.log('Chat:streamCreated: screen :'+event.stream);
          this.screenStream=event.stream;
          this.screenSubscriber = this.session.subscribe(event.stream, 'screenElement', subOptions,function(error){
              if(error){
                  console.log('Chat: subscribe for screen failure :'+error.message);
                  alert('상대방의 화면공유 시도가 실패하였습니다');
              }
              else{
                  $('#whiteboard').checkbox('set unchecked');
                 
                  console.log('Chat: screen subscribe success ');
                  
                  self.screenSubscriber.element.style.position='fixed';
                  self.screenSubscriber.element.style.width = '99%';
                  self.screenSubscriber.element.style.height = '99%';
                  self.screenSubscriber.element.style.left = '5px';
                  self.screenSubscriber.element.style.top = '5px';
                  self.screenSubscriber.element.style.zIndex = '300';
                  self.screenSubscriber.element.style.border='1px solid black';
                  self.screenSubscriber.element.style.borderRadius='5px';
                  
                  self.tempMode();
                  self.screenSubscriber.on('destroyed',function(event){
                        //alert('screenSubscriber destroyed');
                        //var ar=self.session.getSubscribersForStream(self.screenStream);
                       // self.cameraSubscriber=ar[0];
                        console.log('Chat: screenSubscriber stream destroyed ,'+self.cameraSubscriber);
                        self.backToChatMode();
                        self.screenSubscriber=null; 
                      /*
                        self.cameraSubscriber.element.style.width = '99%';
                        self.cameraSubscriber.element.style.height = '99%';
                        self.cameraSubscriber.element.style.top = '5px';
                        self.cameraSubscriber.element.style.left = '5px';
                      */
                       // self.cameraSubscriber.element.style.zIndex = '300';
                       // self.cameraSubscriber.element.className = 'screens'
                        /*
                        self.cameraSubscriber.element.style.width = '100%';
                        self.cameraSubscriber.element.style.height = '38em';
                        self.cameraSubscriber.element.style.top = '0';
                        self.cameraSubscriber.element.style.left = '0';
                        self.cameraSubscriber.element.style.zIndex = '10';
                      */
                  });
             
                  
                  /*
                  self.screenSubscriber.element.style.width = '100%';
                  self.screenSubscriber.element.style.height = '38em';
                  self.screenSubscriber.element.style.left = '0';
                  self.screenSubscriber.element.style.top = '0';
                  self.screenSubscriber.element.style.zIndex = '150';
             
                  self.subscriber.on('videoDimensionsChanged', function(event) {
                      console.log('Chat: videoDimensionsChanged');
                      self.subscriber.element.style.width = event.newValue.width + 'px';
                      self.subscriber.element.style.height = event.newValue.height + 'px';
                      // You may want to adjust other UI.
                    });   
                    */
              }
          });
      } else {
          if(this.cameraSubscriber!=null ){
            console.log('Chat: already streamCreated');
            return;
            }
          console.log('Chat:streamCreated: camera ');
          
          this.cameraSubscriber = this.session.subscribe(event.stream,
                                        this.subscriberEl,
                                        this.videoProperties,
                                        function(error){
                                            if(error){
                                              console.log('Chat: subscribe for camera failure ');
                                              self.end();
                                            } else{
                                              console.log('Chat: subscribe for camera success ');
                                              //self.cameraSubscribed=true;
                                              self.cameraStream=event.stream;
                                              self.trigger('subscriberJoined');
                                              self.backToChatMode();
                                            }
                                        });
         
         
      }
  //  session.subscribe(event.stream, 'people', subOptions);
     
    },
      
    sessionDisconnected: function() {
      console.log('Chat: sessionDisconnected');
      this.invitation.off(null, null, this);
     /* 
      var isChrome = !!window.chrome && !!window.chrome.webstore;  
      if(isChrome){    
            this.session.unpublish(this.publisher); // not works in Chrome
       }
       */ 
      
      //this.session.unpublish(this.screenSharingPublisher);//necessary?
      //alert('this.session.unpublish(this.screenSharingPublisher');
      this.session.off();
      this.session = null;
      this.subscriberEl = null;
      this.publisher = null;
       
      this.screenSharingPublisher=null;
      this.screenSubscriber = null;
   //   this.cameraPublished=false;
     // this.cameraSubscribed = false;
      this.cameraSubscriber = null;
      this.remoteConnection = null;
      this.trigger('ended');
    },

    connectionCreated: function(event) {
    //  console.log('Chat: connectionCreated');
      if (event.connection.connectionId !== this.session.connection.connectionId) {
        log.info('Chat: remote user has connected to chat');
        this.remoteConnection = event.connection;
      }
    },

    connectionDestroyed: function(event) {
      console.log('Chat: connectionDestroyed');
      if (event.connection.connectionId === this.remoteConnection.connectionId) {
        log.info('Chat: remote user has left the chat, ending');
        this.end();
      } else {
        log.warn('Chat: connectionDestroyed but was not equal to remote user connection');
      }
    },

    verifyInvitationReady: function(done) {
      if (this.invitation.isReadyForChat()) {
        done();
      } else {
        this.invitation.getChatInfo(done, _.bind(this.errorHandler, this));
      }
    },

    verifyUserStatus: function(done) {
      if (this.localUser.get('status') === 'chatting') {
        done();
      } else {
        this.localUser.on('change:status', function waitForStatus(status) {
          if (status === 'chatting') {
            done();
            this.localUser.off('change:status', waitForStatus);
          }
        }, this);
      }
    },

    errorHandler: function() {
      log.error('Chat: an error occurred, chat ending');
      this.end();
    }

  });

}(window));
