/*global require, chrome, alert */

/**
 * Chrome tab update listener handler. Return a function which is used as a listener itself by chrome.tabs.obUpdated
 *
 * @param  {string} authenticationTabId Id of the tab which is waiting for grant of permissions for the application
 * @param  {string} imageSourceUrl      URL of the image which is uploaded
 *
 * @return {function}                   Listener for chrome.tabs.onUpdated
 */
function listenerHandlerA(authenticationTabId) {
    "use strict";

    return function tabUpdateListener(tabId, changeInfo) {
        var vkAccessToken,
            vkAccessTokenExpiredFlag;

        if (tabId === authenticationTabId && changeInfo.url !== undefined && changeInfo.status === "loading") {

            if (changeInfo.url.indexOf('oauth.vk.com/blank.html') > -1) {
                authenticationTabId = null;
                chrome.tabs.onUpdated.removeListener(tabUpdateListener);

                vkAccessToken = getUrlParameterValue(changeInfo.url, 'access_token');

                if (vkAccessToken === undefined || vkAccessToken.length === undefined) {
                    displayeAnError('vk auth response problem', 'access_token length = 0 or vkAccessToken == undefined');
                    return;
                }

                vkAccessTokenExpiredFlag = Number(getUrlParameterValue(changeInfo.url, 'expires_in'));

                if (vkAccessTokenExpiredFlag !== 0) {
                    displayeAnError('vk auth response problem', 'vkAccessTokenExpiredFlag != 0' + vkAccessToken);
                    return;
                }

                setVkAccessToken(vkAccessToken, tabId);
            }
        }
    };
}

function setVkAccessToken(vkAccessToken, tabId) {
    chrome.storage.local.set({'vkaccess_token': vkAccessToken}, function () {
        chrome.tabs.update(
            tabId,
            {
                'url'   : 'hello.html',
                'active': true
            },
            function (tab) {}
        );
    });
}

/**
 * Handle main functionality of 'onlick' chrome context menu item method
 */
function getClickHandlerA(tabId) {
    "use strict";

    var vkCLientId           = '3470032',
        vkRequestedScopes    = 'docs,offline',
        vkAuthenticationUrl  = 'https://oauth.vk.com/authorize?client_id=' + vkCLientId + '&scope=' + vkRequestedScopes + '&redirect_uri=http%3A%2F%2Foauth.vk.com%2Fblank.html&display=page&response_type=token';

    chrome.storage.local.get({'vkaccess_token': {}}, function (items) {

        if (items.vkaccess_token.length === undefined) {

            chrome.tabs.update(
                tabId,
                {
                    'url'   : vkAuthenticationUrl,
                    'active': true
                },
                function (tab) {
                    chrome.tabs.onUpdated.addListener(listenerHandlerA(tab.id));
                }
            );

            // chrome.tabs.create({url: vkAuthenticationUrl, selected: true}, function (tab) {
            //     chrome.tabs.onUpdated.addListener(listenerHandlerA(tab.id));
            // });

            return;
        }

        setVkAccessToken(items.vkaccess_token, tabId);

    });

}

chrome.browserAction.onClicked.addListener(function() {

    chrome.tabs.create({url: "loading.html"}, function(tab) {
        getClickHandlerA(tab.id);
    });
});
