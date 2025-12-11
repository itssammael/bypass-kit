// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    runWindowsApp: (appPath) => ipcRenderer.send('run-windows-app', appPath),
    closeWindowsApp: () => ipcRenderer.send('close-windows-app'),   
    triggerRemoteUpdate: (script) => ipcRenderer.send('trigger-remote-script', script),
    triggerReload: () => ipcRenderer.send('trigger-reload-script'),
    notifyFocus: () => ipcRenderer.send('window-focused'),
    onAppRunResult: (callback) => ipcRenderer.on('app-run-result', (event, message) => callback(message)),
});