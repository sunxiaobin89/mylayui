/**
 *
 @Name：load 无侵入的引入其他的js
 @Author：岁月小偷
 @License：MIT

 */
layui.define(['jquery'], function (exports) {
  "use strict";
  var modelName = 'load';
  var version = '0.0.2';
  // 适配一些常见的需要依赖jquery的第三方库
  window.$ = window.jQuery = window.jQuery || layui.$;

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
    var option = config.option[modelOne];
    if (option && !layui.cache.status[modelOne]) {
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
      // 添加为非异步加载
      // layui.cache.notAsync[modelOne] = true;

      // 定义成layui的模块 [mod] 换了一种实现的方式，不再define里面设置依赖，而是将组件的信息解析成一个use队列
      // layui.define(option.extend || [], function (exports) {
      layui.define(function (exports) {
        exports(modelOne, {});
      });
    }
  };

  var then = function (modelOne) {
    var option = config.option[modelOne];

    if (option && !option.ready) {
      // layui.each(option.extend, function (index) {
      //   then(option.extend[index]);
      // });

      // 可以在then回调中返回layui[modelName] 对应的值
      layui[modelOne] = typeof option.then === 'function' ? option.then() : layui[modelOne];

      option.ready = true;
    }
  };

  // 获得模块列表
  var getModelList = function (name) {
    var modelList = [];
    name = typeof name === 'string' ? [name] : name;
    layui.each(name, function (index, nameCurr) {
      var option = config.option[nameCurr];
      if (option && option.extend) {
        modelList = getModelList(option.extend).concat(modelList);
      }
    });
    return modelList.concat(name);
  };

  var uniArr = function (data) {
    var arrTemp = [];
    layui.each(data, function (index, dataTemp) {
      if (arrTemp.indexOf(dataTemp) === -1) {
        arrTemp.push(dataTemp);
      }
    });
    return arrTemp;
  };

  // 核心的方法
  var load = function (name, done) {
    name = name.constructor === Array ? name : [name];
    layui.each(name, function (index, modelOne) {
      ready(modelOne)
    });

    // 初始化use
    var listTemp = uniArr(getModelList(name));
    // console.log('user list:', listTemp);
    layui.use(listTemp, function () {
      var that = this;
      layui.each(listTemp, function (index, modelOne) {
        // 执行then回调
        then(modelOne);
      });

      typeof done === 'function' && done.call(that);
    });

    return layui;
  };

  load.version = version;
  load.config = config;

  exports(modelName, load);
});
