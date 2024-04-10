window.focus();

if (window.location.hash.substring(0, 11) == "#unclosable") {
  document.getElementById("not-practiced").style.display = "none";
  document.getElementById("not-practiced-stage-3").style.display = "block";
}

// link to duolingos website
document.getElementById("duolingo-link").addEventListener("click", () => {
  chrome.tabs.create({
    url: "https://duolingo.com/lesson",
  });
  window.close();
});

document
  .getElementById("duolingo-link-stage-3")
  .addEventListener("click", () => {
    window.location.href = "https://duolingo.com/lesson";
  });

// link to cancel
document.getElementById("cancel-link").addEventListener("click", () => {
  window.location = window.close();
});

document.getElementById("complete-close-link").addEventListener("click", () => {
  if (window.location.hash.substr(0, 1) == "#") {
    window.location = window.location.hash.substr(12);
  } else {
    window.close();
  }
});

document.getElementById("error-close-link").addEventListener("click", () => {
  window.location = window.close();
});

let popupWindowID = undefined;

const popupWindow = chrome.windows.getCurrent().then(function (response) {
  // technically, it's not a 'popup' window anymore, but this function still works :P

  console.log("Popup window id: " + response.id);
  popupWindowID = response.id;

  chrome.windows.update(popupWindowID, {
    focused: true,
  });

  window.moveTo(
    parseInt(window.screen.width / 2 - 250),
    parseInt(window.screen.height / 2 - 250),
  );
});

async function getDuolingoData() {
  const myUsername = await chrome.storage.local.get(["username"]);
  console.log("Saved username: " + myUsername.username);

  const response = await fetch(
    "https://www.duolingo.com/api/1/users/show?username=" + myUsername.username,
  );
  let jsonResponse = await response.json();

  console.log("Streak extended today: " + jsonResponse.streak_extended_today);

  if (jsonResponse.streak_extended_today == true) {
    document.getElementById("data-result").innerHTML =
      "Complete. Streak extended!";

    document.getElementById("practiced").style.display = "block";
    document.getElementById("not-practiced").style.display = "none";
    document.getElementById("not-practiced-stage-3").style.display = "none";

    await chrome.storage.local.set({ extended: true });
  } else {
    document.getElementById("data-result").innerHTML =
      "Complete. Streak not extended.";

    // make sure window is always in the foreground
    var setWindowToForeground = setInterval(function () {
      try {
        chrome.windows.update(popupWindowID, { focused: true });
      } catch (error) {
        console.log(error);
      }
    }, 200);
  }

  // setTimeout(function () {
  //   document.getElementById("data-result").innerHTML = "";
  // }, 3000);

}

getDuolingoData();
