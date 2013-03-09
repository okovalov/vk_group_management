/*global document, chrome,  */

function updateFriendsInforamtionLables() {
    "use strict";

    document.getElementById('friends_members_of_the_group').textContent     = friendsMembersOfTheGroup.length;
    document.getElementById('friends_invited_to_the_group').textContent     = friendsInvitedToTheGroup.length;
    document.getElementById('friends_not_members_of_the_group').textContent = friendsNotMembersOfTheGroup.length;

}

function loadDateFromStorage(callback) {
    "use strict";

    chrome.storage.local.get({'vk_gm_all_friends_data': {}}, function (items) {

        if (items.vk_gm_all_friends_data.friendsListGlobal === undefined) {

            return;
        }

        friendsMembersOfTheGroup    = items.vk_gm_all_friends_data.friendsMembersOfTheGroup;
        friendsInvitedToTheGroup    = items.vk_gm_all_friends_data.friendsInvitedToTheGroup;
        friendsNotMembersOfTheGroup = items.vk_gm_all_friends_data.friendsNotMembersOfTheGroup;
        friendsListGlobal           = items.vk_gm_all_friends_data.friendsListGlobal;

        callback();
    });

}

document.addEventListener('DOMContentLoaded', function () {
    "use strict";

    loadDateFromStorage(updateFriendsInforamtionLables);

});
