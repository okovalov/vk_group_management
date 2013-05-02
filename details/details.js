/*global document, chrome, $, jQuery, setTimeout, requestAuthentication, vkGroupId, vkApiInstance, alert, getAuthenticated  */
var $sendMessageButtonHolderGlobal,
    $postOnWallButtonHolderGlobal,
    $messagesHistoryButtonHolderGlobal,
    $inviteButtonHolderGlobal,
    $invitationsHistoryButtonHolderGlobal,
    membersListGlobal,
    friendsListGlobal,
    friendsMembersOfTheGroup,
    friendsNotMembersOfTheGroup,
    friendsInvitedToTheGroup,
    vkGlobalAccessToken;

function log(contentMessage) {
    "use strict";

    var $log     = $('.log-window'),
        $logBody = $log.find('.log-body').find('textarea');

    $logBody.text($logBody.text() + '\n\n' +  contentMessage);
}

function updateFriendsInforamtionLables() {
    "use strict";

    $('#friends_members_of_the_group').text(friendsMembersOfTheGroup.length);
    $('#friends_members_of_the_group').trigger('loadFriendsToContentList', [friendsMembersOfTheGroup, 'tab1']);

    $('#friends_invited_to_the_group').text(friendsInvitedToTheGroup.length);
    $('#friends_invited_to_the_group').trigger('loadFriendsToContentList', [friendsInvitedToTheGroup, 'tab2']);

    $('#friends_not_members_of_the_group').text(friendsNotMembersOfTheGroup.length);
    $('#friends_not_members_of_the_group').trigger('loadFriendsToContentList', [friendsNotMembersOfTheGroup, 'tab3']);
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

    log(contentMessage);
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

        membersListGlobal           = items.vk_gm_all_friends_data.membersListGlobal;
        friendsListGlobal           = items.vk_gm_all_friends_data.friendsListGlobal;
        friendsMembersOfTheGroup    = items.vk_gm_all_friends_data.friendsMembersOfTheGroup;
        friendsNotMembersOfTheGroup = items.vk_gm_all_friends_data.friendsNotMembersOfTheGroup;
        friendsInvitedToTheGroup    = items.vk_gm_all_friends_data.friendsInvitedToTheGroup;

        callback();
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

function generateFriendsTableHeader() {
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

function onSendMessageButtonClick(e) {
    "use strict";

    var $this               = $(e.currentTarget),
        $tableRow           = $this.closest('tr'),
        friendName          = $tableRow.find('.friend_name').text(),
        friendUid           = $tableRow.find('.friend_url').data('friend-uid'),
        $actionResultHolder = $tableRow.find('.friend-action-result'),
        $modal              = $('#newMessageModal');

    $modal.find('#newMessageModalLabel').find('span').text("'" + friendName + "'");
    $modal.find('#friendUid').val(friendUid);
    $modal.data('actionResultHolder', $actionResultHolder);

    $('#newMessageModal').modal();
}

function generateSendMessageButton() {
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

function onPostOnWallButtonClick(e) {
    "use strict";

    alert('onPostOnWallButtonClick');
}

function generatePostOnWallButton() {
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

function onMessagesHistoryButtonClick(e) {
    "use strict";

    var $this               = $(e.currentTarget),
        $tableRow           = $this.closest('tr'),
        friendName          = $tableRow.find('.friend_name').text(),
        friendUid           = $tableRow.find('.friend_url').data('friend-uid'),
        $actionResultHolder = $tableRow.find('.friend-action-result'),
        $modal              = $('#historyMessagesModal');

    $modal.find('#historyMessagesModalLabel').find('span').text("'" + friendName + "'");
    $modal.find('#friendUid').val(friendUid);
    $modal.data('actionResultHolder', $actionResultHolder);

    $('#historyMessagesModal').modal();
}

function generateMessagesHistoryButton() {
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

function inviteMemberCallback($actionResultHolder, contentClass, contentMessage, $tableRow, friendUid, invitationObjectStack) {
    "use strict";

    var $tab,
        $friendInfoHolder,
        $friendsTable,
        vk_gm_all_friends_data,
        $oldTable,
        $oldRow;

    friendsInvitedToTheGroup.push(friendsNotMembersOfTheGroup[friendUid]);

    friendsNotMembersOfTheGroup[friendUid] = undefined;
    friendsNotMembersOfTheGroup.length -= 1;

    $tab              = $('#tab2');
    $friendInfoHolder = $tab.children('div.friend-info');
    $friendsTable     = $friendInfoHolder.children('table');

    $friendsTable.append($tableRow.clone(true));

    $('#friends_invited_to_the_group').text(friendsInvitedToTheGroup.length);
    $('#friends_not_members_of_the_group').text(friendsNotMembersOfTheGroup.length);

    $oldTable = $tableRow.parent();
    $oldRow   = $oldTable.find('td.friend_url[data-friend-uid="' + friendUid + '"]').parent();

    $oldRow.empty();

    vk_gm_all_friends_data = {
        'membersListGlobal':           membersListGlobal,
        'friendsListGlobal':           friendsListGlobal,
        'friendsMembersOfTheGroup':    friendsMembersOfTheGroup,
        'friendsNotMembersOfTheGroup': friendsNotMembersOfTheGroup,
        'friendsInvitedToTheGroup':    friendsInvitedToTheGroup
    };

    chrome.storage.local.set({'vk_gm_all_friends_data': vk_gm_all_friends_data}, function () {
    });

    updateActionResult($actionResultHolder, contentClass, contentMessage);

    if (invitationObjectStack === undefined || invitationObjectStack.length === 0) {
        log('All the invitations have been sent');
    }
}

function inviteMember(friendUid, $tableRow, $actionResultHolder, callback, invitationObjectStack) {
    "use strict";

    var parameters,
        additionalParameters,
        inviteMemberHandler;

    if (friendsNotMembersOfTheGroup[friendUid].hash === undefined) {
        updateActionResult($actionResultHolder, 'text-error', 'Impossible to invite this friend');

        return;
    }

    inviteMemberHandler = function (additionalParameters, e) {
        var answer                = e.target.response,
            friendUid             = additionalParameters.friendUid,
            callback              = additionalParameters.callback,
            $actionResultHolder   = additionalParameters.actionResultHolder,
            $tableRow             = additionalParameters.tableRow,
            contentMessage        = 'invitation has been sent successfully',
            contentClass          = 'text-success',
            actionTime            = new Date(),
            invitationObjectStack = additionalParameters.invitationObjectStack,
            obj,
            // i,
            // friends,
            // friendListLength,
            // friendsGlobal = {},
            // friend,
            userFullName = friendsNotMembersOfTheGroup[friendUid].first_name + ' ' + friendsNotMembersOfTheGroup[friendUid].last_name;

        answer.replace(/<\/?[^>]+(>|$)/g, "");

        if (invitationObjectStack !== undefined) {
            setTimeout(function () {
                obj = invitationObjectStack.pop();

                if (obj === undefined) {
                    return;
                }

                inviteMember(obj.friendUid, obj.tableRow, obj.actionResultHolder, inviteMemberCallback, invitationObjectStack);

            }, 5000);
        }

        if (answer.toLowerCase().indexOf('sent') === -1) {
            contentMessage = userFullName + ' ' + answer;
            contentClass   = 'text-error';

            updateActionResult($actionResultHolder, contentClass, contentMessage);

            return;
        }

        callback($actionResultHolder, contentClass, userFullName + ' ' + contentMessage + ' ' + actionTime.toTimeString(), $tableRow, friendUid);
    };

    additionalParameters = {
        'callback' : callback,
        'actionResultHolder': $actionResultHolder,
        'invitationObjectStack': invitationObjectStack,
        'tableRow' : $tableRow,
        'postRequest' : true,
        'friendUid' : friendUid,
        'postUrl' : 'http://vk.com/al_page.php',
        'postParameters' : {
            'field' : [
                {'fieldName': 'act', 'fieldValue' : 'a_invite'},
                {'fieldName': 'al', 'fieldValue' : '1'},
                {'fieldName': 'gid', 'fieldValue' : vkGroupId},
                {'fieldName': 'mid', 'fieldValue' : friendUid},
                {'fieldName': 'hash', 'fieldValue' : friendsNotMembersOfTheGroup[friendUid].hash}
            ]
        }
    };

    vkApiInstance.get('', inviteMemberHandler, null, parameters, additionalParameters, 'POST');
}

function onInvitationButtonClick(e) {
    "use strict";

    var $this               = $(e.currentTarget),
        $tableRow           = $this.closest('tr'),
        friendUid           = $tableRow.find('.friend_url').data('friend-uid'),
        $actionResultHolder = $tableRow.find('.friend-action-result');

    inviteMember(friendUid, $tableRow, $actionResultHolder, inviteMemberCallback);
}

function generateInvitationButton() {
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

    $inviteButtonHolderGlobal = $('<a></a>', elementOptions).on('click', onInvitationButtonClick);
    elementOptions            = {'class' : 'icon-plus'};
    $inviteButton             = $('<i></i>', elementOptions).appendTo($inviteButtonHolderGlobal);

    return $inviteButtonHolderGlobal;
}

function onInvitationsHistoryButtonClick(e) {
    "use strict";

    var $this                = $(e.currentTarget),
        $tableRow            = $this.closest('tr'),
        friendName           = $tableRow.find('.friend_name').text(),
        friendUid            = $tableRow.find('.friend_url').data('friend-uid'),
        $invitationsHistory  = $this.parent().find('.collapse');

    if ($invitationsHistory.hasClass('in')) {
        $invitationsHistory.collapse('hide');
    }

    $invitationsHistory.collapse('show');
}

function generateInvitationsHistoryButton() {
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
    elementOptions                        = {'class' : 'icon-question-sign'};
    $invitationsHistoryButton             = $('<i></i>', elementOptions).appendTo($invitationsHistoryButtonHolderGlobal);

    return $invitationsHistoryButtonHolderGlobal;
}

function generateInvitationsHistoryElement() {
    "use strict";

    var elementOptions,
        $invitationsHistoryElement;

    elementOptions = {
        'class': "collapse",
        'text':  "Invited 10 times - click for details"
    };

    $invitationsHistoryElement = $('<div></div>', elementOptions);

    return $invitationsHistoryElement;
}

function generateActionButtonsGroup(tabId) {
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

    $sendMessageButton     = generateSendMessageButton().appendTo($buttonsGroup);
    $postOnWallButton      = generatePostOnWallButton().appendTo($buttonsGroup);
    $messagesHistoryButton = generateMessagesHistoryButton().appendTo($buttonsGroup);

    if (tabId === 'tab3') {
        $inviteButton              = generateInvitationButton().appendTo($buttonsGroup);
        $invitationsHistoryButton  = generateInvitationsHistoryButton().appendTo($buttonsGroup);
        $invitationsHistoryElement = generateInvitationsHistoryElement().appendTo($buttonsGroup);
    }

    return $buttonsGroup;
}

function generateFriendListTableRow(tab, friend) {
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

    $btnGroup = generateActionButtonsGroup(tab).appendTo($btnToolbar);

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
    $tableHeader   = generateFriendsTableHeader().appendTo($friendsTable);

    for (friendIndex in friendsArray) {
        if (friendsArray.hasOwnProperty(friendIndex)) {
            friend = friendsArray[friendIndex];

            if (friend !== undefined) {
                currentProgress = (friendsArray.length * friendIndex  / 100);
                $tableRow       = generateFriendListTableRow(tabId, friend);

                $friendsTable.append($tableRow);
                $progressBar.css('width', currentProgress + '%');
            }
        }
    }

    $progressHolder.hide(function () {
        $friendInfoHolder.show();
    });
}

function sendMessage(friendUid, messageText, $actionResultHolder, callback, messageObjectStack) {
    "use strict";

    var sendMessageHandler,
        additionalParameters,
        parameters = {
            'access_token' : vkGlobalAccessToken,
            'uid'          : friendUid,
            'message'      : messageText,
            'title'        : ''
        };

    sendMessageHandler = function (additionalParameters, e) {
        var answer              = JSON.parse(e.target.response),
            callback            = additionalParameters.callback,
            $actionResultHolder = additionalParameters.actionResultHolder,
            contentMessage      = 'message has been sent successfully',
            contentClass        = 'text-success',
            actionTime          = new Date(),
            messageObjectStack  = additionalParameters.messageObjectStack,
            obj;

        if (answer.error !== undefined) {
            contentMessage = answer.error.error_msg;
            contentClass   = 'text-error';
        }

        callback($actionResultHolder, contentClass, contentMessage + ' ' + actionTime.toTimeString());

        if (messageObjectStack !== undefined) {
            setTimeout(function () {
                obj = messageObjectStack.pop();

                if (obj === undefined) {
                    return;
                }

                sendMessage(obj.friendUid, obj.messageText, obj.actionResultHolder, updateActionResult, messageObjectStack);

            }, 150);
        }
    };

    additionalParameters = {
        'callback':           callback,
        'actionResultHolder': $actionResultHolder,
        'messageObjectStack': messageObjectStack
    };

    vkApiInstance.get('messages.send', sendMessageHandler, null, parameters, additionalParameters);
}

function getHistoryCallback(friendUid, answer, $actionResultHolder, $historyHolder, contentClass, contentMessage) {
    "use strict";

    var response = answer.response,
        message,
        messageIdx,
        newHistoryLine;

    $historyHolder.val('');

    for (messageIdx in response) {
        if (response.hasOwnProperty(messageIdx)) {
            message = response[messageIdx];

            if (message.mid !== undefined) {
                newHistoryLine = (message.from_id === friendUid ? 'friend' : 'me') + ': ' + message.body + '\n';
                $historyHolder.val($historyHolder.val() + newHistoryLine);
            }
        }
    }

    updateActionResult($actionResultHolder, contentClass, contentMessage);
}

function getHistory(friendUid, messageOffset, messageCount, $actionResultHolder, $historyHolder, callback) {
    "use strict";

    var getHistoryHandler,
        additionalParameters,
        parameters = {
            'access_token': vkGlobalAccessToken,
            'uid':          friendUid,
            'offset':       messageOffset,
            'count':        messageCount
        };

    getHistoryHandler = function (additionalParameters, e) {
        var answer             = JSON.parse(e.target.response),
            callback           = additionalParameters.callback,
            friendUid          = additionalParameters.friendUid,
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
    };

    additionalParameters = {
        'callback':           callback,
        'actionResultHolder': $actionResultHolder,
        'historyHolder':      $historyHolder,
        'friendUid':          friendUid
    };

    vkApiInstance.get('messages.getHistory', getHistoryHandler, null, parameters, additionalParameters);
}

function onMessageModalShown(e) {
    "use strict";

    var $parent             = $(e.currentTarget),
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

function onMessageModalCloseButtonClick(e, messageArea) {
    "use strict";
    $(messageArea).val('');
}

function onMessageModalSendMessageButtonClick(e) {
    "use strict";

    var $this               = $(e.currentTarget),
        $parent             = $this.parent().parent(),
        $actionResultHolder = $parent.data('actionResultHolder'),
        friendUid           = $parent.find('#friendUid').val(),
        $message            = $parent.find('.message'),
        messageText         = $message.val(),
        friendUidHolder,
        i,
        obj,
        messageObjectStack = [];

    $parent.find('button:first-child').trigger('click', $message);

    if (friendUid !== '') {
        sendMessage(friendUid, messageText, $actionResultHolder, updateActionResult);

        return;
    }

    friendUidHolder = $parent.data('friendUidHolder');

    for (i = 0; i < friendUidHolder.length; i += 1) {
        messageObjectStack.push({'friendUid': friendUidHolder[i], 'actionResultHolder' : $actionResultHolder[i], 'messageText' : messageText});
    }

    obj = messageObjectStack.pop();

    sendMessage(obj.friendUid, obj.messageText, obj.actionResultHolder, updateActionResult, messageObjectStack);
}

function onButtonNewInvitationToAllClick(e) {
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
        friendUidArray      = [],
        actionResultHolderArray = [],
        tableRowArray = [],
        i,
        obj,
        invitationObjectStack = [];

    friendName = $checkboxes.length + ' friends';

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
                tableRowArray.push($tr);
            }
        }

        for (i = 0; i < friendUidArray.length; i += 1) {
            invitationObjectStack.push({
                'friendUid':          friendUidArray[i],
                'actionResultHolder': actionResultHolderArray[i],
                'tableRow':           tableRowArray[i]
            });
        }

        obj = invitationObjectStack.pop();

        inviteMember(obj.friendUid, obj.tableRow, obj.actionResultHolder, inviteMemberCallback, invitationObjectStack);
    }
}

function onButtonNewMessageToAllClick(e) {
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
}

(function ($) {
    "use strict";

    getAuthenticated(function () {
        loadDateFromStorage(updateFriendsInforamtionLables);
    });

    $('#friends_members_of_the_group').on('loadFriendsToContentList', onLoadFriendsToContentList);
    $('#friends_invited_to_the_group').on('loadFriendsToContentList', onLoadFriendsToContentList);
    $('#friends_not_members_of_the_group').on('loadFriendsToContentList', onLoadFriendsToContentList);
    $('#newMessageModal').find('button:first-child').on('click', onMessageModalCloseButtonClick);
    $('#newMessageModal').on('shown', onMessageModalShown);
    $('#historyMessagesModal').on('shown', onMessageModalShown);
    $('#newMessageModal').find('.btn-primary').on('click', onMessageModalSendMessageButtonClick);
    $('.btn-new-invitation-to-all').on('click', onButtonNewInvitationToAllClick);
    $('.btn-new-message-to-all').on('click', onButtonNewMessageToAllClick);

})(jQuery);
