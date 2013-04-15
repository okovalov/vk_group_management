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

        // chrome.storage.local.get({'vk_gm_all_friends_data': {}}, function (items) { console.log(items); });
        chrome.storage.local.get({'vk_access_token': {}}, function (items) {

            if (items.vk_access_token.length === undefined) {
                requestAuthentication();

                return;
            }

            vkGlobalAccessToken = items.vk_access_token;

        });

        friendsMembersOfTheGroup = items.vk_gm_all_friends_data.friendsMembersOfTheGroup;
        // friendsMembersOfTheGroup.push(items.vk_gm_all_friends_data.friendsMembersOfTheGroup[0]);

        // TODO - remove it later. Temporaty use to show some data!
        friendsInvitedToTheGroup    = items.vk_gm_all_friends_data.friendsInvitedToTheGroup;
        // friendsInvitedToTheGroup    = items.vk_gm_all_friends_data.friendsMembersOfTheGroup;

        friendsNotMembersOfTheGroup = items.vk_gm_all_friends_data.friendsNotMembersOfTheGroup;
        // friendsNotMembersOfTheGroup = items.vk_gm_all_friends_data.friendsMembersOfTheGroup;

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

        if (friend === null) {
            continue;
        }
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

    var temporaryElementOptions,
        elementOptions,
        $actionResult;

    temporaryElementOptions = {
        'title'     : 'Details of the last action',
        'content'   : contentMessage,
        'placement' : 'bottom'
    };

    elementOptions = {
        'class' : contentClass,
        'text'  : 'Click for details'
    };

    $actionResultHolder.empty();
    $actionResult = $('<p></p>', elementOptions).popover(temporaryElementOptions).appendTo($actionResultHolder);
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

    var $this               = $(e.currentTarget),
        friendName          = $this.closest('tr').find('.friend_name').text(),
        friendUid           = $this.closest('tr').find('.friend_url').data('friend-uid'),
        $actionResultHolder = $this.closest('tr').find('.friend-action-result'),
        $modal              = $('#historyMessagesModal');

    $modal.find('#historyMessagesModalLabel').find('span').text("'" + friendName + "'");
    $modal.find('#friendUid').val(friendUid);
    $modal.data('actionResultHolder', $actionResultHolder);

    $('#historyMessagesModal').modal();
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
        temporaryElementOptions,
        $invitationsHistoryElement;

    temporaryElementOptions = {
        'title':     'Invitations history',
        'content':   'Nothing to say for now',
        'placement': 'bottom'
    };

    elementOptions = {
        'class': "collapse",
        'text':  "Invited 10 times - click for details"
    };

    $invitationsHistoryElement = $('<div></div>', elementOptions).popover(temporaryElementOptions);

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
        temporaryElementOptions,
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

    temporaryElementOptions = {
        'title'     : 'Details of the last action',
        'content'   : 'Nothing to say for now',
        'placement' : 'bottom'

    };

    elementOptions = {
        'class' : 'text-success',
        'text'  : 'Click for details'
    };

    $actionResult = $('<p></p>', elementOptions).popover(temporaryElementOptions).appendTo($actionResultHolder);

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
        contentMessage     = 'message has been sent successfully',
        contentClass       = 'text-success',
        actionTime         = new Date(),
        messageObjectStack = additionalParameters.messageObjectStack,
        obj;

    if (answer.error !== undefined) {
        contentMessage = answer.error.error_msg;
        contentClass   = 'text-error';
    }

    callback(actionResultHolder, contentClass, contentMessage + ' ' + actionTime.toTimeString());

    if (messageObjectStack !== undefined) {
        setTimeout(function () {

            obj = messageObjectStack.pop();

            if (obj == undefined) {
                return;
            }

            sendMessage(obj.friendUid, obj.messageText, obj.actionResultHolder,
                function ($currentActionResultHolder, contentClass, contentMessage) {
                    updateActionResult($currentActionResultHolder, contentClass, contentMessage);
                },
                messageObjectStack
            );

        }, 150);
    }
}

function sendMessage(friendUid, messageText, $actionResultHolder, callback, messageObjectStack) {
    "use strict";

    var parameters = {
        'access_token' : vkGlobalAccessToken,
        'uid'          : friendUid,
        'message'      : messageText,
        'title'        : ''
    };

    vkApiInstance.get('messages.send', sendMessageHandler, this, parameters, {'callback' : callback, 'actionResultHolder': $actionResultHolder, 'messageObjectStack': messageObjectStack});
}

function getHistoryHandler(additionalParameters, e) {
    "use strict";

    var answer             = JSON.parse(e.target.response),
        callback           = additionalParameters.callback,
        friendUid           = additionalParameters.friendUid,
        actionResultHolder = additionalParameters.actionResultHolder,
        historyHolder      = additionalParameters.historyHolder,
        contentMessage     = 'messages history has been retrieved successfully',
        contentClass       = 'text-success',
        actionTime         = new Date();

    if (answer.error !== undefined) {
        contentMessage = answer.error.error_msg;
        contentClass   = 'text-error';
    }

    callback(friendUid, answer, actionResultHolder, historyHolder, contentClass, contentMessage + ' ' + actionTime.toTimeString());
}

