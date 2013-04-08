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
    membersListGlobal,
    friendsListGlobal,
    vkApiInstance               = new VkApi(),
    friendsMembersOfTheGroup    = [],
    friendsNotMembersOfTheGroup = [],
    friendsInvitedToTheGroup    = [],
    // vkGroupId                   = 49912690;
    // vkGroupId                   = 6462607;
    vkGroupId                      = '51174068';
