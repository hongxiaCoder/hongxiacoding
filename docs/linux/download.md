---
title: Linux下载安装
date: 2023/09/05

---
## 安装方式

- 物理机安装：直接将操作系统安装到服务器硬件上
- 虚拟机安装：通过虚拟机软件安装

**虚拟机（Virtual Machine）：**指通过软件模拟的具有完整硬件系统功能、运行在完全隔离环境中的计算机系统

常用虚拟机软件

- VMWare
- VirtualBox
- VMLite WorkStation
- Qemu
- HopeddotVOS

### 1.下载安装VMWare

### 2.下载安装CentOS镜像

### 3.网卡设置

由于启动服务器时未加载网卡，导致IP地址初始化失败

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230905112832.png)

### 4.安装SSH（Secure Shell安全外壳协议）

下载安装finalshell

建立在应用层基础上的安全协议

## 5.centos安装图形化界面（可选择）

```
安装图形化界面
sudo yum groupinstall "Server with GUI"

这个命令将会安装包含图形界面的软件包组。安装完成后，您需要重启系统来启动图形界面。您可以通过以下命令来重启系统：
sudo reboot

切换到图形界面
sudo systemctl isolate graphical.target

切换到命令行界面
sudo systemctl isolate multi-user.target
```

**注意**

1. 切换到图形界面时，需要使用sudo命令来获取管理员权限
2. 切换到图形界面后，需要使用Ctrl+Alt+F2快捷键才能返回到命令行
3. 切换到命令行后，需要使用Ctrl+Alt+F1快捷键才能返回到图形界面