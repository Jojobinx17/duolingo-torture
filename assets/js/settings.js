let myUsername = "";

document.getElementById("save-username-button").addEventListener('click', () => { 

    async function saveUsername() {

        let inputValue = document.getElementById("username-input").value;

        if(inputValue.trim() == "" || inputValue == undefined) {
            
            document.getElementById("current-username").innerHTML = "Enter a valid username.";
            document.getElementById("status").style.display = "none";
            
        } else {

            if(myUsername != inputValue) {
                
                document.getElementById("status").style.display = "none";
                let usernameSuccess = await checkUsername(inputValue);
                document.getElementById("current-username").innerHTML = "Checking username...";
                myUsername = inputValue;
            }

            document.getElementById("current-username").style.display = "block";
        }
    }

    async function checkUsername(usernameToCheck) {

        fetch("https://www.duolingo.com/api/1/users/show?username=" + usernameToCheck)
            .then(response => {                
                if (response.ok) {
                    return "success"
                } else if(response.status === 404) {
                    return Promise.reject('404')
                } else {
                    return Promise.reject('other');
                }
            })
            .then(data => { 
                document.getElementById("status").style.display = "block"; 
                chrome.storage.local.set({ "username": usernameToCheck }).then(getStoredUsername());

            })
            .catch(error => { showUsernameError();});
    }

    async function showUsernameError() {
        document.getElementById("current-username").innerHTML = "Username does not belong to a Duolingo account.";
    }

    saveUsername();
});

document.getElementById("close-button").addEventListener('click', () => { 
    window.close();
});

document.getElementById("edit-difficulty-button").addEventListener('click', () => { 

    let inputValue = Math.round(document.getElementById("difficulty-input").value);
    let responseElement = document.getElementById("set-difficulty-response");

    if(inputValue < 4 && inputValue > -1) {

        chrome.storage.local.set({ "state": "stage" + inputValue }).then(() => {
            console.log("State set successfully.");
            responseElement.innerHTML = "Difficulty set to " + inputValue + "!";
        });

    } else {
        responseElement.innerHTML = "Please enter a value from 0-3.";
    }

});

chrome.storage.local.get(["state"]).then(function(response) {
   document.getElementById("set-difficulty-response").innerHTML = "Difficulty is currently " + response.state.substring(5) + ".";
})


async function getStoredUsername() {

    const storedUsername = await chrome.storage.local.get(["username"]);
    let element = document.getElementById("current-username");
    
    element.style.display = "block";
    element.innerHTML = "Current username: " + storedUsername.username;

    if(storedUsername.username.trim() == "" || storedUsername.username == undefined) {
        element.innerHTML = "Please fill in a valid username.";
        document.getElementById("status").style.display = "none";
    }

}

if(window.location.hash == '#welcome') {
    
    document.getElementById("welcome").style.display = "block";
    document.getElementById("title").style.display = "none";
    document.getElementById("current-username").style.display = "none";
    
} else {
    
    getStoredUsername();
    
}



// -------------------------- DEBUG --------------------------

function humanReadableDate() {
    let date = new Date();
    let output = "" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    date = null;
    return output
}

document.getElementById("show-debug-button").addEventListener('click', () => { 
    document.getElementById("debug").style.display = "block";
});

document.getElementById("edit-stage-button").addEventListener('click', () => { 

    let inputValue = document.getElementById("stage-input").value;
    let responseElement = document.getElementById("set-stage-response");

    chrome.storage.local.set({ "state": "stage" + inputValue }).then(() => {
        
        console.log("State set successfully.");
        responseElement.innerHTML = "Stage set to " + inputValue + " at " + humanReadableDate();

        chrome.storage.local.get(["state"]).then(function(response) {
                    document.getElementById("check-stage-response").innerHTML = 
                        "Stage is currently " + response.state + " at " + humanReadableDate();
        });

    });

});

document.getElementById("check-stage-button").addEventListener('click', () => { 
    
    let responseElement = document.getElementById("check-stage-response");

    chrome.storage.local.get(["state"]).then(function(response) {
        responseElement.innerHTML = "Stage is currently " + response.state + " at " + humanReadableDate();
    });

});

document.getElementById("reset-time-button").addEventListener('click', () => { 
    
    let responseElement = document.getElementById("reset-time-response");

    const currentDate = new Date();
    const currentTime = currentDate.getTime();

    chrome.storage.local.set({ "time": currentTime }).then(() => {
            responseElement.innerHTML = "Timer set to 0 ("+ currentTime +") at " + humanReadableDate();
    });
});

document.getElementById("check-time-button").addEventListener('click', () => { 

    let responseElement = document.getElementById("check-time-response");

    chrome.storage.local.get(["time"]).then(function(response) {

        const currentDate = new Date();
        const timeElapsedSeconds = (currentDate.getTime() - response.time) / 1000;
        responseElement.innerHTML = 
            
            "Time value is currently " + timeElapsedSeconds + " seconds (" +
            Math.floor(timeElapsedSeconds/60/60) + " hours, " +
            Math.round(timeElapsedSeconds/60 - (Math.floor(timeElapsedSeconds/60/60) * 60)) + " minutes).";
    });
});


