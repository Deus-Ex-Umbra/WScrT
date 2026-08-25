import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  windowMinimize: () => ipcRenderer.send('window-minimize'),
  windowMaximize: () => ipcRenderer.send('window-maximize'),
  windowClose: () => ipcRenderer.send('window-close'),
  onLoadingStatus: (callback: (message: string) => void) => {
    ipcRenderer.on('loading-status', (_event, message) => callback(message));
  }
});
