---
title: 常用git命令
date: 2023/08/23

---

::: tip 介绍
这篇文章主要介绍了常见的git命令，帮助编程学习者快速入门git命令。
:::

## 获取git仓库-从远程仓库克隆

1. 新建一个目录/文件夹，作为本地仓库
2. 在该目录下打开git命令窗口
3. 输入命令：

```
git clone 远程git仓库地址
```



## 本地仓库操作命令

```
git init     本地创建仓库
git status   查看文件状态
git add ***     将文件的修改加入暂存区
git reset ***   将暂存区的文件取消暂存
git commit -m "信息" [*或指定文件]   将暂存区的文件修改提交到版本库(本地仓库)
git log      查看日志
git reset --hard [版本号]     切换指定版本
版本号可通过git log 查看
```

> 先add到暂存区，后commit到本地仓库（版本库），本地仓库的内容才能push到远程仓库，进行合并

> 本地仓库的可以是从远程仓库克隆，也可以是本地创建（git init）。
>
> 如果是本地创建的仓库，并且仓库中存在文件，此时再从远程仓库拉取文件时会报错（fatal：refusing to merge unrelated histories）。
>
> 解决此问题可以在git pull 命令后加入参数 --allow-unrelated-histories

## 远程仓库操作命令

```
git remote 查看远程仓库（若无显示则表示没有关联）
git remote -v 查看远程仓库及其网络地址
git remote add <shortname> <url> 添加远程仓库
git clone <url> 从远程仓库克隆
git pull [short-name] [branch-name] 从远程仓库拉取
git push [remote-name] [branch-name]推送到远程仓库
```

> origin是远程仓库的简称
>
> short-name是远程仓库的别名
>
> branch-name是分支名

## 分支操作命令

> 分支意味着你可以把你的工作从开发主线上分离开来，以免影响开发主线。
>
> 同一个仓库可以有多个分支，各个分支相互独立，互不干扰。

```
git branch 查看所有本地分支
git branch -r  查看所有远程分支
git branch -a  查看所有本地分支和远程分支
git branch [name] 创建分支
git checkout [name] 切换分支
git push [short-name] [branch-name] 推送好远程仓库某个分支
git merge [branch-name] 在当前分支合并branch-name分支
```





## IDEA中使用Git

## 理论知识

> 版本库：.git隐藏文件夹就是版本库，存储了很多配置信息、日志信息和文件版本信息等，不要改动
>
> 工作区：包含.git文件夹的目录就是工作区，也成为工作目录，主要用于存放开发的代码
>
> 暂存区：.git文件夹中有一个index文件，就是暂存区，也叫stage，是一个临时保存修改文件的地方


> 工作区文件状态：
>
> - untracked 未跟踪（未被纳入版本控制）
> - tracked 已跟踪（被纳入版本控制）
>   - Unmodified 未修改状态
>   - Modified 已修改状态
>   - Staged 已暂存状态