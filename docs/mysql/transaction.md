# 6.事务

## 事务简介

事务是一组操作的集合，它是不可分割的工作单位，事务会把所有操作作为一个整体一起向系统提交或撤销操作请求，即这些操作**要么同时成功，要么同时失败**，如银行转账

只有DML才有事务这么一说，其他语句和事务无关

![](https://img.hongxiac.com/image/202309091635537.png)

## 事务操作

**方式1：**

查看/设置事务的提交方式

```
select @@ autocommit;
set @@autocommit = 0;
```

提交事务

```
commit;
```

回滚事务

```
rollback;
```

**方式2：**

开启事务

```
start transaction 或 begin;
```

提交事务

```
commit;
```

回滚事务

```
rollback;
```

## 事务四大特性ACID

- 原子性（Atomicity）：事务是不可分割的最小操作单元，要么全部成功，要么全部失败
- 一致性（Consistency）：事务完成时，必须使所有的数据都保持一致状态
- 隔离性（Isolation）：数据库系统提供隔离机制，保证事务在不受外部并发操作影响的独立环境下运行
- 持久性（Durability）：事务一旦提交或回滚，它对数据库中的数据的改变就是永久的

## 并发事务问题

- 脏读：一个事务读到另一个事务还没有提交的数据
- 不可重复读：一个事务先后读取同一条记录，但两次读取的数据不同，称之为不可重复读
- 幻读：一个事务按照条件查询数据时，没有对应的数据行，但是在插入数据时，又发现这条数据行已经存在，（如果解决了不可重复读，查select的时候又不在；如果没有解决不可重复读，select的时候便存在）好像出现“幻影”

## 事务隔离级别

![](https://img.hongxiac.com/image/202309091635861.png)

- read uncommitted   读未提交
- read committed   读已提交
- repeatable read   可重复读
- serializable   可串行化

查看事务隔离级别

```
select @@transaction_isolation;
```

设置事务隔离级别

```
set [session|global] transaction isolation level {read uncommitted | read committed | repeatable ead | serializable}
```

**注意：事务隔离级别越高，数据越安全，但性能越低**