// main.js - версия с contextBridge для IPC
const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');

// Определяем режим разработки
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Create the main application window
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    center: true,
    frame: false, // Отключаем стандартную панель управления окном
    webPreferences: {
      nodeIntegration: false, // Отключаем nodeIntegration для безопасности
      contextIsolation: true, // Включаем изоляцию контекста
      webSecurity: false, // Позволяет делать CORS запросы к API
      preload: path.join(__dirname, 'preload.js') // Подключаем preload скрипт
    }
  });

  // Load the renderer process
  mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));

  // Handle window errors
  mainWindow.on('error', (error) => {
    console.error('Window error:', error);
  });

  // IPC handlers for window controls
  ipcMain.on('window-minimize', () => {
    console.log('IPC: window-minimize received'); // Для отладки
    mainWindow.minimize();
  });

  ipcMain.on('window-maximize', () => {
    console.log('IPC: window-maximize received'); // Для отладки
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.on('window-close', () => {
    console.log('IPC: window-close received'); // Для отладки
    mainWindow.close();
  });

  // Дополнительные IPC handlers для разработки
  if (isDev) {
    ipcMain.on('dev-toggle-devtools', () => {
      mainWindow.webContents.toggleDevTools();
    });
    
    ipcMain.on('dev-reload', () => {
      mainWindow.webContents.reload();
    });
  }
}

// Initialize the application
app.whenReady().then(() => {
  createWindow();

  // Recreate window if all are closed and app is activated (macOS)
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}).catch((error) => {
  console.error('Failed to initialize application:', error);
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Отключаем предупреждения о безопасности в режиме разработки
if (isDev) {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
}