"use strict";

var request = module.parent.parent.require('request');
var _ = module.parent.parent.require('lodash');
var meta = require.main.require('./src/meta');
var User = require.main.require('./src/user');
var xml2js = module.parent.parent.require('xml2js');
var async = module.parent.parent.require('async');
var pluginJson = require('../plugin.json');
var Controllers = {};

var nodeBBUrl = pluginJson.nodeBBUrl;
var CASServerPrefix = pluginJson.CASServerPrefix;
var userCenterPrefix = pluginJson.userCenterPrefix;

User.uniqueUsername = function (userData, callback) {
    var numTries = 0;

    function go(username) {
        async.waterfall([
            function (next) {
                meta.userOrGroupExists(username, next);
            },
            function (exists) {
                if (!exists) {
                    return callback(null, numTries ? username : null);
                }
                username = userData.username + '-' + numTries.toString(32);
                numTries += 1;
                go(username);
            },
        ], callback);
    }

    go(userData.userslug);
};

Controllers.authByCAS = function (req, res, next) {
    var ticket = req.query.ticket;

    async.waterfall([function (done) {
        const url = `${CASServerPrefix}/p3/serviceValidate?ticket=${ticket}&service=${nodeBBUrl}`;
        request.get({
            url
        }, function (err, msg, res) {
            done(err, res)
        });
    }, function (text, done) {
        console.log(text);
        xml2js.parseString(text, done);
    }, function (json, done) {
        var attributes = _.get(json, 'cas:serviceResponse.cas:authenticationSuccess.0.cas:attributes.0');
        if (!attributes) {
            return done(new Error("Auth failed"));
        }
        var keys = Object.keys(attributes);
        var userInfo = {};
        keys.forEach(key => {
            userInfo[key] = attributes[key][0]
        });

        done(null, userInfo);
    }], function (err, userInfo) {
        if (err) {
            return res.status(500).json("");
        }
        req.body.username = userInfo['cas:username'];
        req.body.password = userInfo['cas:originPassword'];

        next()
    });
};

Controllers.redirectToCAS = function (req, res, next) {
    var url = `${CASServerPrefix}/login?service=${nodeBBUrl}`;
    if (res.locals.isAPI) {
        res.set('X-Redirect', encodeURI(url)).status(200).json({
            external: url
        });
    } else {
        res.redirect(url)
    }
};

Controllers.redirectToRegister = function (req, res, next) {
    var url = `${userCenterPrefix}`;
    if (res.locals.isAPI) {
        res.set('X-Redirect', encodeURI(url)).status(200).json({
            external: url
        });
    } else {
        res.redirect(url)
    }
};

Controllers.redirectAPIToRegister = function (req, res, next) {
    var url = `${userCenterPrefix}`;
    res.set('X-Redirect', encodeURI(url)).status(200).json({
        external: url
    });
};

Controllers.redirectAPIToCAS = function (req, res, next) {
    var url = `${CASServerPrefix}/login?service=${nodeBBUrl}`;
    res.set('X-Redirect', encodeURI(url)).status(200).json({
        external: url
    });
};

Controllers.renderCASLoginPage = function (req, res, next) {
    res.render('casLogin', {});
};

module.exports = Controllers;