const {
  RULE_FOR_NUM_VAL,
  RULE_FOR_COLOR_VAL,
  commonNumUnit,
  colorDesc
} = require("./config");

// 这些子属性(childProp)数据需要合并到其所属属性(prop)的数据中去
const MERGE_PROP = [
  {
    prop: "width",
    childProp: ["min-width", "max-width"]
  },
  {
    prop: "height",
    childProp: ["min-height", "max-height"]
  },
  {
    prop: "position",
    childProp: ["top", "bottom", "left", "right"]
  },
  {
    prop: "font-size",
    childProp: ["font-weight"]
  },
  {
    prop: "flex",
    childProp: [
      "flex-direction",
      "flex-wrap",
      "flex-grow",
      "flex-shrink",
      "flex-basis",
      "flex-flow",
      "align-items",
      "align-self",
      "align-content",
      "justify-content",
      "justify-self",
      "justify-items"
    ]
  },
  {
    prop: "margin",
    childProp: ["margin-top", "margin-bottom", "margin-left", "margin-right"]
  },
  {
    prop: "padding",
    childProp: [
      "padding-top",
      "padding-bottom",
      "padding-left",
      "padding-right"
    ]
  },
  {
    prop: "opacity",
    childProp: ["visibility"]
  },
  {
    prop: "text-align",
    childProp: [
      "text-overflow",
      "vertical-align",
      "word-break",
      "word-wrap",
      "white-space",
      "letter-spacing",
      "text-decoration",
      "-webkit-line-clamp"
    ]
  },
  {
    prop: "transform",
    childProp: ["transform-origin"]
  },
  {
    prop: "overflow",
    childProp: ["overflow-x", "overflow-y", "overflow-wrap"]
  },
  {
    prop: "background",
    childProp: ["background-color"]
  },
  // 以下整合到other类型
  {
    prop: "pointer-events",
    childProp: ["background-size", "cursor", "user-select", "outline"]
  }
  // {
  //   prop: '',
  //   childProp: ['', ],
  // },
];

