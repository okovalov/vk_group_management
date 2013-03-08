/*global document, chrome, alert, XMLHttpRequest */

function handleError(error) {
    "use strict";

    var errorMessageElement;

    chrome.storage.local.remove('vk_access_token');

    errorMessageElement = document.createElement('h1');
    errorMessageElement.textContent = error.error_msg;
    document.body.appendChild(errorMessageElement);
}

function serialize(obj, prefix) {
    "use strict";

    var str = [],
        p,
        k,
        v;

    for (p in obj) {
        k = prefix ? prefix + "[" + p + "]" : p;
        v = obj[p];
        str.push(typeof v === "object" ? serialize(v, k) : encodeURIComponent(k) + "=" + encodeURIComponent(v));
    }

    return str.join("&");
}

/**
 * Display an alert with an error message, description
 *
 * @param  {string} textToShow  Error message text
 * @param  {string} errorToShow Error to show
 */
function displayeAnError(textToShow, errorToShow) {
    "use strict";

    alert(textToShow + '\n' + errorToShow);
}

function createHtmlFromString(stringAnswer) {
    "use strict";

    var doc = document.implementation.createHTMLDocument('example');

    doc.documentElement.innerHTML = stringAnswer;

    return doc;
}

/**
 * Retrieve a value of a parameter from the given URL string
 *
 * @param  {string} url           Url string
 * @param  {string} parameterName Name of the parameter
 *
 * @return {string}               Value of the parameter
 */
function getUrlParameterValue(url, parameterName) {
    "use strict";

    var urlParameters  = url.substr(url.indexOf("#") + 1),
        parameterValue = "",
        index,
        temp;

    urlParameters = urlParameters.split("&");

    for (index = 0; index < urlParameters.length; index += 1) {
        temp = urlParameters[index].split("=");

        if (temp[0] === parameterName) {
            return temp[1];
        }
    }

    return parameterValue;
}

function appendToBody(elementType, elementProperty, propertyValue) {
    childElement                  = document.createElement(elementType);
    childElement[elementProperty] = propertyValue;

    document.body.appendChild(childElement);
}
