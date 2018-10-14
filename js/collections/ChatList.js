/* -----------------------------------------------------------------------------------------------
 * Buddy List Collection
 * --------------------------------------------------------------------------------------------*/
/* global Backbone, log */
/* global RemoteUser */
/* exported BuddyList */

// Prevent leaking into global scope
!(function(exports, undefined) {

  exports.ChatList = Backbone.Collection.extend({

      defaults: {
          myid: null,
          news: null
      },
      model: ChatContentModel,
      url: '/ChatContent',
      
      getChatInfo: function(uid) { //dont know why this is called after invitation is canceled
          var self = this;
          //self.set('myid',uid); //not working
          this.myid=uid;
          
          $.get('/ChatContent', { id: uid})
            .done(function(data) {
              self.set(data);
              console.log('ChatList: getChatInfo done: ' +data+'/'+uid+'/'+self.myid+'/'+self.get('myid')+'/'+ _.size(data));
              //success();
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
              console.log('ChatList: getChatInfo failed', errorThrown);
             // fail(errorThrown);
            });
    }
  });

}(window));
