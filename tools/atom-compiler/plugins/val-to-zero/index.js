// 【 插件 val-to-zero 将某些样式值处理成0 】

const { dealMatchValue } = require('../utils/common');

// 匹配待处理的属性
const matchAttr = [
  'width',
  'height',
  'line-height',
  'min-height',
  'margin-top',
  'margin-bottom',
  'margin-left',
  'margin-right',
  'padding-top',
  'padding-bottom',
  'padding-left',
  'padding-right',
  'top',
  'bottom',
  'left',
  'right',
  'font-size',
  'border-radius',
  'flex',
  'letter-spacing',
  'vertical-align',
];

// 规则集
const regArr = [
  {
    // 【匹配规则】 将诸如
    name: 'val-to-zero',
    replaceReg: /^(-0|0)(px|Px|rpx|%|vw|vh)$/, // 匹配规则，匹配所有为0的值
    // fun【replace 回调方法】: 回调函数值第二个参数为匹配的 (-0|0) 的值，第三个参数为匹配的 (px|Px) 的值
    fun: () => '0',
  },
];

// 插件运行时，转换颜色值
module.exports = () => {
  const PLUGIN_NAME = 'val-to-zero';
  return {
    postcssPlugin: PLUGIN_NAME,
    Once(root) {
      root.nodes.forEach((node) => {
        const { type, nodes } = node;
        if (type === 'rule') {
          nodes.forEach((n, i) => {
            if (n.type === 'decl') {
              const { prop, value } = n;
              if (matchAttr.indexOf(prop) > -1) {
                const newValue = dealMatchValue(prop, value, matchAttr, regArr);
                if (newValue !== value) {
                  // console.log('prop', value, newValue);
                  nodes[i].value = newValue;
                }
              }
            }
          });
        }
      });
    },
  };
};
module.exports.postcss = true;
