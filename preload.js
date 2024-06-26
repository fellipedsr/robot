const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
  "electronAPIs", {
  close: () => ipcRenderer.send('close-window'),
  minimizer: () => ipcRenderer.send('minimize-window'),
  sendMsg: (data) => ipcRenderer.send('send-msgn', data),
  saveParams: (data) => ipcRenderer.invoke('save-params', data),
  syncConfigs: () => ipcRenderer.invoke('sync-configs').then(result => result),
  syncSales: () => ipcRenderer.invoke('sync-sales').then(result => result),
  openLog: () => ipcRenderer.send('openLog'),
  closeLog: () => ipcRenderer.send('close-window-Log'),
  minimizerLog: () => ipcRenderer.send('minimize-window-Log'),
  getLogs: () => ipcRenderer.invoke('get-logs').then(result => result),
  getEvents: () => ipcRenderer.invoke('get-events').then(result => result),
  clearLogs: (data) => ipcRenderer.invoke('clearLogs', data).then(result => result),
  validatePin: (data) => ipcRenderer.invoke('validate-pin', data).then(result => result),
}
);
