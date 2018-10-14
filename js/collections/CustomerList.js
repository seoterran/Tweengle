!(function(exports, undefined) {

  exports.CustomerList = Backbone.Collection.extend({
   
     model: CustomerModel,
     url: '/customers',
    // idAttribute: "uid"
     initialize: function(models, options) {
      if (!options.dispatcher) {
        log.error('CustomerList: initialize() cannot be called without a dispatcher');
        return;
      }
      this.dispatcher = options.dispatcher;
     // this.dispatcher.once('presenceSessionReady', this.presenceSessionReady, this);
    //  this.dispatcher.on('getRemoteUser', this.getRemoteUser, this);
    //  this.on('change:available', this.userAvailabilityChanged, this);
    },
      /*
     getUsersInfo: function(buddyListView) {
        var self=buddyListView;
        var list= this;
     
        id2=buddyListView.dispatcher.me.get('uid');
        lan2=buddyListView.language;
         
        console.log('getUsersInfo:  '+lan2+'/'+id2);
   
        $.get('/allusers', { lan:  lan2, id:id2 })
            .done(function(data) {
              list.set(data);
              console.log('BuddyListView: get allusers done ');
           
              //success();
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
              console.log('BuddyListView: uidUpdate failed', errorThrown);
             // fail(errorThrown);
            });
    }*/
  
  });

}(window, jQuery));
  