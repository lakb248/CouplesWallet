(function(win,undefined){
	var meng = angular.module('meng',['ionic','ui.router']) ;
	//regex for input
	var REGEX = {
		EMPTY : /(^\s+)|(\s+$)/
	} ;
	//application state
	var STATE = {
		SHOW_NOTE : {
			_state : 'show_note' ,
			_index : -1
		}
	} ;
	//api url
	var URL = {
		NOTE : '/api/note' ,
		NOTES : '/api/notes'
	} ;
	//view Template
	var TEMPLATE = {
		INDEX_HEADER : '<div class="title">萌记</div>' ,
		NOTE_HEADER : '<a class="button button-icon icon ion-ios-arrow-left" on-tap="go('+"'index'"+')"></a>' +
					  '<div class="title">记录</div>'+
					  '<a class="button button-icon icon ion-ios-plus-empty" on-tap="go(' + "'add_note'"+ ')"></a>' ,
		ADD_NOTE_HEADER : '<a class="button button-icon icon ion-ios-arrow-left" on-tap="go('+"'note'"+')"></a>' +
						  '<div class="title">记录</div>' ,
		SHOW_NOTE_HEADER : '<a class="button button-icon icon ion-ios-arrow-left" on-tap="go('+"'note'"+')"></a>' +
						   '<div class="title">记录</div>'+
						   '<a class="button button-icon icon ion-ios-compose-outline" on-tap="go(' + "'edit_note'"+ ')"></a>' ,
		EDIT_NOTE_HEADER : '<a class="button button-icon icon ion-ios-arrow-left" on-tap="go('+"'note'"+')"></a>' +
						   '<div class="title">记录</div>',
		DELETE_ICON : '<a class="button button-icon icon ion-android-cancel"></a>'
 	} ;
	//notes cache
	var notes = null ;
	//route config
	meng.config(function($stateProvider,$urlRouterProvider){
		$urlRouterProvider.otherwise('/index') ;
		$stateProvider
			.state('index',{
				url:'/index',
				views:{
					'header':{template:TEMPLATE.INDEX_HEADER},
					'container':{templateUrl:'views/main.html'}
				}
			})
			.state('wallet',{
				url:'/wallet',
				views:{
					'header':{templateUrl:'views/wallet_header.html'},
					'container':{templateUrl:'views/wallet.html'}
				}
			})
			.state('task',{
				url:'/task',
				views:{
					'header':{templateUrl:'views/task/task_header.html'},
					'container':{templateUrl:'views/task/task.html'}
				}
			})
			.state('note',{
				url:'/note',
				views:{
					'header':{template:TEMPLATE.NOTE_HEADER},
					'container':{
						templateUrl:'views/note/note_list.html',
						controller:'noteController'
					}
				}
			})
			.state('add_note',{
				url:'/note/add',
				views:{
					'header':{template:TEMPLATE.ADD_NOTE_HEADER},
					'container':{
						templateUrl:'views/note/add_note.html',
						controller:'addNoteController'
					}
				}
			})
			.state('show_note',{
				url:'/note/show' ,
				views : {
					'header' : {template:TEMPLATE.SHOW_NOTE_HEADER} ,
					'container':{
						templateUrl:'views/note/show_note.html',
						controller:'showNoteController'
					}
				}
			})
			.state('edit_note',{
				url:'/note/edit' ,
				views : {
					'header' : {
						template:TEMPLATE.EDIT_NOTE_HEADER,
						controller:'editNoteController'
					} ,
					'container':{
						templateUrl:'views/note/edit_note.html',
						controller:'editNoteController'
					}
				}
			});
	}) ;

	/***************************Controller*****************************/
	var mengController = meng.controller(
		'mengController',
		['$scope','$http','$state',
			function($scope,$http,$state){

				$scope.go = function(state,index){
					if(state === STATE.SHOW_NOTE._state){
						//if state equals to 'show_note',cache the index
						STATE.SHOW_NOTE._index = index ;
						$state.go(state) ;
					}else{
						$state.go(state) ;
					}
				} ;
			}]
	) ;
	//the controller of note view
	var noteController = meng.controller(
		'noteController',
		['$scope','$http','$state','NoteService',
			function($scope,$http,$state,NoteService){
				//todo loading animation
				//load notes from server or local cache
				if(notes){
					console.log('load from local') ;
					$scope.notes = notes ;
				}else{
					NoteService.getNotes(function(data){
						$scope.notes = notes = data.notes ;
					},function(error){
						console.log(error) ;
					}) ;
				}
				//show delete button when the note is hold
				$scope.showDelete = function(index,event){
					//remove all shown delete buttons
					angular.element(document.querySelector('.ion-android-cancel')).remove() ;
					//get the hold button
					var card = event.srcElement ;
					//init the delete button
					var iconEle = angular.element(TEMPLATE.DELETE_ICON) ;
					//set the position of the delete button
					iconEle.css('position','absolute') ;
					iconEle.css('top',card.offsetTop - 20 + 'px') ;
					iconEle.css('left',card.offsetLeft + card.offsetWidth - 20 + 'px') ;
					iconEle.css('z-index',99) ;
					iconEle.css('width','20px') ;
					iconEle.css('height','20px') ;
					iconEle.on('click',function(){
						NoteService.deleteNote(notes[index].objectId,function(data){
							if(data.status === 1){
								//delete the note from local cache , then remove all delete buttons
								notes.splice(index,1) ;
								angular.element(document.querySelector('.ion-android-cancel')).remove() ;
							}else{
								console.log(data.message) ;
							}
						},function(error){
							console.log(error) ;
						}) ;
					}) ;
					//add the delete button to the content
					angular.element(document.getElementById('content')).append(iconEle) ;
				} ;
			}]
	) ;
	//the controller of add note view
	var addNoteController = meng.controller(
		'addNoteController',
		['$scope','$http','$state','NoteService','UtilService',
			function($scope,$http,$state,NoteService,UtilService){
				$scope.title = '' ;
				$scope.content = '' ;
				$scope.addNote = function(){
					var title = $scope.title , content=$scope.content ;
					//check the input
					if(title.replace(REGEX.EMPTY,'').length === 0){
						UtilService.showAlert('臭蛋蛋说','别忘了输入标题!') ;
					}else if(content.replace(REGEX.EMPTY,'').length === 0){
						UtilService.showAlert('臭蛋蛋说','连内容都没写就完成啦!!') ;
					}else if(content.length < 50){
						UtilService.showAlert('臭蛋蛋说','内容太短了，不要偷懒!!!') ;
					}else{
						NoteService.addNote(title,content,function(data){
							if(data.status === 1){
								//add the note to the local cache
								notes.unshift(data.note) ;
								//return to the note view
								$state.go('note') ;
							}else{
								console.log(data.message) ;
							}
						},function(data){
							console.log(data) ;
						}) ;
					}
				}
			}]
	) ;
	//the controller of show note view
	var showNoteController = meng.controller(
		'showNoteController',
		['$scope',
		function($scope){
			//get the index in the application state,then show the note
			var index = STATE.SHOW_NOTE._index ;
			$scope.note = notes[index] ;
		}]
	) ;
	var editNoteController = meng.controller(
		'editNoteController',
		['$scope','$state','NoteService','UtilService',
		function($scope,$state,NoteService,UtilService){
			//get note from the local cache
			var note = notes[STATE.SHOW_NOTE._index] ;
			$scope.note = {
				title : note.title ,
				content : note.content
			} ;
			$scope.updateNote = function(){
				var title = $scope.note.title , content=$scope.note.content ;
				//check the input
				if(title.replace(REGEX.EMPTY,'').length === 0){
					UtilService.showAlert('臭蛋蛋说','别忘了输入标题!') ;
				}else if(content.replace(REGEX.EMPTY,'').length === 0){
					UtilService.showAlert('臭蛋蛋说','连内容都没写就完成啦!!') ;
				}else if(content.length < 50){
					UtilService.showAlert('臭蛋蛋说','内容太短了，不要偷懒!!!') ;
				}else{
					NoteService.updateNote(note.objectId,title,content,function(data){
						if(data.status === 1){
							//update the note in the local cache
							notes[STATE.SHOW_NOTE._index] = data.note ;
							//go to the show note view
							$state.go('show_note') ;
						}else{
							console.log(data.message) ;
						}
					},function(data){
						console.log(data) ;
					}) ;
				}
			} ;
		}]
	);
	/***************************Service*****************************/
	//NoteService
	meng.factory('NoteService',['$http',function($http){
		return {
			addNote : function(title,content,success,error){
				$http.post(
					URL.NOTE,
					{'title':title,'content':content})
					.success(success)
					.error(error);
			} ,
			getNotes : function(success,error){
				$http.get(URL.NOTES).success(success).error(error) ;
			} ,
			updateNote : function(id,title,content,success,error){
				$http.put(
					URL.NOTE + '/' + id,
					{title:title,content:content}
				).success(success).error(error) ;
			} ,
			getNoteById : function(id,success,error){
				$http.get(URL.NOTE + '/' + id).success(success).error(error) ;
			} ,
			deleteNote : function(id,success,error){
				$http.delete(URL.NOTE + '/' + id).success(success).error(error) ;
			}
		} ;
	}]) ;
	//UtilService
	//showAlert:show a alert panel according to the title and content
	meng.factory('UtilService',['$ionicPopup',function($ionicPopup){
		return {
			showAlert : function(title,content){
				$ionicPopup.alert({
					title : title ,
					template : content
				}) ;
			}
		} ;
	}]) ;
	//exports the module
	win.meng = meng ;
}(window)) ;