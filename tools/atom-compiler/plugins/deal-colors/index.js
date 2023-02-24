// 【 插件 deal-colors 处理颜色 1、将3位色值简写补全至6位   2、将6位色值中的大写字母转换成小写 】

const { dealMatchValue } = require('../utils/common');
// 匹配属性(这些属性的值涉及颜色处理)
const matchAttr = [
  'color',
  'background',
  'background-color',
  'border-color',
  'border',
  'border-top',
  'border-bottom',
  'border-left',
  'border-right',
];

// 规则集(颜色处理)
const regArr = [
  {
    // 【匹配规则】 3位色值简写补全至6位(以#开头,后面有3位满足条件的值)
    name: 'threeToSix',
    replaceReg: /(^#[0-9a-zA-Z]{3}$)|(\s)#[0-9a-zA-Z]{3}$/, // 匹配规则
    // 【replace 回调方法详解】
    // 其参数共分为两种情况，分别是 启用分组匹配时有四个参数 和 未启用分组匹配时为三个参数
    // 共四个参数，分别为：
    // ① 首个参数  match：匹配到的字符串(如果正则使用了分组匹配就为多个，否则无此参数)；
    // ② 第二个参数  groupMatch / matchIndex
    //      第二个参数不是固定的，启用分组匹配时是这个参数 groupMatch，由regex模式所分组的所有匹配字符串组,可能是多个，如果设置了分组匹配却没有匹配到规则，则其值为undefined；
    //      未启用分组匹配时则是 matchIndex (匹配内容在字符串中的下标)，
    // ③ 倒数第二个参数 matchIndex 匹配内容在字符串中的下标
    // ④ 最后一个参数 oldStr 原始字符串
    fun: (match, groupMatch, matchIndex, oldStr) => {
      // (启用分组匹配)匹配 border 之类非纯颜色属性(颜色前面带空格)的值，如：2rpx solid #f0f
      if (groupMatch !== undefined && oldStr) {
        return `${groupMatch}${match.split(groupMatch)[1].replace(/[0-9a-zA-Z]/g, n => `${n}${n}`)}`;
      }
      // (未启用分组匹配)匹配纯颜色的属性值，如： #f0f
      return match.replace(/[0-9a-zA-Z]/g, n => `${n}${n}`);
    },
  },
  {
    // 【匹配规则】 将6位色值中的大写字母转换成小写
    name: 'toLowerCase',
    replaceReg: /#[0-9a-zA-Z]{6}$/,
    fun: n => n.toLowerCase(), // replace 回调方法
  },
];

// 插件运行时，转换颜色值
module.exports = () => {
  const PLUGIN_NAME = 'deal-colors';
  return {
    postcssPlugin: PLUGIN_NAME,
    Once(root) {
      root.nodes.forEach((node) => {
        const { type, nodes } = node;
        if (type === 'rule') {
          nodes.forEach((n, i) => {
            if (n.type === 'decl') {
              const { prop, value } = n;
              const newValue = dealMatchValue(prop, value, matchAttr, regArr);
              if (newValue !== value) {
                // console.log('prop', value, newValue);
                nodes[i].value = newValue;
              }
            }
          });
        }
      });
    },
  };
};
module.exports.postcss = true;
