const Router = require('./router');
const app = require('./application');
function createApplication(){
    return app;
}

createApplication.Router = Router;

module.exports = createApplication;