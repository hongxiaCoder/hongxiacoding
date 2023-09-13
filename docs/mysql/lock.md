# 7.锁

## 概述

锁是计算机**协调**多个进程或线程**并发访问**某一资源**的机制**。在数据库中，除传统的计算资源（CPU、RAM、IO）的争用以外，数据也是一种供许多用户共享的资源。如何**保证数据并发访问的一致性、有效性**是所有数据库必须解决的一个问题，锁冲突也是影响数据库并发访问性能的一个重要因素。从这个角度说，锁对数据库而言显得尤其重要，也更加复杂。

## 分类

![](https://img.hongxiac.com/image/202309091641953.png)

## 全局锁

主要应用于**全库逻辑备份**

![](https://img.hongxiac.com/image/202309091641020.png)

![](https://img.hongxiac.com/image/202309091641007.png)

备份的时候加上全局锁，对所有表进行锁定，避免逐个表备份过程中仍有业务操作在进行而导致数据不一致

![](https://img.hongxiac.com/image/202309091641325.png)

![](https://img.hongxiac.com/image/202309091641307.png)

![](https://img.hongxiac.com/image/202309091641713.png)

## 表级锁

每次锁住整张表。锁定粒度大，发生锁冲突概率最大

，并发度最低。应用在MyISAM、InnoDB、BDB等存储引擎中

![](https://img.hongxiac.com/image/202309091641021.png)

### 表锁

![](https://img.hongxiac.com/image/202309091641447.png)

加锁：

```
lock tables 表名 read/write;
```

释放锁：

```
unlock tables/客户端断开连接;
```

读锁演示：

![](https://img.hongxiac.com/image/202309091642976.png)

客户端1对表加了读锁，将表锁住后只能读不能写，不会阻塞其他客户端的读，但会阻塞其他客户端的写

写锁演示：

![](https://img.hongxiac.com/image/202309091642467.png)

客户端1对表加了写锁，该客户端既可以写又可以读，而其他客户端不能对该表进行读写，进入阻塞状态

不过尽量避免在使用 InnoDB 引擎的表使用表锁，因为表锁的颗粒度太大，会影响并发性能，**InnoDB 牛逼的地方在于实现了颗粒度更细的行级锁**。

### 元数据锁（meta data lock，MDL）

MDL加锁过程是**系统自动控制**，无需显式使用，在访问一张表的时候会自动加上。MDL锁主要作用是维护表元数据的数据一致性，在表上**有活动事务**的时候，不可以对元数据进行写入操作。**为了避免DML和DDL冲突，保证读写的正确性。**

![](https://img.hongxiac.com/image/202309091642933.png)

```sql
#客户端1
begin;#开启事务
select * from emp;#select语句，自动为表加上shared_read锁（共享读锁）
#客户端2
alter table emp add column java int;#alter语句，自动为表加上exclusive（排他锁），与shared_read锁互斥，进入阻塞状态
```

查看元数据锁：

```sql
select object_type,object_schema,object_name,lock_type,lock_duration from performance_schema.metadata_locks;
```

### 意向锁

现象：一个线程A开启了事务，执行update语句，则对该行添加了行锁；

另一个线程B执行了lock tables xxx read/write(即添加表锁时)，为了避免行锁与表锁的冲突，线程B需要对表逐行检查是否有行锁及其类型判断二者是否兼容，性能较低。

为了避免DML在执行时，加的行锁与表锁的冲突，在InnoDB中引入了对表的意向锁，使得表锁不用检查每行是否加锁，使用意向锁来减少表锁的检查。所以，**意向锁的目的是为了快速判断表里是否有记录被加锁**。

**分类：**

1. 意向共享锁（IS）：由语句select...lock in share mode 添加
2. 意向排他锁（IX）：由insert、update、delete、select...for update添加

**意向锁与表锁的兼容情况：**

1. 意向共享锁（IS）：与表锁共享锁（read）兼容，与表锁排他锁（write）互斥
2. 意向排他锁（IX）：与表锁共享锁（read）及排他锁（write）都互斥。意向锁之间不会互斥

![](https://img.hongxiac.com/image/202309091642434.png)

## 行级锁

行级锁，每次操作锁住对应的行数据。锁定粒度最小，发生锁冲突的概率最低，并发度最高。应用在InnoDB存储引擎中。

**注意：**

InnoDB的数据是基于索引组织的，行锁是通过**对索引上的索引项加锁**来实现的，而**不是对记录加锁**

**分类：**



![](https://img.hongxiac.com/image/202309091642107.png)

### 行锁(Record Lock)

锁定单个行记录的锁，防止其他事务对此行进行update和delete。在RC、RR隔离级别下都支持

**分类：**

1. 共享锁（S）：允许一个事务去读一行，阻值其他事务获得相同数据集的排他锁
2. 排他锁（X）：允许获取排他锁的事务更新数据，阻止其他事务获得相同数据集的共享锁和排他锁

![](https://img.hongxiac.com/image/202309091642510.png)

```
事务A开启事务，对id=1的数据执行了update；
事务B开启事务，也对id=1的数据执行update语句，但会进入阻塞状态；
原因：事务A的update语句自动为该行添加了排他锁，而事务B的update也要添加排他锁，但二者是冲突（互斥）的，因此进入阻塞状态
```

![](https://img.hongxiac.com/image/202309091642588.png)

可以通过以下SQL，查看意向锁及行锁的加锁情况：

```
select object_schema,object_name,index_name,lock_type,lock_mode,lock_data from performance_schema.data_locks;
```

- **行锁-演示：**

默认情况下，InnoDB在repeatable read事务隔离级别运行，InnoDB使用next-key锁进行搜索和索引扫描，**以防止幻读**。

1. **针对唯一索引进行检索时**，对已存在的记录进行等值匹配时，将会自动优化为行锁
2. InnoDB的行锁是针对于索引加的锁，**不通过索引条件检索数据**，那么InnoDB将对表中的所有记录加锁，此时就会升级为表锁。

### 间隙锁（Gap Lock）

锁定索引记录的间隙（不含该记录），确保索引记录的间隙不变，**防止**其他事务在这个间隙进行insert操作而产生**幻读**。在RR隔离级别下都支持

### 临键锁（Next-Key Lock）

行锁和间隙锁的组合，同时锁住数据，并锁住数据前面的间隙Gap.在RR隔离级别下支持

- **间隙锁/临键锁-演示**

1. 索引上的等值查询（唯一索引），给不存在的记录加锁时，优化为间隙锁
2. 索引上的等值查询（普通索引），像右遍历时最后一个值不满足查询需求时，next-key lock退化为间隙锁
3. 索引上的范围查询（唯一索引）--会访问到不满足条件的第一个值为止

```sql
#开启事务后执行语句
select * from emp where id >= 19 lock in share mode;
#加锁情况
对id=19的记录加上行锁，加上一个临键锁锁住19~25的间隙，还加上一个临建锁锁住正无穷大以及25~正无穷的间隙，以防止幻读
```

**注意：间隙锁的唯一目的是防止其他事务插入间隙。间隙锁可以共存，一个事务采用的间隙锁不会阻止另一个事务在同一间隙上采用间隙锁**