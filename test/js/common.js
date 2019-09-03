/**

 @Name：mylayui 测试页面引用的组件
 @Author：岁月小偷
 @License：MIT

 */
layui.define(['util'], function (exports) {
  "use strict";

  var $ = layui.$;
  var util = layui.util;

  util.fixbar({
    bar1: '&#xe68e;',
    click: function (type) {
      if (type === 'bar1') {
        location.href="../doc/api.html"
      }
    }
  });

  if (!$('body').children('#fork').length) {
    $('body').children().first().before('<a href=\'https://gitee.com/sun_zoro/mylayui\' target="gitee_mylayui"\n' +
      '   style="position: absolute; right: 0;top:0;">\n' +
      '  <img src=\'https://gitee.com/sun_zoro/mylayui/widgets/widget_1.svg\' alt=\'Fork me on Gitee\'></img>\n' +
      '</a>');
  }

  exports('common', {});
});
