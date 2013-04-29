/*global clearBodyContent, document, chrome, alert, XMLHttpRequest,setTimeout, extend, handleError, appendToBody, reloadFriendsList, getGroupMembersList, this */

/**
 * @author    Oleksandr Kovalov <oleksandrk@nationalfibre.net>
 * @copyright 2013 Oleksandr Kovalov
 * @license   http://spdx.org/licenses/MIT MIT License
 * @link      https://github.com/...
 */

var friendsMembersOfTheGroup,
    friendsNotMembersOfTheGroup,
    friendsInvitedToTheGroup,
    friendsListGlobal,
    membersListGlobal,
    friendsWithHash = {};

function updateRequestedFriendNumber(idx) {
    "use strict";

    document.getElementById('current_friend_number').innerHTML = idx + 1;
}

function showDoneWrapHideLoadingWrap() {
    "use strict";

    document.getElementById('wrap-done').style.display = '';
    document.getElementById('wrap-done').style.hidden = '';

    document.getElementById('wrap').style.display = 'none';
    document.getElementById('wrap').style.hidden = 'hidden';
}

function hideDoneWrapShowLoadingWrap() {
    "use strict";

    document.getElementById('wrap-done').style.display = 'none';
    document.getElementById('wrap-done').style.hidden = 'hidden';

    document.getElementById('wrap').style.display = '';
    document.getElementById('wrap').style.hidden = '';
}

function updateFriendsDataLables() {
    "use strict";

    appendToBody('p', 'innerHTML', 'Friends count: ' + friendsListGlobal.length);
    appendToBody('p', 'innerHTML', 'Group members count: ' + membersListGlobal.count);

    appendToBody('p', 'innerHTML', '<br/>Friends - members of the group count: ' + friendsMembersOfTheGroup.length);
    appendToBody('p', 'innerHTML', 'Friends - invited to the group count: ' + friendsInvitedToTheGroup.length);
    appendToBody('p', 'innerHTML', 'Friends - not members of the group count: ' + friendsNotMembersOfTheGroup.length);

    showDoneWrapHideLoadingWrap();
}

function saveFriendsDataToSotrage(callback) {
    "use strict";

    var vk_gm_all_friends_data = {
        'membersListGlobal':           membersListGlobal,
        'friendsListGlobal':           friendsListGlobal,
        'friendsMembersOfTheGroup':    friendsMembersOfTheGroup,
        'friendsNotMembersOfTheGroup': friendsNotMembersOfTheGroup,
        'friendsInvitedToTheGroup':    friendsInvitedToTheGroup
    };

    chrome.storage.local.set({'vk_gm_all_friends_data': vk_gm_all_friends_data}, function () {
        callback();
    });
}

function getNextFriendInfo(idx, gid, callbackToCheckFriends) {
    "use strict";

    if (friendsListGlobal[idx + 1] === undefined) {

        saveFriendsDataToSotrage(function () {
            updateFriendsDataLables();
        });

        return;
    }

    setTimeout(function () {
        callbackToCheckFriends(idx + 1, gid);
    }, 150);
}

function checkFriendIsInGroupCallback(additionalParameters, e) {
    "use strict";

    var answer = JSON.parse(e.target.response),
        friendInfo,
        friend,
        idx = additionalParameters.idx,
        gid = additionalParameters.gid,
        callbackToCheckFriends = additionalParameters.callbackToCheckFriends,
        tmpFriend;

    if (answer.error !== undefined) {
        handleError(answer.error);

        return;
    }

    friendInfo = answer.response;
    friend     = friendsListGlobal[idx];
    tmpFriend  = {'uid': friend.uid, 'first_name': friend.first_name, 'last_name': friend.last_name};

    if (friendInfo.member === 1) {
        friendsMembersOfTheGroup.push(extend(tmpFriend));

        return getNextFriendInfo(idx, gid, callbackToCheckFriends);
    }

    if (friendInfo.invitation !== undefined) {
        friendsInvitedToTheGroup.push(extend(tmpFriend));
    }

    if (friendsWithHash[friend.uid] !== undefined) {
        tmpFriend.hash = friendsWithHash[friend.uid][11];
    }

    friendsNotMembersOfTheGroup[friend.uid] = extend(tmpFriend);
    friendsNotMembersOfTheGroup.length += 1;

    return getNextFriendInfo(idx, gid, callbackToCheckFriends);
}

function checkFriendIsInGroup(idx, gid) {
    "use strict";

    var parameters = {
            'access_token' : vkGlobalAccessToken,
            'gid'          : gid,
            'uid'          : friendsListGlobal[idx].uid,
            'extended'     : 1
        },
        additionalParameters = {
            'idx'                    : idx,
            'gid'                    : gid,
            'callbackToCheckFriends' : checkFriendIsInGroup
        };

    updateRequestedFriendNumber(idx);

    vkApiInstance.get('groups.isMember', checkFriendIsInGroupCallback, this, parameters, additionalParameters);
}

