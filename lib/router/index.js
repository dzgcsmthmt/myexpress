const Route = require('./route');
const Layer = require('./layer');
var proto = module.exports = function(){
    function router(req,res,next){
        router.handle(req,res,next);
    }
    Object.setPrototypeOf(router,proto);
    router.stack = [];
    router.params = {};
    return router;
}

proto.param = function(name,callback){
    (this.params[name] = this.params[name] || []).push(callback);
    return this;
}

proto.handle = function(req,res,out){
    let idx = 0;
    let stack = this.stack;
    let self = this;
    let paramCalled = {};
    let removed = '';
    next();
    function next(error){
        if(removed){
            req.url = removed + req.url;
            removed = '';
        }
        let path = req.url;
        let layer,match,route;
        while(match !== true && idx < stack.length){
            layer = stack[idx++];
            match = layer.match(path);
            route = layer.route;
            if(!match) continue;
            if(!route) continue;
            const has_method = route.handle_methods(req.method);
            if(!has_method) match = false;
        }

        if(!match) return out();

        req.params = layer.params;

        self.process_params(layer,paramCalled,req,res,function(){
            if(route){
                layer.handle_request(req,res,next)
            }else{
                trim_prefix(layer,error,layer.path,path);
            }
        })
    }

    function trim_prefix(layer,err,layerPath,path){
        if(layerPath.length !== 0){
            removed = layerPath;
            req.url = req.url.slice(removed.length);
        }
        if(err){
            layer.handle_error(err,req,res,next);
        }else{
            layer.handle_request(req,res,next);
        }
    }
}

proto.process_params = function(layer,called,req,res,done){
    let idx = 0;
    const keys = layer.keys;
    if(keys.length === 0) return done();
    const params = this.params;
    let key,paramCallbacks,paramValue,paramIndex;
    
    param();

    function param(){
        if(idx >= keys.length) return done();
        key = keys[idx++];
        paramValue = layer.params[key];
        paramCallbacks = params[key];
        if(paramValue === undefined || paramCallbacks === undefined){
            return param();
        }

        if(called[key]){
            return param();
        }else{
            paramIndex = 0;
            called[key] = {
                value: paramValue
            }
            paramCallback()
        }
    }

    function paramCallback(){
        let fn = paramCallbacks[paramIndex++];

        if(!fn) return param();
        fn(req,res,paramCallback,paramValue,key);
    }
}

proto.use = function(fn){
    let path = '/';
    let offset = 0;
    if(typeof fn !== 'function'){
        path = fn;
        offset = 1;
    }

    let fns = ([]).slice.call(arguments,offset);
    fns.forEach(cb => {
        let layer = new Layer(path,{
            end: false
        },cb);
        layer.route = undefined;
        this.stack.push(layer);
    });
    return this;
}

proto.route = function(path){
    const route = new Route(path);
    let layer = new Layer(path,{
        end: true
    },route.dispatch.bind(route));
    layer.route = route;
    this.stack.push(layer);
    return route;
}

proto.get = function(path,...cbs){
    const route = this.route(path);
    route.get(...cbs);
    return this;
}