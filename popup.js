/*global document, chrome, alert, XMLHttpRequest */

/**
 * @author    Oleksandr Kovalov <oleksandrk@nationalfibre.net>
 * @copyright 2013 Oleksandr Kovalov
 * @license   http://spdx.org/licenses/MIT MIT License
 * @link      https://github.com/...
 */

function updateRequestedFriendNumber(idx) {
    document.getElementById('current_friend_number').innerHTML = idx + 1;
}

function getFriendsListCallback(additionalParameters, e) {
    "use strict";

    var answer = JSON.parse(e.target.response);

    if (answer.error !== undefined) {
        handleError(answer.error);

        return;
    }

    friendsListGlobal = answer.response;

    appendToBody('p', 'innerHTML', 'Friends count: ' + friendsListGlobal.length);

    getGroupMembersList();
}

function getFriendsList(friendsGenerator) {
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

    appendToBody('p', 'innerHTML', 'Group members count: ' + membersListGlobal.count);

    friendsMembersOfTheGroup    = [];
    friendsNotMembersOfTheGroup = [];
    friendsInvitedToTheGroup    = [];

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

function saveFriendsDataToSotrage() {
    "use strict";

    var vk_gm_all_friends_data = {
        'membersListGlobal' : membersListGlobal,
        'friendsListGlobal' : friendsListGlobal,
        'friendsMembersOfTheGroup' : friendsMembersOfTheGroup,
        'friendsNotMembersOfTheGroup' : friendsNotMembersOfTheGroup,
        'friendsInvitedToTheGroup' : friendsInvitedToTheGroup
    };

    chrome.storage.local.set({'vk_gm_all_friends_data': vk_gm_all_friends_data}, function () {

    });
}

function updateFriendsDataLables() {
    appendToBody('p', 'innerHTML', '<br/>Friends - members of the group count: ' + friendsMembersOfTheGroup.length);
    appendToBody('p', 'innerHTML', 'Friends - invited to the group count: ' + friendsInvitedToTheGroup.length);
    appendToBody('p', 'innerHTML', 'Friends - not members of the group count: ' + friendsNotMembersOfTheGroup.length);

    showDoneWrapHideLoadingWrap();
}

function getNextFriendInfo(idx, gid) {
    if (friendsListGlobal[idx + 1] === undefined) {

        saveFriendsDataToSotrage();
        updateFriendsDataLables();

        return;
    }

    setTimeout(function () {
        checkFriendIsInGroup(idx + 1, gid);
    }, 150);
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

document.addEventListener('DOMContentLoaded', function () {
    "use strict";

    document.getElementById('details_page_link').addEventListener('click', function () {

        chrome.tabs.create({url: 'details/details.html', selected: true}, function (tab) {
            window.close();
        });

    });

    document.getElementById('reload_friends_list').addEventListener('click', function () {

        clearBodyContent();
        hideDoneWrapShowLoadingWrap();
        requestAuthentication();

        return;
    });

    document.getElementById('open_in_a_tab').addEventListener('click', function () {

        chrome.tabs.create({url: 'popup.html', selected: true}, function (tab) {
            window.close();
        });
    });

    chrome.storage.local.get({'vk_gm_all_friends_data': {}}, function (items) {

        if (items.vk_gm_all_friends_data.friendsListGlobal === undefined) {

            requestAuthentication();

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

