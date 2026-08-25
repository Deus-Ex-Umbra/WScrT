import { app, BrowserWindow, ipcMain, shell } from 'electron';
import * as path from 'path';

let splashWindow: BrowserWindow | null = null;
let mainWindow: BrowserWindow | null = null;

function createSplashScreen() {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 350,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    icon: path.join(__dirname, '../src/logo.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'src/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const isDev = process.env.NODE_ENV === 'development';
  const splashUrl = isDev 
    ? 'http://localhost:5173/#/splash' 
    : `file://${path.join(__dirname, '../frontend/dist/index.html')}#/splash`;
  
  splashWindow.loadURL(splashUrl);

  splashWindow.webContents.on('did-finish-load', () => {
    const isDebug = process.env.NODE_ENV === 'development';
    const message = isDebug ? 'Iniciando en Modo Debug...' : 'Iniciando...';
    splashWindow?.webContents.send('loading-status', message);
  });
}

function crearVentana() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false, // Quitar la barra superior nativa
    show: false, // Ocultar inicialmente hasta que cargue
    icon: path.join(__dirname, '../src/logo.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'src/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Eventos IPC para la barra de título personalizada
  ipcMain.on('window-minimize', () => mainWindow?.minimize());
  ipcMain.on('window-maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow?.restore();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.on('window-close', () => mainWindow?.close());

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  const isDev = process.env.NODE_ENV === 'development';
  const mainWindowUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../frontend/dist/index.html')}`;

  mainWindow.loadURL(mainWindowUrl);

  mainWindow.once('ready-to-show', () => {
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }
    mainWindow?.show();
  });

  const isDebug = process.env.NODE_ENV === 'development';
  if (isDebug) {
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'F12') {
        mainWindow?.webContents.toggleDevTools();
        event.preventDefault();
      } else if (input.key === 'F5' || (input.control && input.key.toLowerCase() === 'r')) {
        mainWindow?.webContents.reload();
        event.preventDefault();
      }
    });
  }
}

app.whenReady().then(() => {
  createSplashScreen();
  
  // Simular un pequeño tiempo extra si se desea, o simplemente lanzar la ventana principal
  // En debug, wait-on ya aseguró que el frontend esté en el puerto 5173, así que cargará rápido.
  setTimeout(() => {
    crearVentana();
  }, 1000); // Pequeño delay para que se vea el splash screen
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      crearVentana();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
