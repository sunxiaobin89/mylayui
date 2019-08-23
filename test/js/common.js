/**

 @Name：testTablePlug tablePlug测试页面引用的组件
 @Author：岁月小偷
 @License：MIT

 */
layui.define(['util'], function (exports) {
  "use strict";

  var util = layui.util;

  util.fixbar({
    bar1: '&#xe68e;',
    click: function (type) {
      if (type === 'bar1') {
        location.href="../doc/api.html"
      }
    }
  });

  exports('common', {});
});
