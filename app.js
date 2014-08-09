var express = require('express') ;
var mongoose = require('mongoose') ;
var bodyParser = require('body-parser') ;
var router = require('./routes/route') ;
var app = express() ;

mongoose.connect('mongodb://localhost:27017/couples') ;

app.use(express.static(__dirname + '/public')) ;
app.use(bodyParser.json()) ;

app.use('/api',router) ;

app.listen(8080) ;
