/* -----------------------------------------------------------------------------------------------
 * Connect Modal View
 * ----------------------------------------------------------------------------------------------*/
/* global Backbone, _, log, alert */
/* exported ConnectModalView */

// Prevent leaking into global scope
!(function(exports, undefined) {

  exports.InstallModalView = Backbone.View.extend({

    events: {
      //'shown.bs.modal': 'focusInput',
    //  'hidden.bs.modal': 'clearInputs',
      //'submit #connect-form': 'connect',

    },

    _showDone: false,

    _waitingForShow: [],

    initialize: function(options) {
      if (!options.dispatcher) {
        log.error('InstallModalView: initialize() cannot be called without a dispatcher');
        return;
      }
    //  options.dispatcher.once('presenceSessionReady', this.presenceSessionReady, this);
      this.dispatcher=options.dispatcher;
        
    //  this.listenTo(this.model, 'change:status', this.userStatusChanged);
    //  this.listenTo(this.model, 'invalid', this.validationFailed);
    //  this.listenTo(this.model, 'error', this.saveFailed);
    },
      
    template: _.template($('#install-modal').html()),
    
    render:function(){
      var session=this.session;
        //console.log('rate: '+ session.get('rate'));
        

      // Delegate to bootstrap plugin
       // this.$el.modal('show');
         $('#install-modal').modal(
             //{blurring: true}).modal( //blurring makes control disappear.
             'setting', {closable  : true}
         ).modal('show');
        return this;
    },
    show: function(session) {
      console.log('InstallModalView: show');
      this.session=session;   
      // DOM queries
  //    this.$form = this.$('#connect-form');
//      this.$connectButton = this.$('#connect-btn');
      this._showDone = true;

      // We might need to queue again whatever stalled because this wasn't done
   //   this._waitingForShow.forEach(setTimeout);
    //  this._waitingForShow = [];
        this.render();
        
    },

    hide: function() {
      log.info('InstallModalView: hide');
      this.$el.modal('hide');
    }

  });

}(window));
