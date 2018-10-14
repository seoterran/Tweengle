/* -----------------------------------------------------------------------------------------------
 * Invitation List View
 * ----------------------------------------------------------------------------------------------*/
/* global jQuery, Backbone, _, log */
/* exported InvitationListView */

// Prevent leaking into global scope
!(function(exports, $, undefined) {

  exports.InvitationListView = Backbone.View.extend({

    className: 'invitation-list',

    events: {
      'click #invite-accept': 'inviteAccept',
      'click #invite-decline': 'inviteDecline',
      'click #invite-cancel': 'inviteCancel'
    },

    initialize: function(options) {
      this.listenTo(this.collection, 'add remove', this.render);
      this.dispatcher=options.dispatcher;//JW
    },

    incomingTemplate: _.template($('#tpl-incoming-invite').html()),
    outgoingTemplate: _.template($('#tpl-outgoing-invite').html()),
    incomingFreeTemplate: _.template($('#tpl-incoming-invite-free').html()),
    outgoingFreeTemplate: _.template($('#tpl-outgoing-invite-free').html()),
      
 
    render: function() {
      var self = this;

      this.$el.empty();
      this.collection.each(function(invitation) {
        var template;
        console.log('InvitationListView: '+invitation.get('incoming')+' / '+invitation.get('free'));
        //  template = invitation.get('incoming') ? self.incomingTemplate : self.outgoingTemplate;
        if(invitation.get('incoming')){
              if(invitation.get('free'))
                  template=self.incomingFreeTemplate;
              else
                  template=self.incomingTemplate;
          }else{
               if(invitation.get('free'))
                  template=self.outgoingFreeTemplate;
              else
                  template=self.outgoingTemplate;
          }
              
        var invitationData = JSON.parse(JSON.stringify(invitation));
        self.$el.append(template(invitationData));
      });

      return this;
    },

    inviteAccept: function(event) {
      log.info('InvitationListView: inviteAccept');
      var index = this.$('.invitation').index($(event.currentTarget).parents('.invitation'));
      this.collection.acceptInvitation(index);
      
      //alert('inviteAccept');
      this.startChatMode();
    },
    startChatMode: function(){
      console.log('InvitationListView: startChatMode');
      this.dispatcher.profileView.hide();//JW
      this.dispatcher.purchaseView.hide();//JW
      this.dispatcher.buddyListView.hide();// working?
      this.dispatcher.chatView.render().$el.appendTo( '.content-right'); //JW
    },
    inviteDecline: function(event) {
      log.info('InvitationListView: inviteDecline');
      var index = this.$('.invitation').index($(event.currentTarget).parents('.invitation'));
      this.collection.declineInvitation(index);
      
      this.dispatcher.buddyListView.render().$el.appendTo('.sidebar-left');
    },

    inviteCancel: function(event) {
      log.info('InvitationListView: inviteCancel');
      var index = this.$('.invitation').index($(event.currentTarget).parents('.invitation'));
      this.collection.cancelInvitation(index);
      
    //  this.dispatcher.buddyListView.render().$el.appendTo('.sidebar-left');
         this.dispatcher.buddyListView.$el.appendTo('.sidebar-left');
    },

  });

}(window, jQuery));
