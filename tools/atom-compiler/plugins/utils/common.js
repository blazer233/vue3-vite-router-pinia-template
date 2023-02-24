/**
 * 处理匹配到的属性值
 * @param {*} prop 属性名
 * @param {*} value 属性值
 * @param {*} matchAttr 匹配待处理的属性
 * @param {*} regArr 规则集
 * @returns
 */
function dealMatchValue(prop, value, matchAttr, regArr) {
  let returnVal = value;
  // 判断属性名是否为匹配
  if (matchAttr.indexOf(prop) > -1) {
    regArr.forEach((item) => {
      if (new RegExp(item.replaceReg).test(returnVal)) {
        returnVal = returnVal.replace(item.replaceReg, item.fun);
      }
    });
  }
  return returnVal;
}

module.exports = {
  dealMatchValue,
};
