/* -----------------------------------------------------------------------------------------------
 * Connect Modal View
 * ----------------------------------------------------------------------------------------------*/
/* global Backbone, _, log, alert */
/* exported ConnectModalView */

// Prevent leaking into global scope
!(function(exports, undefined) {

  exports.ConnectModalView = Backbone.View.extend({

    events: {
      'shown.bs.modal': 'focusInput',
      'hidden.bs.modal': 'clearInputs',
    //  'submit #connect-form': 'connect',
    //  'click #connect-btn': 'connect'
    },

    _showDone: false,

    _waitingForShow: [],

    initialize: function(options) {
      if (!options.dispatcher) {
        log.error('ConnectModalView: initialize() cannot be called without a dispatcher');
        return;
      }
      options.dispatcher.once('presenceSessionReady', this.presenceSessionReady, this);
      this.dispatcher=options.dispatcher;
        
      this.listenTo(this.model, 'change:status', this.userStatusChanged);
      this.listenTo(this.model, 'invalid', this.validationFailed);
      this.listenTo(this.model, 'error', this.saveFailed);
    },
    fbCheck: function(name,id,social,email) {
        var self=this;
        console.log('fbCheck: '+name+'/'+id+'/'+social+'/'+email);
        // alert('ConnectModalView fbCheck: '+id);
         $.get('/checkbyfid', { sid:  id })
                .done(function(data) {
                      if(data == null) {  
                           console.log(id+' is not our user yet ');
                           window.location.assign("/signup.html");
                      } else{
                           console.log('already user: '+id+'/'+data+'/'+name+'/'+email+'/'+data.name);
                           self.connect(name,id,social,email,'','');
                      }
               })
                .fail(function(jqXHR, textStatus, errorThrown) {
                       console.log("fbcheck get error: "+id);
                      // window.location.assign("http://www.inmegg.com/signup.html");
             // fail(errorThrown);
                  }); 
    },
    connect: function(name,id,social,email,thumbnail,profile) {
        var self=this;
        console.log('ConnectModalView: connect: '+this.presenceSession);
         // event.preventDefault();
      
        if (!this.presenceSession) {
            log.warn('ConnectModalView: ignoring connect() because presenceSession is not initialized');
            alert('접속이 원할하지 않습니다. 페이지를 새로고침 하기 바랍니다. 인터넷 익스플로러를 사용 중이라면 크롬이나 파이어폭스로 재시도 하기 바랍니다.');
            return;
          }

    //  this.disableInputs();
    //  this.resetValidation();

     // var temp=this.serializeForm();
        
        //model is LocalUser
        if(social==1){
         //   this.model.set('fid',id);
             this.model.set('email',email,{silent:true});
            //not need to do this every login. should be moved to server
             this.model.set({imgSrc:'//graph.facebook.com/'+id + '/picture?type=small',
                             imgSrc2:'//graph.facebook.com/'+id + '/picture?type=normal'},
                             {silent:true});
        }else {
             this.model.set({imgSrc:thumbnail,imgSrc2:profile},{silent:true});   
        }
        /*
        this.model.set('name',name,{silent:true});
        this.model.set('nickname',name,{silent:true});
        this.model.set('social',social,{silent:true});
        this.model.set('sid',id,{silent:true});
        */
        
        this.model.set({name: name, nickname:name,social:social,sid:id},{silent:true});
        
    //    console.log('222');
       /* if(typeof email!="undefined")
         this.model.set('email',email);
         */
           
       // this.model.set('status','online');
        this.model.save({},{ // users
           type: 'POST',
           success: function (model, response) {
                //the rest of the model is populated by $responseData of post('/users'
                console.log("ConnectModalView connect/ post success-now status is: "+ model.get('rate')+'/'+model.get('uid')+'/'+model.get('social')+'/'+model.get('sid')+'/'+model.get('name')+'/'+model.get('nickname')+'/'+self.model.get('nickname')+'/'+model.get('email')+'/'+model.get('imgSrc'));   
                },
            error: function (model, response) {
                console.log("ConnectModalView post error");
                }
      });//LocalUser
       
     // alert('serializeForm :'+temp.uid);
    },

    userStatusChanged: function(user, status) {
      if (status === 'online') {
        this.hide();
        //this.dispatcher.chattingModalView.initializeSession();
      }
    },

    validationFailed: function(user, errors) {
      log.warn('ConnectModalView: validationFailed');
      _.each(errors, function(error) {
        var group = this.$form.find('[name=\'user['+error.attribute+']\']').parents('.form-group');
        group.addClass('has-error');
        group.append('<p class="help-block">'+error.reason+'</p>');
      }, this);
      this.enableInputs();
    },

    saveFailed: function(user, xhr) {
      log.error('ConnectModalView: saveFailed'+ xhr.status, xhr);
      alert('접속이 원할하지 않으니 다시 로그인 하시기 바랍니다. (Code:120)' );
      //this.enableInputs();
      window.location.assign("/");
    },

    show: function() {
      log.info('ConnectModalView: show');

      // DOM queries
      this.$form = this.$('#connect-form');
      this.$connectButton = this.$('#connect-btn');
      this._showDone = true;

      // We might need to queue again whatever stalled because this wasn't done
      this._waitingForShow.forEach(setTimeout);
      this._waitingForShow = [];

      // Delegate to bootstrap plugin
      this.$el.modal('show');
    },

    hide: function() {
      log.info('ConnectModalView: hide');
      this.$el.modal('hide');
    },

    focusInput: function() {
      this.$form.find(':input').first().focus();
    },

    clearInputs: function() {
      this.$form[0].reset();
    },

    disableInputs: function() {
      this.$form.find(':input').prop('disabled', true);
      this.$connectButton.button('loading');
    },

    enableInputs: function() {
      this.$form.find(':input').prop('disabled', false);
      this.$connectButton.button('reset');
    },
/*
    serializeForm: function() {
    
      return {
        name: this.$form.find('[name=\'user[name]\']').val(),
        uid: this.$form.find('[name=\'user[id]\']').val()
      };
    },
*/
    resetValidation: function() {
      var groups = this.$form.find('.has-error');
      groups.find('.help-block').remove();
      groups.removeClass('has-error');
    },

    presenceSessionReady: function(presenceSession) {
      /*
      if (!this._showDone) {
        // Just queue ourselves for when show is done
        this._waitingForShow.
          push(this.presenceSessionReady.bind(this, presenceSession));
        return;
      }
        */
      console.log('presenceSessionReady');//JW
      this.presenceSession = presenceSession;
      // Now that a presence session exists, enable the form
      //this.$connectButton.prop('disabled', false);
      //this.$connectButton.text('Connect');
    }
  });

}(window));
