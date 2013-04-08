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

function clearBodyContent() {
    document.getElementById('body-content').innerHTML = '';
}

function appendToBody(elementType, elementProperty, propertyValue) {
    childElement                  = document.createElement(elementType);
    childElement[elementProperty] = propertyValue;

    document.getElementById('body-content').appendChild(childElement);
}

// extends 'from' object with members from 'to'. If 'to' is null, a deep clone of 'from' is returned
function extend(from, to)
{
    if (from == null || typeof from != "object") return from;
    if (from.constructor != Object && from.constructor != Array) return from;
    if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function ||
        from.constructor == String || from.constructor == Number || from.constructor == Boolean)
        return new from.constructor(from);

    to = to || new from.constructor();

    for (var name in from)
    {
        to[name] = typeof to[name] == "undefined" ? extend(from[name], null) : to[name];
    }

    return to;
}
