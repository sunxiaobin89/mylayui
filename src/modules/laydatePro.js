/**

 @Name : layDatePro 日期时间控件强化
 @Author: 岁月小偷
 @Site：https://gitee.com/sun_zoro/laydatePro
 @License：MIT

 */
;!function (factory) {
  "use strict";

  var isLayui = window.layui && layui.define,
    ready = {
      getPath: function () {
        var jsPath = document.currentScript ? document.currentScript.src : function () {
          var js = document.scripts
            , last = js.length - 1
            , src;
          for (var i = last; i > 0; i--) {
            if (js[i].readyState === 'interactive') {
              src = js[i].src;
              break;
            }
          }
          return src || js[last].src;
        }();
        return jsPath.substring(0, jsPath.lastIndexOf('/') + 1);
      }()

      //获取节点的style属性值
      , getStyle: function (node, name) {
        var style = node.currentStyle ? node.currentStyle : window.getComputedStyle(node, null);
        return style[style.getPropertyValue ? 'getPropertyValue' : 'getAttribute'](name);
      }

      //载入CSS配件
      , link: function (href, fn, cssname) {

        //未设置路径，则不主动加载css
        // if (!laydatePro.path) return;

        var head = document.getElementsByTagName("head")[0], link = document.createElement('link');
        if (typeof fn === 'string') cssname = fn;
        var app = (cssname || href).replace(/\.|\//g, '');
        var id = 'layuicss-' + app, timeout = 0;

        link.rel = 'stylesheet';
        link.href = ready.getPath + href;
        link.id = id;

        if (!document.getElementById(id)) {
          head.appendChild(link);
        }

        if (typeof fn !== 'function') return;

        //轮询css是否加载完毕
        (function poll() {
          if (++timeout > 8 * 1000 / 100) {
            return window.console && console.error('laydatePro.css: Invalid');
          }
          parseInt(ready.getStyle(document.getElementById(id), 'width')) === 1989 ? fn() : setTimeout(poll, 100);
        }());
      }
    }
    , MOD_NAME_PRO = 'laydatePro'
    , laydatePro = {
      v: '1.0.1'

      //主体CSS等待事件
      , ready: function (fn) {
        var path = MOD_NAME_PRO + '.css?v=' + laydatePro.v;
        if (isLayui) {
          // var filePath = layui.cache.modules[MOD_NAME_PRO]
          //   .substr(0, layui.cache.modules[MOD_NAME_PRO].lastIndexOf('/') + 1);
          // 引入tablePlug.css
          // layui.link(filePath + path, fn, MOD_NAME_PRO);
          layui.addcss('modules/ex/laydatePro.css?v=' + laydatePro.v);
        } else {
          ready.link(path, fn, MOD_NAME_PRO);
        }
        return this;
      }
    };


  //加载方式
  if (isLayui) {
    layui.define(['jquery', 'laydate'], function (exports) { //layui加载
      // laydate.path = layui.cache.dir;
      exports(MOD_NAME_PRO, factory(layui.$, layui.laydate, laydatePro));
    })
  } else if (typeof define === 'function' && define.amd) {
    define(function () { //requirejs加载
      return factory(jQuery, laydate, laydatePro);
    })
  } else {
    (function () { //普通script标签加载
      window[MOD_NAME_PRO] = factory(window.$, window.laydate, laydatePro);
    })();
  }
}(function ($, laydate, laydatePro) {
  $ = $ || jQuery;
  if (!$) {
    console.error('该功能必须依赖jQuery插件');
    return {};
  }
  if (!laydate) {
    console.error('该功能必须先引入Laydate');
    return {};
  }

  laydatePro.ready();

  var
    //字符常量
    MOD_NAME = 'laydate', ELEM = '.layui-laydate', THIS = 'layui-this', SHOW = 'layui-show', HIDE = 'layui-hide',
    DISABLED = 'laydate-disabled', TIPS_OUT = '开始日期超出了结束日期<br>建议重新选择', LIMIT_YEAR = [100, 200000],
    ELEM_STATIC = 'layui-laydate-static', ELEM_LIST = 'layui-laydate-list', ELEM_SELECTED = 'laydate-selected',
    ELEM_HINT = 'layui-laydate-hint', ELEM_PREV = 'laydate-day-prev', ELEM_NEXT = 'laydate-day-next',
    ELEM_FOOTER = 'layui-laydate-footer', ELEM_CONFIRM = '.laydate-btns-confirm', ELEM_TIME_TEXT = 'laydate-time-text',
    ELEM_TIME_BTN = '.laydate-btns-time',

    weekText = {
      cn: ['日', '一', '二', '三', '四', '五', '六'],
      en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
    },

    quickSelectFn = (function () {
      var selectMap = {
        'today': function () {
          var date1 = new Date();
          var date2 = new Date();
          date1.setHours(0, 0, 0, 0);
          date2.setDate(date1.getDate() + 1);
          date2.setHours(0, 0, 0, 0);
          return {
            title: '今天',
            value: [date1, date2 - 1]
          }
        },
        'lastDays-7': function () {
          var date1 = new Date();
          var date2 = new Date();
          date1.setDate(date1.getDate() - 7);
          date1.setHours(0, 0, 0, 0);
          date2.setHours(0, 0, 0, 0);
          return {
            title: '过去7天',
            value: [date1, date2 - 1]
          }
        },
        'lastDays-30': function () {
          var date1 = new Date();
          var date2 = new Date();
          date1.setDate(date1.getDate() - 30);
          date1.setHours(0, 0, 0, 0);
          date2.setHours(0, 0, 0, 0);
          return {
            title: '过去30天',
            value: [date1, date2 - 1]
          }
        },
        'yesterday': function () {
          var date1 = new Date();
          var date2 = new Date();
          date1.setDate(date1.getDate() - 1);
          date1.setHours(0, 0, 0, 0);
          date2.setHours(0, 0, 0, 0);
          return {
            title: '昨天',
            value: [date1, date2 - 1]
          }
        },
        'lastMonth': function () {
          var date1 = new Date();
          var date2 = new Date();

          date1.setMonth(date1.getMonth() - 1);
          date1.setDate(1);
          date1.setHours(0, 0, 0, 0);
          date2.setDate(1);
          date2.setHours(0, 0, 0, 0);
          return {
            title: '上个月',
            value: [date1, date2 - 1]
          }
        },
        'thisMonth': function () {
          var date1 = new Date();
          var date2 = new Date();

          date1.setDate(1);
          date1.setHours(0, 0, 0, 0);
          date2.setMonth(date2.getMonth() + 1);
          date2.setDate(1);
          date2.setHours(0, 0, 0, 0);
          return {
            title: '这个月',
            value: [date1, date2 - 1]
          }
        }
      };
      return {
        get: function (key) {
          return selectMap[key]();
        }
      }
    })(),
    // 响应的事件集合
    active = {
      // 点击快速选择的按钮
      quickSelect: function (layThat) {
        // layThat: 当前laydate的对象
        var options = layThat.config;
        var dateTime = options.dateTime;
        var elemContent = $(layThat.elemCont[0]);
        var elemMain = $(layThat.elemMain);

        var btnElem = $(this);
        var status = btnElem.data('status');
        elemMain.find('.laydate-time-select').remove();
        if (status === 'list') {
          btnElem.data('status', 'select');
          // 当前是普通列表
          elemContent.hide();
          var selectArr = options.quickSelect || [];
          var arrTemp = [];
          $.each(selectArr, function (index, time) {
            (index % 3) ? '' : arrTemp.push(arrTemp.length ? '</tr></tr>' : '<tr>');
            arrTemp.push('<td data-time="' + time + '" ' + ($(options.elem[0]).val() === time ? ' class="layui-this"' : '') + '>' + time + '</td>');
          });
          arrTemp.length && arrTemp.push('</tr>');
          elemMain.append('<div class="laydate-time-select" style="padding: 10px;"><table class="layui-table" lay-skin="nob"><tbody>' + arrTemp.join('') + '</tbody></table></div>');
        } else {
          btnElem.data('status', 'list');
          elemContent.show();
        }

        var selectElem = elemMain.find('.laydate-time-select');
        // 给日期控件里面的选项添加事件
        selectElem.on('click', 'table tr td', function () {
          var elemTemp = $(this);
          selectElem.find('.layui-this').removeClass('layui-this');
          elemTemp.addClass('layui-this');
          var valueTemp = elemTemp.data('time');
          if (!valueTemp) {
            return;
          }
          var valueArr = valueTemp.split(':');
          $.extend(dateTime, layThat.systemDate(), {
            hours: valueArr[0] || 0
            , minutes: valueArr[1] || 0
            , seconds: valueArr[2] || 0
          });
          layThat.setValue(layThat.parse()).remove();
          options.position === 'static' && layThat.calendar();
          layThat.done();
        })
      },
      quickSelectDateRange: function (layThat) {
        var options = layThat.config;
        var dateTime = options.dateTime;
        var elemContent = $(layThat.elemCont[0]);
        var elemMain = $(layThat.elemMain);
        var elemMainLeft = $(layThat.elemMain[0]);

        var btnElem = $(this);
        var status = btnElem.data('status');

        if (!layThat.quickElem) {
          var timer;
          layThat.quickElem = $('<div class="laydate-quickselect-panel"><ul></ul></div>');

          var quickElemArr = ['<ul>'];
          $.each(options.quickSelect, function (index, item) {
            var itemTemp = '';
            if (typeof item === 'string') {
              itemTemp = quickSelectFn.get(item);
            } else if (item.title && item.value) {
              itemTemp = item;
            }
            layThat.quickElem.find('ul').append($('<li>' + itemTemp.title + '</li>').data('range', itemTemp.value));
          });

          layThat.quickElem.find('ul li').click(function () {
            timer = clearTimeout(timer);
            var elemTemp = $(this);
            var rangeValue = elemTemp.data('range');
            elemTemp.addClass(THIS).siblings('.' + THIS).removeClass(THIS);
            if (rangeValue && rangeValue.length) {
              // layThat.startDate = layThat.systemDate(new Date(rangeValue[0]));
              var dates = {
                startDate: layThat.systemDate(new Date(rangeValue[0])),
                endDate: layThat.systemDate(new Date(rangeValue[1]))
              };
              // var startDateTemp = dateTemp['startDate'] = layThat.systemDate(new Date(rangeValue[0]));
              // layThat.endDate = layThat.systemDate(new Date(rangeValue[1]));
              // var endDateTemp = dateTemp['endDate'] = layThat.systemDate(new Date(rangeValue[1]));
              // layThat.startTime = {
              //   hours: startDateTemp.hours
              //   , minutes: startDateTemp.minutes
              //   , seconds: startDateTemp.seconds
              // };
              // layThat. = {
              //   hours: endDateTemp.hours
              //   , minutes: endDateTemp.minutes
              //   , seconds: endDateTemp.seconds
              // };
              layThat.startState = true;
              layThat.endState = true;
            }
            // 圈出日期范围
            // layThat.stampRange();
            var times = ['startTime', 'endTime'];
            // 设置开始时间和结束时间
            layui.each(['startDate', 'endDate'], function (index, name) {
              var dateTemp = dates[name];
              layThat[times[index]] = {
                hours: dateTemp.hours
                , minutes: dateTemp.minutes
                , seconds: dateTemp.seconds
              };
              layThat.choose($('<td lay-ymd="' + dateTemp.year + '-' + (dateTemp.month + 1) + '-' + dateTemp.date + '"></td>'));
            });
            var btnTemp = $(layThat.footer).find('.laydate-btns-time');
            if (btnTemp.length) {
              var typeTemp = btnTemp.attr('lay-type');
              btnTemp.attr('lay-type', typeTemp === 'date' ? 'datetime' : 'date');
              btnTemp.click();
            }

            // $(layThat.footer).find(ELEM_CONFIRM)[layThat.endDate ? 'removeClass' : 'addClass'](DISABLED);
            if (options.quickConfirm) {
              $(layThat.footer).find(ELEM_CONFIRM).click();
            } else {
              // 延迟一秒自动关掉关掉
              timer = setTimeout(function () {
                timer = '';
                // 如果是打开状态就给关掉
                status === 'list' && btnElem.click();
              }, 1000);
            }
          });
        }

        layThat.quickElem.insertBefore(elemMainLeft);

        // 点击日期区域的时候
        $(layThat.elemMain).off('click').on('click', function () {
          var elemTemp = $(this);
          var laydateElem = elemTemp.closest('.layui-laydate');
          var quickBtn = laydateElem.find('.laydate-btns-primary[lay-type="quickSelectDateRange"]');
          // 如果当前是快速选择的面板打开的时候，并且没有准备关闭的timer
          if (quickBtn.data('status') === 'select' && !timer) {
            quickBtn.click();
          }
        });

        // 展开或者隐藏的动画
        layThat.quickElem.animate({left: status === 'list' ? 0 : '-' + layThat.quickElem.outerWidth() + 'px'});

        // 切换当前的状态
        // if (status === 'list') {
        //   btnElem.data('status', 'select');
        // } else {
        //   btnElem.data('status', 'list');
        // }
        btnElem.data('status', status === 'list' ? 'select' : 'list');
      }
    },

    // 按钮集合
    newBtn = {
      quickSelect: [
        '<div class="laydate-footer-btns laydate-footer-btns-primary">'
        , '<span lay-type="quickSelect" class="laydate-btns-primary" data-status="list">快速选择</span>'
        , '</div>'
      ],
      quickSelectDateRange: [
        '<div class="laydate-footer-btns laydate-footer-btns-primary">'
        , '<span lay-type="quickSelectDateRange" class="laydate-btns-primary" data-status="list">快速选择</span>'
        , '</div>'
      ]
    },

    // 缓存laydate的实例
    instance = {},


    init = function (layThat, change) {
      var options = layThat.config;
      var dateTime = options.dateTime;
      // var elemContent = $(layThat.elemCont[0]);
      var elemTarget = $(options.elem[0]);
      var elemContent = $(layThat.elemCont);
      var elemMain = $(layThat.elemMain);
      var footElem = $(layThat.footer);

      if (!change) {
        // 给按钮添加事件
        $(footElem).on('click', '.laydate-btns-primary', function (e) {
          var type = $(this).attr('lay-type');
          active[type] && active[type].call(this, layThat);
        });

        // 如果设置了可快速选择的时间数组并且是time的非range模式下
        if (options.quickSelect && options.quickSelect.length && options.type === 'time' && !options.range) {
          $(newBtn['quickSelect'].join('')).insertBefore(footElem.find('.laydate-footer-btns').first());
          footElem.find('.laydate-btns-primary[data-status="list"]').first().click();
        }

        // 如果设置了可快速选择的功能并且是date的range模式下
        if (options.quickSelect && options.quickSelect.length
          && (options.type === 'date' || options.type === 'datetime')
          && options.range && options.rangeType !== 'divide') {
          $(newBtn['quickSelectDateRange'].join('')).insertBefore(footElem.find('.laydate-footer-btns').first());
          footElem.find('.laydate-btns-primary[data-status="list"]').first().click();
        }

        // 其他的功能
        // 点击年份或者月份快速确认
        if (options.quickConfirm && !options.range) {
          if (options.type === 'month' || options.type === 'year') {
            elemMain.on('click', 'ul.layui-laydate-list li', function () {
              $(this).hasClass('laydate-disabled') || footElem.find('.laydate-btns-confirm').click();
            });
          }
        }

        // 时间选择的不完整
        if (!options.range && options.type === 'time' && options.simpleModel) {
          var indexTemp = [];
          $.each(layThat.format, function (index, formatStr) {
            // 遍历format找到关键的信息记录起来
            switch (formatStr) {
              case 'HH':
              case 'H':
                indexTemp.push(0);
                break;
              case 'mm':
              case 'm':
                indexTemp.push(1);
                break;
              case 'ss':
              case 's':
                indexTemp.push(2);
                break;
            }
          });

          // 如果不是有缺角的format就不做处理
          if (indexTemp.length !== 3) {
            // 隐藏掉默认的date模块
            elemMain.find('table').hide();
            // 定义一个高度
            elemContent.css({height: '230px'});
            // 调整头部的padding让文字可以居中
            elemMain.find('.layui-laydate-header').css({paddingLeft: 0, paddingRight: 0});
            // 重新计算整体的宽度
            elemMain.css({width: 84 * indexTemp.length + 20 + 'px'});
            // 重新计算每一列的宽度
            elemMain.find('.laydate-time-list>li').css({width: 100 / indexTemp.length + '%'});
            // 给需要显示的列添加class
            $.each(indexTemp, function (_i, _index) {
              elemMain.find('.laydate-time-list>li').eq(_index).addClass('exist');
            });
            // 隐藏掉不需要的列
            elemMain.find('.laydate-time-list>li:not(.exist)').hide();

            if (indexTemp.length === 1) {
              // 如果只有单列，点击即刻确定，也不显示按钮
              footElem.hide();
              elemMain.find('.laydate-time-list ol li').click(function () {
                $(this).hasClass('laydate-disabled') || footElem.find('.laydate-btns-confirm').click();
              });
            } else {
              // 如果有多列则显示确定等按钮需要点击按钮来确定选取的时间
              footElem.show();
            }
            // 调整列的边框宽度
            elemMain.find('.laydate-time-list>li.exist').first().find('ol').css({borderLeftWidth: '1px'});
            elemMain.find('.laydate-time-list>li.exist').last().find('ol').css({borderRightWidth: '1px'});
            // 如果是向上弹出需要修改top值
            layThat.position();
          }
        }
      }

      // 拓展季度选择器
      if (options.type === 'month' && options.subType === 'quarter') {
        lay.each(elemContent.find('.laydate-month-list').find('li'), function (index, monElem) {
          monElem = $(monElem);
          var monthTemp = parseInt(monElem.attr('lay-ym'));
          if (monthTemp < 4) {
            monElem.html(monElem.html().replace(/月/g, "季度"));
          } else {
            monElem.hide();
          }
        });
        if (!change && !elemTarget.val()) {
          //    默认的选择这个月和下个月所处的季度
          lay.each(elemContent.find('.laydate-month-list').find('li.layui-this'), function (index, monElem) {
            monElem = $(monElem);
            // 获得选中的月份
            var month = parseInt(monElem.attr('lay-ym'));
            var quarter = Math.round((month + 1) / 4);
            monElem.closest('.laydate-month-list').find('li[lay-ym="' + quarter + '"]').click();
          });
          elemMain.find('.layui-laydate-header')
            .off('click', '.laydate-prev-y,.laydate-next-y')
            .on('click', '.laydate-prev-y,.laydate-next-y', function (event) {
              init(layThat, true);
            })
        } else if (change) {
          lay.each(elemContent.find('.laydate-month-list').find('li.layui-this'), function (index, monElem) {
            monElem = $(monElem);
            // 获得选中的月份
            var month = parseInt(monElem.attr('lay-ym'));
            if (month > 3) {
              var quarter = Math.round((month + 1) / 4);
              monElem.closest('.laydate-month-list').find('li[lay-ym="' + quarter + '"]').click();
            }
          });
        }
      }

      if (options.fullPanel) {
        layThat.list('time', 0);
      }
    },

    divideRange = function (config) {
      var elemTemp = $(config.elem);
      var nameTemp = elemTemp.attr('name') || 'date';
      var widthTemp = (!config.type || config.type === 'datetime') ? '' : 'width100';
      var DIVIDE = 'laydate-range-divide',
        DIVIDE_CLASS = '.' + DIVIDE,
        DIVIDE_START = DIVIDE_CLASS + '-start',
        DIVIDE_END = DIVIDE_CLASS + '-end';

      var valueTemp = elemTemp.val() || config.value;
      var rangeStr = typeof config.range === 'string' ? config.range : '-';
      // switch (config.range) {
      //   case '~':
      //   case '-':
      //     rangeStr = config.range;
      //     break;
      // }
      var valueArr = valueTemp ? valueTemp.split(' ' + rangeStr + ' ') : [];

      var valueStart = valueArr[0] || '';
      var valueEnd = valueArr[1] || '';

      // 分列式的时间选择范围
      var renderArr = [
        '<div class="layui-inline ' + DIVIDE + '">',
        '<div class="layui-input-inline" ' + widthTemp + '>',
        '<input type="text" class="layui-input ' + DIVIDE + '-start" name="' + nameTemp + '.start" value="' + valueStart + '" autocomplete="off" placeholder="开始时间">',
        '</div>',
        '<div class="layui-form-mid">~</div>',
        '<div class="layui-input-inline" ' + widthTemp + '>',
        '<input type="text" class="layui-input ' + DIVIDE + '-end" name="' + nameTemp + '.end" value="' + valueEnd + '" autocomplete="off" placeholder="结束时间">',
        '</div>',
        '</div>'
      ];

      // 首先隐藏掉原始的然后追加上分裂的节点
      elemTemp.hide();
      elemTemp.next(DIVIDE_CLASS).remove();
      elemTemp.parent().css('width', 'auto');
      $(renderArr.join('')).insertAfter(elemTemp);

      var doneTemp = config.done;

      // 开始时间的最终配置
      var configStart = $.extend(true, {}, config, {
        elem: elemTemp.next(DIVIDE_CLASS).find(DIVIDE_START)[0],
        value: valueStart,
        isInitValue: false,
        done: function (value, date, endDate) {
          var endElem = $(this.elem[0]).closest(DIVIDE_CLASS).find(DIVIDE_END);
          var insEnd = instance[endElem.attr('lay-key')];
          // 因为laydate自身在这个回调的时候给date中的month+了1的原因，需要减掉1才能正常
          date.month = date.month - 1;
          // 修改结束的laydate的min
          $.extend(true, insEnd.config, {min: date});
          // 修改原始input的值
          elemTemp.val(value + ' ' + rangeStr + ' ' + endElem.val());
          // 调用原来的done回调
          typeof doneTemp === "function" && doneTemp.call(this, value, date, endDate);
        }
      });

      // 去掉原始的range的相关配置
      delete configStart.range;
      delete configStart.rangeType;
      valueArr[1] && (configStart.max = valueArr[1]);

      // render开始时间
      var ins1 = laydate.render(configStart);

      // 结束时间的最终配置
      var configEnd = $.extend(true, {}, config, {
        elem: elemTemp.next(DIVIDE_CLASS).find(DIVIDE_END)[0],
        value: valueEnd,
        isInitValue: false,
        done: function (value, date, endDate) {
          var startElem = $(this.elem[0]).closest(DIVIDE_CLASS).find(DIVIDE_START);
          var insStart = instance[startElem.attr('lay-key')];
          // 因为laydate自身在这个回调的时候给date中的month+了1的原因，需要减掉1才能正常
          date.month = date.month - 1;
          // 修改结束的laydate的min
          $.extend(true, insStart.config, {max: date});
          // 修改原始input的值
          elemTemp.val(startElem.val() + ' ' + rangeStr + ' ' + value);
          // 调用原来的done回调
          typeof doneTemp === "function" && doneTemp.call(this, value, date, endDate);
        }
      });

      delete configEnd.range;
      delete configEnd.rangeType;
      valueArr[0] && (configEnd.min = valueArr[0]);

      var ins2 = laydate.render(configEnd);

      // 初始化彼此的最大最小值
      // debugger;
      // valueArr[1] && ins2.config.dateTime && $.extend(true, ins1.config, {max: ins2.config.dateTime});
      // valueArr[0] && ins1.config.dateTime && $.extend(true, ins2.config, {min: ins1.config.dateTime});

    };

  $.extend(laydatePro, {
    getInstance: function (key) {
      return instance[key] ? instance[key].obj : null;
    },
    destroy: function (elem) {
      lay(elem).each(function (index, elemTemp) {
        elemTemp = $(elemTemp);
        var key = elemTemp.attr('lay-key');
        if (key) {
          // 如果打开着就给关掉
          $('#layui-laydate' + key).remove();
        }
        // copy 当前的节点
        var nodeClone = elemTemp.clone(true);
        // 替换节点 去掉lay-key方便后面重新render
        elemTemp.replaceWith(nodeClone.attr('lay-key', null));
      })
    }
  });


  // 设置laydate的一些基础默认config
  laydate.set({
    weekStart: 0 // 指定一周的第一天是什么,默认是周日
  });

  var Class = laydate.Class;

  //创建指定日期时间对象
  Class.prototype.newDate = laydate.newDate = function (dateTime) {
    dateTime = dateTime || {};
    return new Date(
      dateTime.year || 1
      , dateTime.month || 0
      , dateTime.date || 1
      , dateTime.hours || 0
      , dateTime.minutes || 0
      , dateTime.seconds || 0
    );
  };

  //控件主体渲染
  Class.prototype.render = function () {
    var that = this
      , options = that.config
      , lang = that.lang()
      , isStatic = options.position === 'static'

      //主面板
      , elem = that.elem = lay.elem('div', {
        id: that.elemID
        , 'class': [
          'layui-laydate'
          , options.range ? ' layui-laydate-range' : ''
          , isStatic ? (' ' + ELEM_STATIC) : ''
          , options.theme && options.theme !== 'default' && !/^#/.test(options.theme) ? (' laydate-theme-' + options.theme) : ''
          // ####源码修改 09#### 因为目前的主题设置其实不支持多主题，比如有的主题设置了颜色，有的主题可以设置其他样式，他们应该可以同时生效的才对，针对格子的样式新增一个配置项先
          , options.circleMark ? ' laydate-theme-circle' : ''
          , options.fullPanel ? ' laydate-theme-fullpanel' : '' // 全面板
        ].join('')
      })

      //主区域
      , elemMain = that.elemMain = []
      , elemHeader = that.elemHeader = []
      , elemCont = that.elemCont = []
      , elemTable = that.table = []

      //底部区域
      , divFooter = that.footer = lay.elem('div', {
        'class': ELEM_FOOTER
      });

    if (options.zIndex) elem.style.zIndex = options.zIndex;

    //单双日历区域
    lay.each(new Array(2), function (i) {
      if (!options.range && i > 0) {
        return true;
      }

      //头部区域
      var divHeader = lay.elem('div', {
          'class': 'layui-laydate-header'
        })

        //左右切换
        , headerChild = [function () { //上一年
          var elem = lay.elem('i', {
            'class': 'layui-icon laydate-icon laydate-prev-y'
          });
          elem.innerHTML = '&#xe65a;';
          return elem;
        }(), function () { //上一月
          var elem = lay.elem('i', {
            'class': 'layui-icon laydate-icon laydate-prev-m'
          });
          elem.innerHTML = '&#xe603;';
          return elem;
        }(), function () { //年月选择
          var elem = lay.elem('div', {
            'class': 'laydate-set-ym'
          }), spanY = lay.elem('span'), spanM = lay.elem('span');
          elem.appendChild(spanY);
          elem.appendChild(spanM);
          return elem;
        }(), function () { //下一月
          var elem = lay.elem('i', {
            'class': 'layui-icon laydate-icon laydate-next-m'
          });
          elem.innerHTML = '&#xe602;';
          return elem;
        }(), function () { //下一年
          var elem = lay.elem('i', {
            'class': 'layui-icon laydate-icon laydate-next-y'
          });
          elem.innerHTML = '&#xe65b;';
          return elem;
        }()]

        //日历内容区域
        , divContent = lay.elem('div', {
          'class': 'layui-laydate-content'
        })
        , table = lay.elem('table')
        , thead = lay.elem('thead'), theadTr = lay.elem('tr');

      //生成年月选择
      lay.each(headerChild, function (i, item) {
        divHeader.appendChild(item);
      });

      //生成表格
      thead.appendChild(theadTr);
      lay.each(new Array(6), function (i) { //表体
        var tr = table.insertRow(0);
        lay.each(new Array(7), function (j) {
          if (i === 0) {
            var th = lay.elem('th');
            // th.innerHTML = lang.weeks[j];
            // ####源码修改 08#### 根据设置的每周的开始得出要显示的是周几
            th.innerHTML = lang.weeks[(j + options.weekStart) % 7];
            theadTr.appendChild(th);
          }
          tr.insertCell(j);
        });
      });
      table.insertBefore(thead, table.children[0]); //表头
      divContent.appendChild(table);

      elemMain[i] = lay.elem('div', {
        'class': 'layui-laydate-main laydate-main-list-' + i
      });

      elemMain[i].appendChild(divHeader);
      elemMain[i].appendChild(divContent);

      elemHeader.push(headerChild);
      elemCont.push(divContent);
      elemTable.push(table);
    });

    //生成底部栏
    lay(divFooter).html(function () {
      var html = [], btns = [];
      if (options.type === 'datetime') {
        html.push('<span lay-type="datetime" class="laydate-btns-time">' + lang.timeTips + '</span>');
      }
      lay.each(options.btns, function (i, item) {
        var title = lang.tools[item] || 'btn';
        if (options.range && item === 'now') return;
        if (isStatic && item === 'clear') title = options.lang === 'cn' ? '重置' : 'Reset';
        btns.push('<span lay-type="' + item + '" class="laydate-btns-' + item + '">' + title + '</span>');
      });
      html.push('<div class="laydate-footer-btns">' + btns.join('') + '</div>');
      return html.join('');
    }());

    //插入到主区域
    lay.each(elemMain, function (i, main) {
      elem.appendChild(main);
    });
    options.showBottom && elem.appendChild(divFooter);

    //生成自定义主题
    if (/^#/.test(options.theme)) {
      var style = lay.elem('style')
        , styleText = [
        '#{{id}} .layui-laydate-header{background-color:{{theme}};}'
        , '#{{id}} .layui-this' + (options.circleMark ? '>div' : '') + ',#{{id}} li.layui-this{background-color:{{theme}} !important;}'
      ].join('').replace(/{{id}}/g, that.elemID).replace(/{{theme}}/g, options.theme);

      if ('styleSheet' in style) {
        style.setAttribute('type', 'text/css');
        style.styleSheet.cssText = styleText;
      } else {
        style.innerHTML = styleText;
      }

      lay(elem).addClass('laydate-theme-molv');
      elem.appendChild(style);
    }

    //记录当前执行的实例索引
    laydate.thisId = options.id;

    //移除上一个控件
    that.remove(Class.thisElemDate);

    //如果是静态定位，则插入到指定的容器中，否则，插入到body
    isStatic ? options.elem.append(elem) : (
      document.body.appendChild(elem)
        , that.position() //定位
    );

    that.checkDate().calendar(); //初始校验
    that.changeEvent(); //日期切换

    Class.thisElemDate = that.elemID;

    typeof options.ready === 'function' && options.ready(lay.extend({}, options.dateTime, {
      month: options.dateTime.month + 1
    }));
  };

  // 重写控件移除
  Class.prototype.remove = function (prev) {
    var that = this
      , options = that.config
      , elem = lay('#' + (prev || that.elemID));
    if (!elem.hasClass(ELEM_STATIC)) {
      // ####源码修改 05####
      // 过期的实例remove的时候不需要再执行下去，不然点击document的时候会出问题，实际上后面如果能让这个实例失效被回收会更好一些。
      if (that.index.toString() !== that.config.elem.attr('lay-key')) {
        return that;
      }
      that.checkDate(function () {
        elem.remove();
      });
    }
    return that;
  };
  // 重写日期校验
  Class.prototype.checkDate = function (fn) {
    var that = this
      , thisDate = new Date()
      , options = that.config
      , dateTime = options.dateTime = options.dateTime || that.systemDate()
      , thisMaxDate, error

      , elem = that.bindElem || options.elem[0]
      , valType = that.isInput(elem) ? 'val' : 'html'
      , value = that.isInput(elem) ? elem.value : (options.position === 'static' ? '' : elem.innerHTML)

      //校验日期有效数字
      , checkValid = function (dateTime) {
        if (dateTime.year > LIMIT_YEAR[1]) dateTime.year = LIMIT_YEAR[1], error = true; //不能超过20万年
        if (dateTime.month > 11) dateTime.month = 11, error = true;
        // ####源码修改 04####
        // 既然校验分钟和秒的时候如果超过59设置为0并且进位，为什么不是先检测秒然后再是分钟和小时？
        // if (dateTime.hours > 23) dateTime.hours = 0, error = true;
        // if (dateTime.minutes > 59) dateTime.minutes = 0, dateTime.hours++, error = true;
        // if (dateTime.seconds > 59) dateTime.seconds = 0, dateTime.minutes++, error = true;
        if (dateTime.seconds > 59) dateTime.seconds = 0, dateTime.minutes++, error = true;
        if (dateTime.minutes > 59) dateTime.minutes = 0, dateTime.hours++, error = true;
        if (dateTime.hours > 23) dateTime.hours = 0, error = true;

        //计算当前月的最后一天
        thisMaxDate = laydate.getEndDate(dateTime.month + 1, dateTime.year);
        if (dateTime.date > thisMaxDate) dateTime.date = thisMaxDate, error = true;
      }

      //获得初始化日期值
      , initDate = function (dateTime, value, index) {
        var startEnd = ['startTime', 'endTime'];
        var startEndState = ['startState', 'endState'];
        value = (value.match(that.EXP_SPLIT) || []).slice(1);
        index = index || 0;
        if (options.range) {
          // ####源码修改 01####
          // 设置状态先
          that[startEndState[index]] = !!that[startEnd[index]];
          // 设置开始结束时间
          that[startEnd[index]] = that[startEnd[index]] || {};
        }
        // 处理多选的初始赋值
        if (dateTime.length >= 0) {
          dateTime = dateTime[index];
        }
        lay.each(that.format, function (i, item) {
          var thisv = parseFloat(value[i]);
          if (value[i].length < item.length) error = true;
          if (/yyyy|y/.test(item)) { //年
            if (thisv < LIMIT_YEAR[0]) thisv = LIMIT_YEAR[0], error = true; //年不能低于100年
            dateTime.year = thisv;
          } else if (/MM|M/.test(item)) { //月
            if (thisv < 1) thisv = 1, error = true;
            dateTime.month = thisv - 1;
          } else if (/dd|d/.test(item)) { //日
            if (thisv < 1) thisv = 1, error = true;
            dateTime.date = thisv;
          } else if (/HH|H/.test(item)) { //时
            // ####源码修改 02####
            // if (thisv < 1) thisv = 0, error = true;
            // = 0应该是对的 应该还要判断是否大于23
            if (thisv < 0) thisv = 0, error = true;
            if (thisv > 23) thisv = 23, error = true;
            dateTime.hours = thisv;
            options.range && (that[startEnd[index]].hours = thisv);
          } else if (/mm|m/.test(item)) { //分
            // if (thisv < 1) thisv = 0, error = true;
            if (thisv < 0) thisv = 0, error = true;
            if (thisv > 59) thisv = 59, error = true;
            dateTime.minutes = thisv;
            options.range && (that[startEnd[index]].minutes = thisv);
          } else if (/ss|s/.test(item)) { //秒
            // if (thisv < 1) thisv = 0, error = true;
            if (thisv < 0) thisv = 0, error = true;
            if (thisv > 59) thisv = 59, error = true;
            dateTime.seconds = thisv;
            options.range && (that[startEnd[index]].seconds = thisv);
          }
        });
        checkValid(dateTime)
      };

    if (fn === 'limit') return checkValid(dateTime), that;


    value = value || options.value;
    if (typeof value === 'string') {
      value = value.replace(/\s+/g, ' ').replace(/^\s|\s$/g, '');
    }

    //如果点击了开始，单未选择结束就关闭，则重新选择开始
    if (that.startState && !that.endState) {
      delete that.startState;
      that.endState = true;
    }
    if (typeof value === 'string' && value) {
      if (options.dateTimes) {
        // 多选的时候
        var values = value.split(options.multiple);
        var indexTemp = 0;
        $.each(values, function (index, value) {
          if (value) {
            if (that.EXP_IF.test(value)) { //校验日期格式
              options.dateTimes[indexTemp] = options.dateTimes[index] || {};
              initDate(options.dateTimes, value, indexTemp);
              indexTemp++
            } else {
              that.hint('日期格式不合法<br>必须遵循下述格式：<br>' + (
                options.range ? (options.format + ' ' + options.range + ' ' + options.format) : options.format
              ) + '<br>已为你重置');
              error = true;
            }
          }
        });
        options.dateTimes.sort(function (a, b) {
          return a.year - b.year || a.month - b.month || a.date - b.date
        });
        options.dateTimes.length ? options.dateTime = $.extend({}, options.dateTimes[0]) : '';
      } else {
        if (that.EXP_IF.test(value)) { //校验日期格式
          if (options.range) {
            value = value.split(' ' + options.range + ' ');
            that.startDate = that.startDate || that.systemDate();
            that.endDate = that.endDate || that.systemDate();
            options.dateTime = lay.extend({}, that.startDate);
            lay.each([that.startDate, that.endDate], function (i, item) {
              initDate(item, value[i], i);
            });
          } else {
            initDate(dateTime, value)
          }
        } else {
          that.hint('日期格式不合法<br>必须遵循下述格式：<br>' + (
            options.range ? (options.format + ' ' + options.range + ' ' + options.format) : options.format
          ) + '<br>已为你重置');
          error = true;
        }
      }
    } else if (value && value.constructor === Date) { //如果值为日期对象时
      options.dateTime = that.systemDate(value);
    } else {
      options.dateTime = that.systemDate();
      delete that.startState;
      delete that.endState;
      delete that.startDate;
      delete that.endDate;
      delete that.startTime;
      delete that.endTime;
    }

    checkValid(dateTime);

    if (error && value) {
      that.setValue(
        options.range ? (that.endDate ? that.parse() : '') : that.parse()
      );
    }
    fn && fn();
    return that;
  };

  // 重写选择日期
  Class.prototype.choose = function (td) {
    var that = this
      , options = that.config
      , dateTime = options.dateTime

      , tds = lay(that.elem).find('td')
      , YMD = td.attr('lay-ymd').split('-')

      , setDateTime = function (one) {
      var thisDate = new Date();

      //同步dateTime
      one && lay.extend(dateTime, YMD);

      //记录开始日期
      if (options.range) {
        that.startDate ? lay.extend(that.startDate, YMD) : (
          that.startDate = lay.extend({}, YMD, that.startTime)
        );
        that.startYMD = YMD;
      }

      if (options.dateTimes) {
        // 多选的时候的处理
        if (td.hasClass(THIS)) {
          var indexTemp = -1;
          lay.each(options.dateTimes, function (index, date) {
            if (date.year === YMD.year && date.month === YMD.month && date.date === YMD.date) {
              indexTemp = index;
              return true;
            }
          });
          if (indexTemp >= 0) {
            // 取消选中
            options.dateTimes.splice(indexTemp, 1);
            td.removeClass(THIS);
          }
        } else {
          options.dateTimes.push(YMD);
          td.addClass(THIS);
        }
      }
    };

    YMD = {
      year: YMD[0] | 0
      , month: (YMD[1] | 0) - 1
      , date: YMD[2] | 0
    };

    if (td.hasClass(DISABLED)) return;

    //范围选择
    if (options.range) {

      lay.each(['startTime', 'endTime'], function (i, item) {
        that[item] = that[item] || {
          hours: 0
          , minutes: 0
          , seconds: 0
        };
      });

      if (that.endState) { //重新选择
        setDateTime();
        delete that.endState;
        delete that.endDate;
        that.startState = true;
        tds.removeClass(THIS + ' ' + ELEM_SELECTED);
        td.addClass(THIS);
      } else if (that.startState) { //选中截止
        td.addClass(THIS);

        that.endDate ? lay.extend(that.endDate, YMD) : (
          that.endDate = lay.extend({}, YMD, that.endTime)
        );

        // ####源码修改 03####
        // 相同的的ymd应该也算是一个可疑的逆选，进一步校验内部时分秒
        //判断是否顺时或逆时选择
        if (that.newDate(YMD).getTime() <= that.newDate(that.startYMD).getTime()) {
          var startDate = lay.extend({}, that.endDate, {
            hours: that.startDate.hours
            , minutes: that.startDate.minutes
            , seconds: that.startDate.seconds
          });
          lay.extend(that.endDate, that.startDate, {
            hours: that.endDate.hours
            , minutes: that.endDate.minutes
            , seconds: that.endDate.seconds
          });
          that.startDate = startDate;
        }

        options.showBottom || that.done();
        that.stampRange(); //标记范围内的日期
        that.endState = true;
        if (that.newDate(YMD).getTime() === that.newDate(that.startYMD).getTime()
          && that.newDate(that.startTime).getTime() > that.newDate(that.endTime).getTime()) {
          //  如果选择的是同一天并且目前时间的选择开始时间大于结束时间那么结束状态是fasle
          that.endState = false;
        }
        that.done(null, 'change');
      } else { //选中开始
        td.addClass(THIS);
        setDateTime();
        that.startState = true;
      }
      // 应该用是否结束状态来判断是否可用，而不是简单的根据是否有结束时间来断定
      // lay(that.footer).find(ELEM_CONFIRM)[that.endDate ? 'removeClass' : 'addClass'](DISABLED);
      lay(that.footer).find(ELEM_CONFIRM)[that.endState ? 'removeClass' : 'addClass'](DISABLED);
    } else if (options.position === 'static') { //直接嵌套的选中
      setDateTime(true);
      that.calendar().done().done(null, 'change');
    } else if (options.type === 'date') {
      setDateTime(true);
      if (options.dateTimes) {
        // 多选的时候的处理
        // if (td.hasClass(THIS)) {
        //   var indexTemp = -1;
        //   lay.each(options.dateTimes, function (index, date) {
        //     if (date.year === YMD.year && date.month === YMD.month && date.date === YMD.date) {
        //       indexTemp = index;
        //       return true;
        //     }
        //   });
        //   if (indexTemp >= 0) {
        //     // 取消选中
        //     options.dateTimes.splice(indexTemp, 1);
        //     td.removeClass(THIS);
        //   }
        // } else {
        //   options.dateTimes.push(YMD);
        //   td.addClass(THIS);
        // }
      } else {
        // 原始默认的处理
        that.setValue(that.parse()).remove().done();
      }
    } else if (options.type === 'datetime') {
      setDateTime(true);
      that.calendar().done(null, 'change');
    }
  };

  //转义为规定格式的日期字符
  Class.prototype.parse = function (state, date) {
    var that = this
      , options = that.config
      , dateTime = date || (state
      ? lay.extend({}, that.endDate, that.endTime)
      : (options.range ? lay.extend({}, that.startDate, that.startTime) : options.dateTime))
      , formatTemp = that.format.concat();

    // 如果是多选的将日期排一下序
    var dates = options.dateTimes ?
      (options.dateTimes.sort(function (a, b) {
        return a.year - b.year || a.month - b.month || a.date - b.date
      })) : [dateTime];
    var res = [];
    // 针对多选日期的支持的修改
    lay.each(dates, function (index, dateTime) {
      // 复制一份
      var format = formatTemp.concat();
      //转义为规定格式
      lay.each(format, function (i, item) {
        if (/yyyy|y/.test(item)) { //年
          format[i] = lay.digit(dateTime.year, item.length);
        } else if (/MM|M/.test(item)) { //月
          format[i] = lay.digit(dateTime.month + 1, item.length);
        } else if (/dd|d/.test(item)) { //日
          format[i] = lay.digit(dateTime.date, item.length);
        } else if (/HH|H/.test(item)) { //时
          format[i] = lay.digit(dateTime.hours, item.length);
        } else if (/mm|m/.test(item)) { //分
          format[i] = lay.digit(dateTime.minutes, item.length);
        } else if (/ss|s/.test(item)) { //秒
          format[i] = lay.digit(dateTime.seconds, item.length);
        }
      });

      //返回日期范围字符
      if (options.range && !state) {
        res.push(format.join('') + ' ' + options.range + ' ' + that.parse(1));
      } else {
        res.push(format.join(''));
      }
    });

    return res.join(options.multiple ? options.multiple : '');
  };

  //日历表
  Class.prototype.calendar = function (value) {
    var that = this
      , options = that.config
      , dateTime = value || options.dateTime
      , thisDate = new Date(), startWeek, prevMaxDate, thisMaxDate
      , lang = that.lang()

      , isAlone = options.type !== 'date' && options.type !== 'datetime'
      , index = value ? 1 : 0
      , tds = lay(that.table[index]).find('td')
      , elemYM = lay(that.elemHeader[index][2]).find('span');

    if (dateTime.year < LIMIT_YEAR[0]) dateTime.year = LIMIT_YEAR[0], that.hint('最低只能支持到公元' + LIMIT_YEAR[0] + '年');
    if (dateTime.year > LIMIT_YEAR[1]) dateTime.year = LIMIT_YEAR[1], that.hint('最高只能支持到公元' + LIMIT_YEAR[1] + '年');

    //记录初始值
    if (!that.firstDate) {
      that.firstDate = lay.extend({}, dateTime);
    }

    //计算当前月第一天的星期
    thisDate.setFullYear(dateTime.year, dateTime.month, 1);
    // startWeek = thisDate.getDay();
    // ####源码修改 06#### 新增可以设置一周的第一天是什么的配置
    startWeek = (thisDate.getDay() + (7 - options.weekStart)) % 7;

    prevMaxDate = laydate.getEndDate(dateTime.month || 12, dateTime.year); //计算上个月的最后一天
    thisMaxDate = laydate.getEndDate(dateTime.month + 1, dateTime.year); //计算当前月的最后一天
    // 得到当前多选的选中的年-月-日集合
    var dates = options.dateTimes ? options.dateTimes.map(function (value1) {
      return value1.year + '-' + (value1.month + 1) + '-' + value1.date
    }) : [];

    //赋值日
    lay.each(tds, function (index, item) {
      var YMD = [dateTime.year, dateTime.month], st = 0;
      item = lay(item);
      item.removeAttr('class');
      if (index < startWeek) {
        st = prevMaxDate - startWeek + index;
        item.addClass('laydate-day-prev');
        YMD = that.getAsYM(dateTime.year, dateTime.month, 'sub');
      } else if (index >= startWeek && index < thisMaxDate + startWeek) {
        st = index - startWeek;
        // ######## 只有单选才可以直接标注为选中
        if (!options.range && !options.dateTimes) {
          st + 1 === dateTime.date && item.addClass(THIS);
        }
      } else {
        st = index - thisMaxDate - startWeek;
        item.addClass('laydate-day-next');
        YMD = that.getAsYM(dateTime.year, dateTime.month);
      }
      YMD[1]++;
      YMD[2] = st + 1;
      // ####源码修改 07#### 给日历的td里面添加一个div方便后面支持更丰富的样式
      item.attr('lay-ymd', YMD.join('-')).html('<div>' + YMD[2] + '</div>');
      // 如果多选的话会给需要选中的添加THIS
      if (dates.indexOf(item.attr('lay-ymd')) !== -1) {
        item.addClass(THIS);
      }
      that.mark(item, YMD).limit(item, {
        year: YMD[0]
        , month: YMD[1] - 1
        , date: YMD[2]
      }, index);
    });

    //同步头部年月
    lay(elemYM[0]).attr('lay-ym', dateTime.year + '-' + (dateTime.month + 1));
    lay(elemYM[1]).attr('lay-ym', dateTime.year + '-' + (dateTime.month + 1));

    if (options.lang === 'cn') {
      lay(elemYM[0]).attr('lay-type', 'year').html(dateTime.year + '年');
      lay(elemYM[1]).attr('lay-type', 'month').html((dateTime.month + 1) + '月');
    } else {
      lay(elemYM[0]).attr('lay-type', 'month').html(lang.month[dateTime.month]);
      lay(elemYM[1]).attr('lay-type', 'year').html(dateTime.year);
    }

    //初始默认选择器
    if (isAlone) {
      if (options.range) {
        value ? that.endDate = (that.endDate || {
          year: dateTime.year + (options.type === 'year' ? 1 : 0)
          , month: dateTime.month + (options.type === 'month' ? 0 : -1)
        }) : (that.startDate = that.startDate || {
          year: dateTime.year
          , month: dateTime.month
        });
        if (value) {
          that.listYM = [
            [that.startDate.year, that.startDate.month + 1]
            , [that.endDate.year, that.endDate.month + 1]
          ];
          that.list(options.type, 0).list(options.type, 1);
          //同步按钮可点状态
          options.type === 'time' ? that.setBtnStatus('时间'
            , lay.extend({}, that.systemDate(), that.startTime)
            , lay.extend({}, that.systemDate(), that.endTime)
          ) : that.setBtnStatus(true);
        }
      }
      if (!options.range) {
        that.listYM = [[dateTime.year, dateTime.month + 1]];
        that.list(options.type, 0);
      }
    }

    //赋值双日历
    if (options.range && !value) {
      var EYM = that.getAsYM(dateTime.year, dateTime.month)
      that.calendar(lay.extend({}, dateTime, {
        year: EYM[0]
        , month: EYM[1]
      }));
    }

    //通过检测当前有效日期，来设定确定按钮是否可点
    if (!options.range) that.limit(lay(that.footer).find(ELEM_CONFIRM), null, 0, ['hours', 'minutes', 'seconds']);

    //标记选择范围
    if (options.range && value && !isAlone) that.stampRange();
    return that;
  };

  //重载
  Class.prototype.reload = function (config) {
    var that = this;
    $.extend(true, that.config, config);
  };

  // 缓存原始的laydate.render
  var laydateRender = laydate.render;

  // 对laydate的入口render进行改造
  laydate.render = function (config) {
    var retObj;
    // 遍历地渲染
    $.each($(config.elem), function (index, elem) {
      var elemTemp = $(elem);
      // 获得节点上保存的lay-data设置
      var setting = elemTemp.attr('lay-data');

      if (setting) {
        try {
          setting = new Function('return ' + setting)();
        } catch (e) {
          console.error('Laydate element property lay-data configuration item has a syntax error: ' + setting);
        }
      }
      setting = setting || {};
      // 不允许在lay-data中使用设置elem,实际elem应该就是当前的节点，所以在lay-data里面设置是没有任何意义且不合理的，直接屏蔽掉
      delete setting.elem;

      // 去掉原始节点中的eventHandler还有lay-key,这个操作是为了通过再次render的时候能render上用的
      elem.eventHandler = false;
      elemTemp.attr('lay-key', null);

      // 得到新的配置信息
      var configNew = $.extend(true, {}, config, {elem: elem}, setting);

      if (configNew.range && configNew.rangeType === 'divide') {
        return divideRange(configNew);
      }

      // 设置了一周的开始是周几，此处做一个控制
      if (configNew.weekStart || configNew.weekStart === 0) {
        if (!/^[0-6]$/.test(configNew.weekStart)) {
          if (/^[日, 一, 二, 三, 四, 五, 六]$/.test(configNew.weekStart)) {
            // 中文的
            configNew.weekStart = weekText.cn.indexOf(configNew.weekStart);
          } else {
            configNew.weekStart = weekText.en.indexOf(configNew.weekStart);
            if (configNew.weekStart === -1) {
              configNew.weekStart = 0;
            }
          }
        }
      }

      // 扩展类型，季度
      if (configNew.type === 'quarter') {
        configNew.type = 'month';
        configNew.subType = 'quarter';
        configNew.format = configNew.format || 'yyyy年第M季度';
      }

      // 多选控制
      if (configNew.multiple && typeof configNew.multiple === 'string' && (!configNew.type || configNew.type === 'date') && !configNew.range) {
        // 只有date类型的才支持多选
        configNew.dateTimes = [];
      } else {
        // 不设置多选或者不满足多选的条件
        configNew.multiple = false;
        configNew.dateTimes = null;
      }

      // 设置了全面板模式
      if (configNew.fullPanel) {
        if (configNew.type !== 'datetime' || configNew.range) {
          // 目前只支持datetime的全面板
          delete configNew.fullPanel;
        }
      }

      // 遍历的去执行原来的render初始化，如果节点上设置了config的配置，优先级高于render中的config
      var laydateIns = laydateRender(configNew);
      instance[laydateIns.obj.index] = laydateIns;
      if (!index) {
        retObj = laydateIns;
      }

      var readyFn = laydateIns.config.ready;
      laydateIns.config.ready = function (date) {
        var that = this;
        init(laydateIns.obj);
        typeof readyFn === 'function' && readyFn.call(that, date);
      };

      var changeFn = laydateIns.config.change;
      laydateIns.config.change = function (value, date, endDate) {
        var that = this;
        init(laydateIns.obj, true);
        typeof changeFn === 'function' && changeFn.call(that, value, date, endDate);
      };

      // 处理laydate视图的渲染的逻辑，校验已过期的实例就不再渲染了。
      var renderFn = laydateIns.obj.render;
      laydateIns.obj.render = function () {
        var that = this;
        // 校验当前的实例是否是有效的，已过期的不做处理
        if (that.index.toString() === that.config.elem.attr('lay-key')) {
          renderFn.call(that);
        }
      }
    });

    return retObj;
  };

  return laydatePro;
});
