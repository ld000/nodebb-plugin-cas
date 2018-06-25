"use strict";

var controllers = require('./lib/controllers');
var pluginJson = require('./plugin.json');
var plugin = {};

plugin.init = function (params, callback) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
    var router = params.router,
        hostMiddleware = params.middleware,
        hostControllers = params.controllers;

    router.post('/api/login/cas', controllers.authByCAS, hostControllers.authentication.login);
    router.get('/login/cas', hostMiddleware.buildHeader, controllers.renderCASLoginPage);

    router.get('/login', controllers.redirectToCAS);
    router.get('/api/login', controllers.redirectAPIToCAS);
    router.get('/register', controllers.redirectToRegister);
    router.get('/api/register', controllers.redirectAPIToRegister);

    // router.get('*', controllers.redirectToCAS);

    callback();
};

plugin.loggedOut = function (params, callback) {
    var res = params.res;
    var url = pluginJson.CASLogoutUrl
    return res.set('X-Redirect', encodeURI(url)).status(200).json({
      external: url
    });
    // var router = paramis.router;
    // router.get('/login', controllers.redirectToCAS);
    // router.get('/api/login', controllers.redirectAPIToCAS);
    // router.get('/register', controllers.redirectToRegister);
    // router.get('/api/register', controllers.redirectAPIToRegister);
};

module.exports = plugin;