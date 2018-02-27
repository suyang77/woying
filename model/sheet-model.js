//建立sheet表格
var AV = require('../utils/av-live-query-weapp-min');

class sheet extends AV.Object { }
// 需要向 SDK 注册这个 Class
AV.Object.register(sheet, "sheet");
module.exports = sheet
