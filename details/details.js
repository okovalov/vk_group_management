/*global document, chrome, $, jQuery  */
var $sendMessageButtonHolderGlobal,
    $postOnWallButtonHolderGlobal,
    $messagesHistoryButtonHolderGlobal,
    $inviteButtonHolderGlobal,
    $invitationsHistoryButtonHolderGlobal;


function updateFriendsInforamtionLables() {
    "use strict";

    $('#friends_members_of_the_group').text(friendsMembersOfTheGroup.length);
    $('#friends_members_of_the_group').trigger('loadFriendsToContentList', [friendsMembersOfTheGroup, 'tab1']);

    $('#friends_invited_to_the_group').text(friendsInvitedToTheGroup.length);
    $('#friends_invited_to_the_group').trigger('loadFriendsToContentList', [friendsInvitedToTheGroup, 'tab2']);

    $('#friends_not_members_of_the_group').text(friendsNotMembersOfTheGroup.length);
    $('#friends_not_members_of_the_group').trigger('loadFriendsToContentList', [friendsNotMembersOfTheGroup, 'tab3']);
}

function loadDateFromStorage(callback) {
    "use strict";

    chrome.storage.local.get({'vk_gm_all_friends_data': {}}, function (items) {

        if (items.vk_gm_all_friends_data.friendsListGlobal === undefined) {

            return;
        }

        chrome.storage.local.get({'vk_access_token': {}}, function (items) {

            if (items.vk_access_token.length === undefined) {

                requestAuthentication();

                return;
            }

            vkGlobalAccessToken = items.vk_access_token;

        });

        friendsMembersOfTheGroup = items.vk_gm_all_friends_data.friendsMembersOfTheGroup;

        // TODO - remove it later. Temporaty use to show some data!
        // friendsInvitedToTheGroup    = items.vk_gm_all_friends_data.friendsInvitedToTheGroup;
        friendsInvitedToTheGroup    = items.vk_gm_all_friends_data.friendsMembersOfTheGroup;

        // friendsNotMembersOfTheGroup = items.vk_gm_all_friends_data.friendsNotMembersOfTheGroup;
        friendsNotMembersOfTheGroup = items.vk_gm_all_friends_data.friendsMembersOfTheGroup;

        friendsListGlobal           = items.vk_gm_all_friends_data.friendsListGlobal;

        callback();
    });
}

function loadFriendsToContentListHandler(friendsArray, tabId) {
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
        elementOptions;

    $tab              = $('#' + tabId);
    $friendInfoHolder = $tab.children('div.friend-info');
    $progressHolder   = $tab.children('div.progress');
    $progressBar      = $progressHolder.children().eq(0);

    elementOptions = {'class' : 'table table-striped  table-condensed table-bordered'};
    $friendsTable  = $('<table></table>', elementOptions).appendTo($friendInfoHolder);

    $tableHeader    = createFriendsTableHead().appendTo($friendsTable);

    for (friendIndex in friendsArray) {
        friend          = friendsArray[friendIndex];
        currentProgress = (friendsArray.length * friendIndex  / 100);
        $tableRow       = createFriendListTableRow(tabId, friend);

        $friendsTable.append($tableRow);
        $progressBar.css('width', currentProgress + '%');
    }

    $progressHolder.hide(function () {
        $friendInfoHolder.show();
    });
}

function onSelectUnselectFriendsClick(e) {
    "use strict";

    var cbx  = e.currentTarget,
        $cbx = $(cbx),
        $parent,
        $checkboxes;

    $parent     = $cbx.closest('table');
    $checkboxes = $parent.find('.friend_checkbox input');

    $checkboxes.prop('checked', cbx.checked);
}

