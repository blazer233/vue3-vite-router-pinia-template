const path = require("path");
const gatherData = require("../atom/gather.json"); // 集合原子数据
const pseudoData = require("../atom/pseudo.json"); // 伪元素原子数据
const vsSettingData = require("../atom/vsSetting.json"); // 专用代码片段数据(对象形式)
const fileUtil = require("./file");

function getAllFile() {
  let filesData = [];
  // transition 原子类暂时先不转
  const exclude = [
    "gather.json",
    "pseudo.json",
    "setting.json",
    "vsSetting.json"
  ]; // 忽略文件
  const jsonPath = path.join(__dirname, "../atom");
  const allFile = fileUtil.readdir(jsonPath);
  allFile.forEach((element) => {
    if (exclude.includes(element)) return;
    const filePath = path.resolve(`${jsonPath}/${element}`);
    if (path.extname(element) == ".json") {
      try {
        const data = JSON.parse(fileUtil.readFile(filePath));
        filesData = [...filesData, ...data];
      } catch (e) {
        console.error("JSON.parse", element);
      }
    }
  });
  return filesData;
}

module.exports = {
  base: getAllFile(),
  gather: [...gatherData, ...pseudoData], // (注意先后顺序) 集合原子数据； 伪元素原子数据；
  setting: vsSettingData // 专用代码片段数据(对象形式)。不参与wxss转换，会被工具直接添加到生成的代码片段 .vscode/atom.code-snippets 中。
};
