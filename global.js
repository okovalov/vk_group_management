var vkGlobalAccessToken,
    VkApi = function () {
        "use strict";

        var vkURL   = 'https://api.vk.com/method/',
            request = new XMLHttpRequest();

        this.get = function (methodName, onloadCallaback, callerInstance, incomingParameters, incomingAdditionalParameters, incomingRequestType) {
            var parameters           = incomingParameters === undefined ? undefined : incomingParameters,
                requestType          = incomingRequestType === undefined ? 'GET' : incomingRequestType,
                additionalParameters = incomingAdditionalParameters === undefined ? {} : incomingAdditionalParameters,
                urlParameters        = parameters !== undefined ? '?' + serialize(parameters) : '',
                requestFormData      = null,
                i,
                field,
                fieldName,
                fieldValue;

            vkURL = 'https://api.vk.com/method/';

            if (additionalParameters.postRequest !== undefined) {
                vkURL           = additionalParameters.postUrl;
                requestFormData = new FormData();

                for (i = 0; i < additionalParameters.postParameters.field.length; i += 1) {
                    field = additionalParameters.postParameters.field[i];
                    requestFormData.append(field.fieldName, field.fieldValue);
                }
            }

            request.open(requestType,  vkURL + methodName + urlParameters, true);
            request.onload = onloadCallaback.bind(callerInstance, additionalParameters);
            request.send(requestFormData);
        };
    },
    membersListGlobal,
    friendsListGlobal,
    vkApiInstance               = new VkApi(),
    friendsMembersOfTheGroup    = [],
    friendsNotMembersOfTheGroup = [],
    friendsInvitedToTheGroup    = [],
    // vkGroupId                   = 49912690;
    // vkGroupId                   = 6462607;
    vkGroupId                      = '51174068';
    vkMemberId                     = '6462607';
