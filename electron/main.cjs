const path = require("node:path");
const fs = require("node:fs/promises");
const { app, BrowserWindow, protocol, shell } = require("electron");

const rootDir = path.join(__dirname, "..");
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
};

protocol.registerSchemesAsPrivileged([
  {
    scheme: "bazaops",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
]);

function createWindow() {
  const win = new BrowserWindow({
    title: "BAZA Ops CRM",
    width: 1360,
    height: 900,
    minWidth: 1180,
    minHeight: 760,
    autoHideMenuBar: true,
    backgroundColor: "#f6f4ef",
    icon: path.join(rootDir, "assets", "baza-app-icon.png"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith("bazaops://")) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  win.loadURL("bazaops://app/index.html");
}

app.whenReady().then(() => {
  protocol.handle("bazaops", async (request) => {
    const url = new URL(request.url);
    const filePath = path.normalize(path.join(rootDir, decodeURIComponent(url.pathname || "/index.html")));
    if (!filePath.startsWith(rootDir)) return new Response("Forbidden", { status: 403 });
    try {
      return new Response(await fs.readFile(filePath), {
        headers: { "content-type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream" },
      });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
