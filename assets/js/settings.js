

// Before we get to the code, here's some fun trivia: 
// The first few version of this extension were entirely created on my school chromebook with its default text editor! It had syntax highlighting, but not much else. Made debugging a little tricky, lol.

// -------------------------- USERNAME FUNCTIONS --------------------------


let currentlySelectedDifficulty = 1;
let lastEnteredUsername = "";
let savedUsername = "";
let savedData = {};

document.getElementById("save-username-button").addEventListener('click', () => { 
    saveUsername();
});

document.addEventListener('keypress', function(event) {
	if (event.key === "Enter") {
		saveUsername();
	}
});

document.getElementById("close-button").addEventListener('click', () => { 
    window.close();
});

async function saveUsername() {

	let inputValue = document.getElementById("username-input").value;

	if(inputValue.trim() == "" || inputValue == undefined) {

		document.getElementById("current-username").innerHTML = "Enter a valid username.";
		document.getElementById("status").style.display = "none";

	} else {

		if(lastEnteredUsername != inputValue && savedUsername != inputValue) {

			document.getElementById("status").style.display = "none";
			let usernameSuccess = await checkUsername(inputValue);
			document.getElementById("current-username").innerHTML = "Checking username...";
			lastEnteredUsername = inputValue;
		}

		document.getElementById("current-username").style.display = "block";
	}
}

async function checkUsername(usernameToCheck) {

	fetch("https://www.duolingo.com/api/1/users/show?username=" + usernameToCheck)
		.then(response => {
			if (response.ok) {

				response.json().then(function(result){
					getCurrentlyLearningLanguage(result.languages);
					return "success";
				});

			} else if(response.status === 404) {
				return Promise.reject('err-not-found');

			} else if(response.status === 401) {
				return Promise.reject('err-auth');

			} else {
				return Promise.reject('other');
			}
		})
		.then(data => { 
			document.getElementById("status").style.display = "block"; 
			chrome.storage.local.set({ "username": usernameToCheck }).then(getStoredUsername());

		})
		.catch(error => { showUsernameError(error); });
}

async function showUsernameError(error) {
	
	if(error == "err-not-found") {
		document.getElementById("current-username").innerHTML = "Username does not belong to a Duolingo account.";
		
	} else if (error == "err-auth") {
		lastEnteredUsername = "";
		document.getElementById("current-username").innerHTML = 'Unable to access the Duolingo API. Please make sure that you are signed into <a style="font-size: 18" target="_blank" href="https://duolingo.com">duolingo.com</a> on this device.';
		
	} else {
		lastEnteredUsername = "";
		document.getElementById("current-username").innerHTML = "An error occured. Please make sure you are signed into duolingo.com, and you typed in the username correctly.";
	}
}

async function getStoredUsername() {

    const storedUsername = await chrome.storage.local.get(["username"]);
    let element = document.getElementById("current-username");

    lastEnteredUsername = storedUsername.username;
    savedUsername = storedUsername.username;
    
    element.style.display = "block";
    element.innerHTML = "Current username: " + storedUsername.username;

    if(storedUsername.username.trim() == "" || storedUsername.username == undefined) {
        element.innerHTML = "Please fill in a valid username.";
        document.getElementById("status").style.display = "none";
    }
}

async function getCurrentlyLearningLanguage(languages) {

	for(let i = 0; i < languages.length; i++) {
		
		if(languages[i].current_learning == true) {
			await chrome.storage.local.set({ "language": languages[i].language_string });
			console.log("Current language set to " + languages[i].language_string);
			return true;
		}
	}
	
	const currentlyStoredLanguage = await chrome.storage.local.get(["language"]);
		
	if(currentlyStoredLanguage !== "none") {
		await chrome.storage.local.set({ "language": languages[i].language_string });
		console.log("Current language set to " + languages[i].language_string);
	}

	return true;
}

// -------------------------- DIFFICULTY BUTTONS --------------------------

document.getElementById("changelog-button").addEventListener('click', () => { 
    chrome.tabs.create({
        url: "../../changelog.txt"
    });
});

document.getElementById("diff-title-welcome").addEventListener('click', () => { 
    document.getElementById("difficulty-info").style.display = "block";
});

