/**
 *
 @Name：load 引入其他的js
 @Author：岁月小偷
 @License：MIT

 */
layui.define(['jquery'], function (exports) {
  "use strict";
  var modelName = 'load';
  var version = '0.0.1';
  // 适配一些常见的需要依赖jquery的第三方库
  window.$ = window.jQuery = window.jQuery || layui.$;

  // 判断一个变量是不是数组
  // var isArray = function (obj) {
  //   return Object.prototype.toString.call(obj) === '[object Array]';
  // };

  // 设置组件的路径和then回调
  var config = function (option) {
    layui.each(option, function (key, value) {
      if (!config.option[key]) {
        config.option[key] = value;
      }
    });
  };
  config.option = {};

  // 根据配置信息做一些准备工作，主要完成模块的layui.extend和layui.define
  var ready = function (modelOne) {
    var option = config.option[modelOne]||{};
    if (!layui.cache.status[modelOne]) {
      option.extend = option.extend ? (option.extend.constructor === Array ? option.extend : [option.extend]) : [];
      layui.each(option.extend, function (index) {
        ready(option.extend[index]);
      });

      if (option.path) {
        var extend = {};
        extend[modelOne] = option.path;
        // 设置路径
        layui.extend(extend);
      }

      // 定义成layui的模块
      layui.define(option.extend||[], function (exports) {
        exports(modelOne, {});
      });
    }
  };

  var then = function (modelOne) {
    var option = config.option[modelOne]||{};

    if (!option.ready) {
      layui.each(option.extend, function (index) {
        then(option.extend[index]);
      });

      // 可以在then回调中返回layui[modelName] 对应的值
      layui[modelOne] = typeof option.then === 'function' ? option.then() : layui[modelOne];

      option.ready = true;
    }
  };

  // 核心的方法
  var load = function (name, done) {
    name = name.constructor === Array ? name : [name];
    layui.each(name, function (index, modelOne) {
      ready(modelOne)
    });

    // 初始化use
    layui.use(name, function () {
      layui.each(name, function (index, modelOne) {
        // 执行then回调
        then(modelOne);
      });

      typeof done === 'function' && done();
    });
  };

  load.version = version;
  load.config = config;

  exports(modelName, load);
});
