##Amazing
面向java开发环境的前后端分离解决方案

###Amazing 核心功能

* 本地启动 tomcat 环境
    *  无须安装tomacat
    *  无须安装eclipse等集成开发环境
* 自动解析velocity模板
* 内置velocity-tools支持（联调时需java环境同时配置）
* 支持物理路径访问
* 支持路由映射
* 支持模板假数据联调
* 支持异步数据接口联调


### Usage

1. #####全局安装amazing
npm install -g amazing

2. #####到web工程的根目录下
cd /(webapp)

3. #####初始化本地服务器web工程加载目录
amazing -i

4. #####启动服务器
amazing
（默认端口9090）

5. #####访问本地环境
[http://localhost:9090](http://localhost:9090)

### Others

#####自定义端口号 
amazing -p 9091


###有问题反馈
在使用中有任何问题，欢迎反馈

* 邮件(ksc-fe#kingsoft.com, 把#换成@)

###致谢
感谢以下的项目,排名不分先后

* [jello](https://github.com/fex-team/jello)
