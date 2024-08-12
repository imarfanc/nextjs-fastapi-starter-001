const settingsButton = document.getElementById("settingsButton");
const settingsPopover = document.getElementById("settingsPopover");

settingsButton.addEventListener("click", toggleSettingsPopover);

document.addEventListener("click", function (event) {
  if (
    !settingsPopover.contains(event.target) &&
    event.target !== settingsButton
  ) {
    settingsPopover.style.display = "none";
  }
});

function toggleSettingsPopover(event) {
  event.stopPropagation();
  if (
    settingsPopover.style.display === "none" ||
    settingsPopover.style.display === ""
  ) {
    settingsPopover.style.display = "block";
  } else {
    settingsPopover.style.display = "none";
  }
}

function changeBackground() {
  const newImageUrl = `https://picsum.photos/300/1100?blur&random=${new Date().getTime()}`;
  document.body.style.backgroundImage = `url('${newImageUrl}')`;
}

const fonts = ["Arial", "Verdana", "Helvetica", "Times New Roman", "Courier"];
let currentFontIndex = 0;

function changeFont() {
  currentFontIndex = (currentFontIndex + 1) % fonts.length;
  document.body.style.fontFamily = fonts[currentFontIndex];
}

function increaseFontSize() {
  document.body.style.fontSize = `${parseFloat(getComputedStyle(document.body).fontSize) + 1}px`;
}

function decreaseFontSize() {
  document.body.style.fontSize = `${Math.max(parseFloat(getComputedStyle(document.body).fontSize) - 1, 8)}px`;
}

// Initialize settings
settingsPopover.style.display = "none";

// Add event listeners for the settings buttons
document
  .querySelector('button[onclick="changeBackground()"]')
  .addEventListener("click", changeBackground);
document
  .querySelector('button[onclick="changeFont()"]')
  .addEventListener("click", changeFont);
document
  .querySelector('button[onclick="increaseFontSize()"]')
  .addEventListener("click", increaseFontSize);
document
  .querySelector('button[onclick="decreaseFontSize()"]')
  .addEventListener("click", decreaseFontSize);
