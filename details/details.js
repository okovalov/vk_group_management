/*global document, chrome,  */

function updateFriendsInforamtionLables() {
    "use strict";

    $('#friends_members_of_the_group').text(friendsMembersOfTheGroup.length);
    $('#friends_members_of_the_group').trigger('loadFriendsToContentArea', [friendsMembersOfTheGroup, 'tab1']);

    $('#friends_invited_to_the_group').text(friendsInvitedToTheGroup.length);
    $('#friends_invited_to_the_group').trigger('loadFriendsToContentArea', [friendsInvitedToTheGroup, 'tab2']);

    $('#friends_not_members_of_the_group').text(friendsNotMembersOfTheGroup.length);
    $('#friends_not_members_of_the_group').trigger('loadFriendsToContentArea', [friendsNotMembersOfTheGroup, 'tab3']);
}

function loadDateFromStorage(callback) {
    "use strict";

    chrome.storage.local.get({'vk_gm_all_friends_data': {}}, function (items) {

        if (items.vk_gm_all_friends_data.friendsListGlobal === undefined) {

            return;
        }

        friendsMembersOfTheGroup    = items.vk_gm_all_friends_data.friendsMembersOfTheGroup;
        // TODO - remove it later. Temporaty use to show some data!
        // friendsInvitedToTheGroup    = items.vk_gm_all_friends_data.friendsInvitedToTheGroup;
        friendsInvitedToTheGroup    = items.vk_gm_all_friends_data.friendsMembersOfTheGroup;

        // friendsNotMembersOfTheGroup = items.vk_gm_all_friends_data.friendsNotMembersOfTheGroup;
        friendsNotMembersOfTheGroup = items.vk_gm_all_friends_data.friendsMembersOfTheGroup;

        friendsListGlobal           = items.vk_gm_all_friends_data.friendsListGlobal;

        callback();
    });

}


function getActionsList(tab) {
    "use strict";

    var $btnGroup = $('<div></div>', { class: 'btn-group' }),
        $messageButtonHolder,
        $messageButton,
        $wallButtonHolder,
        $wallButton,
        $inviteButtonHolder,
        $inviteButton,
        $inviteHistoryButtonHolder,
        $inviteHistoryButton,
        $inviteHistory,
        $messageHistoryButtonHolder,
        $messageHistoryButton,
        options;

    $messageButtonHolder        = $('<a></a>', {
            class: 'btn btn-new-message',
            href : '#',
            'data-toggle' : "tooltip",
            title : "Send a message"
        })
        .appendTo($btnGroup),
    $messageButton              = $('<i></i>', { class: 'icon-envelope'}).appendTo($messageButtonHolder),
    $wallButtonHolder           = $('<a></a>', { class: 'btn', href : '#', 'data-toggle' : "tooltip", title : "Post on the wall"}).appendTo($btnGroup),
    $wallButton                 = $('<i></i>', { class: 'icon-share'}).appendTo($wallButtonHolder),
    $messageHistoryButtonHolder = $('<a></a>', { class: 'btn', href : '#', 'data-toggle' : "tooltip", title : "Messages history"}).appendTo($btnGroup),
    $messageHistoryButton       = $('<i></i>', { class: 'icon-folder-open'}).appendTo($messageHistoryButtonHolder);

    if (tab === 'tab3') {
        $inviteButtonHolder         = $('<a></a>', { class: 'btn', href : '#', title : "Invite to the group"}).appendTo($btnGroup),
        $inviteButton               = $('<i></i>', { class: 'icon-plus'}).appendTo($inviteButtonHolder);
        $inviteHistoryButtonHolder  = $('<a></a>', { class: 'btn btn-invite-history', href : '#', title : "Invitations history"}).appendTo($btnGroup),
        $inviteHistoryButton        = $('<i></i>', { class: 'icon-question-sign'}).appendTo($inviteHistoryButtonHolder);
        options                     = { title: 'Invitations history', content : 'Nothing to say for now', placement: 'bottom'},

        $inviteHistory              = $('<div></div>', { class : "collapse", text: "Invited 10 times - click for details"}).popover(options).appendTo($btnGroup);
    }

    return $btnGroup;
}

