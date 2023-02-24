/* eslint-disable no-console */

// 【 生成原子css数据(初始化项目)/更新原子css数据(后续维护) 】

// 检查项目中是否存在非原子css已记录的属性数据，如果有，则添加到对应的数据里
const path = require("path");
const { getAtomMap } = require("./func/getAtom");
const { creatSortAtom } = require("./func/dealAtom");
const fileUtil = require("../utils/file");
const { STYLE_CONFIG } = require("./config/styleConfig");
const { updateAtomStatus, updateAtomCount } = require("../config");

// 项目目录
const projectUrl = process.cwd();

/**
 * 按照分类创建对应类型的文件（！初始化项目时才启用，后续维护不再使用）
 * @param {Array} sortDatas 分成各个类型的数据
 * @returns
 */
function creatFileBySortData(sortDatas) {
  sortDatas.forEach((sortData) => {
    const { fileType, content } = sortData;
    if (content) {
      const fileData = JSON.stringify(content, null, 2);
      fileUtil.writeFile(
        path.join(__dirname, `../atom/${fileType}.json`),
        fileData
      );
    }
  });
}

// 文件名不相符情况下的映射
const fileNameMap = {
  "z-index": "zIndex",
  boxSize: "boxSizing",
  fontSizes: "fontSize",
  lineHeights: "lineHeight"
};

/**
 * 根据新生成的原子样式与旧原子数据进行比较，添加新的原子样式(出现次数超过一次)来更新旧原子数据
 * @param {Array} newAtomJsons 新生成的原子样式
 */
function replaceOldAtomJson(newAtomJsons) {
  // 获取旧原子数据
  const exclude = [
    "gather.json",
    "pseudo.json",
    "setting.json",
    "vsSetting.json",
    "transition.json",
    "animation.json"
  ]; // 忽略文件
  const jsonPath = path.join(__dirname, "../atom");
  const allFile = fileUtil.readdir(jsonPath);
  allFile.forEach((element) => {
    if (exclude.includes(element)) return;
    const filePath = path.resolve(`${jsonPath}/${element}`);
    if (path.extname(element) == ".json") {
      try {
        let oldAtomJson = JSON.parse(fileUtil.readFile(filePath)); // 当前文件的内容，即旧原子样式数据
        const fileName = element.split(".")[0]; // 文件名
        let fileType = fileName;
        if (fileNameMap[fileType]) {
          fileType = fileNameMap[fileType]; // 映射文件名更改该文件名的命名
        }
        const fItem = newAtomJsons.find((obj) => obj.fileType === fileType); // 找到当前文件对应的新原子样式数据
        if (fItem) {
          let newAtomJson = fItem.content || [];
          const newAtomProp = fItem.prop || ""; // 获取该样式的属性
          const newAtomConfig = STYLE_CONFIG[newAtomProp] || null; // 获取该样式的配置信息
          newAtomJson = newAtomJson.filter((it) => it.count > updateAtomCount); // 过滤掉次数太少(出现次数需大于 updateAtomCount 次)的新原子样式
          // console.log('找到对应的新原子样式数据', filePath, `${fileName} =》${fItem.fileType}`);
          const addAtomData = [];
          newAtomJson.forEach((it) => {
            const { prop, value } = it;
            const fOldItem = oldAtomJson.find(
              (obj) => obj.prop === prop && obj.value === value
            );
            if (!fOldItem) {
              // console.log('准备添加新原子样式数据', it);
              addAtomData.push(it);
            }
          });
          oldAtomJson = oldAtomJson.concat(addAtomData);
          if (newAtomConfig) {
            // 根据配置信息将该样式属性的数据进行排序
            const { needSort = false, unit = "" } = newAtomConfig;
            if (needSort) {
              // 需要进行排序
              if (unit) {
                // 有基础单位则用基础单位排序
                oldAtomJson.sort((a, b) => {
                  if (
                    a.prop === b.prop &&
                    a.value.split(unit).length > 1 &&
                    b.value.split(unit).length > 1
                  ) {
                    return a.value.split(unit)[0] - b.value.split(unit)[0];
                  }
                  return 0;
                });
              } else {
                // 没有则默认为数值
                oldAtomJson.sort((a, b) => a.value - b.value);
              }
            }
          }
          fileUtil.writeFile(
            path.join(__dirname, `../atom/${element}`),
            JSON.stringify(oldAtomJson, null, 2)
          ); // 输出到正式目录
        }
      } catch (e) {
        console.error("JSON.parse", element);
      }
    }
  });
}

// 查询项目中样式属性并生成json数据
function createAtom(projectUrl) {
  console.time("生成原子css数据耗时");
  getAtomMap(projectUrl).then((value) => {
    // atomArr 目前项目中的样式属性，以及出现次数记录
    const [atomMap, atomArr] = value; // 拿到统计的样式数据
    atomArr.sort((a, b) => b.count - a.count);
    console.log(
      "查询到项目中所有样式属性的条数为:",
      Object.keys(atomMap).length
    );

    // 将Arr初始数据写入到同目录的 data.json 文件中
    fileUtil.writeFile(
      path.join(__dirname, "./testData/data.json"),
      JSON.stringify(atomArr, null, 2)
    );

    // 处理生成分类排序之后的数据，第二个参数为需要过滤出现次数在几次及其以下次数以下的数据
    const sortDatas = creatSortAtom(atomArr, 0);
    // 按分类创建对应的文件存储原子json数据,格式如下:
    // [
    //   {
    //     fileType: 'width',
    //     content: [{prefix: 'width-0', name: 'w-0', ...}, ...]
    //   },
    //   {
    //     fileType: 'height',
    //     content: [{prefix: 'height-0', name: 'h-0', ...}, ...]
    //   },
    //   ...
    // ]
    if (updateAtomStatus === 0) {
      creatFileBySortData(sortDatas); // 初始化项目初次生成原子样式，后续维护不再使用
    } else {
      // 后续，读取到最新的原子样式(用于对比哪些是新增的)
      // fileUtil.writeFile(path.join(__dirname, './testData/sortDatas.json'), JSON.stringify(sortDatas, null, 2)); // 输出最新的原子样式数据
      replaceOldAtomJson(sortDatas);
    }
    // 自动打开浏览器，查看样式 Map 和 Arr 数据
    // openBrowser({ atomMap, atomArr, lastDatas: sortDatas });
  });
  console.timeEnd("生成原子css数据耗时");
}

createAtom(projectUrl);

module.exports = {
  createAtom
};
