# 1.存储引擎

## MySQL体系结构

![](https://img.hongxiac.com/image/202309091635453.png)

-  连接层：最上面是一些客户端和链接服务，主要完成一些类似于连接处理、授权认证、及相关的安全方案。服务器也会为安全接入的每个客户端验证它所具有的操作权限
-  服务层：第二层架构完成大多数的核心服务功能，如SQL接口，并完成缓存的查询，SQL的分析和优化，部分内置函数的执行。所有跨存储引擎的功能也在这一层实现，如过程、函数等
-  引擎层：存储引擎真正的负责了MySQL中数据的存储和提取。服务器通过API和存储引擎进行通信。不同的存储引擎具有不同的功能，这样我们可以根据自己的需要，来选择合适的存储引擎
-  存储层：主要是将数据存储在文件系统上，并完成与存储引擎的交互

## 存储引擎简介

存储引擎就是存储数据，建立索引、更新/查询数据等技术的实现方式。存储引擎是基于表的，而不是基于库的，所以存储引擎也可被称为表类型

1.在创建表的时候，指定存储引擎

```
create table 表名(
	字段1 字段1类型
	......
)engine = innodb;
```

2.查看当前数据库支持的存储引擎

```
show engines;
```

## 存储引擎特点

### InnoDB

介绍：

InnoDB是一种兼顾高可靠性和高性能的通用存储引擎，在MySQL是默认的MySQL存储引擎

特点 ：

DML操作遵循ACID模型，支持**事务**；

**行级锁**，提高并发访问性能；

支持**外键**foreign key约束，保证数据的完整性和正确性；

文件

xxx.idb : xxx代表的是表名，innoDB引擎的每张表都会对应这样一个表空间文件，存储该表的表结构（frm，sdi），数据和索引

![](https://img.hongxiac.com/image/202309091635686.png)

### MyISAM

介绍：

MyISAM是MySQL早期的默认存储引擎

特点：

不支持事务，不支持外键

支持表锁，不支持行锁

访问速度快

### Memory

介绍：

Memory引擎的表数据是存储在内存中的，由于受到硬件问题，或断电问题的影响，只能将这些表作为临时表或缓存使用

特点：

内存存放

hash索引

文件：

xxx.sdi:存储表结构信息

![](https://img.hongxiac.com/image/202309091636026.png)

## 存储引擎的选择

在选择存储引擎时，应该**根据应用系统的特点**选择合适的存储引擎。对于复杂的应用系统，还可以根据实际情况选择多种存储引擎进行组合

- InnoDB：是MySQL的默认存储引擎，支持事务，外键。如果应用**对事务的完整性有比较高的要求**，在并发条件下要求数据的一致性，数据操作除了插入和查询之外，还包含很多的更新、删除操作，那么InnoDB存储引擎是比较合适的选择
- MyISAM：如果应用是**以读操作和插入操作为主**，只有很少的更新和删除操作，并且对事务的完整性、并发性要求不是很高，那么选择这个存储引擎是非常合适的
- MEMORY：将所有数据**保存在内存**中，访问速度快，通常用于临时表及缓存。缺陷就是对表的结构有限制，太大的表无法缓存在内存中，而且无法保障数据的安全性 