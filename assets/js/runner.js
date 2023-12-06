
// on page load, start loop that tries to create popup over and over
// this prevents devtools strats, while only reading from storage
// only ping duolingo api on reloads


const currentDate = new Date();
const timeOfLoad = currentDate.getTime();

let timerForStage0 = 60; // seconds (unused)
let timerForStage1 = 60; // seconds (unused)
let timerForStage2 = 60; // seconds (unused)

let stageProcessed = false;

async function duolingoMain() {

    let data = {};

    // fetching state
    const stateResponse = await chrome.storage.local.get(["state"]);
    data.state = stateResponse.state;
    
    // fetching time
    const timeResponse = await chrome.storage.local.get(["time"]);
    data.time = timeResponse.time;
    
    // fetching stored uername
    const usernameResponse = await chrome.storage.local.get(["username"]);
    data.username = usernameResponse.username;

    // fetching last known extended value
    const lastKnownExtendedResponse = await chrome.storage.local.get(["extended"]);
    data.lastKnownExtended = lastKnownExtendedResponse.extended;
    if(data.lastKnownExtended != true && data.lastKnownExtended != false) data.lastKnownExtended = false;

    if(data.lastKnownExtended == false) {

        // ============================= STAGE 0 ============================= 
        // do nothing, but increment state if enough time has passed.
            
        if(data.state == "stage0") {
    
            stageProcessed = true;
            console.log("State value is zero.");
            
            await handleTimers(0);
            
        }
    
        // ============================= STAGE 1 ============================= 
        // create small popups on page load
        
        if(data.state == "stage1") {
    
            stageProcessed = true;
            console.log("State value is one, creating small popups...");
    
            await createInPagePopup(0);        
            await createInPagePopup(1);
    
            await handleTimers(1);
            
        }
        
        // ============================= STAGE 2 ============================= 
        // popup that forces user to click 'later' to continue browsing
        
        if(data.state == "stage2") {
    
            stageProcessed = true;
            console.log("State value is two, opening popup window...");
    
            var extensionID = chrome.runtime.id;
    
            const response = await chrome.runtime.sendMessage({ type: "closablePopup", url: window.location.href} );
            console.log(response);
    
            // handle timers
            await handleTimers(1);
    
        }
    
        // ============================= STAGE 3 ============================= 
        // completely block the entire internet
        
        if(data.state == "stage3") {

            stageProcessed = true;
            console.log("State value is three, opening forced popup window...");

            var extensionID = chrome.runtime.id;

            var openUnclosablePopup = setInterval(function(){
                const response = chrome.runtime.sendMessage({ type: "unclosablePopup", url: window.location.href});
            }, 200);

        }

        // handling undefined values
        if(stageProcessed == false) {
            console.log("Value(s) unable to be used, resetting all data...");
    
            chrome.storage.local.set({ "state": "stage0" }).then(() => {
                console.log("State has been reset to zero.");
            });
            chrome.storage.local.set({ "time": timeOfLoad }).then(() => {
                console.log("Time reset successfully.");
            });
        }
        
    } else {

        console.log("User has completed a lesson today, doing nothing.");

    }

    //fetching duolingo api
    const apiResponse = await chrome.runtime.sendMessage({ type: "getDuolingoUserData", username: data.username} );  
    data.realExtended = apiResponse;
    
    console.log("Full user data:", data);

    if(data.realExtended != data.lastKnownExtended) {

        console.log(data.state, data.realExtended);

        // stage 0
        if(data.state == "stage0" && data.realExtended == false) await handleTimers(0);
        

        // stage 1
        if(data.state == "stage1" && data.realExtended == true) {
            document.getElementById("duo-sees-you-0").remove();
            document.getElementById("duo-sees-you-1").remove();
        }

        if(data.state == "stage1" && data.realExtended == false) {
            await createInPagePopup(0);        
            await createInPagePopup(1);
            await handleTimers(1);
        }

        if(data.state == "stage2" && data.realExtended == false) {
            const response = await chrome.runtime.sendMessage({ type: "closablePopup", url: window.location.href} );
            await handleTimers(2);
        }

        if(data.state == "stage3" && data.realExtended == false) {
            var openUnclosablePopup = setInterval(function(){
                const response = chrome.runtime.sendMessage({ type: "unclosablePopup", url: window.location.href});
            }, 200);
        }

        // update the local storage to reflect the proper value
        await chrome.storage.local.set({ "extended": data.realExtended });
    }
}






// ============================= FUNCTIONS =============================



async function handleTimers(currentStage) {

}

async function createInPagePopup(type) {

    // intialize some variables and the font to use
    
    var container = document.createElement('div')
    var xx = 50 + (window.innerWidth/2)*type + Math.floor(Math.random() * (window.innerWidth/2 - 300));
    var yy = 50 + Math.floor(Math.random() * (window.innerHeight - 150));
    var newStyle = document.createElement('style');
    
    newStyle.appendChild(document.createTextNode("\
    @font-face {\
        font-family: 'din-round-bold';\
        src: url('" + chrome.runtime.getURL(`assets/fonts/DINRoundPro-Bold.woff`) + "') format('woff')\
        }\
    "));

    document.head.appendChild(newStyle);

        var container = document.createElement('div')


    // this styles the popup
    
    var styleString = 
        "all: revert; position: fixed; height: 50px; width: 200px; padding-left: 10px; padding-right: 10px; " + 
        "border: 4px solid #37464f; border-radius: 10px; background-color: #131f24; font-family: 'din-round-bold'; " +  
        "display:flex; justify-content:center; align-items:center; z-index:100000000; " + 
        "color: #f1f7fb; font-size: 20px; line-height: 0px;";

    // finally, create the popup

    container.id = "duo-sees-you-" + type;
    
    container.style = styleString;
    container.style.top = yy.toString() + "px";
    container.style.left = xx.toString() + "px";
    container.align = "center";

    if(type == 0) container.innerHTML = 'Time to practice?'
    
    if(type == 1) container.innerHTML = '<img src="' + chrome.runtime.getURL(`assets/images/duo-wave.svg`) + 
                                        '" height="40px" /> <a href="https://duolingo.com/lesson" ' + 
                                        'style="text-decoration: none; color: #49c0f8;">START LESSON</a>';

    document.body.appendChild(container);

    return true;
}

duolingoMain();


