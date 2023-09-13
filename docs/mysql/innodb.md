# 8.InnoDB引擎

## 逻辑存储结构

![](https://img.hongxiac.com/image/202309091643555.png)

## 架构

![](https://img.hongxiac.com/image/202309091643096.png)

### 内存架构

![](https://img.hongxiac.com/image/202309091643621.png)

![](https://img.hongxiac.com/image/202309091643181.png)

![](https://img.hongxiac.com/image/202309091643068.png)

![](https://img.hongxiac.com/image/202309091643467.png)

### 磁盘结构

![](https://img.hongxiac.com/image/202309091643046.png)

![](https://img.hongxiac.com/image/202309091644783.png)

![](https://img.hongxiac.com/image/202309091644788.png)

### 后台线程

![](https://img.hongxiac.com/image/202309091644820.png)

## 事务原理

![](https://img.hongxiac.com/image/202309091644376.png)

![](https://img.hongxiac.com/image/202309091644697.png)

![](https://img.hongxiac.com/image/202309091644150.png)

## MVCC（多版本并发控制）

### 基本概念

- 当前读

读取的是记录的最新版本，读取时还要保证其他并发事务不能修改当前记录，会对读取的记录进行加锁。对于我们日常操作，如：select...lock in share mode（共享锁）、select ... for update、update、insert、delete（排他锁）都是当前读

- 快照读

简单的select（不加锁）就是快照读，读取的是记录数据的可见版本，有可能是历史数据，不加锁，是非阻塞读。

Read Committed：每次select，都生成一个快照读

Repteatable Read：开启事务后第一个select语句才是快照读的地方

Serializable：快照读会退化为当前读

- MVCC

全称Multi-Version Concurrency Control，多版本并发控制。指维护一个数据的多个版本，使得读写操作没有冲突，快照读为MySQL实现MVCC提供了一个非阻塞读功能。MVCC的具体实现，还需要依赖于数据库记录中的三个隐式字段、undo log日志、readView.

## MVCC-实现原理

- 记录中的隐藏字段

![](https://img.hongxiac.com/image/202309091644240.png)

![](https://img.hongxiac.com/image/202309091644297.png)

```
#可查看emp.ibd
idb2sdi emp.ibd
```

- undo log

回滚日志，在insert、update、delete的时候产生的便于数据回滚的日志。

当insert的时候，产生的undo log日志只在回滚时需要，在事务提交后，可立即被删除。

而update、delete的时候，产生的undo log日志不仅在回滚时需要，在快照读时也需要，不会立即被删除。

- undo log版本链

![](https://img.hongxiac.com/image/202309091645473.png)

不同事务或相同事务对同一条记录进行修改，会导致该记录的undolog生成一条记录版本链表，链表的头部是最新的旧纪录，链表的尾部是最早的旧纪录

- readview

ReadView（读视图）是快照读SQL执行时MVCC提取数据的依据（用来确定读取版本链中的哪一个版本），记录并维护系统当前活跃的事务（即未提交的）id。

![](https://img.hongxiac.com/image/202309091645721.png)

![](https://img.hongxiac.com/image/202309091645877.png)

不同的隔离级别，生成ReadView的时机不同:

- READ COMMITTED︰在事务中每一次执行快照读时生成ReadView。
- REPEATABLE READ:仅在事务中第一次执行快照读时生成ReadView，后续复用该ReadView.

![](https://img.hongxiac.com/image/202309091645553.png)

![](https://img.hongxiac.com/image/202309091645149.png)

![](https://img.hongxiac.com/image/202309091645879.png)