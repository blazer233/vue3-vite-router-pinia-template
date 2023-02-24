/* eslint-disable no-console */
// 【 将原子数据转换为样式和代码片段内容 】

const path = require("path");
const fileUtil = require("../utils/file");
const { getASTByArray } = require("../parse/css");
const { getSnippetsByArray } = require("../parse/snippets");
const {
  base: atomData,
  gather: gatherData,
  setting: settingData
} = require("../utils/getJsonData");
const mainPath = process.cwd();
const ProgressBar = require("progress");
const total = 1688;

const bar = new ProgressBar("  处理中 [:bar]  :percent", {
  total,
  complete: "=",
  incomplete: " ",
  width: 20
});

/**
 * 将配置原子类转换成wxss文件
 */
function compileAtomWxss() {
  const wxssAst = getASTByArray([...gatherData, ...atomData]);
  const wxssContent = wxssAst.toString();
  fileUtil.writeFile(path.join(mainPath, "/src/atom.css"), wxssContent);
}
/**
 * 将配置原子类转换成代码片段提示
 */
function compileSnippets() {
  let snippetsData = getSnippetsByArray([...gatherData, ...atomData]);
  snippetsData = { ...settingData, ...snippetsData };
  const snippetsPath = path.join(mainPath, ".vscode/atom.code-snippets");
  fileUtil.writeFile(snippetsPath, JSON.stringify(snippetsData, null, 2)); // 第三个参数表示缩进的空格数
}

function compile() {
  compileAtomWxss();
  compileSnippets();
}

function createSnippet() {
  console.log("原子类JSON数据开始处理");
  console.time("createSnippet");
  compile();
  bar.tick(total);
  console.log("\n");
  console.log("原子样式和代码片段已生成");
  console.timeEnd("createSnippet");
}

createSnippet();