function buildFriendListRow(tab, friend) {
    "use strict";

    var $row                        = $('<tr></tr>', { class: tab + '_friend_' }),
        $name                       = $('<td></td>', { class: 'friend_name', text: friend.first_name + ' ' + friend.last_name}).appendTo($row),

        friendUrl                   = 'http://vk.com/id' + friend.uid,
        $urlHolder                  = $('<td></td>', { class: 'friend_url', 'data-friend-uid': friend.uid}).appendTo($row),
        $url                        = $('<a></a>', { text: friendUrl, href : friendUrl, target: '_blank'}).appendTo($urlHolder),

        $checkBoxHolder             = $('<td></td>', { class: 'friend_checkbox'}).appendTo($row),
        $checkbox                   = $('<input></input>', { type: 'checkbox'}).appendTo($checkBoxHolder),

        $btnHolder                  = $('<td></td>', { class: 'friend-actions'}).appendTo($row),
        $btnToolbar                 = $('<div></div>', { class: 'btn-toolbar' }).appendTo($btnHolder),
        $btnGroup                   = getActionsList(tab).appendTo($btnToolbar),

        $actionResultHolder         = $('<td></td>', { class: 'friend-action-result'}).appendTo($row),
        options                     = { title: 'Details of the last action', content : 'Nothing to say for now'},
        $actionResult               = $('<p></p>', { class: 'text-success', text : 'Click for details'}).popover(options).appendTo($actionResultHolder);

    return $row;
}

function selectUnselectFriends(e) {
    "use strict";

    var cbx  = e.currentTarget;
        $cbx = $(cbx),
        $parent,
        $checkboxes;

    $parent      = $cbx.closest('table');
    $checkboxes  = $parent.find('.friend_checkbox input')

    $checkboxes.prop('checked', cbx.checked);
}

function loadFriendsToContentAreaHandler(friendsArray, tab) {
    "use strict";

    var friendIndex,
        friend,
        currentProgress,
        $tableRow,
        $tab              = $('#'+tab),
        $friendInfoHolder = $tab.children('div.friend-info'),
        $progressHolder   = $tab.children('div.progress'),
        $progressBar      = $progressHolder.children().eq(0),
        $friendsTable     = $('<table></table>', { class: 'table table-striped  table-condensed table-bordered'}).appendTo($friendInfoHolder),
        $tableHeader      = $('<thead></thead>').appendTo($friendsTable),
        $tableHeaderRow   = $('<tr></tr>').appendTo($tableHeader),
        $tableHead        = $('<th></th>', { text: 'Friend name'}).css('width', '23%').appendTo($tableHeaderRow),
        $tableHead        = $('<th></th>', { text: 'Page Url'}).css('width', '26%').appendTo($tableHeaderRow),
        $tableHead        = $('<th></th>', { text: 'Select all', class: 'select-unselect centered'}).data('status', 'false').css('width', '12%').appendTo($tableHeaderRow),
        $checkbox         = $('<input></input>', { type: 'checkbox', id: 'select-all-'+tab}).on('click', selectUnselectFriends).appendTo($tableHead),

        $tableHead        = $('<th></th>', { text: 'Actions', class : 'centered'}).css('width', '21%').appendTo($tableHeaderRow),
        $tableHead        = $('<th></th>', { text: 'Result of last action', class : 'centered'}).css('width', '18%').appendTo($tableHeaderRow);

        for(friendIndex in friendsArray) {
            friend          = friendsArray[friendIndex];
            currentProgress = (friendsArray.length * friendIndex  / 100);
            $tableRow       = buildFriendListRow(tab, friend);

            $friendsTable.append($tableRow);
            $progressBar.css('width', currentProgress + '%');
        }

        $('.btn-invite-history').on('click', function (e) {
            var $this           = $(e.currentTarget),
                friendName      = $this.closest('tr').find('.friend_name').text(),
                friendUid       = $this.closest('tr').find('.friend_url').data('friend-uid'),
                $inviteHistory  = $this.parent().find('.collapse');

            if ($inviteHistory.hasClass('in')) {
                $inviteHistory.popover('hide');
                $inviteHistory.collapse('hide');
            }

            $inviteHistory.collapse('show');

        });

        $('.btn-new-message').on('click', function (e) {
            "use strict";

            var $this      = $(e.currentTarget),
                friendName = $this.closest('tr').find('.friend_name').text(),
                friendUid  = $this.closest('tr').find('.friend_url').data('friend-uid'),
                $modal     = $('#newMessageModal');

                $modal.find('#newMessageModalLabel').find('span').text("'" + friendName + "'");
                $modal.find('#friendUid').val(friendUid);

            $('#newMessageModal').modal();
        });

        $progressHolder.hide(function () {
            $friendInfoHolder.show();
        });
}

(function ($) {
    "use strict";

    loadDateFromStorage(updateFriendsInforamtionLables);

    $('#friends_members_of_the_group').on('loadFriendsToContentArea', function (e, friendsArray, tab) {
        loadFriendsToContentAreaHandler(friendsArray, tab);
    });

    $('#friends_invited_to_the_group').on('loadFriendsToContentArea', function (e, friendsArray, tab) {
        loadFriendsToContentAreaHandler(friendsArray, tab);
    });

    $('#friends_not_members_of_the_group').on('loadFriendsToContentArea', function (e, friendsArray, tab) {
        loadFriendsToContentAreaHandler(friendsArray, tab);
    });

    // $('.btn-new-message').on('click', function (e) {
    //     $('#newMessageModal').modal();
    // });

})(jQuery);
