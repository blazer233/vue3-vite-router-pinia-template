/* eslint-disable no-console */
const animationProp = [
  'animation',
  'animation-delay',
  'animation-direction',
  'animation-name',
  '-webkit-animation',
  '-webkit-animation-delay',
  '-webkit-animation-direction',
  '-webkit-animation-name',
];
const transitionProp = [
  'transition',
  'transition-delay',
  'transition-direction',
  'transition-duration',
  'transition-property',
  'transition-timing-function',
  '-webkit-transition',
  '-webkit-transition-delay',
  '-webkit-transition-direction',
  '-webkit-transition-duration',
  '-webkit-transition-property',
  '-webkit-transition-timing-function',
];
const fontProp = ['font-family', 'font-style'];

// border相关的属性走自定义配置化数据，判断项目中是否存在才生成
const borderProp = [
  'border',
  'border-width',
  'border-color',
  'border-style',
  'border-top',
  'border-bottom',
  'border-left',
  'border-right',
];

// NO_DEAL_PROP 属性名类型: 这些属性过滤掉，不处理
const NO_DEAL_PROP = [
  'src',
  'background-image',
  'box-shadow',
  ...animationProp,
  ...transitionProp,
  ...fontProp,
  ...borderProp,
];

// NO_DEAL_VALUE 属性值类型: 属性值中包含这些字段的过滤掉，不处理
const linearGradientProp = [
  'calc',
  'linear-gradient',
  '-webkit-linear-gradient',
  'repeating-linear-gradient',
];
const NO_DEAL_VALUE = [...linearGradientProp];

/**
 * commonNumUnit 单位类型: 数值单位的通用类型，按此将属性值分类。最后生成文件写入时也按照此顺序写入对应类型的内容
 */
const commonNumUnit = ['auto', 'vw', 'vh', '%', 'rpx'];

const allValType = ['other', ...commonNumUnit];

// 能用来排序的单位后缀
const SORT_ORDER_UNIT = ['vw', 'vh', '%', 'rpx'];

/**
 * RULE_FOR_NUM_VAL 规则: 替换通用数值单位中的 rpx 和 %,替换属性值中
 */
const RULE_FOR_NUM_VAL = [
  { reg: /rpx/g, replace: '' },
  { reg: /%/g, replace: 'p' },
];

