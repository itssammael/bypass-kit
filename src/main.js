import { app, BrowserWindow, ipcMain } from 'electron';
import { execFile, exec } from 'child_process';
import path from 'node:path';
import started from 'electron-squirrel-startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}
let launchedProcess = null;
let mainWindow;
let ltmsWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 321,
    height: 820, // Set the height to the full screen height
    x: 0, // Position at the leftmost side of the screen
    y: 0, // Position at the top of the screen
    frame: false, // Set to false if you want a frameless window and want to implement a custom title bar
    resizable: false, // Allow resizing if needed
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
  ltmsWindow = new BrowserWindow({
    width: 1200,
    height: 820,
    frame: false, // Set to false if you want a frameless window and want to implement a custom title bar
    resizable: false, // Allow resizing if needed
   x: 321, // Position at the leftmost side of the screen
    y: 0, // Position at the top of the screen
  });
  ltmsWindow.loadURL('https://dlro.com.ph/admin/#/login');
  
  devtoolsWindow = new BrowserWindow({
    width: 1000, // Match main window width initially
    height: 320, // Desired height for the "bottom" placement,
     frame: false, // Set to false if you want a frameless window and want to implement a custom title bar
    // resizable: false, // Allow resizing if needed
    show: false // Hide until positioned
  });
  ltmsWindow.webContents.setDevToolsWebContents(devtoolsWindow.webContents);
  ltmsWindow.webContents.once('did-finish-load', () => {
    const mainWindowBounds = mainWindow.getBounds();
    
    // Calculate the position:
    // x: Same as the main window's x
    // y: Main window's y + Main window's height
    const newX = mainWindowBounds.x;
    const newY = mainWindowBounds.y + mainWindowBounds.height;

    devtoolsWindow.setPosition(newX, newY);
    devtoolsWindow.setSize(mainWindowBounds.width, 400); // Set width to match main, fixed height
    devtoolsWindow.show(); // Show the window now that it's positioned
    
    // Open the devtools in detached mode (it will open in the window we created)
    ltmsWindow.webContents.openDevTools({ mode: 'detach',panel: 'console', });
  }); 

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// Handle the request from the Renderer Process
ipcMain.on('run-windows-app', (event, appPath) => {
    const executablePath = 'C:\\Windows\\System32\\calc.exe'; 

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
        // If the app closes on its own (not killed), clear the reference
        // console.log('App exited normally.');
        // launchedProcess = null;
    });

    console.log(`Windows Calculator launched with PID: ${launchedProcess.pid}`);
    event.reply('app-run-result', `Calculator launched successfully! PID: ${launchedProcess.pid}`);
});

ipcMain.on('close-windows-app', (event) => {
  
    // if (launchedProcess) {
        // const pid = launchedProcess.pid;
        const imageToKill = 'CalculatorApp.exe';
       
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

    // } else {
    //     event.reply('app-run-result', 'No application is currently running.'+`${JSON.stringify(launchedProcess)}`);
    // }
});

// ipcMain.on('change-button-attribute', (event, newAttributeValue) => {
//   if (targetWindow) {
//     // Send a message to the target window's renderer process
//     // and tell it what to do.
//     targetWindow.webContents.send('update-remote-button', newAttributeValue);
//   }
// });
ipcMain.on('trigger-remote-script', async (event, customScript) => {
    if (ltmsWindow && !ltmsWindow.isDestroyed()) {
        try {
            // This injects and executes JS directly into the remote page's renderer process
            // The script finds the button and changes its textContent attribute
            const script = `${customScript}`;
            // const script = `$('div.alert').removeClass('alert-danger');$('div.alert').addClass('alert-success');`;
            // Execute the script and optionally wait for a result (if you return one from the IIFE)
            const result = await ltmsWindow.webContents.executeJavaScript(script);
            console.log("Script Execution Result:", result);
            event.reply('app-run-result', `Script Execution Result: ${result}`);

        } catch (error) {
            console.error("Failed to execute script on remote window:", error);
        }
    }
});