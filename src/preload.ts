import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('api', {
  // Aquí se expondrán métodos para el frontend posteriormente
});
