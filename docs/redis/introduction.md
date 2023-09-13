---
date: 2023/09/06
categories:
- redis
---

# 一、Redis入门

## 1.认识NoSQL



### 1.1	什么是NoSQL

---

- NoSQL最常见的解释是"`non-relational`"， 很多人也说它是"***Not Only SQL***"
- NoSQL仅仅是一个概念，泛指**非关系型的数据库**
- 区别于关系数据库，它们不保证关系数据的ACID特性
- NoSQL是一项全新的数据库革命性运动，提倡运用非关系型的数据存储，相对于铺天盖地的关系型数据库运用，这一概念无疑是一种全新的思维的注入
- 常见的NoSQL数据库有：`Redis`、`MemCache`、`MongoDB`等



### 1.2	NoSQL与SQL的差异

---

|          |                            SQL                             |                            NoSQL                             |
| :------: | :--------------------------------------------------------: | :----------------------------------------------------------: |
| 数据结构 |                           结构化                           |                           非结构化                           |
| 数据关联 |                           关联的                           |                           无关联的                           |
| 查询方式 |                          SQL查询                           |                            非SQL                             |
| 事务特性 |                            ACID                            |                             BASE                             |
| 存储方式 |                            磁盘                            |                             内存                             |
|  扩展性  |                            垂直                            |                             水平                             |
| 使用场景 | 1）数据结构固定<br>2）相关业务对数据安全性、一致性要求较高 | 1）数据结构不固定<br>2）对一致性、安全性要求不高<br>3）对性能要求 |



## 2.认识Redis

> Redis诞生于2009年全称是Remote Dictionary Server，远程词典服务器，是一个基于内存的键值型NoSQL数据库。

**Redis的特征：**

- 键值（`key-value`）型，value支持多种不同数据结构，功能丰富
- 单线程，每个命令具备原子性
- 低延迟，速度快（基于内存、IO多路复用、良好的编码）。
- 支持数据持久化
- 支持主从集群、分片集群
- 支持多语言客户端



## 3.安装Redis

### 3.1	前置准备

---

> 本次安装Redis是基于Linux系统下安装的，因此需要一台Linux服务器或者虚拟机。
>
> Ps：由于提供的CentOS操作系统为mini版，因此需要自行配置网络，不会配置的请联系我，如果您使用的是自己购买的服务器，请提前开放`6379`端口，避免后续出现的莫名其妙的错误！

- **虚拟机**：[VMware16](https://pan.baidu.com/s/1Zn13h9G7MtSgz-xdkQFeJg?pwd=1234)
- **操作系统**：[CentOS-7-x86_64-Minimal-1708](https://pan.baidu.com/s/1SiYip29cYqiNBqjGGV0JgA?pwd=1234)

- **Redis**：[redis-6.2.6.tar](https://pan.baidu.com/s/1hsoEz1NTCDCCWZmaiZrIgg?pwd=1234)
- **xShell及xFtp**：https://www.xshell.com/zh/free-for-home-school/



### 3.2	安装Redis依赖

---

> Redis是基于C语言编写的，因此首先需要安装Redis所需要的gcc依赖

```sh
yum install -y gcc tcl
```

**安装成功如下图所示：**

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230906161003.png)



### 3.3	正式安装Redis

---

- **将`redis-6.2.6.tar`上传至`/usr/local/src`目录**

  ![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230906161014.png)

- **在xShell中`cd`到`/usr/local/src`目录执行以下命令进行解压操作**

  ```sh
  tar -xzf redis-6.2.6.tar.gz
  ```

- **解压成功后依次执行以下命令**

  ```sh
  cd redis-6.2.6
  make
  make install
  ```

- **安装成功后打开/usr/local/bin目录（该目录为Redis默认的安装目录）**

  ![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230906161043.png)



## 4.启动Redis

> Redis的启动方式有很多种，例如：**前台启动**、**后台启动**、**开机自启**



### 4.1	前台启动（不推荐）

---

> **这种启动属于前台启动，会阻塞整个会话窗口，窗口关闭或者按下`CTRL + C`则Redis停止。不推荐使用。**

- **安装完成后，在任意目录输入`redis-server`命令即可启动Redis**

  ```sh
  redis-server
  ```

- **启动成功如下图所示**

  ![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230906161050.png)



### 4.2	后台启动（不推荐）

---

> **如果要让Redis以后台方式启动，则必须修改Redis配置文件，配置文件所在目录就是之前我们解压的安装包下**

- **因为我们要修改配置文件，因此我们需要先将原文件备份一份**

  ```sh
  cd /usr/local/src/redis-6.2.6
  ```

  ```sh
  cp redis.conf redis.conf.bck
  ```

- **然后修改`redis.conf`文件中的一些配置**

  ```sh
  # 允许访问的地址，默认是127.0.0.1，会导致只能在本地访问。修改为0.0.0.0则可以在任意IP访问，生产环境不要设置为0.0.0.0
  bind 0.0.0.0
  # 守护进程，修改为yes后即可后台运行
  daemonize yes 
  # 密码，设置后访问Redis必须输入密码
  requirepass 1325
  ```

- **Redis其他常用配置**

  ```sh
  # 监听的端口
  port 6379
  # 工作目录，默认是当前目录，也就是运行redis-server时的命令，日志、持久化等文件会保存在这个目录
  dir .
  # 数据库数量，设置为1，代表只使用1个库，默认有16个库，编号0~15
  databases 1
  # 设置redis能够使用的最大内存
  maxmemory 512mb
  # 日志文件，默认为空，不记录日志，可以指定日志文件名
  logfile "redis.log"
  ```

- **启动Redis**

  ```sh
  # 进入redis安装目录 
  cd /usr/local/src/redis-6.2.6
  # 启动
  redis-server redis.conf
  ```

- **查看redis进程**

  ```sh
  # 查看redis进程是否运行
  ps -ef | grep redis
  ```

- **停止Redis服务**

  ```sh
  # 通过kill命令直接杀死进程
  kill -9 redis进程id
  ```

  ```sh
  # 利用redis-cli来执行 shutdown 命令，即可停止 Redis 服务，
  # 因为之前配置了密码，因此需要通过 -a 来指定密码
  redis-cli -a 132537 shutdown
  ```



### 4.3	开机自启（推荐）

---

> **我们也可以通过配置来实现开机自启**

- **首先，新建一个系统服务文件**

  ```sh
  vi /etc/systemd/system/redis.service
  ```

- **将以下命令粘贴进去**

  ```conf
  [Unit]
  Description=redis-server
  After=network.target
  
  [Service]
  Type=forking
  ExecStart=/usr/local/bin/redis-server /usr/local/src/redis-6.2.6/redis.conf
  PrivateTmp=true
  
  [Install]
  WantedBy=multi-user.target
  ```

- **然后重载系统服务**

  ```sh
  systemctl daemon-reload
  ```

- **现在，我们可以用下面这组命令来操作redis了**

  ```sh
  # 启动
  systemctl start redis
  # 停止
  systemctl stop redis
  # 重启
  systemctl restart redis
  # 查看状态
  systemctl status redis
  ```

- **执行下面的命令，可以让redis开机自启**

  ```sh
  systemctl enable redis
  ```