// 删除颜色值中的符号 #
const RULE_FOR_COLOR_VAL = [{ reg: /#/g, match: '#', replace: '' }];

/**
 * RULE_FOR_SPECIAL_STR 规则: 替换通用特殊字符,使其在 prefix 和 name 字段中按此规则显示
 * 1、替换 将负数符号替换为 'n'
 * 2、替换 将属性值的多个空格替换成一个空格
 * 3、替换 '(' 或 ' ,' 或 ' ' 或 ',' 为 符号 '-'
 * 4、去除 '-'(开头位置) 或者 ')',如 -webkit-**、 、 scale(0.5) 等
 * 5、替换 '.' 为 'd',如 18.5 等
 */
const SPECIAL_STR_RULE_FOR_VAL = [
  { reg: /-(\d+)/g, replace: (match, num) => `n${num}` }, // 将负数符号替换为 'n'
  { reg: /\s(\s+)/g, replace: ' ' }, // 将属性值的多个空格替换成一个空格
  { reg: /\(|\s,|,\s|\s|,/g, replace: '-' }, // 替换 '(' 或 ' ,' 或 ' ' 或 ',' 为 符号 '-'
  { reg: /^-|\)/g, replace: '' }, // 去除 '-'(开头位置) 或者 ')'
  { reg: /\./g, replace: 'd' }, // 替换 '.' 为 'd'
];

// 值中存在为倍数的情况，如 line-heigh: 2; 转为 line-height-2x
const RULE_FOR_X_VAL = {
  reg: /^(\d+)$|^(\d+.\d+)$/g,
  replace: match => `${match}X`,
};

/**
 * FILE_TYPE_RULE 规则: 将匹配的属性和值写入到对应类型的文件内容中(用此规则筛选出有效数据)
 */
const FILE_TYPE_RULE = {
  'box-sizing':
    /(^box-sizing:.*)|(^(width|height):?(.*)(fit|min|max)-content);$/g,
};

/**
 * checkValInRule 方法: 校验值是否能命中规则
 * @param {*} value 匹配的值
 * @param {*} rule 匹配的规则
 * @returns {Boolean}
 */
function checkValInRule(value, rule) {
  let checkOk = false;
  if (!this.rule && !rule) return false;
  const myRule = this.rule || rule;
  try {
    checkOk = new RegExp(myRule).test(value);
  } catch (error) {
    console.log('error: 规则检验失败,请检查规则是否正确', error);
  }
  return checkOk;
}

// CHECK_RULE 配置: 用于校验属性值的规则，返回 true(通过) / false(不通过)
const CHECK_RULE = {
  prefixRule: {
    name: 'prefixRule',
    rule: /^-[a-zA-Z]/,
    checkValInRule,
  },
};

const colorDesc = {
  transparent: { descText: '透明颜色' },
  '#000000': { descText: '主题黑色' },
  black: { descText: '纯黑色' },
  '#333333': { descText: '淡黑色,常用于页面内容文字' },
  '#222222': { descText: '较深黑色' },
  '#2b2b2b': { descText: '较深黑色2' },
  '#2657f0': { descText: '蓝色1' },
  '#2355de': { descText: '蓝色2' },
  '#1f56ff': { descText: '蓝色3' },
  '#335ee8': { descText: '蓝色4' },
  '#4187ff': { descText: '淡蓝色' },
  '#8db7ff': { descText: '极浅蓝色' },
  '#ed4343': { descText: '主题红色,常用于突出显示一些重要信息' },
  red: { descText: '纯红色' },
  '#f03e3e': { descText: '红色' },
  '#fa9128': { descText: '主题橙色' },
  '#fc9c00': { descText: '橙色' },
  '#c66302': { descText: '深橙色' },
  '#ffd8a0': { descText: '淡橙色' },
  '#3cc947': { descText: '主题绿色,常用于绿色的指标数字绿色' },
  '#28ca2a': { descText: '绿色' },
  '#e5e5e6': { descText: '灰色,常用于边框线颜色' },
  '#666666': { descText: '正常灰色,常用于icon和提示文字' },
  '#999999': { descText: '深灰色1,常用于弱提示文字' },
  '#888888': { descText: '深灰色2,常用于弱提示文字' },
  '#979797': { descText: '深灰色3,常用于弱提示文字' },
  '#939393': { descText: '深灰色4' },
  '#8d8d8d': { descText: '深灰色5' },
  '#787c88': { descText: '深灰色6' },
  '#9d9d9d': { descText: '深灰色7' },
  '#cccccc': { descText: '极浅灰色,常用于不重要的信息' },
  '#a1a5b3': { descText: '较淡灰色' },
  '#8a97b8': { descText: '棕灰色' },
  '#dfe2eb': { descText: '淡灰色' },
  '#e5e5e5': { descText: '淡灰色2' },
  '#bfc0c2': { descText: '淡灰色3' },
  '#c2c4cc': { descText: '淡灰色4' },
  '#f2f5f3': { descText: '淡白色1' },
  '#e8edfb': { descText: '淡白色2' },
  '#8e9aba': { descText: '淡蓝灰色' },
  '#d4defc': { descText: '极淡蓝灰色' },
  '#576b95': { descText: '蓝灰色1' },
  '#4767bd': { descText: '蓝灰色2' },
  '#357ae0': { descText: '蓝灰色3' },
};

module.exports = {
  NO_DEAL_PROP,
  NO_DEAL_VALUE,
  SORT_ORDER_UNIT,
  SPECIAL_STR_RULE_FOR_VAL,
  RULE_FOR_X_VAL,
  FILE_TYPE_RULE,
  RULE_FOR_NUM_VAL,
  RULE_FOR_COLOR_VAL,
  CHECK_RULE,
  commonNumUnit,
  allValType,
  checkValInRule,
  colorDesc,
};
