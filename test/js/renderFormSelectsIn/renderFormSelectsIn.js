/**

 @Name：renderFormSelectsIn 特定场合下的多选渲染及事件处理封装
 @Author：岁月小偷
 @License：MIT

 */
layui.define(['table', 'formSelects'], function (exports) {
    "use strict";
    var $ = layui.$,
      layer = layui.layer,
      table = layui.table,
      formSelects = layui.formSelects,
      modelName = 'renderFormSelectsIn',
      version = '1.0.0';

    var pathTemp = layui.cache.modules[modelName] || ''; // 正常情况下不会出现未定义的情况
    var filePath = pathTemp.substr(0, pathTemp.lastIndexOf('/'));
    // css
    layui.link(filePath + '/' + modelName + '.css?v' + version);

    // 缓存通过layer弹出多选选项的layer index
    layer._index_formSelects = layer._index_formSelects || {};

    // 关闭所有优化过的多选下拉已打开的选项
    var closeAllFormSelectsOptions = function () {
      layui.each(layer._index_formSelects, function (id, index) {
        layer.close(index);
        delete layer._index_formSelects[id];
      });
    };

    // 优化多选在表格中的显示问题的相关处理
    var optimizeFormSelectsOptions = function (selectId, containerType) {
      var selectElem = $('select[xm-select="' + selectId + '"]');
      switch (containerType) {
        case 'layuiTable':
          var field = selectElem.attr('name') || selectElem.closest('td').data('field');
          var trIndex = selectElem.closest('tr').data('index');
          var tableId = selectElem.closest('.layui-table-view').attr('lay-id');

          // 多选选中监听
          formSelects.on(selectId, function (id, vals, val, isAdd, isDisabled) {
            table.cache[tableId][trIndex][field] = formSelects.value(id, 'valStr');
          }, true);
          break;
        default:
          break;
      }

      // 监听下拉框的打开
      formSelects.opened(selectId, function (id) {
        // 监听所有的多选select
        var elemTemp = $('select[xm-select="' + id + '"]').next();
        // 监听到如果实在表格的layui表格里面的
        var offsetTemp = elemTemp.get(0).getBoundingClientRect();
        var domTemp = elemTemp.clone(true);
        // 关闭所有优化过的多选下拉已打开的选项
        closeAllFormSelectsOptions();

        layer._index_formSelects[id] = layer.open({
          type: 1,
          title: false,
          closeBtn: false,
          anim: -1,
          isOutAnim: false,
          fixed: false,
          area: elemTemp.outerWidth() + 'px',
          shade: 0,
          // shadeClose: true,
          offset: [offsetTemp.top + 'px', offsetTemp.left + 'px'],
          skin: 'layui-formSelects-layer',
          content: '',
          success: function (layero, index) {
            elemTemp.html('');
            layero.find('.layui-layer-content').append(domTemp);

            selectElem.parentsUntil('.layui-table-view, .layui-layer').one('scroll', function (event) {
              // 用window.top.layer去弹出的选项在其title所在的容器滚动的时候都关闭
              closeAllFormSelectsOptions();
            });
          },
          end: function () {
            // 将复制的节点替换回原来的节点（ie浏览器不生效）
            // domTemp.find('.xm-form-select').removeClass('xm-form-selected');
            // elemTemp.replaceWith(domTemp);

            // 重新渲染一下多选下拉
            formSelects.render(id, {init: formSelects.value(id, 'val')});
            optimizeFormSelectsOptions(id);
          }
        });
      });

      // 关闭监听
      formSelects.closed(selectId, function (id) {
        layer.close(layer._index_formSelects[id]);
        delete layer._index_formSelects[id];
      });
    };

    // 监听窗口resize，关闭弹出的多选下拉
    $(window).resize(function (event) {
      closeAllFormSelectsOptions();
    });

    var renderFormSelectsIn = function (elem, options, containerType) {
      options = options || {};
      layui.each(elem.find('[xm-select]'), function (index, item) {
        var elemCurr = $(item);
        var selectId = elemCurr.attr('xm-select');
        if (!selectId) {
          return;
        }
        var dataTemp = '';
        switch (containerType) {
          case 'layuiTable':
            var field = elemCurr.attr('name') || elemCurr.closest('td').data('field');
            var trIndex = elemCurr.closest('tr').data('index');
            var tableId = elemCurr.closest('.layui-table-view').attr('lay-id');
            dataTemp = table.cache[tableId][trIndex][field] || '';
            // 设置按钮
            // formSelects.btns(null, ['select', 'remove', 'skin'], {show: 'icon', space: '10px'});
            break;
          case 'layer':

            break;
          default:
            break;
        }
        // 初始渲染
        formSelects.render(selectId, $.extend(true, {}, options, {init: dataTemp.split(',')}));
        // 调用优化的多选在表格中显示问题的方法
        optimizeFormSelectsOptions(selectId, containerType);
      });
    };

    renderFormSelectsIn.version = version;

    exports(modelName, renderFormSelectsIn);
  });
