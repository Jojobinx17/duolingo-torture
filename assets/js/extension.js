
// settings button
document.getElementById("settings-link").addEventListener('click', () => { 
    chrome.tabs.create({
        url: "../../settings.html"
    });
    window.close();
});

// create popup window (debug only)                                     
// chrome.windows.create({
    
//     "focused": true,
//     "setSelfAsOpener": true,
//     "type": "popup",

//     "url": "../../popup.html",
    
//     "width": 500,
//     "height": 500,

//     "top": parseInt(window.screen.width/2 - 250), 
//     "left": parseInt(window.screen.height/2 - 250)

// });
