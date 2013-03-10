/*global document, chrome,  */

function updateFriendsInforamtionLables() {
    "use strict";

    $('#friends_members_of_the_group').text(friendsMembersOfTheGroup.length);
    $('#friends_members_of_the_group').trigger('loadFriendsToContentArea', [friendsMembersOfTheGroup, 'tab1']);
    $('#friends_invited_to_the_group').text(friendsInvitedToTheGroup.length);
    $('#friends_members_of_the_group').trigger('loadFriendsToContentArea', [friendsInvitedToTheGroup, 'tab2']);
    $('#friends_not_members_of_the_group').text(friendsNotMembersOfTheGroup.length);
    $('#friends_members_of_the_group').trigger('loadFriendsToContentArea', [friendsNotMembersOfTheGroup, 'tab3']);
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


function getActionsList(tab) {

    var $btnGroup                   = $('<div></div>', { class: 'btn-group' }),
        $messageButtonHolder        = $('<a></a>', {class: 'btn', href : '#', 'data-toggle' : "tooltip", title : "Send a message"}).appendTo($btnGroup),
        $messageButton              = $('<i></i>', { class: 'icon-envelope'}).appendTo($messageButtonHolder),
        $wallButtonHolder           = $('<a></a>', {class: 'btn', href : '#', 'data-toggle' : "tooltip", title : "Post on the wall"}).appendTo($btnGroup),
        $wallButton                 = $('<i></i>', { class: 'icon-tasks'}).appendTo($wallButtonHolder),
        $messageHistoryButtonHolder = $('<a></a>', {class: 'btn', href : '#', 'data-toggle' : "tooltip", title : "Messages history"}).appendTo($btnGroup),
        $messageHistoryButton       = $('<i></i>', { class: 'icon-hdd'}).appendTo($messageHistoryButtonHolder);

    if (tab === 'tab1') {
        $btnGroup                   = $('<div></div>', { class: 'btn-group' }),
        $messageButtonHolder        = $('<a></a>', {class: 'btn', href : '#myModal', 'data-toggle' : "modal", title : "Send a message"}).appendTo($btnGroup),
        $messageButton              = $('<i></i>', { class: 'icon-envelope'}).appendTo($messageButtonHolder),
        $wallButtonHolder           = $('<a></a>', {class: 'btn', href : '#', 'data-toggle' : "tooltip", title : "Post on the wall"}).appendTo($btnGroup),
        $wallButton                 = $('<i></i>', { class: 'icon-tasks'}).appendTo($wallButtonHolder),
        $messageHistoryButtonHolder = $('<a></a>', {class: 'btn', href : '#', 'data-toggle' : "tooltip", title : "Messages history"}).appendTo($btnGroup),
        $messageHistoryButton       = $('<i></i>', { class: 'icon-hdd'}).appendTo($messageHistoryButtonHolder);
    }

    return $btnGroup;
}

function buildFriendListRow(tab, friend) {
    "use strict";

    var $row                        = $('<tr></tr>', { class: tab + '_friend_' }),
        $name                       = $('<td></td>', { class: 'friend_name', text: friend.first_name + ' ' + friend.last_name}).appendTo($row),

        friendUrl                   = 'http://vk.com/id' + friend.uid,
        $urlHolder                  = $('<td></td>', { class: 'friend_url'}).appendTo($row),
        $url                        = $('<a></a>', { text: friendUrl, href : friendUrl, target: '_blank'}).appendTo($urlHolder),

        $checkBoxHolder             = $('<td></td>', {class: 'friend_checkbox'}).appendTo($row),
        $checkbox                   = $('<input></input>', {type: 'checkbox'}).appendTo($checkBoxHolder),

        $btnHolder                  = $('<td></td>', { class: 'friend-actions'}).appendTo($row),
        $btnToolbar                 = $('<div></div>', { class: 'btn-toolbar' }).appendTo($btnHolder),
        $btnGroup                   = getActionsList(tab).appendTo($btnToolbar),

        $actionResultHolder         = $('<td></td>', {class: 'friend-action-result'}).appendTo($row),
        options                     = {title: 'Details of the last action', content : 'Nothing to say for now'},
        $actionResult               = $('<p></p>', {class: 'text-success', text : 'None - click for details'}).popover(options).appendTo($actionResultHolder);

    return $row;
}

function selectUnselectFriends(e) {
     // $('.case').attr('checked', this.checked);
    var cbx = e.currentTarget;
        $cbx = $(cbx);
    // $('.case').attr('checked', this.checked);

    // checked = $tHead.data('status') === 'false' ? true : false;
    // $tHead.data('status', String(checked));

    $parent     = $cbx.closest('table');
    $checkboxes  = $parent.find('.friend_checkbox input')
    $checkboxes.prop('checked', cbx.checked);

    // $checkboxes = $(checkboxes);
    // $checkboxes.each(function () {
    //     $this = $(this);
    //     $this.attr('checked', checked);
    // });


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
        $friendsTable     = $('<table></table>', {class: 'table table-striped  table-condensed table-bordered'}).appendTo($friendInfoHolder),
        $tableHeader      = $('<thead></thead>').appendTo($friendsTable),
        $tableHeaderRow   = $('<tr></tr>').appendTo($tableHeader),
        $tableHead        = $('<th></th>', { text: 'Friend name'}).appendTo($tableHeaderRow),
        $tableHead        = $('<th></th>', { text: 'Page Url'}).appendTo($tableHeaderRow),
        $tableHead        = $('<th></th>', { text: 'Select all', class: 'select-unselect'}).data('status', 'false').appendTo($tableHeaderRow),
        $checkbox         = $('<input></input>', {type: 'checkbox', id: 'select-all-'+tab}).on('click', selectUnselectFriends).appendTo($tableHead),

        $tableHead        = $('<th></th>', { text: 'Actions'}).appendTo($tableHeaderRow),
        $tableHead        = $('<th></th>', { text: 'Result of last action'}).appendTo($tableHeaderRow);

        for(friendIndex in friendsArray) {
            friend          = friendsArray[friendIndex];
            currentProgress = (friendsArray.length * friendIndex  / 100);

            $tableRow = buildFriendListRow(tab, friend);

            $friendsTable.append($tableRow);

            $progressBar.css('width', currentProgress + '%');
        }

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


//this.trigger('hey', ['Custom!', 'Event!'])
})(jQuery);
