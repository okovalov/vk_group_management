/*global document, chrome, alert, XMLHttpRequest */

function setVkAccessToken(vkAccessToken, tabId) {
    chrome.storage.local.set({'vk_access_token': vkAccessToken}, function () {
        vkGlobalAccessToken = vkAccessToken;

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

function authenticationListener(authenticationTabId) {
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

function requestAuthentication(tabId) {
    "use strict";

    var vkAuthenticationUrl      = 'https://oauth.vk.com/authorize',
        vkCLientId               = '3470032',
        // vkCLientId               = '3315996',
        vkRequestedScopes        = 'docs,offline,friends,groups,messages',
        authenticationParameters = {
            'client_id'     : vkCLientId,
            'scope'         : vkRequestedScopes,
            'redirect_uri'  : "http://oauth.vk.com/blank.html",
            'display'       : 'page',
            'response_type' : 'token'
        },
        urlParameters = '?' + serialize(authenticationParameters);

    vkAuthenticationUrl += urlParameters;

    chrome.storage.local.get({'vk_access_token': {}}, function (items) {

        if (items.vk_access_token.length === undefined) {

            chrome.tabs.update(
                tabId,
                {
                    'url'   : vkAuthenticationUrl,
                    'active': true
                },
                function (tab) {
                    chrome.tabs.onUpdated.addListener(authenticationListener(tab.id));
                }
            );

            return;
        }

        setVkAccessToken(items.vk_access_token, tabId);
    });
}

