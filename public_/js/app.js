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
		NOTES : '/api/notes',
        TASK : '/api/task' ,
        TASKS : '/api/tasks'
	} ;
	//view Template
	var TEMPLATE = {
		INDEX_HEADER : '<div class="title">萌记</div>'+
					   '<a class="button button-icon icon ion-navicon"></a>',
		//note headers
		NOTE_HEADER : '<a class="button button-icon icon ion-ios7-arrow-left" on-tap="go('+"'index'"+')"></a>' +
					  '<div class="title">日记</div>'+
					  '<a class="button button-icon icon ion-ios7-plus-empty" on-tap="go(' + "'add_note'"+ ')"></a>' ,
		ADD_NOTE_HEADER : '<a class="button button-icon icon ion-ios7-arrow-left" on-tap="go('+"'note'"+')"></a>' +
						  '<div class="title">日记</div>' ,
		SHOW_NOTE_HEADER : '<a class="button button-icon icon ion-ios7-arrow-left" on-tap="go('+"'note'"+')"></a>' +
						   '<div class="title">日记</div>'+
						   '<a class="button button-icon icon ion-ios7-compose-outline" on-tap="go(' + "'edit_note'"+ ')"></a>' ,
		EDIT_NOTE_HEADER : '<a class="button button-icon icon ion-ios7-arrow-left" on-tap="go('+"'note'"+')"></a>' +
						   '<div class="title">日记</div>',
		//task headers
		TASK_HEADER : '<a class="button button-icon icon ion-ios7-arrow-left" on-tap="go('+"'index'" + ')"></a>' +
		  			  '<div class="title">任务</div>'+
					  '<a class="button button-icon icon ion-ios7-plus-empty" on-tap="go(' + "'add_task'" + ')"></a>',
		ADD_TASK_HEADER : '<a class="button button-icon icon ion-ios7-arrow-left" on-tap="go('+"'task'" + ')"></a>' +
                          '<div class="title">任务</div>',
        DELETE_ICON : '<a class="button button-icon icon ion-ios7-close"></a>'
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
					'header':{templateUrl:'views/wallet/wallet_header.html'},
					'container':{templateUrl:'views/wallet/wallet.html'}
				}
			})
			//task states
			.state('task',{
				url:'/task',
				views:{
					'header':{template:TEMPLATE.TASK_HEADER},
					'container':{templateUrl:'views/task/task.html',controller:'taskController'}
				}
			})
            .state('add_task',{
                url:'/task/add' ,
                views:{
                    'header':{template:TEMPLATE.ADD_TASK_HEADER},
                    'container':{templateUrl:'views/task/add_task.html',controller:'addTaskController'}
                }
            })
			//note states
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
	//note controller
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
	) ;
	//task controller
	//the controller of the task view
	var taskController = meng.controller(
		'taskController' ,
		['$scope','$state',
		function($scope,$state){
			$scope.change = function(year,month){
				console.log(year + ',' + month) ;
			} ;
			$scope.dateTap = function(year,month,date){
				console.log(year + ',' + month + ',' + date) ;
			} ;
		}]
	) ;
    var addTaskController = meng.controller(
        'addTaskController',
        ['$scope','$state','TaskService',
        function($scope,$state,TaskService){
            $scope.title = '' ;
            $scope.content = '' ;
            $scope.date = new Date() ;
            $scope.duration = 3 ;
            $scope.frequency = 1 ;
            $scope.addTask = function(){
                console.log('title:' + $scope.title) ;
                console.log('content:' + $scope.content) ;
                console.log('date:' + $scope.date) ;
                console.log('duration:' + $scope.duration) ;
                console.log('frequency:' + $scope.frequency) ;
            } ;
        }]
    ) ;
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
    //TaskService
    meng.factory('TaskService',['$http',function($http){
        return {
            addTask : function(title,content,date,duration,
                               frequency,success,error){
                $http.post(URL.TASK,
                    {'title':title,'content':content,'date':date,
                    'duration':duration,'frequency':frequency})
                    .success(success)
                    .error(error) ;
            } ,
            updateTask : function(id,title,content,date,duration,
                                  frequency,success,error){
                $http.put(URL.TASK + '/' + id,
                    {'title':title,'content':content,'date':date,
                    'duration':duration,'frequency':frequency})
                    .success(success)
                    .error(error) ;
            } ,
            getNotes : function(success,error){
                $http.get(URL.TASKS)
                    .success(success).error(error) ;
            } ,
            getNoteById : function(id,success,error){
                $http.get(URL.TASK + '/' + id)
                    .success(success).error(error) ;
            } ,
            deleteNote : function(id,success,error){
                $http.delete(URL.TASK + '/' + id)
                    .success(success).error(error) ;
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
	/**************************Directive****************************/
	//task calendar
	meng.directive('taskCalendar',['UtilService',function(UtilService){
		var year, month ;
		var genCalendar = function(year,month){
			year = +year ;
			month = +month ;
			var leap = function(year){
				if((year%4===0&&year%100!==0)||year%400===0)
					return 1 ;
				else
					return 0 ;
			} ;
			var getMaxDayOfMonth = function(year,month){
				switch(month){
					case 1 :
					case 3 :
					case 5 :
					case 7 :
					case 8 :
					case 10 :
					case 12 :
						return 31 ;
					case 4 :
					case 6 :
					case 9 :
					case 11 :
						return 30 ;
					case 2 :
						if(leap(year))
							return 29 ;
						else
							return 28 ;
				}
			} ;
			var getFirstDay = function(year,month){
				var century , y ;
				var w = 0 ;
				century = Math.floor(year / 100) ;
				y = year % 100 ;
				if(month == 1 || month == 2){
					century = Math.floor((year - 1) / 100) ;
					y = (year - 1) % 100 ;
					if(month == 1)
						month = 13 ;
					else
						month = 14 ;
				}
				w = Math.floor(century / 4) - 2 * century + y + Math.floor(y / 4) + Math.floor(13 * ( month + 1 ) / 5) ;
				w = w % 7 ;

				while(w < 0){
					w = w + 70 ;
				}

				return w % 7 ;
			} ;
			var html = '' ;
			var blank = getFirstDay(year,month) ;
			var length = getMaxDayOfMonth(year,month) ;
			var row = '<div class="row">' ;
			for(var i = 0 ; i < blank ; i ++){
				row += '<div class="col" id="date0"></div>' ;
			}
			for(var i = 1 ; i <= length ; i ++){
				row += '<div class="col" id="date' + i + '">' + i + '</div>' ;
				blank++ ;
				if(blank % 7 === 0){
					row += '</div>' ;
					html += row;
					row = '<div class="row">' ;
				}
			}
			if(blank % 7 !== 0){
				blank = 7 - blank % 7 ;
				for(var i = 0 ; i < blank ; i ++){
					row += '<div class="col" id="data0"></div>'
				}
				row += '</div>' ;
				html += row ;
			}
			return html ;
		} ;
		return {
			restrict : 'E',
			scope:{
				onChange : '=onChange',
				onDateTap : '=onDateTap'
			} ,
			template : function(elem,attr){
				var now = new Date() ;
				year = attr.year || now.getFullYear(),month = attr.month || now.getMonth() + 1 ;
				var template =
					'<div class="row">'+
						'<div class="col card">'+
							'<div class="item item-text-wrap" id="year-card">'+
								attr.year + '年' +
							'</div>'+
						'</div>'+
						'<div class="col card">'+
							'<div class="item item-text-wrap" id="month-card">'+
								attr.month + '月' +
							'</div>'+
						'</div>'+
					'</div>'+
					'<div class="row">'+
						'<div class="col c-head">日</div>'+
						'<div class="col c-head">一</div>'+
						'<div class="col c-head">二</div>'+
						'<div class="col c-head">三</div>'+
						'<div class="col c-head">四</div>'+
						'<div class="col c-head">五</div>'+
						'<div class="col c-head">六</div>'+
					'</div>'+
					'<div class="calendar" on-swipe-right="lastMonth()" on-swipe-left="nextMonth()">' ;
				return template + genCalendar(year,month) + '</div>';
			} ,
			link:function(scope,elem,attrs){
				var year_card = document.getElementById('year-card'),
					month_card = document.getElementById('month-card') ;
				scope.nextMonth = function(){
					month ++ ;
					if(month >12){
						year ++ ;
						month = month % 12 ;
					}
					year_card.innerHTML = year + '年' ;
					month_card.innerHTML = month + '月' ;
					document.querySelector('.calendar').innerHTML = genCalendar(year,month) ;
					scope.onChange(year,month) ;
				} ;
				scope.lastMonth = function(){
					month -- ;
					if(month < 1){
						month += 12 ;
						year -- ;
					}
					year_card.innerHTML = year + '年' ;
					month_card.innerHTML = month + '月' ;
					document.querySelector('.calendar').innerHTML = genCalendar(year,month) ;
					scope.onChange(year,month) ;
				} ;
				angular.element(document.querySelector('.calendar')).on('click',function(e){
					var date = e.target.id.substring(4) ;
					if(date !== '0')
						scope.onDateTap(year,month,date) ;
				}) ;
			}
		} ;
	}]) ;
	//exports the module
	win.meng = meng ;
}(window)) ;