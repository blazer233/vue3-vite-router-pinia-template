/**
 * @name createVitePlugins
 * @description 封装plugins数组统一调用
 */
import { PluginOption } from "vite";
import vue from "@vitejs/plugin-vue";
import vueSetupExtend from "vite-plugin-vue-setup-extend";
import VitePluginCertificate from "vite-plugin-mkcert";
import { ConfigVisualizerConfig } from "./visualizer";
import { ConfigCompressPlugin } from "./compress";
import { ConfigRestartPlugin } from "./restart";
import { ConfigProgressPlugin } from "./progress";
import { ConfigImageminPlugin } from "./imagemin";
import eslint from "vite-plugin-eslint";
// import Unocss from "unocss/vite";

export function createVitePlugins() {
  const vitePlugins: (PluginOption | PluginOption[])[] = [
    // vue支持
    vue(),
    // setup语法糖组件名支持
    vueSetupExtend(),
    // 提供https证书
    VitePluginCertificate({
      source: "coding"
    }) as PluginOption
  ];

  // 开启.gz压缩  rollup-plugin-gzip
  vitePlugins.push(ConfigCompressPlugin());

  // 监听配置文件改动重启
  vitePlugins.push(ConfigRestartPlugin());

  // 构建时显示进度条
  vitePlugins.push(ConfigProgressPlugin());

  // 打包分析
  vitePlugins.push(ConfigVisualizerConfig());

  vitePlugins.push(ConfigImageminPlugin());

  // eslint
  vitePlugins.push(eslint());

  // 原子css
  // vitePlugins.push(Unocss());

  return vitePlugins;
}
