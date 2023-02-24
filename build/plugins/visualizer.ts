import visualizer from "rollup-plugin-visualizer";
import { ANALYSIS } from "../config";

export function ConfigVisualizerConfig() {
  if (ANALYSIS) {
    return visualizer({
      filename: "./node_modules/.cache/visualizer/stats.html",
      open: true,
      gzipSize: true,
      brotliSize: true
    });
  }
  return [];
}
