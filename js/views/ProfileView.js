!(function(exports, $, undefined) {
   
  exports.ProfileView = Backbone.View.extend( {
  
        events: {
           //'submit #connect-profile': 'connect',
           'click #profile-submit-btn': 'connect',
           'click #profile-language': 'languageClicked',
           //'click #profile-delete-btn': 'delete',
           'change #teacherSelect': 'updateView',
           'click #videoCall-btn': 'videoCall',
           'click #chat-btn': 'chat',
          'click #fb-chat-btn': 'fbchat'
         },
     
        initialize: function( options) {
          this.listenTo(this.model, 'change', this.render);
           
          this.dispatcher=options.dispatcher;          
        //this.listenTo(this.dispatcher.customerList, 'change', this.render);
        
            
        /*
            $("#profile-submit-btn").on("click", function() {
                $("#success-alert").removeClass("in").show();
                $("#success-alert").delay(200).addClass("in").fadeOut(2000);
            });
            
            $.getScript("/semantic/components/dropdown.min.js");
            $.getScript("/semantic/components/search.min.js");
            $.getScript("/semantic/components/popup.min.js");
            $.getScript("/semantic/components/transition.min.js");
                   //$.getScript("/semantic/semantic.min.js");  //why not necessary
         ///$.getScript("//code.jquery.com/jquery-2.2.1.min.js");
       //  $.getScript("/js/angularjs/angular.js"); //why not working
        // $.getScript("/js/opentok/opentok-whiteboard.min.js");
            */
            
          $.getScript("//code.jquery.com/ui/1.11.4/jquery-ui.js");
         // this.showAngular();
        
         // $("#isTeacher").bootstrapSwitch();
          console.log('ProfileView initialize');
            
            /*
          this.subjects = [false, false, false,false, false, 
                          false,false,false,false,false,
                          false,false,false,false];*/
            
         // this.subjectNames = ['Math', 'Science', 'English','Foreign Language', '코칭', '코딩','기타','Social Science'];
        },
        
      template: _.template($('#tpl-profile').html()),
      
      videoCall:function(){
             console.log('ProfileView videoCall clicked: '+uid);
       },
      chat:function(){
          var uid=this.model.get('uid');
          var onlineUser=this.dispatcher.buddyListView.findOnlineUser(uid);
          if(onlineUser)
              this.dispatcher.chattingModalView.clicked(onlineUser); 
          else{
              var offlineUser=this.dispatcher.buddyListView.findAllofflineUser(uid);
              console.log('ProfileView chat clicked: '+uid+'/'+offlineUser);
             
              this.dispatcher.chattingModalView.clicked_offline(offlineUser); 
          }
             
      },
      
      fbchat:function(){
         //var self=this;
        var toID=this.model.get('sid');
        var social=this.model.get('social');
          
        var self=this;
        var sender_=this.dispatcher.me.get('uid');
        var receiver_ =this.model.get('uid');
          
        console.log('fbchat : '+toID+'/'+social);
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
            if (response && !response.error_message) {
                //alert('페이스북 메세지를 성공적으로 보냈습니다');
                console.log('Chatview FB.ui : '+JSON.stringify(response));
                if(response.success){
                    $.get('/email_fb', { sender: sender_ ,receiver:receiver_})
                       .done(function(data) {

                           console.log('email_fb success : '+data.success+' / '+sender_+' / '+receiver_); 
                           if(!data.success){
                                alert('페이스북 메세지를 보냈으나 이메일 알림은 보내지 못했습니다');
                           }else
                                alert('페이스북 메세지를 성공적으로 보냈습니다');

                   }).fail(function(jqXHR, textStatus, errorThrown) {
                       console.log('email_fb failure'); 
                   });
                }else{
                    // "error_code":100,"error_msg":"Viewer cannot message specified recipients."}
                        console.log('fb response NOT success');
                    }
            } else {
             // alert('메세지가 보내지지 않았습니다');
                console.log('fb message NOT sent');
            }
          }
        );
    },
      languageClicked: function(event){
              var target=$(event.currentTarget);

              var language=target.attr('hr');
              console.log('languageClicked: '+target.attr('hr')+'/'+language);

              $('#lanInput2').val(target.attr('hr'));
              //this.filterByLanguage(language);
             // this.render();

        },
        fetchProfile: function(id){
             var self=this;
             var temp;
             
             if( this.dispatcher.me.get('status') == 'chatting') {
                console.log("ProfileView fetchProfile status is: "+this.dispatcher.me.get('status'));
                this.clearPopup();
                return;
             }
             console.log("ProfileView fetchProfile: "+id);
             //this.listenTo(this.model, 'change', this.render);
             $.get('/listdata', { uid:  id })
              .done(function(data) {
                  self.model.set(self.model.defaults,{silent:true});
                  console.log("ProfileModel after clear: "+self.model.get('accHolder')+'/'+self.model.get('point')+'/'+self.model.get('subjects'));
                   //automatically call render()
                  temp=data;
                  
                  $.get('/customers', { uid:  id })
                    .done(function(data) {
                       console.log('customers: done '+id+'/'+temp.point);
                      
                       self.dispatcher.purchaseView.hide();
                       self.dispatcher.chatView.hide();  
                       self.dispatcher.chatView.hideWB();
                       self.dispatcher.buddyListView.render();
                       self.$el.appendTo('.content-right'); 
                      
                       self.dispatcher.customerList.set(data);
                       self.model.set(temp); 
                       console.log("ProfileModel fetch success: "+self.model.get('accHolder')+'/'+self.model.get('point')+'/'+self.model.get('subjects'));
                      // $( "#slider" ).slider({ max: temp.point});
                       $( "#slider" ).slider( "option", "max", temp.point );
                          /*
                        self.$el.html(self.template({
                                          pf:        self.model.attributes, //profile
                                          customers: self.dispatcher.customerList.toJSON()
                                            } ));//$el??
                                            
                       self.$el.html(self.template({
                          customers: self.dispatcher.customerList.toJSON()
                      }));
                     */
                  })
                   .fail(function(jqXHR, textStatus, errorThrown) {
                       console.log("ProfileModel fetch error");
             // fail(errorThrown);
                  }); 
             })
              .fail(function(jqXHR, textStatus, errorThrown) {
                  console.log("ProfileModel fetch error");
             // fail(errorThrown);
             }); 
      
           // this.render().$el.appendTo('.content-right'); 
            // console.log("ProfileModel fetchProfile end ");
        },
        setDesc: function(ele,data){
            if(!data){
                console.log('setDesc: no description');
                return;
            }
            var description=this.model.get('description');
            var self=this;
          //  $('#desc').val(description); //test
             $(ele).val(data);
           
            //console.log('setDesc: '+$('#desc')+'/'+this.model.get('description'));
            console.log('setDesc: '+$(ele)+'/'+data);
            
           // if ($('#desc').val()!=description){
             if ($(ele).val()!=data){
               window.setTimeout(function(){self.setDesc(ele,data);}, 10);   
               console.log('description not yet set: '
                         +$(ele).val()+'/'  // +$('#desc').val()+'/'
                       +data); //   +description);    
            }else{
               console.log('description is set! ');
            }
        },
      initPopup: function(){
            console.log('ProfileView initPopup');
            $('.ui.button').popup({variation: 'inverted'});
            $('.ui.input').popup({variation: 'inverted'});
            $('.ui.dropdown').popup({variation: 'inverted'}); 
            $('.ui.label').popup({variation: 'inverted'}); 
            $('.ui.checkbox').popup({variation: 'inverted'}); 
            $('.input-head').popup({variation: 'inverted'}); 
      },
       clearPopup: function(){
            console.log('ProfileView clearPopup');
            $('.ui.button').popup('destroy');
            $('.ui.input').popup('destroy');
            $('.ui.dropdown').popup('destroy'); 
            $('.ui.label').popup('destroy'); 
            $('.ui.checkbox').popup('destroy'); 
            $('.input-head').popup('destroy'); 
    },
        UIInitialization: function(){
            var self=this;
            
            $('.menu .item').tab();

            $('#rateDD').dropdown('set selected', [self.model.get('rate')]);
           // $('#areaDD').dropdown('set selected', [self.model.get('area1')]);
           // $('#freeMinsDD').dropdown('set selected', [self.model.get('freeMins')]);
            
           // $('#areaDD2').dropdown();
            $('#teacherDD').dropdown('set selected', [self.model.get('isTeacher')]);
            $('#subjectDD').dropdown({ maxSelections: 7});
            
            /*
            if(self.model.get('videoTutor'))
                $('#videoTutor').checkbox('check');
            else
                $('#videoTutor').checkbox('uncheck');
            */
           if(self.model.get('noPic'))
                $('#noPic').checkbox('check');
            else
                $('#noPic').checkbox('uncheck');
            
            if(self.model.get('noProfile'))
                $('#noProfile').checkbox('check');
            else
                $('#noProfile').checkbox('uncheck');
            
           // $('.ui.checkbox').checkbox(self.model.get('videoTutor'));
            self.initPopup();
           
            // $('#desc').val(this.model.get('description')); //test
            self.setDesc('#desc', self.model.get('description'));
            self.setDesc('#edu', self.model.get('education'));
            self.setDesc('#exp', self.model.get('experience'));
            self.setDesc('#interest', self.model.get('interest'));
            
            if(self.model.get('subjects')!=null){
                    var len=self.model.get('subjects').length;
                    var len2=self.dispatcher.buddyListView.subjects.length;
                    console.log('ProfileView buddyListView.subjects.length: '+len2);
                    
                    for(var j=len; j<len2;j++){
                        self.model.get('subjects')[j]=false;
                    }
                    for(var i=0; i<len ;i++) {
                            console.log('ProfileView render subjects[i]: '+self.model.get('subjects')[i]);

                            if( self.model.get('subjects')[i]) {
                                 var str=i.toString();
                                 console.log('ProfileView render str: '+str);
                                 $('#subjectDD').dropdown('set selected', [str]);  
                            }
                    }
                }
           /*
            $( "#slider" ).slider({change: function( event, ui ) {
                var cashable = $( "#slider" ).slider( "value" );
                var max = $( "#slider" ).slider( "option", "max" );
                
                $('#cashable').val(cashable*0.95);
                $('#pointDisplay').val(max-cashable);
                //console.log('slider change: '+$('#cashable').val()+'/'+cashable);
            }});
            */
           //this.showAngular();
        },
       getArea: function(){
           var areas=this.dispatcher.buddyListView.areas;
           var len=areas.length;
           var myarea=this.model.get('area1');
           for(var i=0;i<len;i++){
               if(areas[i].id==myarea)
                   return areas[i].name;
           }
       },
        render: function() {
          
            //this.$('#connect-profile').find('[name=\'semant\']').dropdown();
            var self=this;
            $(this.el).show();
            //$('#semant').dropdown();
            var rr=this.dispatcher.me.get('uid')==this.model.get('uid');
            
            /*
            var social=0;
            if((this.dispatcher.me.get('social')==1)&&(this.model.get('social')==1))
               social=1;
            else if((this.dispatcher.me.get('social')==2)&&(this.model.get('social')==2))
               social=2;
               */
            this.clearPopup();
            this.model.set('mine', rr,{silent:true});
            console.log('ProfileView render mine: '
                        +this.model.get('accHolder')+'/' 
                        +this.model.get('mine')+'/' +this.model.get('pointEarned')+'/'
                        +this.model.get('isTeacher')+'/' +this.model.get('website')+'/'
                        +this.model.get('profileURL')+'/'+this.model.get('description')+'/'
                        +this.model.get('isTeacher')+'/' +this.model.get('nickname')+'/'
                        +this.model.get('subjects')+'/' +this.model.get('belongTo')+'/'
                        +this.model.get('uid')+'/'
                        +this.model.get('freeMins')+'/'+this.model.get('social'));
          
            window.setTimeout(function(){
                //$('.ui.dropdown').dropdown();
                
                self.$el.html(self.template({
                                      subjects:  self.dispatcher.buddyListView.subjects,
                                      selectedSubjects: self.model.get('subjects'),
                                     // area: self.getArea(),
                                     // areas:   self.dispatcher.buddyListView.areas,
                                      pf:        self.model.attributes, //profile
                                      social : self.model.get('social'),
                                      customers: self.dispatcher.customerList.toJSON()
                                        } ));
                self.UIInitialization();
               // $('#isTeacher').attr("selected",self.model.get('isTeacher') );
              
                
                self.updateView();
              
               
                
            }, 10); 
      
            return this;    
        },
        
        connect: function(event) { //save
           var self=this;
            
           //var pending=this.dispatcher.invitationListView.checkPending();    
           if(this.dispatcher.invitationList.length>0){
               console.log('there is pending invitations');
               alert('저장되지 않았습니다. 과외 요청이 대기중 일때는 프로필 변경이 안됩니다');
               return;
           }else if($('#teacherDD').dropdown('get value')==''){
               alert('저장되지 않았습니다. 멘토나 학생으로 등록을 선택해 주세요');
               return;   
           }else if(($('#teacherDD').dropdown('get value')=='tea')&&($('#desc').val().length<10)){
               alert('저장되지 않았습니다. 본인소개를 좀더 자세히 작성해주세요');
               return; 
           }else if($('#email').val()==''){
               alert('저장되지 않았습니다. 연락가능한 이메일을 입력해 주세요');
               return; 
           }/*else if(($('#teacherDD').dropdown('get value')=='tea')&&($('#rateDD').dropdown('get value')=='0')){
               alert('시범수업인 경우에만 시급을 0으로 저장해 주세요');
               
           }  */        
            
            console.log('profileView save: '+$('#profileURL').val()+'/'+$('#desc').val()+'/'+this.model.get('uid')+'/'
                       +$('#isTeacher').is(':selected')+'/'+$('#math').is(':checked')+'/'+$('#email').val()+'/'+$('#paypal').val()); 
            
            this.$form = this.$('#connect-profile'); //must not be in initialize function
           
            var len=this.model.get('subjects').length; //len can be zero because subject may have been updated to DB value
            for(var i=0;i<len;i++){ 
                var str='#sub_'+i.toString();
                this.model.get('subjects')[i]=$(str).is(':checked');
                if($(str).is(':checked'))
                    console.log('ProfileView connect subjects[i] : '+ len+'/'+str+'/'+$(str).is(':checked')+'/'+this.model.get('subjects')[i]);
            }
         
            console.log('profileView save2: '
                       +$('#profileURL').val()+'/'
                       +this.model.get('profileURL')+'/'
                       //+this.model.get('language')+'/'
                       +this.model.get('isTeacher')+'/'
                       +this.model.get('email')+'/'
                       +this.model.get('paypal')+'/'
                      // +str+'/'+subjects+'/'
                       +this.model.get('rate'));
       
          //  var e = document.getElementById("rate");
           // var rate = e.options[e.selectedIndex].text;
           // var rate =    $('#rateDD').dropdown('get value');
            console.log('ProfileView: '+this.model.get('uid')+'/'+$('#accHolder').val()
                        +'/'+$('#noProfile').checkbox('is checked'));
            var userDetails = {
                'rate':$('#rateDD').dropdown('get value'),
                'profileURL':$('#profileURL').val(),
                'description':$('#desc').val(),
                'education':$('#edu').val(),
                'experience':$('#exp').val(),
                'interest':$('#interest').val(),
                'website':$('#website').val(),
                'nickname':$('#nickname').val(),
                'isTeacher':$('#teacherDD').dropdown('get value'),
                'email':$('#email').val(),
                'paypal':$('#paypal').val(),
                'belongTo':$('#belongTo').val(),
                'bank':$('#bank').val(),
                'account':$('#account').val(),
                'accHolder':$('#accHolder').val(),
                'subjects':self.model.get('subjects'),
                //'area1':$('#areaDD').dropdown('get value'),
                //'area2':$('#areaInput').val(),
                //'videoTutor':$('#videoTutor').checkbox('is checked'),
               // 'freeMins':$('#freeMinsDD').dropdown('get value'),
                'noPic':$('#noPic').checkbox('is checked'),
                'noProfile':$('#noProfile').checkbox('is checked')
                
            };
            this.model.save(userDetails, {
                type: 'PUT',
                success: function (model, response) {
                    console.log("Profile save success");
                    $("#success-alert").removeClass("in").show();
                    $("#success-alert").delay(300).addClass("in").fadeOut(4000);
                },
                error: function (model, response) {
                    console.log("Profile save error");
                    $("#failure-alert").removeClass("in").show();
                    $("#failure-alert").delay(300).addClass("in").fadeOut(4000);
                }
            });
          // this.model.save(save); //JW
        },
        updateView: function(){
            //this.showAngular();
            if($('#teacherDD').dropdown('get value') == "tea"){
                    //document.getElementById("teacherMode").style.visibility = "hidden";
                    $(".rowToHide").show();
                    console.log('isTeacher is selected: ');
            }else{
                     console.log('isTeacher is NOT selected: ');
                   // document.getElementById("teacherMode").style.visibility = "visible";
                     $(".rowToHide").hide();
                }
        },
        teacherSelect: function(){
            var self=this;
            console.log('ProfileView:teacherSelect:'+ $('#isTeacher').is(':selected'));
            this.updateView();
            /*
            this.$el.html(this.template({
                                      //pf:        self.model.attributes, //profile
                                      //customers: self.dispatcher.customerList.toJSON(),
                                      amTeacher:$('#isTeacher').is(':selected')
                                        } ));
            $(this.el).hide();// not working
            */
           // $(this.el).show();       
        },
        hide: function(){
         // this.remove();
          //this.unbind();
            $(this.el).hide();
        },
       
        delete: function(){
              var self=this;
              //console.log('ProfileView delete');
              self.model.save({},{
                        type: 'POST',
                        success: function (model, response) {
                            console.log("The model has been deleted in the server "+response.uid);
                        },
                         error: function (model, response) {
                           console.log("Something went wrong while deleting the model");
                              return;
                         }
                     });
            
              FB.api('/me/permissions', 'delete', function(response) {
                    console.log('ProfileView fb delete '+self.model.get('name'));
                    alert('회원탈퇴가 처리되었습니다. 회원님을 떠나보내게 되어 많이 아쉽습니다. 더욱 발전하는 인맥.com이 되겠습니다');
                    window.location.assign("http://www.inmegg.com");
                   /* self.model.destroy({
                        success: function (model, respose, options) {
                            console.log("The model has deleted the server "+response.result);
                        },
                        error: function (model, xhr, options) {
                            console.log("Something went wrong while deleting the model");
                        }
                    });*/
                     
                });
      
            /*
          $.delete('/user', { uid:  self.model.get('uid') })  //not working
                    .done(function(data) {
                           console.log('user delete: done '+data.uid+'/'+data.result);

                   })
                    .fail(function(jqXHR, textStatus, errorThrown) {
                           console.log("user delete error");
                 // fail(errorThrown);
                      });
                      */
        }
      /*,
        serializeForm: function() {
          return {
            name: this.$form.find('[name=\'profile[name]\']').val(),
            language: this.$form.find('[name=\'profile[language]\']').val(),
            uid: this.$form.find('[name=\'profile[uid]\']').val()
          };
        }
        */
      });

}(window, jQuery));
 
