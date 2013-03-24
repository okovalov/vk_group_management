/*global document, chrome, alert, XMLHttpRequest, handleError, appendToBody */

/**
 * @author    Oleksandr Kovalov <oleksandrk@nationalfibre.net>
 * @copyright 2013 Oleksandr Kovalov
 * @license   http://spdx.org/licenses/MIT MIT License
 * @link      https://github.com/...
 */

function updateRequestedFriendNumber(idx) {
    "use strict";

    document.getElementById('current_friend_number').innerHTML = idx + 1;
}

function getFriendsListCallback(additionalParameters, e) {
    "use strict";

    var answer = JSON.parse(e.target.response);

    if (answer.error !== undefined) {
        handleError(answer.error);

        return;
    }

    friendsMembersOfTheGroup    = [];
    friendsNotMembersOfTheGroup = [];
    friendsInvitedToTheGroup    = [];

    friendsListGlobal = answer.response;

    getGroupMembersList();
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

function checkFriendIsInGroupCallback(additionalParameters, e) {
    "use strict";

    var answer = JSON.parse(e.target.response),
        friendInfo,
        friend,
        idx = additionalParameters.idx,
        gid = additionalParameters.gid,
        tmpFriend;

    if (answer.error !== undefined) {
        handleError(answer.error);

        return;
    }

    friendInfo = answer.response;
    friend     = friendsListGlobal[idx];
    tmpFriend  = {'uid': friend.uid, 'first_name': friend.first_name, 'last_name': friend.last_name};

    if (friendInfo.member === 1) {
        friendsMembersOfTheGroup.push(tmpFriend);

        return getNextFriendInfo(idx, gid);
    }

    if (friendInfo.invited !== undefined) {
        friendsInvitedToTheGroup.push(friendsListGlobal[idx]);
    }

    friendsNotMembersOfTheGroup.push(tmpFriend);

    return getNextFriendInfo(idx, gid);
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
            'idx' : idx,
            'gid' : gid
        };

    updateRequestedFriendNumber(idx);

    vkApiInstance.get('groups.isMember', checkFriendIsInGroupCallback, this, parameters, additionalParameters);
}

function getNextFriendInfo(idx, gid) {
    "use strict";

    if (friendsListGlobal[idx + 1] === undefined) {

        saveFriendsDataToSotrage(function () {
            updateFriendsDataLables();
        });

        return;
    }

    setTimeout(function () {
        checkFriendIsInGroup(idx + 1, gid);
    }, 150);
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

function updateFriendsDataLables() {
    appendToBody('p', 'innerHTML', 'Friends count: ' + friendsListGlobal.length);
    appendToBody('p', 'innerHTML', 'Group members count: ' + membersListGlobal.count);

    appendToBody('p', 'innerHTML', '<br/>Friends - members of the group count: ' + friendsMembersOfTheGroup.length);
    appendToBody('p', 'innerHTML', 'Friends - invited to the group count: ' + friendsInvitedToTheGroup.length);
    appendToBody('p', 'innerHTML', 'Friends - not members of the group count: ' + friendsNotMembersOfTheGroup.length);

    showDoneWrapHideLoadingWrap();
}

function showDoneWrapHideLoadingWrap() {
    document.getElementById('wrap-done').style.display = '';
    document.getElementById('wrap-done').style.hidden = '';

    document.getElementById('wrap').style.display = 'none';
    document.getElementById('wrap').style.hidden = 'hidden';
}

function hideDoneWrapShowLoadingWrap() {

    document.getElementById('wrap-done').style.display = 'none';
    document.getElementById('wrap-done').style.hidden = 'hidden';

    document.getElementById('wrap').style.display = '';
    document.getElementById('wrap').style.hidden = '';
}

function reloadFriendsList() {
    clearBodyContent();
    hideDoneWrapShowLoadingWrap();
    getFriendsList();

    return;
}

document.addEventListener('DOMContentLoaded', function () {
    "use strict";

    getAuthenticated();

    document.getElementById('details_page_link').addEventListener('click', function () {

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
    });

    document.getElementById('logout').addEventListener('click', function () {
        chrome.storage.local.remove('vk_access_token');
        vkGlobalAccessToken = undefined;
        window.close();
    });

    document.getElementById('reload_friends_list').addEventListener('click', reloadFriendsList);

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
});

