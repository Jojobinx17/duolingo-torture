console.log("Duo is watching...");

chrome.runtime.onInstalled.addListener(function (object) {
  let URL = chrome.runtime.getURL("../../settings.html#welcome");

  if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({ url: URL }, function (tab) {
      console.log("Welcome page launched!");
    });

    const currentDate = new Date();
    const timeOfInstall = currentDate.getTime();

    chrome.storage.local.set({ state: 1 }).then(() => {
      console.log("State has been set to one.");
    });
    chrome.storage.local.set({ time: timeOfInstall }).then(() => {
      console.log("Time has been set to the current time.");
    });
    chrome.storage.local.set({ extended: true }).then(() => {
      console.log("Streak extended value has been defaulted to true.");
    });
    chrome.storage.local.set({ difficulty: 1 }).then(() => {
      console.log("Difficulty has been set to one.");
    });
    chrome.storage.local.set({ debugVerbosity: 0 }).then(() => {
      console.log("Debug verbosity has been set to 0.");
    });
    chrome.storage.local.set({ ignoreDifficulty: false }).then(() => {
      console.log("Not ignoring difficulty.");
    });
    chrome.storage.local.set({ ignoreTime: false }).then(() => {
      console.log("Not ingoring time.");
    });
    chrome.storage.local.set({ time2: timeOfInstall }).then(() => {
      console.log("Time of first login has been set to the current time.");
    });
    chrome.storage.local.set({ time3: timeOfInstall }).then(() => {
      console.log("Time of last popup has been set to the current time.");
    });
    chrome.storage.local.set({ language: "none" }).then(() => {
      console.log("Currently learning language is set to none (default).");
    });
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  handleRequest(request).then(function (response) {
    sendResponse(response);
  });
  return true;
});

async function handleRequest(request) {
  const currentTab = await chrome.tabs.getCurrent();
  const currentURL = request.url;

  let responseToSend = "none";

  if (request.type === "getDuolingoUserData") {
    let streakExtended = undefined;

    try {
      const duolingoApiResponse = await fetch(
        "https://www.duolingo.com/api/1/users/show?username=" +
          request.username,
      );

      const jsonResponse = await duolingoApiResponse.json();
      streakExtended = jsonResponse.streak_extended_today;
    } catch {
      console.log("Duolingo data fetch failed.");
    }

    console.log(
      "API data requested - Username:",
      request.username,
      "- Response:",
      streakExtended,
    );
    responseToSend = streakExtended;
  }

  if (request.type === "closablePopup") {
    console.log("Closable popup requested.");
    responseToSend = "Success!";

    chrome.tabs.create({
      active: true,
      url: "../../popup.html",
    });
  }

  if (request.type === "unclosablePopup") {
    console.log("Unclosable popup requested.");
    responseToSend = "Success!";

    chrome.tabs.update(currentTab, {
      url: "../../popup.html#unclosable-" + currentURL,
    });
  }
  return responseToSend;
}
