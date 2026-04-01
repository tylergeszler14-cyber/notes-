// Preload runs in the renderer with access to Node APIs before the page loads.
// We keep it minimal — all Ollama calls are plain fetch() from the renderer.
import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
});
