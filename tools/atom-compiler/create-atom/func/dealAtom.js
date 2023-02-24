/* eslint-disable no-console */
const {
  NO_DEAL_PROP,
  NO_DEAL_VALUE,
  SORT_ORDER_UNIT,
  FILE_TYPE_RULE,
  RULE_FOR_X_VAL,
  CHECK_RULE,
  allValType,
  checkValInRule
} = require("../config/config");
const {
  testStrByRule,
  replaceByRules,
  replaceSpecialStr
} = require("../config/utils");
const { STYLE_CONFIG, MERGE_PROP } = require("../config/styleConfig");
const path = require("path");
const fileUtil = require("../../utils/file");
const { customData } = require("../config/customData");

let filterOutArr = []; // 记录过滤掉的数据
/**
 * 处理样式数组的数据
 * @param {*} dataArr 样式数组
 * @returns
 */
function creatSortAtom(dataArr, filterCount) {
  const startLen = dataArr.length;
  if (filterCount) {
    dataArr = dataArr.filter((it) => {
      if (it.count <= filterCount) {
        filterOutArr.push(it);
      }
      return it.count > filterCount;
    });
    console.log(
      "初次过滤掉出现次数在",
      filterCount,
      "次以下的数据以后，剩余条数为:",
      dataArr.length
    );
  }
  // 过滤掉不需要处理的原子类数据
  const newArr = filterHoldProp(dataArr);

  const sortTypeData = dealPropValue(newArr); // 分成各个类型的数据

  // sortOrderPropValue 将分类整理的数据按照数字类型进行排序,格式如下:
  // {
  //   width: { data: { 'rpx':{data: [...]}}, other:{data: [...]} }, // 有属性值分类
  //   zIndex: { data: [...] }, // 无属性值分类
  // }
  sortOrderPropValue(sortTypeData);
  fileUtil.writeFile(
    path.join(__dirname, "../testData/sortTypeData.json"),
    JSON.stringify(sortTypeData, null, 2)
  );

  // specialPropBelong 将特殊类型的属性数据聚合到所属属性分类中(如：将 max-width 的数据注入到 width 属性数据里)
  // 返回重组的分类数据,格式如下: [{fileType:'width',content:[...]}, {fileType:'height',content:[...]}]
  const sortDataArr = specialPropMerge(sortTypeData);

  const fLen = filterOutArr.length;
  console.log(
    "最终所有被过滤掉的数据条数为:",
    fLen,
    "; 剩下被成功转换成原子css的数据条数为:",
    startLen - fLen
  );
  return sortDataArr;
}

// 筛选出需要保留的属性
function filterHoldProp(allData) {
  const returnData = allData.filter((it) => {
    let needHold = true; // 判断该属性是否需要保留
    if (!it.prop || !it.value) {
      // 错误属性直接过滤掉
      needHold = false;
    } else {
      // 判断是不是属于需要过滤的属性名
      if (NO_DEAL_PROP.indexOf(it.prop) > -1) {
        needHold = false;
      } else {
        // 再次判断是不是属于需要过滤的属性值
        NO_DEAL_VALUE.forEach((it2) => {
          // 属于需要过滤的属性值
          if (it.value.indexOf(it2) > -1) {
            needHold = false;
          }
        });
      }
    }
    if (!needHold) {
      filterOutArr.push(it);
    }
    return needHold; // 返回为 true 表示保留该项，不需要过滤
  });
  return returnData;
}