/*
 setElement: function(prop){
          
            if(!this.model.has(prop)){
                console.log('setElement: no '+prop);
                return;
            }
            
            var property=this.model.get(prop);
            var self=this;
            $('#'+prop).val(property); //test
             
            console.log('setElement: '+$('#'+prop).val()+'/'+property);
            
            if ($('#'+prop).val()!=property){
               window.setTimeout(function(){self.setElement(prop);}, 10);   
               console.log('element not yet set: '
                           +$('#'+prop).val()+'/'
                           +property);    
            }else{
               console.log('element is set! ');
            }
        },
showAngular: function(){
            /*
            var md= angular.module('demo', []);
            console.log('whiteboard module: '+md);
            var dr= md.directive("w3TestDirective", function() {
                //console.log('whiteboard module2 '); 
                return {
                  template : "<h1>constructor!<h1>"
              };
            });
            var ct= md.controller('DemoCtrl', ['$scope',  function ($scope) {
                console.log('whiteboard  controller');
                $scope.greeting = 'Hola!';
            }]);
            
        console.log('whiteboard controller: '+ct);
            console.log('whiteboard directive: '+dr);
            */
            //sessionId: self.model.invitation.get('sessionId')
            
         
            /*
           $.get('/chats', { })
                .done(function(data) {
                          console.log('whiteboard  fetch success: '+data.apiKey+'/'+ data.sessionId+'/'+ data.token);
                          var md=angular.module('demo', ['opentok', 'opentok-whiteboard']);
                       
                           console.log('whiteboard module: '+md);
                         
                             md.controller('DemoCtrl', ['$scope', 'OTSession', function ($scope, OTSession) {
                     
                                    console.log('whiteboard  controller');
                                    $scope.greeting = 'Hola!';
                                    $scope.connected = false;
                              
                                 
                                    OTSession.init(data.apiKey, data.sessionId, data.token, function (err) {
                                        if (!err) {
                                            $scope.$apply(function () {
                                                $scope.connected = true;
                                            });
                                        }else
                                            console.log('whiteboard  OTSession.init failure');
                                            
                                    });
                                }]);
                            
                        */
  
    
