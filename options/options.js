// // Variables
// const nameInput = document.getElementById("name");
// const urlInput = document.getElementById("url");
// const parametersInput = document.getElementById("parameters");
// const addBtn = document.getElementById("add-btn");

// const latestUrlInput = document.getElementById("latestUrl");
// const latestParametersInput = document.getElementById("latestParameters");


// // Functions

// function id() {
//     var result           = '';
//     var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     var charactersLength = characters.length;
//     for ( var i = 0; i < 6; i++ ) {
//         result += characters.charAt(Math.floor(Math.random() * charactersLength));
//     }
//     return result;
// }


// // Event Listeners

// latestUrlInput.onchange = function() {
// 	chrome.storage.sync.set({'site': latestUrlInput.value}, function() {
//         console.log(`'site' saved with data: ${latestUrlInput.value}`);
//     });
// }

// latestParametersInput.onchange = function() {
// 	chrome.storage.sync.set({'parameters': latestParametersInput.value}, function() {
//         console.log(`'parameters' saved with data: ${latestParametersInput.value}`);
//     });
// }

// addBtn.onclick = async function() {
//     let name = nameInput.value;
//     if (name === "") {
//         alert("Please enter a name");
//         return;
//     }
//     let url = urlInput.value;
//     if (url === "") {
//         alert("Please enter a url");
//         return;
//     }
//     let parameters = parametersInput.value;
//     if (parameters === "") {
//         alert("Please enter parameters");
//         return;
//     }

//     chrome.storage.sync.get(['savedCollection'], function(items) {
//         let savedCollection = items.savedCollection;
//         if (!savedCollection) {
//             savedCollection = {};
//         }

//         savedCollection[name] = {
//             _id: id(),
//             name: name,
//             api: url,
//             parameters: parameters
//         };

//         chrome.storage.sync.set({'savedCollection': savedCollection}, function() {
//             console.log(`'savedCollection' saved with data: ${savedCollection}`);
//         });
//     });
// }

// // Page load

// window.onload = function() {
//     // get site and parameters from local storage
//     chrome.storage.sync.get(['site', 'parameters', 'savedCollection'], function(items) {
//         if (items.site) {
//             latestUrlInput.value = items.site;
//         }

//         if (items.parameters) {
//             latestParametersInput.value = items.parameters;
//         }

//         let savedCollectionSet = document.getElementById("savedCollectionSet");
//         // add div to savedCollectionSet element
//         for (let key in items.savedCollection) {
//             let obj = items.savedCollection[key];

//             let div = document.createElement("div");
//             div.innerHTML = `
//             <div class="saved-object">
//             <p>${obj.name}</p>
//             <p>${obj.api}</p>
//             <p>${obj.parameters}</p>
//             <button id="remove-${obj._id}">Remove</button>
//             </div>
//             `;

//             savedCollectionSet.appendChild(div);

//             let removeBtn = document.getElementById(`remove-${obj._id}`);
//             removeBtn.onclick = function() {
//                 delete items.savedCollection[key];
//                 chrome.storage.sync.set({'savedCollection': items.savedCollection}, function() {
//                     console.log(`'savedCollection' saved with data: ${items.savedCollection}`);
//                 });
//                 div.remove();
//             }
//         }

//     });
// }