const { app, BrowserWindow, Menu, ipcMain, globalShortcut, dialog } = require('electron');
const menu = require('./menu');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

let window;

app.on('ready', () => {

	window = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
		  nodeIntegration: true
		}
	});
	window.loadFile('index.html');
	
	autoUpdater.checkForUpdatesAndNotify();
	
	globalShortcut.register('CommandOrControl+S', () => {
	  saveFile();
	});	
	
	globalShortcut.register('CommandOrControl+O', () => {
		loadFile();
	});
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