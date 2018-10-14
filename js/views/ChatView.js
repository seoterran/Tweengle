/* -----------------------------------------------------------------------------------------------
 * Chat View
 * ----------------------------------------------------------------------------------------------*/
/* global jQuery, Backbone, _, log */
/* global Chat */
/* exported ChatView */

// Prevent leaking into global scope
!(function(exports, $, undefined) {

  var seconds = 0;
  var minutes = 0; 
  var hours = 0;
  
  exports.ChatView = Backbone.View.extend({

    className: 'panel panel-default',

    events: {
      'click .end-button': 'endButtonClicked',
      'click .chat-button': 'chatButtonClicked',
     // 'click #save-btn': 'saveButtonClicked',
       
     // 'click #upload-btn': 'uploadButtonClicked',
      'click .request': 'requestButtonClicked',
       'click #uploadModal': 'uploadModalButtonClicked', 
      //  'click #chat-btn': 'chat',
      //'click .share-button': 'shareButtonClicked',
      //'click .stop-button': 'stopButtonClicked',
      //'click .stopVoice-button': 'stopAudioClicked',
      //'click .stopVideo-button': 'stopVideoClicked',
    //  'change #shareSelect': 'shareSelect',
     // 'change #cameraSelect': 'cameraSelect',
     // 'change #audioSelect': 'audioSelect',
     // 'click .chrome-button': 'chromeClicked'
    },

    initialize: function(options) {
      if (!options.dispatcher) {
        log.error('ChatView: initialize() cannot be called without a dispatcher');
        return;
      }
      this.dispatcher = options.dispatcher;

      if (!options.localUser) {
        log.error('ChatView: initialize() cannot be called without a local user');
        return;
      }
      this.localUser = options.localUser;

      this.dispatcher.on('invitationAccepted', this.invitationAccepted, this);
     // this.session=null; //moved to startSession()
      this.sessionID=null; //really need this?
        
      this.publish=false;
      this.subscribe=false;
      this.studentList=null;
      this.requestList=null;
      this.uid=null;
      this.socil=null;
      this.problem_id=null;
     // this.uploader=null;
        
     
      $.getScript("//code.jquery.com/ui/1.11.4/jquery-ui.js",function(){
           
             // console.log('rowToHide2 hide');
             //$(".rowToHide2").hide();
          /*
             
          $( "#upload-btn" ).on( "click", function() {
                 console.log('#upload-btn clicked2');
           $(".rowToHide2").toggle();
        });*/
    });
     $.getScript("../../s3.fine-uploader/s3.fine-uploader.js");
  // require_once __DIR__.'/../vendor/autoload.php'; //necessary
      //$.getScript("/semantic/components/checkbox.min.js");
     // $.getScript("/semantic/semantic.min.js");
      
     // $.getScript("/js/opentok/opentok-whiteboard.min.js");
     // $.getScript("https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.4/angular.min.js");
     
    },

    template: _.template($('#tpl-chat').html()),
    
    hide: function(){// should just return while chatting
    
      //this.remove();
      //this.unbind();
        
      //$(this.el).unbind();
     // this.model.unbind();
        $(this.el).hide();
    },
    hideWB: function(){
        $('#iframeHolder').html('');
        document.getElementById('iframeHolder').style.height='0%';
        document.getElementById('iframeHolder').style.width='87%';
    },
    showWB : function(chatMode){
        var self=this;
        //this.hide();
        
        // $('#whiteboard-on').checkbox('check'); //?
       
        var WBuid=this.dispatcher.me.get('uid');
        if(chatMode&&this.localUser.get('caller'))
            WBuid= this.model.invitation.get('remoteUser').get('uid');
       
        $.get('/wb', { uid: WBuid,myid:self.dispatcher.me.get('uid') })
             .done(function(data) {
                          // var iframe = $("#wboard");
                         console.log('get wbURL success: '+data.url);
                         if(!$('#iframe').length) {
                            // document.getElementById('iframeHolder').style.width='100%';
                             //.ui.dropdown :90
                             
                             if(!chatMode){//testing whiteboard alone
                                // document.getElementById('iframeHolder').style.width='100%';
                                 document.getElementById('iframeHolder').style.height='92%';
                                 document.getElementById('iframeHolder').style.top='60px'; 
                                 document.getElementById('iframeHolder').style.zIndex='60'; 
                             }else{//using whiteboard in call
                                 document.getElementById('iframeHolder').style.height='100%';
                                 document.getElementById('iframeHolder').style.top='0px'; 
                                 document.getElementById('iframeHolder').style.zIndex='300'; 
                                 document.getElementById('chat-tool').style.zIndex='360';//bottom-bar disappearing issue
                             }
                             
                            // document.getElementById('iframeHolder').style.height='568px';
                       //  var height= document.getElementById('main_body').offsetHeight; 
                           //  document.getElementById('iframeHolder').style.height=height-50;
                             $('#iframeHolder').html(data.url);
                            }
                            if(chatMode){
                                 setTimeout(function() {
                                    self.model.startBoard();
                               }, 200); 
                         }
                        //$('#shareSelect').checkbox('set disabled');  //while using whiteboard
                     //iframe.attr("src",src ); 
                     })
             .fail(function(jqXHR, textStatus, errorThrown) {
                           console.log("whiteboard room fetch error");
                 // fail(errorThrown);
                            }); 
    },
      /*
    getRequests: function(){
        var self=this;
        var myUid=this.localUser.get('uid');
        
        $.get('/requests', {  uid: myUid}) 
            .done(function(data) {
               self.requestList= data;
                 
               console.log('requestList length: '+self.requestList.length);

               var templateData = self.model ? self.model.attributes :{
                                            subscriberName: false,
                                            requestList: self.requestList};
               self.$el.html(self.template(templateData));
               
           }).fail(function(jqXHR, textStatus, errorThrown) {
                console.log("getRequests get error");
                 // fail(errorThrown);
        }); 
    },*/
    getStudents: function(count){
        var html='';
        var self=this;
        var myUid=this.localUser.get('uid');
        
        console.log('ChatView getStudents: '+myUid+'/'+count);
        if(count>20){
            console.log('taking too long');
            window.location.assign("/");
        }
        if(myUid==null){//why
            window.setTimeout(function(){self.getStudents(count+1); },400);
            return;
        }
        $.get('/students', {  uid: myUid}) //take too long sometimes
            .done(function(data) {
                  if(!data){
                      console.log('ChatView data is null');
                     // return;
                  }else{
                      self.studentList= data;
                      console.log('ChatView studentList length: '+self.studentList.length);
                  }
                  $.get('/requests', {  uid: myUid}) 
                    .done(function(data) {
                       self.requestList= data;

                       console.log('ChatView requestList length: '+data+'/'+self.requestList.length+'/'+self.dispatcher.buddyListView.subjects.length);

                       var templateData = self.model ? self.model.attributes :{
                                                    subscriberName: false,
                                                    requestList: self.requestList,
                                                    studentList: self.studentList,
                                                    subjects:  self.dispatcher.buddyListView.subjects
                                                    };
                       self.$el.html(self.template(templateData));
                     //  console.log('ChatView getRequests templateData: '+templateData.subjects.length);
                       self.UIInitialization();  
                      
                   }).fail(function(jqXHR, textStatus, errorThrown) {
                        console.log("ChatView getRequests get error");
                        self.getStudents(count);
                         // fail(errorThrown);
                   }); 
            }).fail(function(jqXHR, textStatus, errorThrown) {
                console.log("ChatView getStudents get error");
                self.getStudents(count);
                 // fail(errorThrown);
            }); 
       // html='';
       
    },
    render: function() {
     
      var self=this;
        
      var sub=self.dispatcher.buddyListView.subjects;
      
      if(sub==null){
          console.log('Chatview: render return');
          window.setTimeout(function(){
            self.render();       
          }, 300);  
          $(this.el).show();

          var templateData = self.model ? self.model.attributes :{      
                                            subscriberName: false,
                                            studentList: null,
                                            requestList: null,
                                            subjects:null
              //,subjects:  null
                                        };
          self.$el.html(self.template(templateData));
          
          return this;
      }
      console.log('Chatview: render: '+sub);
      this.hideWB();
        
      $(this.el).show();    
      if(!this.model){
          console.log('ChatView no this.model');
          this.getStudents(0);
          //$(".rowToHide2").hide();      //not working
         // this.getRequests();
          
      }else{
          console.log('ChatView yes this.model');
          var templateData = self.model ? self.model.attributes :{      
                                            subscriberName: false,
                                            studentList: null,
                                            requestList: null,
                                            subjects:  null
                                        };
          //console.log('ChatView render templateData: '+templateData.subjects.length);
          self.$el.html(self.template(templateData));
          
          self.UIInitialization();
      }
        /*
            $(document).ready(function(){
            $("#upload-btn").click(function(){ //not working
                    console.log('#upload-btn clicked');
                    $(".rowToHide2").toggle( function(){
                        console.log('rowToHide2 toggle2');
                    });

                });
         });
        $("#upload-btn").click(function(){
            console.log('click');
                $(".rowToHide2").show();
           
        });
        $("#upload-btn").click(function(){ //not working
                console.log('#upload-btn clicked');
                $(".rowToHide2").toggle();
           
            });
          $( "#upload-btn" ).on( "click", function() {
                 console.log('#upload-btn clicked2');
           $(".rowToHide2").toggle();
        });
        */
      
      return this;
    },
    UIInitialization: function(){
      var self=this;
      console.log('Chatview UIInitialization: '+this.model);
      if(this.model)   { 
          // this.showAngular(); 
        
          $('.ui.checkbox').popup({variation: 'inverted'});
          $('.end-button').popup({variation: 'inverted'});
           
          $('#chatSelect').checkbox({
                onChecked: function() {
                    console.log('chat window On');
                    var remoteUser=self.model.invitation.get('remoteUser');
                    self.dispatcher.chattingModalView.clicked(remoteUser);  
                },
                onUnchecked: function() {
                    console.log('chat window Off');
                    self.dispatcher.chattingModalView.closeAll();    
              }
          });  
            
          $('#whiteboard').checkbox({
                onChecked: function() {
                    self.showWB(true);
                },
                onUnchecked: function() {
                    console.log('whiteboard Off');
                    //$('#whiteboard-on').checkbox('uncheck');
                   // $("#wboard").attr("src","");
                    
                    self.hideWB();
                    self.model.stopBoard();
                   // $('#shareSelect').checkbox('set enabled'); //can share screen while not using whiteboard
                   // self.model.stopVideo(); 
                }
          });
   
         $('#cameraSelect').checkbox({
                onChecked: function() {
                    console.log('Video On');
                   
                    //  $('#cameraSelect-on').checkbox('check');
                    self.model.resumeVideo();
                },
                onUnchecked: function() {
                    console.log('Video Off');
                    //$('#cameraSelect-on').checkbox('uncheck');
                    self.model.stopVideo(); 
              }});  
         $('#shareSelect').checkbox({
                onChecked: function() {
                  console.log('Share start');
                     //if( $('#whiteboard').checkbox('is unchecked')){
                         self.model.screenshare();
                    
                   //   $('#shareSelect-on').checkbox('check');
                      
                },
                onUnchecked: function() {
                    console.log('Share end');
                   // $('#shareSelect-on').checkbox('uncheck');
                    self.model.stopshare(); 
              }}); 
           $('#audioSelect').checkbox({
                onChecked: function() {
                     
                  console.log('Audio On');
                //      $('#audioSelect-on').checkbox('check');
                    self.model.resumeAudio();
                },
                onUnchecked: function() {
                  console.log('Audio Off');
                 
                //    $('#audioSelect-on').checkbox('uncheck');
                    self.model.stopAudio(); 
            }}); 
          
         
       
      } else{
          /*
           $.getScript("../../fine-uploader/fine-uploader.js",function(){
               var uploader = new qq.FineUploader({
                debug: true,
                element: document.getElementById('fine-uploader'),
                //autoUpload: false,
                request: {
                  
                    //b64AMUXVRGDkFrjlm4Vc6dd6Upnn6I5KL+sQlzLn
                  // endpoint: '../../../vendor/fineuploader/php-traditional-server/endpoint.php'// not working
                     endpoint: './vendor/fineuploader/php-traditional-server/endpoint.php'
                  //  endpoint: '../../fineuploader/php-traditional-server/endpoint.php' //working
                },
             
                deleteFile: {
                    enabled: false,
                        // endpoint: "/vendor/fineuploader/php-traditional-server/endpoint.php"
                    endpoint: '/../../../vendor/fineuploader/php-traditional-server/endpoint.php'
                    // endpoint: '../../fineuploader/php-traditional-server/endpoint.php'//working
                },
                
                validation: {
                    allowedExtensions: ['jpeg', 'jpg', 'gif', 'png'],
                    sizeLimit: 51200 // 50 kB = 50 * 1024 bytes
                  },
                retry: {
                   enableAuto: true
                },
                formatFileName: function(filename) {
                    return filename;
                },
                callbacks: {
                    onComplete: function( name) {
                       //alert('onComplete'+name);
                        }
                    }
            });
             
         });
         */
         
          
          $('.ui.button').popup({variation: 'inverted'});
         // this.uploader=null;
         
      }
        
    },
    uploadButtonClicked: function(event){
          //$("#fine-uploader").
          console.log('ChatView uploadButtonClicked uploader: '+this.uploader);
          //document.getElementById("fine-uploader").style.visibility = "visible";
          $(".rowToHide2").toggle( function(){
                    console.log('rowToHide2 toggle');
             });
          if(this.uploader==null){
              
              this.uploader = new qq.s3.FineUploader({
                debug: true,
                element: document.getElementById('fine-uploader'),
                //autoUpload: false,
                request: {
                //  endpoint: 'https://inmegg-bucket.s3-website-us-east-1.amazonaws.com',//not working just  time over or conneciton refused
                      endpoint: 'https://inmegg-bucket.s3.amazonaws.com',
                      accessKey: 'AKIAILFCBHZSEH7E3NQQ'
                    //  accesskey:'AKIAINKC4XX5RP2ZA3MA' //not working
                    //b64AMUXVRGDkFrjlm4Vc6dd6Upnn6I5KL+sQlzLn
                   // endpoint: '/../../../vendor/fineuploader/php-traditional-server/endpoint.php'
                },
                /*
                    credentials:{
                        accesskey:'AKIAJBWEFH5I2FY6MMUQ',
                    //    secretKey:'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'
                    },
                   */ 
                signature: {
                   // endpoint: "/vendor/fineuploader/php-s3-server/endpoint.php"
                  endpoint: '../../fineuploader/php-s3-server/endpoint.php'
                 
                },
             
                uploadSuccess: {
              
                  //  endpoint: "/vendor/fineuploader/php-s3-server/endpoint.php?success"
                    // endpoint: '../../fineuploader/php-s3-server/endpoint.php?success',
                     endpoint: '../../fineuploader/php-s3-server/endpoint.php',//working
                    
                },
                  
                iframeSupport: {
                    localBlankPagePath: '../../fineuploader/php-s3-server/success.html'
                },
               
                   /* 
            deleteFile: {
                    enabled: true,
                       //  endpoint: "/vendor/fineuploader/php-s3-server/endpoint.php"
                    endpoint: '../../fineuploader/php-s3-server/endpoint.php'
                },
                   
                 validation: {
                    allowedExtensions: ['jpeg', 'jpg', 'gif', 'png'],
                    sizeLimit: 51200 // 50 kB = 50 * 1024 bytes
                  },
            */
                retry: {
                   enableAuto: false
                },
                chunking: {
                    enabled: true
                },
                objectProperties:{
                        acl:'public-read'
                    },
                    
                callbacks: {
                    onComplete: function( id,name,response) {
                         if (response.success){
                           
                            var source= "https://s3.amazonaws.com/inmegg-bucket/"+this.getKey(id);
                            console.log('onComplete: '+id+' / '+name+' / '+this.getKey(id));
                     
                            $("#s3image").attr("src", source);
                            
                            
                        }else
                            console.log('onComplete failure');
                    }
            }
              
          });
        
         
          
    }},
    setDesc: function(ele,data){
            if(!data){
                console.log('setDesc: no data');
                return;
            }
           // var description=this.model.get('description');
            var self=this;
          //  $('#desc').val(description); //test
             $(ele).text(data);
           
            //console.log('setDesc: '+$('#desc')+'/'+this.model.get('description'));
            console.log('setDesc: '+$(ele)+'/'+data);
            
           // if ($('#desc').val()!=description){
             if ($(ele).val()!=data){
               window.setTimeout(function(){self.setDesc(ele,data);}, 10);   
               console.log('data not yet set: '
                         +$(ele).val()+'/'  // +$('#desc').val()+'/'
                       +data); //   +description);    
            }else{
               console.log('data is set! ');
            }
        },
    saveButtonClicked: function(){
        var self=this;
        
        var uid_= this.dispatcher.me.get('uid');
        var social_=this.dispatcher.me.get('social');
        var picURL_= $("#s3image").attr('src');
        var content_=$('#requestContent').val();
        var isPaid_=$('#isPaid').checkbox('is checked');
        var postToFB_=$('#postToFB').checkbox('is checked');
        var subject_='';
        subject_=$('#problem_subjectDD').dropdown('get value');
        
        console.log('ChatView saveButtonClicked: '+picURL_+ '/'+content_+'/'+subject_+'/'+social_+'/'+isPaid_);
        /*
        var userDetails = {
                'uid': this.dispatcher.me.get('uid'),
                'picURL':$("#s3image").attr('src'),
                'content':$('#requestContent').val(),
            };
        */
       // if((typeof picURL_==='undefined')&&(content_=='')){ 
        if(content_==''){
            console.log('empty! need not save');
            alert('다시 입력해주세요. 멘토에게 요청사항을 입력해주세요');
            return false;
        }
         if(subject_==''){
            console.log('empty! need not save');
            alert('과목을 선택해주세요');
            return false;
        }
        
        $.get('/mentoringRequest', {uid:uid_,picURL:picURL_,content:content_ ,subject:subject_,social:social_,isPaid:isPaid_})
              .done(function(data) {
                    console.log("request save success for: "+uid_);
                  //  $("#success-alert").removeClass("in").show();
                //    $("#success-alert").delay(300).addClass("in").fadeOut(4000);
                    
                    $('#problem_subjectDD').dropdown('clear');
                    $('#requestContent').val('');
                    self.render();
                   
                    if(postToFB_){
                            console.log('postToFB is checked');
                            var accessToken=  FB.getAuthResponse().accessToken;
                            var msg = subject_+' : '+content_;
                            FB.api(
                                       // "/626643557498441/photos",   
                                        "/626643557498441/feed",   
                                        "POST",
                                        {
                                           // "url": source,
                                            "message": msg,
                                           // "access_token" : accessToken
                                        },
                                        function (response) {
                                          if (response && !response.error) {
                                            /* handle the result */
                                              console.log('onComplete2 success:'+msg + ' / '+response.id);
                                          }else
                                               console.log('onComplete2 failure:'+JSON.stringify(response)+' / '+msg);
                                        }
                                    );

                    }else
                        console.log('postToFB is unchecked');
                    alert('성공적으로 저장되었습니다!');
             
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                  console.log("request save error for: "+_uid);
                  //$("#failure-alert").removeClass("in").show();
                 // $("#failure-alert").delay(300).addClass("in").fadeOut(4000);
                 alert('저장이 되지 않았습니다!');
             // fail(errorThrown);
             }); 
        return true;
        
      },
    chatButtonClicked: function(event){
          //var uid=this.model.get('uid');
          var index = this.$('.student').index($(event.currentTarget).parents('.student'));
          var uid=this.studentList[index].uid;
          var name=this.studentList[index].name;
          console.log('ChatView chatButtonClicked: '+index+' / '+uid);
          
          var onlineUser=this.dispatcher.buddyListView.findOnlineUser(uid);
          if(onlineUser)
              this.dispatcher.chattingModalView.clicked(onlineUser); 
          else{
             // var offlineUser=this.dispatcher.buddyListView.findOfflineUser(uid);
              console.log('ChatView chat clicked: '+uid+'/'+name);
          
              this.dispatcher.chattingModalView.clicked_offline2(uid,name); 
          }  
     },
      uploadModalButtonClicked: function(event){
          var self=this;
          console.log('ChatView uploadModalButtonClicked:');
          
           $('#uploadProblem').modal({
              selector: {
                    close: '.remove'
                }
             }).modal('setting', {
                // closable  : true,
               //  onVisible: function () {
               onShow: function(){
                   console.log('uploadProblem onShow');
                   setTimeout(function(){ 
                        console.log('onVisible2');
                        $("#uploadProblem").modal("refresh");
                        $("#isPaid").checkbox('set unchecked');
                        $("#postToFB").checkbox('set unchecked');
                        $('.ui.checkbox').popup({variation: 'inverted'});
                         //self.setDesc('#problem_content', content);
                        //$('#problem_content_edit').val(content);
                        //$('#problem_image_edit').attr('src',picURL);
                        self.uploader=null;
                        $('#problem_subjectDD').dropdown();
                        var xx=document.getElementById('uploaderDIV');
                        if(xx){
                            console.log('uploaderDIV exist');
                            xx.innerHTML='<div id="fine-uploader"></div>';
                        }
                        else
                            console.log('no uploaderDIV ');


                        $("#s3image").attr("src", null); 
                         /*
                        $(".rowToHide2").hide('fast', function(){
                            console.log('rowToHide2 hide');
                        });*/
        
                    }, 0); 
               },
                 onVisible: function () {
                    console.log('onVisible');
           
                 },
                 onDeny : function() {
                    //self.editProblem();
                     console.log('uploadModalButtonClicked onDeny');
                     self.uploadButtonClicked();
                     return false;
                },
                 onApprove : function() {
                    return self.saveButtonClicked();
                   // self.endProblem();
                }
                 
             }).modal('show');
          
      },
     requestButtonClicked: function(event){
          //var uid=this.model.get('uid');
        //  var index = this.$('.request').index($(event.currentTarget).parents('.request'));
          var index = this.$('.request').index($(event.currentTarget));
          this.uid=this.requestList[index].requester;
          this.problem_id=this.requestList[index].problem_id;
          this.social=this.requestList[index].social;
          this.sid=this.requestList[index].sid;
         
          var content=this.requestList[index].content;
          var picURL=this.requestList[index].pic;
          //var name=this.requestList[index].name;
          var subjects=this.dispatcher.buddyListView.subjects;
          var subject_id=parseInt(this.requestList[index].subject);
          var complete=this.requestList[index].complete;
          var isPaid=this.requestList[index].isPaid;
          var subject_name='';
         // var subject_id;
         
          console.log('requestList[i].subject : '+subject_id+' / '+this.social+' / '+this.requestList[index].sid+'/'+isPaid);
          if(subjects!=null){
                for(var j=0;j<subjects.length;j++){
                        if(subjects[j].id==subject_id){
                            console.log(': '+j+' / '+subject_id+' / '+subjects[j].subject);
                            subject_name=subjects[j].subject;
                            
                            break;
                        }
                }
            }
         
          console.log('ChatView requestButtonClicked: '+subject_id+' / '+this.uid+' / '+content+'/'+picURL+'/'+subject_name+'/'+subject_id);
        
          //$('#problem_content_edit').val(content);
         // var content_=$('#requestContent').val();
          //$('#showProblem').modal('show');
         
         var self=this;
         var myid=this.localUser.get('uid');
         if(myid==this.uid){//mine
             $('#editProblem').modal({
              selector: {
                    close: '.remove'
                }
             }).modal('setting', {
                 //closable  : true,
                // onVisible: function () {
                 onShow: function(){
                     console.log('editProblem onShow');
                     $("#editProblem").modal("refresh");
                 },
                 onVisible: function () {
                    console.log('onVisible: '+content+'/'+picURL+'/'+subject_id+'/'+isPaid);
                    
                     //self.setDesc('#problem_content', content);
                    if(isPaid=='true'){
                         $('#isPaid_edit').checkbox('set checked');
                         console.log('isPaid_edit1:'+isPaid);
                    }else{                 
                         $('#isPaid_edit').checkbox('set unchecked');
                         console.log('isPaid_edit2:'+isPaid);
                    }
                     
                    $('#problem_content_edit').val(content);
                    $('#problem_image_edit').attr('src',picURL);
                    $('#subjectDD_edit').dropdown('set selected', [subject_id]);
              
                 },
                 onDeny : function() {
                    self.editProblem();
                    // return false;
                },
                 onApprove : function() {
                    self.endProblem();
                }
             }).modal('show');
         }else{
              $('#showProblem').modal({
                 // allowMultiple: true,
                  selector: {
                    close: '.remove'
                }
             }).modal('setting', {
                 //closable  : true,
                // onVisible: function () {
                   onShow: function(){
                     $("#showProblem").modal("refresh");
                     console.log('showProblem onShow');
                 },
                  onVisible: function () {
                    console.log('onVisible: '+subject_name+'/'+complete);
                    //$("#showProblem").modal("refresh");
                    // self.setDesc('#problem_content', content);
                    //$('#problem_content').val(content);
                    $('#problem_content').text(content);
                   // $('#problem_content').blur(); //working?
                    $('#problem_image').attr('src',picURL);
                    $('#problem_image_lightbox').attr('href',picURL);
                    $('#problem_subject').text(subject_name);
                    $('#isPaid_show').checkbox('set disabled');
                      
                    if(isPaid=='true') {
                        console.log('isPaid_show1:'+isPaid);
                        $('#isPaid_show').checkbox('set checked').checkbox('set disabled');
                    }else{              
                        console.log('isPaid_show2:'+isPaid);
                        $('#isPaid_show').checkbox('set unchecked').checkbox('set disabled');
                    }   
                    //$('#isPaid_show').checkbox({uncheckable: true});
                      
                    lightbox.option({//http://lokeshdhakar.com/projects/lightbox2/
                      //'maxWidth': 100,
                        positionFromTop : 20
                    });
                      
                    if(complete){
                       $('.complete').hide();
                        $('.incomplete').show();
                    }else{
                       $('.complete').show(); 
                        $('.incomplete').hide();
                    }
                      
                    console.log('showProblem: onShow: '+self.social);
                   // if(self.social!=1)
                     //   $('#fb_msg_btn').attr("disabled","disabled");
                        
                 },
                  onHide: function(){
                      console.log('showProblem: onHide');
                     // $('#fb_msg_btn').prop("disabled",false);
                  },
                 onDeny : function() {
                    self.chat();
                   // return false;
                },
                 onApprove : function() {
                    self.fbchat();
                    return false;
                }
             }).modal('show');
         }
         // this.$el.html(self.template());
       
     },
      fbchat:function(){
        var self=this;
        var toID=this.sid;
        var social=this.social;
        var sender_=this.dispatcher.me.get('uid');
        console.log('fbchat : '+toID+'/'+social);
        if(toID==null){
            alert('탈퇴한 회원입니다');
            //console.log('')
            return;
        }
        if(social==2){
            alert('페이스북 계정으로 등록한 회원에게만 페이스북 메시지를 보낼 수 있습니다');
            return;
        }
        FB.ui(
          {
            method: 'send',
            to: toID,
            link:'inmegg.com'
            //href: 'https://developers.facebook.com/docs/',
          },
          // callback
          function(response) {
             console.log('Chatview FB.ui : '+JSON.stringify(response));
             if(response && !response.error_message) {
                if(response.success){
                    $.get('/email_fb', { sender: sender_ ,receiver: self.uid})
                       .done(function(data) {

                           console.log('email_fb success : '+data.success+' / '+sender_+' / '+self.uid); 
                           if(!data.success){
                                alert('페이스북 메세지를 보냈으나 이메일 알림은 보내지 못했습니다');
                           }else
                                alert('페이스북 메세지를 성공적으로 보냈습니다');

                    }).fail(function(jqXHR, textStatus, errorThrown) {
                       console.log('email_fb failure'); 
                    });
                }else{
                    console.log('fb response NOT success');
                }
             } else {
             // alert('메세지가 보내지지 않았습니다');
                console.log('fb message NOT sent');
            }
          }
        );
    },
      endProblem:function(){
          var self=this;
          var problem_id_=this.problem_id;
          
          $.get('/endProblem', { problem_id: problem_id_ })
               .done(function(data) {
    
                   console.log('endProblem success'); 
                   alert('질문이 해결되었습니다');
                   self.render();
           }).fail(function(jqXHR, textStatus, errorThrown) {
               console.log('endProblem failure'); 
           });
      },
      editProblem:function(){
          var self=this;
          var uid_=this.uid;
          var problem_id_=this.problem_id;
          var content_=$('#problem_content_edit').val();
          var subject_=$('#subjectDD_edit').dropdown('get value');
          var isPaid_=$('#isPaid_edit').checkbox('is checked');
          
           console.log('editProblem clicked: '+uid_+' / '+problem_id_+' / '+content_+' / '+subject_+' / '+isPaid_);
           $.get('/editProblem', { problem_id: problem_id_,content: content_ ,subject:subject_ ,isPaid:isPaid_})
               .done(function(data) {
               
                   console.log('editProblem success'); 
                   alert('질문내용이 변경되었습니다');
                   self.render();
           }).fail(function(jqXHR, textStatus, errorThrown) {
               console.log('editProblem failure'); 
           });
      },
      chat:function(){
          var uid=this.uid;
          console.log('chat button clicked: '+uid);
          
          var onlineUser=this.dispatcher.buddyListView.findOnlineUser(uid);
          if(onlineUser)
              this.dispatcher.chattingModalView.clicked(onlineUser); 
          else{
              var offlineUser=this.dispatcher.buddyListView.findAllofflineUser(uid);
              console.log('ChatView chat clicked: '+uid+'/'+offlineUser);
              if(offlineUser===undefined)
                  alert('탈퇴한 회원입니다');
              else{
                  console.log('offlineUser is not defined');
                  this.dispatcher.chattingModalView.clicked_offline(offlineUser); 
              }
          }
             
      },
    invitationAccepted: function(invitation) {
          console.log('ChatView invitationAccepted freeCall: '+invitation.get('free'));
       
          // Create a chat based on this invitation, and store it as the model for this view
          this.model = new Chat({}, {
            localUser: this.localUser,
            invitation: invitation
          });

       // The DOM elements required for the chat should appear on the page
         // this.render();
          

          this.model.on('started', this.chatStarted, this);
          this.model.on('subscriberJoined', this.subscriberJoined, this);
          this.model.on('ended', this.chatEnded, this);
          this.model.start(this.$('.publisher')[0], this.$('.subscriber')[0]);

          this.model.on('published', this.published, this);

          this.dispatcher.invitationListView.startChatMode();
         // alert(this.localUser.get('caller'));
         // if(this.localUser.get('caller')=='true')
    },
   
    startSession: function(){
      this.session=null;
      if(this.getStatus()<2){
          console.log('ChatView: session cannot yet start');
          return;
      }
      console.log('ChatView: startSession');  
      var self=this;
      this.$('.waiting').remove();
      if(!document.getElementById("timer")){
          alert('에러가 발생하였으니 재접속 하시길 바랍니다.');
          return;
      }
    //this.showAngular();    
        
      this.startTime=new Date();//JW
       // var d=new Date();
      this.session= new SessionModel;
      this.session.set('startTime',this.startTime.toDateString()+'년 '+this.startTime.getHours()+'시 '+this.startTime.getMinutes()+'분');
      this.session.set('status',true);
        
      if(this.localUser.get('caller')){//student
          console.log('ChatView startSession this is student');
          this.session.set('subscriberID', this.model.invitation.get('remoteUser').get('uid'));  
          this.session.set('publisherID', this.localUser.get('uid'));
          this.session.set('free', this.model.invitation.get('free'));  
          
          var ss=this.session;
          this.session.save({},{
                type: 'POST',
                success: function (model, response) {
                    //self.sessionID=response.sessionID;
                    //ss.set('sessionID',response.sessionID);
                    ss.set(response);
                    console.log("ChatView: startSession post success:" +response.timeRemaining+'/'+response.rate+'/'+response.sessionID+'/'+response.customerID+'/'+model.get('sessionID')+'/'+ss.get('sessionID'));
                    
                    // model.set('sessionID',response.sessionID);
                    //model.set(response);
                    //console.log("video chat session start success2: "+model.get('rate')+'/'+model.get('sessoinID')); 
                    self.updateTimer=setInterval(function(){  //move to startSession success
                          self.updateTime();                             
                        },300000); //every 5 min :300000
                },
                 error: function (model, response) {
                    console.log("ChatView: startSession post error");
                 }
        });
      } else{//teacher
          console.log('ChatView startSession this is teacher');
          this.session.set('subscriberID',  this.localUser.get('uid'));    
          this.session.set('publisherID', this.model.invitation.get('remoteUser').get('uid'));  
      }

      this.timer = setInterval(function(){     
            seconds++;
            if (seconds >= 60) {
                  seconds = 0;
                  minutes++;
                  if (minutes >= 60) {
                      minutes = 0;
                      hours++;
                  }
              }
           /* var str=(hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ?  minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);*/
          if( document.getElementById("timer") !=null){
            var str=(hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ?  minutes : "0" + minutes) : "00");
            document.getElementById("timer").innerHTML= "<i class='hourglass half icon'></i>"+str ;
              
              // document.getElementById("timer").innerHTML= "<span class='glyphicon glyphicon-hourglass'></span>"+str ;
                    //textContent = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);
          }
        } ,1000);  
      
    
    },
     
    updateTime: function(){
       // this.session= new SessionModel;
        //this.session.set('sessionID',this.sessionID);
        var self=this;
        console.log('ChatView updateTime:'+this.session+'/'+this.session.get('sessionID')
                                            +'/'+this.session.get('subscriberID')+'/'+this.session.get('publisherID'));
        
        this.session.save({},{
             type: 'PUT',
                success: function (model, response) {
                    var minuteRate=response.rate/60;
                    console.log("video chat session updateTime success:  "+
                                response.timeRemaining+'/'+response.rate+'/'+ response.point+'/'+2*5*minuteRate+'/'+model.get('rate')+'/'+model.get('point')  );
                    
                    if(self.session.get('free'))
                        console.log('this is free session');
                    else{
                        if( response.timeRemaining < 5){
                                console.log('not enough time');
                                self.model.end();
                                alert('보유하신 남은 시간이 부족하여 세션이 중지되었습니다');  
                        }else if( response.timeRemaining < 10){
                                console.log('only 5 more minutes left');
                                alert('보유하신 남은 시간이 부족하여 5분후 세션을 중지합니다');    
                            }
                    }
                    /*
                    if( response.point < 2*5*minuteRate){
                        if( response.point < 5*minuteRate){
                            console.log('not enough points');
                            
                            self.model.end();
                            alert('보유 포인트가 부족하여 세션이 중지되었습니다');  
                        }else {
                            console.log('only 5 more minutes left');
                            alert('보유 포인트가 부족하여 5분후 세션을 중지합니다');    
                        }
                    }*/
                    
                   // ss.set(response);
                   // console.log("video chat session updateTime success2: "+ss.get('rate')+'/'+ ss.get('point')); 
                },
                 error: function (model, response) {
                    console.log("ChatView updateTime: put error");
                 }
        });
    },
    closeChatDisplay:function(){
            console.log('ChatView: closeChatDisplay');
            var self=this;
            this.$('.waiting').remove(); 
            this.$('.ending').removeClass('hidden');
            
            setTimeout(function() {
                self.model.off('started', self.chatStarted);
                self.model.off('ended', self.chatEnded);
                self.model = null;
               // console.log('ChatView: chatEnded session is null3: '+self.model);
                self.render();
                self.dispatcher.trigger('chatEnded');  // localuser status update in localuser.js 
                self.dispatcher.buddyListView.render().$el.appendTo('.sidebar-left');
              }, 2000); 
    }, 
    chatEnded: function() {
        var self = this;
        this.publish=false;
        this.subscribe=false;
        
        if(this.session==null){
            console.log('ChatView: this.session is null');
            this.closeChatDisplay();
            return;
        }
        this.endTime =new Date();
        this.session.set('endTime',this.endTime.toDateString()+'년 '+this.endTime.getHours()+'시 '+this.endTime.getMinutes()+'분');
        this.session.set('status',false);
        
        if(this.localUser.get('caller')){ //student
            this.session.set('time',1);//to signal that this is to end the chat
            this.session.save({},{
                 type: 'PUT',
                    success: function (model, response) { //if response element name is the same as model element, it is assigned!
                        
                        self.session.set('point',response.point);
                        self.session.set('time',response.time);
                        self.session.set('timeRemaining',response.timeRemaining);
                        
                        console.log("chatEnded put success: "+response.timeRemaining+'/'+response.rate+'/'+ response.point+'/'+ response.time+'/'+ response.diff+ '/'+response.now+'/'+response.eTime+'/'+model.get('rate')+'/'+model.get('point')+'/'+self.session.get('rate')+'/'+self.session.get('sessionID') +'/'+self.session.get('point') +'/'+self.session.get('time')  );
                        self.dispatcher.chatEndModalView.show(self.session,1);
                       // ss.set(response);
                       // console.log("video chat session updateTime success2: "+ss.get('rate')+'/'+ ss.get('point')); 
                    },
                     error: function (model, response) {
                        console.log("chatEnded: put error");
                     }
            });
        }else{ //teacher
             window.setTimeout(function(){
                $.get('/session', { subscriberID:  self.session.get('subscriberID'), publisherID:  self.session.get('publisherID')})
                    .done(function(data) {
                          if(data==null) {
                              console.log('data is null');
                              return;
                          }
                         // self.model.set(self.model.defaults,{silent:true});
                          //console.log("chatEnded after clear: "+self.model.get('profileURL')+'/'+self.model.get('description'));
                          self.session.set(data);  //automatically call render() <- ?
                          //var pointToReceive=data.time/60*(data.rate-0.5)
                          console.log("ChatView: chatEnded fetch success: "+
                                     data.sessionID+'/'+ data.point+'/'+data.time+'/'+self.session.get('subscriberID')+'/'+
                                      self.session.get('point')+'/'+self.session.get('time'));
                         // self.session('point',pointToReceive);
                          self.dispatcher.chatEndModalView.show(self.session,2);
                          //self.showModal();
                     })
                      .fail(function(jqXHR, textStatus, errorThrown) {
                          console.log("ChatView: chatEnded fetch error");
                     // fail(errorThrown);
                     }); 
             },0);    //to wait until the sessions collection is updated by student end              
         }
        
        clearInterval(this.timer);
        
        if(this.localUser.get('caller'))
            clearInterval(this.updateTimer);
        
        this.resetTime();
        this.sessiosn=null;
        
        this.closeChatDisplay();
        /*
        this.endTime=new Date(); //JW
        var diff=(this.endTime.getTime()-this.startTime.getTime());
        console.log('Time diff(miliseconds): '+this.endTime.getTime()+'/'+this.startTime.getTime());
        //alert(Math.floor(diff / 1000) +' seconds have passed'); //JW
        
        this.session= new SessionModel;
        if( this.localUser.get('caller')=='true'){
            console.log('this is student');
            this.session.set('subscriberName', this.model.invitation.get('remoteUser').get('name'));
            this.session.set('publisherName', this.localUser.get('name'));
            this.session.set('subscriberID', this.model.invitation.get('remoteUser').get('uid'));
            this.session.set('publisherID', this.localUser.get('uid'));
        }else{
            console.log('this is teacher');
            this.session.set('subscriberName', this.localUser.get('name') );
            this.session.set('publisherName', this.model.invitation.get('remoteUser').get('name'));
            this.session.set('subscriberID',this.localUser.get('uid') );
            this.session.set('publisherID',this.model.invitation.get('remoteUser').get('uid') );
        }
        this.session.set('time',diff);
        this.session.set('startTime',this.startTime);
        this.session.set('endTime', this.endTime);
        this.session.set('me', this.localUser.get('uid'));
        
        var ss=this.session;
      
        this.session.save({},{
                success: function (model, response) {
                    console.log("video chat session save success: "+response.rate+'/'+ response.point);
                    ss.set(response);
                    console.log("video chat session save success2: "+ss.get('rate')+'/'+ ss.get('point')); 
                    self.dispatcher.chatEndModalView.show(ss);
                },
                 error: function (model, response) {
                    console.log("save error");
                 }
        });
        */
       
    },/*
    showModal: function(){
      $('.ui.modal').modal('show');
        
    },*/
    resetTime:function(){
       this.startTime=0;
       this.endTime=0;   
       seconds = 0;
       minutes = 0; 
       hours = 0;
    },
    getStatus: function(){
        console.log('getStatus:'+this.subscribe+'/'+this.publish);
        if(this.subscribe && this.publish)
            return 2;
        else if(this.subscribe || this.publish)
            return 1;
        else
            return 0;
    },
    endButtonClicked: function() {
       console.log('ChatView endButtonClicked');
    //  if((this.session)&&(this.session.get('status')))  
       if(this.getStatus()>0) {
          this.model.end();
      }else
          alert('세션이 시작하지 않았기 때문에 중지할 수 없습니다');
    },
      /*
    shareSelect:  function(){
        var cb=$('#shareSelect').checkbox('is checked');//$('#shareSelect-on').is(':checked')
            
        console.log('ChatView:shareSelect:'+ cb);
        if(cb)
            this.model.screenshare();
        else
            this.model.stopshare();
      },
    cameraSelect: function(){
       // console.log('ChatView:cameraSelect:'+ $('#cameraSelect-on').is(':checked'));
        //if($('#cameraSelect-on').is(':checked'))
        var cb= $('#cameraSelect').checkbox('is checked'); // $('#cameraSelect-on').is(':checked')
        console.log('ChatView:cameraSelect:'+ cb);
        if(cb)
            this.model.resumeVideo();
        else
            this.model.stopVideo(); 
      },
    audioSelect: function(){
        var cb=   //$('#audioSelect-on').is(':checked');
         console.log('ChatView:audioSelect:'+ $('#audioSelect-on').is(':checked'));
        if($('#audioSelect-on').is(':checked'))
            this.model.resumeAudio();
        else
            this.model.stopAudio(); 
      },
      */
    shareButtonClicked : function(){
     // console.log('ChatView shareButtonClicked');
      this.model.screenshare();
    },
    stopButtonClicked: function(){
      //console.log('ChatView stopButtonClicked');
      this.model.stopshare();
      },
    stopAudioClicked: function(){
          //console.log('ChatView stopButtonClicked');
      this.model.stopAudio();
      },
    stopVideoClicked: function(){
          //console.log('ChatView stopButtonClicked');
      this.model.stopVideo();
      },
   
    subscriberJoined: function() {
      this.subscribe=true;
      this.startSession();
    },
    
    published : function(){
          this.publish=true; 
          this.startSession();
      },
    /*
     startSession2: function(){
        console.log('ChatView startSession this is student');
        var self=this;
         
     //   this.session.set('subscriberName', this.model.invitation.get('remoteUser').get('name'));
    //    this.session.set('publisherName', this.localUser.get('name'));
        
        //this.session.set('time',diff);
        
        //this.session.set('endTime', this.endTime);
       // this.session.set('me', this.localUser.get('uid'));
       // this.session.set('sessionID',);  
        
      },
         showAngular: function(){
          var self=this;
          console.log('ChatView showAngular');
           $.get('/chats', { sessionId: self.model.invitation.get('sessionId')  })
                 .done(function(data) {
                          console.log('whiteboard  fetch success: '+data.apiKey+'/'+ data.sessionId+'/'+ data.token);
                       
                          //var md=angular.module('demo', ['opentok', 'opentok-whiteboard']);
                          var md= angular.module('demo', []);
                          console.log('whiteboard module: '+md);
                          md.controller('DemoCtrl', ['$scope',  function ($scope) {
                                    console.log('whiteboard  controller');
                                    $scope.greeting = 'Hola!';
                                     $scope.connected = false;
                                    OTSession.init(data.apiKey, data.sessionId, data.token, function (err) {
                                        if (!err) {
                                            console.log('whiteboard  OTSession.init success');
                                            $scope.$apply(function () {
                                                $scope.connected = true;
                                            });
                                        }else
                                            console.log('whiteboard  OTSession.init failure');
                                            
                                    });
                                }]);
                         }); 
      },
        */
  });

}(window, jQuery));
