!(function(exports, undefined) {

  exports.OfflineList = Backbone.Collection.extend({
    /*
     defaults: {
         uid: null,  
         language: 'all'
      },
      */
     model: UserModel,
     //url: '/allusers',
    // idAttribute: "uid"
      
     getUsersInfo: function(buddyListView) {
        var self=buddyListView;
        var list= this;
     
        var id2=buddyListView.dispatcher.me.get('uid');
        var lan2=buddyListView.language;
         
        console.log('getUsersInfo:  '+lan2+'/'+id2);
   
        $.get('/allusers', { lan:  lan2, id:id2 })
            .done(function(data) {
            
              list.set(data);
             
              console.log('BuddyListView: get allusers done ');
           
              //success();
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
              console.log('BuddyListView: getUsersInfo failed', errorThrown);
             // fail(errorThrown);
            });
    },
    getAllUsersInfo: function(buddyListView) {
        var self=buddyListView;
        var list= this;
     
        var id2=buddyListView.dispatcher.me.get('uid');
        var lan2=buddyListView.language;
         
        console.log('getAllUsersInfo:  '+lan2+'/'+id2);
   
        $.get('/alloffUsers', { })
            .done(function(data) {
            
              list.set(data);
             
              console.log('BuddyListView: getAllUsersInfo done ');
           
              //success();
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
              console.log('BuddyListView: getAllUsersInfo failed', errorThrown);
             // fail(errorThrown);
            });
    }
  
  });

}(window, jQuery));
  