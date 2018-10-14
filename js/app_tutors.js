/* -----------------------------------------------------------------------------------------------
 * PresenceKit Application
 * ----------------------------------------------------------------------------------------------*/
/* global jQuery, _, OT, Backbone, log, ping, alert */
/* global LocalUser, BuddyList, InvitationList, UserInfoView, ConnectModalView, BuddyListView */
/* global InvitationListView, ChatView */

// Prevent leaking into global scope
!(function(exports, doc, $, undefined) {

  var App = exports.App = {

    // Models
    presenceSession: null,
    me: null,
    profileModel: null,
   
    // Views
    userInfoView: null,
    connectModalView: null,
    chatEndModalView: null,
    installModalView: null,
    buddyListView: null,
    invitationListView: null,
    chatView: null,
    profileView : null, //JW
    purchaseView : null, //JW
      
    chatCollection: null, //JW
    buddyList: null,
    invitationList: null,  

//alert('test'),
    initialize: function() {
      // Presence session initialization
     // App.once('presenceSessionReady', App.presenceSessionReady, this);
     // App.retrievePresenceConfig();

      // Model initialization
    //  App.me = new LocalUser({}, { dispatcher: App });
      App.buddyList = new BuddyList([], { dispatcher: App });
    //  App.customerList = new CustomerList([], { dispatcher: App });
    //  App.invitationList = new InvitationList([], { dispatcher: App });

      // View initialization
     
        /*
        App.connectModalView = new ConnectModalView({
        model: App.me,
        el: $('#connect-modal'),
        dispatcher: App
      });
       
      App.chatEndModalView = new ChatEndModalView({
        model: App.me,
        el: $('#chatend-modal'),
        dispatcher: App
      });
      App.installModalView = new InstallModalView({
        model: App.me,
        el: $('#install-modal'),
        dispatcher: App
      });
      App.chattingModalView = new ChattingModalView({
        model: App.me,
       // el: $('#chat-win'),
        dispatcher: App
      });

      App.profileModel= new ProfileModel;  //JW
      App.profileView =  new ProfileView({ 
        model: App.profileModel ,
        dispatcher: App,
        localUser: App.me
      //  childView: App.chatView
      });
    
      App.purchaseView =  new PurchaseView({ 
        dispatcher: App,
        localUser: App.me
      });
      
      App.invitationListView = new InvitationListView({ 
        collection: App.invitationList ,
        dispatcher: App      
      });
  
      App.userInfoView = new UserInfoView({ 
        model: App.me,
       // dispatcher: App.profileModel,
        dispatcher:App
      });
       
      App.chatView = new ChatView({
        dispatcher: App,
        localUser: App.me
      });
   */
      App.tutorListView = new TutorListView({
        collection: App.buddyList,
        dispatcher: App
      });
        /*
       App.customerListView = new CustomerListView({
        collection: App.customerList,
        dispatcher: App
      });
      */
      $(doc).ready(App.domReady);
    },
  
    retrievePresenceConfig: function() {
      $.get('/presence')
        .done(function(presenceConfig) {
          console.log('App: presenceSessionReady');
          App.presenceSession = OT.initSession(presenceConfig.apiKey, presenceConfig.sessionId);
         // ping(presenceConfig.apiKey);
          App.trigger('presenceSessionReady', App.presenceSession);
        })
        .fail(function(jqXHR, responseText, errorThrown) {
          log.error('App: presenceSessionReady failed', errorThrown);
          alert('Could not retreive the presence configuration. Please try again later');
        });
    },

    domReady: function() {
      log.info('App: domReady');
      // NOTE: App.connectModalView is already in the DOM and does not need to be rendered
      //App.connectModalView.show();
      
    //  App.userInfoView.render().$el.appendTo('.navbar-right');
      App.tutorListView.render().$el.appendTo('.content-right');
    //  App.invitationListView.render().$el.appendTo('.row-top');
     
      //App.profileView.render().$el.appendTo( '.content-right'); //JW
    //  App.chatView.render().$el.appendTo( '.content-right');       
    }

  };
  _.extend(App, Backbone.Events);
  App.initialize();

}(window, window.document, jQuery));

