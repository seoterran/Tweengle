/* -----------------------------------------------------------------------------------------------
 * User Info View
 * ----------------------------------------------------------------------------------------------*/
/* global jQuery, Backbone, _, log */
/* exported UserInfoView */

// Prevent leaking into global scope
!(function(exports, $, undefined) {

  exports.UserInfoView = Backbone.View.extend({
    tagName: 'p',
    className: 'navbar-text',
     
    events: {
         'click #profile-view-btn': 'view',
         'click #purchase-view-btn': 'purchaseViewClicked',
         'click #message-view-btn': 'messageClicked',
         'click #logout-btn': 'logoutClicked',
         'click #wb-btn': 'wbClicked',
         'click #student-list-btn': 'studentsClicked'
        
       },   
       
    initialize: function(options) {
      //console.log('UserInfoView initialize');
      this.listenTo(this.model, 'change', this.render);  //model=LocalUser
      this.dispatcher = options.dispatcher; //App
      //this.dispatcher2 = options.dispatcher2; //App
        
     //this.chatCollection= this.dispatcher2.chatCollection;
      this.chatCollection= new ChatList;  
     // $.getScript("/semantic/semantic.min.js");
    },

    template: _.template($('#tpl-user-info').html()),

    render: function() {
    
      console.log('UserInfoView: render: '+this.model.get('nickname')+'/'+this.model.get('imgSrc'));
      if(!this.model.get('nickname'))
          return this;
      this.chatCollection.getChatInfo(this.model.get('uid'));
      //this.chatCollection.set('myid',this.model.get('uid')); 
      //console.log('UserInfoView: '+this.chatCollection.get('myid')+'/'+this.model.get('uid'));
     // $('.ui.dropdown').dropdown();    
      var chatting=false;
      if(this.dispatcher.me.get('status')=='chatting')
         chatting=true;
        
      this.$el.html(this.template({
          chat_status:chatting,
          userInfo:this.model.attributes,
          messages: this.chatCollection.toJSON()
      }));
      //$('.ui.dropdown').dropdown();
      return this;
    },
    wbClicked: function(event){
           this.dispatcher.chatView.hide();
           this.dispatcher.buddyListView.hide();
           this.dispatcher.purchaseView.hide();
           this.dispatcher.profileView.hide();
           this.dispatcher.chatView.showWB(false);//not chatting mode
      },
    studentsClicked: function(event){
           if( this.model.get('status') == 'chatting') 
              return;
   
           this.dispatcher.purchaseView.hide();
           this.dispatcher.profileView.hide();
           this.dispatcher.chatView.hideWB();
           this.dispatcher.buddyListView.render();
           this.dispatcher.chatView.render();
     
      },
     logoutClicked: function(event) {
          
          console.log('logoutClicked');
          if(true){
              FB.api('/me/permissions', 'delete', function(response) {
                  if (response && !response.error) {
                    /* handle the result */
                      console.log('facebook delete success: '+response);
                      FB.logout(function(response) {
                          console.log('facebook logout: '+response);
                      });
                  }else
                      console.log('facebook delete failure: '+response);
                });
         }
          this.dispatcher.me.disconnect();      
      },
     messageClicked: function(event) {
          var index,
              remoteUser;

          index = this.$('.chat-message').index($(event.currentTarget).parents('.chat-message'));
          chatContent = this.chatCollection.at(index);
          console.log( 'messageClicked index: '+index);
          if (index === -1 || !chatContent) {
            log.warn('UserInfoView: messageClicked remote user not found');
            return;
          }
          console.log( 'messageClicked name/uid: '+chatContent.get('name2')+'/'+chatContent.get('uid2'));

          var userModel=new UserModel;
          userModel.set('uid',chatContent.get('uid2'));
          userModel.set('name',chatContent.get('name2'));
          this.dispatcher.chattingModalView.clicked_offline(userModel);    //necessary to send UserModel? 
    },
      
    view: function() {//JW  
          if( this.model.get('status') == 'chatting') 
              return;
          //alert(this.model.get('uid'));
          //var tempModel= this.dispatcher; //ProfileModel
        //  tempModel.set('uid', this.model.get('uid'));  //model->localuser
        //  console.log('UserInfoView view: '+tempModel.get('uid'));
          //this.dispatcher2.chatView.hide();
         // this.dispatcher2.profileView.hide();
          
          this.dispatcher.profileView.fetchProfile(this.model.get('uid'));
          
         // this.dispatcher2.profileView.$el.appendTo( '.content-right'); 
    },
      purchaseViewClicked: function(){
          if( this.model.get('status') == 'chatting') 
          return;
          
          this.dispatcher.profileView.hide();
          this.dispatcher.chatView.hide();
          this.dispatcher.chatView.hideWB();
          this.dispatcher.purchaseView.render();
          this.dispatcher.buddyListView.render();
      }
  });

}(window, jQuery));

/*
    mymessageClicked: function(event) {
      //  this.chatCollection.fetch();
        this.render();
    },
   
      */