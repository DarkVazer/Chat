// main.js - версия с contextBridge для IPC и системным треем
const { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage, globalShortcut } = require('electron');
const path = require('path');

// Определяем режим разработки
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Глобальные переменные для трея и окон
let mainWindow = null;
let spotlightWindow = null;
let tray = null;

// Флаг для отслеживания выхода из приложения
app.isQuitting = false;

// Функция для создания иконки системного трея
function createTray() {
  // Создаем простую иконку трея программно
  const trayIcon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVFiFtZdPaBNBFMc/bxOTtE1Tm9Y/1VZFa1sVpChWrIh4EDx48ODBgwfBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPHjx48ODBgwcPH');
  trayIcon.setTemplateImage(true);

  tray = new Tray(trayIcon);
  tray.setToolTip('AI Assistant');

  // Контекстное меню для трея
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Открыть Spotlight',
      click: () => {
        createSpotlightWindow();
      }
    },
    { type: 'separator' },
    {
      label: 'Показать приложение',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        }
      }
    },
    {
      label: 'Скрыть приложение',
      click: () => {
        if (mainWindow) {
          mainWindow.hide();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Выход',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  // Обработка клика по иконке трея
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    }
  });
}

// Create the main application window
function createWindow() {
  mainWindow = new BrowserWindow({
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


  // Обработка события закрытия окна (скрытие в трей вместо закрытия)
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
    return true;
  });

  // Обработка события сворачивания окна
  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });
}

// Функция для создания окна спотлайта
function createSpotlightWindow() {
  if (spotlightWindow) {
    spotlightWindow.focus();
    return;
  }

  spotlightWindow = new BrowserWindow({
    width: 600,
    height: 400,
    center: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    transparent: true, // Делаем окно прозрачным
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Загружаем HTML для спотлайта
  spotlightWindow.loadFile(path.join(__dirname, 'renderer/spotlight-simple.html'));

  // Показываем окно когда оно готово
  spotlightWindow.once('ready-to-show', () => {
    spotlightWindow.show();
    spotlightWindow.focus();
  });

  // Обработка закрытия окна
  spotlightWindow.on('closed', () => {
    spotlightWindow = null;
  });

  // Закрытие окна при потере фокуса
  spotlightWindow.on('blur', () => {
    if (spotlightWindow) {
      spotlightWindow.close();
    }
  });
}

// Функция для регистрации горячих клавиш
function registerGlobalShortcuts() {
  // Горячая клавиша для открытия спотлайта (Ctrl+Space)
  const ret = globalShortcut.register('Control+Space', () => {
    createSpotlightWindow();
  });

  if (!ret) {
    console.log('Не удалось зарегистрировать горячую клавишу Control+Space');
  }

  // Дополнительная горячая клавиша (Alt+Space)
  const retAlt = globalShortcut.register('Alt+Space', () => {
    createSpotlightWindow();
  });

  if (!retAlt) {
    console.log('Не удалось зарегистрировать горячую клавишу Alt+Space');
  }
}

// Initialize the application
app.whenReady().then(() => {
  createWindow();
  createTray(); // Создаем трей при запуске приложения
  registerGlobalShortcuts(); // Регистрируем горячие клавиши

  // Recreate window if all are closed and app is activated (macOS)
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}).catch((error) => {
  console.error('Failed to initialize application:', error);
});

// Обработка выхода из приложения
app.on('before-quit', () => {
  app.isQuitting = true;
});

// Не закрываем приложение при закрытии всех окон - сворачиваем в трей
app.on('window-all-closed', () => {
  // Не закрываем приложение на Windows/Linux, оставляем в трее
  if (process.platform !== 'darwin') {
    // На macOS обычно приложения продолжают работать в фоне
  }
});

// Отключаем предупреждения о безопасности в режиме разработки
if (isDev) {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
}
