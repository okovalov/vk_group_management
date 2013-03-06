/*global document, chrome, alert, XMLHttpRequest */

function handleError(error) {
    "use strict";

    var errorMessageElement;

    chrome.storage.local.remove('vk_access_token');

    errorMessageElement = document.createElement('h1');
    errorMessageElement.textContent = error.error_msg;
    document.body.appendChild(errorMessageElement);
}

function serialize(obj, prefix) {
    "use strict";

    var str = [],
        p,
        k,
        v;

    for (p in obj) {
        k = prefix ? prefix + "[" + p + "]" : p;
        v = obj[p];
        str.push(typeof v === "object" ? serialize(v, k) : encodeURIComponent(k) + "=" + encodeURIComponent(v));
    }

    return str.join("&");
}

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

function createHtmlFromString(stringAnswer) {
    "use strict";

    var doc = document.implementation.createHTMLDocument('example');

    doc.documentElement.innerHTML = stringAnswer;

    return doc;
}

var vkGlobalAccessToken,
    VkApi = function () {
        "use strict";

        var vkURL   = 'https://api.vk.com/method/',
            request = new XMLHttpRequest();

        this.get = function (methodName, onloadCallaback, callerInstance, incomingParameters, incomingRequestType) {
            var parameters    = incomingParameters === undefined ? undefined : incomingParameters,
                requestType   = incomingRequestType === undefined ? 'GET' : incomingRequestType,
                urlParameters = parameters !== undefined ? '?' + serialize(parameters) : '';

            request.open(requestType,  vkURL + methodName + urlParameters, true);
            request.onload = onloadCallaback.bind(callerInstance);
            request.send(null);
        };
    },
    vkApiInstance = new VkApi();

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

                chrome.storage.local.set({'vk_access_token': vkAccessToken}, function () {
                    vkGlobalAccessToken = vkAccessToken;

                    requestFriendsInfo();
                });
            }
        }
    };
}

function requestAuthentication() {
    "use strict";

    var vkAuthenticationUrl      = 'https://oauth.vk.com/authorize',
        vkCLientId               = '3470032',
        vkRequestedScopes        = 'docs,offline,friends,groups',
        authenticationParameters = {
            'client_id'     : vkCLientId,
            'scope'         : vkRequestedScopes,
            'redirect_uri'  : encodeURIComponent("http://oauth.vk.com/blank.html"),
            'display'       : 'page',
            'response_type' : 'token'
        },
        urlParameters = '?' + serialize(authenticationParameters);

    vkAuthenticationUrl += urlParameters;

    if (vkGlobalAccessToken !== undefined) {
        requestFriendsInfo();
    }

    chrome.storage.local.get({'vk_access_token': {}}, function (items) {

        if (items.vk_access_token.length === undefined) {
            chrome.tabs.create({url: vkAuthenticationUrl, selected: true}, function (authenticationTab) {
                chrome.tabs.onUpdated.addListener(authenticationListener(authenticationTab.id));
            });

            return;
        }

        vkGlobalAccessToken = items.vk_access_token;

        requestFriendsInfo();
    });
}

function showFriends(e) {
    "use strict";

    var answer = JSON.parse(e.target.response),
        friends,
        friendsInfo;

    if (answer.error !== undefined) {
        handleError(answer.error);

        return;
    }

    friends = answer.response;

    friendsInfo           = document.createElement('p');
    friendsInfo.innerHTML = 'Friends count: ' + friends.length;

    document.body.appendChild(friendsInfo);

    requestGroupMembersList();
}

function requestFriendsInfo(friendsGenerator) {
    "use strict";

    var parameters = {
            'access_token' : vkGlobalAccessToken,
            'fields'       : 'uid,first_name,last_name'
        };

    vkApiInstance.get('friends.get', showFriends, this, parameters);
}

function showMembers(e) {
    "use strict";

    var answer = JSON.parse(e.target.response),
        members,
        membersInfo;

    if (answer.error !== undefined) {
        handleError(answer.error);

        return;
    }

    members = answer.response;

    membersInfo           = document.createElement('p');
    membersInfo.innerHTML = 'Group members count: ' + members.count;

    document.body.appendChild(membersInfo);
}

function requestGroupMembersList() {
    "use strict";

    var parameters = {
            'access_token' : vkGlobalAccessToken,
            'gid'          : 49912690,
            'sort'         : 'id_asc'
        };

    vkApiInstance.get('groups.getMembers', showMembers, this, parameters);
}

document.addEventListener('DOMContentLoaded', function () {
    "use strict";

    requestAuthentication();
});
