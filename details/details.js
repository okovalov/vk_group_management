/*global document, chrome, $, jQuery  */

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

function createSendMessageButton() {
    "use strict";

    var elementOptions,
        $sendMessageButtonHolder,
        $sendMessageButton;

    elementOptions = {
        'class':       'btn btn-new-message',
        'href':        '#',
        'data-toggle': "tooltip",
        'title':       "Send a message"
    };

    $sendMessageButtonHolder = $('<a></a>', elementOptions);
    elementOptions           = {'class' : 'icon-envelope'};
    $sendMessageButton       = $('<i></i>', elementOptions).appendTo($sendMessageButtonHolder);

    return $sendMessageButtonHolder;
}

function createPostOnWallButton() {
    "use strict";

    var elementOptions,
        $postOnWallButtonHolder,
        $postOnWallButton;

    elementOptions = {
        'class':       'btn',
        'href':        '#',
        'data-toggle': "tooltip",
        'title':       "Post on the wall"
    };

    $postOnWallButtonHolder = $('<a></a>', elementOptions);
    elementOptions          = {'class' : 'icon-share'};
    $postOnWallButton       = $('<i></i>', elementOptions).appendTo($postOnWallButtonHolder);

    return $postOnWallButtonHolder;
}

function createMessagesHistoryButton() {
    "use strict";

    var elementOptions,
        $messagesHistoryButtonHolder,
        $messagesHistoryButton;

    elementOptions = {
        'class':       'btn',
        'href':        '#',
        'data-toggle': "tooltip",
        'title':       "Messages history"
    };

    $messagesHistoryButtonHolder = $('<a></a>', elementOptions);
    elementOptions               = {'class' : 'icon-folder-open'};
    $messagesHistoryButton       = $('<i></i>', elementOptions).appendTo($messagesHistoryButtonHolder);

    return $messagesHistoryButtonHolder;
}

function createInviteButton() {
    "use strict";

    var elementOptions,
        $inviteButtonHolder,
        $inviteButton;

    elementOptions = {
        'class': 'btn',
        'href':  '#',
        'title': "Invite to the group"
    };

    $inviteButtonHolder = $('<a></a>', elementOptions);
    elementOptions      = {'class' : 'icon-plus'};
    $inviteButton       = $('<i></i>', elementOptions).appendTo($inviteButtonHolder);

    return $inviteButtonHolder;
}

function createInvitationsHistoryButton() {
    "use strict";

    var elementOptions,
        $invitationsHistoryButton,
        $invitationsHistoryButtonHolder;

    elementOptions = {
        'class': 'btn btn-invite-history',
        'href':  '#',
        'title': "Invitations history"
    };

    $invitationsHistoryButtonHolder = $('<a></a>', elementOptions);
    elementOptions                  = {'class' : 'icon-question-sign'};
    $invitationsHistoryButton       = $('<i></i>', elementOptions).appendTo($invitationsHistoryButtonHolder);

    return $invitationsHistoryButtonHolder;
}

function createInvitationsHistoryElement() {
    "use strict";

    var elementOptions,
        temporaryelEmentOptions,
        $invitationsHistoryElement;

    temporaryelEmentOptions = {
        'title':     'Invitations history',
        'content':   'Nothing to say for now',
        'placement': 'bottom'
    };

    elementOptions = {
        'class': "collapse",
        'text':  "Invited 10 times - click for details"
    };

    $invitationsHistoryElement = $('<div></div>', elementOptions).popover(temporaryelEmentOptions);

    return $invitationsHistoryElement;
}

function getActionsList(tab) {
    "use strict";

    var $buttonsGroup,
        $sendMessageButton,
        $postOnWallButton,
        $messagesHistoryButton,
        $inviteButton,
        $invitationsHistoryElement,
        $invitationsHistoryButton,
        elementOptions;

    elementOptions = {'class' : 'btn-group'};
    $buttonsGroup  = $('<div></div>', elementOptions);

    $sendMessageButton     = createSendMessageButton().appendTo($buttonsGroup);
    $postOnWallButton      = createPostOnWallButton().appendTo($buttonsGroup);
    $messagesHistoryButton = createMessagesHistoryButton().appendTo($buttonsGroup);

    if (tab === 'tab3') {
        $inviteButton              = createInviteButton().appendTo($buttonsGroup);
        $invitationsHistoryButton  = createInvitationsHistoryButton().appendTo($buttonsGroup);
        $invitationsHistoryElement = createInvitationsHistoryElement().appendTo($buttonsGroup);
    }

    return $buttonsGroup;
}

