/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const portCss = require("postcss");
const postcssComma = require("../../plugins/comma");
const dealMarginPadding = require("../../plugins/deal-margin-padding");
const dealColors = require("../../plugins/deal-colors");
const valToZero = require("../../plugins/val-to-zero");
const portCssTool = portCss([
  postcssComma,
  dealMarginPadding,
  dealColors,
  valToZero
]);

const igFilesName = ["atom.css"];
const igFilePath =
  /\\(node_modules|assets|src\/assets|tools|images|modules|wxs|util)$/;
function generate(filesPath, result = []) {
  const files = fs.readdirSync(filesPath);
  files.forEach(async (element) => {
    const filePath = path.resolve(`${filesPath}/${element}`);
    const d = fs.statSync(filePath);
    if (!igFilePath.test(filePath)) {
      if (d.isDirectory()) {
        generate(filePath, result);
      } else {
        const extName = path.extname(filePath);
        if (extName === ".css") {
          const ignore = igFilesName.find(
            (igFile) => filePath.indexOf(igFile) > -1
          );
          if (!ignore) {
            result.push(filePath);
          }
        }
      }
    }
  });
}

async function getAstAtom(files, atomMap, atomArr) {
  return new Promise(async (resolve) => {
    await files.forEach(async (file) => {
      const fileData = fs.readFileSync(file);
      const astData = await portCssTool
        .process(fileData, { from: undefined })
        .then((result) => result.root);
      // console.error('astData', astData.nodes);
      if (astData && astData.nodes && astData.nodes.length) {
        astData.nodes.forEach((item) => {
          if (item.nodes && item.nodes.length) {
            for (let i = 0; i < item.nodes.length; i++) {
              const prItem = item.nodes[i];
              if (
                prItem.value &&
                prItem.value.indexOf("url(data:font/truetype;") !== -1
              )
                continue;
              const key = `${prItem.prop}-${prItem.value}`;
              // 过滤无用属性，将有效数据添加到对应数组(存储可用数据)和对象(记录出现次数)中
              // 过滤掉 添加了 important 的样式
              if (prItem.prop !== "content" && !prItem.important) {
                if (atomMap[key] || atomMap[key] === 0) {
                  // atomArr[atomMap[key]].count += 1; // TODO 关闭计数
                } else {
                  atomArr.push({
                    // count: 1,
                    prop: prItem.prop,
                    value: prItem.value
                  });
                  atomMap[key] = atomArr.length - 1;
                }
              }
            }
          }
        });
      }
    });
    resolve([atomMap, atomArr]);
  });
}

async function getAtomMap(url) {
  const result = [];
  generate(url, result);
  console.log("找到wxss文件数量===", result.length);
  // console.log('result===', result);
  const atomMap = {};
  const atomArr = [];
  await getAstAtom(result, atomMap, atomArr);
  // console.log('arr', arr);
  // console.log('atomMap atomArr', atomMap, atomArr);
  // console.log('atomMap atomArr', atomArr.length);
  return [atomMap, atomArr];
}

module.exports = {
  getAtomMap
};
