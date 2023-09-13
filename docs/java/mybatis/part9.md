# 九、动态SQL

- Mybatis框架的动态SQL技术是一种根据特定条件动态拼装SQL语句的功能，它存在的意义是为了解决拼接SQL语句字符串时的痛点问题

## if

- if标签可通过test属性（即传递过来的数据）的表达式进行判断，若表达式的结果为true，则标签中的内容会执行；反之标签中的内容不会执行
- 在where后面添加一个恒成立条件`1=1`
- 这个恒成立条件并不会影响查询的结果
    - 这个`1=1`可以用来拼接`and`语句，例如：当empName为null时
    - 如果不加上恒成立条件，则SQL语句为`select * from t_emp where and age = ? and sex = ? and email = ?`，此时`where`会与`and`连用，SQL语句会报错
        - 如果加上一个恒成立条件，则SQL语句为`select * from t_emp where 1= 1 and age = ? and sex = ? and email = ?`，此时不报错

```xml
<!--List<Emp> getEmpByCondition(Emp emp);-->
<select id="getEmpByCondition" resultType="Emp">
	select * from t_emp where 1=1
	<if test="empName != null and empName !=''">
		and emp_name = #{empName}
	</if>
	<if test="age != null and age !=''">
		and age = #{age}
	</if>
	<if test="sex != null and sex !=''">
		and sex = #{sex}
	</if>
	<if test="email != null and email !=''">
		and email = #{email}
	</if>
</select>
```

## where

where和if一般结合使用：

- 若where标签中的if条件都不满足，则where标签没有任何功能，即不会添加where关键字
- 若where标签中的if条件满足，则where标签会自动添加where关键字，并将条件最前方多余的and/or去掉

```xml
<!--List<Emp> getEmpByCondition(Emp emp);-->
<select id="getEmpByCondition" resultType="Emp">
	select * from t_emp
	<where>
		<if test="empName != null and empName !=''">
			emp_name = #{empName}
		</if>
		<if test="age != null and age !=''">
			and age = #{age}
		</if>
		<if test="sex != null and sex !=''">
			and sex = #{sex}
		</if>
		<if test="email != null and email !=''">
			and email = #{email}
		</if>
	</where>
</select>
```

- 注意：where标签不能去掉条件后多余的and/or

~~~xml
```xml
<!--这种用法是错误的，只能去掉条件前面的and/or，条件后面的不行-->
<if test="empName != null and empName !=''">
emp_name = #{empName} and
</if>
<if test="age != null and age !=''">
	age = #{age}
</if>
```
~~~

## trim

- trim用于去掉或添加标签中的内容
- 常用属性
- prefix：在trim标签中的内容的前面添加某些内容
    - suffix：在trim标签中的内容的后面添加某些内容
    - prefixOverrides：在trim标签中的内容的前面去掉某些内容
    - suffixOverrides：在trim标签中的内容的后面去掉某些内容
- 若trim中的标签都不满足条件，则trim标签没有任何效果，也就是只剩下`select * from t_emp`

```xml
<!--List<Emp> getEmpByCondition(Emp emp);-->
<select id="getEmpByCondition" resultType="Emp">
	select * from t_emp
	<trim prefix="where" suffixOverrides="and|or">
		<if test="empName != null and empName !=''">
			emp_name = #{empName} and
		</if>
		<if test="age != null and age !=''">
			age = #{age} and
		</if>
		<if test="sex != null and sex !=''">
			sex = #{sex} or
		</if>
		<if test="email != null and email !=''">
			email = #{email}
		</if>
	</trim>
</select>
```

```java
//测试类
@Test
public void getEmpByCondition() {
	SqlSession sqlSession = SqlSessionUtils.getSqlSession();
	DynamicSQLMapper mapper = sqlSession.getMapper(DynamicSQLMapper.class);
	List<Emp> emps= mapper.getEmpByCondition(new Emp(null, "张三", null, null, null, null));
	System.out.println(emps);
}
```

![](http://img.hongxiac.com/image/202309091449964.png)

## choose、when、otherwise

- `choose、when、otherwise`相当于`if...else if..else`
- when至少要有一个，otherwise至多只有一个

```xml
<select id="getEmpByChoose" resultType="Emp">
	select * from t_emp
	<where>
		<choose>
			<when test="empName != null and empName != ''">
				emp_name = #{empName}
			</when>
			<when test="age != null and age != ''">
				age = #{age}
			</when>
			<when test="sex != null and sex != ''">
				sex = #{sex}
			</when>
			<when test="email != null and email != ''">
				email = #{email}
			</when>
			<otherwise>
				did = 1
			</otherwise>
		</choose>
	</where>
</select>
```

```java
@Test
public void getEmpByChoose() {
	SqlSession sqlSession = SqlSessionUtils.getSqlSession();
	DynamicSQLMapper mapper = sqlSession.getMapper(DynamicSQLMapper.class);
	List<Emp> emps = mapper.getEmpByChoose(new Emp(null, "张三", 23, "男", "123@qq.com", null));
	System.out.println(emps);
}
```

![](http://img.hongxiac.com/image/202309091449098.png)

- 相当于`if a else if b else if c else d`，只会执行其中一个

## foreach

- 属性：
- collection：设置要循环的数组或集合
    - item：表示集合或数组中的每一个数据
    - separator：设置循环体之间的分隔符，分隔符前后默认有一个空格，如` , `
    - open：设置foreach标签中的内容的开始符
    - close：设置foreach标签中的内容的结束符

#### 实现批量删除

方式一：delete from t_emp where eid in (1,2,3)

方式二：delete from t_emp where eid = 1 or eid = 2 or eid = 3

~~~xml
```xml
<!--int deleteMoreByArray(Integer[] eids);-->
<delete id="deleteMoreByArray">
	delete from t_emp where eid in
	<foreach collection="eids" item="eid" separator="," open="(" close=")">
		#{eid}
	</foreach>
</delete>

~~~

```java
@Test
public void deleteMoreByArray() {
	SqlSession sqlSession = SqlSessionUtils.getSqlSession();
	DynamicSQLMapper mapper = sqlSession.getMapper(DynamicSQLMapper.class);
	int result = mapper.deleteMoreByArray(new Integer[]{6, 7, 8, 9});
	System.out.println(result);
}

```



#### 实现批量添加

```xml
<!--int insertMoreByList(@Param("emps") List<Emp> emps);-->
<insert id="insertMoreByList">
	insert into t_emp values
	<foreach collection="emps" item="emp" separator=",">
		(null,#{emp.empName},#{emp.age},#{emp.sex},#{emp.email},null)
	</foreach>
</insert>

```

## SQL片段

- sql片段，可以记录一段公共sql片段，在使用的地方通过include标签进行引入

可以将需要经常查询的字段写在sql片段中，避免重复书写

声明sql片段：`<sql>`标签

```xml
<sql id="empColumns">eid,emp_name,age,sex,email</sql>
```

引用sql片段：`<include>`标签

```xml
<!--List<Emp> getEmpByCondition(Emp emp);-->
<select id="getEmpByCondition" resultType="Emp">
	select <include refid="empColumns"></include> from t_emp
</select>
```

# 