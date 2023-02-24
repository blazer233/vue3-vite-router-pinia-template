/**
 * 配置JSON数据转换 代码片段
 * @param {*} data
 * @returns
 */
function getSnippetsByArray(data) {
  // 制作代码片段
  const snippets = {};
  data.forEach((item) => {
    const { prefix, name, description, prop, value, props } = item;
    if (prefix && name && prop && value) {
      snippets[`${prop}: ${value};`] = {
        scope: "vue, vue-html",
        prefix,
        body: [name],
        description
      };
    } else if (props) {
      // 集合原子
      snippets[prefix] = {
        scope: "vue, vue-html",
        prefix,
        body: [name],
        description
      };
    }
  });
  return snippets;
}

module.exports = {
  getSnippetsByArray
};
