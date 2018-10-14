/* -----------------------------------------------------------------------------------------------
 * Buddy List View
 * ----------------------------------------------------------------------------------------------*/
/* global jQuery, Backbone, _, log */
/* exported BuddyListView */

// Prevent leaking into global scope

!(function(exports, $, undefined) {
  
  //var language, session,name;
  exports.BuddyListView = Backbone.View.extend({

    className: 'panel panel-default',

    events: {
      'click #invite-button': 'inviteButtonClicked',
      'click #invite-button-free': 'inviteButtonFreeClicked',
      'click #inviteChat-button': 'inviteChatButtonClicked',
      'click #inviteChat-offline': 'inviteChatButtonClicked_offline',
    //  'click #profile-view-other': 'view',
    //  'click #profile-view-other-offline': 'viewoffline',
      'click .buddy': 'view',
      'click .buddy2': 'viewoffline',
      'click #language-option': 'languageClicked',
      'click #area-option': 'areaClicked',
      'change input#searchInput' : 'searchClicked'
      //'click .msgButton': 'sendClicked'
    },
  //  subjects: ['Math', 'Science', 'English','Foreign Language', 'Coaching','Programming','기타','Social Science'],
    //  subjects: ['SAT', 'SAT2', 'TOEFL','TOEIC', 'GMAT','LSAT','GRE','ENGLISH','Spanish','Chinese','French','Italian','German','Japanese','Social Science','Math','Miscellaneous',
     //           'Biology','Chemistry','Physics','Consulting','Programming'],
    initialize: function(options) {
      var self=this;
      //console.log('BuddyListView: initialize()');
      if (!options.dispatcher) {
        log.error('BuddyListView: initialize() cannot be called without a dispatcher');
        return;
      }
      this.dispatcher = options.dispatcher; //App
      this.chattingModalView=  this.dispatcher.chattingModalView; 
      this.dispatcher.on('userAvailability', this.userAvailabilityChanged, this);
   
      this.offlineCollection=new OfflineList;//JW
      this.allOffCollection=  new OfflineList;  

      this.listenTo(this.collection, 'add remove change:available', this.before_render);  
     // this.listenTo(this.offlineCollection, 'add remove change:available', this.render); //resource error...
     
      this.allowedToInvite = true;
      this.subject='All';//JW
      this.area='All';
      this.subjectName='전과목';//JW
      this.areaName='전지역';
      this.subjectHtml='';
      this.areaHtml='';
        
      this.name='';
      this.filtered=false;//JW
      this.loggedIn=false;  //JW  
      this.subjects=null;
      
     
      
        /*
      $.getScript("/semantic/components/popup.min.js");
      $.getScript("/semantic/components/search.min.js");
      */
      $.getScript("/semantic/semantic.min.js");
      //this.listenTo(this.loggedIn, 'change', this.render);  
     
    },

    template: _.template($('#tpl-buddy-list').html()),
    
     findAllofflineUser: function(uid){
        return this.allOffCollection.get(uid);
    },
    findOfflineUser: function(uid){
        return this.offlineCollection.get(uid);
    },
    findOnlineUser: function(uid){
        return this.collection.get(uid);
    },
    languageClicked: function(event){
      var target=$(event.currentTarget);
      
      this.subject=target.attr('hr');
      this.subjectName='전과목';
        
      for(var i=0;i<this.subjects.length;i++){
          if(this.subject==this.subjects[i].id  ){
              this.subjectName=  this.subjects[i].subject;  
              break;
          }
      }
      
      console.log('languageClicked: '+target.attr('hr')+'/'+this.subject+'/'+this.subjectName);
        
      if(this.subject=="All"){
          console.log('filterByLanguage all: '+this.subject);
          this.filtered=false;
      }else    
          this.filterBy(this.subject);
      this.render();
    },
    areaClicked: function(event){
      var target=$(event.currentTarget);
      
      this.area=target.attr('data-value');//for offline teacher filtering
      this.areaName= '전지역';
      for(var i=0;i<this.areas.length;i++){
          if(this.area==this.areas[i].id  ){
              this.areaName=  this.areas[i].name;  
              break;
          }
      }
      console.log('areaClicked: '+target.attr('data-value')+'/'+this.area+'/'+this.areaName);
        /* //for online teacher filtering
      if(this.area=="전지역"){
          console.log('filterByLanguage all: '+this.area);
          this.filtered=false;
      }else    
            this.filterByArea(this.area);*/
        
      this.render();
    },
    filterByArea: function(keyword){
        var self=this;
        console.log('filterByArea: '+keyword);
       
        var selected = new BuddyList([], { dispatcher: this.dispatcher });
        var matcher = function( model ) { 
            return model.matchArea(self.subject,self.name);
        };
        //  console.log('selected before reset:'+selected.toJSON()+'/'+this.collection.toJSON());
        selected.reset( this.collection.filter(matcher) );
         // console.log('selected after reset:'+selected.toJSON());
        this.filteredCollection=selected; 
        this.filtered=true;
      },
    filterBy : function(keyword){
        var self=this;
        console.log('filterBy: '+keyword);
       
        var selected = new BuddyList([], { dispatcher: this.dispatcher });
        var matcher = function( model ) { 
            return model.match(self.subject,self.name);
        };
        //  console.log('selected before reset:'+selected.toJSON()+'/'+this.collection.toJSON());
        selected.reset( this.collection.filter(matcher) );
         // console.log('selected after reset:'+selected.toJSON());
        this.filteredCollection=selected; 
        this.filtered=true;
      },
      
    update: function() {
      this.collection.comparator = function(model) {
          return -model.get('rate');
      }

     // call the sort method
      this.collection.sort();
    },
    loginStatus: function(status){   
        console.log('loginStatus: '+status);
        this.loggedIn=status;
        
        if(status){
             console.log('loginStatus online ');
        }else{
            this.hide();//why not working?
            console.log(' loginStatus offline ');
        } 
    },
      
    before_render: function(){
      console.log('BuddyListView before_render: ');
      var self=this;
      
      window.setTimeout(function(){
          self.render();
        /*$('.ui.popup').popup();
          $('#inviteChat-button').popup();
          $('.ui.search').search();*/
                                  
        }, 1000);   // to wait for mongodb to update status change 
    },    
    getSubjects: function(){
        var self=this;
        var i=0;
        var html='';
        $.get('/subjects', {  })
            .done(function(data) {
                var size=data.subjects.length;
                console.log('BuddyListView getSubjects size: '+size);
                self.subjects=data.subjects; //to be used in ProfileView and ChatView
                  
                while(i < size-1){
                    html+='<div class="item"><i class="dropdown icon"></i>'+data.subjects[i].category+'<div class="menu">';
                    do{
                        html+='<div class="item" hr="'+data.subjects[i].id+'" id="language-option">'+ data.subjects[i].subject+'</div>';
                        i++;
                    }while(data.subjects[i-1].category==data.subjects[i].category);
                    html+=' </div></div>'; 
                }
            
                html+='<div class="item" hr="'+data.subjects[i].id+'" id="language-option">'+ data.subjects[i].subject+'</div>';
                //Miscellaneous
              
                self.subjectHtml=html;
              //console.log(  html);
          })
            .fail(function(jqXHR, textStatus, errorThrown) {
              console.log('BuddyListView: getSubjects failed', errorThrown);
             // fail(errorThrown);
            }); 
    },
    getAreas: function(){
        var self=this;
        var i=0;
        var html='';
        $.get('/areas', {  })
            .done(function(data) {
                self.areas=data.areas; //to be used in ProfileView
                var len=self.areas.length;
                console.log('BuddyListView getAreas: '+self.areas+'/'+len);
                
                html='<div class="item"><i class="dropdown icon"></i>'+self.areas[i].area+'<div class="menu">';
                for(i=0;i<5;i++)
                    html+='<div class="item" data-value="'+self.areas[i].id+'" id="area-option">'+ self.areas[i].name+'</div>';
                html+=' </div></div>'; 
             
                html+='<div class="item"><i class="dropdown icon"></i>'+self.areas[i].area+'<div class="menu">';
                for(i=5;i<11;i++)
                    html+='<div class="item" data-value="'+self.areas[i].id+'" id="area-option">'+ self.areas[i].name+'</div>';
                html+=' </div></div>'; 
            
                 html+='<div class="item"><i class="dropdown icon"></i>'+self.areas[i].area+'<div class="menu">';
                for(i=11;i<15;i++)
                    html+='<div class="item" data-value="'+self.areas[i].id+'" id="area-option">'+ self.areas[i].name+'</div>';
                html+=' </div></div>'; 
            
                 html+='<div class="item"><i class="dropdown icon"></i>'+self.areas[i].area+'<div class="menu">';
                for(i=15;i<20;i++)
                    html+='<div class="item" data-value="'+self.areas[i].id+'" id="area-option">'+ self.areas[i].name+'</div>';
                html+=' </div></div>'; 
            
                html+='<div class="item" data-value="'+self.areas[i].id+'" id="area-option">'+ self.areas[i].name+'</div>';
                i++; html+='<div class="item" data-value="'+self.areas[i].id+'" id="area-option">'+ self.areas[i].name+'</div>';
                i++; html+='<div class="item" data-value="'+self.areas[i].id+'" id="area-option">'+ self.areas[i].name+'</div>';
            
                self.areaHtml=html;
        })
         .fail(function(jqXHR, textStatus, errorThrown) {
              console.log('BuddyListView: getAreas failed', errorThrown);
             // fail(errorThrown);
            }); 
    },
    clearPopup: function(){
        console.log('BuddyListView clearPopup');
        $('.ui.button').popup('destroy');
        $('.icon').popup('destroy');
        $('.popup').popup('destroy');  
    },
    initPopup: function(){
        console.log('BuddyListView initPopup');
        $('.ui.button').popup({variation: 'inverted'});
        $('.icon').popup({variation: 'inverted'});
        $('.popup').popup({variation: 'inverted'});
    }, 
    render: function() {
     // this.update();    
     //   this.uidUpdate();
      var status=this.dispatcher.me.get('status');
      console.log('BuddyListView render: '+status);
      if(status === 'chatting'){    
          this.clearPopup();
          return;
      }
        
      $(this.el).show(); //recquired
      if(this.filtered==false)
         this.filteredCollection=this.collection;
     
      var self=this;
      console.log("offlineCollection before fetch : "+this.dispatcher.me.get('uid')+'/'+this.subject);
      //this.offlineCollection.getUsersInfo(self);
      self.getSubjects(); 
      //self.getAreas();
        
      $.get('/alloffUsers', { })
            .done(function(data) {
            
              self.allOffCollection.set(data);
             
              console.log('BuddyListView: getAllUsersInfo done ');
           
              //success();
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
              console.log('BuddyListView: getAllUsersInfo failed', errorThrown);
             // fail(errorThrown);
            });
      //$.get('/allusers', { name: self.name, subject:  self.subject, area: self.area, id:self.dispatcher.me.get('uid') })
        $.get('/allusers', { name: self.name, subject:  self.subject, id:self.dispatcher.me.get('uid') })
          .done(function(data) {
              
              self.offlineCollection.set(data);//necessary?
              console.log('BuddyListView: get allusers done '+data+'/'+self.offlineCollection);
              self.$el.html(self.template({
                      subject:self.subjectName,
                      area:self.areaName,
                      subjects: self.subjectHtml,
                      areas: self.areaHtml,
                      loggedIn: self.loggedIn,
                      users: self.filteredCollection.toJSON(),
                      offlineUsers: self.offlineCollection.toJSON()
                  }));
            // $('#inviteChat-offline').popup();
              
              self.initPopup();
              $('#nameSearch').search();
          
          /*  $('.ui.search').search();*/
              self.name='';
              //success();
              //return self;
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
              console.log('BuddyListView: Update failed', errorThrown);
             // fail(errorThrown);
            });    
   
      if (!this.allowedToInvite) {
        this.$('.invite-button').prop('disabled', true);
      }
      return this;
    },

    hide: function(){
         // this.remove();
        console.log('BuddyListView hide');
       // this.unbind();
        $(this.el).hide();
    },
        
    inviteButtonClicked: function(event) {
      var self=this,
          index,
          remoteUser;

      index = this.$('.buddy').index($(event.currentTarget).parents('.buddy'));
      remoteUser = this.collection.at(index);
      console.log( 'inviteButtonClicked index: '+index);
      if (index === -1 || !remoteUser) {
        log.warn('BuddyListView: inviteButtonClicked remote user not found');
        return;
      }
        self.dispatcher.trigger('inviteRemoteUser', remoteUser);
      
      //this.dispatcher.profileView.hide();//JW
      //this.hide();//JW
      //this.dispatcher.chatView.render().$el.appendTo('.content-right'); //JW
    },
    inviteButtonFreeClicked: function(event){
      var self=this,
          index,
          remoteUser;

      index = this.$('.buddy').index($(event.currentTarget).parents('.buddy'));
      remoteUser = this.collection.at(index);
      console.log( 'inviteButtonFreeClicked index: '+index);
      if (index === -1 || !remoteUser) {
        log.warn('BuddyListView: inviteButtonFreeClicked remote user not found');
        return;
      }
      self.dispatcher.trigger('inviteRemoteUserFree', remoteUser);   
    },
    inviteChatButtonClicked: function(event) {
      var index,
          remoteUser,
          uid;

      index = this.$('.buddy').index($(event.currentTarget).parents('.buddy'));
      remoteUser = this.collection.at(index);
      console.log( 'inviteChatButtonClicked index: '+index);
      if (index === -1 || !remoteUser) {
        log.warn('BuddyListView: inviteButtonClicked remote user not found');
        return;
      }
      uid=  remoteUser.get('uid');
      if(uid === undefined){    
          alert('에러가 발생하였습니다. 다시 접속 해주세요.(Code:103)');
          return;
      }
      console.log( 'inviteChatButtonClicked name/uid: '+remoteUser.get('name')+'/'+remoteUser.get('uid'));
    
      //this.dispatcher.trigger('inviteRemoteUser', remoteUser);
      //this.initializeSession();
      
      //this.dispatcher.profileView.hide();//JW
      //this.hide();//JW
      //this.dispatcher.chatView.render().$el.appendTo('.content-right'); //JW
        
      //this.dispatcher.chattingModalView.initializeSession();
      this.chattingModalView.clicked(remoteUser);    
              
    },
      
    inviteChatButtonClicked_offline: function(event) {
      var index,
          remoteUser;

      index = this.$('.buddy2').index($(event.currentTarget).parents('.buddy2'));
      remoteUser = this.offlineCollection.at(index);//return UserModel
        console.log( 'inviteChatButtonClicked_offline index: '+index);
       if (index === -1 || !remoteUser) {
        log.warn('BuddyListView: inviteChatButtonClicked_offline remote user not found');
        return;
      }
      console.log( 'inviteChatButtonClicked-offline name/uid: '+remoteUser.get('name')+'/'+remoteUser.get('uid'));

      this.chattingModalView.clicked_offline(remoteUser);    
              
    },
      
    userAvailabilityChanged: function(isAvailable) {
      this.allowedToInvite = isAvailable;
      this.render();
    },
    
    view: function(event) { //JW
    
        var index,
            remoteUser,
            tempModel,
            uid;

     // alert('BuddyListView view');
     // index = this.$('.buddy').index($(event.currentTarget).parents('.buddy'));
        index = this.$('.buddy').index($(event.currentTarget));
        remoteUser = this.collection.at(index);
        console.log( 'BuddyListView View clicked index: '+index);
        if (index === -1 || !remoteUser) {
            log.warn('BuddyListView: inviteButtonClicked remote user not found');
            return;
      }
      //tempModel= this.dispatcher.profileModel;   
      //tempModel.set('uid', remoteUser.get('uid')); 
      
      //this.dispatcher.chatView.hide(); //not working...??
      uid=  remoteUser.get('uid');
      if(uid === undefined){
          alert('에러가 발생하였습니다. 다시 접속 해주세요.(Code:103)');
          return;
      }
        
      //this.dispatcher.purchaseView.hide(); 
      //this.dispatcher.chatView.hide();
      this.dispatcher.profileView.fetchProfile(uid);    
      //this.dispatcher.profileView.$el.appendTo('.content-right'); 
      //this.dispatcher.buddyListView.render().$el.appendTo('.sidebar-left');
      //alert(remoteUser.get('uid'));
        //this.chattingModalView.doSome();
     
    },
    
    viewoffline: function(event) { //JW
        var index,
              remoteUser,
              tempModel,
              offlineUid;
     
    // index = this.$('.buddy2').index($(event.currentTarget).parents('.buddy2'));
        index = this.$('.buddy2').index($(event.currentTarget));
        remoteUser=this.offlineCollection.at(index);
        console.log('viewoffline clicked index: '+index);
        if (index === -1 || !remoteUser) {
            log.warn('BuddyListView: viewoffline remote user not found');
            return;
          }
        offlineUid=remoteUser.get('uid');
        console.log('uid: '+offlineUid +' name: '+remoteUser.get('name'));
    
     // tempModel= this.dispatcher.profileModel;   
      //tempModel.set(tempModel.defaults);    
    //  tempModel.set('uid', offlineUid); 
      
   
     // this.dispatcher.purchaseView.hide(); 
     // this.dispatcher.chatView.hide();//not working...??
        this.dispatcher.profileView.fetchProfile(remoteUser.get('uid'));    
      //this.dispatcher.profileView.$el.appendTo('.content-right');      

      //this.dispatcher.buddyListView.render().$el.appendTo('.sidebar-left');
      //alert(remoteUser.get('uid'));
    },
    searchClicked: function(evt){
         var val = $(evt.target).val();
         this.name=val;
         console.log('BuddyListView search entered: '+val); 
         this.filterBy(val);
         this.render();
    }

  });

}(window, jQuery));
