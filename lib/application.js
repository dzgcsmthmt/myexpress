const http = require('http');
const Router = require('./router');
let app = module.exports = function(req,res){
    app.handle(req,res);
}

app.handle = function(req,res){
    const finalHandler = () => {
        res.end(`CANN'T ${req.method} ${req.url}`);
    }
    this.router.handle(req,res,finalHandler);
}

app.lazyrouter = function(){
    if(!this.router){
        this.router = new Router();
    }
}

app.param = function(name,callback){
    this.lazyrouter();
    if(Array.isArray(name)){
        for(let n of name){
            app.param(n,callback);
        }
        return;
    }

    this.router.param(name,callback);
    return this;
    
}

app.use = function(fn){
    this.lazyrouter();
    let path = '/';
    let offset = 0;
    if(typeof fn !== 'function'){
        path = fn;
        offset = 1;
    }

    let fns = ([]).slice.call(arguments,offset);

    fns.forEach(cb => {
        this.router.use(path,cb);
    });

    return this;

}

app.route = function(path){
    this.lazyrouter();
    const route = this.router.route(path);
    return route;
}

app.get = function(path,...cbs){
    this.lazyrouter();
    const route = this.router.route(path);
    route.get(...cbs);
    return this;
}

app.listen = function(...args){
    const server = http.createServer(this);
    server.listen(...args);
}