// 处理属性名和属性值
// 1、处理属性名和属性值的拼接
// 2、将属性名和属性值按自定义的规则进行简写
function dealPropValue(allData) {
  const returnData = {
    // 初始归类，未配置分类的数据
    noConfig: {
      length: 0,
      data: []
    }
  };
  allData.forEach((dItem) => {
    const { prop, value } = dItem;
    let initProp = prop;
    let initVal = value;

    // 场景1、带浏览器私有前缀(属性名/属性值以符号 - 开头)
    if (initProp.indexOf("-") == 0) {
      initProp = dealPrefixPropValue(initProp);
    }
    let renameProp = initProp;
    if (initVal.indexOf("-") == 0) {
      initVal = dealPrefixPropValue(initVal);
    }
    // 首先替换掉 属性值 里面的特殊字符(如其中的空格、括号、负数符号和逗号等,用 - 连接)
    initVal = replaceSpecialStr(initVal); // 记录属性值替换之前的值
    let renameVal = initVal;

    // STYLE_CONFIG 配置数据，针对单个属性的数据进行二次处理和分类
    if (STYLE_CONFIG[prop]) {
      let {
        fileTypeName,
        exclude,
        valRules,
        valUnitTypes,
        needSort,
        unit,
        toOtherFileType,
        someRenameVal,
        valHasX
      } = STYLE_CONFIG[prop];
      let fileType = fileTypeName || prop;
      // 设置初始分类(按属性名分类)
      if (!returnData[fileType]) {
        returnData[fileType] = {
          prop,
          needSort,
          length: 0,
          data: []
        };
      }
      // 1、renameProp 属性名的简写
      if (STYLE_CONFIG[prop].renameProp) {
        renameProp = STYLE_CONFIG[prop].renameProp;
      }
      // 2、exclude 排除属性值中包含这些内容的项
      if (exclude && exclude.length) {
        let hasHit = false;
        exclude.forEach((it) => {
          if (!hasHit && value.indexOf(it) > -1) {
            hasHit = true;
          }
        });
        if (hasHit) {
          filterOutArr.push(dItem);
          return false;
        }
      }

      // 3、valRules 属性值的匹配替换
      if (valRules) {
        renameVal = replaceByRules(valRules, renameVal); // 将属性值中的内容，按规则进行替换
      }
      // 值中存在为倍数的情况，如 line-heigh: 2; 转为 line-height-2x
      if (valHasX && checkValInRule(value, RULE_FOR_X_VAL.reg)) {
        renameVal += "x"; // 用 X 表示倍数
      }

      // 4、再次检验修改属性值应该归类的文件类型。除了自身类型的文件，部分属性值额外还可能导出到哪个类型的文件中，经过校验将其重新分类到对应的文件类型中
      // 例如： width: fit-content; 将其分类到 boxSizing 类型中，后续导入到 boxSizing 文件。
      let otherFile = "";
      if (toOtherFileType) {
        toOtherFileType.some((type) => {
          if (FILE_TYPE_RULE[type]) {
            const ruleReg = FILE_TYPE_RULE[type];
            const hasHit = testStrByRule(ruleReg, `${prop}: ${value};`);
            if (hasHit) {
              // valType = type;
              otherFile = type;
              return true; // 只允许命中一次，后续不再触发
            }
          }
          return false;
        });
      }
      if (otherFile) {
        const otherFileConfig = STYLE_CONFIG[otherFile];
        fileType = otherFileConfig.fileTypeName || otherFile;
        valUnitTypes = otherFileConfig.valUnitTypes; // 更改过文件类型，属性值类型分类的值重新从配置中取值
        // 校验更改文件类型后的数据存不存在
        if (!returnData[fileType]) {
          returnData[fileType] = {
            needSort: otherFileConfig.needSort || false,
            length: 0,
            data: []
          };
        }
      }

      // 5、按照设定的属性值类型进行分类，不在所属类型中的则归类到 other 类中
      let valType;
      if (valUnitTypes) {
        let hitTypeNum = 0; // 属性值类型命中次数
        // 有属性值类型分类且为初始数组格式时，更改一次初始的数据结构
        if (Array.isArray(returnData[fileType].data)) {
          returnData[fileType].data = {};
        }
        // 匹配 为 0 的值, 为0的值添加到其基础的 unit 字段所属的分类中, 如 rpx
        if (initVal == 0) {
          hitTypeNum = 1;
          valType = unit;
        } else {
          // 匹配类型字符串
          valUnitTypes.forEach((type) => {
            const hit = RegExp(new RegExp(type, "g")).test(initVal); // 注意，此处必须校验替换单位之前的initVal值，renameVal不可用
            if (hit) {
              if (!hitTypeNum) {
                // 类型命中一次后就不再处理，后续只记录 hitTypeNum 的次数
                valType = type; // 记录所属分类
              }
              hitTypeNum += 1;
            }
          });
        }
        // 该属性有分类参数，但当前属性值全部未命中其值分类的情况，将内容添加到 other 分类中
        if (!hitTypeNum) {
          valType = "other"; // 记录所属分类为 other
        }
      }

      // 6、有简写元素名，则赋值简写的元素名-值
      let renameStr = `${renameProp}-${renameVal}`;
      let description = "";

      // 7、将一些特殊的属性值进行自定义命名，如： 将蓝色 c-#265cf0 自定义命名为 c-blue
      if (someRenameVal && someRenameVal[value]) {
        const { renamePropVal, descText } = someRenameVal[value];
        if (renamePropVal) {
          renameStr = renamePropVal; // 自定义重命名
        }
        if (descText) {
          description = descText; // 自定义描述
        }
      }

      // 按属性名类型分类的计数+1
      returnData[fileType].length += 1;
      const pushObj = {
        prefix: `${initProp}-${initVal}`,
        // renameProp,
        // renameVal,
        // initProp,
        // initVal,
        name: renameStr,
        ...dItem,
        description
      };
      // 添加到所属类型的数据中
      if (valType) {
        // 初始化按属性值类型分类的数据
        if (!returnData[fileType].data[valType]) {
          returnData[fileType].data[valType] = { length: 0, data: [] };
        }
        // 按属性值类型分类的计数+1
        returnData[fileType].data[valType].length += 1;
        returnData[fileType].data[valType].data.push(pushObj);
      } else {
        returnData[fileType].data.push(pushObj);
      }
    } else {
      // 不在配置中的数据添加到类型为 noConfig 的数据里去
      returnData.noConfig.length += 1;
      returnData.noConfig.data.push({
        prefix: `${initProp}-${initVal}`,
        // renameProp,
        // renameVal,
        // initProp,
        // initVal,
        ...dItem
      });
    }
  });
  return returnData;
}

