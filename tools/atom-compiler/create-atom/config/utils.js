/* eslint-disable no-console */
const { SPECIAL_STR_RULE_FOR_VAL } = require('./config');

/**
 * 测试规则(单条)能否通过校验
 * @param {Object} reg 规则
 * @param {String} str 待校验的字符
 */
function testStrByRule(reg, str) {
  let checkOk = false; // 校验规则是否正确
  if (reg && str) {
    try {
      checkOk = new RegExp(reg).test(str);
    } catch (error) {
      console.log('error: 规则检验失败,请检查规则是否正确');
    }
  }
  return checkOk;
}

/**
 * 根据规则集(单条)进行匹配替换
 * @param {Object} rule 规则,格式为: {reg: reg规则, replace: 将匹配内容替换成此字符}
 * @param {String} str 待处理的字符
 */
function replaceByRule(rule = {}, str) {
  if (Object.keys(rule).length && rule.reg) {
    const { reg, replace } = rule;
    const ruleCheck = testStrByRule(reg, str); // 校验规则是否正确
    if (ruleCheck) {
      // 能够命中规则才转换
      str = str.replace(reg, replace);
    }
  }
  return str;
}
/**
 * 根据规则集(多条)进行匹配替换
 * @param {Array} ruleData 规则集,格式示例: [{reg: reg规则, replace: 将匹配内容替换成此字符},...]
 * @param {String} str 待处理的字符
 */
function replaceByRules(ruleData, str) {
  if (Array.isArray(ruleData)) {
    ruleData.forEach((rule) => {
      str = replaceByRule(rule, str);
    });
  } else {
    console.error('请检查');
  }
  return str;
}

/**
 * 替换属性值字符中的特殊符号,如: 括号、空格、逗号和小数点等
 * @param {String} str 待处理的字符
 * @param {Array} rules 规则集,格式示例: [{reg: reg规则, replace: 将匹配内容替换成此字符},...]
 */
// 默认基于 RULE_FOR_SPECIAL_STR 替换字符里面的特殊符号:
function replaceSpecialStr(str, rules = SPECIAL_STR_RULE_FOR_VAL) {
  if (str || str == '0') {
    if (Array.isArray(rules)) {
      rules.forEach((rule) => {
        str = replaceByRule(rule, str);
      });
    }
  }
  return str;
}

module.exports = {
  testStrByRule,
  replaceByRule,
  replaceByRules,
  replaceSpecialStr,
};