function getFriendsListCallback(additionalParameters, e) {
    "use strict";

    var answer = JSON.parse(e.target.response);

    if (answer.error !== undefined) {
        handleError(answer.error);

        return;
    }

    friendsMembersOfTheGroup    = [];
    friendsNotMembersOfTheGroup = {};
    friendsInvitedToTheGroup    = [];

    friendsListGlobal = answer.response;

    getNonGroupMembersList();

}

function getFriendsList() {
    "use strict";

    var parameters = {
            'access_token' : vkGlobalAccessToken,
            'fields'       : 'uid,first_name,last_name'
        };

    vkApiInstance.get('friends.get', getFriendsListCallback, this, parameters);
}

function getGroupMembersListCallback(additionalParameters, e) {
    "use strict";

    var answer = JSON.parse(e.target.response);

    if (answer.error !== undefined) {
        handleError(answer.error);

        return;
    }

    membersListGlobal = answer.response;

    checkFriendIsInGroup(0, vkGroupId);
}

function getGroupMembersList() {
    "use strict";

    var parameters = {
            'access_token' : vkGlobalAccessToken,
            'gid'          : vkGroupId,
            'sort'         : 'id_asc'
        };

    vkApiInstance.get('groups.getMembers', getGroupMembersListCallback, this, parameters);
}

function getNonGroupMembersListCallback(additionalParameters, e) {
    "use strict";

    var answer             = e.target.response,
        callback           = additionalParameters.callback,
        i,
        friends,
        friendListLength,
        friend;

    try {
        answer = answer.substr(answer.indexOf('{"all'));
        answer = answer.substr(0, answer.indexOf("all_requests") - 2) + "}";
        answer = answer.replace(/'/g, '"');
        answer = JSON.parse(answer);

    } catch (err) {
        handleError('Error to parse non-group members. Invitations will not work');

        return;
    }

    friends          = answer.all;
    friendListLength = friends.length;

    for (i = 0; i < friendListLength; i += 1) {
        friend = friends[i];

        if (friend.length !== undefined) {
            friendsWithHash[friend[0]] = friend;
        }
    }

    friendsNotMembersOfTheGroup.length = 0;

    getGroupMembersList();
}

function getNonGroupMembersList(callback) {
    "use strict";

    var parameters,
        additionalParameters;

    additionalParameters = {
        'callback' : callback,
        'postRequest' : true,
        'postUrl' : 'http://vk.com/al_friends.php',
        'postParameters' : {
            'field' : [
                {'fieldName': 'act', 'fieldValue' : 'load_friends_silent'},
                {'fieldName': 'al', 'fieldValue' : '1'},
                {'fieldName': 'gid', 'fieldValue' : vkGroupId},
                {'fieldName': 'id', 'fieldValue' :  vkMemberId}
            ]
        }
    }

    vkApiInstance.get('', getNonGroupMembersListCallback, this, parameters, additionalParameters, 'POST');
}

function onReloadFriendsListLinkClick() {
    "use strict";

    clearBodyContent();
    hideDoneWrapShowLoadingWrap();
    getFriendsList();

    return;
}

function onDetailsPageLinkClick() {
    "use strict";

    chrome.tabs.getCurrent(function (tab) {

        chrome.tabs.update(
            tab.id,
            {
                'url'   : 'details/details.html',
                'active': true
            },
            function (tab) {}
        );

    });
}

function onLogoutLinkClick() {
    chrome.storage.local.remove('vk_access_token');
    vkGlobalAccessToken = undefined;

    chrome.tabs.getCurrent(function (tab) {
        chrome.tabs.remove(tab.id);
    });
}

function loadDateFromStorage(callback) {
    "use strict";

    chrome.storage.local.get({'vk_gm_all_friends_data': {}}, function (items) {

        if (items.vk_gm_all_friends_data.friendsListGlobal === undefined) {

            reloadFriendsList();

            return;
        }

        membersListGlobal           = items.vk_gm_all_friends_data.membersListGlobal;
        friendsListGlobal           = items.vk_gm_all_friends_data.friendsListGlobal;
        friendsMembersOfTheGroup    = items.vk_gm_all_friends_data.friendsMembersOfTheGroup;
        friendsNotMembersOfTheGroup = items.vk_gm_all_friends_data.friendsNotMembersOfTheGroup;
        friendsInvitedToTheGroup    = items.vk_gm_all_friends_data.friendsInvitedToTheGroup;

        updateFriendsDataLables();
    });
}

document.addEventListener('DOMContentLoaded', function () {
    "use strict";

    document.getElementById('details_page_link').addEventListener('click', onDetailsPageLinkClick);
    document.getElementById('logout').addEventListener('click', onLogoutLinkClick);
    document.getElementById('reload_friends_list').addEventListener('click', onReloadFriendsListLinkClick);


    getAuthenticated(loadDateFromStorage);
});
