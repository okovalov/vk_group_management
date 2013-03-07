/*global document, chrome, alert, XMLHttpRequest */


var vkGlobalAccessToken,
    VkApi = function () {
        "use strict";

        var vkURL   = 'https://api.vk.com/method/',
            request = new XMLHttpRequest();

        this.get = function (methodName, onloadCallaback, callerInstance, incomingParameters, incomingAdditionalParameters, incomingRequestType) {
            var parameters    = incomingParameters === undefined ? undefined : incomingParameters,
                requestType   = incomingRequestType === undefined ? 'GET' : incomingRequestType,
                additionalParameters = incomingAdditionalParameters === undefined ? undefined : incomingAdditionalParameters,
                urlParameters = parameters !== undefined ? '?' + serialize(parameters) : '';

            request.open(requestType,  vkURL + methodName + urlParameters, true);
            request.onload = onloadCallaback.bind(callerInstance, additionalParameters);
            request.send(null);
        };
    },
    vkApiInstance = new VkApi(),
    membersListGlobal,
    friendsListGlobal;

function showFriends(additionalParameters, e) {
    "use strict";

    var answer = JSON.parse(e.target.response),
        friends,
        friendsInfo;

    if (answer.error !== undefined) {
        handleError(answer.error);

        return;
    }

    friends = answer.response;
    friendsListGlobal = friends;

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

function showMembers(additionalParameters, e) {
    "use strict";

    var answer = JSON.parse(e.target.response),
        members,
        membersInfo;

    if (answer.error !== undefined) {
        handleError(answer.error);

        return;
    }

    members = answer.response;
    membersListGlobal = members;

    membersInfo           = document.createElement('p');
    membersInfo.innerHTML = 'Group members count: ' + members.count;

    document.body.appendChild(membersInfo);

    getFriendsNonMemberes();
}

function getFriendsNonMemberes() {
    "use strict";

    var idx,
        memberId;

        checkUserInGroup(0, 49912690);
}

function checkUserInGroup(idx, gid) {
    "use strict";

    var parameters = {
            'access_token' : vkGlobalAccessToken,
            'gid'          : gid,
            'uid'          : friendsListGlobal[idx].uid,
            'extended'     : 1
        },
        membersInfo,
        additionalParameters = {
            'idx' : idx,
            'gid' : gid
        };

    vkApiInstance.get('groups.isMember', addFriend, this, parameters, additionalParameters);

}

function addFriend(additionalParameters, e) {
    "use strict";

    var answer = JSON.parse(e.target.response),
        member,
        friend,
        membersInfo,
        idx = additionalParameters.idx,
        gid = additionalParameters.gid;

    if (answer.error !== undefined) {
        handleError(answer.error);

        return;
    }

    member = answer.response;

    if (member.member === 1) {
        friend = friendsListGlobal[idx];

        membersInfo = document.createElement('a');
        membersInfo.setAttribute('href', 'http://vk.com/id' + friend.uid);
        membersInfo.textContent = friend.first_name + ' ' + friend.last_name;

        document.body.appendChild(membersInfo);

        membersInfo           = document.createElement('p');

        membersInfo.innerHTML = 'NOT invited';

        if (member.invited !== undefined) {
            membersInfo.innerHTML = 'is invited';
        }

        document.body.appendChild(membersInfo);

    }

    if (friendsListGlobal[idx + 1] === undefined) {
        document.getElementById('wrap').innerHTML = '<p>Done</p>';
        return;
    }

    // if (friendsListGlobal[idx + 1] !== undefined) {
    setTimeout(function () {
        checkUserInGroup(idx + 1, gid);
    }, 500);
    // }

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
