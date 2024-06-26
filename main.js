const { app, BrowserWindow, Tray, nativeImage, Menu, ipcMain, autoUpdater } = require('electron')
const path = require('path')
const { jobIntegracao } = require('./services/schedule')
const sendDialog = require('./services/sendMsg')
const { initSocketServer } = require('./server/socketServer')
const { getStart, insertStart } = require('./services/initializationdb')
const { setConfigs, importSales, getLogs, clear, teste, validatePin, validatapin } = require('./services/tarefas')
const { startSocketClient } = require('./services/receiveactio')
const { UpdateSourceType,updateElectronApp } = require('update-electron-app')

updateElectronApp({
  updateSource: {
    type: UpdateSourceType.StaticStorage,
    baseUrl: `https://wirt-io--trackr-digital.s3.us-west-002.backblazeb2.com/taco`
  }
})

// autoUpdater.autoDownload = true
// autoUpdater.autoInstallOnAppQuit = true

// autoUpdater.on('update-downloaded', () => {
//   autoUpdater.quitAndInstall(false, true)
// })


if (require('electron-squirrel-startup')) return;
process.env.NODE_ENV = 'prod'
const isDev = process.env.NODE_ENV == 'developement'

let tray
let win
let winInit
let WinLog
let allowClose = true

app.whenReady().then(() => {
  mainWin()
  // autoUpdater.checkForUpdates()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWin()
    }
  })
})

app.on('window-all-closed', () => {
  if (app.isQuitting) {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  }
})

function mainWin() {
  initialization()
}


async function initialization() {
  try {

    const started = await getStart()

    if (!started) {
      createWindowInitial()
    } else {
      initSocketServer();
      await jobIntegracao.create();
      createWindow();
      tryHide();
      await startSocketClient()
    }

  } catch (error) {
    console.log(error)
    sendDialog('Error', 'Falha ao iniciar aplicação', 'error');
    process.exit(1);
  }

}
//////////////////////////////////////////////////////////////////////////////////////////////
function createWindowInitial() {
  const icon = nativeImage.createFromPath('./public/salestrackr.png')
  winInit = new BrowserWindow({
    width: 400,
    height: 380,
    //frame: false,
    webPreferences: {
      contextIsolation: true,
      preload: path.resolve(__dirname, 'preload.js')
    },
    icon
  })
  winInit.removeMenu()
  winInit.webContents.on('did-finish-load', () => {

    winInit.show();
  });

  winInit.on('close', (e) => {
    if(allowClose){
      if (!app.isQuitting) {
        app.quit();
      }
    }
  });

  winInit.loadURL(isDev ? 'http://localhost:5173' : `file://${path.join(__dirname, './distInit/index.html')}`)
  
}


function createWindowLog() {
  const icon = nativeImage.createFromPath('./public/salestrackr.png')
  WinLog = new BrowserWindow({
    width: 900,
    height: 750,
    //frame: false,
    webPreferences: {
      contextIsolation: true,
      preload: path.resolve(__dirname, 'preload.js')
    },
    icon
  })
  WinLog.removeMenu()
  WinLog.webContents.on('did-finish-load', () => {

    WinLog.show();
  });

  WinLog.loadURL(isDev ? 'http://localhost:5175' : `file://${path.join(__dirname, './distLog/index.html')}`)
}

///////////////////////////////////////////////////////////////////////////////////////////////
function createWindow() {
  const icon = nativeImage.createFromPath('./public/salestrackr.png')
  win = new BrowserWindow({
    width: 400,
    height: 550,
    //frame: false,
    webPreferences: {
      contextIsolation: true,
      preload: path.resolve(__dirname, 'preload.js'),
    },
    icon

  })
  win.hide()

  win.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      win.hide();
    }
  });

  win.removeMenu()
  win.webContents.on('did-finish-load', () => {
    allowClose = false
    if (winInit) {
      winInit.close();
      winInit = false
    }
  });

  win.loadURL(isDev ? 'http://localhost:5174' : `file://${path.join(__dirname, './dist/index.html')}`)

}
////////////////////////////////////////////////////////////////////////////////////////////////////////
function tryHide() {
  const icon = nativeImage.createFromPath(path.join(__dirname, "public", "salestrackr.ico"))
  tray = new Tray(icon)


  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Mostrar Aplicativo', click: function () {
        win.show();
      }
    },
    {
      label: 'Logs', click: function () {
        createWindowLog();
      }
    },
    {
      label: 'Sair', click: function () {
        app.isQuitting = true;
        process.exit(1);
      }
    }
  ])
  tray.setToolTip('SALESTRACKR')
  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    win.show();
  });
}
///////////////////////////////////////////////////////////////////////////////////////////////////


ipcMain.on('close-window', () => {
  if (win) win.close()
  if (winInit) winInit.close()
})

ipcMain.on('minimize-window', () => {
  if (win) win.minimize()
  if (winInit) winInit.minimize()
})


ipcMain.on('send-msgn', (event, data) => sendDialog(data.title, data.msgn, data.type))


ipcMain.handle('sync-configs', async (event, data) => {
  try {
    const res = await setConfigs()
    if (!res) return false
    return true
  } catch (error) {
    console.log(error)
    return false
  }
})

ipcMain.handle('sync-sales', async (event, data) => {
  const importSalesData = await importSales()
  return importSalesData
})


ipcMain.handle('save-params', async (event, data) => {
  const { TOKEN, PIN } = data

  if (!TOKEN || !PIN) {
    sendDialog('Error', 'informaçoes inválido', 'error');
    return false
  }

  const insert = await insertStart(TOKEN, PIN)

  if (!insert) {
    sendDialog('Error', 'Falha ao inserir informações', 'error');
    return
  }

  sendDialog('Configurações', 'Configurações importadas', 'info');
  initialization()
})

//////////////////////////////////////// LOGS //////////////////////////////////////////////////

ipcMain.on('close-window-Log', () => WinLog.close())
ipcMain.on('minimize-window-Log', () => WinLog.minimize())
ipcMain.on('openLog', (event, data) => createWindowLog())

ipcMain.handle('get-logs', async (event, data) => {
  const importLogs = await getLogs()
  return importLogs
})

ipcMain.handle('get-events', async (event, data) => {
  const importLogs = await getLogs('events')
  return importLogs
})

ipcMain.handle('clearLogs', async (event, data) => {
  const clearLog = await clear(data)
  return clearLog
})

ipcMain.handle('validate-pin', async (event, data) => {
  const validate = await validatapin(data)
  if (!validate) sendDialog('Error', 'pin inválido', 'error')
  return validate
})

////////////////////////////////////////////////////////////////////////////////////////////////
