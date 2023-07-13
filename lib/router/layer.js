function path_to_regexp(path,keys,options){
    path = '^' + path;
    path = path.replace(/([\.\/])/g,'\\$1').replace(/:(\w+)/g,function(match,key){
        keys.push(key);
        return '([^/]+)';
    });

    path += options.end === false ? '(?=\/|$)' : '$';
    return new RegExp(path,'i');
}

function Layer(path,options={},fn){
    this.handle = fn;
    this.path = '';
    this.params = {};
    this.keys = [];
    this.regexp = path_to_regexp(path,this.keys,options);
    this.regexp.fast_slash = path === '/' && options.end === false;
}

Layer.prototype.match = function(path){
    if(this.regexp.fast_slash){
        return true;
    }

    const match = this.regexp.exec(path);
    if(!match) return false;
    this.path = match[0];
    for(let i = 0;i < this.keys.length;i++){
        this.params[this.keys[i]] = match[i + 1];
    }
    return true;
}

Layer.prototype.handle_request = function(req,res,next){
    const fn = this.handle;
    if(fn.length !== 3){
        return next();
    }
    fn(req,res,next);
}

Layer.prototype.handle_error = function(err,req,res,next){
    const fn = this.handle;
    if(fn.length !== 4){
        return next(err);
    }
    fn(err,req,res,next);
}

module.exports = Layer;