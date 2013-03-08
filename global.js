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
    friendsListGlobal,
    friendsMembersOfTheGroup = [],
    friendsNotMembersOfTheGroup = [],
    friendsInvitedToTheGroup = [],
    vkGroupId = 49912690;