function buildFriendListRow(tab, friend) {
    "use strict";

    var $row,
        $name,
        friendUrlString,
        $urlHolder,
        $url,
        $checkBoxHolder,
        $checkbox,
        $btnHolder,
        $btnToolbar,
        $btnGroup,
        $actionResultHolder,
        elementOptions,
        temporaryelEmentOptions,
        $actionResult;

    elementOptions = {'class' : tab + '_friend_'};
    $row           = $('<tr></tr>', elementOptions);

    elementOptions = {
        'class' : 'friend_name',
        'text'  : friend.first_name + ' ' + friend.last_name
    };
    $name = $('<td></td>', elementOptions).appendTo($row);

    elementOptions = {
        'class'           : 'friend_url',
        'data-friend-uid' : friend.uid
    };
    $urlHolder = $('<td></td>', elementOptions).appendTo($row);

    friendUrlString = 'http://vk.com/id' + friend.uid;
    elementOptions  = {
        'text'   : friendUrlString,
        'href'   : friendUrlString,
        'target' : '_blank'
    };
    $url = $('<a></a>', elementOptions).appendTo($urlHolder);

    elementOptions  = {'class' : 'friend_checkbox'};
    $checkBoxHolder = $('<td></td>', elementOptions).appendTo($row);

    elementOptions = {'type' : 'checkbox'};
    $checkbox      = $('<input></input>', elementOptions).appendTo($checkBoxHolder);

    elementOptions = {'class' : 'friend-actions'};
    $btnHolder     = $('<td></td>', elementOptions).appendTo($row);

    elementOptions = {'class' : 'btn-toolbar' };
    $btnToolbar    = $('<div></div>', elementOptions).appendTo($btnHolder);

    $btnGroup = getActionsList(tab).appendTo($btnToolbar);

    elementOptions      = {'class' : 'friend-action-result'};
    $actionResultHolder = $('<td></td>', elementOptions).appendTo($row);

    temporaryelEmentOptions = {
        'title'     : 'Details of the last action',
        'content'   : 'Nothing to say for now',
        'placement' : 'bottom'

    };
    elementOptions = {
        'class' : 'text-success',
        'text'  : 'Click for details'
    };
    $actionResult = $('<p></p>', elementOptions).popover(temporaryelEmentOptions).appendTo($actionResultHolder);

    return $row;
}

function selectUnselectFriends(e) {
    "use strict";

    var cbx  = e.currentTarget,
        $cbx = $(cbx),
        $parent,
        $checkboxes;

    $parent     = $cbx.closest('table');
    $checkboxes = $parent.find('.friend_checkbox input');

    $checkboxes.prop('checked', cbx.checked);
}

function loadFriendsToContentAreaHandler(friendsArray, tab) {
    "use strict";

    var friendIndex,
        friend,
        currentProgress,
        $tableRow,
        $tab,
        $friendInfoHolder,
        $progressHolder,
        $progressBar,
        $friendsTable,
        $tableHeader,
        $tableHeaderRow,
        $checkbox,
        $tableHead,
        elementOptions,
        temporaryelEmentOptions;

    $tab              = $('#' + tab);
    $friendInfoHolder = $tab.children('div.friend-info');
    $progressHolder   = $tab.children('div.progress');
    $progressBar      = $progressHolder.children().eq(0);

    elementOptions = {'class' : 'table table-striped  table-condensed table-bordered'};
    $friendsTable  = $('<table></table>', elementOptions).appendTo($friendInfoHolder);

    $tableHeader    = $('<thead></thead>').appendTo($friendsTable);
    $tableHeaderRow = $('<tr></tr>').appendTo($tableHeader);

    elementOptions = {
        'text'  : 'Friend name',
        'class' : 'friend-name'
    };
    $tableHead     = $('<th></th>', elementOptions).appendTo($tableHeaderRow);

    elementOptions = {
        'text' : 'Page Url',
        'class' : 'friend-url'
    };
    $tableHead     = $('<th></th>', elementOptions).appendTo($tableHeaderRow);

    elementOptions = {
        'text'  : 'Select all',
        'class' : 'select-unselect centered'
    };
    $tableHead = $('<th></th>', elementOptions).data('status', 'false').appendTo($tableHeaderRow);

    elementOptions = {
        'type' : 'checkbox',
        'id'   : 'select-all-' + tab
    };
    $checkbox = $('<input></input>', elementOptions).on('click', selectUnselectFriends).appendTo($tableHead);

    elementOptions = {
        'text'  : 'Actions',
        'class' : 'centered friend-actions'
    };
    $tableHead     = $('<th></th>', elementOptions).appendTo($tableHeaderRow);

    elementOptions = {
        'text'  : 'Result of last action',
        'class' : 'centered friend-actions-result'
    };
    $tableHead = $('<th></th>', elementOptions).appendTo($tableHeaderRow);

    for (friendIndex in friendsArray) {
        friend          = friendsArray[friendIndex];
        currentProgress = (friendsArray.length * friendIndex  / 100);
        $tableRow       = buildFriendListRow(tab, friend);

        $friendsTable.append($tableRow);
        $progressBar.css('width', currentProgress + '%');
    }

    $('.btn-invite-history').on('click', function (e) {
        var $this                = $(e.currentTarget),
            friendName           = $this.closest('tr').find('.friend_name').text(),
            friendUid            = $this.closest('tr').find('.friend_url').data('friend-uid'),
            $invitationsHistory  = $this.parent().find('.collapse');

        if ($invitationsHistory.hasClass('in')) {
            $invitationsHistory.popover('hide');
            $invitationsHistory.collapse('hide');
        }

        $invitationsHistory.collapse('show');
    });

    $('.btn-new-message').on('click', function (e) {

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
