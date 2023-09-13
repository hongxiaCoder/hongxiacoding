# 3.函数

## 字符串函数

![](https://img.hongxiac.com/image/202309091634520.png)

- concat(s1,s2)
- lower(str)
- upper(str)
- lpad(str,n,pad)
- rpad(str,n,pad)
- trim(str)
- substring(str,start,len)

```
select 函数（）;
```

```
将所有员工的工号补充为5位，前面补0
update emp set workno = lpad(workno,5,'0');
```

## 数值函数

![](https://img.hongxiac.com/image/202309091634184.png)

- ceil(x)向上取整
- floor(x)向下取整
- mod(x,y)返回x/y的模
- rand();返回0-1内的随机数
- round(x,y)求参数x的四舍五入的值，保留y位小数

```
随机生成一个六位数的随机验证码
select lpad(round(rand()*1000000,0),6,'0');
```

## 日期函数

![](https://img.hongxiac.com/image/202309091634629.png)

- curdate()  返回当前日期(年月日)
- curtime()  返回当前时间（时分秒）
- now()  返回当前日期和时间
- year(date)  获取指定date年份
- month(date)  获取指定date的月份
- day(date)  获取指定date的日期
- date_add(date, INTERVAL 数值 单位)  返回一个日期/时间值加上一个时间间隔expr后的时间值
- datediff(date1,date2)  返回起始时间date1和结束时间date2之间的天数

```
查询所有员工的入职天数，并按入职天数降序排序
select name,datediff(curdate(),entrydate) as 'entrydays' from emp order by entrydays desc;
```

## 流程函数

也是很常用的函数，可以在SQL语句中实现条件筛选，从而提高语句效率

![](https://img.hongxiac.com/image/202309091634354.png)

```
查询emp表的员工姓名和工作地址（北京/上海->一线城市，其他->二线城市）
select 
	name,
	(case workaddress when '北京' then '一线城市' when '上海' then '一线城市' else '二线城市' end) as '工作地址' 
from emp;
```

```
select
	name,
	(case when math >= 85 then '优秀' when math >=60 then '及格' end) as '数学',
	(case when english >= 85 then '优秀' when english >= 60 then '及格') as '英语'
from score;
```
