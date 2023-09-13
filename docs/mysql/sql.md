# 2.SQL

## SQL分类

![](https://img.hongxiac.com/image/202309091632387.png)

## DDL-介绍

DDL英文全称是Data Defination Language(数据定义语言)，用来定义数据库对象（数据库，表，字段）

### DDL-数据库操作

查询：

查询所有数据库

```
show databases;
```

查询当前数据库

```
select database();
```

创建：

```
create database 名称
```

```
create databases [if not exists] 数据库名称 [default charset 字符集] [collate 排序规则];
不存在则创建，存在则不创建;[]为可添加的操作
```

删除：

```
drop database [if exists] 数据库名;
```

使用：

```
use 数据库名;
```

### DDL-表操作-查询

查询当前数据库所有表：

```
show tables;
```

查询表结构

```
desc 表名;
```

查询指定表的建表语句

```
show create table 表名;
```

### DDL-表操作-创建

```
create table 表名{
	字段1 字段1类型 [comment 字段1注释],
	字段2 字段2类型 [comment 字段2注释],
	......
	字段n 字段n类型 [comment 字段n注释]
} [comment 表注释];
```

注意：[...]为可选参数，不要将"[]"写入，最后一个字段后面没有逗号

### DDL-表操作-数据类型

![](https://img.hongxiac.com/image/202309091632011.png)

```
age tinyint unsigned,
```

![](https://img.hongxiac.com/image/202309091633014.png)

char(10)的长度固定，不足长度补空格,固定占用10个字符的空间，性能好

varchar(10)根据内容计算长度空间,可能不占同10个字符的空间，性能较差（因为需要计算）

![](https://img.hongxiac.com/image/202309091633033.png)

### DDL-表操作-修改

添加字段:

```
alter table 表名 add 字段名 类型（长度） [comment 注释] [];
```

修改数据类型：

```
alter table 表名 modify 字段名 新数据类型（长度）;
```

修改字段名和数据类型:

```
alter table 表名 change 旧字段名 新字段名 类型（长度） [comment 注释] [约束];
```

删除字段：

```
alter table 表名 drop 字段名;
```

修改表名：

```
alter table 表名 rename to 新表名;
```

删除表：

```
drop table [if exists] 表名;
```

删除指定表，并重新创建该表：

```
truncate table 表名;
```

**注意：在删除表时，表中的全部数据也会被删除**

## DML-介绍

DML英文全称是Data Manipulation Language(数据操作语言)，用来对数据库中表的数据记录进行增删改操作

### DML-添加数据

1.给指定字段添加数据：

```
insert into 表名（字段名1，字段名2，...） valuses (值1，值2,...);
```

2.给全部字段添加数据：

```
insert into 表名 values (值1，值2，...)；
```

3.批量添加数据：

```
insert into 表名(字段1，字段2，...) values (值1，值2，...)，(值1，值2，...);
```

```
insert into 表名 values (值1，值2,...),(值1，值2,...);
```

**注意**：

- 插入数据时，指定的字段顺序需要与值的顺序是一样的
- 字符串和日期型数据应该包含在引号中
- 插入数据的大小，应该在字段的规定范围中

### DML-修改数据

```
update 表名 set 字段名1 = 值1，字段名2 = 值2 [where 条件];
```

### DML-删除数据

```
delete from 表名 [where 条件];
```

**注意：**

- delete 语句的条件可以有，也可以没有，如果没有条件，则会删除整张表的所有数据
- delete语句不能删除某一个字段的值（可以使用update）

## DQL-介绍

DQL英文全称是Data Query Language(数据查询语言)，用来查询数据库中表的记录

### DQL-语法

1.查询多个字段：

```
select 字段1，字段2... from 表名;
```

```
select * from 表名;
```

2.设置别名：as可以省略

```
select 字段 [as 别名1]，字段2 [as 别名] ... from 表名;
```

3.去除重复记录：

```
select distinct 字段列表 from 表名;
```

### DQL-条件查询

1.语法

```
select 字段列表 from 表名 where 条件列表;
```

2.条件

![](https://img.hongxiac.com/image/202309091633348.png)

![](https://img.hongxiac.com/image/202309091633754.png)

```
查询身份证号(不)为空的员工：
select * from emp where idcard is null;
select * from emp where idcard is not null;
```

```
查询年龄在20到30之间的员工：
select * from emp where age >= 20 and age <= 30;
select * from emp where age between 20 and 30;
```

```
查询年龄为20或22或24的员工：
select * from emp where age = 20 or age = 22 or age = 24;
select * from emp where age in(20,22,24);
```

```
查询姓名为两个字的员工：
select * from emp where name like '_ _';(下划线之间没有空格)
查询身份证号最后一位为x的员工：
select *from emp where idcard like '%x';

```

### DQL-聚合函数

1.介绍

将一列数据作为一个整体，进行纵向计算

2.常见聚合函数

- count	统计数量
- max       最大值
- min        最小值
- avg         平均值
- sum        求和

3.语法

```
select 聚合函数（字段列表）[别名] from 表名;
```

**注意：所有的null值不参与聚合运算**

### DQL-分组查询

1.语法

``` 
select 字段列表 from 表名 [where 条件] group by 分组字段名 [having 分组后过滤条件];
```

2.where与having区别

- 执行时机不同：where是分组之前进行过滤，不满足where条件，不参与分组；而having是分组之后对结果进行过滤
- 判断条件不同：where不能对聚合函数进行判断，而having可以

```
根据性别分组，统计男性员工和女性员工的数量
select gender, count(*) from emp group by gender;
```

```
查询年龄小于35的员工，并根据工作地址分组，获取员工数量大于等于2的工作地址
select workaddress, count(*) address_count from emp where age <= 35 group by workaddress having address_count >= 2;
```

**注意：**

- 执行顺序：where > 聚合函数 > having
- 分组之后，**查询的字段一般为聚合函数和所分组字段**，查询其他字段无任何意义

### DQL-排序查询

1.语法

```
select 字段列表 from 表名 order by 字段1 排序方式1，字段2 排序方式2;
```

2.排序方式

ASC：升序（默认）

DESC：降序

**注意：如果是多字段排序，当地一个字段值相同时，才会根据第二个字段进行排序**

### DQL-分页查询

1.语法

```
select 字段列表 from 表名 limit 起始索引，查询记录数;
```

**注意：**

- 起始索引从0开始，起始索引 = （查询页码 - 1）* 每页显示记录数
- 分页查询是数据库的方言，不同的数据库有不同的实现，MySQL中是limit
- 如果查询的是第一页数据，起始索引可以省略，直接简写为limit 10

### 字符匹配

一般形式为：

列名 [NOT ] LIKE

匹配串中可包含如下四种**通配符**：
_：匹配任意一个字符；
%：匹配0个或多个字符；
[ ]：匹配[ ]中的任意一个字符(若要比较的字符是连续的，则可以用连字符“-”表 达 )；
[^]：不匹配[ ]中的任意一个字符。

例23．查询学生表中姓‘张’的学生的详细信息。

```sql
select * from stu where name like '张%’;
```

例24．查询姓“张”且名字是3个字的学生姓名。

```sql
select * from stu where name like '张__';
```

如果把姓名列的类型改为char(20)，在SQL Server 2012中执行没有结果。原因是姓名列的类型是char(20)，当姓名少于20个汉字时，系统在存储这些数据时自动在后边补空格，空格作为一个字符，也参加LIKE的比较。可以用rtrim()去掉右空格。

```
select * from stu where rtrim('name') like '张__';
```

例25.查询学生表中姓‘张’、姓‘李’和姓‘刘’的学生的情况。

```
select * from stu where name like '[张李刘]%';
```

例26.查询学生表表中名字的第2个字为“小”或“大”的学生的情况

```
select * from stu where name like '_[小大]%';
```

例27.查询学生表中所有不姓“刘”的学生。

```
select * from stu where name not like '刘%'；
```

例28.从学生表表中查询学号的最后一位不是2、3、5的学生信息。

```
select * from stu where name like '%[^235]';
```

**注意：like模糊查询会引起全表扫描，速度比较慢，应该尽量避免使用like关键字进行模糊查询。**



### DQL-编写和执行顺序

![](https://img.hongxiac.com/image/202309091633339.png)

## DCL-介绍

DCL英文全称是Data Control Language（数据控制语言），用来管理数据库用户、控制数据库访问的权限

### DCL-管理用户

1.查询用户

```
use mysql;
select * from user;
```

2.创建用户

```
create user '用户名'@'主机名' identified by '密码';
```

3.修改用户密码

```
alter user '用户名'@'主机名' identified with mysql_native_password by '新密码';
```

4.删除用户

```
drop user '用户名'@'主机名';
```

**注意**：

- 主机名可以使用%统配
- 这类SQL开发人员操作的比较少，主要是数据库管理员DBA使用

### DCL-权限控制

1.查询权限

```
show grants for '用户名'@'主机名';
```

2.授予权限

```
grants 权限列表（all,select,update(字段)） on 数据库名.表名 to '用户名'@'主机名';
```

3.撤销权限

```
revoke 权限列表 on 数据库名.表名 from '用户名'@'主机名'：
```

**注意：**

- 多个授权之间，使用逗号分隔
- 授权时，数据库和表名可以使用*进行统配，代表所有