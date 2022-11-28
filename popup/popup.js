// Variables
const postButton = document.getElementById("btn");
const settingsButton = document.getElementById("settings-btn");
const presetButton = document.getElementById("preset-btn");

const copyUrlButton = document.getElementById("copy-url-btn");
const lookupButton = document.getElementById("lookup-btn");
const currentUrlButton = document.getElementById("current-url");

const clearFieldsButton = document.getElementById("clear-fields");
const oldFieldsButton = document.getElementById("old-fields");
const clearLogButton = document.getElementById("clear-log-field");

const optionInput = document.getElementById("game");
const urlInput = document.getElementById("url");
const paramtersInput = document.getElementById("parameters");

const log = document.getElementById("log");
const downloadLogButton = document.getElementById("download-log-btn");
const copyLogButton = document.getElementById("copy-log-btn");


// URl data
class URL {
    constructor(title, url, parameters) {
        this.title = title;
        this.url = url;
        this.parameters = parameters;
    }

    getURL() {
        let site = this.getSite();
        let parameters = this.getParameters();

        if (!site.endsWith("/") && !parameters.startsWith("/")) {
            site = site + "/";
        }

        return site + parameters;
    }

    getSite() {
        if (!this.url) this.url = urlInput.value;
        return this.url;
    }

    getParameters() {
        if (!this.parameters) this.parameters = paramtersInput.value;
        return this.parameters;
    }

    getTitle() {
        return this.title;
    }

    getId() {
        return this.title.replace(/\s/g, '').toLowerCase();
    }
}

const Collection = [];

function getCollection(key)
{
    // get url where key is the obj title
    for (let obj in Collection) {
        if (Collection[obj].getTitle() === key) {
            return Collection[obj];
        }
    }
}


