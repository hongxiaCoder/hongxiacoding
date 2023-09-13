# 3.SQL优化
## 插入数据

**insert优化**

- 批量插入（不要一条一条insert去执行，因为每一次insert都需要与数据库建立连接，进行网络传输）（不建议超过1000条，如果是几万条，分割为几条insert）
- 手动提交事务（一条insert执行会自动开启事务，执行后自动提交事务，导致事务的频繁开启和提交）

```sql
start transaction;
insert into tb_user values(1,'Tom'),(2,'Cat'),(3,'Jerry');
insert into tb_user values(4,'Bob'),(5,'Dog'),
(6,'Mot');
insert into tb_user values(7,'Nah'),(8,'Lin'),
(9,'Hou');
commit;#统一提交事务
```

- 主键顺序插入

**大批量插入数据**

如果一次性需要插入大批量数据，使用insert语句插入性能较低，此时可以使用MySQL数据库提供的load指令进行插入

![](https://img.hongxiac.com/image/202309091638341.png)

```sql
#客户端连接服务端时，加上参数 --local-infile
mysql --local-infile -u root -p
#查看local_infile是否开启
select @@loacl_infile;
#设置全局参数local_infile为1，开启从本地加载文件导入数据的开关
set global local_infile = 1;
#执行load指令将准备好的数据，加载到表结构中
load data local infile '/root/sql1.log' 
into table tb_user 
fields terminated by ',' 
lines terminated by '\n';
```

主键顺序插入性能高于乱序插入

## 主键优化

- **数据组织方式**

在InnoDB存储引擎中，

![](https://img.hongxiac.com/image/202309091638650.png)

- **页分裂**

页可以为空，也可以填充一半，也可以填充100%。每个页包含了2~N行数据（如果一行数据很大，会行溢出），根据主键排列

![](https://img.hongxiac.com/image/202309091638151.png)

![](https://img.hongxiac.com/image/202309091639599.png)

![](https://img.hongxiac.com/image/202309091639110.png)

- **页合并**

当删除一行记录时，实际上记录并没有被物理删除，只是记录被标记（flaged）为删除并且它的空间变得允许被其他记录声明使用。

当页中删除的记录达到MERGE_THRESHOLD(默认为页的50%)，InnoDB会开始寻找最靠近的页（前或后）看看是否可以将两个页合并以优化空间使用

![](https://img.hongxiac.com/image/202309091639090.png)

![](https://img.hongxiac.com/image/202309091639394.png)

MERGE_THRESHOLD：合并页的阈值，可以自己设置，在创建表或者创建索引时指定

- **主键设计原则**

1. 满足业务需求的情况下，尽量降低主键的长度（原因：在二级索引较多的情况下，每个叶子结点挂着的就是主键，如果主键较长，将占用更多的磁盘空间，搜索时耗费更多磁盘IO）

2. 插入数据时，尽量选择顺序插入，选择使用auto_increment自增主键（原因：如果主键乱序插入，可能产生页分裂，导致空间浪费）

3. 尽量不要使用UUID做主键或者是其他自然主键，如身份证号

4. 业务操作时，避免对主键的修改（原因：修改主键还要改动索引结构，代价较大）

## order by优化

- Using filesort：通过表的索引或全表扫描，读取满足条件的数据行，然后再排序缓冲区sort buffer中完成排序操作，所有不是通过索引直接返回排序结果的排序都叫FileSort排序
- Using index：通过有序索引顺序扫描直接返回有序数据，这这情况即为using index，不需要额外排序，操作效率高

```sql
#没有创建索引时，根据age、phone进行排序
explain select id,age,phone from tb_user ordery by age,phone;--->using filesort;
#创建联合索引
create index idx_user_age_phone_aa on tb_user(age,phone);
#创建索引后，根据age、phone进行升序排序
explain select id,age,phone from tb_user order by age,phone;--->using index
#创建索引后，根据age、phone进行降序排序
explain select id,age,phone from tb_user order by age desc,phone desc;--->using index;backward index scan
#根据age、phone进行排序，一个升序、一个降序(或一降一升)
explain select id,age,phone from tb_user order by age asc,phone desc;--->using index;using filesort
#创建索引
create index idx_user_age_phone_ad on tb_user(age asc,phone desc);
#根据age、phone进行排序，一个升序，一个降序
explain select id,age,phone from tb_User order by age asc,phone desc;--->using index
```

**注意：**

- 根据排序字段建立合适的索引，多字段排序时，也遵循最左前缀法则
- 尽量使用覆盖索引
- 多字段排序，一个升序一个降序，此时需要注意联合索引在创建时的规则（asc，desc）
- 如果不可避免的出现filesort，大数据量排序时，可以适当增大排序缓冲区大小sort_buffer_size(默认256K)

## group by优化

```sql
#创建联合索引
create index idx_emp_age_job on emp(age,job);
#执行分组操作
explain select id,age from emp where age < 30 order by job;--->满足最左前缀法则，using index
```

- 在分组操作时，可以通过索引提升效率
- 分组操作时，索引的使用也是满足最左前缀法则

## limit优化

一个常见又头疼的问题就是limit 2000000,10，此时需要MySQL**排序**前2000010记录，但仅仅返回2000000~2000010的记录，其他记录被丢弃，查询的代价非常大

对limit来说，在大数据量的情况下进行分页，越往后效率越低，耗时越长

**优化思路：一般分页查询时，通过创建覆盖索引能够比较好地提高性能，可以通过覆盖索引+子查询形式进行优化**（即先查id，再根据id查行）

```sql
#一般情况
select * from emp limit 2000000,10;
#优化法1：1.先通过覆盖索引查询对应的id值2.再通过id值查询对应的数据
select id from emp limit 2000000,10;#第一步
select * from emp where where id in (第一步);#第二步
#优化法2；把1的第二步的in改为多表联查
select e.* from emp e,(第一步) a where e.id = a.id;
```

## count优化

count（）是一个聚合函数，对于返回的结果集，一行一行地判断，如果不是null，累计就加1，对null不计数

- MyISAM引擎把一个表的总行数存在了磁盘上，因此执行count（*）的时候会直接返回这个数，效率很高
- InnoDB引擎就麻烦了，它执行count（*）的时候，需要把数据一行一行地从引擎里面读出来，然乎累积计数

优化思路：自己计数

**count的几种用法**

- count(主键)：InnoDB引擎会遍历整张表，把每一行的主键id值都取出来，返回给服务层。服务层拿到主键后，直接按行进行累加（主键不可能为null）
- count(字段)

没有not null 约束：InnoDB引擎会遍历整张表把每一行的字段值都取出来，返回给服务层。服务层判断是否为null，不为null则累加

有not null 约束：InnoDB引擎会遍历整张表把每一行的字段值都取出来，返回给服务层，直接按行进行累加

- count(1)：InnoDB引擎遍历整张表，但不取值。服务层对于返回的每一行，放一个数字'1'进去，直接按行进行累加
- count(*):InnoDB引擎并不会把全部字段取出来，而是专门做了优化，不取值，服务层直接按行进行累加

**按照效率排序：count(字段)<count(主键 id)<count(1)≈count(*)**

**所以尽量使用count(*)**

## update优化

InnoDB的行锁是针对索引加的锁，不是针对记录加的锁，并且该索引不能失效，否则会从行锁升级为表锁，并发性能会降低

update后面的查询条件的字段为索引时，加上行锁，不为索引，则加上表锁。所以最好根据索引去更新，避免行锁升级为表锁而降低并发访问性