---
title: 校园社交平台（SpringBoot+React前后端分离项目）
date: 2023/09/07
tags:
- SpringBoot
- React
- 前后端分离
categories:
- 项目
---
![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/8422e33c32692843f3be994fc10ae42e_ae8b8b43614749a391f3a1ca5f9a9ba2.png)
**项目已开源，欢迎star！！！**

**项目gitee地址：**[校园社交平台: ⭐基于React+Spring Boot的前后端分离项目。校园社交平台，旨在为大学校园提供一个社交平台，通过发布动态为校园学生提供分享校园生活，交友，求助，二手交易等需求。](https://gitee.com/hongxiaCoder/campus-social)

## 项目介绍

校园社交平台，旨在为大学校园提供一个社交平台，通过发布动态为校园学生提供分享校园生活，交友，求助，二手交易等需求。同时管理员可对动态、用户管理，包括进行包括增、删、改、查等操作。

本项目技术栈包括React、Spring Boot等，是一个前后端分离项目。

⭐主要功能：

- 用户登录、注册、退出登录
- 发布动态、游览动态、点赞动态
- 修改个人信息
- 用户管理（管理员）
  - 查询所有用户
  - 修改用户信息
  - 添加用户
  - 删除用户
- 帖子管理（管理员）
  - 查询所有帖子
  - 添加帖子
  - 删除帖子
  - 帖子审核（通过、拒绝）

## 适合人群

本项目实质上是一个管理系统+帖子系统，通过学习本项目，你将掌握基本的管理系统的实现和动态展示及发布，适合人群包括：

- 刚学习完或想学习Spring Boot，适合作为Spring Boot入门学习项目
- 想学习实现管理系统的同学（包括且不限于用户管理、学生管理、图书管理等）
- 想学习实现发布动态（帖子）系统
- 想学习如何实现前后端分离项目
- 想要打造校园社交、交流、交易平台，进行二次开发并投入使用
- 想要做软件项目课程的作业
- 想要做软件毕业设计

## 项目特色

- 手把手教学如何启动前、后端项目
- 手把手教学快速了解和上手项目、代码
- 手把手教学如何修改前端样式，将页面文字改成自己的需求
- 配套详细的E-R图，用例图，用例描述
- 详细的业务逻辑流程介绍

## 项目展示

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907131207.png)

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907131217.png)

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907131224.png)

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907131233.png)

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907131304.png)

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907131313.png)

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907131322.png)

## 技术选型

前端：

- HTML + CSS + JavaScript三件套

- React开发框架（前端开发框架）
- Umi开发框架（对React的进一步封装）
- Ant Design组件库（便于前端开发的组件）

后端：

- Java
- Spring（依赖注入框架，帮助你管理 Java 对象，集成一些其他的内容）
- Spring MVC（web 框架，提供接口访问、restful接口等能力）
- Mybatis（Java 操作数据库的框架，持久层框架，对 jdbc 的封装）
- MyBatis-Plus（对 mybatis 的增强，不用写 sql 也能实现增删改查）
- Spring Boot（快速启动 / 快速集成项目。不用自己管理 spring 配置，不用自己整合各种框架）
- jUnit 单元测试库（便于对代码进行测试）
- MySQL 数据库

## 项目启动

### 前端

（需要下载node.js，npm或yarn，文档末尾《知识补充》有相关介绍和下载安装教程）

环境要求：Node.js 版本推荐16-17

1.使用开发工具（VsCode或WebStorm等）打开前端项目文件

2.终端输入执行以下命令：

安装依赖：

npm install
启动：

npm start
部署（需要将项目部署到服务器中执行）：

npm build
执行命令后会得到 dist 目录，可以放到自己的 web 服务器指定的路径；也可以使用 Docker 容器部署，将 dist、Dockerfile、docker 目录（文件）一起打包即可。

### 后端

使用IDEA开发工具打开项目文件并启动，由于是SpringBoot项目，所以需要进行tomcat等配置。

如果从未配置过，请自行百度。

