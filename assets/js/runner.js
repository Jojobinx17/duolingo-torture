// This code will get injected into every webpage that is visited by the user

const currentDate = new Date();
const timeOfLoad = currentDate.getTime();
let stageProcessed = false;

async function duolingoMain(data = {}, stageToProcess = 0) {
  if (debugVerbosity == 1)
    console.log("Running main script (stage " + stageToProcess + ")...");

  if (data.extended != true && data.extended != false) data.extended = false;

  if (data.extended == false) {
    // ============================= STAGE 0 =============================

    if (stageToProcess == 0) {
      stageProcessed = true;
      if (debugVerbosity == 1) console.log("Stage zero, ignoring...");
    }

    // ============================= STAGE 1 =============================

    if (stageToProcess == 1) {
      stageProcessed = true;
      if (debugVerbosity == 1)
        console.log("Stage one, creating small popups...");

      createInPagePopup(0);
      createInPagePopup(1);
    }

    // ============================= STAGE 2 =============================

    if (stageToProcess == 2) {
      stageProcessed = true;
      if (debugVerbosity == 1)
        console.log("Stage two, opening popup window...");

      const response = await chrome.runtime.sendMessage({
        type: "closablePopup",
        url: window.location.href,
      });
      if (debugVerbosity == 1) console.log(response);
    }

    // ============================= STAGE 3 =============================

    if (stageToProcess == 3) {
      stageProcessed = true;
      if (debugVerbosity == 1)
        console.log("Stage three, opening forced popup window...");

      var openUnclosablePopup = setInterval(function () {}, 200);
    }
  } else {
    if (debugVerbosity == 1) console.log("User has completed a lesson today.");
  }

  // ============================= GETTING DUOLINGO DATA =============================

  if (debugVerbosity == 1)
    console.log("Fetching user data from Duolingo API...");

  const apiResponse = await chrome.runtime.sendMessage({
    type: "getDuolingoUserData",
    username: data.username,
  });

  if (debugVerbosity == 1)
    console.log(
      "Duolingo API retuned " +
        apiResponse +
        ", saved value was " +
        data.extended +
        ".",
    );

  if (apiResponse != data.extended) {
    if (debugVerbosity == 1)
      console.log("Saved completion data was incorrect, updating...");

    // stage 0
    if (data.state == 0 && apiResponse == false) {
      if (debugVerbosity == 1) console.log("Stage is zero.");
    }

    // stage 1
    if (data.state == 1 && apiResponse == true) {
      document.getElementById("duo-sees-you-0").remove();
      document.getElementById("duo-sees-you-1").remove();
      if (debugVerbosity == 1) console.log("In-page popups removed.");
    }

    if (data.state == 1 && apiResponse == false) {
      createInPagePopup(0);
      createInPagePopup(1);
      if (debugVerbosity == 1) console.log("In-page popups created.");
    }

    if (data.state == 2 && apiResponse == false) {
      if (debugVerbosity == 1) console.log("Closable popup created.");
    }

    if (data.state == 3 && apiResponse == false) {
      if (debugVerbosity == 1)
        console.log("Attempting to open unclosable popup...");
      var openUnclosablePopup = setInterval(function () {}, 200);
    }

    // update the local storage to reflect the proper value
    await chrome.storage.local.set({ extended: apiResponse });
    if (debugVerbosity == 1) console.log("Saved completion data updated.");
  } else {
    if (debugVerbosity == 1) console.log("Saved completion data was correct.");
  }

  if (debugVerbosity == 1) console.log("Main script finished.");
  return true;
}

// ============================= FUNCTIONS =============================

function createInPagePopup(type) {
  // intialize some variables and the font to use

  var container = document.createElement("div");
  var xx =
    50 +
    (window.innerWidth / 2) * type +
    Math.floor(Math.random() * (window.innerWidth / 2 - 300));
  var yy = 50 + Math.floor(Math.random() * (window.innerHeight - 150));
  var newStyle = document.createElement("style");

  newStyle.appendChild(
    document.createTextNode(
      "\
                                                 @font-face {\
                                                 font-family: 'din-round-bold';\
                                                 src: url('" +
        chrome.runtime.getURL(`assets/fonts/DINRoundPro-Bold.woff`) +
        "') format('woff')\
                                                 }\
                                                 ",
    ),
  );

  document.head.appendChild(newStyle);

  var container = document.createElement("div");

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

  if (type == 0) container.innerHTML = "Time to practice?";
  if (type == 1)
    container.innerHTML =
      '<img src="' +
      chrome.runtime.getURL(`assets/images/duo-wave.svg`) +
      '" height="40px" /> <a href="https://duolingo.com/lesson" ' +
      'style="text-decoration: none; color: #49c0f8;">START LESSON</a>';

  document.body.appendChild(container);
  return true;
}