// 将分类整理的数据按照数字类型进行排序
function sortOrderPropValue(dataObj) {
  Object.keys(dataObj).forEach((fileType) => {
    const { prop, data, needSort } = dataObj[fileType];
    if (fileType == "noConfig") {
      // 未配置项数据只按照出现次数由多到少排序
      data.sort((a, b) => b.count - a.count);
    } else {
      if (!needSort) return; // 不需要排序
      if (Array.isArray(data)) {
        // 未区分类型的属性，判断排序指标(有基础单位则用基础单位，没有则默认为数值)
        const config = STYLE_CONFIG[prop]; // 取得该属性的配置
        if (config.unit) {
          data.sort((a, b) =>
            sortFun(
              a.value.split(config.unit)[0],
              b.value.split(config.unit)[0]
            )
          );
        } else {
          data.sort((a, b) => sortFun(a.value, b.value));
        }
      } else {
        Object.keys(data).forEach((valType) => {
          // 区分是否属于需要排序的类型
          const valData = data[valType].data;
          if (SORT_ORDER_UNIT.includes(valType)) {
            valData.sort((a, b) =>
              sortFun(a.value.split(valType)[0], b.value.split(valType)[0])
            );
          } else {
            valData.sort((a, b) => sortFun(a.value, b.value));
          }
        });
      }
    }
  });
}

// 自定义排序方法(特殊场景：字符串与数字混合排序)
function sortFun(val1, val2) {
  const isNaN1 = isNaN(Number(val1));
  const isNaN2 = isNaN(Number(val2));
  if (isNaN1 && isNaN2) return 0;
  if (isNaN1) return -1;
  if (isNaN2) return 1;
  // 将 compare 中非数字的字符顺序往前面排列
  return Number(val1) - Number(val2);
}

