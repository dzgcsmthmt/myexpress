var express = require("express");
var app = express();

app.use(function(req,res,next){
    console.log('common middleware',next.toString());
    next();
})

app.use('/user',function(req,res,next){
    console.log('path middleware');
    next();
})

app.param('id', function (req, res, next, id) {
    console.log('param id called ',next.toString());
    next();
})

app.route("/user/:id")
    .all(function (req, res, next) {
        console.log('route specific middleware',next.toString());
        next();
    },function(err,req,res,next){
        console.log('error handel middleware',err);
        next();
    })
    .get(function (req, res, next) {
        console.log('get method called');
        res.end('hello world');
    });

app.listen(3000);
 