# 4.视图

## 介绍

视图（View）是一种虚拟存在的表。**视图中的数据**并不在数据库中实际存在，行和列数据**来自**定义视图的**查询中使用的表**，并且是在使用视图时**动态生成**的。

通俗而言，视图只保存了查询的SQL逻辑，不保存查询结果。所以我们在创建视图的时候，主要的工作就落在了创建这条SQL查询语句上

创建视图：

```sql
create [or replace] view 视图名[(列名列表)] as select语句 [with [cascaded|local] check option];
```

查询视图：

```sql
#查看创建视图语句
show create view 视图名;
#查看视图数据
select * from 视图名称...;
```

修改视图：

```sql
#方法一
create or replace view 视图名[(列名列表)] as select语句 [with[cascaded|local]] check option;
#方法二
alter view 视图名[(列名列表)] as select语句;
```

删除视图：

```sql
drop view [if exists] 视图名 [,视图名];
```

## 视图的检查选项

当使用with check option 子句创建视图时，MySQL会通过视图检查正在更改的每个行，例如 插入、更新。删除，以使其符合视图的定义。MySQL允许基于另一个视图创建视图，它还会检查依赖视图中的规则以保持一致性。为了确定检查的范围，MySQL提供了两个选项：cascaded和local，默认值为cascaded

![](https://img.hongxiac.com/image/202309091639213.png)

![](https://img.hongxiac.com/image/202309091639769.png)

local指代的含义是，当我们在操作视图的时候，它会递归的寻找当前视图所依赖的视图，如果当前以及依赖的视图有with check option这样的检查选项，将会判定我们操作的视图是否满足where子句的条件；如果在递归的过程中，找到某一个视图没有检查选项，就不对该条件进行检查

## 视图的更新

要使视图可更新，视图中的行与基础表中的行之间必须存在**一对一**的关系。如果视图包含以下任何一项，则该视图不可更新：

1. 聚合函数或窗口函数（sum()、min()、max()、count()等）
2. distinct
3. group by
4. having
5. union或者union all

```sql
#创建视图，使用聚合函数
create view emp_v_count as select count(*) from emp;
insert into emp_v_count values;--->错误
```

## 作用

- 简单

视图不仅可以简化用户对数据的理解，也可以简化他们的操作。那些经常使用的查询可以被定义为视图，从而使用户不必为以后的操作每次指定全部条件

- 安全

数据库可以授权，但不能授权到数据库特定行和特定列上。通过视图用户只能查询和修改他们所能见到的数据

- 数据独立

视图可帮助用户屏蔽真实表结构变化带来的影响

## 案例

1. 为了保证数据库表的安全性，开发人员在操作tb_user表时，只能看到用户的基本字段，屏蔽手机号和邮箱两个字段

```
create view tb_user_view as select id,name,profession,age,gender,status,createtime from tb_user;
```

​	2.查询每个学生所选修的课程（三表联查），这个功能在很多业务中都有使用到，为了简化操作，可以定义一个视图（**将多表联查的sql封装到视图中**）

```
create view tb_stu_course_view as select ...;
```
