
console.log("I'm alive!");

chrome.runtime.onInstalled.addListener(function (object) {
    let URL = chrome.runtime.getURL("../../settings.html#welcome");

    if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {

        chrome.tabs.create({ url: URL }, function (tab) {
            console.log("Welcome page launched!");
        });

        const currentDate = new Date();
        const timeOfInstall = currentDate.getTime();
        
        chrome.storage.local.set({ "state": "stage1" }).then(() => {
            console.log("State has been reset to one.");
        });
        chrome.storage.local.set({ "time": timeOfInstall }).then(() => {
            console.log("Time has been set to the current time.");
        });
        chrome.storage.local.set({ "extended": true }).then(() => {
            console.log("Streak extended value has been defaulted to true.");
        });
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    handleRequest(request).then(function(response) {
        sendResponse(response)
    });
    return true;
});

async function handleRequest(request) {

    const currentTab = await chrome.tabs.getCurrent();
    const currentURL = request.url;
    
    let responseToSend = "none";

    if (request.type === "getDuolingoUserData") {

        const duolingoApiResponse = 
            await fetch("https://www.duolingo.com/api/1/users/show?username=" + request.username);

        const jsonResponse = await duolingoApiResponse.json();
        const streakExtended = jsonResponse.streak_extended_today;

        console.log("API data requested - Response:", streakExtended);
        responseToSend = streakExtended;
    }


    if (request.type === "closablePopup") {

        console.log("Closable popup requested.");
        responseToSend  = "success";

        chrome.windows.create({

            "focused": true,

            "type": "popup",
            "state": "maximized",

            "url": "../../popup.html",

        });
    }

    if (request.type === "unclosablePopup") {

        console.log("Unclosable popup requested.")

        responseToSend  = "success";
        chrome.tabs.update(currentTab, { url: "../../popup.html#unclosable-" + currentURL });
    }

    return responseToSend;

}
