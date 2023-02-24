const portCss = require("postcss");
const postcssComma = require("../plugins/comma");
const dealMarginPadding = require("../plugins/deal-margin-padding");
const dealColors = require("../plugins/deal-colors");
const valToZero = require("../plugins/val-to-zero");
const portCssTool = portCss([
  postcssComma,
  dealMarginPadding,
  dealColors,
  valToZero
]);
/**
 * 配置JSON数据转换 css AST 数据
 * @param {*} data
 * @returns
 */
function getASTByArray(data) {
  const result = portCssTool.process("").result.root;
  if (Array.isArray(data) && data.length) {
    const cssNodes = result.nodes || [];
    const ruleDefualt = {
      raws: {
        before: "\n",
        between: " ",
        semicolon: true,
        after: "\n"
      },
      type: "rule"
    };
    const declDefualt = {
      raws: {
        before: "\n  ",
        between: ": "
      },
      type: "decl"
    };
    data.forEach((item) => {
      // 集合原子类名
      if (Array.isArray(item.props) && item.props.length) {
        const pNodes = [];
        cssNodes.push({
          selector: `.${item.name}${item.pseudo ? `::${item.pseudo}` : ""}`,
          nodes: pNodes,
          ...ruleDefualt
        });
        item.props.forEach((pItem) => {
          pNodes.push({
            prop: pItem.prop,
            value: pItem.value,
            ...declDefualt
          });
        });
      } else {
        // 单个原子类名
        cssNodes.push({
          selector: `.${item.name}`,
          nodes: [
            {
              prop: item.prop,
              value: item.value,
              ...declDefualt
            }
          ],
          ...ruleDefualt
        });
      }
    });
  }
  return result;
}

module.exports = {
  getASTByArray
};