function getHistory(friendUid, messageOffset, messageCount, $actionResultHolder, $historyHolder, callback) {
    "use strict";

    var parameters = {
        'access_token' : vkGlobalAccessToken,
        'uid'          : friendUid,
        'offset'       : messageOffset,
        'count'        : messageCount
    };

    vkApiInstance.get('messages.getHistory', getHistoryHandler, this, parameters, {'callback' : callback, 'actionResultHolder': $actionResultHolder, 'historyHolder': $historyHolder, 'friendUid' : friendUid});
}

function getHistoryCallback(friendUid, answer, $actionResultHolder, $historyHolder, contentClass, contentMessage) {
    "use strict";

    var response = answer.response,
        message,
        messageIdx,
        newHistoryLine;

    $historyHolder.val('');

    for (messageIdx in response) {
        message = response[messageIdx];

        if (message.mid !== undefined) {
            newHistoryLine = (message.from_id == friendUid ? 'friend' : 'me') + ': ' + message.body + '\n';
            $historyHolder.val($historyHolder.val() + newHistoryLine);
        }
    }

    updateActionResult($actionResultHolder, contentClass, contentMessage);
}

function onMessageModalShown() {
    "use strict";

    var $parent = $(this),
        $actionResultHolder = $parent.data('actionResultHolder'),
        friendUid           = $parent.find('#friendUid').val(),
        messageOffset       = 0,
        messageCount        = 10,
        $historyHolder      = $($parent.find('.history-body textarea'));

    if (friendUid !== '') {
        getHistory(friendUid, messageOffset, messageCount, $actionResultHolder, $historyHolder, getHistoryCallback);
    }
}

function onLoadFriendsToContentList(e, friendsArray, tabId) {
    "use strict";

    loadFriendsToContentListHandler(friendsArray, tabId);
}

(function ($) {
    "use strict";

    getAuthenticated(function () {
        loadDateFromStorage(updateFriendsInforamtionLables);
    });

    $('#friends_members_of_the_group').on('loadFriendsToContentList', onLoadFriendsToContentList);

    $('#friends_invited_to_the_group').on('loadFriendsToContentList', onLoadFriendsToContentList);

    $('#friends_not_members_of_the_group').on('loadFriendsToContentList', onLoadFriendsToContentList);

    $('#newMessageModal').find('button:first-child').on('click', function (e, messageArea) {
        $(messageArea).val('');
    });

    $('#newMessageModal').on('shown', onMessageModalShown);

    $('#historyMessagesModal').on('shown', onMessageModalShown);

    $('#newMessageModal').find('.btn-primary').on('click', function (e) {
        var $parent = $(this).parent().parent(),
            $actionResultHolder = $parent.data('actionResultHolder'),
            $currentActionResultHolder,
            friendUid           = $parent.find('#friendUid').val(),
            $message            = $parent.find('.message'),
            messageText         = $message.val(),
            friendUidHolder,
            i,
            obj,
            messageObjectStack = [];

        $parent.find('button:first-child').trigger('click', $message);

        if (friendUid !== '') {

            sendMessage(friendUid, messageText, $actionResultHolder, function ($actionResultHolder, contentClass, contentMessage) {
                updateActionResult($actionResultHolder, contentClass, contentMessage);
            });

            return;
        }

        friendUidHolder = $parent.data('friendUidHolder');

        for (i = 0; i < friendUidHolder.length; i += 1) {
            messageObjectStack.push({'friendUid': friendUidHolder[i], 'actionResultHolder' : $actionResultHolder[i], 'messageText' : messageText});
        }

        obj = messageObjectStack.pop();

        sendMessage(obj.friendUid, obj.messageText, obj.actionResultHolder,
            function ($currentActionResultHolder, contentClass, contentMessage) {
                updateActionResult($currentActionResultHolder, contentClass, contentMessage);
            },
            messageObjectStack
        );

    });

    $('.btn-new-message-to-all').on('click', function (e) {
        "use strict";

        var $this               = $(e.currentTarget),
            $parent             = $this.closest('.tab-pane'),
            $checkboxes         = $parent.find('.friend_checkbox input:checked'),
            cbIdx,
            $cb,
            $tr,
            friendName,
            friendUid,
            $actionResultHolder,
            $modal              = $('#newMessageModal'),
            friendUidArray      = [],
            actionResultHolderArray = [];

        friendName = $checkboxes.length + ' friends';

        $modal.find('#newMessageModalLabel').find('span').text("'" + friendName + "'");
        $modal.find('#friendUid').val('');
        $modal.data('checkboxestHolder', $checkboxes);

        $('#newMessageModal').modal();

        if ($checkboxes.length > 0) {
            for (cbIdx = 0; cbIdx < $checkboxes.length; cbIdx += 1) {
                if ($checkboxes.hasOwnProperty(cbIdx)) {
                    $cb                 = $checkboxes[cbIdx];
                    $tr                 = $($cb).closest('tr');
                    friendName          = $tr.find('.friend_name').text();
                    friendUid           = $tr.find('.friend_url').data('friend-uid');
                    $actionResultHolder = $tr.find('.friend-action-result');
                    friendUidArray.push(friendUid);
                    actionResultHolderArray.push($actionResultHolder);

                }
            }

            $modal.data('actionResultHolder', actionResultHolderArray);
            $modal.data('friendUidHolder', friendUidArray);

        }

    });

})(jQuery);
