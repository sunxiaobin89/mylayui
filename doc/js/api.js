/**

 @Name：api 文档
 @Author：岁月小偷
 @License：MIT

 */


layui.define(['element', 'code', 'layer', 'form'], function (exports) {
  "use strict";

  var $ = layui.$,
    element = layui.element,
    form = layui.form;

  var router = layui.router();
  if (router.path.length) {
    form.render($('#api_version').val(router.path[0]));
  }
  var version = $('#api_version').val();

  layui.link('css/global.css?v' + version, 'api_global');
  layui.link('css/main.css?v' + version, 'api_main');

  $('[lay-filter="api_header"]').load('views/menu.html', function () {
    element.render('nav', 'api_header');
  });

  $('[lay-filter="api_menu_side"]').load('views/'+version+'/menuSide.html', function (ret, msg, xhr) {
    var activeItem = $(this).find('a[mylayui-href="'+(router.path.length ? router.path[router.path.length-1] : 'main')+'"]');
    activeItem = activeItem.length ? activeItem : $(this).find('a[mylayui-href="main"]');
    activeItem.first().click();
  });


  // $('[lay-filter="api_menu_side"]').on('click', 'a', function (event) {
  //   var elemA = $(this);
  //   var href = elemA.attr('mylayui-href');
  //   if (!href) {
  //     return;
  //   }
  //   $('#app_api').load('views/modules/' + href + '.html', function (ret, msg, xhr) {
  //     if (xhr.status === 404) {
  //       layer.alert('页面开发中');
  //       return;
  //     }
  //     document.location.hash = '#/modules/' + href;
  //     elemA.parent('li').addClass('layui-this').siblings('li').removeClass('layui-this');
  //   });
  //
  //   // layer.msg('开发中', {anim: 6});
  // });

  $(document).on('click', '*[mylayui-href]', function (event) {
    var elemA = $(this);
    var href = elemA.attr('mylayui-href');
    if (!href) {
      return;
    }
    $('#app_api').load('views/'+version+'/modules/' + href + '.html', function (ret, msg, xhr) {
      if (xhr.status === 404) {
        layer.alert('页面开发中');
        return;
      }
      document.location.hash = '#/'+version+'/modules/' + href;
      $('[lay-filter="api_menu_side"]').find('li.layui-this').removeClass('layui-this');
      $('[lay-filter="api_menu_side"]').find('a[mylayui-href="'+href+'"]').parent('li').addClass('layui-this');
      // elemA.parent('li').addClass('layui-this').siblings('li').removeClass('layui-this');
    });
  }).on('click', '*[doc-href]', function (event) {
    var elemA = $(this);
    var hrefTemp = elemA.attr('doc-href'), href = elemA.attr('href');
    if (!hrefTemp || href) {
      return;
    }
    elemA.attr('href', hrefTemp).click();
  });

  //
  $(document).on('click', '.site-tree-mobile', function (event) {
    layui.stope(event);
    $('body').addClass('site-mobile');
  }).on('click', function (event) {
    $('body').removeClass('site-mobile');
  });



  // 监听版本切换
  form.on('select(api_version)', function (obj) {
    document.location.hash = '#/' + obj.value;
    document.location.reload();
  });

  exports('api', {});
});
