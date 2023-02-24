module.exports = {
  // 相对路径
  includeDir: [],
  // 运行 update-atom 命令时,生成原子css数据的项目状态配置. 0: 初始化项目初次生成原子样式  1: 后续维护,用于将最新的原子样式添加到旧的原子样式数据里
  updateAtomStatus: 1,
  updateAtomCount: 0, // 更新出现大于**次的原子css数据
  defaultCssFiles: ['index.css'], // 默认主包样式文件
  otherCssDirs: [], // 除了默认主包样式文件之外，其它属于主包的样式文件夹目录
};
