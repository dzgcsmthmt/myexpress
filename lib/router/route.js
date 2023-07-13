const Layer = require('./layer');
function Route(path){
    this.path = path;
    this.methods = {};
    this.stack = [];
}

Route.prototype.dispatch = function(req,res,done){
    let idx = 0;
    let stack = this.stack;
    next();
    function next(err){
        if(err === 'route'){
            return done(err);
        }
        const layer = stack[idx++];
        if(!layer) return done(err);
        if(layer.method && layer.method !== req.method.toLowerCase()){
            next(err)
        }else{
            if(err){
                layer.handle_error(err,req,res,next);
            }else{
                layer.handle_request(req,res,next);
            }
        }
    }
}

Route.prototype.handle_methods = function(method){
    if(this.methods._all) return true;
    return !!this.methods[method.toLowerCase()];
}

Route.prototype.all = function(...cbs){
    for(let cb of cbs){
        let layer = new Layer('/',{},cb);
        this.methods._all = true;
        layer.method = undefined;
        this.stack.push(layer);
    }
    return this;
}

Route.prototype.get = function(...cbs){
    for(let cb of cbs){
        let layer = new Layer('/',{},cb);
        this.methods.get = true;
        layer.method = 'get';
        this.stack.push(layer);
    }
    return this;
}

module.exports = Route;