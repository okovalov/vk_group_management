/*global require, chrome, alert */

chrome.browserAction.onClicked.addListener(function () {
    "use strict";

    chrome.tabs.create({url: "loading.html"}, function (tab) {
        requestAuthentication(tab.id);
    });
});

