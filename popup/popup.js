// Variables
const postButton = document.getElementById("btn");
const settingsButton = document.getElementById("settings-btn");
const presetButton = document.getElementById("preset-btn");

const optionInput = document.getElementById("game");
const urlInput = document.getElementById("url");
const paramtersInput = document.getElementById("parameters");

const log = document.getElementById("log");


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

    saveUrl(obj);
    await get(obj.getURL());

    // enable postButton
    postButton.style.display = "block";
    fakeButton.style.display = "none";

    // reset input
    optionInput.value = "No Game";
    urlInput.value = "";
    paramtersInput.value = "";
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