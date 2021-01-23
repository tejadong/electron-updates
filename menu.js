const { app, Menu, shell, ipcMain, BrowserWindow, globalShortcut, dialog } = require('electron');
const fs = require('fs');

function saveFile() {
	console.log('Saving the file');
	const window = BrowserWindow.getFocusedWindow();
	window.webContents.send('editor-event', 'save');
}

function loadFile() {
	const window = BrowserWindow.getFocusedWindow();

	const options = {
		title: 'Pick a markdown file',
		filters: [
		  { name: 'Markdown files', extensions: ['md'] },
		  { name: 'Text files', extensions: ['txt'] }
		]
	};

	dialog.showOpenDialog(window, options)
	.then(result => {
		console.log(result)
		if (!result.canceled) {
			if (result.filePaths && result.filePaths.length > 0) {
				const content = fs.readFileSync(result.filePaths[0]).toString();
				window.webContents.send('load', content);
			}
		}
		
	}).catch(err => {
		console.log(err)
	})
}

const template = [
	{
	  label: 'File',
	  submenu: [
		{
		  label: 'Open',
		  accelerator: 'CommandOrControl+O',
		  click() {
			loadFile();
		  }
		},
		{
		  label: 'Save',
		  accelerator: 'CommandOrControl+S',
		  click() {
			saveFile();
		  }
		}
	  ]
	},
	{
	  role: 'help',
	  submenu: [
		{
		  label: 'About Editor Component',
		  click() {
			  shell.openExternal('https://simplemde.com/');
		  }
		},
		{
          label: 'Format',
          submenu: [
            {
              label: 'Toggle Bold',
              click() {
                const window = BrowserWindow.getFocusedWindow();
                window.webContents.send(
                  'editor-event', 
                  'toggle-bold'
                );
              }
            }
          ]
        }
	  ]
	}
];

if (process.env.DEBUG) {
	template.push({
	  label: 'Debugging',
	  submenu: [
		{
		  label: 'Dev Tools',
		  role: 'toggleDevTools'
		},

		{ type: 'separator' },
		{
		  role: 'reload',
		  accelerator: 'Alt+R'
		}
	  ]
	});
}

//if (process.platform === 'darwin') {
	template.unshift({
	  label: app.getName(),
	  submenu: [
		{ role: 'about' },
		{ type: 'separator' },
		{ role: 'quit' }
	  ]
	})
//}
  
const menu = Menu.buildFromTemplate(template);

module.exports = menu;