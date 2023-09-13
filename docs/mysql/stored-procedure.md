# 5.存储过程

### 介绍

存储过程是实现经过编译并存储在数据库中的一段**SQL语句的集合**，调用存储过程可以简化应用开发人员的很多工作，减少数据在数据库和应用服务器之间的传输，对于提高数据处理的效率是有好处的。

存储过程思想上很简单，就是数据库SQL语言层面的代码封装和重用

### 特点

- 封装和复用，简化操作
- 可以接受参数，也可以返回数据
- 减少网络交互，效率提升

### 语法

创建：

```
create procedure 存储过程名称([参数列表])
begin
	SQL语句
end;
```

调用：

```
call 名称([参数]);
```

查看：

```sql
#查看指定数据库的存储过程及状态信息
select * from information_schema.routines where routine_schema = 'xxx';
#查询某个存储过程的定义
show create procedure 存储过程名称；
```

删除：

```sql
drop procedure [if exists] 存储过程名称；
```

**注意：**在命令行中，执行创建存储过程的SQL时，需要通过关键字delimiter指定SQL语句的结束符

```
delimiter &&
```

### 变量

- **系统变量**：是MySQL服务器提供，不是用户定义的，属于服务器层面。分为全局变量（global）（对所有会话有效）、会话变量（sessioin）(仅对当前会话有效);

查看系统变量：

```
#查看所有系统变量
show [session|global] variables;
#可以通过like模糊匹配方式查找变量
show [session|global] variables like '';
#查看指定变量
select @@[session|gloabl] variables;
```

设置系统变量：

```
set [session|gloabl] 系统变量名 = 值；
set @@[session|gloabl] 系统变量 = 值；
```

**注意：**

如果没有指定session/global。默认是session，会话变量。

mysql服务重新启动之后，所设置的全局参数会失效，要想不失效，可以在/etc/my.cnf中配置

- **用户定义变量**：是用户根据需要自己定义的变量，用户变量不用提前声明，在用的时候直接”@变量名“使用就可以。其作用域为当前连接

赋值：

```
set @var_name = expr [,@var_name = expr]...;
set @var_name := expr [,@var_name := expr]...;
```

```
select @var_name := expr [,@var_name := expr]...;
select 字段名 into @var_name from 表名;
```

使用：

```
select @var_name;
```

**注意：**用户定义的变量无需对其声明或初始化，只不过获取到的值为null

- **局部变量**：是根据需要定义的在局部生效的变量，访问之前，需要declare声明。可用作存储过程内的局部变量和输入参数，局部变量的范围实在其内声明的begin...end块。

声明：

```
declare 变量名 变量类型 [default ...];
```

变量类型就是数据库字段类型：int、bigint、char、varchar、date、time and so on

赋值：

```
set 变量名 = 值；
set 变量名 := 值；
select 字段名 into 变量名 from 表名;
```

### if判断

```sql
if 条件1 then
....
elseif 条件2 then
...
else
...
end if;
```

```sql
create procedure p3()
begin
	declare score int default 58;
	declare result varchar(20);
	if score >= 85 then
		set result := '优秀';
	elseif score >= 60 then
		set result := '及格'
	else 
		set result := '不及格';
	end if;
	select result;
end;

call p3();
```

### 参数

![](https://img.hongxiac.com/image/202309091639764.png)

```
create procedure 存储过程名称([in/out/inout 参数名 参数类型])
begin
	sql语句;
end;
```

```sql
create procedure p1(in score int,out result varchar(10))
begin
	if score >= 85 then
		set result := '优秀';
	elseif score >= 60 then
		set result := '及格'
	else 
		set result := '不及格';
end;

call p1(89,@result);
select @result;
```

```sql
create procedure p2(inout score double)
begin
	set score = score * 0.5;
end;

set @score := 199;
call p2(@score);
select @score;
```

### case

![](https://img.hongxiac.com/image/202309091640771.png)



### while循环

满足条件执行循环

![](https://img.hongxiac.com/image/202309091640382.png)

```sql
#计算1+2+...+n的值
create procedure p1(in n int)
begin
	declare total int default 0;
	while n > 0 do
		set total := total + n;
		n := n - 1;
	end while;
	select total;
end;

call p1(10);
```

### repaet循环

满足条件退出循环

![](https://img.hongxiac.com/image/202309091640448.png)

### loop循环

![](https://img.hongxiac.com/image/202309091640332.png)

![](https://img.hongxiac.com/image/202309091640795.png)

```sql
#计算从1累加到n的值，n为传入的参数
create procedure p1(in n int)
begin
	declare total int default 0;#定义
	sum:loop
		if n <= 0 then
			leave sum;#如果n<=0则退出循环
		end if;
		set total := toatl + n;
		set n := n - 1;
	end loop;
	select total;
end;

call p1(10);
```

```sql
#计算从1到n之间的偶数累加的值，n为传入的参数
create procedure p2(in n int)
begin
	declare total int default 0;
	sum:loop
		if n <= 0 then
			leave sum;
		end if;
		if n % 2 then  #若为奇数直接进入下一次循环
			set n := n - 1;
			iterate sum;
		end if;
		set total := total + n;
		set n := n - 1;
	end loop;
	select total;
end;
```

### 游标

游标是用来存储查询**结果集**的数据类型，在存储过程和函数中可以使用游标对结果集进行**循环**的处理。

使用包括游标的声明、open、fetch、close

![](https://img.hongxiac.com/image/202309121023994.png)

![](https://img.hongxiac.com/image/202309091640512.png)

**案例：**

![](https://img.hongxiac.com/image/202309121023366.png)

```sql
#声明一个游标，存放查询的结果集合
#创建一个新表，通过循环将游标的结果集合插入到新表中
create procedure p1(in uage int)
begin
	#声明临时变量，用来存放结果集的相应字段
	declare uname varchar(10);
	declare nprofession varchar(10);
	#声明游标
	declare user_cursor cursor for select name,profession from tb_user where age < uage;
	#声明条件处理程序
	declare exit handler for not found close emp_cursor;
	#建立新表
	create table if not exists tb_user_pro(
    	id int primary key auto_increment,
        name varchar(10),
        profession varchar(10)
    );
    #开启游标
    open user_cursor;
    while true do
    	#获取游标记录
    	fetch user_cursor into uname,uprofession;
    	#将数据插入新表
    	insert into tb_user_pro values(null,uname,uprofession);
    end while;
    #关闭游标
    close user_cursor;
end;
```

### 条件处理程序Handler

可以用来**定义**在流程控制结构执行过程中遇到问题时相应的**处理步骤**

```sql
declare hanler_action handler for condition_value [,condition_value]... statement;
```

```
handler_action:
continue 继续执行当前程序
exit 终止执行当前程序

condition_value:
sqlstate  sqlstate_value 状态码，如02000
sqlwarning 所有以01开头的sqlstate代码的简写
not found 所有以02开头的sqlstate代码的简写
sqlexception 所有没有被sqlwarning 或 not found 补货的sqlstate代码的简写
```

### 存储函数

存储函数时有返回值的存储过程，存储函数的参数只能是in类型

![](https://img.hongxiac.com/image/202309091640139.png)

必须得有返回值。能够使用存储函数的地方，都能使用存储过程替代,所以用的不多