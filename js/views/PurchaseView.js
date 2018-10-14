/* -----------------------------------------------------------------------------------------------
 * Buddy List View
 * ----------------------------------------------------------------------------------------------*/
/* global jQuery, Backbone, _, log */
/* exported BuddyListView */

// Prevent leaking into global scope

!(function(exports, $, undefined) {
  
  //var language, session,name;
  exports.PurchaseView = Backbone.View.extend({

    className: 'panel panel-default',

    events: {
      //'click  #purchase-view-btn':'pointButtonClicked'
      // 'click #display': 'sendClicked',
        'change #planSelect': 'planSelect',
        'click #wireTransfer':'wireClick'
    },

    initialize: function(options) {
      //console.log('BuddyListView: initialize()');
      if (!options.dispatcher) {
        log.error('PurchaseView: initialize() cannot be called without a dispatcher');
        return;
      }
      this.dispatcher = options.dispatcher; //App
     // this.chattingModalView=  this.dispatcher.chattingModalView; 
   
  
      $.getScript("/semantic/semantic.min.js");
      $.getScript("https://js.braintreegateway.com/js/braintree-2.21.0.min.js");
      this.point=null;
      this.amount=null;
      this.currency=null;
      this.message='';
      //this.nonce=null;
         
    },

    template: _.template($('#tpl-point-purchase').html()),
      
    UIInitialization: function(){
        var self=this;
        $.getJSON(
             "/../../checkout/token.php", // The server URL 
                                  // Data you want to pass to the server.
             function(data){
                  //console.log('client-token:'+data);
                  //show(data);
                  braintree.setup(data,  "dropin",{
                      container: "payment-form",
                      onPaymentMethodReceived: function (obj) {
                              console.log('onPaymentMethodReceived: '+obj.nonce);
                              //self.sendClicked(obj.nonce); <-- will not used since I stopped the account
                 }});
            } // The function to call on completion.
        );  
        $('#purchaseDD').dropdown();
        $('.ui.dropdown').popup({variation: 'inverted'});
    },
    render: function() {
      var self=this;
     // this.update();    
     //   this.uidUpdate();
      var status=this.dispatcher.me.get('status');
      var myuid= self.dispatcher.me.get('uid');
      console.log('PurchaseView render: '+status+'/'+myuid);
      if(status === 'chatting')    
          return;
      
      self.$el.appendTo('.content-right'); 
      //$('#nameSearch').search();
     
      this.$el.html(self.template({
                        //message: self.message
                    }));
      this.UIInitialization();     
      $(this.el).show(); //necessary
        
      return this;
    },
      sendClicked: function(nc){
          var self=this;
          var myuid=self.dispatcher.me.get('uid');
          var msg;
        //  this.$form = this.$('#checkout');
         // var payment_method_nonce= this.$form.find('[name=\'payment_method_nonce\']').val();
          console.log('sendClicked: '+myuid+'/'+nc+'/'+self.amount+'/'+self.point);
          document.getElementById('display').disabled = true;
         // var pt=$('#point').val;
         // var amount=$('#amount').val;
          $.get('/sale', { uid:  myuid, point: self.point, amount: self.amount, nonce: nc,currency:self.currency })
              .done(function(data) {
                  switch(data.tid){
                      case -1:
                          msg='결제가 실패하였습니다(code:-1, '+data.error+')';
                          console.log(data.tid+'/'+data.error);
                          break;
                      case 0:
                          msg='결제가 실패하였습니다(code:0, '+data.failure+')';
                          console.log(data.tid+'/'+data.failure);
                          break;
                      default:
                          msg=self.currency+' '+ self.amount +'이 성공적으로 결제 되었습니다.(결제ID: '+data.tid+ ') '+data.point+' 포인트를 구입하였습니다.(현재: '+data.currentPoint+')';
                          console.log(data.tid+' / '+data.point+' / '+data.currentPoint);
                          
                  }
                 // self.message=msg;
              document.getElementById('message').innerHTML=msg;
              //document.getElementById('message').style.visibility = "visible";
                  document.getElementById('display').disabled = true;
              
              
            }).fail(function(jqXHR, textStatus, errorThrown) {
                       console.log("sendClicked fetch error");
             // fail(errorThrown);
                  }); 
      },
      wireClick: function(){
          var self=this;
          var senderName=document.getElementById('senderName').value;
          var myuid= self.dispatcher.me.get('uid');
          var amount=self.amount;
          var point=self.point;
          
          if($('#senderName').val()==''){
              console.log('senderName is empty');
              document.getElementById('senderNameError').innerHTML='입금자명을 입력해주세요';
              return;
          }
          document.getElementById('senderNameError').innerHTML='';
          if(self.currency=='USD'){
              console.log('wireClick currency is USD');
              return;
          }
          console.log('wireClick from: '+senderName+'/'+myuid+' for '+amount);
          $.get('/wireRequest', { uid: myuid  , sender: senderName, amount: amount, point:point})
              .done(function(data) {
              console.log("wireClick post success");
              var msg='아래 계좌로 입금신청이 완료되었습니다.<br><br><table><tr><td>입금하실 금액</td><td>'+amount.toLocaleString()+' 원 ('+point+' 분)</td></tr><tr><Td>입금자명</td><td>'+senderName+'</td></tr><tr><Td>예금주</td><td>서정원</td></tr><tr><Td>은행명</td><td>KEB 하나은행</td></tr><tr><Td>계좌번호</td><td>258-18-22536-1</td></tr></table><Br>30분에서 최대 1일이내로 입금 확인 후 시간 충전해 드리겠습니다. ';

              document.getElementById('message').innerHTML=msg;
              //self.message=msg;
              document.getElementById('wireTransfer').disabled = true;
          })
              .fail(function(jqXHR, textStatus, errorThrown) {
                  console.log("wireClick post error");
             // fail(errorThrown);
             }); 
          /*
          self.model.save({},{
                        type: 'POST',
                        success: function (model, response) {
                            console.log("The model has been deleted in the server "+response.uid);
                        },
                         error: function (model, response) {
                           console.log("Something went wrong while deleting the model");
                              return;
                         }
                     });
                     */
      },
      
     planSelect: function(){
         var self=this;
         var plan=parseInt($('#purchaseDD').dropdown('get value'));
         
         document.getElementById('message').innerHTML='';
         switch(plan){
             case 0:
                 this.currency='KRW';
                 this.point=30;
                // this.amount=29000;
                 this.amount=12500;
                 break;
                 /*
             case 1:
                 this.currency='KRW';
                 this.point=100;
                 this.amount=104900;
                 break;
             case 2:
                 this.currency='KRW';
                 this.point=200;
                 this.amount=200000;
                 break;
                 
             case 3:
                 this.currency='KRW';
                 this.point=410;
                 this.amount=500000;
                 break;
                 */
            case 4:
                 this.currency='USD';
                 this.point=30;
                 this.amount=14;
                 break;
             case 5:
                 this.currency='USD';
                 this.point=60;
                 this.amount=25;
                 break;
             case 6:
                 this.currency='USD';
                 this.point=120;
                 this.amount=46;
                 break;
                 /*
             case 7:
                 this.currency='USD';
                 this.point=410;
                 this.amount=417;
                 break;  
                 */
         }
         
         $('#point').val(this.point);
         $('#amount').val(this.amount);
         
         if(plan<4){//원화결제
             document.getElementById("usdpay").style.display = "none";
             document.getElementById("krwpay").style.display = "block";
             document.getElementById('wireTransfer').disabled = false;
             document.getElementById('wireTransfer').value='₩'+this.amount.toLocaleString()+' 입금 신청';
         }else{//달러결제
             document.getElementById("krwpay").style.display = "none";
             document.getElementById("usdpay").style.display = "block";
             document.getElementById('display').disabled = false;
             document.getElementById('display').value='$'+this.amount+' 결제';
         }
         
         // document.getElementById("display").style.visibility = "visible";
          //document.getElementById('message').style.visibility = "hidden";
        //  document.getElementById('display').disabled = false;
         //document.getElementById('message').value='fdafdsa';
          
          console.log('PurchaseView: planSelect: '+plan+'/'+this.point+'/'+this.amount);     
               // this.updateView();
     },
    hide: function(){
         // this.remove();
        console.log('PurchaseView hide');
       // this.unbind();
        $(this.el).hide();
    }
  });

}(window, jQuery));