function updateActionResult($actionResultHolder, contentClass, contentMessage) {
    "use strict";

    var temporaryelEmentOptions,
        elementOptions,
        $actionResult;

    temporaryelEmentOptions = {
        'title'     : 'Details of the last action',
        'content'   : contentMessage,
        'placement' : 'bottom'
    };

    elementOptions = {
        'class' : contentClass,
        'text'  : 'Click for details'
    };

    $actionResult = $('<p></p>', elementOptions).popover(temporaryelEmentOptions);
    $actionResultHolder.empty().append($actionResult);
}

function onSendMessageButtonClick(e) {
    "use strict";

    var $this               = $(e.currentTarget),
        friendName          = $this.closest('tr').find('.friend_name').text(),
        friendUid           = $this.closest('tr').find('.friend_url').data('friend-uid'),
        $actionResultHolder = $this.closest('tr').find('.friend-action-result'),
        $modal              = $('#newMessageModal');


    $modal.find('#newMessageModalLabel').find('span').text("'" + friendName + "'");
    $modal.find('#friendUid').val(friendUid);
    $modal.data('actionResultHolder', $actionResultHolder);

    $('#newMessageModal').modal();
}

function onPostOnWallButtonClick(e) {
    "use strict";

    alert('onPostOnWallButtonClick');
}

function onMessagesHistoryButtonClick(e) {
    "use strict";

    alert('onMessagesHistoryButtonClick');
}

function onInviteButtonClick(e) {
    "use strict";

    alert('onInviteButtonClick');
}

function onInvitationsHistoryButtonClick(e) {
    "use strict";

    var $this                = $(e.currentTarget),
        friendName           = $this.closest('tr').find('.friend_name').text(),
        friendUid            = $this.closest('tr').find('.friend_url').data('friend-uid'),
        $invitationsHistory  = $this.parent().find('.collapse');

    if ($invitationsHistory.hasClass('in')) {
        $invitationsHistory.popover('hide');
        $invitationsHistory.collapse('hide');
    }

    $invitationsHistory.collapse('show');
}

function createSendMessageButton() {
    "use strict";

    var elementOptions,
        $sendMessageButton;

    if ($sendMessageButtonHolderGlobal !== undefined) {
        return $sendMessageButtonHolderGlobal.clone(true);
    }

    elementOptions = {
        'class':       'btn btn-new-message',
        'href':        '#',
        'data-toggle': "tooltip",
        'title':       "Send a message"
    };

    $sendMessageButtonHolderGlobal = $('<a></a>', elementOptions).on('click', onSendMessageButtonClick);
    elementOptions                 = {'class' : 'icon-envelope'};
    $sendMessageButton             = $('<i></i>', elementOptions).appendTo($sendMessageButtonHolderGlobal);

    return $sendMessageButtonHolderGlobal;
}

function createPostOnWallButton() {
    "use strict";

    var elementOptions,
        $postOnWallButton;

    if ($postOnWallButtonHolderGlobal !== undefined) {
        return $postOnWallButtonHolderGlobal.clone(true);
    }

    elementOptions = {
        'class':       'btn',
        'href':        '#',
        'data-toggle': "tooltip",
        'title':       "Post on the wall"
    };

    $postOnWallButtonHolderGlobal = $('<a></a>', elementOptions).on('click', onPostOnWallButtonClick);
    elementOptions                = {'class' : 'icon-share'};
    $postOnWallButton             = $('<i></i>', elementOptions).appendTo($postOnWallButtonHolderGlobal);

    return $postOnWallButtonHolderGlobal;
}

function createMessagesHistoryButton() {
    "use strict";

    var elementOptions,
        $messagesHistoryButton;

    if ($messagesHistoryButtonHolderGlobal !== undefined) {
        return $messagesHistoryButtonHolderGlobal.clone(true);
    }

    elementOptions = {
        'class':       'btn',
        'href':        '#',
        'data-toggle': "tooltip",
        'title':       "Messages history"
    };

    $messagesHistoryButtonHolderGlobal = $('<a></a>', elementOptions).on('click', onMessagesHistoryButtonClick);
    elementOptions                     = {'class' : 'icon-folder-open'};
    $messagesHistoryButton             = $('<i></i>', elementOptions).appendTo($messagesHistoryButtonHolderGlobal);

    return $messagesHistoryButtonHolderGlobal;
}

