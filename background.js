/*global require, chrome, alert */



chrome.browserAction.onClicked.addListener(function() {

    chrome.tabs.create({url: "loading.html"}, function(tab) {
        requestAuthentication(tab.id);
    });
});
