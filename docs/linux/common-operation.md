---
title: Linux常用操作
date: 2023/09/05

---
# Linux常用操作

## 软件安装

- CentOS系统使用：
  - yum [install remove search] [-y] 软件名称
    - install 安装
    - remove 卸载
    - search 搜索
    - -y，自动确认
- Ubuntu系统使用
  - apt [install remove search] [-y] 软件名称
    - install 安装
    - remove 卸载
    - search 搜索
    - -y，自动确认

> yum 和 apt 均需要root权限



## systemctl

功能：控制系统服务的启动关闭等

语法：`systemctl start | stop | restart | disable | enable | status 服务名`

- start，启动
- stop，停止
- status，查看状态
- disable，关闭开机自启
- enable，开启开机自启
- restart，重启



## 软链接

功能：创建文件、文件夹软链接（快捷方式）

语法：`ln -s 参数1 参数2`

- 参数1：被链接的
- 参数2：要链接去的地方（快捷方式的名称和存放位置）



## 日期

语法：`date [-d] [+格式化字符串]`

- -d 按照给定的字符串显示日期，一般用于日期计算

- 格式化字符串：通过特定的字符串标记，来控制显示的日期格式
  - %Y   年%y   年份后两位数字 (00..99)
  - %m   月份 (01..12)
  - %d   日 (01..31)
  - %H   小时 (00..23)
  - %M   分钟 (00..59)
  - %S   秒 (00..60)
  - %s   自 1970-01-01 00:00:00 UTC 到现在的秒数



示例：

- 按照2022-01-01的格式显示日期

  ![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230905113148.png)

- 按照2022-01-01 10:00:00的格式显示日期

  ![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230905113156.png)

- -d选项日期计算

  ![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230905113205.png)

  - 支持的时间标记为：

    ![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230905113214.png)





## 时区

修改时区为中国时区

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230905113233.png)



## ntp

功能：同步时间

安装：`yum install -y ntp`

启动管理：`systemctl start | stop | restart | status | disable | enable ntpd`



手动校准时间：`ntpdate -u ntp.aliyun.com`



## ip地址

格式：a.b.c.d

- abcd为0~255的数字



特殊IP：

- 127.0.0.1，表示本机
- 0.0.0.0
  - 可以表示本机
  - 也可以表示任意IP（看使用场景）



查看ip：`ifconfig`



## 主机名

功能：Linux系统的名称

查看：`hostname`

设置：`hostnamectl set-hostname 主机名`

查看IP地址： hostname -I



## 配置VMware固定IP

1. 修改VMware网络，参阅PPT，图太多

2. 设置Linux内部固定IP

   修改文件：`/etc/sysconfig/network-scripts/ifcfg-ens33`

   示例文件内容：

   ```shell
   TYPE="Ethernet"
   PROXY_METHOD="none"
   BROWSER_ONLY="no"
   BOOTPROTO="static"			# 改为static，固定IP
   DEFROUTE="yes"
   IPV4_FAILURE_FATAL="no"
   IPV6INIT="yes"
   IPV6_AUTOCONF="yes"
   IPV6_DEFROUTE="yes"
   IPV6_FAILURE_FATAL="no"
   IPV6_ADDR_GEN_MODE="stable-privacy"
   NAME="ens33"
   UUID="1b0011cb-0d2e-4eaa-8a11-af7d50ebc876"
   DEVICE="ens33"
   ONBOOT="yes"
   IPADDR="192.168.88.131"		# IP地址，自己设置，要匹配网络范围
   NETMASK="255.255.255.0"		# 子网掩码，固定写法255.255.255.0
   GATEWAY="192.168.88.2"		# 网关，要和VMware中配置的一致
   DNS1="192.168.88.2"			# DNS1服务器，和网关一致即可
   ```



## ps命令

功能：查看进程信息

语法：`ps -ef`，查看全部进程信息，可以搭配grep做过滤：`ps -ef | grep xxx`



## kill命令

![image-20221027221303037](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2022/10/27/20221027221303.png)



## nmap命令

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230905113318.png)



## netstat命令

功能：查看端口占用

用法：`netstat -anp | grep xxx`



## ping命令

测试网络是否联通

语法：`ping [-c num] 参数`

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230905113338.png)



## wget命令

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230905113350.png)

## curl命令

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230905113401.png)

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230905113410.png)



## top命令

功能：查看主机运行状态

语法：`top`，查看基础信息



可用选项：

![image-20221027221340729](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2022/10/27/20221027221340.png)



交互式模式中，可用快捷键：

![image-20221027221354137](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2022/10/27/20221027221354.png)



## df命令

查看磁盘占用

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230905113420.png)



## iostat命令

查看CPU、磁盘的相关信息

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230905113428.png)

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230905113437.png)



## sar命令

查看网络统计

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230905113447.png)



## 环境变量

- 临时设置：export 变量名=变量值
- 永久设置：
  - 针对用户，设置用户HOME目录内：`.bashrc`文件
  - 针对全局，设置`/etc/profile`



### PATH变量

记录了执行程序的搜索路径

可以将自定义路径加入PATH内，实现自定义命令在任意地方均可执行的效果



## $符号

可以取出指定的环境变量的值

语法：`$变量名`

示例：

`echo $PATH`，输出PATH环境变量的值

`echo ${PATH}ABC`，输出PATH环境变量的值以及ABC

如果变量名和其它内容混淆在一起，可以使用${}





## 压缩解压

### 压缩

`tar -zcvf 压缩包 被压缩1...被压缩2...被压缩N`

- -z表示使用gzip，可以不写



`zip [-r] 参数1 参数2 参数N`

- -r,被压缩的包含文件夹的时候，需要使用-r选项，和rm、cp等命令的-r效果一致



### 解压

`tar -zxvf 被解压的文件 -C 要解压去的地方`

- -z表示使用gzip，可以省略
- -C，可以省略，指定要解压去的地方，不写解压到当前目录



`unzip [-d] 参数`

- -d,指定要解压去的位置，同tar的-C选项
- 参数，被解压的zip压缩包文件



## su命令

切换用户

语法：`su [-] [用户]`

- -表示切换后加载环境变量，建议带上
- 用户可以省略，省略默认切换到root



## sudo命令

- 可以让一条普通命令带有root权限，语法：sudo其它命令
- 需要以root用户执行visudo命令，增加配置方可让普通用户有sudo命令的执行权限



比如：

```shell
itheima ALL=(ALL)       NOPASSWD: ALL
```

在visudo内配置如上内容，可以让itheima用户，无需密码直接使用`sudo`



## chmod命令

修改文件、文件夹权限



语法：`chmod [-R] 权限 参数`

- 权限，要设置的权限，比如755，表示：`rwxr-xr-x`

  ![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230905113753.png)

- 参数，被修改的文件、文件夹

- 选项-R，设置文件夹和其内部全部内容一样生效



## chown命令

修改文件、文件夹所属用户、组



语法：`chown [-R] [用户][:][用户组] 文件或文件夹`

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230905113805.png)



## 用户组管理

以下命令需root用户执行

- 创建用户组

  groupadd用户组名

- 删除用户组

  groupdel用户组名



## 用户管理

![image-20221027222407618](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2022/10/27/20221027222407.png)



## genenv命令

- `getenv group`，查看系统全部的用户组

  ![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230905113940.png)

- `getenv passwd`，查看系统全部的用户

  ![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230905113953.png)



## env命令

查看系统全部的环境变量

语法：`env`