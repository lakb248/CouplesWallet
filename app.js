var express = require('express') ;
var bodyParser = require('body-parser') ;
var router = require('./routes/route') ;
var app = express() ;


//app.use(express.static(__dirname + '/public')) ;
app.use(express.static(__dirname + '/public_')) ;

app.use(bodyParser.json()) ;

app.use('/api',router) ;

app.listen(8080) ;
