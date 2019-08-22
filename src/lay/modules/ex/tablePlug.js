/**

 @Name：tablePlug 表格拓展插件
 @Author：岁月小偷
 @License：MIT
 @version 1.0.0

 */
layui.define(['table'], function (exports) {
  "use strict";

  var version = '2.0.0';
  var modelName = 'tablePlug'; // 插件名称，支持自己定义，但是不建议
  var pathTemp = layui.cache.modules[modelName] || ''; // 正常情况下不会出现未定义的情况
  // var filePath = pathTemp.substr(0, pathTemp.lastIndexOf('/'));
  var filePath = pathTemp.substr(0, pathTemp.lastIndexOf('/'));
  // 引入tablePlug.css
  layui.addcss( 'modules/ex/tablePlug.css?v' + version);
  // 引入图标文件
  // layui.link(filePath + '/icon/iconfont.css?v' + version);

  var $ = layui.$
    , layer = layui.layer
    , form = layui.form
    , table = layui.table;

  // 异步地将独立功能《优化layui的select的选项设置》引入
  layui.use('optimizeSelectOption');

  var tableCheck = table.check;
  var getIns = table.getIns;


  // 异步地将独立功能《优化layui的select的选项设置》引入
  // layui.extend({optimizeSelectOption: '{/}' + filePath + '/optimizeSelectOption/optimizeSelectOption'}).use('optimizeSelectOption');

  var layuiVersion = '2.5.4' // 基于2.5.4开发的
    // 检测是否满足智能重载的条件 检测是否修改了源码将构造出还有thisTable透漏出来
    // , checkSmartReloadCodition = (function () {
    //   if (layui.device().ie && parseInt(layui.device().ie) < 9) {
    //     console.warn('tablePlug插件暂时不支持ie9以下的ie浏览器，如果需要支持可自行调试，一般就是一些数组的方法ie8没有还有一个重要的就是window.parent这些支持不好，在getPosition的时候会死循环，如果有这方面相关的经验有处理方法请分享给俺，谢谢。')
    //   }
    //   if (table.Class) {
    //     // console.info('欢迎使用tablePlug插件，使用过程中有任何问题或者有什么建议都可以到码云上新建issues', 'https://gitee.com/sun_zoro/layuiTablePlug');
    //     return true;
    //   } else {
    //     console.error('如果要使用该插件（tablePlug），参照readme.md的说明修改layui的table模块的代码，目前该组件是基于layui-V' + layuiVersion, 'https://gitee.com/sun_zoro/layuiTablePlug');
    //     return false;
    //   }
    // })()
    , tablePlug = {
      version: version // tablePlug的版本后面提交的时候会更新也好知道使用的是不是同一个版本
    }
    , tableSpacialColType = ['numbers', 'checkbox', 'radio'] // 表格的特殊类型字段
    , LayuiTableColFilter = [
      '<span class="layui-table-filter layui-inline">',
      '<span class="layui-tablePlug-icon layui-tablePlug-icon-filter"></span>',
      '</span>'
    ]
    , filterLayerIndex // 保存打开字段过滤的layer的index
    , isArray = function (obj) {
      // 判断一个变量是不是数组
      return Object.prototype.toString.call(obj) === '[object Array]';
    }
    , ELEM_CLICK = 'layui-table-click'


  // 对table的全局config进行深拷贝继承
  tablePlug.set = function (config) {
    $.extend(true, table.config, config || {});
  };

  // 为啥要自己定义一个set去更新table.config而不用table.set？
  // 因为table.set实际是非深拷贝，然后我这里期待的是一个可以根据需要后面根据开发者需要去丰富pageLanguageText的内容的而不是set的时候需要把plug里面写的初始的也全部写上
  tablePlug.set({
    pageLanguageText: {
      // 自定义table的page组件中的多语言支持，实际这个完全可以自己定义，想要显示的文字，但是建议实用为主，真的需要再去定义
      en: {
        jumpTo: 'jump to', // 到第
        page: 'page', // 页
        go: 'go', // 确定
        total: 'total', // 共
        unit: '', // 条（单位，一般也可以不填）
        optionText: 'limit each page' // 条/页
      }
      // 定义中文简写的, (如果需要的话，建议不改，按照原来的就行)
      // 'zh-CN': {
      //
      // }
      // 比如定义中文繁体
      // 'zh-TW': {
      //
      // }
    }
  });

  // 获得某个节点的位置 offsetTop: 是否获得相对top window的位移
  function getPosition(elem, _window, offsetTop) {
    _window = _window || window;
    elem = elem.length ? elem.get(0) : elem;
    var offsetTemp = {};
    if (offsetTop && _window.top !== _window.self) {
      var frameElem = _window.frames.frameElement;
      offsetTemp = getPosition(frameElem, _window.parent, offsetTop);
    }
    var offset = elem.getBoundingClientRect();

    return {
      top: offset.top + (offsetTemp.top || 0),
      left: offset.left + (offsetTemp.left || 0)
    };
  }

  /* 2.5.4已经换成一个会动的加载图标了，所以这个逻辑可以去掉 目前它的位置是在body表格中间的还可以接受暂时不处理 */
  // 修改原始table的loading的逻辑
  // var loading = table.Class.prototype.loading;
  // table.Class.prototype.loading = function (hide) {
  //   var that = this;
  //   loading.call(that, hide);
  //   if (!hide && that.layInit) {
  //     that.layInit.remove();
  //     // 添加一个动画
  //     that.layInit.addClass('layui-anim layui-anim-rotate layui-anim-loop');
  //     if (!that.layMain.height()) {
  //       // 如果当前没有内容，添加一个空的div让它有显示的地方
  //       that.layBox.append($('<div class="' + LOADING + '" style="height: 56px;"></div>'));
  //     }
  //     var offsetHeight = 0;
  //     if (that.layMain.height() - that.layMain.prop('clientHeight') > 0) {
  //       // 如果出现滚动条，要减去滚动条的宽度
  //       offsetHeight = that.getScrollWidth();
  //     }
  //     var thHeightTemp = that.elem.hasClass('vertical') ? 0 : that.layHeader.height();
  //     that.layInit.height(that.layBox.height() - thHeightTemp - offsetHeight).css('marginTop', thHeightTemp + 'px');
  //     that.layBox.append(that.layInit);
  //   }
  // };

  // 目前新增了一个errorView处理异常或者没有数据的时候的显示问题，对应的initTable中的一些逻辑是否还有必要待定 todo
  // 初始化表格的内容
  table.Class.prototype.initTable = function () {
    var that = this;
    var options = that.config;

    that.layFixed.find('tbody').html('');
    that.layFixed.addClass(HIDE);
    that.layTotal.addClass(HIDE);
    that.layPage.addClass(HIDE);

    that.layMain.find('tbody').html('');
    that.layMain.find('.' + NONE).remove();

    that.layHeader.find('input[name="layTableCheckbox"]').prop('checked', false);
    that.renderForm('checkbox');
  };

  $(window).resize(function () {
    layer.close(filterLayerIndex);
  });

  // 字段过滤的相关功能
  var addFieldFilter = function () {
    var that = this;
    var tableId = that.key;
    var tableView = that.elem;

    table.eachCols(tableId, function (index, item) {
      if (item.type === 'normal') {
        var field = item.field;
        if (!field) {
          return;
        }
        var thElem = tableView.find('th[data-field="' + field + '"]');
        if (!item.filter) {
          thElem.find('.layui-table-filter').remove();
        } else {
          if (!thElem.find('.layui-table-filter').length) {
            $(LayuiTableColFilter.join('')).insertAfter(thElem.find('.layui-table-cell>span:not(.layui-inline)')).click(function (event) {
              layui.stope(event);
              var filterActive = tableView.find('.layui-table-filter.layui-active');
              if (filterActive.length && filterActive[0] !== this) {
                // 目前只支持单列过滤，多列过滤会存在一些难题，不好统一，干脆只支持单列过滤
                filterActive.removeClass('layui-active');
                that.layBody.find('tr.' + HIDE).removeClass(HIDE);
              }
              var mainElem = tableView.find('.layui-table-main');
              var nodes = [];
              layui.each(mainElem.find('td[data-field="' + field + '"]'), function (index, elem) {
                elem = $(elem);
                var textTemp = elem.text();
                if (nodes.indexOf(textTemp) === -1) {
                  nodes.push(textTemp);
                }
              });
              var layerWidth = 200;
              var layerHeight = 300;
              var btnElem = $(this);
              var btnPosition = getPosition(btnElem.find('.layui-tablePlug-icon-filter'));
              var topTemp = btnPosition.top;
              var leftTemp = btnPosition.left + btnElem.width();
              if (leftTemp + layerWidth > $(document).width()) {
                leftTemp -= (layerWidth + btnElem.width());
              }
              filterLayerIndex = layer.open({
                content: '',
                title: null,
                type: 1,
                // area: [layerWidth + 'px', layerHeight + 'px'],
                area: layerWidth + 'px',
                shade: 0.1,
                closeBtn: 0,
                fixed: false,
                resize: false,
                shadeClose: true,
                offset: [topTemp + 'px', leftTemp + 'px'],
                isOutAnim: false,
                maxmin: false,
                success: function (layero, index) {
                  layero.find('.layui-layer-content').html('<table id="layui-tablePlug-col-filter" lay-filter="layui-tablePlug-col-filter"></table>');
                  table.render({
                    elem: '#layui-tablePlug-col-filter',
                    data: nodes.map(function (value, index1, array) {
                      var nodeTemp = {
                        name: value
                      };
                      nodeTemp[table.config.checkName] = !that.layBody.find('tr.' + HIDE).filter(function (index, item) {
                        return $(item).find('td[data-field="' + field + '"]').text() === value;
                      }).length;
                      return nodeTemp;
                    }),
                    page: false,
                    skin: 'nob',
                    // id: 'layui-tablePlug-col-filter-layer',
                    even: false,
                    height: nodes.length > 8 ? layerHeight : null,
                    size: 'sm',
                    style: 'margin: 0;',

                    cols: [[
                      {type: 'checkbox', width: 40},
                      {
                        field: 'name',
                        title: '全选<span class="table-filter-opt-invert" onclick="layui.tablePlug && layui.tablePlug.tableFilterInvert(this);">反选</span>'
                      }
                    ]]
                  })
                },
                end: function () {
                  btnElem[that.layBody.find('tr.' + HIDE).length ? 'addClass' : 'removeClass']('layui-active');
                }
              });

              // 监听字段过滤的列选择的
              table.on('checkbox(layui-tablePlug-col-filter)', function (obj) {
                if (obj.type === 'all') {
                  that.layBody.find('tr')[obj.checked ? 'removeClass' : 'addClass'](HIDE);
                } else {
                  layui.each(that.layBody.first().find('tr td[data-field="' + field + '"]'), function (index, elem) {
                    elem = $(elem);
                    if (elem.text() === obj.data.name) {
                      var trElem = elem.parent();
                      that.layBody.find('tr[data-index="' + trElem.data('index') + '"]')[obj.checked ? 'removeClass' : 'addClass'](HIDE);
                    }
                  });
                }
                // that.resize();
              });

            });
          } else {
            // thElem.find('.layui-table-filter')[that.layBody.find('tr.' + HIDE).length ? 'addClass' : 'removeClass']('layui-active');
            thElem.find('.layui-table-filter').removeClass('layui-active');
          }
        }
      }
    }, that.config.cols);
  };

  // 调整表格实例resize的逻辑如果表格是反转了需要重新更新一下反转的效果
  // var tableResize = table.Class.prototype.resize;
  // if (!tableResize.modifiedByTablePlug) {
  //   table.Class.prototype.resize = function () {
  //     var that = this;
  //     var ret = tableResize.call(that);
  //     that.config.reversal === true && that.reverse();
  //     return ret;
  //   };
  //   table.Class.prototype.resize.modifiedByTablePlug = true;
  // }

  // // 监听所有的表格中的type:'checkbox'注意不要在自己的代码里面也写这个同名的监听，不然会被覆盖，
  // table.on('checkbox', function (obj) {
  //
  //   var tableView = $(this).closest('.layui-table-view');
  //   // lay-id是2.4.4版本新增的绑定到节点上的当前table实例的id,经过plug的改造render将旧版本把这个id也绑定到视图的div上了。
  //   var tableId = tableView.attr('lay-id');
  //   var config = getConfig(tableId);
  //   if (tableCheck.check(tableId)) {
  //     var _checked = obj.checked;
  //     var _data = obj.data;
  //     var _type = obj.type;
  //
  //     var primaryKey = getPrimaryKey(config);
  //
  //     if (_type === 'one') {
  //       updateCheckStatus(tableId, _data[primaryKey], _checked);
  //     } else if (_type === 'all') {
  //       // 全选或者取消全不选
  //       var renderFlag = false;
  //       layui.each(layui.table.cache[tableId], function (index, data) {
  //         var disableFlag = updateCheckStatus(tableId, data[primaryKey], _checked);
  //         if (disableFlag === false) {
  //           renderFlag = true;
  //           // 因为原始的table操作了不可选的复选框需要纠正一下状态
  //           var checkedTemp = tableCheck.getChecked(tableId).indexOf(data[primaryKey]) !== -1;
  //           tableView.find('.layui-table-body')
  //             .find('tr[data-index="' + index + '"]')
  //             .find('input[name="layTableCheckbox"]').prop('checked', checkedTemp);
  //           data[table.config.checkName] = checkedTemp;
  //         }
  //       });
  //       // renderFlag && getIns(tableId).renderForm('checkbox');
  //       renderFlag && form.render('checkbox', tableView.attr('lay-filter'));
  //     }
  //   }
  // });

  // // 单选状态记忆
  // table.on('radio()', function (obj) {
  //   var tableView = obj.tr.closest('.layui-table-view');
  //   var tableId = tableView.attr('lay-id');
  //   var config = getConfig(tableId);
  //   if (tableCheck.check(tableId)) {
  //     var _checked = obj.checked;
  //     var _data = obj.data;
  //     var primaryKey = getPrimaryKey(config);
  //     updateCheckStatus(tableId, _data[primaryKey], _checked, true);
  //   }
  // });

  // 让被美化的复选框支持原始节点的change事件
  form.on('checkbox', function (data) {
    $(data.elem).change();
  });

  // 表格筛选列的状态记录的封装
  var colFilterRecord = (function () {
    var recodeStoreName = 'tablePlug_col_filter_record';
    var getStoreType = function (recordType) {
      return recordType === 'local' ? 'data' : 'sessionData';
    };
    return {
      // 记录
      set: function (tableId, key, checked, recordType) {
        if (!tableId || !key) {
          return;
        }
        // 默认用sessionStore
        var storeType = getStoreType(recordType);
        var dataTemp = this.get(tableId, recordType);
        dataTemp[key] = !checked;
        layui[storeType](recodeStoreName, {
          key: tableId,
          value: dataTemp
        })
      },
      get: function (tableId, recordType) {
        return layui[getStoreType(recordType)](recodeStoreName)[tableId] || {};
      },
      clear: function (tableId) {
        $.each(['data', 'sessionData'], function (index, type) {
          layui[type](recodeStoreName, {
            key: tableId,
            remove: true
          });
        });
      }
    };
  })();

  // // 监听表格筛选的点
  // $(document).on('change', 'input[lay-filter="LAY_TABLE_TOOL_COLS"]', function (event) {
  //   var elem = $(this);
  //   // var key = elem.data('key');
  //   var key = elem.attr('name');
  //   var tableView = elem.closest('.layui-table-view');
  //   var tableId = tableView.attr('lay-id');
  //   var config = getConfig(tableId);
  //   var filterRecord = config.colFilterRecord;
  //   if (filterRecord) {
  //     colFilterRecord.set(tableId, key, this.checked, filterRecord);
  //   } else {
  //     colFilterRecord.clear(tableId)
  //   }
  // });

  // // 缓存当前操作的是哪个表格的哪个tr的哪个td
  // $(document).off('mousedown', '.layui-table-grid-down')
  //   .on('mousedown', '.layui-table-grid-down', function (event) {
  //     // 记录操作的td的jquery对象
  //     table._tableTdCurr = $(this).closest('td');
  //   });

  // // 给弹出的详情里面的按钮添加监听级联的触发原始table的按钮的点击事件
  // $(document).off('click', '.layui-table-tips-main [lay-event]')
  //   .on('click', '.layui-table-tips-main [lay-event]', function (event) {
  //     var elem = $(this);
  //     var tableTrCurr = table._tableTdCurr;
  //     if (!tableTrCurr) {
  //       return;
  //     }
  //     var layerIndex = elem.closest('.layui-table-tips').attr('times');
  //     // 关闭当前的这个显示更多的tip
  //     layer.close(layerIndex);
  //     // 找到记录的当前操作的那个按钮
  //     table._tableTdCurr.find('[lay-event="' + elem.attr('lay-event') + '"]').first().click();
  //   });

  /*// 监听统一的toolbar一般用来处理通用的 todo 后续将逻辑转义到table.js里面去做
  table.on('toolbar()', function (obj) {
    var config = obj.config;
    var btnElem = $(this);
    var tableId = config.id;
    var tableView = config.elem.next();
    switch (obj.event) {
      case 'LAYTABLE_COLS':
        // 给筛选列添加全选还有反选的功能
        var panelElem = btnElem.find('.layui-table-tool-panel');
        var checkboxElem = panelElem.find('[lay-filter="LAY_TABLE_TOOL_COLS"]');
        var checkboxCheckedElem = panelElem.find('[lay-filter="LAY_TABLE_TOOL_COLS"]:checked');
        $('<li class="layui-form" lay-filter="LAY_TABLE_TOOL_COLS_FORM">' +
          '<input type="checkbox" lay-skin="primary" lay-filter="LAY_TABLE_TOOL_COLS_ALL" '
          + ((checkboxElem.length === checkboxCheckedElem.length) ? 'checked' : '') + ' title="全选">' +
          '<span class="LAY_TABLE_TOOL_COLS_Invert_Selection">反选</span></li>')
          .insertBefore(panelElem.find('li').first())
          .on('click', '.LAY_TABLE_TOOL_COLS_Invert_Selection', function (event) {
            layui.stope(event);
            // 反选逻辑
            panelElem.find('[lay-filter="LAY_TABLE_TOOL_COLS"]+').click();
          });
        form.render('checkbox', 'LAY_TABLE_TOOL_COLS_FORM');
        break;
    }
  });

  // 监听筛选列panel中的全选
  form.on('checkbox(LAY_TABLE_TOOL_COLS_ALL)', function (obj) {
    $(obj.elem).closest('ul')
      .find('[lay-filter="LAY_TABLE_TOOL_COLS"]' + (obj.elem.checked ? ':not(:checked)' : ':checked') + '+').click();
  });

  // 监听筛选列panel中的单个记录的change
  $(document).on('change', 'input[lay-filter="LAY_TABLE_TOOL_COLS"]', function (event) {
    var elemCurr = $(this);
    // 筛选列单个点击的时候同步全选的状态
    $('input[lay-filter="LAY_TABLE_TOOL_COLS_ALL"]')
      .prop('checked',
        elemCurr.prop('checked') ? (!$('input[lay-filter="LAY_TABLE_TOOL_COLS"]').not(':checked').length) : false);
    form.render('checkbox', 'LAY_TABLE_TOOL_COLS_FORM');
  });*/

  // // 阻止表格中lay-event的事件冒泡  直接在表格的事件中阻止了
  // $(document).on('click', '.layui-table-view tbody [lay-event],.layui-table-view tbody tr [name="layTableCheckbox"]+', function (event) {
  //   layui.stope(event);
  // });

  /*// 同步表格中是否固定列上的的全选状态， todo 检验必要性
  form.on('checkbox(layTableAllChoose)', function (obj) {
    var elem = $(obj.elem);
    var tableView = elem.closest('.' + ELEM_VIEW);
    form.render('checkbox',
      tableView.attr('lay-filter'),
      tableView.find('[lay-filter="layTableAllChoose"]' + (obj.elem.checked ? ':not(:checked)' : ':checked')).prop('checked', obj.elem.checked)
    );
  });

  // 同步表格中是否固定列上的的复选框状态，
  form.on('checkbox(layTableCheckbox)', function (obj) {
    var elem = $(obj.elem);
    var tableView = elem.closest('.' + ELEM_VIEW);
    var trElem = tableView.find('tr[data-index="' + elem.closest('tr').data('index') + '"]');
    form.render('checkbox',
      tableView.attr('lay-filter'),
      trElem.find('[lay-filter="layTableCheckbox"]' + (obj.elem.checked ? ':not(:checked)' : ':checked')).prop('checked', obj.elem.checked)
    );
  });*/

  // 将cache的数据重新渲染一下
  var renderData = function (activeIndex, sort) {
    var that = this;
    var resTemp = {};
    var options = that.config;
    var scrollTop = that.layMain.scrollTop();
    var scrollLeft = that.layMain.scrollLeft();

    activeIndex = activeIndex >= 0 ? activeIndex : that.layBody.find('tr.' + ELEM_CLICK).data('index');
    resTemp[options.response.statusName] = options.response.statusCode;
    resTemp[options.response.msgName] = '数据更新';
    resTemp[options.response.dataName] = table.cache[options.id];
    resTemp[options.response.countName] = that.count || (options.page ? options.page.count : options.data.length);
    if (sort) {
      // 如果是移动了数据，会取消当前的排序规则，以当前的顺序为准进行调整，如果还需要排序
      // delete that.sortKey;
      that.layHeader.find('.layui-table-sort[lay-sort]').attr('lay-sort', '');
    }
    that.renderData(resTemp, that.page, resTemp[options.response.countName], sort);

    // 滚动到之前的位置
    that.layBody.scrollTop(scrollTop);
    that.layMain.scrollLeft(scrollLeft);

    // 执行done回调保证跟初始化一样
    typeof options.done === 'function' && options.done(resTemp, that.page, resTemp[options.response.countName]);

    activeIndex >= 0 && setTimeout(function () {
      that.setThisRowChecked(activeIndex);
    }, 0);

    return that;
  };

  // 表格记录顺序调整
  var move = function (tableId, from, to) {
    var that = this;
    if ((!from && from !== 0) || (!to && to !== 0) || from < 0 || to < 0 || from === to) {
      return that;
    }
    var tableObj = getIns(tableId);
    if (tableObj) {
      var options = tableObj.config;
      var dataTemp = table.cache[tableId];
      if (!dataTemp || !dataTemp[from] || !dataTemp[to]) {
        // 没有找到对应的数据
        return that;
      }
      dataTemp.splice(to, 0, dataTemp.splice(from, 1)[0]);

      renderData.call(tableObj, to, true);
    }
    return that;
  };

  // 更新表格的数据
  var update = function (tableId, dataIndex, data) {
    var that = this;

    if (!tableId) {
      console.warn('tableId不能为空');
      return that;
    }

    if (dataIndex && (typeof dataIndex === 'object' || isArray(dataIndex))) {
      // 第二个参数如果是要修改的数据的话
      data = dataIndex;
      dataIndex = '';
    }
    if (dataIndex === null || isNaN(dataIndex)) {
      // 如果dataIndex不是数值就作废
      dataIndex = '';
    }

    if (data && (typeof data !== 'object' && !isArray(data))) {
      // 存在data，但是格式不对
      console.warn('data格式必须是对象或者数组');
      return that;
    }

    var tableObj = getIns(tableId);
    if (tableObj) {
      var dataTemp = table.cache[tableId];
      var options = tableObj.config;
      if (!data) {
        // 没有传data默认为重新渲染一下cache里面的数据
        renderData.call(tableObj);
        return that;
      }

      if (isArray(data)) {
        // 如果是一次性更新多条记录
        dataIndex = '';
      }
      if (dataIndex !== '') {
        // 更新指定的某一条记录
        $.extend(true, dataTemp[dataIndex], data);
      } else {
        if (!isArray(data)) {
          data = [data];
        }
        if (!options.primaryKey) {
          // 没有设置主键的表格按照顺序update进去
          $.extend(true, dataTemp, data);
        } else {
          // 如果设置了主键按照主键一致更新进去
          // 遍历更新的数据
          layui.each(data, function (index, obj) {
            if (!obj[options.primaryKey]) {
              // 等价 continue
              return;
            }
            // 遍历缓存数据找到匹配的
            layui.each(dataTemp, function (indexTemp, objTemp) {
              if (objTemp[options.primaryKey] === obj[options.primaryKey]) {
                $.extend(true, dataTemp[indexTemp], obj);
                // 等价 break;
                return true;
              }
            });
          });
        }
      }
      renderData.call(tableObj);
    }
    return that;
  };

  // 新增记录
  var add = function (tableId, data) {
    var that = this;

    if (!tableId) {
      console.warn('tableId不能为空');
      return that;
    }

    if (!data) {
      console.warn('data不能为空');
      return that;
    }

    var tableObj = getIns(tableId);
    if (tableObj) {
      var options = tableObj.config;
      if (options.url) {
        // 如果是url模式的话直接reload会更加合理
        table.reload(tableId);
        return that;
      } else {
        if (isArray(options.data)) {
          if (typeof data !== 'object' && !isArray(data)) {
            console.warn('data必须是对象或者数组');
            return that;
          }
          // data 模式
          if (!isArray(data)) {
            data = [data];
          }
          var primaryKey = table.getPrimaryKey(options);
          layui.each(data, function (index, _data) {
            if (primaryKey) {
              // 如果有设置主键
              if (!_data[primaryKey]) {
                // 缺少主键的记录,临时生成一个，一般来说不建议缺少主键的值，这个add的功能常用在请求接口之后返回新增的数据了希望添加到data中
                // 如果新增走的不是先请求接口的建议还是用addTemp添加临时数据的形式
                _data[primaryKey] = 'idTemp_' + new Date().getTime() + '_' + Math.round(Math.random() * 1000000)
              }
            }
            options.data.push(_data)
          });
          table.reload(tableId);
        }
        return that;
      }
    }
  };

  // 删除记录
  var del = function (tableId, data) {
    var that = this;
    if (!tableId) {
      console.warn('tableId不能为空');
      return that;
    }
    if (!data && data !== 0) {
      console.warn('data不能为空');
      return that;
    }

    var tableObj = getIns(tableId);
    if (tableObj) {
      var options = tableObj.config;
      var optionsTemp = {};
      var countTemp = tableObj.count || (options.page ? options.page.count : options.data.length);
      var primaryKey = getPrimaryKey(options);
      if (options.url) {
        if (options.page) {
          if (isArray(data)) {
            countTemp -= data.length;
          } else {
            countTemp -= 1;
          }
          optionsTemp.page = {};
          var pagesTemp = Math.ceil(countTemp / options.page.limit);
          optionsTemp.page.curr = countTemp === 0 ? 1 : (tableObj.page > pagesTemp ? (pagesTemp || 1) : tableObj.page);
        }
        layui.each(data, function (index, item) {
          var idTemp = typeof item === 'object' ? item[primaryKey] : item;
          // 将选中的记录给去掉如果有的话
          tableCheck.update(tableId, idTemp, false);
        });
        // 如果是url模式的话直接reload会更加合理
        table.reload(tableId, optionsTemp);
        return that;
      } else {
        if (isArray(options.data)) {
          // data 模式
          if (typeof data !== 'object' && !isArray(data)) {
            if (isNaN(data)) {
              return that;
            }
            var nodeDel;
            // 删除某个下标
            if (options.page) {
              // 分页的
              if (data < options.page.limit) {
                nodeDel = options.data.splice((tableObj.page - 1) * options.page.limit + data, 1);
              }
            } else {
              nodeDel = options.data.splice(data, 1);
            }
            if (!nodeDel.length) {
              // 传过来的下标有问题，没有删除到数据
              return that;
            }
            countTemp -= 1;
            tableCheck.update(tableId, nodeDel[0][primaryKey], false);
          } else {
            if (!isArray(data)) {
              data = [data];
            }
            layui.each(data, function (index, _data) {
              if (primaryKey) {
                // 如果有设置主键
                if (_data && typeof _data === 'object' && !_data[primaryKey]) {
                  // 缺少主键的记录
                  return;
                }
              }
              layui.each(options.data, function (index, value) {
                // 传过来的data支持id集合和数据对象集合
                if (_data === value[primaryKey] || _data[primaryKey] === value[primaryKey]) {
                  options.data.splice(index, 1);
                  tableCheck.update(tableId, value[primaryKey], false);
                  countTemp -= 1;
                  return true;
                }
              });
            });
          }
          if (options.page) {
            optionsTemp.page = {};
            var pagesTemp = Math.ceil(countTemp / options.page.limit);
            optionsTemp.page.curr = countTemp === 0 ? 1 : (tableObj.page > pagesTemp ? (pagesTemp || 1) : tableObj.page);
          }
          table.reload(tableId, optionsTemp);
        }
        return that;
      }
    }
  };


  $.extend(tablePlug, {
    // CHECK_TYPE_ADDITIONAL: CHECK_TYPE_ADDITIONAL
    // , CHECK_TYPE_REMOVED: CHECK_TYPE_REMOVED
    // , CHECK_TYPE_ORIGINAL: CHECK_TYPE_ORIGINAL
    tableCheck: tableCheck
    , colFilterRecord: colFilterRecord  // 表格字段筛选记忆功能的封装
    , getConfig: table.getConfig  // 表格复选列的方法封装
    // , getIns: function (tableId) { // 获得某个表格render返回的实例的封装
    //   // return tableIns[tableId]; // todo
    // }
    , disabledCheck: table.disabledCheck
    // , dataRenderChecked: dataRenderChecked
    // , queryParams: queryParams // 表格查询模式的配置封装
    // , smartReload: smartReload // 全局设置一个是否开启智能重载模式
    // 反选
    // , tableFilterInvert: function (elem) {
    //   elem = $(elem);
    //   var tableView = elem.closest('.layui-table-view'),
    //     tableId = tableView.attr('lay-id');
    //   if (!tableId) {
    //     return;
    //   }
    //   var checkStatus = table.checkStatus(tableId);
    //   if (checkStatus.isAll) {
    //     // 以前全选了反选既为全不选，直接点击一下全选这个复选框就可以了
    //     tableView.find('[lay-filter="layTableAllChoose"]+').click();
    //   } else {
    //     if (!tableView.find('tbody [name="layTableCheckbox"]:checked').length) {
    //       // 如果一个都没有选中也是直接点击全选按钮
    //       tableView.find('[lay-filter="layTableAllChoose"]+').click();
    //     } else {
    //       layui.each(tableView.find('tbody [name="layTableCheckbox"]'), function (index, item) {
    //         $(item).next().click();
    //       });
    //     }
    //   }
    // }
    , getPosition: getPosition
    , move: move
    , moveUp: function (tableId, index) {
      return move.call(this, tableId, index, index - 1);
    }
    , moveDown: function (tableId, index) {
      return move.call(this, tableId, index, index + 1);
    }
    , update: update
    , addData: add
    , del: del
    , refresh: table.refresh
    , renderTotal: table.renderTotal
    // , enableTableFixedScroll: enableTableFixedScroll // 暂时不支持关掉让固定列能滚动的功能，如果反映强烈的话再提供
  });

  //外部接口
  exports(modelName, tablePlug);
});


