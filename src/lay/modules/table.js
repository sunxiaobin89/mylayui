/**

 @Name：layui.table 表格操作
 @Author：贤心
 @License：MIT
    
 */
 
layui.define(['laytpl', 'laypage', 'layer', 'form', 'util'], function(exports){
  "use strict";
  
  var $ = layui.$
  ,laytpl = layui.laytpl
  ,laypage = layui.laypage
  ,layer = layui.layer
  ,form = layui.form
  ,util = layui.util
  ,hint = layui.hint()
  ,device = layui.device()

  //外部接口
  ,table = {
    config: {
      checkName: 'LAY_CHECKED' //是否选中状态的字段名
      ,indexName: 'LAY_TABLE_INDEX' //下标索引名
    } //全局配置项
    ,cache: {} //数据缓存
    ,index: layui.table ? (layui.table.index + 10000) : 0
    
    //设置全局项
    ,set: function(options){
      var that = this;
      that.config = $.extend({}, that.config, options);
      return that;
    }
    
    //事件监听
    ,on: function(events, callback){
      return layui.onevent.call(this, MOD_NAME, events, callback);
    }

    //移除事件监听
    ,off: function(events, callback){
      return layui.offevent.call(this, MOD_NAME, events, callback);
    }
  }
  
  //操作当前实例
  ,thisTable = function(){
    var that = this
    ,options = that.config
    ,id = options.id || options.index;
    
    if(id){
      thisTable.that[id] = that; //记录当前实例对象
      thisTable.config[id] = options; //记录当前实例配置项
    }
    
    return {
      config: options
      ,reload: function(options){
        that.reload.call(that, options);
      }
      ,setColsWidth: function(){
        that.setColsWidth.call(that);
      }
      ,resize: function(){ //重置表格尺寸/结构
        that.resize.call(that);
      }
    }
  }
  
  //获取当前实例配置项
  ,getThisTableConfig = function(id){
    var config = thisTable.config[id];
    if(!config) hint.error('The ID option was not found in the table instance');
    return config || null;
  }
  
  //解析自定义模板数据
  ,parseTempData = function(item3, content, tplData, text){ //表头数据、原始内容、表体数据、是否只返回文本
    var str = item3.templet ? function(){
      return typeof item3.templet === 'function' 
        ? item3.templet(tplData)
      : laytpl($(item3.templet).html() || String(content)).render(tplData) 
    }() : content;
    return text ? $('<div>'+ str +'</div>').text() : str;
  }
  
  //字符常量
  ,MOD_NAME = 'table', ELEM = '.layui-table', THIS = 'layui-this', SHOW = 'layui-show', HIDE = 'layui-hide', DISABLED = 'layui-disabled', NONE = 'layui-none'
  
  ,ELEM_VIEW = 'layui-table-view', ELEM_TOOL = '.layui-table-tool', ELEM_BOX = '.layui-table-box', ELEM_INIT = '.layui-table-init', ELEM_HEADER = '.layui-table-header', ELEM_BODY = '.layui-table-body', ELEM_MAIN = '.layui-table-main', ELEM_FIXED = '.layui-table-fixed', ELEM_FIXL = '.layui-table-fixed-l', ELEM_FIXR = '.layui-table-fixed-r', ELEM_TOTAL = '.layui-table-total', ELEM_PAGE = '.layui-table-page', ELEM_SORT = '.layui-table-sort', ELEM_EDIT = 'layui-table-edit', ELEM_HOVER = 'layui-table-hover'
  
  //thead区域模板
  ,TPL_HEADER = function(options){
    var rowCols = '{{#if(item2.colspan){}} colspan="{{item2.colspan}}"{{#} if(item2.rowspan){}} rowspan="{{item2.rowspan}}"{{#}}}';
    
    options = options || {};
    return ['<table cellspacing="0" cellpadding="0" border="0" class="layui-table" '
      ,'{{# if(d.data.skin){ }}lay-skin="{{d.data.skin}}"{{# } }} {{# if(d.data.size){ }}lay-size="{{d.data.size}}"{{# } }} {{# if(d.data.even){ }}lay-even{{# } }}>'
      ,'<thead>'
      ,'{{# layui.each(d.data.cols, function(i1, item1){ }}'
        ,'<tr>'
        ,'{{# layui.each(item1, function(i2, item2){ }}'
          ,'{{# if(item2.fixed && item2.fixed !== "right"){ left = true; } }}'
          ,'{{# if(item2.fixed === "right"){ right = true; } }}'
          ,function(){
            if(options.fixed && options.fixed !== 'right'){
              return '{{# if(item2.fixed && item2.fixed !== "right"){ }}';
            }
            if(options.fixed === 'right'){
              return '{{# if(item2.fixed === "right"){ }}';
            }
            return '';
          }()
          ,'{{# var isSort = !(item2.colGroup) && item2.sort; }}'
          ,'<th data-field="{{ item2.field||i2 }}" data-key="{{d.index}}-{{i1}}-{{i2}}" {{# if( item2.parentKey){ }}data-parentkey="{{ item2.parentKey }}"{{# } }} {{# if(item2.minWidth){ }}data-minwidth="{{item2.minWidth}}"{{# } }} '+ rowCols +' {{# if(item2.unresize || item2.colGroup){ }}data-unresize="true"{{# } }} class="{{# if(item2.hide){ }}layui-hide{{# } }}{{# if(isSort){ }} layui-unselect{{# } }}{{# if(!item2.field){ }} layui-table-col-special{{# } }}">'
            ,'<div class="layui-table-cell laytable-cell-'
              ,'{{# if(item2.colGroup){ }}'
                ,'group'
              ,'{{# } else { }}'
                ,'{{d.index}}-{{i1}}-{{i2}}'
                ,'{{# if(item2.type !== "normal"){ }}'
                  ,' laytable-cell-{{ item2.type }}'
                ,'{{# } }}'
              ,'{{# } }}'
            ,'" {{#if(item2.align){}}align="{{item2.align}}"{{#}}}>'
              ,'{{# if(item2.type === "checkbox"){ }}' //复选框
                ,'<input type="checkbox" name="layTableCheckbox" lay-skin="primary" lay-filter="layTableAllChoose" {{# if(item2[d.data.checkName]){ }}checked{{# }; }}>'
              ,'{{# } else { }}'
                ,'<span>{{item2.title||""}}</span>'
                ,'{{# if(isSort){ }}'
                  ,'<span class="layui-table-sort layui-inline"><i class="layui-edge layui-table-sort-asc" title="升序"></i><i class="layui-edge layui-table-sort-desc" title="降序"></i></span>'
                ,'{{# } }}'
              ,'{{# } }}'
            ,'</div>'
          ,'</th>'
          ,(options.fixed ? '{{# }; }}' : '')
        ,'{{# }); }}'
        ,'</tr>'
      ,'{{# }); }}'
      ,'</thead>'
    ,'</table>'].join('');
  }
  
  //tbody区域模板
  ,TPL_BODY = ['<table cellspacing="0" cellpadding="0" border="0" class="layui-table" '
    ,'{{# if(d.data.skin){ }}lay-skin="{{d.data.skin}}"{{# } }} {{# if(d.data.size){ }}lay-size="{{d.data.size}}"{{# } }} {{# if(d.data.even){ }}lay-even{{# } }}>'
    ,'<tbody></tbody>'
  ,'</table>'].join('')
  
  //主模板
  ,TPL_MAIN = ['<div class="layui-form layui-border-box {{d.VIEW_CLASS}}" lay-filter="LAY-table-{{d.index}}" lay-id="{{ d.data.id }}" style="{{# if(d.data.width){ }}width:{{d.data.width}}px;{{# } }} {{# if(d.data.height){ }}height:{{d.data.height}}px;{{# } }}">'

    ,'{{# if(d.data.toolbar){ }}'
    ,'<div class="layui-table-tool">'
      ,'<div class="layui-table-tool-temp"></div>'
      ,'<div class="layui-table-tool-self"></div>'
    ,'</div>'
    ,'{{# } }}'
    
    ,'<div class="layui-table-box">'
      ,'{{# if(d.data.loading){ }}'
      ,'<div class="layui-table-init" style="background-color: #fff;">'
        ,'<i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop"></i>'
      ,'</div>'
      ,'{{# } }}'
      
      ,'{{# var left, right; }}'
      ,'<div class="layui-table-header">'
        ,TPL_HEADER()
      ,'</div>'
      ,'<div class="layui-table-body layui-table-main">'
        ,TPL_BODY
      ,'</div>'
      
      ,'{{# if(left){ }}'
      ,'<div class="layui-table-fixed layui-table-fixed-l">'
        ,'<div class="layui-table-header">'
          ,TPL_HEADER({fixed: true}) 
        ,'</div>'
        ,'<div class="layui-table-body">'
          ,TPL_BODY
        ,'</div>'      
      ,'</div>'
      ,'{{# }; }}'
      
      ,'{{# if(right){ }}'
      ,'<div class="layui-table-fixed layui-table-fixed-r">'
        ,'<div class="layui-table-header">'
          ,TPL_HEADER({fixed: 'right'})
          ,'<div class="layui-table-mend"></div>'
        ,'</div>'
        ,'<div class="layui-table-body">'
          ,TPL_BODY
        ,'</div>'
      ,'</div>'
      ,'{{# }; }}'
    ,'</div>'
    
    ,'{{# if(d.data.totalRow){ }}'
      ,'<div class="layui-table-total">'
        ,'<table cellspacing="0" cellpadding="0" border="0" class="layui-table" '
        ,'{{# if(d.data.skin){ }}lay-skin="{{d.data.skin}}"{{# } }} {{# if(d.data.size){ }}lay-size="{{d.data.size}}"{{# } }} {{# if(d.data.even){ }}lay-even{{# } }}>'
          ,'<tbody><tr><td><div class="layui-table-cell" style="visibility: hidden;">Total</div></td></tr></tbody>'
      , '</table>'
      ,'</div>'
    ,'{{# } }}'
    
    ,'{{# if(d.data.page){ }}'
    ,'<div class="layui-table-page">'
      ,'<div id="layui-table-page{{d.index}}"></div>'
    ,'</div>'
    ,'{{# } }}'
    
    ,'<style>'
    ,'{{# layui.each(d.data.cols, function(i1, item1){'
      ,'layui.each(item1, function(i2, item2){ }}'
        ,'.laytable-cell-{{d.index}}-{{i1}}-{{i2}}{ '
        ,'{{# if(item2.width){ }}'
          ,'width: {{item2.width}}px;'
        ,'{{# } }}'
        ,' }'
      ,'{{# });'
    ,'}); }}'
    ,'</style>'
  ,'</div>'].join('')
  
  ,_WIN = $(window)
  ,_DOC = $(document)
  
  //构造器
  ,Class = function(options){
    var that = this;
    that.index = ++table.index;
    that.config = $.extend({}, that.config, table.config, options);
    that.render();
  };

  // tablePlug相关 start

  //添加数组IndexOf方法
  if (!Array.prototype.indexOf){
    Array.prototype.indexOf = function(elt , from){
      return $.inArray(elt, this, from);
    };
  }
  //添加数组map方法
  if (!Array.prototype.map){
    Array.prototype.map = function(callback){
      return $.map(this, callback);
    };
  }

  var isArray = function (obj) {
    // 判断一个变量是不是数组
    return Object.prototype.toString.call(obj) === '[object Array]';
  },
    // 缓存table.render返回的实例对象
    tableIns = {},
    CHECK_TYPE_ADDITIONAL = 'additional',  // 新增的
    CHECK_TYPE_REMOVED = 'removed',  // 删除的
    CHECK_TYPE_ORIGINAL = 'original', // 原有的
    CHECK_TYPE_DISABLED = 'disabled', // 不可选的
    FIXED_SCROLL = 'layui-table-fixed-scroll',
    tableSpecialColType = ['numbers', 'checkbox', 'radio'], // 表格的特殊类型字段// 获得table的config
    getConfig = function (tableId) {
      return thisTable.config[tableId] || (tableIns[tableId] && tableIns[tableId].config) || {};
      // return getIns(tableId).config;
    },
    // 获得表格实例
    getIns = function (id) {
      return id ? thisTable.that[id] : thisTable.that;
    },
    // 关于表格复选状态记录的封装
    tableCheck = function () {
      var checked = {};
      return {
        // 检验是否可用，是否初始化过
        check: function (tableId) {
          return !!checked[tableId];
        },
        reset: function (tableId) {
          if (!checked[tableId]) {
            checked[tableId] = {};
            checked[tableId][CHECK_TYPE_ORIGINAL] = [];
            checked[tableId][CHECK_TYPE_ADDITIONAL] = [];
            checked[tableId][CHECK_TYPE_REMOVED] = [];
            checked[tableId][CHECK_TYPE_DISABLED] = [];
          } else {
            this.set(tableId, CHECK_TYPE_ADDITIONAL, []);    // 新增的
            this.set(tableId, CHECK_TYPE_REMOVED, []);       // 删除的
          }
        },
        init: function (tableId, data, primaryKey) {
          this.reset(tableId);
          var ids = [];
          if (data && data.length && typeof data[0] === 'object') {
            // 如果data是对象数组
            ids = addCacheData(tableId, data, primaryKey);
          } else {
            ids = data;
          }
          this.set(tableId, CHECK_TYPE_ORIGINAL, ids);
        },
        // 设置部分记录不可选
        disabled: function (tableId, data) {
          if (!checked[tableId]) {
            this.reset(tableId);
          }
          this.set(tableId, CHECK_TYPE_DISABLED, data);
        },
        checkDisabled: function (tableId, value) {
          return this.get(tableId, CHECK_TYPE_DISABLED).indexOf(value) !== -1;
        },
        // 获得当前选中的，不区分状态
        getChecked: function (tableId) {
          var delArr = this.get(tableId, CHECK_TYPE_REMOVED);

          var retTemp = this.get(tableId, CHECK_TYPE_ORIGINAL).concat(this.get(tableId, CHECK_TYPE_ADDITIONAL));
          var ret = [];
          layui.each(retTemp, function (index, data) {
            if (delArr.indexOf(data) === -1 && ret.indexOf(data) === -1) {
              ret.push(data);
            }
          });
          return ret;
        },
        get: function (tableId, type) {
          if (type === CHECK_TYPE_ADDITIONAL
            || type === CHECK_TYPE_REMOVED
            || type === CHECK_TYPE_ORIGINAL
            || type === CHECK_TYPE_DISABLED) {
            return checked[tableId] ? (checked[tableId][type] || []) : [];
          } else {
            return checked[tableId];
          }
        },
        set: function (tableId, type, data) {
          if (type !== CHECK_TYPE_ORIGINAL
            && type !== CHECK_TYPE_ADDITIONAL
            && type !== CHECK_TYPE_REMOVED
            && type !== CHECK_TYPE_DISABLED) {
            return;
          }
          checked[tableId][type] = (!data || !isArray(data)) ? [] : data;
        },
        update: function (tableId, id, checkedStatus, isRadio) {
          var _original = checked[tableId][CHECK_TYPE_ORIGINAL];
          var _additional = checked[tableId][CHECK_TYPE_ADDITIONAL];
          var _removed = checked[tableId][CHECK_TYPE_REMOVED];
          if (checkedStatus) {
            // 单选的时候不管什么时候都将新增的记录给去掉
            isRadio && _additional.splice(0, 1);
            // 勾选
            if (_original.indexOf(id) === -1) {
              // 不在原来的集合中
              if (_additional.indexOf(id) === -1) {
                _additional.push(id);
              }
            } else {
              // 在原来的集合中，意味着之前有去掉勾选的操作
              if (!isRadio && _removed.indexOf(id) !== -1) {
                _removed.splice(_removed.indexOf(id), 1);
              }
            }
          } else {
            // 取消勾选
            if (_original.indexOf(id) === -1) {
              // 不在原来的集合中，意味着以前曾经添加过
              if (_additional.indexOf(id) !== -1) {
                _additional.splice(_additional.indexOf(id), 1);
              }
            } else {
              // 在原来的集合中
              if (_removed.indexOf(id) === -1) {
                _removed.push(id);
              }
            }
          }
        }
      }
    }(),
    // 获得表格的主键字段配置信息
    getPrimaryKey = function (config) {
      if (typeof config === 'string') {
        config = getConfig(config);
      }
      if (config.primaryKey) {
        return config.primaryKey;
      }
      var keyStatus = config.checkStatus && config.checkStatus.primaryKey,
        keyDisabled = config.checkDisabled && config.checkDisabled.primaryKey;
      if (keyStatus && keyDisabled && keyStatus !== keyDisabled) {
        layui.hint().error('注意：当前表格(' + config.id + ')中checkStatus和checkDisabled都配置了primaryKey,但是他们不是同一个字段，必须保持表格配置中主键是唯一的，建议直接设置在顶层配置中就可以了！')
      }
      return keyDisabled || keyStatus || 'id';
    },
    // 针对表格中是否选中的数据处理
    dataRenderChecked = function (data, tableId, config) {
      if (!data || !tableId) {
        return;
      }
      config = config || getConfig(tableId);
      if (!config || !config.checkStatus) {
        return;
      }
      var nodeSelected = tableCheck.getChecked(tableId);
      for (var i = 0; i < data.length; i++) {
        data[i][table.config.checkName] = nodeSelected.indexOf(data[i][getPrimaryKey(config)]) !== -1;
      }
    },
    // 同步表格不可点击的checkbox
    disabledCheck = function (tableId, syncConfig) {
      // tableId 这个参数有可能传入table的id也可以直接传入table的实例
      // syncConfig是否需要同步config
      var config;
      if (typeof tableId === 'string') {
        config = getConfig(tableId);
      } else {
        config = tableId.config;
        tableId = config ? config.id : '';
      }

      if (!config) {
        return;
      }
      var tableView = config.elem.next();

      if (syncConfig) {
        config.checkDisabled = config.checkDisabled || {};
        config.checkDisabled.enabled = config.checkDisabled.enabled || true;
        config.checkDisabled.data = tableCheck.get(tableId, CHECK_TYPE_DISABLED) || [];
      }
      if (config.checkDisabled && config.checkDisabled.enabled) {
        layui.each(table.cache[tableId], function (index, data) {
          tableView.find('.layui-table-body')
            .find('tr[data-index="' + index + '"]')
            .find('input[name="layTableCheckbox"],[lay-type="layTableRadio"]')
            .prop('disabled', tableCheck.checkDisabled(tableId, data[getPrimaryKey(config)]));
        });
      } else {
        tableCheck.set(tableId, CHECK_TYPE_DISABLED, []);
      }

      tableView.find('input[lay-filter="layTableAllChoose"]').prop('checked', table.checkStatus(tableId).isAll);
      form.render('checkbox', tableView.attr('lay-filter'));
      form.render('radio', tableView.attr('lay-filter'));
    },
    // 同步表格不可点击的checkbox
    renderDone = function (scroll) {
      var that = this;
      var options = that.config;
      scroll && (that.layBody.scrollTop(0), that.layBody.scrollLeft(0));
      // 同步不可选的状态
      disabledCheck(that);
      // 添加筛选的功能
      // addFieldFilter.call(that);

      // if (!that.layMain.find('.' + NONE).length) {
      //   that.layTotal.removeClass(HIDE);
      //   that.layFixLeft.removeClass(HIDE);
      // }

      // 初始化临时数据区
      layui.each(that.tempData, function (index, data) {
        that.addTemp(index + 1, data, null, true);
      });

      // 同步反转状态
      // reverseTable(that.key, !!that.config.reversal);
      options.reversal === true && that.reverse();

      // 动态给checkbox添加lay-filter方便加form的监听处理
      that.layBody.find('input[type="checkbox"][name="layTableCheckbox"]').attr('lay-filter', 'layTableCheckbox');
      // 更新统计行的数据
      // renderTotal(that.config.id);
      renderTotal(that);

      // 将数据同步到缓存数据中
      addCacheData(options);
    },
    // 跨页面存储的缓存数据
    cacheData = {},
    // 将当前页的数据加入到缓存数据中
    addCacheData = function (tableId, data, primaryKey) {
      var options = typeof tableId === 'string' ? getConfig(tableId) : tableId;
      // 如果是url模式并且设置了复选框跨页状态存储就把当前的data给缓存起来
      primaryKey = primaryKey || getPrimaryKey(options);
      if (options.checkStatus && primaryKey) {
        cacheData[options.id] = cacheData[options.id] || {};
        layui.each(data || table.cache[options.id] || [], function (index, data) {
          cacheData[options.id][data[primaryKey]] = data;
        });
      }
      return (data || table.cache[options.id] || []).map(function (value) {
        return value[primaryKey]
      });
    },
    // 渲染统计行
    renderTotal = function (tableId, field, value) {
      var that = this;
      if (!tableId) {
        console.warn('tableId不能为空');
        return that;
      }
      var tableObj;
      if (typeof tableId === 'string') {
        tableObj = getIns(tableId);
      } else {
        tableObj = tableId;
        tableId = tableObj.key || (tableObj.config ? tableObj.config.id : '');
      }

      if (!tableObj || !tableId) {
        console.warn('找不到id为', tableId, '的实例');
        return that;
      }
      var options = tableObj.config;
      if (!options.totalRow) {
        return that;
      }

      var totalElem = tableObj.layTotal;
      if (field) {
        totalElem.find('td[data-field="' + field + '"] div.layui-table-cell').html(value || '');
        return that;
      }
      table.eachCols(tableId, function (index, item) {
        if (item.totalRow && !item.totalRowText && item.field) {
          var fieldTemp = item.field;
          var totalFormat = item.totalFormat || 'sum';
          var dataTemp = $.extend([], table.cache[tableId]);
          var res;
          if (typeof totalFormat === 'function') {
            res = totalFormat.call(options, tableId, dataTemp, fieldTemp);
          } else {
            res = 0;
            switch (totalFormat) {
              case 'sum':
                layui.each(dataTemp, function (index, data) {
                  res += parseFloat(data[fieldTemp]) || 0;
                });
                break;
            }
          }
          res && totalElem.find('td[data-field="' + fieldTemp + '"] div.layui-table-cell').html(res || '');
        }
      });
    },
    // 表格筛选列的状态记录的封装
    colFilterRecord = (function () {
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
    })(),
    queryParams = (function () {
      // 查询模式的白名单
      var params = ['url', 'method', 'where', 'contentType', 'headers', 'parseData', 'request', 'response', 'data', 'page', 'initSort', 'autoSort', 'reversal'];
      // 查询模式的黑名单
      var params_blacklist = ['id', 'elem', 'cols', 'width', 'height'];
      return {
        // 获得查询的属性
        getParams: function () {
          return $.extend(true, [], params);
        },
        getParamsBlacklist: function () {
          return $.extend(true, [], params_blacklist);
        },
        registerBlacklist: function () {
          // 将一些属性加入黑名单
          console.warn('registerBlacklist:不建议自己调用改方法将参数加入查询参数的黑名单，除非是在非常了解该功能的前提下');
          var that = this;
          layui.each(arguments, function (i, value) {
            if (isArray(value)) {
              that.registerBlacklist.apply(that, value);
            } else {
              if (typeof value === 'string' && params_blacklist.indexOf(value) === -1) {
                params_blacklist.push(value);
              }
            }
          });
        }
      }
    })(),
    updateCheckStatus = function (tableId, value, checked, isRadio) {
      // if (!tableCheck.checkDisabled(tableId, value)) {
      //   tableCheck.update(tableId, value, checked, isRadio);
      // } else {
      //   // 操作了不可选的
      //   return false;
      // }
    }

    ;

  // 对外提供添加临时数据的接口
  table.addTemp = function (id, data, callback) {
    var ins = getIns(id);
    if (typeof data === 'function') {
      callback = data;
      data = {};
    }
    ins && ins.addTemp(table.getTemp(id).numbers, (data && typeof data === 'object') ? data : {}, callback);
  };

  // 获得临时数据
  table.getTemp = function (id) {
    var data = table.cache[id] || [];
    var dataTemp = [], i = 1;
    for (; ; i++) {
      if (data[-i]) {
        if (isArray(data[-i])) {
          // 无效的数据
        } else {
          dataTemp.push(data[-i]);
        }
      } else {
        break;
      }
    }
    return {
      data: dataTemp,
      numbers: i
    }
  };

  // 清空临时数据
  table.cleanTemp = function (id, index) {
    var ins = getIns(id);
    var dataTemp = table.getTemp(id);
    var data = table.cache[id] || [];
    if (dataTemp.data.length) {
      var numbers = dataTemp.numbers;
      for (var i = 1; i < numbers; i++) {
        if (data[-i] && (index ? -i === index : true)) {
          data[-i] = [];
          if (index) {
            break;
          }
        }
      }
    }
    // 删除节点
    $('div.layui-table-view[lay-id="' + id + '"]').removeClass('has-data-temp-warn')
      .find('tr.layui-tablePlug-data-temp[data-index' + (index ? '="' + index + '"' : '') + ']').remove();
    table.resize(id);
    ins.layBody.scrollTop(ins.layBody[0].scrollHeight);
  };

  // 添加临时数据的dom方法
  Class.prototype.addTemp = function (numbers, data, callback, notScroll) {
    var that = this;
    var tds_fixed = [], tds_fixed_r = [], tds = [];
    var options = that.config, item1 = data || {};
    numbers = -numbers;
    if (that.layBody.find('tr[data-index="' + numbers + '"]').length) {
      // 已经存在
      return;
    }
    table.cache[that.key][numbers] = item1;
    that.eachCols(function (i3, item3) {
      var field = item3.field || i3
        , key = options.index + '-' + item3.key
        , content = item1[field];

      if (content === undefined || content === null) content = '';
      if (item3.colGroup) return;

      //td内容
      var td = ['<td data-field="' + field + '" data-key="' + key + '" ' + function () { //追加各种属性
        var attr = [];
        if (item3.type === 'normal' && item3.edit !== false) attr.push('data-edit="text"'); //是否允许单元格编辑
        if (item3.align) attr.push('align="' + item3.align + '"'); //对齐方式
        if (item3.templet) attr.push('data-content="' + content + '"'); //自定义模板
        // if (item3.toolbar) attr.push('data-off="true"'); //行工具列关闭单元格事件
        if (item3.event) attr.push('lay-event="' + item3.event + '"'); //自定义事件
        if (item3.style) attr.push('style="' + item3.style + '"'); //自定义样式
        if (item3.minWidth) attr.push('data-minwidth="' + item3.minWidth + '"'); //单元格最小宽度
        return attr.join(' ');
      }() + ' class="' + function () { //追加样式
        var classNames = [];
        if (item3.hide) classNames.push(HIDE); //插入隐藏列样式
        if (!item3.field) classNames.push('layui-table-col-special'); //插入特殊列样式
        return classNames.join(' ');
      }() + '">'
        , '<div class="layui-table-cell laytable-cell-' + function () { //返回对应的CSS类标识
          return item3.type === 'normal' ? key
            : (key + ' laytable-cell-' + item3.type);
        }() + '">' + function () {
          var tplData = $.extend(true, {
            LAY_INDEX: numbers
          }, item1);

          //渲染不同风格的列
          switch (item3.type) {
            case 'checkbox':
            case 'radio':
            case 'numbers':
              return '';
              break;
          }

          //解析工具列模板
          if (item3.toolbar) {
            return '';
          }
          // return item3.templet ? function () {
          //   return typeof item3.templet === 'function'
          //     ? item3.templet(tplData)
          //     : laytpl($(item3.templet).html() || String(content)).render(tplData)
          // }() : content;
          return parseTempData(item3, content, tplData);
        }()
        , '</div></td>'].join('');

      tds.push(td);
      if (item3.fixed && item3.fixed !== 'right') tds_fixed.push(td);
      if (item3.fixed === 'right') tds_fixed_r.push(td);
    });

    that.layMain.find('.' + NONE).remove();
    that.elem.removeClass('layui-table-none-overflow');
    // 追加到最后
    that.layMain.find('tbody').append('<tr class="layui-tablePlug-data-temp" data-index="' + numbers + '">' + tds.join('') + '</tr>');
    that.layFixLeft.removeClass(HIDE).find('tbody').append('<tr class="layui-tablePlug-data-temp" data-index="' + numbers + '">' + tds_fixed.join('') + '</tr>');
    that.layFixRight.find('tbody').append('<tr class="layui-tablePlug-data-temp" data-index="' + numbers + '">' + tds_fixed_r.join('') + '</tr>');
    that.renderForm();
    that.resize();
    // 滚动到底部
    notScroll || that.layBody.scrollTop(that.layBody[0].scrollHeight);

    that.layBody.find('tr.layui-tablePlug-data-temp[data-index="' + numbers + '"]')
      .find('td:first-child')
      .append('<div class="close_temp"></div>');

    that.layFixRight.find('.close_temp').remove();

    // 执行回调，传过去两个参数，第一个是当前的table的config,第二个是新增的这个临时的tr的jquery对象
    typeof callback === 'function' && callback.call(that.config, that.layBody.find('tr[data-index="' + numbers + '"]'));
  };

  // 监听临时数据中的删除按钮点击
  _DOC.on('click', '.layui-table-view tr.layui-table-hover.layui-tablePlug-data-temp div.close_temp', function (event) {
    layui.stope(event);
    var btnElem = $(this);
    var trElem = btnElem.closest('tr');
    var tableId = trElem.closest('.layui-table-view').attr('lay-id');
    table.cleanTemp(tableId, trElem.data('index'));
  });

  // 表格反转
  Class.prototype.reverse = function () {
    var that = this;
    var config = that.config;
    var isVertical = config.reversal;

    that.elem[isVertical ? 'addClass' : 'removeClass']('vertical');
    setTimeout(function () {
      that.layTotal.css({top: isVertical ? that.layTool.outerHeight() - 1 + 'px' : 0});
      that.layMain.css({
        marginLeft: isVertical ? that.layHeader.width() + 'px' : 0,
        marginRight: (isVertical && config.totalRow) ? that.layTotal.width() + 'px' : 0
      });
      isVertical || that.layHeader.scrollLeft(that.layMain.scrollLeft());
    }, 0);
    return that;
  };

  // 表格行列转换，如果没有传reversal, 默认就是按照当前的状态取反更新一下，如果有传入，则以传入的为准
  table.reverse = function (tableId, reversal, tableIns) {
    if (!tableId) {
      layui.each(getIns(), function (key, obj) {
        table.reverse(key, reversal, obj);
      });
    } else {
      var insTemp = tableIns || table.getIns(tableId);
      var config = insTemp.config;

      if (typeof reversal !== 'boolean') {
        // 如果不是true/false; 默认就是将当前的状态给重新渲染一下
        reversal = !config.reversal;
      }

      // 设置状态
      config.reversal = reversal;
      // 调用反转方法
      insTemp.reverse();
      // 处理360急速模式下出现的异常问题(临时处理方式)
      insTemp.resize();
    }
  };

  table.disabledCheck = function (tableId, data) {  // 同步表格中的某些不可点击的节点
    var that = this;
    tableCheck.disabled(tableId, data || []);
    disabledCheck(tableId, true);
  };

  // 给弹出的详情里面的按钮添加监听级联的触发原始table的按钮的点击事件
  _DOC.off('click', '.layui-table-tips-main [lay-event]')
    .on('click', '.layui-table-tips-main [lay-event]', function (event) {
      var elem = $(this);
      var tableTrCurr = table._tableTdCurr;
      if (!tableTrCurr) {
        return;
      }
      var layerIndex = elem.closest('.layui-table-tips').attr('times');
      // 关闭当前的这个显示更多的tip
      layer.close(layerIndex);
      // 找到记录的当前操作的那个按钮
      // table._tableTdCurr.find('[lay-event="' + elem.attr('lay-event') + '"]').first().click();
      table._tableTdCurr.find('[lay-event]:eq(' + elem.index() + ')').click();
    });


  // 是否让固定列支持鼠标滚动
  var enableTableFixedScroll = function (enabled) {
    enabled = !!enabled;

    _DOC.off('mouseenter', '.' + ELEM_VIEW + ' ' + ELEM_FIXR + ' ' + ELEM_BODY)
      .off('mouseleave', '.' + ELEM_VIEW + ' ' + ELEM_FIXR + ' ' + ELEM_BODY)
      .off('mouseenter', '.' + ELEM_VIEW + ' ' + ELEM_FIXL + ' ' + ELEM_BODY)
      .off('mouseleave', '.' + ELEM_VIEW + ' ' + ELEM_FIXL + ' ' + ELEM_BODY)
      .off('mouseenter', '.' + ELEM_VIEW + ' ' + ELEM_FIXED + ' ' + ELEM_HEADER);

    if (enabled) {
      // 给固定列添加一些鼠标的事件监听，用于支持固定列滚动
      _DOC.on('mouseenter', '.' + ELEM_VIEW + ' ' + ELEM_FIXR + ' ' + ELEM_BODY, function (event) {
        // 处理鼠标移入右侧
        var elem = $(this);
        var elemFixedR = elem.closest(ELEM_FIXR);
        if (elemFixedR.css('right') !== '-1px') {
          // 如果有滚动条的话
          elemFixedR.addClass(FIXED_SCROLL);
        } else {
          setTimeout(function () {
            if (elemFixedR.css('right') !== '-1px') {
              console.log('出现了一开始还没有打滚动条补丁的时候就触发的情况');
              elemFixedR.addClass(FIXED_SCROLL);
            }
          }, 50);
        }
      }).on('mouseleave', '.' + ELEM_VIEW + ' ' + ELEM_FIXR + ' ' + ELEM_BODY, function (event) {
        // 处理鼠标移出右侧
        $(this).closest(ELEM_FIXR).removeClass(FIXED_SCROLL);
      }).on('mouseenter', '.' + ELEM_VIEW + ' ' + ELEM_FIXL + ' ' + ELEM_BODY, function (event) {
        // 处理鼠标移入左侧
        var elem = $(this);
        var elemFixedL = elem.closest(ELEM_FIXL);
        elemFixedL.addClass(FIXED_SCROLL);
        var widthOut = elemFixedL.find(ELEM_HEADER).find('table').width();
        var widthIn = elemFixedL.find(ELEM_HEADER).width() + 1;
        elemFixedL.css({width: widthOut + 'px'}).find(ELEM_BODY).css({width: widthIn + 'px'});
      }).on('mouseleave', '.' + ELEM_VIEW + ' ' + ELEM_FIXL + ' ' + ELEM_BODY, function (event) {
        // 处理鼠标移出左侧
        $(this).css({width: 'auto'}).closest(ELEM_FIXL).css({width: 'auto'}).removeClass(FIXED_SCROLL);
      }).on('mouseenter', '.' + ELEM_VIEW + ' ' + ELEM_FIXED + ' ' + ELEM_HEADER, function (event) {
        var elem = $(this);
        elem.closest(ELEM_FIXED).removeClass(FIXED_SCROLL);
      });
    }
  };

  // 默认开启固定列滚动监听的支持
  enableTableFixedScroll(true);

  // 定时刷新某个表格
  var refresh = function (tableId, time) {
    var that = this;
    var timer = refresh.timer;
    if (tableId === false) {
      // 取消所有的定时刷新
      layui.each(timer, function (_id, _timer) {
        // clearInterval(_timer);
        refresh.clear(_id);
      });
      // refresh.timer = {};
      return that;
    }
    if (!tableId) {
      console.warn('tableId不能为空');
      return that;
    }
    var tableObj;
    if (typeof tableId === 'string') {
      tableObj = getIns(tableId);
    } else {
      tableObj = tableId;
    }
    if (!tableObj) {
      console.warn('找不到id为', tableId, '的实例');
      return that;
    }
    tableId = options.id;
    var options = tableObj.config;

    if (time === false) {
      // 清除当前表格的定时刷新
      // clearInterval(timer[tableId]);
      // delete timer[tableId];
      refresh.clear(tableId);
      return that;
    }

    if (!time && time !== 0) {
      // 单次刷新
      tableObj.pullData(tableObj.page, true);
      return that;
    }

    if (time === true || time < 50) {
      time = 50; // 默认最高频率为50毫秒一次
    }

    // clearInterval(timer[tableId]);
    refresh.clear(tableId);
    timer[tableId] = {
      time: time,
      index: setInterval(function () {
        if (!$(document).find(options.elem).length) {
          // 如果当前表格已经不存在
          refresh.call(that, tableId, false);
        } else {
          // tableObj.pullData(tableObj.page, true)
          refresh(tableId);
        }
      }, time)
    };

  };
  refresh.timer = {};
  refresh.clear = function (tableId) {
    if (refresh.timer[tableId]) {
      clearInterval(refresh.timer[tableId].index);
      var time = refresh.timer[tableId].time;
      delete refresh.timer[tableId];
      return time;
    }
  };
  refresh.reset = function (tableId, config) {
    refresh(config || tableId, refresh.clear(tableId));
  };
  table.refresh = refresh;

  table.renderTotal = renderTotal;
  table.getPrimaryKey = getPrimaryKey;
  table.getIns = getIns;
  table.getTableIns = function (tableId) {
    return tableIns[tableId];
  };
  table.check = tableCheck;

  // 暴露核心
  table.Class = Class;
  // table.thisTable = thisTable;

  // tablePlug相关 end


  //默认配置
  Class.prototype.config = {
    limit: 10 //每页显示的数量
    ,loading: true //请求数据时，是否显示loading
    ,cellMinWidth: 60 //所有单元格默认最小宽度
    ,defaultToolbar: ['filter', 'exports', 'print'] //工具栏右侧图标
    ,autoSort: true //是否前端自动排序。如果否，则需自主排序（通常为服务端处理好排序）
    ,text: {
      none: '无数据'
    }
  };

  //表格渲染 [mod]
  Class.prototype.render = function(){
    var that = this
    ,options = that.config;

    options.elem = $(options.elem);
    options.where = options.where || {};
    options.id = options.id || options.elem.attr('id') || that.index;

    //请求参数的自定义格式
    options.request = $.extend({
      pageName: 'page'
      ,limitName: 'limit'
    }, options.request)
    
    //响应数据的自定义格式
    options.response = $.extend({
      statusName: 'code'
      ,statusCode: 0
      ,msgName: 'msg'
      ,dataName: 'data'
      ,countName: 'count'
    }, options.response);
    
    //如果 page 传入 laypage 对象
    if(typeof options.page === 'object'){
      options.limit = options.page.limit || options.limit;
      options.limits = options.page.limits || options.limits;
      that.page = options.page.curr = options.page.curr || 1;
      delete options.page.elem;
      delete options.page.jump;
    }
    
    if(!options.elem[0]) return that;
    
    //高度铺满：full-差距值
    if(options.height && /^full-\d+$/.test(options.height)){
      that.fullHeightGap = options.height.split('-')[1];
      options.height = _WIN.height() - that.fullHeightGap;
    }
    
    //初始化一些参数
    that.setInit();
    
    //开始插入替代元素
    var othis = options.elem
    ,hasRender = othis.next('.' + ELEM_VIEW)
    
    //主容器
    ,reElem = that.elem = $(laytpl(TPL_MAIN).render({
      VIEW_CLASS: ELEM_VIEW
      ,data: options
      ,index: that.index //索引
    }));
    
    options.index = that.index;
    that.key = options.id || options.index;
    
    //生成替代元素
    hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender
    othis.after(reElem);
    
    //各级容器
    that.layTool = reElem.find(ELEM_TOOL);
    that.layBox = reElem.find(ELEM_BOX);
    that.layHeader = reElem.find(ELEM_HEADER);
    that.layMain = reElem.find(ELEM_MAIN);
    that.layBody = reElem.find(ELEM_BODY);
    that.layFixed = reElem.find(ELEM_FIXED);
    that.layFixLeft = reElem.find(ELEM_FIXL);
    that.layFixRight = reElem.find(ELEM_FIXR);
    that.layTotal = reElem.find(ELEM_TOTAL);
    that.layPage = reElem.find(ELEM_PAGE);
    
    //初始化工具栏
    that.renderToolbar();
    
    //让表格平铺
    that.fullSize();
    
    //如果多级表头，则填补表头高度
    if(options.cols.length > 1){
      //补全高度
      var th = that.layFixed.find(ELEM_HEADER).find('th');
      th.height(that.layHeader.height() - 1 - parseFloat(th.css('padding-top')) - parseFloat(th.css('padding-bottom')));
    }
    
    that.pullData(that.page); //请求数据
    that.events(); //事件
  };
  
  //根据列类型，定制化参数
  Class.prototype.initOpts = function(item){
    var that = this
    ,options = that.config
    ,initWidth = {
      checkbox: 48
      ,radio: 48
      ,space: 15
      ,numbers: 40
    };
    
    //让 type 参数兼容旧版本
    if(item.checkbox) item.type = "checkbox";
    if(item.space) item.type = "space";
    if(!item.type) item.type = "normal";

    if(item.type !== "normal"){
      item.unresize = true;
      item.width = item.width || initWidth[item.type];
    }
  };
  
  //初始化一些参数
  Class.prototype.setInit = function(type){
    var that = this
    ,options = that.config;
    var tableId = options.id;

    options.clientWidth = options.width || function(){ //获取容器宽度
      //如果父元素宽度为0（一般为隐藏元素），则继续查找上层元素，直到找到真实宽度为止
      var getWidth = function(parent){
        var width, isNone;
        parent = parent || options.elem.parent()
        width = parent.width();
        try {
          isNone = parent.css('display') === 'none';
        } catch(e){}
        if(parent[0] && (!width || isNone)) return getWidth(parent.parent());
        return width;
      };
      return getWidth();
    }();
    
    if(type === 'width') return options.clientWidth;

    // 去掉之前的记录
    delete thisTable.cols[tableId];

    if (!tableCheck.check(tableId)) {
      // 如果render的时候设置了checkStatus或者全局设置了默认跨页保存那么重置选中状态
      tableCheck.init(tableId, options.checkStatus ? (options.checkStatus['default'] || []) : []);
    } else {
      if (options.checkStatus && options.checkStatus['default']) {
        // 如果在option里面设置了默认选中的数据
        tableCheck.set(tableId, CHECK_TYPE_ORIGINAL, options.checkStatus['default']);
      }
    }

    if (options.checkDisabled && isArray(options.checkDisabled.data) && options.checkDisabled.data.length) {
      tableCheck.disabled(tableId, isArray(options.checkDisabled.data) ? options.checkDisabled.data : []);
    }

    var record;
    // 如果配置了字段筛选的记忆需要更新字段的hide设置
    if (options.colFilterRecord) {
      record = colFilterRecord.get(tableId, options.colFilterRecord);
      // 把修改hide的逻辑挪到下面做减少遍历
    } else {
      colFilterRecord.clear(tableId);
    }

    // 封装对col的配置处理
    var initCols = function (i1, item1, i2, item2) {
      //如果列参数为空，则移除
      if (!item2) {
        item1.splice(i2, 1);
        return;
      }

      item2.key = i1 + '-' + i2;
      item2.hide = item2.hide || false;
      item2.colspan = item2.colspan || 1;
      item2.rowspan = item2.rowspan || 1;

      //根据列类型，定制化参数
      that.initOpts(item2);

      // 如果配置了字段筛选的记忆需要更新字段的hide设置
      item2.hide = (record && item2.type === "normal" && item2.field && typeof record[item2.field] === 'boolean') ? record[item2.field] : item2.hide;


      // plug修改，根据配置信息确定是否合并列
      if (item2.colspan > 1 && item2.field) {
        // 合并列不应该出现filed
        delete item2.field;
      }
      if (!item2.field && !item2.toolbar && (!item2.colspan || item2.colspan === 1) && (tableSpecialColType.indexOf(item2.type) === -1)) {
        item2.colGroup = true;
      } else if (item2.colGroup && !(item2.colspan > 1)) {
        // 如果有乱用colGroup的，明明是一个字段列还给它添加上这个属性的会在这里KO掉，
        item2.colGroup = false;
      }

      //设置列的父列索引
      //如果是组合列，则捕获对应的子列
      var indexChild = i1 + (parseInt(item2.rowspan) || 1);
      // if (item2.colGroup || item2.colspan > 1) {
      if (item2.colGroup || indexChild < options.cols.length) { // 只要不是最后一层都会有子列
        var childIndex = 0;
        // #### 源码修改 #### 修复复杂表头数据与表头错开的bug
        layui.each(options.cols[indexChild], function (i22, item22) {
          //如果子列已经被标注为{HAS_PARENT}，或者子列累计 colspan 数等于父列定义的 colspan，则跳出当前子列循环
          if (item22.HAS_PARENT || (childIndex >= 1 && childIndex == (item2.colspan || 1))) return;

          item22.HAS_PARENT = true;
          item22.parentKey = i1 + '-' + i2;
          childIndex = childIndex + parseInt(item22.colspan > 1 ? item22.colspan : 1);
          initCols(indexChild, options.cols[indexChild], i22, item22);
        });
        // item2.colGroup = true; //标注是组合列
        item2.colGroup = typeof item2.colGroup === 'boolean' ? item2.colGroup : !(item2.field || item2.toolbar || (tableSpecialColType.indexOf(item2.type) !== -1));
        item2.isGroup = true; //标注是组合列
      }
    };

    //初始化列参数
    layui.each(options.cols, function (i1, item1) {
      if (i1 > 0) {
        return true
      }
      layui.each(item1, function (i2, item2) {
        // 调用解析cols
        initCols(i1, item1, i2, item2);
      });
    });
    
  };
  
  //初始工具栏
  Class.prototype.renderToolbar = function(){
    var that = this
    ,options = that.config
    
    //添加工具栏左侧模板
    var leftDefaultTemp = [
      '<div class="layui-inline" lay-event="add"><i class="layui-icon layui-icon-add-1"></i></div>'
      ,'<div class="layui-inline" lay-event="update"><i class="layui-icon layui-icon-edit"></i></div>'
      ,'<div class="layui-inline" lay-event="delete"><i class="layui-icon layui-icon-delete"></i></div>'
    ].join('')
    ,elemToolTemp = that.layTool.find('.layui-table-tool-temp');
    
    if(options.toolbar === 'default'){
      elemToolTemp.html(leftDefaultTemp);
    } else if(typeof options.toolbar === 'string'){
      var toolbarHtml = $(options.toolbar).html() || '';
      toolbarHtml && elemToolTemp.html(
        laytpl(toolbarHtml).render(options)
      );
    }
    
    //添加工具栏右侧面板
    var layout = {
      filter: {
        title: '筛选列'
        ,layEvent: 'LAYTABLE_COLS'
        ,icon: 'layui-icon-cols'
      }
      ,exports: {
        title: '导出'
        ,layEvent: 'LAYTABLE_EXPORT'
        ,icon: 'layui-icon-export'
      }
      ,print: {
        title: '打印'
        ,layEvent: 'LAYTABLE_PRINT'
        ,icon: 'layui-icon-print'
      }
    }, iconElem = [];
    
    if(typeof options.defaultToolbar === 'object'){
      layui.each(options.defaultToolbar, function(i, item){
        var thisItem = typeof item === 'string' ? layout[item] : item;
        if(thisItem){
          iconElem.push('<div class="layui-inline" title="'+ thisItem.title +'" lay-event="'+ thisItem.layEvent +'">'
            +'<i class="layui-icon '+ thisItem.icon +'"></i>'
          +'</div>');
        }
      });
    }
    that.layTool.find('.layui-table-tool-self').html(iconElem.join(''));
  }
  
  //同步表头父列的相关值
  Class.prototype.setParentCol = function(hide, parentKey){
    var that = this
    ,options = that.config
    
    ,parentTh = that.layHeader.find('th[data-key="'+ options.index +'-'+ parentKey +'"]') //获取父列元素
    ,parentColspan = parseInt(parentTh.attr('colspan')) || 0;
    
    if(parentTh[0]){
      var arrParentKey = parentKey.split('-')
      ,getThisCol = options.cols[arrParentKey[0]][arrParentKey[1]];

      hide ? parentColspan-- : parentColspan++;

      parentTh.attr('colspan', parentColspan);
      parentTh[parentColspan < 1 ? 'addClass' : 'removeClass'](HIDE);
      
      getThisCol.colspan = parentColspan; //同步 colspan 参数
      getThisCol.hide = parentColspan < 1; //同步 hide 参数
      
      //递归，继续往上查询是否有父列
      var nextParentKey = parentTh.data('parentkey');
      nextParentKey && that.setParentCol(hide, nextParentKey);
    }
  };
  
  //多级表头补丁
  Class.prototype.setColsPatch = function(){
    var that = this
    ,options = that.config

    //同步表头父列的相关值
    layui.each(options.cols, function(i1, item1){
      layui.each(item1, function(i2, item2){
        if(item2.hide){
          that.setParentCol(item2.hide, item2.parentKey);
        }
      });
    });
  };
  
  //动态分配列宽
  Class.prototype.setColsWidth = function(){
    var that = this
    ,options = that.config
    ,colNums = 0 //列个数
    ,autoColNums = 0 //自动列宽的列个数
    ,autoWidth = 0 //自动列分配的宽度
    ,countWidth = 0 //所有列总宽度和
    ,cntrWidth = that.setInit('width');
    
    //统计列个数
    that.eachCols(function(i, item){
      item.hide || colNums++;
    });

    //减去边框差和滚动条宽
    cntrWidth = cntrWidth - function(){
      return (options.skin === 'line' || options.skin === 'nob') ? 2 : colNums + 1;
    }() - that.getScrollWidth(that.layMain[0]) - 1;

    //计算自动分配的宽度
    var getAutoWidth = function(back){
      //遍历所有列
      layui.each(options.cols, function(i1, item1){
        layui.each(item1, function(i2, item2){
          var width = 0
          ,minWidth = item2.minWidth || options.cellMinWidth; //最小宽度

          if(!item2){
            item1.splice(i2, 1);
            return;
          }

          if(item2.colGroup || item2.hide) return;

          if(!back){
            width = item2.width || 0;
            if(/\d+%$/.test(width)){ //列宽为百分比
              width = Math.floor((parseFloat(width) / 100) * cntrWidth);
              width < minWidth && (width = minWidth);
            } else if(!width){ //列宽未填写
              item2.width = width = 0;
              autoColNums++;
            }
          } else if(autoWidth && autoWidth < minWidth){
            autoColNums--;
            width = minWidth;
          }
          
          if(item2.hide) width = 0;
          countWidth = countWidth + width;
        });
      });

      //如果未填充满，则将剩余宽度平分
      (cntrWidth > countWidth && autoColNums) && (
        autoWidth = (cntrWidth - countWidth) / autoColNums
      );
    }
    
    getAutoWidth();
    getAutoWidth(true); //重新检测分配的宽度是否低于最小列宽
    
    //记录自动列数
    that.autoColNums = autoColNums;
    
    //设置列宽
    that.eachCols(function(i3, item3){
      var minWidth = item3.minWidth || options.cellMinWidth;
      if(item3.colGroup || item3.hide) return;
      
      //给位分配宽的列平均分配宽
      if(item3.width === 0){
        that.getCssRule(options.index +'-'+ item3.key, function(item){
          item.style.width = Math.floor(autoWidth >= minWidth ? autoWidth : minWidth) + 'px';
        });
      }
      
      //给设定百分比的列分配列宽
      else if(/\d+%$/.test(item3.width)){
        that.getCssRule(options.index +'-'+ item3.key, function(item){
          item.style.width = Math.floor((parseFloat(item3.width) / 100) * cntrWidth) + 'px';
        });
      }
    });
    
    //填补 Math.floor 造成的数差
    var patchNums = that.layMain.width() - that.getScrollWidth(that.layMain[0])
    - that.layMain.children('table').outerWidth();

    if(that.autoColNums && patchNums >= -colNums && patchNums <= colNums){
      var getEndTh = function(th){
        var field;
        th = th || that.layHeader.eq(0).find('thead th:last-child')
        field = th.data('field');
        if(!field && th.prev()[0]){
          return getEndTh(th.prev())
        }
        return th
      }
      ,th = getEndTh()
      ,key = th.data('key');

      that.getCssRule(key, function(item){
        var width = item.style.width || th.outerWidth();
        item.style.width = (parseFloat(width) + patchNums) + 'px';
        
        //二次校验，如果仍然出现横向滚动条（通常是 1px 的误差导致）
        if(that.layMain.height() - that.layMain.prop('clientHeight') > 0){
          item.style.width = (parseFloat(item.style.width) - 1) + 'px';
        }
      });
    }
    
    that.loading(!0);

    var noneElem = that.layMain.find('.'+ NONE);
    // 如果没有数据的时候表头内容的宽度超过容器的宽度
    that.elem[noneElem.length && (that.layHeader.first().find('.layui-table').width() - 1) > that.layHeader.first().width() ? 'addClass' : 'removeClass']('layui-table-none-overflow');

    //如果多级表头，重新填补填补表头高度
    if (options.cols.length > 1) {
      //补全高度
      // var th = that.layFixed.find(ELEM_HEADER).find('th');
      // 只有有头部的高度的时候计算才有意义
      // var heightTemp = that.layHeader.height();
      // heightTemp = heightTemp / options.cols.length; // 每一个原子tr的高度
      var colsNum = options.cols.length;
      var thBox = that.layBox.find(ELEM_HEADER);
      var thElem = that.layFixed.find(ELEM_HEADER + ' th');
      var matchFlag = false;
      thElem.each(function (index, thCurr) {
        thCurr = $(thCurr);
        var rowspan = parseInt(thCurr.attr('rowspan') || '1');
        // var _thH = heightTemp * (parseInt(thCurr.attr('rowspan') || 1))
        //   - 1 - parseFloat(thCurr.css('padding-top')) - parseFloat(thCurr.css('padding-bottom'));
        // 找到原始的box里面的th的高度,只有行合并小于最大合并数的才需要设置高度
        if (rowspan < colsNum) {
          thCurr.height(thBox.find('th[data-key="' + thCurr.attr('data-key') + '"]').height());
          matchFlag = true;
        }
      });
      if (matchFlag) {
        // 修复ie浏览器下因为全行合并的高度导致后面的一些高度异常的问题
        that.layFixed.find('>' + ELEM_HEADER + ' th[rowspan="' + colsNum + '"]').height('auto');
      }
    }
  };
  
  //重置表格尺寸/结构
  Class.prototype.resize = function(){
    var that = this;
    that.fullSize(); //让表格铺满
    that.setColsWidth(); //自适应列宽
    that.scrollPatch(); //滚动条补丁
  };
  
  //表格重载
  Class.prototype.insReload = function(options){
    var that = this;
    
    options = options || {};
    delete that.haveInit;
    
    if(options.data && options.data.constructor === Array) delete that.config.data;
    that.config = $.extend(true, {}, that.config, options);
    
    that.render();
  };

  // [mod] 调用table.reload达到智能判断是否重载
  Class.prototype.reload = function(options){
    var that = this;
    table.reload(that.config.id, options, true);
  };

  //异常提示
  Class.prototype.errorView = function(html){
    var that = this
    ,elemNone = that.layMain.find('.'+ NONE)
    ,layNone = $('<div class="'+ NONE +'">'+ (html || 'Error') +'</div>');
    
    if(elemNone[0]){
      that.layNone.remove();
      elemNone.remove();
    }
    
    that.layFixed.addClass(HIDE);
    that.layMain.find('tbody').html('');
    
    that.layMain.append(that.layNone = layNone);
    // [mod] 补充异常情况下对page和total的内容处理
    that.layPage && that.layPage.addClass(HIDE).find('>div').html('');
    that.layTotal && that.layTotal.addClass(HIDE).find('tbody').html('');

    table.cache[that.key] = []; //格式化缓存数据
  };
  
  //页码
  Class.prototype.page = 1;
  
  //获得数据 [mod] 添加refresh模式
  Class.prototype.pullData = function(curr, refresh){
    var that = this
    ,options = that.config
    ,request = options.request
    ,response = options.response
    ,sort = function(){
      if(typeof options.initSort === 'object'){
        that.sort(options.initSort.field, options.initSort.type);
      }
    };
    
    that.startTime = new Date().getTime(); //渲染开始时间
        
    if(options.url){ //Ajax请求
      var params = {};
      params[request.pageName] = curr;
      params[request.limitName] = options.limit;
      
      //参数
      var data = $.extend(params, options.where);
      // [mod] 请求前对ajax的data进行修改的回调
      if (typeof options.parseRequest === 'function') {
        data = options.parseRequest(data) || data;
      }
      if(options.contentType && options.contentType.indexOf("application/json") == 0){ //提交 json 格式
        data = JSON.stringify(data);
      }
      
      that.loading();

      $.ajax({
        type: options.method || 'get'
        ,url: options.url
        ,contentType: options.contentType
        ,data: data
        ,dataType: 'json'
        ,headers: options.headers || {}
        ,success: function(res){
          //如果有数据解析的回调，则获得其返回的数据
          if(typeof options.parseData === 'function'){
            res = options.parseData(res) || res;
          }
          //检查数据格式是否符合规范
          if(res[response.statusName] != response.statusCode){
            that.renderForm();
            that.errorView(
              res[response.msgName] ||
              ('返回的数据不符合规范，正确的成功状态码应为："'+ response.statusName +'": '+ response.statusCode)
            );
          } else {
            that.renderData(res, curr, res[response.countName],false, refresh && (options.page ? options.page.count === res[response.countName] : true)), sort();
            options.time = (new Date().getTime() - that.startTime) + ' ms'; //耗时（接口请求+视图渲染）
          }
          refresh ? that.loading(true) : that.setColsWidth();
          typeof options.done === 'function' && options.done(res, curr, res[response.countName]);
        }
        ,error: function(e, m){
          that.errorView('数据接口请求异常：'+ m);

          that.renderForm();
          refresh ? that.loading(true) : that.setColsWidth();
        }
      });
    } else if(options.data && options.data.constructor === Array){ //已知数据
      var res = {}
      ,startLimit = curr*options.limit - options.limit
      
      res[response.dataName] = options.data.concat().splice(startLimit, options.limit);
      res[response.countName] = options.data.length;

      that.renderData(res, curr, res[response.countName], false,refresh && (options.page ? options.page.count === options.data.length : true)), sort();
      refresh ? that.loading(true) : that.setColsWidth();
      typeof options.done === 'function' && options.done(res, curr, res[response.countName]);
    }
  };
  
  //遍历表头 [mod]
  Class.prototype.eachCols = function(callback){
    var that = this;
    // table.eachCols(null, callback, that.config.cols);
    table.eachCols(that.config.id, callback, that.config.cols);
    return that;
  };

  //数据渲染 [mod] 新增refresh模式处理
  Class.prototype.renderData = function(res, curr, count, sort, refresh){
    var that = this
    ,options = that.config
    ,data = res[options.response.dataName] || []
    ,trs = []
    ,trs_fixed = []
    ,trs_fixed_r = []
    
    //渲染视图
    ,render = function(){ //后续性能提升的重点
      var thisCheckedRowIndex;
      if(!sort && that.sortKey){
        return that.sort(that.sortKey.field, that.sortKey.sort, true);
      }      
      layui.each(data, function(i1, item1){
        var tds = [], tds_fixed = [], tds_fixed_r = []
        ,numbers = i1 + options.limit*(curr - 1) + 1; //序号
        
        if(item1.length === 0) return;
        
        if(!sort){
          item1[table.config.indexName] = i1;
        }
        
        that.eachCols(function(i3, item3){
          var field = item3.field || i3
          ,key = options.index + '-' + item3.key
          ,content = item1[field];
          
          if(content === undefined || content === null) content = '';
          if(item3.colGroup) return;
          
          //td内容
          var td = ['<td data-field="'+ field +'" data-key="'+ key +'" '+ function(){ //追加各种属性
            var attr = [];
            if(item3.edit) attr.push('data-edit="'+ item3.edit +'"'); //是否允许单元格编辑
            if(item3.align) attr.push('align="'+ item3.align +'"'); //对齐方式
            if(item3.templet) attr.push('data-content="'+ content +'"'); //自定义模板
            // if(item3.toolbar) attr.push('data-off="true"'); //行工具列关闭单元格事件 [mod] 让工具列也能有相关事件处理
            if(item3.event) attr.push('lay-event="'+ item3.event +'"'); //自定义事件
            if(item3.style) attr.push('style="'+ item3.style +'"'); //自定义样式
            if(item3.minWidth) attr.push('data-minwidth="'+ item3.minWidth +'"'); //单元格最小宽度
            return attr.join(' ');
          }() +' class="'+ function(){ //追加样式
            var classNames = [];
            if(item3.hide) classNames.push(HIDE); //插入隐藏列样式
            if(!item3.field) classNames.push('layui-table-col-special'); //插入特殊列样式
            return classNames.join(' ');
          }() +'">'
            ,'<div class="layui-table-cell laytable-cell-'+ function(){ //返回对应的CSS类标识
              return item3.type === 'normal' ? key 
              : (key + ' laytable-cell-' + item3.type);
            }() +'">' + function(){
              var tplData = $.extend(true, {
                LAY_INDEX: numbers
              }, item1)
              ,checkName = table.config.checkName;
              
              //渲染不同风格的列
              switch(item3.type){
                case 'checkbox':
                  return '<input type="checkbox" name="layTableCheckbox" lay-skin="primary" '+ function(){
                    //如果是全选
                    if(item3[checkName]){
                      item1[checkName] = item3[checkName];
                      return item3[checkName] ? 'checked' : '';
                    }
                    return tplData[checkName] ? 'checked' : '';
                  }() +'>';
                break;
                case 'radio':
                  if(tplData[checkName]){
                    thisCheckedRowIndex = i1;
                  }
                  return '<input type="radio" name="layTableRadio_'+ options.index +'" '
                  + (tplData[checkName] ? 'checked' : '') +' lay-type="layTableRadio">';
                break;
                case 'numbers':
                  return numbers;
                break;
              };
              
              //解析工具列模板
              if(item3.toolbar){
                return laytpl($(item3.toolbar).html()||'').render(tplData);
              }
              return parseTempData(item3, content, tplData);
            }()
          ,'</div></td>'].join('');
          
          tds.push(td);
          if(item3.fixed && item3.fixed !== 'right') tds_fixed.push(td);
          if(item3.fixed === 'right') tds_fixed_r.push(td);
        });
        
        trs.push('<tr data-index="'+ i1 +'">'+ tds.join('') + '</tr>');
        trs_fixed.push('<tr data-index="'+ i1 +'">'+ tds_fixed.join('') + '</tr>');
        trs_fixed_r.push('<tr data-index="'+ i1 +'">'+ tds_fixed_r.join('') + '</tr>');
      });

      refresh || that.layBody.scrollTop(0);
      that.layMain.find('.'+ NONE).remove();
      that.layMain.find('tbody').html(trs.join(''));
      that.layFixLeft.find('tbody').html(trs_fixed.join(''));
      that.layFixRight.find('tbody').html(trs_fixed_r.join(''));

      that.renderForm();
      typeof thisCheckedRowIndex === 'number' && that.setThisRowChecked(thisCheckedRowIndex);
      that.syncCheckAll();
      
      //滚动条补丁
      that.haveInit ? that.scrollPatch() : setTimeout(function(){
        that.scrollPatch();
      }, 50);
      that.haveInit = true;
      
      layer.close(that.tipsIndex);
      
      //同步表头父列的相关值
      options.HAS_SET_COLS_PATCH || that.setColsPatch();
      options.HAS_SET_COLS_PATCH = true;
    };

    // 初始化选中的数据
    dataRenderChecked(data, options.id, options);

    var dataTemp = table.getTemp(that.key);
    // 存储临时数据
    that.tempData = dataTemp.data;

    table.cache[that.key] = data; //记录数据
    
    //显示隐藏分页栏
    that.layPage[(count == 0 || (data.length === 0 && curr == 1)) ? 'addClass' : 'removeClass'](HIDE);

    if(data.length === 0){
      that.renderForm();
      return that.errorView(options.text.none), renderDone.call(that, true);
    } else {
      that.layFixed.removeClass(HIDE);
    }

    //排序
    if(sort){
      return render(), renderDone.call(that);
    }

    render(); //渲染数据
    if (refresh) {
      return renderDone.call(that);
    }
    that.renderTotal(data); //数据合计
    that.layTotal && that.layTotal.removeClass(HIDE);

    //同步分页状态
    if(options.page){
      options.page = $.extend({
        elem: 'layui-table-page' + options.index
        ,count: count
        ,limit: options.limit
        ,limits: options.limits || [10,20,30,40,50,60,70,80,90]
        ,groups: 3
        ,layout: ['prev', 'page', 'next', 'skip', 'count', 'limit']
        ,prev: '<i class="layui-icon">&#xe603;</i>'
        ,next: '<i class="layui-icon">&#xe602;</i>'
        ,jump: function(obj, first){
          if(!first){
            //分页本身并非需要做以下更新，下面参数的同步，主要是因为其它处理统一用到了它们
            //而并非用的是 options.page 中的参数（以确保分页未开启的情况仍能正常使用）
            that.page = obj.curr; //更新页码
            options.limit = obj.limit; //更新每页条数

            that.pullData(obj.curr);
          }
        }
      }, options.page);
      options.page.count = count; //更新总条数
      laypage.render(options.page);
    }
    // 渲染完毕做一些处理
    renderDone.call(that, true);
  };
  
  //数据合计行
  Class.prototype.renderTotal = function(data){
    var that = this
    ,options = that.config
    ,totalNums = {};
    
    if(!options.totalRow) return;
    
    layui.each(data, function(i1, item1){
      if(item1.length === 0) return;
      
      that.eachCols(function(i3, item3){
        var field = item3.field || i3
        ,content = item1[field];

        if(item3.totalRow){ 
          totalNums[field] = (totalNums[field] || 0) + (parseFloat(content) || 0);
        }
      });
    });
    
    that.dataTotal = {};
    
    var tds = [];
    that.eachCols(function(i3, item3){
      var field = item3.field || i3;
      
      //td内容
      var content = function(){
        var text = item3.totalRowText || ''
        ,thisTotalNum = parseFloat(totalNums[field]).toFixed(2)
        ,tplData = {};
        
        tplData[field] = thisTotalNum;
        thisTotalNum = parseTempData(item3, thisTotalNum, tplData);
        
        return item3.totalRow ? (thisTotalNum || text) : text;
      }()
      ,td = ['<td data-field="'+ field +'" data-key="'+ options.index + '-'+ item3.key +'" '+ function(){
        var attr = [];
        if(item3.align) attr.push('align="'+ item3.align +'"'); //对齐方式
        if(item3.style) attr.push('style="'+ item3.style +'"'); //自定义样式
        if(item3.minWidth) attr.push('data-minwidth="'+ item3.minWidth +'"'); //单元格最小宽度
        return attr.join(' ');
      }() +' class="'+ function(){ //追加样式
        var classNames = [];
        if(item3.hide) classNames.push(HIDE); //插入隐藏列样式
        if(!item3.field) classNames.push('layui-table-col-special'); //插入特殊列样式
        return classNames.join(' ');
      }() +'">'
        ,'<div class="layui-table-cell laytable-cell-'+ function(){ //返回对应的CSS类标识
          var str = (options.index + '-' + item3.key);
          return item3.type === 'normal' ? str 
          : (str + ' laytable-cell-' + item3.type);
        }() +'">' + content
      ,'</div></td>'].join('');
      
      item3.field && (that.dataTotal[field] = content);
      tds.push(td);
    });

    that.layTotal.find('tbody').html('<tr>' + tds.join('') + '</tr>');
  };
  
  //找到对应的列元素
  Class.prototype.getColElem = function(parent, key){
    var that = this
    ,options = that.config;
    return parent.eq(0).find('.laytable-cell-'+ (options.index + '-' + key) + ':eq(0)');
  };
  
  //渲染表单
  Class.prototype.renderForm = function(type){
    form.render(type, 'LAY-table-'+ this.index);
  };
  
  //标记当前行选中状态
  Class.prototype.setThisRowChecked = function(index){
    var that = this
    ,options = that.config
    ,ELEM_CLICK = 'layui-table-click'
    ,tr = that.layBody.find('tr[data-index="'+ index +'"]');
    
    tr.addClass(ELEM_CLICK).siblings('tr').removeClass(ELEM_CLICK);
  };
  
  //数据排序
  Class.prototype.sort = function(th, type, pull, formEvent){
    var that = this
    ,field
    ,res = {}
    ,options = that.config
    ,filter = options.elem.attr('lay-filter')
    ,data = table.cache[that.key], thisData;
    
    //字段匹配
    if(typeof th === 'string'){
      that.layHeader.find('th').each(function(i, item){
        var othis = $(this)
        ,_field = othis.data('field');
        if(_field === th){
          th = othis;
          field = _field;
          return false;
        }
      });
    }

    try {
      var field = field || th.data('field')
      ,key = th.data('key');
      
      //如果欲执行的排序已在状态中，则不执行渲染
      if(that.sortKey && !pull){
        if(field === that.sortKey.field && type === that.sortKey.sort){
          return;
        }
      }

      var elemSort = that.layHeader.find('th .laytable-cell-'+ key).find(ELEM_SORT);
      that.layHeader.find('th').find(ELEM_SORT).removeAttr('lay-sort'); //清除其它标题排序状态
      elemSort.attr('lay-sort', type || null);
      that.layFixed.find('th')
    } catch(e){
      return hint.error('Table modules: Did not match to field');
    }
    
    //记录排序索引和类型
    that.sortKey = {
      field: field
      ,sort: type
    };
    
    //默认为前端自动排序。如果否，则需自主排序（通常为服务端处理好排序）
    if(options.autoSort){
      if(type === 'asc'){ //升序
        thisData = layui.sort(data, field);
      } else if(type === 'desc'){ //降序
        thisData = layui.sort(data, field, true);
      } else { //清除排序
        thisData = layui.sort(data, table.config.indexName);
        delete that.sortKey;
      }
    }
    
    res[options.response.dataName] = thisData || data;
    that.renderData(res, that.page, that.count, true);
    
    if(formEvent){
      layui.event.call(th, MOD_NAME, 'sort('+ filter +')', {
        field: field
        ,type: type
      });
    }
  };
  
  //请求loading
  Class.prototype.loading = function(hide){
    var that = this
    ,options = that.config;
    if(options.loading){
      if(hide){
        that.layInit && that.layInit.remove();
        delete that.layInit;
        that.layBox.find(ELEM_INIT).remove();
      } else {
        that.layInit = $(['<div class="layui-table-init">'
          ,'<i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop"></i>'
        ,'</div>'].join(''));
        that.layBox.append(that.layInit);
      }
    }
  };
  
  //同步选中值状态
  Class.prototype.setCheckData = function(index, checked){
    var that = this
    ,options = that.config
    ,thisData = table.cache[that.key];
    if(!thisData[index]) return;
    if(thisData[index].constructor === Array) return;
    thisData[index][options.checkName] = checked;
    // [mod] 设置了状态记忆
    if (tableCheck.check(that.key)) {
      var primaryKey = getPrimaryKey(options);
      tableCheck.update(that.key, thisData[index][primaryKey], checked);
    }
  };
  
  //同步全选按钮状态
  Class.prototype.syncCheckAll = function(){
    var that = this
    ,options = that.config
    ,checkAllElem = that.layHeader.find('input[name="layTableCheckbox"]')
    ,syncColsCheck = function(checked){
      that.eachCols(function(i, item){
        if(item.type === 'checkbox'){
          item[options.checkName] = checked;
        }
      });
      return checked;
    };
    
    if(!checkAllElem[0]) return;

    if(table.checkStatus(that.key).isAll){
      if(!checkAllElem[0].checked){
        checkAllElem.prop('checked', true);
        that.renderForm('checkbox');
      }
      syncColsCheck(true);
    } else {
      if(checkAllElem[0].checked){
        checkAllElem.prop('checked', false);
        that.renderForm('checkbox');
      }
      syncColsCheck(false);
    }
  };
  
  //获取cssRule
  Class.prototype.getCssRule = function(key, callback){
    var that = this
    ,style = that.elem.find('style')[0]
    ,sheet = style.sheet || style.styleSheet || {}
    ,rules = sheet.cssRules || sheet.rules;
    layui.each(rules, function(i, item){
      if(item.selectorText === ('.laytable-cell-'+ key)){
        return callback(item), true;
      }
    });
  };
  
  //让表格铺满
  Class.prototype.fullSize = function(){
    var that = this
    ,options = that.config
    ,height = options.height, bodyHeight;

    if(that.fullHeightGap){
      height = _WIN.height() - that.fullHeightGap;
      if(height < 135) height = 135;
      that.elem.css('height', height);
    }
    
    if(!height) return;

    //减去列头区域的高度
    bodyHeight = parseFloat(height) - (that.layHeader.outerHeight() || 38); //此处的数字常量是为了防止容器处在隐藏区域无法获得高度的问题，暂时只对默认尺寸的表格做支持。
    
    //减去工具栏的高度
    if(options.toolbar){
      bodyHeight = bodyHeight - (that.layTool.outerHeight() || 50);
    }
    
    //减去统计朗的高度
    if(options.totalRow){
      bodyHeight = bodyHeight - (that.layTotal.outerHeight() || 40);
    }

    //减去分页栏的高度
    if(options.page){
      bodyHeight = bodyHeight - (that.layPage.outerHeight() || 41);
    }

    that.layMain.css('height', bodyHeight - 2);
  };
  
  //获取滚动条宽度
  Class.prototype.getScrollWidth = function(elem){
    var width = 0;
    if(elem){
      width = elem.offsetWidth - elem.clientWidth;
    } else {
      elem = document.createElement('div');
      elem.style.width = '100px';
      elem.style.height = '100px';
      elem.style.overflowY = 'scroll';

      document.body.appendChild(elem);
      width = elem.offsetWidth - elem.clientWidth;
      document.body.removeChild(elem);
    }
    return width;
  };
  
  //滚动条补丁
  Class.prototype.scrollPatch = function(){
    var that = this
    ,layMainTable = that.layMain.children('table')
    ,scollWidth = that.layMain.width() - that.layMain.prop('clientWidth') //纵向滚动条宽度
    ,scollHeight = that.layMain.height() - that.layMain.prop('clientHeight') //横向滚动条高度
    ,getScrollWidth = that.getScrollWidth(that.layMain[0]) //获取主容器滚动条宽度，如果有的话
    ,outWidth = layMainTable.outerWidth() - that.layMain.width() //表格内容器的超出宽度
    
    //添加补丁
    ,addPatch = function(elem){
      if(scollWidth && scollHeight){
        elem = elem.eq(0);
        if(!elem.find('.layui-table-patch')[0]){
          var patchElem = $('<th class="layui-table-patch"><div class="layui-table-cell"></div></th>'); //补丁元素
          patchElem.find('div').css({
            width: scollWidth
          });
          elem.find('tr').append(patchElem);
        }
      } else {
        elem.find('.layui-table-patch').remove();
      }
    }
    
    addPatch(that.layHeader);
    addPatch(that.layTotal);
    
    //固定列区域高度
    var mainHeight = that.layMain.height()
    ,fixHeight = mainHeight - scollHeight;
    that.layFixed.find(ELEM_BODY).css('height', layMainTable.height() >= fixHeight ? fixHeight : 'auto');

    //表格宽度小于容器宽度时，隐藏固定列
    that.layFixRight[outWidth > 0 ? 'removeClass' : 'addClass'](HIDE); 
    
    //操作栏
    that.layFixRight.css('right', scollWidth - 1); 
  };

  //事件处理
  Class.prototype.events = function(){
    var that = this
    ,options = that.config
    ,_BODY = $('body')
    ,dict = {}
    ,th = that.layHeader.find('th')
    ,resizing
    ,ELEM_CELL = '.layui-table-cell'
    ,filter = options.elem.attr('lay-filter');
    
    //工具栏操作事件
    that.layTool.on('click', '*[lay-event]', function(e){
      var othis = $(this)
      ,events = othis.attr('lay-event')
      ,openPanel = function(sets){
        var list = $(sets.list)
        ,panel = $('<ul class="layui-table-tool-panel"></ul>');
        
        panel.html(list);
        
        //限制最大高度
        if(options.height){
          panel.css('max-height', options.height - (that.layTool.outerHeight() || 50));
        }
        
        //插入元素
        othis.find('.layui-table-tool-panel')[0] || othis.append(panel);
        that.renderForm();
        
        panel.on('click', function(e){
          layui.stope(e);
        });
        
        sets.done && sets.done(panel, list)
      };
      
      layui.stope(e);
      _DOC.trigger('table.tool.panel.remove');
      layer.close(that.tipsIndex);
      
      switch(events){
        case 'LAYTABLE_COLS': //筛选列 [mod]
          openPanel({
            list: function(){
              var lis = [];
              that.eachCols(function(i, item){ 
                if(item.field && item.type == 'normal'){
                  lis.push('<li><input type="checkbox" name="'+ item.field +'" data-key="'+ item.key +'" data-parentkey="'+ (item.parentKey||'') +'" lay-skin="primary" '+ (item.hide ? '' : 'checked') +' title="'+ (item.title || item.field) +'" lay-filter="LAY_TABLE_TOOL_COLS"></li>');
                }
              });
              return lis.join('');
            }()
            ,done: function(){
              form.on('checkbox(LAY_TABLE_TOOL_COLS)', function(obj){
                var othis = $(obj.elem)
                ,checked = this.checked
                ,key = othis.data('key')
                ,parentKey = othis.data('parentkey');
                
                layui.each(options.cols, function(i1, item1){
                  layui.each(item1, function(i2, item2){ 
                    if(i1+ '-'+ i2 === key){
                      var hide = item2.hide;

                      //同步勾选列的 hide 值和隐藏样式
                      item2.hide = !checked;
                      that.elem.find('*[data-key="'+ options.index +'-'+ key +'"]')
                      [checked ? 'removeClass' : 'addClass'](HIDE);
                      
                      //根据列的显示隐藏，同步多级表头的父级相关属性值
                      if(hide != item2.hide){
                        that.setParentCol(!checked, parentKey);
                      }
                      
                      //重新适配尺寸
                      that.resize();
                    }
                  });
                });

                if (options.colFilterRecord) {
                  colFilterRecord.set(options.id, othis.attr('name'), checked, options.colFilterRecord);
                } else {
                  colFilterRecord.clear(options.id)
                }
              });
            }
          });
        break;
        case 'LAYTABLE_EXPORT': //导出
          if(device.ie){
            layer.tips('导出功能不支持 IE，请用 Chrome 等高级浏览器导出', this, {
              tips: 3
            })
          } else {
            openPanel({
              list: function(){
                return [
                  '<li data-type="csv">导出到 Csv 文件</li>'
                  ,'<li data-type="xls">导出到 Excel 文件</li>'
                ].join('')
              }()
              ,done: function(panel, list){
                list.on('click', function(){
                  var type = $(this).data('type')
                  table.exportFile.call(that, options.id, null, type);
                });
              }
            });
          }
        break;
        case 'LAYTABLE_PRINT': //打印
          var printWin = window.open('打印窗口', '_blank')
          ,style = ['<style>'
            ,'body{font-size: 12px; color: #666;}'
            ,'table{width: 100%; border-collapse: collapse; border-spacing: 0;}'
            ,'th,td{line-height: 20px; padding: 9px 15px; border: 1px solid #ccc; text-align: left; font-size: 12px; color: #666;}'
            ,'a{color: #666; text-decoration:none;}'
            ,'*.layui-hide{display: none}'
          ,'</style>'].join('')
          ,html = $(that.layHeader.html()); //输出表头
          
          html.append(that.layMain.find('table').html()); //输出表体
          html.append(that.layTotal.find('table').html()) //输出合计行
          
          html.find('th.layui-table-patch').remove(); //移除补丁
          html.find('.layui-table-col-special').remove(); //移除特殊列
          
          printWin.document.write(style + html.prop('outerHTML'));
          printWin.document.close();
          printWin.print();
          printWin.close();
        break;
      }
      
      layui.event.call(this, MOD_NAME, 'toolbar('+ filter +')', $.extend({
        event: events
        ,config: options
      },{}));
    });
    
    //拖拽调整宽度    
    th.on('mousemove', function(e){
      var othis = $(this)
      ,oLeft = othis.offset().left
      ,pLeft = e.clientX - oLeft;
      if(othis.data('unresize') || dict.resizeStart){
        return;
      }
      dict.allowResize = othis.width() - pLeft <= 10; //是否处于拖拽允许区域
      _BODY.css('cursor', (dict.allowResize ? 'col-resize' : ''));
    }).on('mouseleave', function(){
      var othis = $(this);
      if(dict.resizeStart) return;
      _BODY.css('cursor', '');
    }).on('mousedown', function(e){
      var othis = $(this);
      if(dict.allowResize){
        var key = othis.data('key');
        e.preventDefault();
        dict.resizeStart = true; //开始拖拽
        dict.offset = [e.clientX, e.clientY]; //记录初始坐标
        
        that.getCssRule(key, function(item){
          var width = item.style.width || othis.outerWidth();
          dict.rule = item;
          dict.ruleWidth = parseFloat(width);
          dict.minWidth = othis.data('minwidth') || options.cellMinWidth;
        });
      }
    });
    
    //拖拽中
    _DOC.on('mousemove', function(e){
      if(dict.resizeStart){
        e.preventDefault();
        if(dict.rule){
          var setWidth = dict.ruleWidth + e.clientX - dict.offset[0];
          if(setWidth < dict.minWidth) setWidth = dict.minWidth;
          dict.rule.style.width = setWidth + 'px';
          layer.close(that.tipsIndex);
        }
        resizing = 1
      }
    }).on('mouseup', function(e){
      if(dict.resizeStart){
        dict = {};
        _BODY.css('cursor', '');
        that.scrollPatch();
      }
      if(resizing === 2){
        resizing = null;
      }
    });
    
    //排序
    th.on('click', function(e){
      var othis = $(this)
      ,elemSort = othis.find(ELEM_SORT)
      ,nowType = elemSort.attr('lay-sort')
      ,type;

      if(!elemSort[0] || resizing === 1) return resizing = 2;      
      
      if(nowType === 'asc'){
        type = 'desc';
      } else if(nowType === 'desc'){
        type = null;
      } else {
        type = 'asc';
      }
      that.sort(othis, type, null, true);
    }).find(ELEM_SORT+' .layui-edge ').on('click', function(e){
      var othis = $(this)
      ,index = othis.index()
      ,field = othis.parents('th').eq(0).data('field')
      layui.stope(e);
      if(index === 0){
        that.sort(field, 'asc', null, true);
      } else {
        that.sort(field, 'desc', null, true);
      }
    });
    
    //数据行中的事件监听返回的公共对象成员
    var commonMember = function(sets){
      var othis = $(this)
      ,index = othis.parents('tr').eq(0).data('index')
      ,tr = that.layBody.find('tr[data-index="'+ index +'"]')
      ,data = table.cache[that.key] || [];
      

      data = data[index] || {};
      
      return $.extend({
        tr: tr //行元素
        ,data: table.clearCacheKey(data) //当前行数据
        ,del: function(){ //删除行数据
          table.cache[that.key][index] = [];
          tr.remove();
          that.scrollPatch();
        }
        ,update: function(fields){ //修改行数据
          fields = fields || {};
          layui.each(fields, function(key, value){
            if(key in data){
              var templet, td = tr.children('td[data-field="'+ key +'"]');
              data[key] = value;
              that.eachCols(function(i, item2){
                if(item2.field == key && item2.templet){
                  templet = item2.templet;
                }
              });
              td.children(ELEM_CELL).html(parseTempData({
                templet: templet
              }, value, data));
              td.data('content', value);
            }
          });
        }
      }, sets);
    };
    
    //复选框选择 [mod] 只监听可操作性的节点的点击事件
    that.elem.on('click', 'input[name="layTableCheckbox"]:not([disabled])+', function(e){ //替代元素的 click 事件
      var checkbox = $(this).prev()
      // ,childs = that.layBody.find('input[name="layTableCheckbox"]:not([disabled])')
      ,childs = that.layMain.find('input[name="layTableCheckbox"]:not([disabled])')
      ,index = checkbox.parents('tr').eq(0).data('index')
      ,checked = checkbox[0].checked
      ,isAll = checkbox.attr('lay-filter') === 'layTableAllChoose';

      //全选
      if(isAll){
        childs.each(function(i, item){
          // item.checked = checked;
          // that.setCheckData(i, checked);
          var index = $(item).closest('tr').data('index');
          that.layBody.find('tr[data-index="'+index+'"] input[name="layTableCheckbox"]').prop('checked', checked);
          that.setCheckData($(item).closest('tr').data('index'), checked);
        });
        that.syncCheckAll();
        that.renderForm('checkbox');
      } else {
        that.setCheckData(index, checked);
        that.syncCheckAll();
      }
      
      layui.event.call(checkbox[0], MOD_NAME, 'checkbox('+ filter +')', commonMember.call(checkbox[0], {
        checked: checked
        ,type: isAll ? 'all' : 'one'
      }));

      layui.stope(e);
    });
    
    //单选框选择
    that.elem.on('click', 'input[lay-type="layTableRadio"]+', function(e){
      var radio = $(this).prev()
      ,checked = radio[0].checked
      ,thisData = table.cache[that.key]
      ,index = radio.parents('tr').eq(0).data('index');
      
      //重置数据单选属性
      layui.each(thisData, function(i, item){
        if(index === i){
          item.LAY_CHECKED = true;
          if (tableCheck.check(that.key)) {
            var primaryKey = getPrimaryKey(that.config);
            tableCheck.update(that.key, item[primaryKey], true, true);
          }
        } else {
          delete item.LAY_CHECKED;
        }
      });
      that.setThisRowChecked(index);
      
      layui.event.call(this, MOD_NAME, 'radio('+ filter +')', commonMember.call(this, {
        checked: checked
      }));

      layui.stope(e);
    });
    
    //行事件
    that.layBody.on('mouseenter', 'tr', function(){ //鼠标移入行
      var othis = $(this)
      ,index = othis.index();
      if(othis.data('off')) return; //不触发事件
      that.layBody.find('tr:eq('+ index +')').addClass(ELEM_HOVER)
    }).on('mouseleave', 'tr', function(){ //鼠标移出行
      var othis = $(this)
      ,index = othis.index();
      if(othis.data('off')) return; //不触发事件
      that.layBody.find('tr:eq('+ index +')').removeClass(ELEM_HOVER)
    }).on('click', 'tr', function(){ //单击行
      setRowEvent.call(this, 'row');
    }).on('dblclick', 'tr', function(){ //双击行
      setRowEvent.call(this, 'rowDouble');
    });
    
    //创建行单击、双击事件监听
    var setRowEvent = function(eventType){
      var othis = $(this);
      if(othis.data('off')) return; //不触发事件
      layui.event.call(this,
        MOD_NAME, eventType + '('+ filter +')'
        ,commonMember.call(othis.children('td')[0])
      );
    };
    
    //单元格编辑
    that.layBody.on('change', '.'+ELEM_EDIT, function(){
      var othis = $(this)
      ,value = this.value
      ,field = othis.parent().data('field')
      ,index = othis.parents('tr').eq(0).data('index')
      ,data = table.cache[that.key][index];
      
      data[field] = value; //更新缓存中的值
      
      layui.event.call(this, MOD_NAME, 'edit('+ filter +')', commonMember.call(this, {
        value: value
        ,field: field
      }));
    }).on('blur', '.'+ELEM_EDIT, function(){
      var templet
      ,othis = $(this)
      ,thisElem = this
      ,field = othis.parent().data('field')
      ,index = othis.parents('tr').eq(0).data('index')
      ,data = table.cache[that.key][index];
      that.eachCols(function(i, item){
        if(item.field == field && item.templet){
          templet = item.templet;
        }
      });
      othis.siblings(ELEM_CELL).html(function(value){
        return parseTempData({
          templet: templet
        }, value, data);
      }(thisElem.value));
      othis.parent().data('content', thisElem.value);
      othis.remove();
    });
    
    //单元格单击事件
    that.layBody.on('click', 'td', function(e){
      var othis = $(this)
      ,field = othis.data('field')
      ,editType = othis.data('edit')
      ,elemCell = othis.children(ELEM_CELL);
      
      if(othis.data('off')) return; //不触发事件
      
      //显示编辑表单
      if(editType){
        var input = $('<input class="layui-input '+ ELEM_EDIT +'">');
        input[0].value = othis.data('content') || elemCell.text();
        othis.find('.'+ELEM_EDIT)[0] || othis.append(input);
        input.focus();
        layui.stope(e);
        return;
      }
    }).on('mouseenter', 'td', function(){
      gridExpand.call(this)
    }).on('mouseleave', 'td', function(){
       gridExpand.call(this, 'hide');
    });
    
    //单元格展开图标
    var ELEM_GRID = 'layui-table-grid', ELEM_GRID_DOWN = 'layui-table-grid-down', ELEM_GRID_PANEL = 'layui-table-grid-panel'
    ,gridExpand = function(hide){
      var othis = $(this)
      ,elemCell = othis.children(ELEM_CELL);
      
      if(othis.data('off')) return; //不触发事件
      
      if(hide){
        othis.find('.layui-table-grid-down').remove();
      } else if(elemCell.prop('scrollWidth') > elemCell.outerWidth()){
        if(elemCell.find('.'+ ELEM_GRID_DOWN)[0]) return;
        othis.append('<div class="'+ ELEM_GRID_DOWN +'"><i class="layui-icon layui-icon-down"></i></div>');
      }
    };
    
    //单元格展开事件 [mod]
    that.layBody.on('click', '.'+ ELEM_GRID_DOWN, function(e){
      var othis = $(this)
      ,td = othis.parent()
      ,elemCell = td.children(ELEM_CELL);

      that.tipsIndex = layer.tips([
        '<div class="layui-table-tips-main" style="margin-top: -'+ (elemCell.height() + 16) +'px;'+ function(){
          if(options.size === 'sm'){
            return 'padding: 4px 15px; font-size: 12px;';
          }
          if(options.size === 'lg'){
            return 'padding: 14px 15px;';
          }
          return '';
        }() +'">'
          ,elemCell.html()
        ,'</div>'
        ,'<i class="layui-icon layui-table-tips-c layui-icon-close"></i>'
      ].join(''), elemCell[0], {
        tips: [3, '']
        ,time: -1
        ,anim: -1
        ,maxWidth: (device.ios || device.android) ? 300 : that.elem.width()/2
        ,isOutAnim: false
        ,skin: 'layui-table-tips'
        ,success: function(layero, index){
          layero.find('.layui-table-tips-c').on('click', function(){
            layer.close(index);
          });
        }
      });

      // 记录当前操作的td对象
      table._tableTdCurr = $(this).closest('td');

      layui.stope(e);
    });
    
    //行工具条操作事件 [mod]
    that.layBody.on('click', '*[lay-event]', function(e){
      var othis = $(this)
      ,index = othis.parents('tr').eq(0).data('index');
      layui.event.call(this, MOD_NAME, 'tool('+ filter +')', commonMember.call(this, {
        event: othis.attr('lay-event')
      }));
      that.setThisRowChecked(index);

      // 阻止冒泡
      layui.stope(e);
    });
    
    //同步滚动条
    that.layMain.on('scroll', function(){
      var othis = $(this)
      ,scrollLeft = othis.scrollLeft()
      ,scrollTop = othis.scrollTop();
      
      that.layHeader.scrollLeft(scrollLeft);
      that.layTotal.scrollLeft(scrollLeft);
      // 过滤掉鼠标滚动fixed区域而联动滚动main的情况
      that.layFixed.find(ELEM_BODY + ':not(:hover)').scrollTop(scrollTop);

      layer.close(that.tipsIndex);
    });

    // 监听ELEM_BODY的滚动
    that.layFixed.find(ELEM_BODY).on('scroll', function () {
      var elemBody = $(this);
      if (elemBody.is(':hover')) {  // 只有当前鼠标的fixed区域才需要处理
        // 同步两个fixed的滚动
        that.layFixed.find(ELEM_BODY + ':not(:hover)').scrollTop(elemBody.scrollTop());
        // 联动main的滚动
        that.layMain.scrollTop(elemBody.scrollTop());
      }
    });

    // todo 待测试
    if (refresh.timer[options.id]) {
      // 存在定时刷新
      refresh.reset(options.id);
    }

    // //自适应
    // _WIN.on('resize', function(){
    //   that.resize();
    // });
  };
  
  //一次性事件
  ;(function(){
    //自适应
    _WIN.on('resize', function(){
      table.resize();
    });

    //全局点击
    _DOC.on('click', function(){
      _DOC.trigger('table.remove.tool.panel');
    });
    
    //工具面板移除事件
    _DOC.on('table.remove.tool.panel', function(){
      $('.layui-table-tool-panel').remove();
    });
  })();
  
  //初始化
  table.init = function(filter, settings){
    settings = settings || {};
    var that = this
    ,elemTable = filter ? $('table[lay-filter="'+ filter +'"]') : $(ELEM + '[lay-data]')
    ,errorTips = 'Table element property lay-data configuration item has a syntax error: ';

    //遍历数据表格
    elemTable.each(function(){
      var othis = $(this), tableData = othis.attr('lay-data');
      
      try{
        tableData = new Function('return '+ tableData)();
      } catch(e){
        hint.error(errorTips + tableData)
      }
      
      var cols = [], options = $.extend({
        elem: this
        ,cols: []
        ,data: []
        ,skin: othis.attr('lay-skin') //风格
        ,size: othis.attr('lay-size') //尺寸
        ,even: typeof othis.attr('lay-even') === 'string' //偶数行背景
      }, table.config, settings, tableData);
      
      filter && othis.hide();
      
      //获取表头数据
      othis.find('thead>tr').each(function(i){
        options.cols[i] = [];
        $(this).children().each(function(ii){
          var th = $(this), itemData = th.attr('lay-data');
          
          try{
            itemData = new Function('return '+ itemData)();
          } catch(e){
            return hint.error(errorTips + itemData)
          }
          
          var row = $.extend({
            title: th.text()
            ,colspan: th.attr('colspan') || 0 //列单元格
            ,rowspan: th.attr('rowspan') || 0 //行单元格
          }, itemData);

          if(row.colspan < 2) cols.push(row);
          options.cols[i].push(row);
        });
      });

      //获取表体数据
      othis.find('tbody>tr').each(function(i1){
        var tr = $(this), row = {};
        //如果定义了字段名
        tr.children('td').each(function(i2, item2){
          var td = $(this)
          ,field = td.data('field');
          if(field){
            return row[field] = td.html();
          }
        });
        //如果未定义字段名
        layui.each(cols, function(i3, item3){
          var td = tr.children('td').eq(i3);
          row[item3.field] = td.html();
        });
        options.data[i1] = row;
      });
      table.render(options);
    });

    return that;
  };
  
  //记录所有实例
  thisTable.that = {}; //记录所有实例对象
  thisTable.config = {}; //记录所有实例配置项
  thisTable.cols = {}; // [mod] 缓存表格的经过处理的cols

  // [mod] eachCols遍历规则修改核心之一
  var asyncChild = function (index, cols, i1, item2) {
    //如果是组合列，则捕获对应的子列
    if (item2.isGroup) {
      var childIndex = 0;
      index++;
      item2.CHILD_COLS = [];
      // 找到它的子列所在cols的下标
      var i2 = i1 + (parseInt(item2.rowspan) || 1);
      layui.each(cols[i2], function (i22, item22) {
        //如果子列已经被标注为{PARENT_COL_INDEX}，或者子列累计 colspan 数等于父列定义的 colspan，则跳出当前子列循环
        if (item22.PARENT_COL_INDEX || (childIndex >= 1 && childIndex == (item2.colspan || 1))) return;
        item22.PARENT_COL_INDEX = index;

        item2.CHILD_COLS.push(item22);
        childIndex = childIndex + parseInt(item22.colspan > 1 ? item22.colspan : 1);
        asyncChild(index, cols, i2, item22);
      });
    }
  };

  //遍历表头
  table.eachCols = function(id, callback, cols){
    var config = thisTable.config[id] || {}
    // ,arrs = [], index = 0;
      , arrs = config.cols ? (thisTable.cols[id] || []) : [], index = 0, cacheFlag;
    cols = $.extend(true, [], cols || config.cols);

    if (!arrs.length) {
      //重新整理表头结构
      layui.each(cols, function (i1, item1) {
        if (i1 > 0) {
          return true;
        }
        layui.each(item1, function (i2, item2) {

          asyncChild(index, cols, i1, item2);

          if (item2.PARENT_COL_INDEX) return; //如果是子列，则不进行追加，因为已经存储在父列中
          arrs.push(item2);

          // thisTable.cols[id] = arrs;
        });
        thisTable.cols[id] = arrs;
      });
    } else {
      // console.log('命中缓存!!');
      cacheFlag = true;
    }

    //重新遍历列，如果有子列，则进入递归
    var eachArrs = function(obj){
      layui.each(obj || arrs, function(i, item){
        var key = item.key.split('-');

        // 因为加了缓存需要同步他的hide信息
        if (cacheFlag) {
          // 将缓存中的hide跟cols的hide同步
          item.hide = cols[key[0]][key[1]].hide;
          // 将之前设置的选中状态去掉
          item[table.config.checkName] = false;
          // 如果没有设置width默认成自动分配宽度列
          item.width = item.width || 0;
        }
        if (!item.colGroup) {
          typeof callback === 'function' && callback(i, item);
        }
        if(item.CHILD_COLS) return eachArrs(item.CHILD_COLS);
        // typeof callback === 'function' && callback(i, item);
      });
    };
    
    eachArrs();
  };
  
  //表格选中状态 [mod]
  table.checkStatus = function(id, getCacheData){
    var nums = 0
    ,invalidNum = 0
    ,arr = []
    ,data = table.cache[id] || [];
    //计算全选个数
    layui.each(data, function(i, item){
      if(item.constructor === Array){
        invalidNum++; //无效数据，或已删除的
        return;
      }
      if(item[table.config.checkName]){
        nums++;
        arr.push(table.clearCacheKey(item));
      }
    });
    var status = {
      data: arr //选中的数据
      ,isAll: data.length ? (nums === (data.length - invalidNum)) : false //是否全选
    };

    var config = getConfig(id);
    if (config && config.checkStatus) {
      // 状态记忆
      status.status = tableCheck.get(id);
      if (getCacheData) {
        status.dataCache = [];
        var cacheDataTemp = cacheData[config.id];
        layui.each($.extend(true, [], tableCheck.getChecked(id)), function (_index, _id) {
          // 如果没有查看过的数据会有什么现象todo
          cacheDataTemp[_id] && status.dataCache.push(table.clearCacheKey(cacheDataTemp[_id]));
        });
      }
    }

    if (config && config.checkDisabled) {
      // 存在不可选的记录
      var checkDisabledTemp = config.checkDisabled;
      if (typeof checkDisabledTemp === 'object' && checkDisabledTemp.enabled !== false) {
        var num1 = 0; //可选的数量
        var num2 = 0; //最终选中的数量
        var primaryKey = getPrimaryKey(config);
        var disabledTemp = tableCheck.get(id, CHECK_TYPE_DISABLED);
        layui.each(table.cache[id], function (index, data) {
          var primaryValue = data[primaryKey];
          if (disabledTemp.indexOf(primaryValue) === -1) {
            num1++;
            if (data[table.config.checkName]) {
              num2++;
            }
          }
        });
        status.isAll = (num2 > 0 && num1 === num2);
      }
    }

    return status;
  };
  
  //表格导出
  table.exportFile = function(id, data, type){
    var that = this;
    
    data = data || table.clearCacheKey(table.cache[id]);
    type = type || 'csv';
    
    var config = thisTable.config[id] || {}
    ,textType = ({
      csv: 'text/csv'
      ,xls: 'application/vnd.ms-excel'
    })[type]
    ,alink = document.createElement("a");
    
    if(device.ie) return hint.error('IE_NOT_SUPPORT_EXPORTS');
    
    alink.href = 'data:'+ textType +';charset=utf-8,\ufeff'+ encodeURIComponent(function(){
      var dataTitle = [], dataMain = [], dataTotal = [];
      
      //表头和表体
      layui.each(data, function(i1, item1){
        var vals = [];
        if(typeof id === 'object'){ //如果 id 参数直接为表头数据
          layui.each(id, function(i, item){
            i1 == 0 && dataTitle.push(item || '');
          });
          layui.each(table.clearCacheKey(item1), function(i2, item2){
            vals.push('"'+ (item2 || '') +'"');
          });
        } else {
          table.eachCols(id, function(i3, item3){
            if(item3.field && item3.type == 'normal' && !item3.hide){
              var content = item1[item3.field];
              if(content === undefined || content === null) content = '';
              
              i1 == 0 && dataTitle.push(item3.title || '');
              vals.push('"'+ parseTempData(item3, content, item1, 'text') + '"');
            }
          });
        }
        dataMain.push(vals.join(','));
      });
      
      //表合计
      layui.each(that.dataTotal, function(key, value){
        dataTotal.push(value);
      });
      
      return dataTitle.join(',') + '\r\n' + dataMain.join('\r\n') + '\r\n' + dataTotal.join(',');
    }());
    
    alink.download = (config.title || 'table_'+ (config.index || '')) + '.' + type; 
    document.body.appendChild(alink);
    alink.click();
    document.body.removeChild(alink); 
  };
  
  //重置表格尺寸结构
  table.resize = function(id){
    //如果指定表格唯一 id，则只执行该 id 对应的表格实例
    if(id){
      var config = getThisTableConfig(id); //获取当前实例配置项
      if(!config) return;
      
      thisTable.that[id].resize();
      
    } else { //否则重置所有表格实例尺寸
      layui.each(thisTable.that, function(){
        this.resize();
      });
    }
  };
  
  //表格重载
  table.reload = function(id, options, shallowCopy){
    // var config = getThisTableConfig(id); //获取当前实例配置项
    // if(!config) return;
    //
    // var that = thisTable.that[id];
    // that.reload(options);
    //
    // return thisTable.call(that);

    var config = getThisTableConfig(id); //获取当前实例配置项
    if(!config) return;
    
    var that = thisTable.that[id];

    var configTemp = $.extend(true, {}, getConfig(id), options);
    // 如果不记录状态的话就重置目前的选中记录
    if (!configTemp.checkStatus) {
      tableCheck.reset(id);
    }
    // 默认存在智能重载模式，不可关闭也不可部分表格要部分表格不要
    var reloadModel = false;
    if (!!configTemp.page !== !!config.page) {
      // 如果是否分页发生了改变
      reloadModel = true;
    }
    if (!reloadModel) {
      // 黑名单的校验
      var dataParamsTemp = queryParams.getParamsBlacklist();

      layui.each(options, function (_key, _value) {
        var indexTemp = dataParamsTemp.indexOf(_key);
        if (indexTemp !== -1) {
          // 匹配到一个就跳出
          return reloadModel = true, false;
        }
      });
    }
    if (!reloadModel) {

      if (typeof options.page === 'object') {
        options.page.curr && (that.page = options.page.curr);
        delete options.elem;
        delete options.jump;
      }
      if(options.data && options.data.constructor === Array) delete that.config.data;
      shallowCopy ? $.extend(that.config, options) : $.extend(true, that.config, options);
      if (!that.config.page) {
        that.page = 1;
      }
      that.loading();
      that.pullData(that.page);
      if (!shallowCopy) {
        return thisTable.call(that);
      }
    } else {
      // 如果是重载
      if (shallowCopy) {
        that.insReload(options);
        tableIns[id].config = that.config;
      } else {
        that.reload(options);
        return tableIns[id] = thisTable.call(that);
      }
    }
  };
 
  //核心入口 [mod]
  table.render = function(options){
    var inst = new Class(options);
    return thisTable.call(inst);
  };
  
  //清除临时Key
  table.clearCacheKey = function(data){
    data = $.extend({}, data);
    delete data[table.config.checkName];
    delete data[table.config.indexName];
    return data;
  };
  
  //自动完成渲染
  table.init();
  
  exports(MOD_NAME, table);
});

 
