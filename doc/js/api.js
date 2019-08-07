/**

 @Name：api 文档
 @Author：岁月小偷
 @License：MIT

 */


layui.define(['element', 'code', 'layer', 'form'], function (exports) {
  "use strict";

  var $ = layui.$,
    element = layui.element;

  var version = new Date().getTime();

  layui.link('css/global.css?v' + version, 'api_global');
  layui.link('css/main.css?v' + version, 'api_main');

  var router = layui.router();

  $('[lay-filter="api_header"]').load('views/menu.html', function () {
    element.render('nav', 'api_header');
  });

  $('[lay-filter="api_menu_side"]').load('views/menuSide.html', function (ret, msg, xhr) {
    $(this).find('a[mylayui-href="'+(router.path.length ? router.path[router.path.length-1] : 'main')+'"]').first().click();
  });


  $('[lay-filter="api_menu_side"]').on('click', 'a', function (event) {
    var elemA = $(this);
    var href = elemA.attr('mylayui-href');
    if (!href) {
      return;
    }
    $('#app_api').load('views/modules/' + href + '.html', function (ret, msg, xhr) {
      if (xhr.status === 404) {
        layer.msg('找不到资源', {anim: 6});
        return;
      }
      document.location.hash = '#/modules/' + href;
      elemA.parent('li').addClass('layui-this').siblings('li').removeClass('layui-this');
    });

    // layer.msg('开发中', {anim: 6});
  });

  exports('api', {});
});