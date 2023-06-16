import {app, BrowserWindow, ipcMain, shell} from 'electron'
import {release} from 'node:os'
import {join} from 'node:path'
import {loadWindowConfig, updateWindowConfig, WindowData} from "../../src/assets/js/ConfigLoader";
import Rectangle = Electron.Rectangle;
import IpcMainInvokeEvent = Electron.IpcMainInvokeEvent;

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload: string = join(__dirname, '../preload/index.js')
const url: string = process.env.VITE_DEV_SERVER_URL
const indexHtml: string = join(process.env.DIST, 'index.html')

async function createWindow(): Promise<void> {
  let windowData: WindowData | null = loadWindowConfig();
  if (windowData == null) {
    app.quit();
    process.exit(1);
    return;
  }

  win = new BrowserWindow({
    title: 'DesktopOTP',
    icon: join(process.env.PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true, //TODO: Disable this
      contextIsolation: false,
    },
    width: windowData.width,
    height: windowData.height,
    x: windowData.x,
    y: windowData.y,
    show: false
  });

  win.setContentProtection(false); //TODO: Enable to prevent screenshots
  win.maximize();
  win.show();

  win.on('close', () => {
    let bounds: Rectangle = win.getBounds()
    let data: WindowData = WindowData.fromArrays(bounds, win.isMaximized());
    updateWindowConfig(data);
  });

  if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
    await win.loadURL(url)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    await win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  // win.webContents.on('will-navigate', (event, url) => { }) #344
}

app.whenReady().then(createWindow)

app.on('window-all-closed', (): void => {
  win = null;
  if (process.platform !== 'darwin') app.quit();
})

app.on('second-instance', (): void => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', (): void => {
  const allWindows: BrowserWindow[] = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow().then((): void => {});
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_:IpcMainInvokeEvent, arg): void => {
  const childWindow: BrowserWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`).then((): void => {});
  } else {
    childWindow.loadFile(indexHtml, {hash: arg}).then((): void => {});
   }
});

ipcMain.on('exit-app', (): void => {
  if (win !== null) win.close();
  app.quit();
  process.exit(0);
});
