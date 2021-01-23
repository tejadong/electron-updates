const { app, BrowserWindow, Menu, ipcMain, globalShortcut, dialog } = require('electron');
const menu = require('./menu');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

let window;

function createWindow() {
    window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });
    window.loadFile('index.html');
    window.on('closed', function () {
        window = null;
    });
    window.once('ready-to-show', () => {
        autoUpdater.checkForUpdatesAndNotify();
    });
}

function setShortcut() {
    globalShortcut.register('CommandOrControl+S', () => {
        saveFile();
    });

    globalShortcut.register('CommandOrControl+O', () => {
        loadFile();
    });
}

app.on('ready', () => {
    createWindow();
    setShortcut();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (window === null) {
        createWindow();
    }
});

ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', () => {
    window.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
    window.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});

ipcMain.on('save', (event, arg) => {
	console.log(`Saving content of the file`);
	console.log(arg);
	
	const window = BrowserWindow.getFocusedWindow();
	const options = {
		title: 'Save markdown file',
		filters: [
		  {
			name: 'MyFile',
			extensions: ['md']
		  }
		]
	};

	dialog.showSaveDialog(window, options)
	.then(result => {
		console.log(result);
		if (!result.canceled) {
			fs.writeFileSync(result.filePath, arg);
		}
	});
});

ipcMain.on('editor-reply', (event, arg) => {
	console.log(`Received reply from web page: ${arg}`);
});

Menu.setApplicationMenu(menu);