// 将一些特殊的属性值进行自定义命名，如： 将蓝色 color-#265cf0 自定义命名为 color-blue
const specialPropValRename = {
  "box-sizing": {
    "border-box": { renamePropVal: "border-box" },
    "content-box": { renamePropVal: "content-box" }
  },
  color: {
    ...colorDesc,
    "#ffffff": { renamePropVal: "c-white", descText: "主题白色" },
    "#265cf0": {
      renamePropVal: "c-blue",
      descText: "主题蓝色,常用于链接文字的颜色"
    }
  },
  background: {
    ...colorDesc,
    "#ffffff": { renamePropVal: "bg-white", descText: "主题白色" },
    "#265cf0": {
      renamePropVal: "bg-blue",
      descText: "主题蓝色,常用于链接文字的颜色"
    }
  },
  "background-color": {
    ...colorDesc,
    "#ffffff": { renamePropVal: "bg-c-white", descText: "主题白色" },
    "#265cf0": {
      renamePropVal: "bg-c-blue",
      descText: "主题蓝色,常用于链接文字的颜色"
    }
  },
  display: {
    none: {
      renamePropVal: "hidden",
      descText: "此元素自身及后代元素都会隐藏,同时脱离文档流,不占空间"
    },
    block: {
      renamePropVal: "block",
      descText: "此元素将显示为块级元素,此元素前后会带有换行符"
    },
    "inline-block": {
      renamePropVal: "inline-block",
      descText: "此元素会被显示为行内块元素"
    },
    inline: { renamePropVal: "inline", descText: "此元素会被显示为内联元素" },
    flex: {
      renamePropVal: "flex",
      descText: "此元素会被显示为弹性盒模型元素,适用弹性布局"
    },
    "inline-flex": {
      renamePropVal: "inline-flex",
      descText: "此元素会被显示为内联块级弹性盒模型元素"
    },
    "-webkit-box": { renamePropVal: "webkit-box" }
  },
  "flex-direction": {
    column: { renamePropVal: "flex-column" },
    "column-reverse": { renamePropVal: "flex-column-reverse" },
    row: { renamePropVal: "flex-row" },
    "row-reverse": { renamePropVal: "flex-row-reverse" }
  },
  "flex-wrap": {
    wrap: { renamePropVal: "flex-wrap" },
    nowrap: { renamePropVal: "flex-nowrap" }
  },
  "line-height": {
    inherit: { descText: "元素行高属性继承自父辈元素" }
  },
  position: {
    relative: { renamePropVal: "relative", descText: "相对定位" },
    absolute: { renamePropVal: "absolute", descText: "绝对定位" },
    fixed: { renamePropVal: "fixed", descText: "固定定位" },
    sticky: { renamePropVal: "sticky", descText: "粘性定位" }
  },
  opacity: {
    0: { descText: "透明度为0,使元素隐藏,不可见" },
    0.4: { descText: "透明度为0.4,常用于设置元素为禁用状态显示" },
    1: { descText: "透明度为1,可见" }
  },
  visibility: {
    hidden: { descText: "隐藏元素使其完全不可见,但元素仍占据其本来的空间" },
    visible: { descText: "使元素变成可见的" },
    unset: { descText: "取消设置的visibility属性值" }
  },
  "text-align": {
    left: { renamePropVal: "text-left" },
    right: { renamePropVal: "text-right" },
    center: { renamePropVal: "text-center" },
    justify: { renamePropVal: "text-justify" }
  },
  "text-overflow": {
    ellipsis: { renamePropVal: "ellipsis", descText: "文本超出时显示省略号" }
  },
  "vertical-align": {
    top: { renamePropVal: "vertical-top" },
    bottom: { renamePropVal: "vertical-bottom" },
    middle: { renamePropVal: "vertical-middle" },
    baseline: { renamePropVal: "vertical-baseline" }
  },
  "word-break": {
    "break-all": { renamePropVal: "word-break-all" },
    "break-word": { renamePropVal: "word-break-word" }
  },
  "text-decoration": {
    underline: { descText: "设置下划线" },
    none: { descText: "取消下划线" }
  },
  "-webkit-line-clamp": {
    unset: { descText: "取消省略属性" },
    1: { descText: "一行省略属性" },
    2: { descText: "两行省略属性" },
    3: { descText: "三行省略属性" },
    4: { descText: "四行省略属性" }
  },
  "pointer-events": {
    auto: { descText: "元素对指针事件做出反应，比如 :hover 和 click" },
    none: { descText: "使元素不对任何指针事件做出反应，比如 :hover 和 click" }
  }
};