document.getElementById("diff-title").addEventListener('click', () => { 
    document.getElementById("difficulty-info").style.display = "block";
});

document.getElementById("close-diff-info-button").addEventListener('click', () => { 
    document.getElementById("difficulty-info").style.display = "none";
});


function getDifficulty(level) {
    chrome.storage.local.get(["difficulty"]).then(function(result) {
        selectDifficulty(result.difficulty, true);
    });
}

function setDifficulty(level) {
    chrome.storage.local.set({ "difficulty": level }).then(function(result) {
    });
}

document.getElementById("diff-easy-button").addEventListener('click', () => { 
    selectDifficulty(0, true);
});

document.getElementById("diff-normal-button").addEventListener('click', () => { 
    selectDifficulty(1, true);
});


document.getElementById("diff-hard-button").addEventListener('click', () => { 
    selectDifficulty(2, true);
});

document.getElementById("accept-duo-button").addEventListener('click', () => { 
    selectDifficulty(3, true);
});


document.getElementById("diff-duo-button").addEventListener('click', () => {    
    document.getElementById("conformation-duo-buttons").style.display = "block";
    document.getElementById("diff-buttons").style.display = "none";
    document.getElementById("diff-title").style.display = "none";
    document.getElementById("diff-title-welcome").style.display = "none";
    document.getElementById("difficulty-flavour-text").innerHTML = 
        '<span style="color: #ee5555">WARNING!</span> &nbsp;' +   
        '<span style="color: #f1f7fb">Setting your difficulty to Torture will ' +
        '<span style="color: #ee5555">LOCK YOUR SETTINGS</span>' +
        '. </span>';
});


document.getElementById("deny-duo-button").addEventListener('click', () => {     
    document.getElementById("conformation-duo-buttons").style.display = "none";
    document.getElementById("diff-buttons").style.display = "block";
    document.getElementById("diff-title").style.display = "block";
    document.getElementById("diff-duo-button").classList.remove("button-blocked");
    selectDifficulty(currentlySelectedDifficulty, false);
});

function selectDifficulty(level, setting) {

    if(level == 0) {
        document.getElementById("diff-easy-button").classList.remove("button-selected");
        document.getElementById("diff-normal-button").classList.remove("button-selected");
        document.getElementById("diff-hard-button").classList.remove("button-selected");
        document.getElementById("diff-duo-button").classList.remove("button-selected");

        document.getElementById("diff-easy-button").classList.add("button-selected");  
        currentlySelectedDifficulty = 0;

        document.getElementById("conformation-duo-buttons").style.display = "none";
        document.getElementById("diff-duo-button").classList.remove("button-blocked");
        document.getElementById("difficulty-flavour-text").innerHTML = "Difficulty set to Easy.";  

        if(setting == true) setDifficulty(level);
    }
    

    if(level == 1) {
        document.getElementById("diff-easy-button").classList.remove("button-selected");
        document.getElementById("diff-normal-button").classList.remove("button-selected");
        document.getElementById("diff-hard-button").classList.remove("button-selected");
        document.getElementById("diff-duo-button").classList.remove("button-selected");
        
        document.getElementById("diff-normal-button").classList.add("button-selected");  
        currentlySelectedDifficulty = 1;
        
        document.getElementById("conformation-duo-buttons").style.display = "none";
        document.getElementById("diff-duo-button").classList.remove("button-blocked");
        document.getElementById("difficulty-flavour-text").innerHTML = "Difficulty set to Normal."; 

        if(setting == true) setDifficulty(level);
    }
    

    if(level == 2) {
        document.getElementById("diff-easy-button").classList.remove("button-selected");
        document.getElementById("diff-normal-button").classList.remove("button-selected");
        document.getElementById("diff-hard-button").classList.remove("button-selected");
        document.getElementById("diff-duo-button").classList.remove("button-selected");
       
        document.getElementById("diff-hard-button").classList.add("button-selected"); 
        currentlySelectedDifficulty = 2;
        
        document.getElementById("conformation-duo-buttons").style.display = "none";
        document.getElementById("diff-duo-button").classList.remove("button-blocked");
        document.getElementById("difficulty-flavour-text").innerHTML = "Difficulty set to Hard.";  

        if(setting == true)  setDifficulty(level);
   }

    if(level == 3) {
        document.getElementById("diff-easy-button").classList.add("button-blocked");
        document.getElementById("diff-normal-button").classList.add("button-blocked");
        document.getElementById("diff-hard-button").classList.add("button-blocked"); 

        document.getElementById("diff-easy-button").classList.remove("button-selected");
        document.getElementById("diff-normal-button").classList.remove("button-selected");
        document.getElementById("diff-hard-button").classList.remove("button-selected");
        document.getElementById("diff-duo-button").classList.remove("button-selected");

        document.getElementById("diff-easy-button").disabled = true;
        document.getElementById("diff-normal-button").disabled = true;
        document.getElementById("diff-hard-button").disabled = true;
        document.getElementById("diff-duo-button").disabled = true;

        document.getElementById("diff-duo-button").classList.add("button-selected"); 
        document.getElementById("diff-duo-button").classList.remove("button-blocked");

        currentlySelectedDifficulty = 3;
        document.getElementById("conformation-duo-buttons").style.display = "none";
        document.getElementById("diff-buttons").style.display = "block";
        document.getElementById("diff-title").style.display = "block";
        document.getElementById("difficulty-flavour-text").innerHTML = "Difficulty set to Torture. Good luck!";  

        if(setting == true)  setDifficulty(level);

    }
    
}

