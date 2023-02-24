// plugin.js
const ruleDefualt = {
  raws: {
    before: '\n',
    between: ' ',
    semicolon: true,
    after: '\n',
  },
  type: 'rule',
};
module.exports = () => {
  const PLUGIN_NAME = 'postcss-comma';
  return {
    postcssPlugin: PLUGIN_NAME,
    Once(root, { Rule }) {
      const result = [];
      root.nodes.forEach((node) => {
        const { selector, type, nodes } = node;
        if (type === 'rule') {
          // 删除注释
          nodes.forEach((n, i) => {
            if (n.type === 'comment') {
              node.nodes.splice(i, 1);
            }
          });
          // 拆分分组选择器（选择器存在逗号）
          if (selector && selector.indexOf(',') !== -1) {
            const selectorSplits = selector.split(',');
            selectorSplits.forEach((sel) => {
              if (sel) {
                const newNode = {
                  nodes,
                  selector: sel,
                  ...ruleDefualt,
                };
                result.push(new Rule(newNode));
              }
            });
          } else {
            result.push(node);
          }
        } else {
          result.push(node);
        }
      });
      root.nodes = result;
    },
  };
};
module.exports.postcss = true;
