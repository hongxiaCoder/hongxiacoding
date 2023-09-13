# 2.索引

## 索引概述

介绍

索引（index）是帮助MySQL**高效获取数据**的**数据结构（有序）**。

在数据之外，数据库系统还维护着满足特定查找算法的数据结构，这些数据结构以某种方式引用（指向）数据，这样就可以在这些数据结构上实现高级查找算法，这种数据结构就是索引。

优势：

- 提高数据检索的效率，降低数据库的IO成本
- 通过索引对数据进行排序，降低数据排序的成本，降低CPU的消耗

劣势：

- 索引列也是要占用空间的（但现在磁盘成本较低，空间又大）
- 索引大大提高了查询效率，同时却也降低更新表的速度，如对表进行insert，update，delete时，效率降低（业务中查询的使用较多）

## 索引结构

MySQL的索引是在存储引擎层实现的，不同的存储引擎有不同的结构

![](https://img.hongxiac.com/image/202309091636587.png)

![](https://img.hongxiac.com/image/202309091636178.png)

**我们平常所说的索引，如果没有特别指明，都是指B+树结构组织的索引**

### 二叉树

![](https://img.hongxiac.com/image/202309091636389.png)

**二叉树缺点：顺序插入时，会形成一个链表，查询性能大大降低。大数据量的情况下，层级较深，检索速度慢**

**红黑树：大数据量情况下，层级较深，检索速度慢**

### B-Tree

![](https://img.hongxiac.com/image/202309091636470.png)

### B+Tree

![](https://img.hongxiac.com/image/202309091636739.png)

相对于B-Tree区别：

1. 所有的数据都会出现在叶子节点
2. 叶子节点形成一个单向链表

MySQL索引数据结构对经典的B+Tree进行了优化。在原B+Tree的基础上，增加一个指向相邻叶子节点的链表指针，就形成了带有顺序指针的B+Tree。提高区间访问性能

![](https://img.hongxiac.com/image/202309091636835.png)

**注意**：

- 只有叶子节点存放数据，上面的节点只起到索引的作用
- 一个节点通过一个块/页存放，一页的大小固定是16K

### Hash

哈希索引就是采用一定的hash算法，将键值换算成新的hash值，映射到对应的槽位上，然后存储在hash表中。

如果两个（或多个）键值，映射到一个相同的槽位上，他们就产生了hash冲突（也称为hash碰撞），可以通过链表来解决。

![](https://img.hongxiac.com/image/202309091636470.png)

**Hash索引特点：**

1. Hash索引只能用于对等比较（=，in），不支持范围查询（between,<,>,...）
2. 无法利用索引完成排序操作
3. 查询效率高，通常只需要一次检索就可以了，效率通常高于B+tree索引

存储引擎支持

在MySQL中，支持Hash索引的是Memoey引擎，而InnoDB中具有自适应hash功能，hash索引是存储引擎根据B+Tree索引在指定条件下自动创建的

### 思考

为什么InnoDB存储引擎选择使用B+Tree索引结构

- 相对于二叉树，在数据量一定的情况下，B+Tree的叶子节点数更多，在进行顺序插入时，它的层级也会更少，所以搜索效率会更高
- 相对于B-Tree，无论是叶子节点还是非叶子节点，都会保存数据，而一页的大小又是固定的，便导致一页中存放的键值减少，指针也跟着减少，要同样保存大量数据，就只能增加树的高度，导致性能降低；（对于B+Tree，无论查找哪个数据，都要到叶子节点才能找到对应的数据，搜索效率稳定；且叶子节点形成双向链表，便于范围搜索和排序）
- 相对于Hash索引，B+Tree支持范围匹配及排序操作

## 索引分类

![](https://img.hongxiac.com/image/202309091637514.png)

- 主键索引：针对于表中主键创建的索引   primary
- 唯一索引：避免同一个表中某数据列中的值重复   unique
- 常规索引：快速定位特定数据
- 全文索引：全文索引查找的是文本中的关键词，而不是比较索引中的值   fulltext

在InnoDB存储引擎中，根据索引的存储形式，又可以分为以下两种：

- 聚集索引（Clustered Index）：将数据存储与索引放在了一块，索引结构的**叶子节点保存了行数据**（必须有，且只有一个）
- 二级索引（Secondary Index）：将数据和索引分开存储，索引结构的**叶子节点关联的是对应的主键**，再通过主键找到对应的行（可以存在多个）

聚集索引选取规则：

- 如果存在主键，**主键索引就是聚集索引**
- 如果不存在主键，将使用第一个唯一索引作为聚集索引
- 如果表没有主键，或没有合适的唯一索引，则InnoDB会自动生成一个rowid作为隐藏的聚集索引

![](https://img.hongxiac.com/image/202309121022277.png)

**回表查询：根据二级索引找到主键值，再到聚集索引中根据主键值拿到对应的行数据**

### 思考

1.以下SQL语句中，哪个执行效率高？为什么？

![](https://img.hongxiac.com/image/202309091637778.png)

id作为主键值，直接在聚集索引中找到相应的叶子节点，而叶子节点保存了相应的行数据，只需要一次扫描即可查询到

而name需要在二级索引找到对应的主键值，然后根据主键值回到聚集索引中进行查找，即回表查询，效率较低

2.InnoDB主键索引B+Tree的高度为多高呢？

![](https://img.hongxiac.com/image/202309091637604.png)

## 索引语法

创建索引：

```sql
create [unique|fulltext] index index_name on table_name (index_col_name,...);
```

**一个索引可以关联多个字段，称为联合索引或组合索引，否则称为单列索引**

查看索引：

```sql
show index from table_name;
```

删除索引：

```sql
drop index index_name on table_name;
```

### SQL性能分析

#### SQL执行频率

（判定当前数据库是以增删改为主，还是查询为主）

MySQL客户端连接成功后，通过show [sessuion|global] status 命令可以提供服务器状态信息。通过如下指令，可以查看当前数据库的insert，update，delete，select访问频次

```
show global status like 'Com_______';(7个下划线)
```

### 慢查询日志

（要针对当前数据库进行优化，那么要对哪些select语句进行优化呢？需要定位哪些sql语句执行效率较低，从而对其进行优化）

慢查询日志记录了所有执行时间超过指定参数（long_query_time，单位：秒，默认10秒）的所有SQL语句的日志，MySQL的慢查询日志默认没有开启，需要在MySQL的配置文件（）中配置

开启MySQL慢日志查询开关：

```sql
slow_query_log = 1;
```

设置慢日志的时间为2秒，SQL语句执行时间超过2秒，就会视为慢查询，记录慢查询日志：

```
long_query_time = 2;
```

可以使用模糊查询查看日志：

```
show variable like 'slow_query_log';
```

![](https://img.hongxiac.com/image/202309121021605.png)

### profile详情

show profiles 能够在做SQL优化时帮助我们了解时间都耗费到哪里去了。通过hava_profiling参数，能够看到当前mysql 是否支持profiles操作

```
select @@have_profiling;
```

默认profiling时关闭的，可以通过set语句在session（会话）/global（全局）开启profiling

```
set profiling = 1;
```

执行一系列的业务SQL的操作，然后通过如下指令查看指令的执行耗时：

查看每条SQL的耗时基本情况：

```
show profiles;
```

查看指定query_id的SQL语句各个阶段的耗时情况

```
show profile for query query_id;
```

查看指定query_id的SQL语句CPU的使用情况

```
show profile cpu for query_id;
```

### explain执行计划（重要）

explain 或者 desc 命令**获取MySQL如何执行select语句的信息**，包括在select语句执行过程中表如何连接和连接的顺序

语法：直接在select语句之前加上关键字explain或desc

```
explain select 字段列表 from 表名 where 条件;
```

各字段含义：

- id：select查询的序列号，表示查询中执行select子句或者是操作表的顺序（id相同，执行顺序从上到下；id不同，id大的先执行）
- select_type（了解）:表示select的类型，常见的取值有simple（简单表，即不使用表连接或者子查询）、primary（主查询，即外层的查询）、union（union中的第二个或者后面的查询语句）、subquery（select/where之后报了了子查询）等
- **type**（重要）：表示连接类型，性能由好到差连接类型为NULL、system、const（一般为主键或唯一索引时出现）、eq_ref、ref（一般为非唯一性索引时出现）、range、index、all（一般为全表扫描）
- **possible_key**（重要）：显示可能应用在这张表上的索引，一个或多个
- **key**（重要）：实际使用的索引，如果为null，则没有使用索引
- **key_len**：表示索引中使用的字节数，该值为索引字段最大可能长度，并非实际使用长度，在不损失精度的前提下，长度越短越好
- rows：MySQL认为必须要执行查询的行数，在innoDB引擎的表中，是一个估计值，可能并不总是准确的
- filtered：表示返回结果的行数站需读取行数的百分比，值越大越好

## 索引使用规则

where之后的规则

### 最左前缀法则

[csdn](https://blog.csdn.net/sinat_41917109/article/details/88944290?spm=1001.2101.3001.6650.1&utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7ECTRLIST%7ERate-1-88944290-blog-123413536.pc_relevant_multi_platform_whitelistv6&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7ECTRLIST%7ERate-1-88944290-blog-123413536.pc_relevant_multi_platform_whitelistv6&utm_relevant_index=2)

**若MySQL建立了联合索引**，要遵守最左前缀法则。最左前缀法则指的是查询从索引的最左列开始，并且不跳过索引中的列。如果跳跃某一列（即条件查询少了某一个联合索引中的字段名），索引将部分失效（后面的字段索引失效）。

在建立联合索引时，即构建一颗B+树，但有多个字段，根据的是联合索引最左侧的字段来构建B+树，如果该字段相同则第二个字段是有序的，所以联合索引的最左侧字段是有序的，如果查询时不包含该列，便无法使用索引

```sql
//对stu表中的sex，age，name字段建立联合索引
create index idx_stu_sex_age_name on stu(sex,age,name);
select * from stu where age = 18;#未使用索引
select * from stu where name ='Lee';#未使用索引
select * from stu where sex = 'gender' and age = 18;#使用索引
select * from stu where sex = 'gender' and name ='Lee';#只有sex使用索引
select * from stu where name = 'Lee' and sex = 'gender' and age = 18;#使用索引(与顺序无关)
select * from stu where age = 18 and name = 'Lee';#未使用索引
```

**注意：**

- 在创建联合索引时，根据业务需求，where子句中使用最频繁的列放在最左侧，以提升效率

### 范围查询

**联合索引中**，出现范围查询（>，<），范围查询**右侧的列**索引失效；

- 可以对索引最左侧的列进行范围查询

```
create index idx_a_b_c on table(a,b,c);建立联合索引
select * from table where a > 1 and a < 3;使用索引
```

- 如果左边的列是精确查找，那么右边的列可以范围查询

```
select * from table where a = 1 and b < 3;#使用索引
```

- 只有a使用索引，b不使用。因为1<a<3的范围内b是无序的，无法进行索引

```
select * from table where 1 < a < 3 and b < 3;#只有a使用到索引
```

**注意**：

- .>=或<=右侧的列索引不会失效！所以业务允许的情况下使用>=或<=
- 如果第一个字段是范围查询，那么最好要为其单独建一个索引

### 索引列运算

不要再索引列上进行**运算操作**（如函数运算），索引将失效，如

```
explain select * from tb_user where substring(phone,10,2) = '15';
```

### 字符串不加引号

字符串类型字段使用时，不加引号，**索引将失效**

```
explain select * from tb_user where profession = '软件工程' and age = 31 and status = 0;
此处的0没有加上引号，导致status的索引失效
```

### 模糊查询

如果仅仅是尾部模糊匹配，索引不会失效；如果头部模糊匹配，索引失效。如

```
select * from tb_user where profession like '软件%';--->不失效
select * from tb_user where profession like '%工程';--->失效
```

**注意**：在大数据量的情况下避免模糊查询前面加%的情况，否则为全表扫描，效率低

### or连接的条件

用or分割开的条件，如果or前面的条件有索引，而or后面的列中没有索引，则整个索引都失效。如

```
explain select * from tb_user where id = 1 or age = 23;-->失效
explain select * from tb_user where phone = '110' or age = 23;-->失效
```

由于age没有索引，即使id和phone有索引也会失效

**解决办法**：对age也加上索引

```
create index idx_user_age on tb_user(age);
```

### 数据分布影响

如果MySQL评估使用索引比全表扫描更慢，则不使用索引

### SQL提示

SQL提示，是优化数据库的一个重要手段，简单来说，就是在SQL语句中加入一些人为提示来达到优化操作的目的

use index(索引名)（给建议，接不接受取决于mysql）

```
explain select * from tb_user use index(idx_user_pro) where profession = "软件工程";
```

ignore index(索引名)（忽略指定的索引）

```
explain select * from tb_user ignore index(id_user_pro) where profession = '软件工程';
```

force index(索引名)（强制使用指定索引）

```
explain select * from tb_user force index(id_user_pro) where profession = '软件工程';
```

### 覆盖索引(重要)

查询所需要的列在索引中能够全部覆盖到，无需回表查询

尽量使用覆盖索引（查询使用了索引，并且需要返回的列，在该索引中已经全部能找到），避免了回表查询，减少select *。(研究的是select返回的字段)

explain命令中的extra字段有如下内容：

![](https://img.hongxiac.com/image/202309091637804.png)

思考：为什么避免select * ？

答：因为容易出现回表查询，而不是覆盖索引。除非对所有字段都创建了联合索引

![](https://img.hongxiac.com/image/202309091638189.png)

#### ![](https://img.hongxiac.com/image/202309091638926.png)

如何建立索引，以进行优化？

答：对username和password建立联合索引，在索引的过程中便会直接找到或者说覆盖到id的值，能够避免回表查询，进而提高效率

### 前缀索引

当字段类型为字符串（varchar，text等）时，有时候需要索引**很长的字符串或大文本字段**，这会让索引变得很大，查询时，浪费大量的磁盘IO，影响查询效率。此时可以只将字符串的一部分前缀，建立索引，这样可以大大节约索引空间，从而提高索引效率

语法：

```
create index idx_xxx on table_name(column(n));
```

- 前缀长度

可以根据索引的**选择性**来决定，而选择性是指不重复的索引值（基数）和数据表的记录总数的比值，索引选择性越高则查询效率越高。唯一索引的选择性是1，这是最好的索引选择性，性能也是最好的

```
#选择性
select count(distinct email)/count(*) from emp;
select count(distinc substring(email,1,5))/count(*) from emp;
```

![](https://img.hongxiac.com/image/202309091638617.png)

### 单列索引与联合索引

单列索引：即一个索引只包含单个列

联合索引：即一个索引包含了多个列

多条件联合查询时，MySQL优化器会评估哪个字段的索引效率更高，会选择该索引完成本次查询

![](https://img.hongxiac.com/image/202309091638715.png)

**注意：**

- 在业务场景中，如果存在多个查询条件，考虑针对查询字段建立索引时，建议建立联合索引，而非单列索引
- 建立联合索引时，考虑字段的顺序，即查询最频繁的放最左侧

## 索引设计原则

1. 【表】针对于数据量较大（如一百万而非几千条），且查询比较频繁的表建立索引
2. 【字段】针对常作为查询条件（where）、排序（order by）、分组（group by）操作的字段建立索引
3. 尽量选择区分度高的列作为索引，尽量建立唯一索引，区分度越高，使用索引的效率越高。（区分度高如：手机号，身份证号；区分度不高如：姓氏，状态字段）
4. 如果时字符串类型的字段，且字段的长度较长，可以针对于字段的特点，建立前缀索引
5. 尽量使用联合索引，减少单列索引，查询时，联合索引很多时候可以覆盖索引，节省存储空间，避免回表，提高查询效率
6. 要控制索引的数量，索引并不是多多益善，索引越多，维护索引结构的代价也就越大，会影响增删改的效率
7. 如果索引列不能存储null值，请在创建表时使用not null约束它。当优化器知道每列是否包含null值时，它可以更好地确定哪个索引最有效地用于查询