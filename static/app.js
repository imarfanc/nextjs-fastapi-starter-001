let lastUsedFolder = localStorage.getItem("lastUsedFolder") || "";
let pythonPath = localStorage.getItem("pythonPath") || "";
let cachedBackgroundUrl = localStorage.getItem("cachedBackgroundUrl") || "";

function showStatus(message, isError = false) {
  const statusBar = document.getElementById("status-bar");
  statusBar.textContent = message;
  statusBar.style.backgroundColor = isError
    ? "rgba(231, 76, 60, 0.7)"
    : "rgba(46, 204, 113, 0.7)";
}

async function processFolder() {
  const folderPath = document.getElementById("folder-path").value;
  try {
    const response = await fetch("/process_folder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder_path: folderPath }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    displayFolderStructure(data.structure);
    updateLastUsedApp();
    lastUsedFolder = folderPath;
    localStorage.setItem("lastUsedFolder", lastUsedFolder);
    showStatus("Folder processed successfully");
  } catch (error) {
    console.error("Error:", error);
    showStatus(
      "Error processing folder. Please check the path and try again.",
      true,
    );
  }
}

function displayFolderStructure(structure) {
  const container = document.getElementById("folder-structure");
  container.innerHTML = "";
  for (const [category, apps] of Object.entries(structure)) {
    const categoryElement = document.createElement("div");
    categoryElement.className = "category";
    const categoryHeader = document.createElement("div");
    categoryHeader.className = "category-header";
    categoryHeader.innerHTML = `<h2>${category}</h2><span class="toggle-icon">▼</span>`;
    const appList = document.createElement("ul");
    appList.className = "category-content";

    // Check if category was collapsed previously
    const isCollapsed =
      localStorage.getItem(`category_${category}_collapsed`) === "true";
    if (!isCollapsed) {
      appList.classList.add("expanded");
      categoryHeader.querySelector(".toggle-icon").style.transform =
        "rotate(180deg)";
    }

    categoryHeader.onclick = () =>
      toggleCategory(
        category,
        appList,
        categoryHeader.querySelector(".toggle-icon"),
      );

    for (const app of apps) {
      const appItem = document.createElement("li");
      appItem.textContent = app.name;
      appItem.onclick = (e) => {
        e.stopPropagation();
        runApp(app);
      };
      appList.appendChild(appItem);
    }
    categoryElement.appendChild(categoryHeader);
    categoryElement.appendChild(appList);
    container.appendChild(categoryElement);
  }
}

function toggleCategory(category, appList, toggleIcon) {
  const isCollapsed = !appList.classList.contains("expanded");
  appList.classList.toggle("expanded");
  toggleIcon.style.transform = isCollapsed ? "rotate(180deg)" : "rotate(0deg)";
  localStorage.setItem(`category_${category}_collapsed`, !isCollapsed);
}

async function runApp(app) {
  try {
    const isStreamlit = app.name.toLowerCase().includes("streamlit");
    const response = await fetch("/run_app", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...app, is_streamlit: isStreamlit }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || `HTTP error! status: ${response.status}`);
    }
    if (isStreamlit && data.streamlit_url) {
      const windowRef = window.open(data.streamlit_url, "streamlit_app");
      if (!windowRef) {
        throw new Error(
          "Failed to open Streamlit URL. Please check your pop-up blocker settings.",
        );
      }
    }
    showStatus(`App '${app.name}' started successfully`);
    updateLastUsedApp();
  } catch (error) {
    console.error("Error:", error);
    showStatus(`Error running the app: ${error.message}`, true);
  }
}

function showStatus(message, isError = false) {
  const statusBar = document.getElementById("status-bar");
  statusBar.textContent = message;
  statusBar.style.backgroundColor = isError
    ? "rgba(231, 76, 60, 0.7)"
    : "rgba(46, 204, 113, 0.7)";

  if (isError) {
    console.error(message); // Log the full error message to the console
  }
}

async function updateLastUsedApp() {
  try {
    const response = await fetch("/last_used_app");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    document.getElementById("last-used-app").textContent =
      `Last used app: ${data.last_used_app}`;
  } catch (error) {
    console.error("Error:", error);
  }
}

function useLastFolder() {
  if (lastUsedFolder) {
    document.getElementById("folder-path").value = lastUsedFolder;
    processFolder();
  } else {
    showStatus(
      "No previous folder used. Please enter a folder path first.",
      true,
    );
  }
}

async function setPythonInterpreter() {
  const newPythonPath = document.getElementById("python-path").value;
  try {
    const response = await fetch("/set_python_interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: newPythonPath }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    pythonPath = newPythonPath;
    localStorage.setItem("pythonPath", pythonPath);
    showStatus("Python interpreter path updated successfully");
  } catch (error) {
    console.error("Error:", error);
    showStatus(
      "Error setting Python interpreter path. Please check the path and try again.",
      true,
    );
  }
}

function loadSavedSettings() {
  if (lastUsedFolder) {
    document.getElementById("folder-path").value = lastUsedFolder;
    processFolder();
  }
  if (pythonPath) {
    document.getElementById("python-path").value = pythonPath;
    setPythonInterpreter();
  }
}

function changeBackground() {
  const newImageUrl = `https://picsum.photos/300/1100?blur&random=${new Date().getTime()}`;
  const img = new Image();
  img.onload = function () {
    document.body.style.backgroundImage = `url('${newImageUrl}')`;
    localStorage.setItem("cachedBackgroundUrl", newImageUrl);
  };
  img.src = newImageUrl;
}

function loadCachedBackground() {
  if (cachedBackgroundUrl) {
    document.body.style.backgroundImage = `url('${cachedBackgroundUrl}')`;
  }
}

updateLastUsedApp();
loadSavedSettings();
loadCachedBackground();

document
  .getElementById("use-last-folder")
  .addEventListener("click", useLastFolder);
