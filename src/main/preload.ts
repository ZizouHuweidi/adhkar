import { contextBridge, ipcRenderer } from 'electron';

const electronHandler = {
  adhkar: {
    getData() {
      return ipcRenderer.invoke('adhkar:get-data');
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
