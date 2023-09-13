# 4.约束

1. 概念；约束是作用于**表中字段**上的规则，用于限制存储在表中的数据

2. 目的：保证数据库中数据的安全，有效性和完整性

3. 分类：

   ![](https://img.hongxiac.com/image/202309091635575.png)

- not null
- unique
- primary key
- default
- check()
- default ...

**注意：**约束是**作用于表中字段**上的，可以在创建表/修改表的时候添加约束，多个约束间空格隔开

## 外键约束

外键用来让两张表的数据之间建立连接，从而保证数据的一致性和完整性

添加外键：

```
create table 表名(
	字段名 数据类型
	...
	[constraint] [外键名称] foreign key (外键字段名) references (主表列名)
);
```

```
alter table 表名 add constraint 外键名称 foreign key(外键字段名) references 主表（主表列名）;
```

删除外键：

```
alter table 表名 drop foreign key 外键名称;
```

删除/更新行为

![](https://img.hongxiac.com/image/202309091635582.png)

- no action  不允许删除/更新(默认)
- restrict  不允许删除/更新
- cascade  同时删除/更新外键在子表中的记录
- set null  设置子表中该外键值为null
- set default  设置子表中该外键值为默认的值

```
alter table 表名 add constraint 外键名称 foreign key (外键字段) references 主表名（主表字段名）on update cascade on delete cascade;
```