async function resetData() {

        const d = new Date();
        const timeOfInstall = d.getTime();
    
        await chrome.storage.local.set({ "state": 1 });
        await chrome.storage.local.set({ "time": timeOfInstall });
        await chrome.storage.local.set({ "extended": true });
        await chrome.storage.local.set({ "username": "" });

        // mean mode
        // const storedDifficulty = await chrome.storage.local.get(["difficulty"]);
        // if(storedDifficulty.difficulty != 3) {
        //     await chrome.storage.local.set({ "difficulty": 1 });
        // }
    
        await chrome.storage.local.set({ "difficulty": 1 });
        await chrome.storage.local.set({ "ignoreDifficulty": false });
        await chrome.storage.local.set({ "ignoreTime": false });
        await chrome.storage.local.set({ "time2": timeOfInstall });
        await chrome.storage.local.set({ "time3": timeOfInstall });
		await chrome.storage.local.set({ "language": "none" });

        window.location.hash = "#welcome";
        window.location.reload();

}

document.getElementById("reset-data-button").addEventListener('click', () => { 
    resetData();
});


// -------------------------- OTHER --------------------------


if(window.location.hash == '#welcome') {
    
    document.getElementById("welcome-section").style.display = "block";
    document.getElementById("title").style.display = "none";
    document.getElementById("current-username").style.display = "none";
    document.getElementById("difficulty-flavour-text").innerHTML = "";
    document.getElementById("diff-title").style.display = 'none';
    document.getElementById("diff-title-welcome").style.display = 'block';

    chrome.storage.local.get(["difficulty"]).then(function(result) {
        selectDifficulty(result.difficulty, true);
    });
    
    
} else {
    
    getStoredUsername();
    getDifficulty();
}









// -------------------------- DEBUG FUNCTIONS --------------------------

document.getElementById("close-debug-button").addEventListener('click', () => { 
    document.getElementById("debug").style.display = "none";
});

async function initDebug() {

    chrome.storage.local.get(null).then(function(result) {
        
        savedData = result
        console.log(savedData);
    
        document.getElementById("set-stage-data").innerHTML =
            "Stage: " + savedData.state;
        
        document.getElementById("d-edit-diff-data").innerHTML =
            "Difficulty: " + savedData.difficulty;
        
        document.getElementById("ignore-diff-data").innerHTML =
            "Ignoring difficulty: " + savedData.ignoreDifficulty;
                
        document.getElementById("ignore-time-data").innerHTML =
            "Ignoring time: " + savedData.ignoreTime;
        
        document.getElementById("set-time-data").innerHTML =
            "Current time: " + humanReadableDate(savedData.time);
        
        document.getElementById("set-time-2-data").innerHTML =
            "First page load today: " + humanReadableDate(savedData.time2);

        document.getElementById("set-time-3-data").innerHTML =
            "Time of last popup: " + humanReadableDate(savedData.time3);
    });

}