// ============================= LOGIC =============================

async function duolingoInit(data) {
  console.log("Waking up Duo...");

  let debugVerbosity = data.debugVerbosity;

  let diffProcessed = false;

  let d = new Date(data.time);
  if (data.ignoreTime == false) d = new Date();

  // set secondary timer if first time today
  const storedTime2 = new Date(data.time2);

  if (storedTime2.getDate() != d.getDate()) {
    chrome.storage.local.set({ time2: d.getTime() }).then(function () {
      if (debugVerbosity == 1) {
        console.log(
          "Timer 2 has been set to " +
            d.getTime() +
            " (Date number " +
            d.getDate() +
            ").",
        );
      }
    });
  }

  // get data from secondary timer
  const hoursSinceFirstLoginToday = Math.floor(
    (d.getTime() - data.time2) / 1000 / 60 / 60,
  );

  // get data from third timer
  const minutesSinceLastPopup = Math.floor(
    (d.getTime() - data.time3) / 1000 / 60,
  );

  // get difficulty
  const currentDifficulty = data.difficulty;

  // debug stuff
  if (debugVerbosity == 1) {
    console.log("");
    console.log("Current difficulty:", currentDifficulty);
    console.log("Current username:", data.username);
    console.log("Currently learning:", data.language);
    console.log("Hours since first login:", hoursSinceFirstLoginToday);
    console.log("Current hour:", d.getHours());
    console.log("Minutes since last popup:", minutesSinceLastPopup);
    console.log("Ignoring difficulty:", data.ignoreDifficulty);
    console.log("");
  }

  if (data.username.trim() != "") {
    // easy difficulty
    if (data.difficulty == 0) {
      // EASY DIFFICULTY REQUIREMENTS
      // Stage 1 past 1pm or 2 hours since first login
      // 10 mins since the last popup

      diffProcessed = true;

      if (data.ignoreDifficulty == false && minutesSinceLastPopup > 10) {
        if (hoursSinceFirstLoginToday >= 3) {
          if (debugVerbosity == 1)
            console.log(
              "Difficulty zero (easy) has passed its checks - more than three hours since first login.",
            );
          resetTimers(data.ignoreTime);
          await duolingoMain(data, 1);
        } else if (d.getHours() >= 13) {
          if (debugVerbosity == 1)
            console.log(
              "Difficulty zero (easy) has passed its checks - past 1:00pm.",
            );
          resetTimers(data.ignoreTime);
          await duolingoMain(data, 1);
        } else {
          if (debugVerbosity == 1)
            console.log(
              "Difficulty zero (easy) has failed its checks - Requirements to create popup not met.",
            );
        }
      } else {
        if (minutesSinceLastPopup <= 10) {
          if (debugVerbosity == 1)
            console.log(
              "Difficulty zero (easy) has failed its checks - Minutes passed is less than 10.",
            );
        } else {
          if (debugVerbosity == 1)
            console.log(
              "Difficulty zero (easy) has failed its checks - Ignoring difficulty.",
            );
        }
      }
    }

    if (data.difficulty == 1) {
      // MEDIUM DIFFICULTY REQUIREMENTS
      // Stage 1 all day, stage 2 after 1:00pm
      // Stage 2 forced after 3 hours sice first login
      // both stages need 10 minutes since last popup to activate

      diffProcessed = true;

      if (data.ignoreDifficulty == false && minutesSinceLastPopup > 10) {
        if (hoursSinceFirstLoginToday >= 3) {
          if (debugVerbosity == 1)
            console.log(
              "Difficulty one (normal) has passed its checks - more than 3 hours since first login.",
            );
          resetTimers(data.ignoreTime);
          await duolingoMain(data, 2);
        } else if (d.getHours() >= 13) {
          if (debugVerbosity == 1)
            console.log(
              "Difficulty one (normal) has passed its checks - past 1:00pm.",
            );
          resetTimers(data.ignoreTime);
          await duolingoMain(data, 2);
        } else {
          if (debugVerbosity == 1)
            console.log(
              "Difficulty one (normal) has passed its checks - default.",
            );
          resetTimers(data.ignoreTime);
          await duolingoMain(data, 1);
        }
      } else {
        if (minutesSinceLastPopup <= 10) {
          if (debugVerbosity == 1)
            console.log(
              "Difficulty one (normal) has failed its checks - Minutes passed is less than 10.",
            );
        } else {
          if (debugVerbosity == 1)
            console.log(
              "Difficulty one (normal) has failed its checks - Ignoring difficulty.",
            );
        }
      }
    }

    if (data.difficulty == 2) {
      // HARD DIFFICULTY REQUIREMENTS
      // Stage 1 by default, stage 2 after 11:00am, stage 3 after 2:00pm
      // Force stage 2 after 1 hour of using the computer
      // Force stage 3 after 3 hours of using the computer
      // Popups appear every 5 minutes

      diffProcessed = true;

      if (data.ignoreDifficulty == false && minutesSinceLastPopup > 5) {
        if (hoursSinceFirstLoginToday >= 3) {
          if (debugVerbosity == 1)
            console.log(
              "Difficulty two (hard) has passed its checks - more than 3 hours since first login.",
            );
          resetTimers(data.ignoreTime);
          await duolingoMain(data, 3);
        } else if (hoursSinceFirstLoginToday >= 1) {
          if (debugVerbosity == 1)
            console.log(
              "Difficulty two (hard) has passed its checks - more than 1 hour since first login.",
            );
          resetTimers(data.ignoreTime);
          await duolingoMain(data, 2);
        } else if (d.getHours() >= 14) {
          if (debugVerbosity == 1)
            console.log(
              "Difficulty two (hard) has passed its checks - past 2:00pm.",
            );
          resetTimers(data.ignoreTime);
          await duolingoMain(data, 3);
        } else if (d.getHours() >= 11) {
          if (debugVerbosity == 1)
            console.log(
              "Difficulty two (hard) has passed its checks - past 11:00am.",
            );
          resetTimers(data.ignoreTime);
          await duolingoMain(data, 2);
        } else {
          if (debugVerbosity == 1)
            console.log(
              "Difficulty two (hard) has passed its checks - default.",
            );
          resetTimers(data.ignoreTime);
          await duolingoMain(data, 1);
        }
      } else {
        if (minutesSinceLastPopup <= 5) {
          if (debugVerbosity == 1)
            console.log(
              "Difficulty two (hard) has failed its checks - Minutes passed is less than 5.",
            );
        } else {
          if (debugVerbosity == 1)
            console.log(
              "Difficulty two (hard) has failed its checks - Ignoring difficulty.",
            );
        }
      }
    }

    if (data.difficulty == 3) {
      // TORTURE DIFFICULTY REQUIREMENTS
      // None, just run whenever it can

      diffProcessed == true;
      if (debugVerbosity == 1)
        console.log("Difficulty three (torture) is running...");

      // we don't need to reset anything here
      await duolingoMain(data, 3);
    }

    // do stuff if ignoring difficulty
    if (data.ignoreDifficulty == true) {
      if (debugVerbosity == 1)
        console.log(
          "Ignoring difficulty. Using stage value (" +
            data.state +
            ") instead.",
        );
      await duolingoMain(data, data.state);
    }

    // set values is they are undefined somehow
    if (diffProcessed == false) {
      chrome.storage.local.set({ difficulty: 1 });
      if (debugVerbosity == 1)
        console.log(
          "Difficulty had a bad value, and has been defaulted to normal.",
        );
    }
  } else {
    console.error("Doulingo Torture Error: Invalid username.");
  }

  console.log("All processes complete!");
  console.log("");
  console.log("Duo is sleeping.");

  return true;
}

async function resetTimers(ignoreTime) {
  const d = new Date();

  if (ignoreTime == false) {
    if (debugVerbosity == 1) console.log("Updating timers...");
    await chrome.storage.local.set({ time3: d.getTime() });
    if (debugVerbosity == 1) console.log("Done.");
  } else {
    if (debugVerbosity == 1) console.log("Ignoring timers.");
  }
}

// main runner!!
chrome.storage.local.get(null).then(function (result) {
  duolingoInit(result);
});
