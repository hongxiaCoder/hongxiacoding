# 5.多表查询

- 一对多
    - 案例：部门与员工的关系
    - 关系：一个部门对应多个员工，一个员工对应一个部门
    - 实现：在多的一方建立外键，指向一的一方的主键
- 多对多
    - 案例：学生与课程的关系
    - 关系：一个学生可以选修多门课程，一门课程可以供多个学生选择
    - 实现：建立第三张中间表，中间表至少包含两个外键，分别关联两方主键
- 一对一
    - 案例：用户与用户详情的关系
    - 关系：一对一关系，**多用于单表拆分**，将一张表的基础字段放在一张表中，其他详情字段放在另一张表中，以提升操作效率
    - 实现：在任意一方加入外键，关联另一方的主键，并且设置外键为唯一的（unique）

笛卡尔积

```
select * from 表1，表2;
```

## 分类

- 连接查询
    - 内连接：相当于查询A,B交集部分数据
    - 外连接：
        - 左外连接：查询左表所有数据，以及两张表交集部分数据
        - 右外连接：查询右表所有数据，以及两张表交集部分数据
    - 自连接：当前表与自身的连接查询，自连接必须使用表别名
- 子查询

## 连接查询-内连接

隐式内连接：

```
select 字段连接 from 表1，表2 where 条件...;
```

显式内连接：

```
select 字段列表 from 表1 [inner] join 表2 on 连接体条件...;  
```

## 连接查询-外连接

左外连接：

```
select 字段列表 from 表1 left [outer] join 表2 on 条件;
```

```sql
select e.*,d.name from emp e left join dept d on e.dept_id = d.id where age > 40;
```

右外连接：

```
select 字段列表 from 表1 right [outer] join 表2 on 条件;
```

## 连接查询-自连接

自连接可以是内连接也可以是外连接

```
select 字段列表 from 表A 别名A join 表A 别名B on 条件
```

```
查询员工及其所属领导的名字
select a.name, b.name from emp a, emp b where a.mangerid = b.id;
```

```
查询员工及其所属领导的名字，若没有领导也要查询出该员工
select a.name '员工', b.name '领导' from emp a left join emp b where a.mangerid = b.id;
```

注意：必须对表起别名

## 联合查询-union，union all

对于union查询，就是把多次查询的结果合并起来，形成一个新的查询结果集

```
select 字段列表 from 表A ...
union [all]
select 字段列表 from 表B ...;
```

```
将薪资低于5000的员工，和年龄大于50随的员工全部查询出来
select * from emp where salary < 5000
union [all 加上all就可能查询出重复的员工]
select * from emp where age > 50;
```

**注意**：

- 对于联合查询的多张表的列数必须保持一致，字段类型也需要保持一致
- union all 会将全部数据直接合并在一起，union 会对合并之后的数据去重

## 子查询

概念：SQL语句中嵌套select语句，称为嵌套查询，又称子查询

```
selectt * from t1 where column1 = (select column1 from t2);
```

**子查询外部的语句可以是insert/update/delete/select任何一个**

根据子查询结果不同，分为：

- 标量子查询（子查询结果为单个值）
- 列子查询（子查询结果为一列）
- 行子查询（子查询结果为一行）
- 表子查询（子查询结果为多行多列）

根据子查询位置，分为

- where之前
- from之后
- select之后

## 标量子查询

子查询返回结果是单个值（数字，字符串，日期等）

常用操作符：=   <>   >   >=   <   <=

```
查询在“马云”入职之后入职的员工信息
select * from emp where entryday > (select entryday from emp where name = '马云');
```

## 列子查询

子查询返回的结果是一列（可以是多行）

常用的操作符：in , not in , any , some , all

![](https://img.hongxiac.com/image/202309091635227.png)

```
查询“销售部”和“市场部”的所有员工信息
select * from emp where id in (select id from dept where name = '销售部' or name = '市场部');
```

```
查询比财务部所有人工资都高的员工信息
select id from dept where name = '财务部';
select salary from emp where id = (select id from dept where name = '财务部')
------------>
select * from emp where salary > all(select salary from emp where id = (select id from dept where name = '财务部'));
```

```
查询比研发部其中任意一人工资高的员工信息
select salary from emp where id = (select id from dept where name = '研发部')
------------>
select * from emp where salary > any(select salary from emp where id = (select id from dept where name = '研发部'));
```

## 行子查询

子查询结果返回的结果为一行（可以是多列）

常用的操作符： =   ,  <>  ,  in   ,  not in

```
查询与“马云”的薪资及直属领导相同的员工信息
select salary, managerid from emp where name = '马云'
---------------->
select * from emp where (salary,managerid) = (select salary, managerid from emp where name = '马云');
```

## 表子查询

子查询返回的结果是多行多列

常用的操作符： in

```sql
查询与“薛之谦”或“李荣浩”的职位和薪资相同的员工信息
select job,salary from emp where name = '薛之谦' or name = '李荣浩';
-------------->
select * from emp where (job,salary) in (select job,salary from emp where name = '薛之谦' or name = '李荣浩';);
```

```sql
查询入职日期是'2003-11-29'之后的员工信息，及其部门信息
select * from emp where entrydate > '2003-11-29';
select e.*,d.* from () e left join dept b on e.dept_id = d.id;
```

## 案例练习

![](https://img.hongxiac.com/image/202309091635793.png)

```sql
1.查询员工的姓名,年龄，职位，部门信息 （隐式内连接）
select e.name, e.age, e.job, d.name from emp e, dept d where e.dept_id = d.id;
2.查询年龄小于30岁的员工姓名，年龄，职位，部门信息（显式内连接,隐式内连接）
select e.name, e.age, e.job, d.name from emp e inner join dept d on e.dept_id = d.id where e.age < 30;(也可以使用and)
3.查询拥有员工（及两表的交集）的部门名称，部门ID(注意去重！)
select distinct d.name, d.id from emp e, dept d where e.dept_id = d.id;
4.查询所有年龄大于40岁的员工，及其归属的部门名称；若员工没有部门，也要显示出来（外连接后面跟where，不可以用and）
select e.*, d.name from emp e left outer join dept d on e.dept_id = d.id where e.age > 40;
5.查询所有员工的薪资等级
select e.*,s.grade from emp e, salgrade s where e.salray between s.losal and s.hisal;
6.查询‘研发部’所有员工的信息及工资等级
select e.*, s.grade from emp e, salgrade s where e.salary between s.losal and s.hisal and e.dept_id = (select id from dept where name = '研发部');
7.查询‘研发部’员工的平均工资
select avg(salary) from emp e where e.id = (select id from dept where name = '研发部');
8.查询工资比‘灭绝’高的员工信息
select * from emp e where e.salary > (select salary from emp where name = '灭绝');--标量子查询
select e1.* from emp e1, emp e2 where e1.salary > e2.salary and e2.name = '灭绝';--自连接
9.查询比平均薪资高的员工信息
select * from emp e where e.salary > (select avg(salary) from emp);
*10.查询低于本部门平均工资的员工信息(前面的e1传递给后面进行部门是否相同的比较)
select * from emp e1 where e1.salary < (select avg(salary) from emp e2 where e2.dept_id = e1.dept_id);
*11.查询所有的部门信息，并统计部门的员工人数
select count(*) from emp where dept_id = 
select d.id, d.name, (select count(*) from emp where dept_id = d.id) '人数' from dept ;
```

**总结：**

- 查询拥有员工的部门（级交集）使用内连接查询，注意用distinct去除重复
- 若没有员工的部门也要显示出来（即两表并集），使用左外连接