function humanReadableDate(date = 0) {
    var d = new Date(date);
    let output = "" + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    date = null;
    return output
}

document.getElementById("show-debug-button").addEventListener('click', () => { 
    document.getElementById("debug").style.display = "block";
    initDebug();
});

// this one is standalone, works fine
document.getElementById("d-edit-diff-button").addEventListener('click', () => { 
    let inputValue = document.getElementById("d-diff-input").value;
    document.getElementById("d-edit-diff-data").innerHTML = "Difficulty: " + inputValue;
    selectDifficulty(inputValue, true);
    getDifficulty();
});

document.getElementById("d-edit-diff-reload-button").addEventListener('click', () => { 
    window.location.reload();
});

document.getElementById("edit-stage-button").addEventListener('click', () => { 

    let inputValue = document.getElementById("stage-input").value;

    chrome.storage.local.set({ "state": parseInt(inputValue) }).then(() => {
        chrome.storage.local.get(["state"]).then(function(response) {
            document.getElementById("set-stage-data").innerHTML = 
                "Stage: " + response.state;
        });
    });

});

document.getElementById("ignore-diff-button").addEventListener('click', () => {  
    savedData.ignoreDifficulty = savedData.ignoreDifficulty == true ? false : true;
    
    chrome.storage.local.set({ "ignoreDifficulty": savedData.ignoreDifficulty }).then(() => {
        chrome.storage.local.get(["ignoreDifficulty"]).then(function(response) {
        document.getElementById("ignore-diff-data").innerHTML = 
            "Ignoring difficulty: " + response.ignoreDifficulty;
        });
    });
});

document.getElementById("ignore-time-button").addEventListener('click', () => {  
    savedData.ignoreTime = savedData.ignoreTime == true ? false : true;
    
    chrome.storage.local.set({ "ignoreTime": savedData.ignoreTime }).then(() => {
        chrome.storage.local.get(["ignoreTime"]).then(function(response) {
        document.getElementById("ignore-time-data").innerHTML = 
            "Ignoring time: " + response.ignoreTime;
        });
    });
});


document.getElementById("set-time-button").addEventListener('click', () => { 
    
    let inputValue = document.getElementById("set-time-input").value;
    inputValue = inputValue == "" ? "00:00" : inputValue;
    
    var d = new Date();
    const unparsedDate = new Date(d.toString().split(":")[0].slice(0,-2) + inputValue);
    const parsedDate = Date.parse(unparsedDate);

    chrome.storage.local.set({ "time": parsedDate }).then(() => {
        document.getElementById("set-time-data").innerHTML = 
            "Time set to " + parsedDate + " (" + humanReadableDate(parsedDate) + ")";
    });
});


document.getElementById("set-time-2-button").addEventListener('click', () => { 
    
    let inputValue = document.getElementById("set-time-2-input").value;
    inputValue = inputValue == "" ? "00:00" : inputValue;
    
    var d = new Date();    
    const unparsedDate = new Date(d.toString().split(":")[0].slice(0,-2) + inputValue);
    const parsedDate = Date.parse(unparsedDate);

    chrome.storage.local.set({ "time2": parsedDate }).then(() => {
        document.getElementById("set-time-2-data").innerHTML = 
            "First page load set to " + parsedDate + " (" + humanReadableDate(parsedDate) + ")";
    });
});

document.getElementById("set-time-3-button").addEventListener('click', () => { 
    
    let inputValue = document.getElementById("set-time-3-input").value;
    inputValue = inputValue == "" ? "00:00" : inputValue;
    
    var d = new Date();
    const unparsedDate = new Date(d.toString().split(":")[0].slice(0,-2) + inputValue);
    const parsedDate = Date.parse(unparsedDate);

    chrome.storage.local.set({ "time3": parsedDate }).then(() => {
        document.getElementById("set-time-3-data").innerHTML = 
            "Time of last popup has been set to " + parsedDate + " (" + humanReadableDate(parsedDate) + ")";
    });
});

