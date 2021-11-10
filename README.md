# mylayui

基于layui，结合自身项目中遇到的问题还有社区中积累的一些经验生成的旨在尽量满足通用性的前提下更加的面向应用，包括一些bug修复、功能拓展。

## 如何使用

```html

<script src="mylayui/layui.js"></script>
```

通过script引入到项目中，剩下的基本使用方式跟layui的基本无异，所以mylayui是面向layui的使用人员，或者刚接触layui对其有兴趣的开发人员。所以要熟悉layui才能用好这个mylayui，[文档](https://sunxiaobin89.github.io/mylayui/doc/api.html)
也在积极的开发中，都是一个人手动码，加上语言组织能力有限，进度估计比较慢，有错误的地方请不吝指正。


## [阅读文档](https://sunxiaobin89.github.io/mylayui/doc/api.html)

文档地址[https://sunxiaobin89.github.io/mylayui/doc/api.html](https://sunxiaobin89.github.io/mylayui/doc/api.html)
内含demo。注意的一点是mylayui的文档中只会列出跟layui不同的一些地方，基础的文档请自行到[layui官方文档](https://www.layuion.com/doc/) 查阅，本文档不再赘述。
关于layui官方网站(layui.com)下线，可以关注[https://gitee.com/layui](https://gitee.com/layui) , [https://www.layuion.com](https://www.layuion.com)
也可以从一些热心用户备份的镜像在线文档站点查看layui文档，如：[https://layui.site/](https://layui.site/)

## 关于压缩混淆k

为了开发更加方便，git上不直接提供dist或者release版本的文件，大家如果想要用到生产环境上希望用压缩混淆的文件的话，可以clone本项目，然后在根目录，也就是```package.json```
所在的目录下，执行```npm install```将需要的资源准备好，再执行```gulp```就可以打包出release的文件