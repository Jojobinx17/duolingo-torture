
console.log("test!");

// chrome.runtime.onInstalled.addListener(function (object) {
//     let URL = chrome.runtime.getURL("../../settings.html#welcome");

//     if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
//         chrome.tabs.create({ url: URL }, function (tab) {
//             console.log("Welcome page launched!");
//         });
//     }
// });

// chrome.runtime.onMessageExternal.addListener( (request, sender, sendResponse) => {
//     console.log("Received message from " + sender + ": ", request);
//     sendResponse({ received: true }); //respond however you like
// });