// Functions 
function syntaxHighlight(json) {
    if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2);
    }

    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'syntax';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        } else if (/-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/.test(match)) {
            cls = 'number';
        } else if (/\[|\]/.test(match)) {
            cls = 'array';
        } else if (/\{|\}/.test(match)) {
            cls = 'object';
        } else if (/\,/.test(match)) {
            cls = 'comma';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

function parseJSON(str) {
    try {
        let object = JSON.parse(str);

        if (object && typeof object === "object") {
            return object;
        }
    }
    catch (e) {}

    return false;
}

async function get(url)
{
    // fetch url and await response
    try {
        let response = await fetch(url);

        let data = await response.text();
        let parsed = parseJSON(data);

        // Check if data is jsonq
        if (!parsed) {
            log.innerHTML = data;
            return;
        }

        // check for an error
        if (!parsed) {
            log.innerHTML = "No data";
            return;
        }

        if (data.error) {
            log.innerHTML = data.error;
            return;
        }

        // check if data is empty
        if (Object.keys(parsed).length === 0) {
            log.innerHTML = "No data found!";
            return;
        }

        let syntax = syntaxHighlight(parsed);
        log.innerHTML = syntax;

    } catch (e) {
        log.innerHTML = `<span class="error">Error</span>: ${e}`;
    }

}

function changeField(obj)
{
    urlInput.value = obj.url;
    paramtersInput.value = obj.parameters;
}

function saveUrl(obj)
{
    // save parameters and site in local storage
    chrome.storage.sync.set({'site': obj.getSite(), 'parameters': obj.getParameters()}, function() {
        console.log('URl saved');
    });
}


// On button click
postButton.onclick = async function()
{
    let obj = getCollection(optionInput.value);

    if (obj == undefined) {
        log.innerHTML = "No game selected";
        return;
    }

    // disable postButton
    let fakeButton = document.getElementById('fake-btn');
    postButton.style.display = "none";
    fakeButton.style.display = "block";

    log.innerHTML = "";

    saveUrl(obj);
    await get(obj.getURL());

    // enable postButton
    postButton.style.display = "block";
    fakeButton.style.display = "none";

    // reset input
    optionInput.value = "No Game";
    inputClearFields(true);
}

// On input change
optionInput.onchange = function() 
{
    let obj = getCollection(optionInput.value);

    if (obj == undefined) {
        log.innerHTML = "No game selected";
        return;
    }

    changeField(obj);
}

// Settings
settingsButton.onclick = function()
{
    chrome.runtime.openOptionsPage();
}

presetButton.onclick = function()
{
    chrome.runtime.openOptionsPage();
}

clearFieldsButton.onclick = function()
{
    inputClearFields(true);
}

oldFieldsButton.onclick  = function()
{
    inputOldFields();
}

currentUrlButton.onclick = function()
{
    inputCurrentUrl();
}

copyUrlButton.onclick = function()
{
    copyUrl();
}

clearLogButton.onclick = function()
{
    clearLog();
}

lookupButton.onclick = function()
{
    lookUpUrl();
}

downloadLogButton.onclick = function()
{
    downloadLog();
}

copyLogButton.onclick = function()
{
    copyLog();
}

// Page load
window.onload = async function() {
    // add no game if people want their own url
    let noGame = new URL("No Game", "", "");
    Collection["NoGame"] = noGame;
    addSelectOption(noGame);

    // get site and parameters from local storage
    chrome.storage.sync.get(['site', 'parameters', 'savedCollection'], function(items) {
        if (items.site) {
            urlInput.value = items.site;
        }

        if (items.parameters) {
            paramtersInput.value = items.parameters;
        }
    });

    loadSavedCollection();
}

function loadSavedCollection()
{
    chrome.storage.sync.get('savedCollection', function(items) {
        let savedCollection = items.savedCollection;

        for (let key in savedCollection) {
            let obj = new URL(savedCollection[key].name, savedCollection[key].api, savedCollection[key].parameters);
            Collection[key] = obj;

            addSelectOption(obj);
        }
    });
}

function addSelectOption(obj)
{
    let option = document.createElement("option");
    option.text = obj.getTitle();
    option.value = obj.getTitle();
    option.id = obj.getId();

    optionInput.add(option);
}

function clearLog()
{
    log.innerHTML = "";
}

function lookUpUrl()
{
    let url = getCollection("No Game");

    if (url.getURL() == "/") {
        log.innerHTML = "<span class=\"error\">No URL found</span>";
        return;
    }

    chrome.tabs.create({url: url.getURL()});	
}

function copyUrl()
{
    let url = getCollection("No Game");
    if (url.getURL() == "/") {
        log.innerHTML = "<span class=\"error\">No URL found</span>";
        return;
    }

    copyToClipboard(url.getURL());
}

function copyToClipboard(text) 
{
    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

function copyLog()
{
    let text = log.innerText;
    if (text == "") {
        log.innerHTML = "<span class=\"error\">No Log found</span>";
        return;
    }

    copyToClipboard(text);
}

function downloadLog()
{
    downloadLogButton.innerHTML = "Downloading...";
    let text = log.innerText;
    if (text == "") {
        downloadLogButton.innerHTML = "Download Log";
        log.innerHTML = "<span class=\"error\">Nothing to download!</span>";
        return;
    }

    let filename = "log";
    let extension = "txt";

    if (parseJSON(text)) {
        text = JSON.stringify(parseJSON(text), null, 4);
        extension = "json";
    }

    download(`${filename}.${extension}`, text);
    downloadLogButton.innerHTML = "Download Log";
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    
    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function inputClearFields(elem)
{
    urlInput.value = "";
    paramtersInput.value = "";

    if (elem) {
        oldFieldsButton.style.display = "block";
        clearFieldsButton.style.display = "none";
    }
}

function inputOldFields(change)
{
    chrome.storage.sync.get(['site', 'parameters'], function(items) {
        if (items.site) {
            urlInput.value = items.site;
        }

        if (items.parameters) {
            paramtersInput.value = items.parameters;
        }
    });

    clearFieldsButton.style.display = "block";
    oldFieldsButton.style.display = "none";
}

function inputCurrentUrl()
{
    inputClearFields(false);

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        let fullUrl = tabs[0].url;
        let urlList = fullUrl.replace("https://", "").split("/");

        if (urlList.length == 0) {
            return;
        }

        if (urlList.length == 1) {
            urlInput.value = urlList[0];
            return;
        }

        let url = urlList[0];
        let parameters = "";
        for (let i = 1; i < urlList.length; i++) {
            parameters += urlList[i] + "/";
        }

        urlInput.value = `https://${url}/`;
        paramtersInput.value = parameters;
    });
}