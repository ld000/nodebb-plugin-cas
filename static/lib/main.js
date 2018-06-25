"use strict";

$(document).ready(function () {
    console.log('nodebb-plugin-cas-login: loaded');

    // if ('/login/cas' !== location.pathname) {
    //     return;
    // }

    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    $.post('/api/login/cas?ticket=' + getParameterByName('ticket'))
        .done(function (resp) {
            location.href = resp;
        })
        .fail(function (err) {
            console.log(err);
        });

    // Note how this is shown in the console on the first load of every page
});