// specialPropMerge 合并组合对象格式的属性数据成数组，不区分类型
// 同时，将部分特殊类型的属性数据聚合到所属属性分类中(如：将 max-width 的数据注入到 width 属性数据里)
function specialPropMerge(dataObj) {
  const newArr = [];
  // MERGE_PROP 这些子属性数据需要合并到其所属属性的数据中去
  MERGE_PROP.forEach((it) => {
    const { prop, childProp } = it;
    if (!childProp || !childProp.length) return;
    const parentName = STYLE_CONFIG[prop]
      ? STYLE_CONFIG[prop].fileTypeName
      : prop;
    if (!dataObj[parentName]) {
      // 没有其所属类型的数据时，创建初始数据
      dataObj[parentName] = {
        prop,
        needSort: STYLE_CONFIG[prop] ? STYLE_CONFIG[prop].needSort : false,
        length: 0,
        data: {}
      };
    }
    childProp.forEach((cIt) => {
      if (!STYLE_CONFIG[cIt]) return;
      const childPropName = STYLE_CONFIG[cIt].fileTypeName || "";
      const childData = dataObj[childPropName];
      if (!childData) return;
      const oldLength = dataObj[parentName].length; // 记录原数据长度
      dataObj[parentName].length += childData.length;
      // 对于有子属性分类数据的父级数据，如果所属父级分类的数据为数组格式，则纠正更改一次数据格式
      if (Array.isArray(dataObj[parentName].data)) {
        let unit = "other";
        if (STYLE_CONFIG[prop] && STYLE_CONFIG[prop].unit) {
          unit = STYLE_CONFIG[prop].unit;
        }
        if (unit) {
          dataObj[parentName].data = {
            [unit]: {
              length: oldLength,
              data: dataObj[parentName].data
            }
          };
        }
      }
      if (!dataObj[parentName].data.childProp) {
        dataObj[parentName].data.childProp = [];
      }
      dataObj[parentName].data.childProp.push(childData); // 作为 childProp 属性注入到所属属性分类的数据里
      delete dataObj[childPropName]; // 删除掉被作为子属性注入过的数据
    });
  });

  dataObj = { ...dataObj, ...customData };
  // customData

  fileUtil.writeFile(
    path.join(__dirname, "../testData/dataObj.json"),
    JSON.stringify(dataObj, null, 2)
  );
  Object.keys(dataObj).forEach((fileType) => {
    const { data, prop = "" } = dataObj[fileType];
    // 将未配置数据暂时不需要，将其过滤掉
    if (fileType == "noConfig") {
      filterOutArr = [...filterOutArr, ...data];
      return;
    }
    const allValData = mergeData(data, fileType);
    newArr.push({ fileType, prop, content: allValData });
  });
  return newArr;
}

function mergeData(data, fileType) {
  if (!data) return;
  let returnData = [];
  // 数组格式(无属性值分类) || 为 vsSetting 类型配置数据时,直接填充数据
  if (Array.isArray(data) || fileType == "vsSetting") {
    returnData = data;
  } else {
    const { childProp } = data;
    let returnChildDatas = []; // 下属的所有子属性属性
    if (childProp && childProp.length) {
      childProp.forEach((childItem) => {
        if (childItem && childItem.data) {
          let childData = []; // 整合单项子属性
          if (Array.isArray(childItem.data)) {
            childData = childItem.data; // 数组格式(无属性值分类)直接填充数据
          } else {
            allValType.forEach((valType) => {
              if (
                childItem.data[valType] &&
                childItem.data[valType].data &&
                childItem.data[valType].data.length
              ) {
                childData = childData.concat(childItem.data[valType].data);
              }
            });
          }
          if (childData.length) {
            returnChildDatas = returnChildDatas.concat(childData);
          }
        }
      });
    }
    allValType.forEach((valType) => {
      if (data[valType]) {
        returnData = returnData.concat(data[valType].data);
      }
    });
    returnData = returnData.concat(returnChildDatas); // 让属的子属性属性数据显示在最前面
  }
  return returnData;
}

// 处理携带有浏览器私有前缀的属性名/属性值
function dealPrefixPropValue(val) {
  // 属性名/属性值中有浏览器私有前缀，将其中的第一个 - 符号去掉，如 -webkit-**、-os-** 等
  const check = CHECK_RULE.prefixRule.checkValInRule(val);
  if (check) {
    val = val.slice(1);
  }
  return val;
}

module.exports = {
  creatSortAtom
};