// 各个样式的配置数据，针对单个属性的数据进行二次处理和分类
const STYLE_CONFIG = {
  width: {
    fileTypeName: "width",
    renameProp: "w", // 简称
    exclude: ["calc", "em"], // 该属性中需要排除包含这些内容的值(用于匹配，特殊字符需要添加\进行转义)
    valRules: RULE_FOR_NUM_VAL, // 属性值的匹配替换
    valUnitTypes: commonNumUnit, // 数值单位的通用类型,基于此进行分类
    needSort: true, // 是否需要将属性值进行排序
    unit: "rpx", // 基础单位
    toOtherFileType: ["box-sizing"] // 除了自身类型的文件，部分属性值额外还可能导出到哪个类型的文件中(需经过FILE_TYPE_RULE规则的校验才进行添加，无规则时直接添加)
  },
  "min-width": {
    fileTypeName: "minWidth",
    renameProp: "min-w",
    exclude: ["calc", "em"],
    valRules: RULE_FOR_NUM_VAL,
    valUnitTypes: commonNumUnit,
    needSort: true,
    unit: "rpx"
  },
  "max-width": {
    fileTypeName: "maxWidth",
    renameProp: "max-w",
    exclude: ["calc", "em"],
    valRules: RULE_FOR_NUM_VAL,
    valUnitTypes: commonNumUnit,
    needSort: true,
    unit: "rpx"
  },
  height: {
    fileTypeName: "height",
    renameProp: "h",
    exclude: ["calc", "em"],
    valRules: RULE_FOR_NUM_VAL,
    valUnitTypes: commonNumUnit,
    needSort: true,
    unit: "rpx",
    toOtherFileType: ["box-sizing"] // 部分属性值会被导出到哪个类型的文件中(需经过FILE_TYPE_RULE规则的校验才进行添加，无规则时直接添加)
  },
  "min-height": {
    fileTypeName: "minHeight",
    renameProp: "min-h",
    exclude: ["calc", "em"],
    valRules: RULE_FOR_NUM_VAL,
    valUnitTypes: commonNumUnit,
    needSort: true,
    unit: "rpx"
  },
  "max-height": {
    fileTypeName: "maxHeight",
    renameProp: "max-h",
    exclude: ["calc", "em"],
    valRules: RULE_FOR_NUM_VAL,
    valUnitTypes: commonNumUnit,
    needSort: true,
    unit: "rpx"
  },
  position: {
    fileTypeName: "position",
    someRenameVal: specialPropValRename.position
  },
  top: {
    fileTypeName: "top",
    renameProp: "t",
    exclude: ["calc", "em"],
    valRules: RULE_FOR_NUM_VAL,
    valUnitTypes: commonNumUnit,
    needSort: true,
    unit: "rpx"
  },
  bottom: {
    fileTypeName: "bottom",
    renameProp: "b",
    exclude: ["calc", "em"],
    valRules: RULE_FOR_NUM_VAL,
    valUnitTypes: commonNumUnit,
    needSort: true,
    unit: "rpx"
  },
  left: {
    fileTypeName: "left",
    renameProp: "l",
    exclude: ["calc", "em"],
    valRules: RULE_FOR_NUM_VAL,
    valUnitTypes: commonNumUnit,
    needSort: true,
    unit: "rpx"
  },
  right: {
    fileTypeName: "right",
    renameProp: "r",
    exclude: ["calc", "em"],
    valRules: RULE_FOR_NUM_VAL,
    valUnitTypes: commonNumUnit,
    needSort: true,
    unit: "rpx"
  },
  "font-size": {
    fileTypeName: "fontSize",
    renameProp: "font",
    exclude: ["em", "rrpx"],
    valRules: RULE_FOR_NUM_VAL,
    needSort: true,
    unit: "rpx"
  },
  "font-weight": {
    fileTypeName: "fontWeight",
    renameProp: "font-w",
    needSort: true,
    someRenameVal: specialPropValRename["font-weight"]
  },
  "box-sizing": {
    fileTypeName: "boxSizing",
    someRenameVal: specialPropValRename["box-sizing"]
  },
  "z-index": {
    fileTypeName: "zIndex",
    needSort: true
  },
  "border-radius": {
    fileTypeName: "borderRadius",
    renameProp: "radius",
    exclude: ["calc", "/"],
    valRules: RULE_FOR_NUM_VAL,
    valUnitTypes: commonNumUnit,
    needSort: true,
    unit: "rpx"
  },
  color: {
    fileTypeName: "color",
    renameProp: "c",
    exclude: ["rgba", "rgb"],
    valRules: RULE_FOR_COLOR_VAL,
    someRenameVal: specialPropValRename.color
  },
  background: {
    fileTypeName: "background",
    renameProp: "bg",
    exclude: ["rgba", "rgb", "url", "var"],
    valRules: RULE_FOR_COLOR_VAL,
    someRenameVal: specialPropValRename.background
  },
  "background-color": {
    fileTypeName: "backgroundColor",
    renameProp: "bg-c",
    exclude: ["rgba", "rgb", "var"],
    valRules: RULE_FOR_COLOR_VAL,
    someRenameVal: specialPropValRename["background-color"]
  },
  display: {
    fileTypeName: "display",
    someRenameVal: specialPropValRename.display
  },
  flex: {
    fileTypeName: "flex",
    valRules: RULE_FOR_NUM_VAL,
    valUnitTypes: commonNumUnit,
    needSort: true,
    unit: "rpx"
  },
  "flex-direction": {
    fileTypeName: "flexDirection",
    someRenameVal: specialPropValRename["flex-direction"]
  },
  "flex-wrap": {
    fileTypeName: "flexWrap",
    someRenameVal: specialPropValRename["flex-wrap"]
  },
  "flex-grow": {
    fileTypeName: "flexGrow"
  },
  "flex-shrink": {
    fileTypeName: "flexShrink"
  },
  "flex-basis": {
    fileTypeName: "flexBasis",
    exclude: ["calc"],
    valRules: RULE_FOR_NUM_VAL,
    valUnitTypes: commonNumUnit,
    needSort: true,
    unit: "rpx"
  },
  "flex-flow": {
    fileTypeName: "flexFlow"
  },
  "align-items": {
    fileTypeName: "alignItems"
  },
  "align-self": {
    fileTypeName: "alignSelf"
  },
  "align-content": {
    fileTypeName: "alignContent"
  },
  "justify-content": {
    fileTypeName: "justifyContent"
  },
  "justify-self": {
    fileTypeName: "justifySelf"
  },
  "justify-items": {
    fileTypeName: "justifyItems"
  },
  "line-height": {
    fileTypeName: "lineHeight",
    exclude: ["calc", "em"],
    valRules: RULE_FOR_NUM_VAL,
    valUnitTypes: commonNumUnit,
    needSort: true,
    unit: "rpx",
    valHasX: true // 值中存在为倍数的情况，如 line-heigh: 2; 转为 line-height-2x
  },
  margin: {
    fileTypeName: "margin",
    renameProp: "m",
    exclude: ["calc", "em", "constant", "env"],
    valRules: RULE_FOR_NUM_VAL,
    valUnitTypes: commonNumUnit,
    needSort: true,
    unit: "rpx"
  },
  "margin-top": {
    fileTypeName: "marginTop",
    renameProp: "mt",
    exclude: ["calc", "em", "constant", "env"],
    valRules: RULE_FOR_NUM_VAL,
    valUnitTypes: commonNumUnit,
    needSort: true,
    unit: "rpx"
  },
  "margin-bottom": {
    fileTypeName: "marginBottom",
    renameProp: "mb",
    exclude: ["calc", "em", "constant", "env"],
    valRules: RULE_FOR_NUM_VAL,
    valUnitTypes: commonNumUnit,
    needSort: true,
    unit: "rpx"
  },
  "margin-left": {
    fileTypeName: "marginLeft",
    renameProp: "ml",
    exclude: ["calc", "em", "constant", "env"],
    valRules: RULE_FOR_NUM_VAL,
    valUnitTypes: commonNumUnit,
    needSort: true,
    unit: "rpx"
  },
  "margin-right": {
    fileTypeName: "marginRight",
    renameProp: "mr",
    exclude: ["calc", "em", "constant", "env"],
    valRules: RULE_FOR_NUM_VAL,
    valUnitTypes: commonNumUnit,
    needSort: true,
    unit: "rpx"
  },
  padding: {
    fileTypeName: "padding",
    renameProp: "p",
    exclude: ["calc", "em", "constant", "env"],
    valRules: RULE_FOR_NUM_VAL,
    valUnitTypes: commonNumUnit,
    needSort: true,
    unit: "rpx"
  },
  "padding-top": {
    fileTypeName: "paddingTop",
    renameProp: "pt",
    exclude: ["calc", "em", "constant", "env"],
    valRules: RULE_FOR_NUM_VAL,
    valUnitTypes: commonNumUnit,
    needSort: true,
    unit: "rpx"
  },
  "padding-bottom": {
    fileTypeName: "paddingBottom",
    renameProp: "pb",
    exclude: ["calc", "em", "constant", "env"],
    valRules: RULE_FOR_NUM_VAL,
    valUnitTypes: commonNumUnit,
    needSort: true,
    unit: "rpx"
  },
  "padding-left": {
    fileTypeName: "paddingLeft",
    renameProp: "pl",
    exclude: ["calc", "em", "constant", "env"],
    valRules: RULE_FOR_NUM_VAL,
    valUnitTypes: commonNumUnit,
    needSort: true,
    unit: "rpx"
  },
  "padding-right": {
    fileTypeName: "paddingRight",
    renameProp: "pr",
    exclude: ["calc", "em", "constant", "env"],
    valRules: RULE_FOR_NUM_VAL,
    valUnitTypes: commonNumUnit,
    needSort: true,
    unit: "rpx"
  },
  overflow: {
    fileTypeName: "overflow"
  },
  "overflow-x": {
    fileTypeName: "overflowX"
  },
  "overflow-y": {
    fileTypeName: "overflowY"
  },
  "overflow-wrap": {
    fileTypeName: "overflowWrap"
  },
  // 下面的 visibility 集合到为 show 的文件类型中
  opacity: {
    fileTypeName: "show",
    needSort: true,
    someRenameVal: specialPropValRename.opacity
  },
  visibility: {
    fileTypeName: "visibility",
    someRenameVal: specialPropValRename.visibility
  },
  // 下面所有字体排列相关的属性集合到为 textLayout 的文件类型中
  "text-align": {
    fileTypeName: "textLayout",
    someRenameVal: specialPropValRename["text-align"]
  },
  "text-overflow": {
    fileTypeName: "textOverflow",
    someRenameVal: specialPropValRename["text-overflow"]
  },
  "vertical-align": {
    fileTypeName: "verticalAlign",
    valRules: RULE_FOR_NUM_VAL,
    valUnitTypes: commonNumUnit,
    needSort: true,
    unit: "rpx",
    someRenameVal: specialPropValRename["vertical-align"]
  },
  "word-break": {
    fileTypeName: "wordBreak",
    someRenameVal: specialPropValRename["word-break"]
  },
  "word-wrap": {
    fileTypeName: "wordWrap"
  },
  "white-space": {
    fileTypeName: "whiteSpace"
  },
  "letter-spacing": {
    fileTypeName: "letterSpacing",
    valRules: RULE_FOR_NUM_VAL,
    valUnitTypes: commonNumUnit,
    needSort: true,
    unit: "rpx"
  },
  "text-decoration": {
    fileTypeName: "textDecoration",
    someRenameVal: specialPropValRename["text-decoration"]
  },
  "-webkit-line-clamp": {
    fileTypeName: "webkitLineClamp",
    needSort: true,
    someRenameVal: specialPropValRename["-webkit-line-clamp"]
  },
  transform: {
    fileTypeName: "transform",
    exclude: ["matrix"],
    valRules: RULE_FOR_NUM_VAL,
    valUnitTypes: commonNumUnit,
    needSort: true,
    unit: "rpx"
  },
  "transform-origin": {
    fileTypeName: "transformOrigin",
    valRules: RULE_FOR_NUM_VAL,
    valUnitTypes: commonNumUnit,
    needSort: true,
    unit: "rpx"
  },
  transition: {
    fileTypeName: "transition"
  },
  "pointer-events": {
    fileTypeName: "other",
    someRenameVal: specialPropValRename["pointer-events"]
  },
  "background-size": {
    fileTypeName: "backgroundSize",
    renameProp: "bg-size",
    valRules: RULE_FOR_NUM_VAL,
    valUnitTypes: commonNumUnit,
    needSort: true,
    unit: "rpx"
  },
  cursor: {
    fileTypeName: "cursor"
  },
  "user-select": {
    fileTypeName: "userSelect"
  },
  outline: {
    fileTypeName: "outline"
  }
};

// TODO 记录当前配置的属性与历史存在差异的地方(后续需要逐步替换用该命名方案)
const compareDiff = {
  "font-weight": {
    fileTypeName: "fontSize",
    desc: "历史的字体权重属性中，font-weight: normal等属性，被转换为 font-normal，与目前的 font-w-normal 不统一"
  },
  flex: {
    desc: "历史的flex属性中，rpx单位没有被转换掉，新版的已经通过配置中的规则转换掉了，如 flex-0-0-370rpx"
  },
  "align-self": {
    desc: "属性值为 flex-start 和 flex-end 时，历史是 align-self-start align-self-end，目前不进行缩写，因为存在为 align-self: end;等的属性"
  },
  "align-content": {
    desc: "同上"
  },
  "justify-content": {
    desc: "同上"
  },
  "line-hight": {
    desc: "历史的行高为 1到2这些倍数值，被定义为 line-height-1 / line-height-2，容易跟数值单位的行高混淆，最新的改为 line-height-1x 表示倍数"
  }
};

module.exports = {
  STYLE_CONFIG,
  MERGE_PROP,
  compareDiff
};
