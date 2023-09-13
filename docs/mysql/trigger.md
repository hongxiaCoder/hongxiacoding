# 6.触发器

## 介绍

触发器是与表有关的数据库对象，指在insert、update、delete之前或之后，触发并执行触发器中定义的SQL语句的集合。触发器的这种特性可以协助应用在数据库端确保数据的完整性，日志记录，数据校验等操作。

使用别名old和new来引用触发器中发生变化的记录内容（即旧数据和新数据），这与其他的数据库是相似的。现在触发器还只支持行级触发，不支持语句级触发（如果执行一条update语句，影响了5行，那么触发器就会被触发5次，这称之为行级触发；若一条sql语句影响了5行，而触发器只触发一次，则称之为语句级触发器）

![](https://img.hongxiac.com/image/202309091640436.png)

## 语法

创建:

```sql
create trigger trigger_name
before/after insert/update/delete
on tb_name for each row
begin
	trigger_stmt;
end;
```

查看:

```
show triggers;
```

删除:

```
drop trigger [schema_name.]trigger_name;
```

## 练习

通过触发器记录emp表的数据变更日志，将变更日志插入到日志表emp_logs中

```sql
create trigger emp_insert_trigger
	after insert on emp for each row
begin
	insert into emp values(1,'张三','上海',concat('插入的数据为id = ',new.id,'name = ',new.name));
end;
```
