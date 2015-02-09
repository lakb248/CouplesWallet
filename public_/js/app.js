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
		} ,
        SHOW_TASK : {
            _state : 'task_list' ,
            _year : new Date().getFullYear() ,
            _month : new Date().getMonth() + 1 ,
            _day : new Date().getDate() ,
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
        DELETE_ICON : '<a class="button button-icon icon ion-ios7-close"></a>',
        TASK_CELL : '<div class="task-cell"></div>' ,
        TASK_DONE_CELL : '<div class="task-cell task-done"></div>'
 	} ;
	//cache
    var CACHE = {
        NOTES : null ,
        TASKS : [] ,
        TASKS_MAP : {}
    } ;
    var MILSECOND_PER_DAY = 24 * 60 * 60 * 1000 ;
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
            .state('task_list',{
                url:'/task/list/' ,
                views:{
                    'header':{template:TEMPLATE.ADD_TASK_HEADER},
                    'container':{templateUrl:'views/task/task_list.html',controller:'taskListController'}
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
				if(CACHE.NOTES){
					console.log('load from local') ;
					$scope.notes = CACHE.NOTES ;
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
								CACHE.NOTES.splice(index,1) ;
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
								CACHE.NOTES.unshift(data.note) ;
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
			$scope.note = CACHE.NOTES[index] ;
		}]
	) ;
	var editNoteController = meng.controller(
		'editNoteController',
		['$scope','$state','NoteService','UtilService',
		function($scope,$state,NoteService,UtilService){
			//get note from the local cache
			var note = CACHE.NOTES[STATE.SHOW_NOTE._index] ;
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
							CACHE.NOTES[STATE.SHOW_NOTE._index] = data.note ;
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
		['$scope','$state','TaskService','TaskHelper',
		function($scope,$state,TaskService,TaskHelper){
            var showCalendarByTasks = function(taskMap,year,month){
                var endDate = TaskHelper.getMaxDayOfMonth(year,month) ;
                var tasks, length,panel;
                for(var i = 1 ; i <= endDate ; i ++){
                    tasks = taskMap[i] || [] ;
                    length = tasks.length ;
                    for(var j = 0 ; j < length ; j ++){
                        panel = angular.element(document.getElementById('date' + i).querySelector('.task-panel'));
                        panel.append(angular.element(TEMPLATE.TASK_CELL)) ;
                    }
                }
            } ;
            $scope.change = function(year,month){
                var results = TaskHelper.getTasksByMonth(CACHE.TASKS,year,month) ;
                CACHE.TASKS_MAP = TaskHelper.mapTasksToCalendar(results,year,month) ;
                showCalendarByTasks(CACHE.TASKS_MAP,year,month) ;
            } ;
            $scope.dateTap = function(year,month,date){
                STATE.SHOW_TASK._index = date ;
                STATE.SHOW_TASK._year = year ;
                STATE.SHOW_TASK._month = month ;
                STATE.SHOW_TASK._day = date ;
                $state.go(STATE.SHOW_TASK._state) ;
            } ;
            $scope.taskDone = function(event,index){
                var isDone = event.target.checked ;
                var checkTask = $scope.todayTasks[index] ;
                //todo update done array of checkTask , maybe then update the calendar view
                checkTask.done[TaskHelper.getPosition(checkTask,new Date().toLocaleDateString())] = +isDone ;
                TaskService.updateTask(checkTask.objectId,checkTask.title,checkTask.content,checkTask.date,
                    checkTask.duration,checkTask.frequency,checkTask.done,function(){},function(){}) ;
            } ;

            //get all tasks
            //todo improve the performance by some way
            TaskService.getTasks(function(data){
                if(data.status === 1){
                    CACHE.TASKS = data.tasks ;
                    var now = new Date() ;
                    var year = now.getFullYear(),month = now.getMonth() + 1 ;
                    var results = TaskHelper.getTasksByMonth(CACHE.TASKS,year,month) ;
                    CACHE.TASKS_MAP = TaskHelper.mapTasksToCalendar(results,year,month) ;
                    showCalendarByTasks(CACHE.TASKS_MAP,year,month) ;
                    var todayTasks = CACHE.TASKS_MAP[now.getDate()];
                    $scope.todayTasks = todayTasks ;
                    $scope.taskObjs = [] ;
                    //set task checkbox status
                    for(var i = todayTasks.length - 1 ; i >= 0 ; i --){
                        var taskObj = {} ;
                        taskObj.task = todayTasks[i] ;
                        taskObj.done = !!todayTasks[i].done[TaskHelper.getPosition(todayTasks[i],now.toLocaleDateString())] ;
                        $scope.taskObjs.unshift(taskObj) ;
                    }
                }else{
                    console.log(data.message) ;
                }
            },function(data){
                console.log(data) ;
            }) ;


		}]
	) ;
    var addTaskController = meng.controller(
        'addTaskController',
        ['$scope','$state','TaskService','UtilService','TaskService',
        function($scope,$state,TaskService,UtilService,TaskService){
            $scope.title = '' ;
            $scope.content = '' ;
            $scope.date = new Date() ;
            $scope.duration = 1 ;
            $scope.frequency = 0 ;

            $scope.addTask = function(){

                var title = $scope.title, content = $scope.content,
                    date = new Date($scope.date).toLocaleDateString(),
                    duration = $scope.duration,
                    frequency = $scope.frequency ;
                var done = new Array(duration) ;
                for(var i = 0 ; i < duration ; i ++){
                    done[i] = 0 ;
                }

                if(title.replace(REGEX.EMPTY,'').length === 0){
                    UtilService.showAlert('臭蛋蛋说','别忘了输入标题!') ;
                }else{
                    TaskService.addTask(title,content,date,duration,frequency,done,
                        function(data){
                            if(data.status === 1){
                                CACHE.TASKS.push(data.task) ;
                                $state.go('task') ;
                            }else{
                                console.log(data) ;
                            }
                        },function(data){
                            console.log(data) ;
                        }) ;
                }
            } ;
        }]
    ) ;
    var taskListController = meng.controller(
        'taskListController' ,
        ['$scope','$state','TaskService','TaskHelper',function($scope,$state,TaskService,TaskHelper){
            var chooseTasks = CACHE.TASKS_MAP[STATE.SHOW_TASK._index] ;
            var date = STATE.SHOW_TASK._year + '/' + STATE.SHOW_TASK._month + '/' + STATE.SHOW_TASK._day ;
            var length = chooseTasks.length ;
            $scope.taskObjs = [] ;
            for(var i = 0 ; i < length ; i ++){
                var obj = {} ;
                obj.task = chooseTasks[i] ;
                obj.done = chooseTasks[i].done[TaskHelper.getPosition(chooseTasks[i],date)] ;
                $scope.taskObjs.push(obj) ;
            }
            $scope.taskDone = function(event,index){
                var isDone = event.target.checked ;
                var checkTask = $scope.taskObjs[index].task ;
                //todo update the calendar view
                checkTask.done[TaskHelper.getPosition(checkTask,date)] = +isDone ;
                TaskService.updateTask(checkTask.objectId,checkTask.title,checkTask.content,checkTask.date,
                    checkTask.duration,checkTask.frequency,checkTask.done,function(){},function(){}) ;
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
                               frequency,done,success,error){
                $http.post(URL.TASK,
                    {'title':title,'content':content,'date':date,
                    'duration':+duration,'frequency':+frequency,'done':done})
                    .success(success)
                    .error(error) ;
            } ,
            updateTask : function(id,title,content,date,duration,
                                  frequency,done,success,error){
                $http.put(URL.TASK + '/' + id,
                    {'title':title,'content':content,'date':date,
                    'duration':duration,'frequency':frequency,'done':done})
                    .success(success)
                    .error(error) ;
            } ,
            getTasks : function(success,error){
                $http.get(URL.TASKS)
                    .success(success).error(error) ;
            } ,
            getTaskById : function(id,success,error){
                $http.get(URL.TASK + '/' + id)
                    .success(success).error(error) ;
            } ,
            deleteTask : function(id,success,error){
                $http.delete(URL.TASK + '/' + id)
                    .success(success).error(error) ;
            }
        } ;
    }]) ;
    //TaskHelper
    meng.factory('TaskHelper',function(){
        return {
            dateToInt : function(date){
                var parts = date.split('/') ;
                var year = parts[0], month = parts[1], day = parts[2] ;
                month = month.length === 1 ? '0' + month : month ;
                day = day.length === 1 ? '0' + day : day ;

                return +(year + month + day) ;
            } ,
            compareDate : function(date1,date2){
                return this.dateToInt(date1) >= this.dateToInt(date2) ;
            } ,
            leap : function(year){
                if((year%4===0&&year%100!==0)||year%400===0)
                    return 1 ;
                else
                    return 0 ;
            } ,
            getMaxDayOfMonth : function(year,month){
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
                        if(this.leap(year))
                            return 29 ;
                        else
                            return 28 ;
                }
            } ,
            afterSomeDays : function(date,duration){
                var future = new Date(new Date(date).getTime() + duration * MILSECOND_PER_DAY) ;
                var year = future.getFullYear(), month = future.getMonth() + 1, day = future.getDate() ;
                return year + '/' + month + '/' + day ;
            } ,
            getTotalDuration : function(duration,frequency){
                if(frequency === 0){
                    return duration ;
                }
                var blank = 0 ;
                for(var i = 1 ; i <= duration ; i ++){
                    if(i % (frequency + 1) === 0){
                        duration ++ ;
                    }
                }
                return duration ;
            } ,
            getTasksByMonth : function(tasks,year,month){
                var length = tasks.length ;
                var results = [] ;
                var startDate = this.afterSomeDays(year + '/' + month + '/1',-99),
                    startOfMonth = year + '/' + month + '/1',
                    endOfMonth = year + '/' + month + '/' + this.getMaxDayOfMonth(year,month) ;
                var temp,date,duration;
                for(var i = 0 ; i < length ; i++){
                    temp = tasks[i] ;
                    date = temp.date,duration = this.getTotalDuration(temp.duration,temp.frequency) ;
                    if(this.compareDate(date,endOfMonth)){
                        continue ;
                    }
                    if(this.compareDate(date,startDate)){
                        if(this.compareDate(this.afterSomeDays(date,duration-1),startOfMonth) ||
                            (this.compareDate(date,startOfMonth)&&this.compareDate(endOfMonth,date))){
                            //if the date of task is between startOfMonth and endOfMonth,
                            //push the task into the results
                            results.push(temp) ;
                            continue ;
                        }
                    }

                }
                return results ;
            } ,
            mapTasksToCalendar : function(tasks,year,month){
                var length = tasks.length,
                    startOfMonth = year + '/' + month + '/1',
                    endOfMonth = year +'/' + month + '/' + this.getMaxDayOfMonth(year,month);
                var taskMap = {} ;
                var temp,date,duration,frequency,endOfTask;
                for(var i = 0 ; i < length ; i ++){
                    temp = tasks[i] ;
                    date = temp.date, duration = this.getTotalDuration(temp.duration,temp.frequency),frequency = temp.frequency ;
                    if(!this.compareDate(date,startOfMonth)){
                        var parts = this.afterSomeDays(date,duration-1).split('/') ;
                        if((+parts[0]) > (+year) || (+parts[1]) > (+month))
                            endOfTask = endOfMonth.split('/')[2] ;
                        else
                            endOfTask = parts[2] ;
                        endOfTask = +endOfTask ;

                        var doneOfTask = (new Date(startOfMonth).getTime() - new Date(date).getTime())/MILSECOND_PER_DAY ;
                        if(frequency === 0){
                            for(var j = 1 ; j <= endOfTask;j ++){
                                taskMap[j] = taskMap[j] || [] ;
                                taskMap[j].push(temp) ;
                            }
                        }else{
                            for(var j = 1 ; j <= endOfTask;j ++){
                                doneOfTask ++ ;
                                if(doneOfTask % (frequency + 1) === 0)
                                    continue ;
                                taskMap[j] = taskMap[j] || [] ;
                                taskMap[j].push(temp) ;
                            }
                        }
                    }else{
                        var parts = this.afterSomeDays(date,duration-1).split('/') ;
                        if((+parts[0]) > (+year) || (+parts[1]) > (+month))
                            endOfTask = endOfMonth.split('/')[2] ;
                        else
                            endOfTask = parts[2] ;
                        endOfTask = +endOfTask ;
                        if(frequency === 0){
                            for(var j = +date.split('/')[2]; j <= endOfTask ; j ++){
                                taskMap[j] = taskMap[j] || [] ;
                                taskMap[j].push(temp) ;
                            }
                        }else{
                            for(var j = +date.split('/')[2],i=1; j <= endOfTask ; j ++,i ++){
                                if(i % (frequency + 1) === 0)
                                    continue ;
                                taskMap[j] = taskMap[j] || [] ;
                                taskMap[j].push(temp) ;
                            }
                        }

                    }
                }
                return taskMap ;
            } ,
            getPosition : function(task,date){
                var startDate = task.date,frequency = task.frequency,done = task.done ;
                var diff = (new Date(date).getTime() - new Date(startDate).getTime())/MILSECOND_PER_DAY ;
                //if frequency is 0 , the diff is the position of the task
                if(frequency == 0){
                    return diff ;
                }
                //else travel the done array to find the position of the task
                var length = done.length,position = 0,i = 1;
                for(;  i <= length ; i ++){
                    if(i % (frequency+1) === 0)
                        continue ;
                    if(position === diff)
                        break ;
                    position ++ ;
                }
                return position ;
            }
        } ;
    }) ;
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
    meng.factory('$mdInkRipple', InkRippleService)
        .directive('mdInkRipple', InkRippleDirective)
        .directive('mdNoInk', attrNoDirective())
        .directive('mdNoBar', attrNoDirective())
        .directive('mdNoStretch', attrNoDirective());

    function InkRippleDirective($mdInkRipple) {
        return {
            controller: angular.noop,
            link: function (scope, element, attr) {
                if (attr.hasOwnProperty('mdInkRippleCheckbox')) {
                    $mdInkRipple.attachCheckboxBehavior(scope, element);
                } else {
                    $mdInkRipple.attachButtonBehavior(scope, element);
                }
            }
        };
    }
    InkRippleDirective.$inject = ["$mdInkRipple"];

    function InkRippleService($window, $timeout) {

        return {
            attachButtonBehavior: attachButtonBehavior,
            attachCheckboxBehavior: attachCheckboxBehavior,
            attachTabBehavior: attachTabBehavior,
            attach: attach
        };

        function attachButtonBehavior(scope, element, options) {
            return attach(scope, element, angular.extend({
                isFAB: element.hasClass('md-fab'),
                isMenuItem: element.hasClass('md-menu-item'),
                center: false,
                dimBackground: true
            }, options));
        }

        function attachCheckboxBehavior(scope, element, options) {
            return attach(scope, element, angular.extend({
                center: true,
                dimBackground: false,
                fitRipple: true
            }, options));
        }

        function attachTabBehavior(scope, element, options) {
            return attach(scope, element, angular.extend({
                center: false,
                dimBackground: true,
                outline: true
            }, options));
        }

        function attach(scope, element, options) {
            if (element.controller('mdNoInk')) return angular.noop;

            options = angular.extend({
                colorElement: element,
                mousedown: true,
                hover: true,
                focus: true,
                center: false,
                mousedownPauseTime: 150,
                dimBackground: false,
                outline: false,
                isFAB: false,
                isMenuItem: false,
                fitRipple: false
            }, options);

            var rippleSize,
                controller = element.controller('mdInkRipple') || {},
                counter = 0,
                ripples = [],
                states = [],
                isActiveExpr = element.attr('md-highlight'),
                isActive = false,
                isHeld = false,
                node = element[0],
                rippleSizeSetting = element.attr('md-ripple-size'),
                color = parseColor(element.attr('md-ink-ripple')) || parseColor($window.getComputedStyle(options.colorElement[0]).color || 'rgb(0, 0, 0)');

            switch (rippleSizeSetting) {
                case 'full':
                    options.isFAB = true;
                    break;
                case 'partial':
                    options.isFAB = false;
                    break;
            }

            // expose onInput for ripple testing
            if (options.mousedown) {
                element.on('mousedown', onPressDown)
                    .on('mouseup', onPressUp);
            }

            controller.createRipple = createRipple;

            if (isActiveExpr) {
                scope.$watch(isActiveExpr, function watchActive(newValue) {
                    isActive = newValue;
                    if (isActive && !ripples.length) {
                        $timeout(function () { createRipple(0, 0); }, 0, false);
                    }
                    angular.forEach(ripples, updateElement);
                });
            }

            // Publish self-detach method if desired...
            return function detach() {
                element.off('$md.pressdown', onPressDown)
                    .off('$md.pressup', onPressUp);
                getRippleContainer().remove();
            };

            /**
             * Gets the current ripple container
             * If there is no ripple container, it creates one and returns it
             *
             * @returns {angular.element} ripple container element
             */
            function getRippleContainer() {
                var container = element.data('$mdRippleContainer');
                if (container) return container;
                container = angular.element('<div class="md-ripple-container">');
                element.append(container);
                element.data('$mdRippleContainer', container);
                return container;
            }

            function parseColor(color) {
                if (!color) return;
                if (color.indexOf('rgba') === 0) return color.replace(/\d?\.?\d*\s*\)\s*$/, '0.1)');
                if (color.indexOf('rgb')  === 0) return rgbToRGBA(color);
                if (color.indexOf('#')    === 0) return hexToRGBA(color);

                /**
                 * Converts a hex value to an rgba string
                 *
                 * @param {string} hex value (3 or 6 digits) to be converted
                 *
                 * @returns {string} rgba color with 0.1 alpha
                 */
                function hexToRGBA(color) {
                    var hex = color.charAt(0) === '#' ? color.substr(1) : color,
                        dig = hex.length / 3,
                        red = hex.substr(0, dig),
                        grn = hex.substr(dig, dig),
                        blu = hex.substr(dig * 2);
                    if (dig === 1) {
                        red += red;
                        grn += grn;
                        blu += blu;
                    }
                    return 'rgba(' + parseInt(red, 16) + ',' + parseInt(grn, 16) + ',' + parseInt(blu, 16) + ',0.1)';
                }

                /**
                 * Converts rgb value to rgba string
                 *
                 * @param {string} rgb color string
                 *
                 * @returns {string} rgba color with 0.1 alpha
                 */
                function rgbToRGBA(color) {
                    return color.replace(')', ', 0.1)').replace('(', 'a(');
                }

            }

            function removeElement(elem, wait) {
                ripples.splice(ripples.indexOf(elem), 1);
                if (ripples.length === 0) {
                    getRippleContainer().css({ backgroundColor: '' });
                }
                $timeout(function () { elem.remove(); }, wait, false);
            }

            function updateElement(elem) {
                var index = ripples.indexOf(elem),
                    state = states[index] || {},
                    elemIsActive = ripples.length > 1 ? false : isActive,
                    elemIsHeld   = ripples.length > 1 ? false : isHeld;
                if (elemIsActive || state.animating || elemIsHeld) {
                    elem.addClass('md-ripple-visible');
                } else if (elem) {
                    elem.removeClass('md-ripple-visible');
                    if (options.outline) {
                        elem.css({
                            width: rippleSize + 'px',
                            height: rippleSize + 'px',
                            marginLeft: (rippleSize * -1) + 'px',
                            marginTop: (rippleSize * -1) + 'px'
                        });
                    }
                    removeElement(elem, options.outline ? 450 : 650);
                }
            }

            /**
             * Creates a ripple at the provided coordinates
             *
             * @param {number} left cursor position
             * @param {number} top cursor position
             *
             * @returns {angular.element} the generated ripple element
             */
            function createRipple(left, top) {

                color = parseColor(element.attr('md-ink-ripple')) || parseColor($window.getComputedStyle(options.colorElement[0]).color || 'rgb(0, 0, 0)');
                var container = getRippleContainer(),
                    size = getRippleSize(left, top),
                    css = getRippleCss(size, left, top),
                    elem = getRippleElement(css),
                    index = ripples.indexOf(elem),
                    state = states[index] || {};

                rippleSize = size;

                state.animating = true;

                $timeout(function () {
                    if (options.dimBackground) {
                        container.css({ backgroundColor: color });
                    }
                    elem.addClass('md-ripple-placed md-ripple-scaled');
                    if (options.outline) {
                        elem.css({
                            borderWidth: (size * 0.5) + 'px',
                            marginLeft: (size * -0.5) + 'px',
                            marginTop: (size * -0.5) + 'px'
                        });
                    } else {
                        elem.css({ left: '50%', top: '50%' });
                    }
                    updateElement(elem);
                    $timeout(function () {
                        state.animating = false;
                        updateElement(elem);
                    }, (options.outline ? 450 : 225), false);
                }, 0, false);

                return elem;

                /**
                 * Creates the ripple element with the provided css
                 *
                 * @param {object} css properties to be applied
                 *
                 * @returns {angular.element} the generated ripple element
                 */
                function getRippleElement(css) {
                    var elem = angular.element('<div class="md-ripple" data-counter="' + counter++ + '">');
                    ripples.unshift(elem);
                    states.unshift({ animating: true });
                    container.append(elem);
                    css && elem.css(css);
                    return elem;
                }

                /**
                 * Calculate the ripple size
                 *
                 * @returns {number} calculated ripple diameter
                 */
                function getRippleSize(left, top) {
                    var width = container.prop('offsetWidth'),
                        height = container.prop('offsetHeight'),
                        multiplier, size, rect;
                    if (options.isMenuItem) {
                        size = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
                    } else if (options.outline) {
                        rect = node.getBoundingClientRect();
                        left -= rect.left;
                        top -= rect.top;
                        width = Math.max(left, width - left);
                        height = Math.max(top, height - top);
                        size = 2 * Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
                    } else {
                        multiplier = options.isFAB ? 1.1 : 0.8;
                        size = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)) * multiplier;
                        if (options.fitRipple) {
                            size = Math.min(height, width, size);
                        }
                    }
                    return size;
                }

                /**
                 * Generates the ripple css
                 *
                 * @param {number} the diameter of the ripple
                 * @param {number} the left cursor offset
                 * @param {number} the top cursor offset
                 *
                 * @returns {{backgroundColor: *, width: string, height: string, marginLeft: string, marginTop: string}}
                 */
                function getRippleCss(size, left, top) {
                    var rect,
                        css = {
                            backgroundColor: rgbaToRGB(color),
                            borderColor: rgbaToRGB(color),
                            width: size + 'px',
                            height: size + 'px'
                        };

                    if (options.outline) {
                        css.width = 0;
                        css.height = 0;
                    } else {
                        css.marginLeft = css.marginTop = (size * -0.5) + 'px';
                    }

                    if (options.center) {
                        css.left = css.top = '50%';
                    } else {
                        rect = node.getBoundingClientRect();
                        css.left = Math.round((left - rect.left) / container.prop('offsetWidth') * 100) + '%';
                        css.top = Math.round((top - rect.top) / container.prop('offsetHeight') * 100) + '%';
                    }

                    return css;

                    /**
                     * Converts rgba string to rgb, removing the alpha value
                     *
                     * @param {string} rgba color
                     *
                     * @returns {string} rgb color
                     */
                    function rgbaToRGB(color) {
                        return color.replace('rgba', 'rgb').replace(/,[^\)\,]+\)/, ')');
                    }
                }
            }

            /**
             * Handles user input start and stop events
             *
             */
            function onPressDown(ev) {
                if (!isRippleAllowed()) return;
                var ripple = createRipple(ev.pageX, ev.pageY);
                isHeld = true;
            }
            function onPressUp(ev) {
                isHeld = false;
                var ripple = ripples[ ripples.length - 1 ];
                $timeout(function () { updateElement(ripple); }, 0, false);
            }

            /**
             * Determines if the ripple is allowed
             *
             * @returns {boolean} true if the ripple is allowed, false if not
             */
            function isRippleAllowed() {
                var parent = node.parentNode;
                var grandparent = parent && parent.parentNode;
                var ancestor = grandparent && grandparent.parentNode;
                return !isDisabled(node) && !isDisabled(parent) && !isDisabled(grandparent) && !isDisabled(ancestor);
                function isDisabled (elem) {
                    return elem && elem.hasAttribute && elem.hasAttribute('disabled');
                }
            }

        }
    }
    InkRippleService.$inject = ["$window", "$timeout"];

    /**
     * noink/nobar/nostretch directive: make any element that has one of
     * these attributes be given a controller, so that other directives can
     * `require:` these and see if there is a `no<xxx>` parent attribute.
     *
     * @usage
     * <hljs lang="html">
     * <parent md-no-ink>
     *   <child detect-no>
     *   </child>
     * </parent>
     * </hljs>
     *
     * <hljs lang="js">
     * myApp.directive('detectNo', function() {
     *   return {
     *     require: ['^?mdNoInk', ^?mdNoBar'],
     *     link: function(scope, element, attr, ctrls) {
     *       var noinkCtrl = ctrls[0];
     *       var nobarCtrl = ctrls[1];
     *       if (noInkCtrl) {
     *         alert("the md-no-ink flag has been specified on an ancestor!");
     *       }
     *       if (nobarCtrl) {
     *         alert("the md-no-bar flag has been specified on an ancestor!");
     *       }
     *     }
     *   };
     * });
     * </hljs>
     */
    function attrNoDirective() {
        return function() {
            return {
                controller: angular.noop
            };
        };
    }
    /**************************Directive****************************/
    //material design directive
    meng.directive('md',['$mdInkRipple',function($mdInkRipple){
        return {
            restrict : 'A' ,
            link : function(scope,element,attr){
                $mdInkRipple.attachButtonBehavior(scope, element);
            }
        } ;
    }]) ;
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
                if(i === new Date().getDate())
                    row += '<div class="col today" id="date' + i + '">' + i + '<div class="task-panel"></div></div>' ;
				else
                    row += '<div class="col" id="date' + i + '">' + i + '<div class="task-panel"></div></div>' ;
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
								year + '年' +
							'</div>'+
						'</div>'+
						'<div class="col card">'+
							'<div class="item item-text-wrap" id="month-card">'+
								month + '月' +
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

