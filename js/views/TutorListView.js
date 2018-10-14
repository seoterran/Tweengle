/* -----------------------------------------------------------------------------------------------
 * Buddy List View
 * ----------------------------------------------------------------------------------------------*/
/* global jQuery, Backbone, _, log */
/* exported BuddyListView */

// Prevent leaking into global scope

!(function(exports, $, undefined) {
  
  //var language, session,name;
  exports.TutorListView = Backbone.View.extend({

    className: 'panel panel-default',

    events: {
      'click #invite-button': 'inviteButtonClicked',
      'click #inviteChat-button': 'inviteChatButtonClicked',
      'click #inviteChat-offline': 'inviteChatButtonClicked_offline',
      'click #profile-view-other': 'view',
      'click #profile-view-other-offline': 'viewoffline',
      'click #language-option': 'languageClicked',
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
    //  this.chattingModalView=  this.dispatcher.chattingModalView; 
    //  this.dispatcher.on('userAvailability', this.userAvailabilityChanged, this);
   
      this.offlineCollection=new OfflineList;//JW

    //  this.listenTo(this.collection, 'add remove change:available', this.before_render);  
     // this.listenTo(this.offlineCollection, 'add remove change:available', this.render); //resource error...
     
      this.allowedToInvite = true;
      this.subject='All';//JW
      this.name='';
      this.filtered=false;//JW
      this.loggedIn=false;  //JW  
      this.subjects=null;
      this.subjectHtml='';
        /*
      $.getScript("/semantic/components/popup.min.js");
      $.getScript("/semantic/components/search.min.js");
      */
      $.getScript("/semantic/semantic.min.js");
      //$.getScript("https://cdnjs.cloudflare.com/ajax/libs/bootstrap3-dialog/1.35.1/js/bootstrap-dialog.min.js");
      //this.listenTo(this.loggedIn, 'change', this.render);  
     
    },

    template: _.template($('#tpl-buddy-list').html()),
      
    findOfflineUser: function(uid){
        return this.offlineCollection.get(uid);
    },
    findOnlineUser: function(uid){
        return this.collection.get(uid);
    },
    languageClicked: function(event){
      var target=$(event.currentTarget);
      
      this.subject=target.attr('hr');
       
      console.log('languageClicked: '+target.attr('hr')+'/'+this.language);
        
      if(this.subject=="All"){
          console.log('filterByLanguage all: '+this.language);
          this.filtered=false;
      }else    
            this.filterBy(this.subject);
      this.render();
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
      
      window.setTimeout(function(){self.render();
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
                console.log('BuddyListView getSubjects: '+data.subjects);
                self.subjects=data.subjects; //to be used in ProfileView
            
                html='<div class="item"><i class="dropdown icon"></i>'+data.subjects[i].category+'<div class="menu">';
                for(i=0;i<11;i++)
                    html+='<div class="item" hr="'+data.subjects[i].id+'" id="language-option">'+ data.subjects[i].subject+'</div>';
                html+=' </div></div>'; 
                
                html+='<div class="item" hr="'+data.subjects[i].id+'" id="language-option">'+ data.subjects[i].subject+'</div>';//Math  
             
              
                i++; html+='<div class="item"><i class="dropdown icon"></i>'+data.subjects[i].category+'<div class="menu">';
                for(i=12;i<20;i++)
                    html+='<div class="item" hr="'+data.subjects[i].id+'" id="language-option">'+ data.subjects[i].subject+'</div>';
                html+=' </div></div>'; 

                html+='<div class="item" hr="'+data.subjects[i].id+'" id="language-option">'+ data.subjects[i].subject+'</div>';//Social Science
   
              
                i++; html+='<div class="item"><i class="dropdown icon"></i>'+data.subjects[i].category+'<div class="menu">';
                for(i=21;i<24;i++)
                    html+='<div class="item" hr="'+data.subjects[i].id+'" id="language-option">'+ data.subjects[i].subject+'</div>';
                html+=' </div></div>'; 
              
               html+='<div class="item" hr="'+data.subjects[i].id+'" id="language-option">'+ data.subjects[i].subject+'</div>';//Consulting  
                i++;html+='<div class="item" hr="'+data.subjects[i].id+'" id="language-option">'+ data.subjects[i].subject+'</div>';//Programming
               i++; html+='<div class="item" hr="'+data.subjects[i].id+'" id="language-option">'+ data.subjects[i].subject+'</div>';//Interview  
                i++;html+='<div class="item" hr="'+data.subjects[i].id+'" id="language-option">'+ data.subjects[i].subject+'</div>';//Accounting
             
                i++; html+='<div class="item"><i class="dropdown icon"></i>'+data.subjects[i].category+'<div class="menu">';
                for(i=28;i<31;i++)
                    html+='<div class="item" hr="'+data.subjects[i].id+'" id="language-option">'+ data.subjects[i].subject+'</div>';
                html+=' </div></div>'; 
            
                html+='<div class="item" hr="'+data.subjects[i].id+'" id="language-option">'+ data.subjects[i].subject+'</div>';
                //Miscellaneous
              
                self.subjectHtml=html;
              //console.log(  html);
          })
            .fail(function(jqXHR, textStatus, errorThrown) {
              console.log('BuddyListView: Update failed', errorThrown);
             // fail(errorThrown);
            }); 
    },
    render: function() {
     // this.update();    
     //   this.uidUpdate();
         console.log('BuddyListView render: ');
        
      $(this.el).show(); //recquired
      if(this.filtered==false)
         this.filteredCollection=this.collection;
     
      var self=this;
      console.log("offlineCollection before fetch : "+'/'+this.language);
      //this.offlineCollection.getUsersInfo(self);
        
      $.get('/alltutors', { name: self.name, subject:  self.subject })
            .done(function(data) {
              self.getSubjects();
              self.offlineCollection.set(data);//necessary?
              console.log('BuddyListView: get allusers done '+data+'/'+self.offlineCollection);
              self.$el.html(self.template({
                      subjects: self.subjectHtml,
                    //  loggedIn: self.loggedIn,
                     // users: self.filteredCollection.toJSON(),
                      offlineUsers: self.offlineCollection.toJSON()
                  }));
            // $('#inviteChat-offline').popup();
             $('.ui.card').popup({variation: 'inverted'});
             //$('.menu .item').tab();
          /*
              $('.ui.button').popup({variation: 'inverted'});
              $('.icon').popup({variation: 'inverted'});
              
          
              $('#nameSearch').search();
          */
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
        /*
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
      //console.log( 'inviteChatButtonClicked name/uid: '+remoteUser.get('name')+'/'+remoteUser.get('uid'));
    
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
      index = this.$('.buddy').index($(event.currentTarget).parents('.buddy'));
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
     
     index = this.$('.buddy2').index($(event.currentTarget).parents('.buddy2'));
     //   index = this.$('.buddy2').index($(event.currentTarget);
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
    */
    searchClicked: function(evt){
         var val = $(evt.target).val();
         this.name=val;
         console.log('BuddyListView search entered: '+val); 
         this.filterBy(val);
         this.render();
    }

  });

}(window, jQuery));
