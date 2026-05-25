console.log("Electron main file starting...");

const { app, BrowserWindow } = require("electron");
const path = require("path");
const { startBackend } = require("./start-backend");

let backendProcess = null;
let mainWindow = null;

const isDev = !app.isPackaged;

function createWindow() {
  console.log("createWindow() called");

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  const devURL = process.env.VITE_DEV_SERVER_URL || "http://localhost:3003";
  console.log("Loading URL:", devURL);

  if (isDev) {
    console.log("⚡ DEV MODE loading:", devURL);
    mainWindow
      .loadURL(devURL)
      .then(() => {
        console.log("Dev URL loaded successfully");
        mainWindow.webContents.openDevTools();
      })
      .catch((err) => console.error("Failed to load dev URL:", err));
  } else {
    console.log("📦 PROD MODE loading build/");
    mainWindow
      .loadFile(path.join(__dirname, "build", "index.html"))
      .then(() => {
        console.log("Production file loaded successfully");
        mainWindow.webContents.openDevTools();
      })
      .catch((err) => console.error("Failed to load production file:", err));
  }

  mainWindow.on("closed", () => {
    console.log("🪟 Main window closed");
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  console.log("🚀 app.whenReady()");

  try {
    backendProcess = startBackend();
    console.log("✅ Backend process started");
  } catch (err) {
    console.error("❌ Failed to start backend process:", err);
  }

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("before-quit", () => {
  console.log("🧹 before-quit");

  if (backendProcess) {
    console.log("🔴 Killing backend process...");
    backendProcess.kill("SIGTERM");
    backendProcess = null;
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    console.log("Quitting app...");
    app.quit();
  }
});