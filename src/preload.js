// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    runWindowsApp: (appPath) => ipcRenderer.send('run-windows-app', appPath),
    closeWindowsApp: () => ipcRenderer.send('close-windows-app'),   
    triggerRemoteUpdate: (script) => ipcRenderer.send('trigger-remote-script', script),
    triggerReload: () => ipcRenderer.send('trigger-reload-script'),
    triggerBypassScript: () => ipcRenderer.send('trigger-bypass-script'),
    triggerOverrideImgScript: (data) => ipcRenderer.send('trigger-override-img-script', data),
    notifyFocus: () => ipcRenderer.send('window-focused'),
    setStartWindowPosition: () => ipcRenderer.send('set-start-window-position'),
    validateMasterKey: (ukey) => ipcRenderer.send('validate-master-key', ukey),
    showUploadInput: (callback) => ipcRenderer.on('show-upload-button', (event, isValidated) => callback(isValidated)),
    onAppRunResult: (callback) => ipcRenderer.on('app-run-result', (event, message) => callback(message)),
});