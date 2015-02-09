/**
 * Created by Administrator on 2015/2/3.
 */
var Task = require('../models/task') ;

//add task
exports.addTask = function(req,res){
    var title = req.body.title,
        content = req.body.content,
        date = req.body.date,
        duration = req.body.duration,
        done = req.body.done,
        frequency = req.body.frequency ;
    Task.addTask(title,content,date,duration,frequency,done,function(task){
        res.json({'status':1,'task':task}) ;
    },function(object,error){
        res.json({'status':0,'message':error}) ;
    }) ;

} ;
//update task
exports.updateTask = function(req,res){
    var id = req.params.task_id,
        title = req.body.title,
        content = req.body.content,
        date = req.body.date,
        duration = req.body.duration,
        frequency = req.body.frequency,
        done = req.body.done;
    Task.updateTask(id,title,content,date,duration,frequency,done,function(task){
        res.json({'status':1,'task':task}) ;
    },function(object,error){
        res.json({'status':0,'message':error}) ;
    }) ;

} ;
//get all tasks
exports.getAllTasks = function(req,res){
    Task.findAll(function(tasks){
        console.log(tasks.length) ;
        res.json({'status':1,'tasks':tasks}) ;
    },function(error){
        res.json({'status':0,'message':error}) ;
    }) ;
} ;
//get task by id
exports.getTaskById = function(req,res){
    var id = req.params.task_id ;
    Task.findById(id,function(task){
        res.json({'status':1,'task':task}) ;
    },function(error){
        res.json({'status':0,'message':error}) ;
    }) ;
} ;
//delete task by id
exports.deleteTask = function(req,res){
    var id = req.params.task_id ;
    Task.delete(id,function(task){
        res.json({'status':1,'task':task}) ;
    },function(error){
        res.json({'status':0,'message':error}) ;
    }) ;
} ;

/*
 Task.addTask(title,content,date,duration,frequency,
    function(task){
         var task_id = task.objectId,
         startDate = task.date,
         duration = task.duration,
         frequency = task.frequency,
         date;
         //add task records
         for(var i = 1 ; i <= duration ; i ++){
         //when reach the frequency , continue to next day
         if(i % (frequency + 1) === 0)
         continue ;
         //take current date into consideration,so i must reduce 1
         date = dateToInt(afterSomeDays(startDate,i-1)) ;
         TaskRecord.addTaskRecord(task_id,date,0,null,
         function(obect,error){
         //if error happened , remove all records related to task
         TaskRecord.deleteTaskRecordByTaskId(task_id) ;
         res.json({'status':0,'message':error}) ;
         }) ;
         }
         //return new records and task
         TaskRecord.findByTaskId(task.objectId,function(records){
         res.json({'status':1,'task':task,'records':records}) ;
         },function(error){
         res.json({'status':0,'message':error}) ;
    }) ;
    },function(object,error){
         res.json({'status':0,'message':error}) ;
    }) ;
 */
/*
 Task.updateTask(id,title,content,date,duration,frequency,
     function(task){
         //update task records
         if(reset){
             //update task records by resetting all done record
             //delete the old records by task id
             TaskRecord.deleteTaskRecordByTaskId(id,function(){
             //add new task records after delete old task records
             var task_id = task.objectId,
             startDate = task.date,
             duration = task.duration,
             frequency = task.frequency,
             intDate;
             for(var i = 1 ; i <= duration ; i ++){
             //when reach the frequency , continue to next day
             if(i % (frequency + 1) === 0)
             continue ;
             //take current date into consideration,so i must reduce 1
             intDate = dateToInt(afterSomeDays(startDate,i-1)) ;
             TaskRecord.addTaskRecord(task_id,intDate,0,null,
             function(object,error){
             //if error happened , remove all records related to task
             TaskRecord.deleteTaskRecordByTaskId(task_id) ;
             res.json({'status':0,'message':error}) ;
             }) ;
             }
             //return new records and task
             TaskRecord.findByTaskId(task.objectId,function(records){
             res.json({'status':1,'task':task,'records':records}) ;
             },function(error){
             res.json({'status':0,'message':error}) ;
             }) ;
             },function(error){
             res.json({'status':0,'message':error}) ;
             }) ;

         }else{
         //update task records by overriding the old record
         var task_id = task.objectId,
         startDate = task.date,
         duration = task.duration,
         frequency = task.frequency,
         intDate;
         for(var i = 1 ; i <= duration ; i ++){
         //when reach the frequency , delete the exist record
         if(i % (frequency + 1) === 0){
         intDate = dateToInt(afterSomeDays(startDate,i-1)) ;
         TaskRecord.findByTaskIdAndDate(task_id,intDate,function(records){
         //exist a record,so delete the exist record
         if(records.length !== 0)
         records[0].destroy() ;
         },function(error){
         res.json({'status':0,'message':error}) ;
         }) ;
         }else{
         //take current date into consideration,so i must reduce 1
         intDate = dateToInt(afterSomeDays(startDate,i-1)) ;
         //not exist a record so add new record
         TaskRecord.findByTaskIdAndDate(task_id,intDate,function(records){
         if(records.length === 0){
         TaskRecord.addTaskRecord(task_id,intDate,0) ;
         }
         },function(error){
         res.json({'status':0,'message':error}) ;
         }) ;
         }
         }
         //return new records and task
         TaskRecord.findByTaskId(task.objectId,function(records){
         res.json({'status':1,'task':task,'records':records}) ;
         },function(error){
         res.json({'status':0,'message':error}) ;
         }) ;

         }

     },function(object,error){
     res.json({'status':0,'message':error}) ;
     }) ;
*/