/* -----------------------------------------------------------------------------------------------
 * Connect Modal View
 * ----------------------------------------------------------------------------------------------*/
/* global Backbone, _, log, alert */
/* exported ConnectModalView */

// Prevent leaking into global scope
!(function(exports, undefined) {

  exports.ProfileEditView = Backbone.View.extend({

    events: {
    
      //'click .profile-submit': 'connect'
      //'submit #connect-profile': 'connect',
      'click #profile-submit-btn': 'edit'
    },

    initialize: function(options) {
      if (!options.dispatcher) {
        log.error('ConnectModalView: initialize() cannot be called without a dispatcher');
        return;
      }
      this.$form = this.$('#connect-profile');
      this.el = $(this.el);
      
    //  options.dispatcher.once('presenceSessionReady', this.presenceSessionReady, this);

    //  this.listenTo(this.model, 'change:status', this.userStatusChanged);
     // this.listenTo(this.model, 'invalid', this.validationFailed);
      //this.listenTo(this.model, 'error', this.saveFailed);
    },
    
    template: _.template($('#tpl-profile').html()),
    
    edit: function(event) {
      log.info('ConnectModalView: connect');
     // alert('profile-edit-btn');
      /*
      event.preventDefault();

      if (!this.presenceSession) {
        log.warn('ConnectModalView: ignoring connect() because presenceSession is not initialized');
        return;
      }

      this.disableInputs();
      this.resetValidation();
*/


      var temp=this.serializeForm(); //JW
      alert('profile-edit-btn'+temp.name);
      this.model.save(temp); //JW
      
     //  alert('serializeForm :'+temp.uid);
    },

   render: function() {
   
      return this;
   },
   
/*
    show: function() {
      log.info('ConnectModalView: show');
      alert('show');
      // DOM queries
      this.$form = this.$('#profile-edit-form');
      this.$connectButton = this.$('#profile-submit-btn');
      this._showDone = true;

      // We might need to queue again whatever stalled because this wasn't done
      this._waitingForShow.forEach(setTimeout);
      this._waitingForShow = [];

      // Delegate to bootstrap plugin
      this.$el.modal('show');
    },
*/

    serializeForm: function() {
    
      return {
        name: this.$form.find('[name=\'profile[name]\']').val(),
        language: this.$form.find('[name=\'profile[language]\']').val(),
        uid: this.$form.find('[name=\'profile[uid]\']').val()
      };
    },

   
  });

}(window));