## 快速上手

想要快速上手了解项目，推荐先阅读文档中的代码目录结构。对整个项目有个全局的了解，再然后是具体代码。

⭐最快了解和上手项目具体代码（前端或后端）的方法，就是询问chatGPT！！！

具体方法是将某个文件的代码复制到chatGPT中，chatGPT会给出该段代码的解释，能够帮助快速了解代码。对代码全局了解之后，如果仍有不清楚的部分或语法都可以继续向GPT发起提问。

（如果你仍不清楚如何访问chatGTP，请阅读文末《知识补充》）

举个例子
比如我们对前端项目某个部分的代码不了解，我们直接复制代码询问chatGPT

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907131820.png)

chatGPT给出解释

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907131829.png)

## 系统设计图

❤数据库设计E-R图

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907131841.png)

❤系统用例图

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907131910.png)

## 代码讲解

### 目录结构（后端）

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907131933.png)

### 业务逻辑（后端）

#### 用户注册

1、用户在前端输入用户账号、密码、二次密码

2、后端根据用户账号、密码、二次密码进行校验

- 非空

- 用户账号长度不小于4位

- 密码长度不小于8位

- 校验特殊字符

- 校验用户账号是否已存在

- 密码和二次密码是否相同

3、对密码进行加密

4、将数据保存到数据库中

#### 帖子发布

1、用户在前端输入帖子内容后点击发布

2、后端根据请求参数进行校验

- 请求参数非空

- 帖子ID大于0

- 是否登录

- 帖子内容非空

- 帖子长度不大于8192

- 帖子内容是否包含非法词汇

3、将帖子数据更新到数据库

#### 帖子审核

1、用户在前端输入帖子内容后点击发布

2、后端根据请求参数帖子ID，帖子状态进行校验

- 请求参数非空

- 帖子ID大于0

- 是否为管理员

3、将帖子状态数据更新到数据库

#### 帖子点赞

1、用户在前端对某一个帖子点击点赞按钮

2、后端根据请求参数帖子ID进行校验

- 请求参数非空

- 帖子ID大于0

- 是否登录

- 帖子是否存在

- 用户是否已点赞

3、将帖子点赞数据更新到数据库，同时使用事务处理

## 知识补充

### Node.js

在 Node.js 之前，JavaScript 只能运行在浏览器中，作为网页脚本使用，为网页添加一些特效，或者和服务器进行通信。有了 Node.js 以后，JavaScript 就可以脱离浏览器，像其它编程语言一样直接在计算机上使用，想干什么就干什么，再也不受浏览器的限制了。

Node.js 不是一门新的编程语言，也不是一个 JavaScript 框架，它是一套 JavaScript 运行环境，用来支持 JavaScript 代码的执行。用编程术语来讲，Node.js 是一个 JavaScript 运行时（Runtime）。

### npm

npm 是 Node.js 的包管理工具，用来安装各种 Node.js 的扩展。

npm 是 JavaScript 的包管理工具，也是世界上最大的软件注册表。有超过 60 万个 JavaScript 代码包可供下载，每周下载约 30 亿次。npm 让 JavaScript 开发人员可以轻松地使用其他开发人员共享的代码。

#### 下载安装

直接百度到官网下载安装。node下载16-17，不要下载18

检查是否安装成功

```
node -v
npm -v
```

安装淘宝镜像

```
npm config set registry https://registry.npm.taobao.org
```

3.yarn
Yarn是 Facebook 公司贡献的 Javascript 包管理器

使用命令下载安装

```
npm install -g yarn
```

如果上条命令安装失败，则尝试

```
sudo npm install -g yarn
```

**项目已开源，欢迎star！！！**

**项目gitee地址：**[校园社交平台: ⭐基于React+Spring Boot的前后端分离项目。校园社交平台，旨在为大学校园提供一个社交平台，通过发布动态为校园学生提供分享校园生活，交友，求助，二手交易等需求。](https://gitee.com/hongxiaCoder/campus-social)