function createInviteButton() {
    "use strict";

    var elementOptions,
        $inviteButton;

    if ($inviteButtonHolderGlobal !== undefined) {
        return $inviteButtonHolderGlobal.clone(true);
    }

    elementOptions = {
        'class': 'btn',
        'href':  '#',
        'title': "Invite to the group"
    };

    $inviteButtonHolderGlobal = $('<a></a>', elementOptions).on('click', onInviteButtonClick);
    elementOptions            = {'class' : 'icon-plus'};
    $inviteButton             = $('<i></i>', elementOptions).appendTo($inviteButtonHolderGlobal);

    return $inviteButtonHolderGlobal;
}

function createInvitationsHistoryButton() {
    "use strict";

    var elementOptions,
        $invitationsHistoryButton;

    if ($invitationsHistoryButtonHolderGlobal !== undefined) {
        return $invitationsHistoryButtonHolderGlobal.clone(true);
    }

    elementOptions = {
        'class': 'btn btn-invite-history',
        'href':  '#',
        'title': "Invitations history"
    };

    $invitationsHistoryButtonHolderGlobal = $('<a></a>', elementOptions).on('click', onInvitationsHistoryButtonClick);
    elementOptions                  = {'class' : 'icon-question-sign'};
    $invitationsHistoryButton       = $('<i></i>', elementOptions).appendTo($invitationsHistoryButtonHolderGlobal);

    return $invitationsHistoryButtonHolderGlobal;
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

function createActionButtonsGroup(tabId) {
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

    if (tabId === 'tab3') {
        $inviteButton              = createInviteButton().appendTo($buttonsGroup);
        $invitationsHistoryButton  = createInvitationsHistoryButton().appendTo($buttonsGroup);
        $invitationsHistoryElement = createInvitationsHistoryElement().appendTo($buttonsGroup);
    }

    return $buttonsGroup;
}

function createFriendListTableRow(tab, friend) {
    "use strict";

    var $tableRow,
        $friendName,
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
    $tableRow      = $('<tr></tr>', elementOptions);

    elementOptions = {
        'class': 'friend_name',
        'text':  friend.first_name + ' ' + friend.last_name
    };

    $friendName = $('<td></td>', elementOptions).appendTo($tableRow);

    elementOptions = {
        'class':          'friend_url',
        'data-friend-uid': friend.uid
    };

    $urlHolder = $('<td></td>', elementOptions).appendTo($tableRow);

    friendUrlString = 'http://vk.com/id' + friend.uid;

    elementOptions  = {
        'text':   friendUrlString,
        'href':   friendUrlString,
        'target': '_blank'
    };

    $url = $('<a></a>', elementOptions).appendTo($urlHolder);

    elementOptions  = {'class' : 'friend_checkbox'};
    $checkBoxHolder = $('<td></td>', elementOptions).appendTo($tableRow);

    elementOptions = {'type' : 'checkbox'};
    $checkbox      = $('<input></input>', elementOptions).appendTo($checkBoxHolder);

    elementOptions = {'class' : 'friend-actions'};
    $btnHolder     = $('<td></td>', elementOptions).appendTo($tableRow);

    elementOptions = {'class' : 'btn-toolbar' };
    $btnToolbar    = $('<div></div>', elementOptions).appendTo($btnHolder);

    $btnGroup = createActionButtonsGroup(tab).appendTo($btnToolbar);

    elementOptions      = {'class' : 'friend-action-result'};
    $actionResultHolder = $('<td></td>', elementOptions).appendTo($tableRow);

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

    return $tableRow;
}

function createFriendsTableHead() {
    "use strict";

    var $tableHeader,
        $tableHeaderRow,
        $checkbox,
        $tableHead,
        elementOptions;

    $tableHeader    = $('<thead></thead>');
    $tableHeaderRow = $('<tr></tr>').appendTo($tableHeader);

    elementOptions = {
        'text':  'Friend name',
        'class': 'friend-name'
    };
    $tableHead     = $('<th></th>', elementOptions).appendTo($tableHeaderRow);

    elementOptions = {
        'text':  'Page Url',
        'class': 'friend-url'
    };
    $tableHead     = $('<th></th>', elementOptions).appendTo($tableHeaderRow);

    elementOptions = {
        'text':  'Select all',
        'class': 'select-unselect centered'
    };
    $tableHead = $('<th></th>', elementOptions).data('status', 'false').appendTo($tableHeaderRow);

    elementOptions = {
        'type':  'checkbox',
        'class': 'select-all-'
    };
    $checkbox = $('<input></input>', elementOptions).on('click', onSelectUnselectFriendsClick).appendTo($tableHead);

    elementOptions = {
        'text':  'Actions',
        'class': 'centered friend-actions'
    };
    $tableHead     = $('<th></th>', elementOptions).appendTo($tableHeaderRow);

    elementOptions = {
        'text':  'Result of last action',
        'class': 'centered friend-actions-result'
    };
    $tableHead = $('<th></th>', elementOptions).appendTo($tableHeaderRow);

    return $tableHeader;
}

function sendMessageHandler(additionalParameters, e) {
    "use strict";

    var answer             = JSON.parse(e.target.response),
        callback           = additionalParameters.callback,
        actionResultHolder = additionalParameters.actionResultHolder,
        contentMessage,
        contentClass = 'text-success';

    if (answer.error !== undefined) {
        contentMessage = answer.error.error_msg;
        contentClass   = 'text-error';
    }

    callback(actionResultHolder, contentClass, contentMessage);

}

function sendMessage(friendUid, messageText, $actionResultHolder, callback) {
    "use strict";

    //messages.send
    //
    var parameters = {
        'access_token' : vkGlobalAccessToken,
        'uid'          : friendUid,
        'message'      : messageText,
        'title'        : 'test message title'
    };

    vkApiInstance.get('messages.send', sendMessageHandler, this, parameters, {'callback' : callback, 'actionResultHolder': $actionResultHolder});


    //alert('Sending message to ' + friendUid);
    //alert('messageText ' + messageText);
//    callback($actionResultHolder, contentClass, contentMessage);
}

(function ($) {
    "use strict";

    getAuthenticated(function () {
        loadDateFromStorage(updateFriendsInforamtionLables);
    });


    $('#friends_members_of_the_group').on('loadFriendsToContentList', function (e, friendsArray, tabId) {
        loadFriendsToContentListHandler(friendsArray, tabId);
    });

    $('#friends_invited_to_the_group').on('loadFriendsToContentList', function (e, friendsArray, tabId) {
        loadFriendsToContentListHandler(friendsArray, tabId);
    });

    $('#friends_not_members_of_the_group').on('loadFriendsToContentList', function (e, friendsArray, tabId) {
        loadFriendsToContentListHandler(friendsArray, tabId);
    });

    $('#newMessageModal').find('button:first-child').on('click', function (e, messageArea) {
        $(messageArea).val('');
    });

    $('#newMessageModal').find('.btn-primary').on('click', function (e) {
        var $parent = $(this).parent().parent(),
            $actionResultHolder = $parent.data('actionResultHolder'),
            friendUid           = $parent.find('#friendUid').val(),
            $message            = $parent.find('.message'),
            messageText         = $message.val();

        $parent.find('button:first-child').trigger('click', $message);

        sendMessage(friendUid, messageText, $actionResultHolder, function ($actionResultHolder, contentClass, contentMessage) {
            updateActionResult($actionResultHolder, contentClass, contentMessage);
        });

    });

    // $('.btn-new-message').on('click', function (e) {
    //     $('#newMessageModal').modal();
    // });

})(jQuery);
