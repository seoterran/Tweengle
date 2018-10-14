/* -----------------------------------------------------------------------------------------------
 * Connect Modal View
 * ----------------------------------------------------------------------------------------------*/
/* global Backbone, _, log, alert */
/* exported ConnectModalView */

// Prevent leaking into global scope
!(function(exports, undefined) {

  exports.ChattingModalView = Backbone.View.extend({

    events: {
    //  'submit #chat-form': 'connect',
      'click #send-btn': 'connect',
        'click #close-btn':'close',
       // 'keyup': 'processKey'
    },
      /*
    processKey: function(e) { 
      if(e.which === 13) // enter key
         console.log('enter key');
    },
    */
   // _showDone: false,
  //  _waitingForShow: [],
    initialize: function(options) {
         console.log('ChattingModalView initialize');
      if (!options.dispatcher) {
        log.error('ConnectModalView: initialize() cannot be called without a dispatcher');
        return;
      }
        this.dispatcher=options.dispatcher;
        this.remoteUser=null;
   },
    clicked: function(remoteUser)
    {
        this.remoteUser=remoteUser;
        this.receiver=remoteUser.connection;
        
        console.log('ChattingModalView clicked: '+this.remoteUser.connection);
        javascript:register_popup(this.model.get('uid'),this.model.get('name'),remoteUser.get('uid'), remoteUser.get('name'),this);
    },
    clicked_offline: function(remoteUser) {
        //this.remoteUser=remoteUser;
        this.receiver=0;
        
        console.log('ChattingModalView clicked_offline');
        javascript:register_popup(this.model.get('uid'),this.model.get('name'),remoteUser.get('uid'), remoteUser.get('name'),this);
    },
    clicked_offline2: function(uid,name) {
        //this.remoteUser=remoteUser;
        this.receiver=0;
        
        console.log('ChattingModalView clicked_offline');
        javascript:register_popup(this.model.get('uid'),this.model.get('name'),uid, name,this);
    },
    closeAll: function(){
        console.log('ChattingModalView closeAll');
         javascript:close_Allpopup();//why not working?
    },
    initializeSession: function() {
        //console.log('ChattingModalView initializeSession');
        session = this.dispatcher.presenceSession;
        var token=this.dispatcher.me.get('token');
        // Subscribe to a newly created stream
        /*
        session.on('streamCreated', function(event) {
          session.subscribe(event.stream, 'subscriber', {
            insertMode: 'append',
            width: '100%',
            height: '100%'
          });
        });
      
        session.on('sessionDisconnected', function(event) {
          console.log('You were disconnected from the session.', event.reason);
        });
      
        // Connect to the session
        session.connect(token, function(error) {
          // If the connection is successful, initialize a publisher and publish to the session
            console.log('ChattingModalView session.connect');
              if (!error) {
                var publisher = OT.initPublisher('publisher', {
                  insertMode: 'append',
                  width: '100%',
                  height: '100%'
                }); 

                session.publish(publisher);
              } else {
                console.log('There was an error connecting to the session: ', error.code, error.message);
              }
           });
       */
           var self=this;
           session.on('signal:msg', function(event) {
               console.log('ChattingView session.on: '+ event.data+'/'+event.name);
               var uid=event.data.split('---')[0];
               var name=event.data.split('---')[1];
               var msg=event.data.split('---')[2];
               var myid=self.model.get('uid');
               var myname=self.model.get('name');
               self.receiver=event.from;
              
               javascript:register_popup(myid,myname,uid, name,self,msg);
       });
    },
      /*
    close: function(event) {
        console.log('chat window close');
        this.hide();
    },
    close2: function() {
        console.log('chat window close2');
        this.hide();
    }, */
      
    sendEmail: function(){
       var receiverID=this.content.get('uid2'); //receiver's ID
       var name =    this.content.get('name1'); //myname, sender
       var name2 = this.content.get('name2'); //receiver
        
       console.log('sendEmail: '+name+'/'+receiverID);
       $.get('/email', { uid: receiverID, sender: name, receiver:name2})
            .done(function(data) {
              //self.offlineCollection.set(data);
              console.log('ChattingModalView get email: done '+data+'/'+data.email+'/'+data.sender+'/'+data.receiver);
             // email=data.email;
              //success();
              //return self;
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
              console.log('ChattingModalView get email: failed', errorThrown);
             // fail(errorThrown);
            });      
  }
},
{//static
    connect: function(myid,myname,inputdata,element,receiver,id) {
      log.info('ConnectModalView: connect');
        /*
      if (!this.dispatcher.presenceSession) {
        log.warn('ConnectModalView: ignoring connect() because presenceSession is not initialized');
        return;
      }
      */
      console.log('connect: '+inputdata+'/'+receiver);
      //element.disabled=true;
      element.setAttribute('readonly', 'readonly');
      //var messagewithname=this.model.get('uid')+'---'+ this.model.get('name') + ':'+inputdata;
      var messagewithname=myid+'---'+myname+'---'+inputdata;
      //var self=this;
      if(receiver!=0){
          session.signal({
                type: 'msg',
                data: messagewithname,
                to: receiver,
                //name :this.model.get('name')  //working??

              }, function(error) {
                if (!error) {
                    console.log('ChattingModalView: signal sent :'+messagewithname);
                    element.value='';//working?
                    updateInput(id,'mine',inputdata);

                } else{
                    console.log('ChattingModalView:  error: '+error.message+'/'+messagewithname);
                    alert('상대방이 로그아웃하여 메시지를 전달할 수 없습니다');
                 }
               element.removeAttribute("readonly");
                
              });
      }else{
          element.value='';
          updateInput(id,'mine',inputdata);
         //element.disabled=false;
          element.removeAttribute("readonly");
          /*
          console.log('session.signal id: '+id+'/'+history+'/'+msgHistory);
          var history='history'+id;
          var msgHistory=document.getElementById(history);
          var mmm = document.createElement('p');
          mmm.className='mine';
          mmm.innerHTML =inputdata;
          msgHistory.appendChild(mmm);
          mmm.scrollIntoView();
          */
          
      }
    }      
}//static
);//exports.ChattingModalView = Backbone.View.extend

            //this function can remove a array element.
  Array.remove = function(array, from, to) {
                var rest = array.slice((to || from) + 1 || array.length);
                array.length = from < 0 ? array.length + from : from;
                return array.push.apply(array, rest);
            };
       
            //this variable represents the total number of popups can be displayed according to the viewport width
  var total_popups = 0;
           
            //arrays of popups ids
  var popups = [];
  var receivers =[];   
  var receiver_names=[];
  var g_myid;
  var g_myname;
  var g_self;
            //this is used to close a popup
           
            function close_popup(id){
                for(var iii = 0; iii < popups.length; iii++){
                    if(id == popups[iii]){
                        console.log('close: '+id);
                        var receiver=receivers[iii];
                        var receiver_name=receiver_names[iii];
                        
                        Array.remove(popups, iii);
                        Array.remove(receivers, iii);
                        Array.remove(receiver_names,iii);
                        document.getElementById(id).style.display = "none";
                        if(receiver==0){ //chat with offline user
                            g_self.content.set('turnToRead', g_self.content.get('uid2'));
                            console.log('turnToRead set: '+g_self.content.get('uid2'));
                        }
                        else{
                            g_self.content.set('turnToRead', null);
                            console.log('turnToRead reset: ');
                        }
                        g_self.content.set({'content':document.getElementById('history'+id).innerHTML,
                                            'uid1':g_myid,
                                            'uid2':id,
                                            'name1':g_myname,
                                            'name2':receiver_name});
                        g_self.content.save({},{
                            type: 'PUT',
                            success: function (model, response) {
                                console.log("content save success: "+response.turnToRead);  
                                   //need code to send only when there is new message
                                if(response.turnToRead){
                                    window.setTimeout(function(){
                                                       g_self.sendEmail();
                                                    },1000); //send after 5 mins 300000
                                   }  
                                else{
                                    console.log('no email sent');
                                }
                            },
                            error: function (model, response) {
                                    console.log("content save error");
                            }
                        });
                       
                        calculate_popups();
                        return;
                    }
                }  
            }
            function close_Allpopup(){
                for(var iii = 0; iii < popups.length; iii++){
                    if(document.getElementById(iii)){
                        console.log('close: '+iii)
                        Array.remove(popups, iii);
                        Array.remove(receivers, iii);
                        Array.remove(receiver_names,iii);
                        document.getElementById(iii).style.display = "none";
                        calculate_popups();
                    }
                }  
            }
            function updateInput(id,classname,inputMessage){
                console.log('updateInput: '+inputMessage);
                var history='history'+id;
                var msgHistory=document.getElementById(history);
                
                //document.getElementById('history'+id);
              //  $('#history'+id).scrollTop(450);
                if(!inputMessage){
                    console.log('no new input');
                    return;
                }
                
                var mmm = document.createElement('p');
                mmm.className=classname;
                mmm.innerHTML =inputMessage;
                msgHistory.appendChild(mmm);
                mmm.scrollIntoView();          
            }
       
            //displays the popups. Displays based on the maximum number of popups that can be displayed on the current viewport width
            function display_popups() {
                var right = 1000;
               
                var iii = 0;
                for(iii; iii < total_popups; iii++){
                    if(popups[iii] != undefined){
                        
                        var id=popups[iii];
                        console.log('display_popups: '+popups.length+'/'+popups[iii]+'/'+document.getElementById('closePopup'+popups[iii]));
                        var element = document.getElementById(popups[iii]);
                        if(element){
                            element.style.right = right + "px";
                            right = right - 320;
                            element.style.display = "block";
                            
                            //console.log('display_popups btnID: '+btnID);
                            //document.getElementById(btnID).addEventListener('click', handleEvent(id,id));
                            var inputID='msgTxt'+id;
                            document.getElementById(inputID).onkeypress= function(event) {
                                if(event.which == 13) {
                                        var id=event.currentTarget.id.split('msgTxt')[1];
                                        console.log('enter pressed id: '+id); 
                                        
                                        var msgTxt= event.currentTarget.id;
                                        var msg=document.getElementById(msgTxt).value;
                                        if(msg.length==0){
                                            console.log('input length 0');
                                            return;
                                        }
                                        
                                        var receiver;
                                        var iii = 0;
                                        for(iii; iii < total_popups; iii++){ 
                                                if(id==popups[iii]) {
                                                     receiver=receivers[iii];
                                                     console.log('send-btn receiver: '+receiver);
                                                     break;
                                                 }    
                                            }
                                        
                                        ChattingModalView.connect(g_myid,g_myname,msg,document.getElementById(msgTxt),receiver,id);
                                       
                                    }
                             }
                            
                            var closeID='closePopup---'+id;
                            document.getElementById(closeID).onclick = function(event) { 
                                console.log('send-btn clicked: '+event.currentTarget.id);
                                var id=event.currentTarget.id.split('---')[1];
                                close_popup(id);
                            }
                            var viewID='view---'+id;
                            document.getElementById(viewID).onclick= function(event) {
                                console.log('view-btn clicked: '+event.currentTarget.id);
                                var id=event.currentTarget.id.split('---')[1];
                                
                                App.profileView.fetchProfile(id); 
                                
                            }
                       }
                   }
                }
                for(var jjj = iii; jjj < popups.length; jjj++){
                    
                    console.log('display_popups: popups.length/jjj '+popups.length+'/'+jjj);
                    var element = document.getElementById(popups[jjj]);
                    element.style.display = "none";
                }
            }
            
          
            //creates markup for a new popup. Adds the id to popups array.
            function register_popup(myid,myname,id, name,self,inputMessage)  {
                g_myid=myid;
                g_myname=myname;
                g_self=self;
                for(var iii = 0; iii < popups.length; iii++)  {  
                    //already registered. Bring it to front.
                    if(id == popups[iii]) {
                        
                        console.log('register_popup: already registered.  bring it to front: '+id+'/'+inputMessage);
                        var temp=receivers[iii];
                        var temp_name=receiver_names[iii];
                        Array.remove(popups, iii);
                        Array.remove(receivers, iii);
                        Array.remove(receiver_names,iii);
                        popups.unshift(id);
                        receivers.unshift(temp);
                        receiver_names.unshift(temp_name);
                        
                      //  if(inputMessage)
                           updateInput(id,'theirs',inputMessage);
                        calculate_popups();
                        
                        document.getElementById('msgTxt'+id).focus();
                        return;
                    }
                }              
                console.log('register_popup: '+id+'/'+self.receiver);
                var element = '<div class="popup-box chat-popup" id="'+ id +'" value='+self.receiver+'>';
                element = element + '<div class="popup-head">';
                element = element + '<div class="popup-head-left">&nbsp;&nbsp;&nbsp;<span class="glyphicon glyphicon-comment"></span> <a href="#" title="프로필보기" id="view---'+id+'">'+ name +'</a></div>';
                element = element + '<a href="#" style="top:5px;" class="pull-right popup-head-right" title="닫기" id="closePopup---'+id+'"><span class="glyphicon glyphicon-remove"></span> </a>';   
                element = element + '<div style="clear: both"></div></div>';//popup-head
                element = element + '<div class="popup-messages" id="history'+id+'"></div><div class="popup-bottom input-group">';
                element = element + '<input id="msgTxt'+ id+'" type="text" class="form-control input-sm msgTxt" placeholder="Type a message..." >';
              /*  
              element = element +' <span class="input-group-btn"><button type="button" id="send-btn---'+id+'" class="btn btn-default send-btn align-right">Send</button></span>';
              */
                    
                element = element +'</div></div>';
 
                //document.getElementsByTagName("body")[0].innerHTML = document.getElementsByTagName("body")[0].innerHTML + element; 
                document.getElementById("sidebar-chat").innerHTML = document.getElementById("sidebar-chat").innerHTML + element; 
                
                self.content=new ChatContentModel;
                self.content.set('uid1',myid);
                self.content.set('name1',myname);
                self.content.set('uid2',id);
                self.content.set('name2',name);
                //console.log("uid1: "+self.content.get('uid1')+'/'+self.content.get('uid2'));
                self.content.save({},{
                      type: 'POST', //why?
                      success: function (model,response) {
                          console.log("chat content loading success: "+model.get('name1')+'/'+model.get('name2')+'/'+ model.get('content')+'/'+inputMessage);
                          var history=document.getElementById('history'+id);
                          history.innerHTML=model.get('content');
                          history.scrollTop=4000;
                          //if(inputMessage)
                          updateInput(id,'theirs',inputMessage);
                      },
                      error: function (model,response) {
                          console.log("chat content loading error");
                      }
                  });
                //console.log("saved content: "+self.content.get('content'));
                //console.log("result html: "+ document.getElementById('history'+id).innerHTML);
                popups.unshift(id);
                receivers.unshift(self.receiver);
                receiver_names.unshift(name);
                
                calculate_popups();           
                document.getElementById('msgTxt'+id).focus();
            }
    
            //calculate the total number of popups suitable and then populate the toatal_popups variable.
            function calculate_popups(){
                
                var width = window.innerWidth;
                if(width < 540)
                {
                    total_popups = 0;
                }
                else
                {
                    width = width - 200;
                    //320 is width of a single popup box
                    total_popups = parseInt(width/320);
                }
                display_popups();         
            }
           
            //recalculate when window is loaded and also when window is resized.
            window.addEventListener("resize", calculate_popups);
            window.addEventListener("load", calculate_popups);
           
       
}(window));
