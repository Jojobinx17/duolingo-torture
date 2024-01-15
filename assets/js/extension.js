
// settings button
document.getElementById("settings-link").addEventListener('click', () => { 
    chrome.tabs.create({
        url: "../../settings.html"
    });
    window.close();
});

async function getStreakData() {
    const storedUsername = await chrome.storage.local.get(["username"]);

    if(storedUsername.username.trim() == "" || storedUsername.username == null || storedUsername.username == undefined) {
        document.getElementById("streak-info").innerHTML = "Username error!";
    }
    
    const apiResponse = await chrome.runtime.sendMessage({ type: "getDuolingoUserData", username: storedUsername.username} );

    if(apiResponse == true) document.getElementById("streak-info").innerHTML = "Streak extended!";
    if(apiResponse == false) document.getElementById("streak-info").innerHTML = "Streak not extended!";
}

getStreakData();


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
