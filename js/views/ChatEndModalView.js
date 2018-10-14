/* -----------------------------------------------------------------------------------------------
 * Connect Modal View
 * ----------------------------------------------------------------------------------------------*/
/* global Backbone, _, log, alert */
/* exported ConnectModalView */

// Prevent leaking into global scope
!(function(exports, undefined) {
  var ModalView = Backbone.View.extend({
    tagName: 'p',
    template: 'this is modal content',
    render: function() {
        this.$el.html(this.template);
        return this;
    }
});
  exports.ChatEndModalView = Backbone.View.extend({

    events: {
      //'shown.bs.modal': 'focusInput',
    //  'hidden.bs.modal': 'clearInputs',
      //'submit #connect-form': 'connect',

    },

    _showDone: false,

    _waitingForShow: [],

    initialize: function(options) {
      if (!options.dispatcher) {
        log.error('ConnectModalView: initialize() cannot be called without a dispatcher');
        return;
      }
    //  options.dispatcher.once('presenceSessionReady', this.presenceSessionReady, this);
      this.dispatcher=options.dispatcher;
        
    //  this.listenTo(this.model, 'change:status', this.userStatusChanged);
    //  this.listenTo(this.model, 'invalid', this.validationFailed);
    //  this.listenTo(this.model, 'error', this.saveFailed);
      $.getScript("/semantic/semantic.min.js");
       // this.$el.html(this.template()); 
        
    },
    /*  
    templateHTML2:"<div class='header'>인맥.com </div><div class='content' > <div class='ui relaxed big list'><div class='item'><div class='header' style='color:gray;'>시작</div><p id='startTime'></p> </div>  </div><div class='item'> <div class='content'><div class='header' style='color:gray;'>종료</div><div class='ui transparent input' style='width:300px;'><input readonly type='text' id='endTime' style='font-size:12pt; color:whitesmoke;'></div> </div> </div><div class='item'>  <div class='content'><div class='header' style='color:gray;'>시급</div><div class='ui transparent input' style='width:300px;'><input readonly type='text' id='rate' style='font-size:12pt; color:whitesmoke;'></div> </div> </div><div class='item'> <div class='content'><div class='header' style='color:gray;'>총 진행시간(분)</div><div class='ui transparent input' style='width:300px;'><input readonly type='text' id='time' style='font-size:12pt; color:whitesmoke;'></div> </div> </div><div class='item'> <div class='content'><div class='header' style='color:gray;'>이체 포인트</div><div class='ui transparent input' style='width:300px;'><input readonlytype='text' id='point' style='font-size:12pt; color:whitesmoke;'></div> </div></div> </div> <div class='actions'><center> <div class='ui approve inverted basic button' > 닫기 </div></center> </div>",
    templateHTML:'<p>fdsafdsafdsafsd</p>',
    */
    template: _.template($('#chatend-modal').html()),
   // template : _.template( this.templateHtml),
    render:function(){
        var self=this;
        
        console.log('chatEndModal render: rate: '+ self.session.get('rate'));
       // this.$el.html(self.template(self.session.attributes));//why not working?
        /*
        $('#startTime').val( session.get('startTime'));
        $('#endTime').val(session.get('endTime'));
        $('#rate').val(session.get('rate'));
        $('#time').val( session.get('time'));
        $('#points').val(session.get('point'));
        */
        
          // $('#time').val( (session.get('time')/(1000*60)).toFixed(1));
      // Delegate to bootstrap plugin
        
       // this.$el.modal('show');
        
        //this.$el.html(self.template());
        $('.ui.input').popup();
        return this;
    },
     
    show: function(session,who) {
        var self=this;
        console.log('ChatEndModalView  show: '+session.get('time')+'/'+session.get('point')+'/'+session.get('startTime'));
        
     
        this.session=session;   
      // DOM queries
  //    this.$form = this.$('#connect-form');
//      this.$connectButton = this.$('#connect-btn');
        this._showDone = true;

      // We might need to queue again whatever stalled because this wasn't done
   //   this._waitingForShow.forEach(setTimeout);
    //  this._waitingForShow = [];
      // this.render();
          // $('#time').val( (session.get('time')/(1000*60)).toFixed(1));
      // Delegate to bootstrap plugin
       // this.$el.html(self.template(self.session.attributes));
        
         $('#chatend-modal').modal('setting', {
             closable  : true,
             onVisible: function () {
                 console.log('onVisible');
                 
                 $('#startTime').val( session.get('startTime'));
                 $('#endTime').val(session.get('endTime'));
                 $('#time').val( session.get('time')+' 분');
                 if(who==1){
                     document.getElementById('rate_head').style.display='none';
                     document.getElementById('point_head').style.display='none';
                     $('#timeRemaining').val(session.get('timeRemaining')+' 분');
                 }else{
                     $('#rate').val(session.get('rate'));
                     $('#point').val(session.get('point'));
                     document.getElementById('timeRemaining_head').style.display='none';
                 }
                 
         }}).modal('show');
         // this.$el.html(self.template());
      
       // this.$el.html(self.template());
       // this.$el.html(self.template(session.attributes));//why not working?
       
       // this.$el.modal('show');
        /*
             document.getElementById('startTime').innerHTML='zzzzzzz';
        document.getElementById('endTime').innerHTML=session.get('endTime');
        document.getElementById('rate').innerHTML=session.get('rate')
        document.getElementById('time').innerHTML=session.get('time');
        document.getElementById('point').innerHTML=session.get('point');
        */
        
      
    },

    hide: function() {
      log.info('ConnectModalView: hide');
      this.$el.modal('hide');
    },

    serializeForm: function() {
      return {
        name: this.$form.find('[name=\'user[name]\']').val(),
        uid: this.$form.find('[name=\'user[id]\']').val()
      };
    }

  });

}(window));
