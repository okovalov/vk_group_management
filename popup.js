/*global document, chrome, alert, XMLHttpRequest */

var QUERY                = 'kittens';

/**
 * Display an alert with an error message, description
 *
 * @param  {string} textToShow  Error message text
 * @param  {string} errorToShow Error to show
 */
function displayeAnError(textToShow, errorToShow) {
    "use strict";

    alert(textToShow + '\n' + errorToShow);
}

/**
 * Retrieve a value of a parameter from the given URL string
 *
 * @param  {string} url           Url string
 * @param  {string} parameterName Name of the parameter
 *
 * @return {string}               Value of the parameter
 */
function getUrlParameterValue(url, parameterName) {
    "use strict";

    var urlParameters  = url.substr(url.indexOf("#") + 1),
        parameterValue = "",
        index,
        temp;

    urlParameters = urlParameters.split("&");

    for (index = 0; index < urlParameters.length; index += 1) {
        temp = urlParameters[index].split("=");

        if (temp[0] === parameterName) {
            return temp[1];
        }
    }

    return parameterValue;
}

var friendsGenerator = {

    authenticationListener: function (authenticationTabId, requestFriendsInfo, showFriends) {
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

                    chrome.storage.local.set({'vk_access_token': vkAccessToken}, function () {
                        console.log('just already authorized with', vkAccessToken);
                        requestFriendsInfo(vkAccessToken, showFriends);
                    });
                }
            }
        };
    },

    requestAuthentication: function () {

        "use strict";

        var imageUploadHelperUrl   = 'upload.html#',
            vkCLientId             = '3470032',
            authenticationListener = this.authenticationListener,
            requestFriendsInfo     = this.requestFriendsInfo,
            showFriends            = this.showFriends,
            vkRequestedScopes      = 'docs,offline,friends,groups',
            vkAuthenticationUrl    = 'https://oauth.vk.com/authorize?client_id=' + vkCLientId + '&scope=' + vkRequestedScopes + '&redirect_uri=http%3A%2F%2Foauth.vk.com%2Fblank.html&display=page&response_type=token';

        chrome.storage.local.get({'vk_access_token': {}}, function (items) {

            if (items.vk_access_token.length === undefined) {
                chrome.tabs.create({url: vkAuthenticationUrl, selected: true}, function (authenticationTab) {
                    chrome.tabs.onUpdated.addListener(authenticationListener(authenticationTab.id, requestFriendsInfo, showFriends));
                });

                return;
            }

            requestFriendsInfo(items.vk_access_token, showFriends);
        });
    },

    showFriends: function (e) {
        "use strict";

        var i,
            friends,
            errorMessage,
            answer = JSON.parse(e.target.response),
            friendsList,
            friendItem;

        if (answer.error !== undefined) {
            chrome.storage.local.remove('vk_access_token');

            errorMessage = document.createElement('h1');
            errorMessage.textContent = answer.error.error_msg;
            document.body.appendChild(errorMessage);

            return;
        }

        friends = answer.response;

        friendsList = document.createElement('ul');

        document.body.appendChild(friendsList);

        for (i = 0; i < friends.length; i += 1) {
            friendItem = document.createElement('li');
            friendItem.innerHTML = friends[i].first_name + ' ' + friends[i].last_name;
            friendsList.appendChild(friendItem);

        }
    },

    requestFriendsInfo: function (vkAccessToken, showFriends) {
        "use strict";

        var req = new XMLHttpRequest();

        req.open("GET", 'https://api.vk.com/method/friends.get?access_token=' + vkAccessToken + '&fields=uid,first_name,last_name', true);
        req.onload = showFriends.bind(this);
        req.send(null);
    }

};


document.addEventListener('DOMContentLoaded', function () {
    "use strict";

    friendsGenerator.requestAuthentication();
});
