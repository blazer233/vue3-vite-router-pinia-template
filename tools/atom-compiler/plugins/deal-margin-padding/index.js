// 【 插件 deal-margin-padding 拆分简写的边距属性值，如将一个 margin: 10rpx; 属性，拆解为四个方向外边距值为10的样式 】

const declDefualt = {
  raws: {
    before: '\n  ',
    between: ': ',
  },
  type: 'decl',
};

// 定义需要拆解哪些属性(存在该属性名的项)，以及哪些属性值不进行转换
const simplifyAttr = {
  margin: [], // 需要保留为空的项，不然不会拆分该属性类型的属性值
  padding: [],
};
/**
 * 拆解简写的 margin/padding 边距值为四个方向的边距值
 * @param {*} prop 属性名: margin/padding
 * @param {*} value 属性值
 * @returns
 */
function dealMarginPaddingValue(prop, value) {
  let returnVal = '';
  // 判断属性名是否为 margin/padding,排除特定属性值(存在原子属性): padding为 unset 或 0; margin为 unset 或 auto 或 0 auto 或 0
  if (simplifyAttr[prop] && !simplifyAttr[prop].includes(value)) {
    const reg = /0|(\d+|-\d+|\d+.\d+|-\d+.\d+)(rpx|px)|auto|unset/g; // 匹配简写的边距值
    if (new RegExp(reg).test(value)) {
      // 校验通过
      const valueArr = value.split(' ');
      if (!valueArr.length) return;
      let ruleVal;
      if (valueArr.length == 1) {
        ruleVal = [0, 0, 0, 0];
      } else if (valueArr.length == 2) {
        ruleVal = [0, 1, 0, 1];
      } else if (valueArr.length == 3) {
        ruleVal = [0, 1, 2, 1];
      } else {
        ruleVal = [0, 1, 2, 3];
      }
      returnVal = [
        { prop: `${prop}-top`, value: valueArr[ruleVal[0]] },
        { prop: `${prop}-right`, value: valueArr[ruleVal[1]] },
        { prop: `${prop}-bottom`, value: valueArr[ruleVal[2]] },
        { prop: `${prop}-left`, value: valueArr[ruleVal[3]] },
      ];
    }
  }
  return returnVal;
}

// 拆解简写的 margin/padding 边距值为四个方向的边距值
module.exports = () => {
  const PLUGIN_NAME = 'deal-margin-padding';
  return {
    postcssPlugin: PLUGIN_NAME,
    Once(root, { Declaration }) {
      root.nodes.forEach((node) => {
        const { type, nodes } = node;
        // console.log('selector', selector);
        if (type === 'rule') {
          const pushArr = [];
          const iArr = [];
          nodes.forEach((n, i) => {
            if (n.type === 'decl') {
              const { prop, value, important } = n;
              if (!important) {
                // 添加了 important 的样式不处理
                const valueArr = dealMarginPaddingValue(prop, value);
                if (valueArr) {
                  // 命中匹配项才拆解样式
                  iArr.push(i); // 记录下标，用于后续操作 splice
                  pushArr[i] = [];
                  valueArr.forEach((val) => {
                    pushArr[i].push(new Declaration({ ...val, ...declDefualt }));
                  });
                }
              }
            }
          });
          if (iArr) {
            iArr.reverse().forEach((n) => {
              node.nodes.splice(n, 1, ...pushArr[n]);
            });
          }
        }
      });
    },
  };
};
module.exports.postcss = true;
