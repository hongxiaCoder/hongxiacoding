# 八、自定义映射resultMap

## 1、resultMap处理字段和属性的映射关系

### 方式一：起别名

为字段起别名

```xml
<select id="getAllEmp" resultType="Emp">
		select eid,emp_name empName,age,sex,email from t_emp
</select>
```



### 方式二：配置

在核心配置文件中配置。&lt setting &gt标签中设置全局配置信息mapUnderscoreToCamelCase，自动将字段名中的下划线映射为驼峰

```xml
<settings>
    <setting name="mapUnderscoreToCamelCase" value="true"/>
</settings>
```

### 方式三：自定义映射

- resultMap：设置自定义映射
- 属性：
    - id：表示自定义映射的唯一标识，不能重复
    - type：查询的数据要映射的实体类的类型
    - 子标签：
        - id：设置主键的映射关系
        - result：设置普通字段的映射关系
        - 子标签属性：
        - property：设置映射关系中实体类中的属性名
        - column：设置映射关系中表中的字段名

字段名和属性名一致的属性也要映射，也就是全部属性都要列出来

```xml
<resultMap id="empResultMap" type="Emp">
	<id property="eid" column="eid"></id>
	<result property="empName" column="emp_name"></result>
	<result property="age" column="age"></result>
	<result property="sex" column="sex"></result>
	<result property="email" column="email"></result>
</resultMap>
<!--List<Emp> getAllEmp();-->
<select id="getAllEmp" resultMap="empResultMap">
	select * from t_emp
</select>
```

## 2、多对一映射处理

>查询员工信息以及员工所对应的部门信息

```java
public class Emp {  
	private Integer eid;  
	private String empName;  
	private Integer age;  
	private String sex;  
	private String email;  
	private Dept dept;
	//...构造器、get、set方法等
}
```

### a、级联方式处理映射关系

```xml
<resultMap id="empAndDeptResultMapOne" type="Emp">
	<id property="eid" column="eid"></id>
	<result property="empName" column="emp_name"></result>
	<result property="age" column="age"></result>
	<result property="sex" column="sex"></result>
	<result property="email" column="email"></result>
	<result property="dept.did" column="did"></result>
	<result property="dept.deptName" column="dept_name"></result>
</resultMap>
<!--Emp getEmpAndDept(@Param("eid")Integer eid);-->
<select id="getEmpAndDept" resultMap="empAndDeptResultMapOne">
	select * from t_emp left join t_dept on t_emp.eid = t_dept.did where t_emp.eid = #{eid}
</select>
```

### b、使用association处理映射关系

association：处理多对一的映射关系

- property：需要处理多对的映射关系的属性名
- javaType：该属性的类型

```xml
<resultMap id="empAndDeptResultMapTwo" type="Emp">
	<id property="eid" column="eid"></id>
	<result property="empName" column="emp_name"></result>
	<result property="age" column="age"></result>
	<result property="sex" column="sex"></result>
	<result property="email" column="email"></result>
	<association property="dept" javaType="Dept">
		<id property="did" column="did"></id>
		<result property="deptName" column="dept_name"></result>
	</association>
</resultMap>
<!--Emp getEmpAndDept(@Param("eid")Integer eid);-->
<select id="getEmpAndDept" resultMap="empAndDeptResultMapTwo">
	select * from t_emp left join t_dept on t_emp.eid = t_dept.did where t_emp.eid = #{eid}
</select>
```

### c、分步查询

#### 1. 查询员工信息

- select：设置分布查询的sql的唯一标识（namespace.SQLId或mapper接口的全类名.方法名）
- column：设置分步查询的条件

```java
//EmpMapper里的方法
/**
 * 通过分步查询，员工及所对应的部门信息
 * 分步查询第一步：查询员工信息
 * @param  
 * @return com.atguigu.mybatis.pojo.Emp
 * @date 2022/2/27 20:17
 */
Emp getEmpAndDeptByStepOne(@Param("eid") Integer eid);
```

```xml
<resultMap id="empAndDeptByStepResultMap" type="Emp">
	<id property="eid" column="eid"></id>
	<result property="empName" column="emp_name"></result>
	<result property="age" column="age"></result>
	<result property="sex" column="sex"></result>
	<result property="email" column="email"></result>
	<association property="dept"
				 select="com.atguigu.mybatis.mapper.DeptMapper.getEmpAndDeptByStepTwo"
				 column="did"></association>
</resultMap>
<!--Emp getEmpAndDeptByStepOne(@Param("eid") Integer eid);-->
<select id="getEmpAndDeptByStepOne" resultMap="empAndDeptByStepResultMap">
	select * from t_emp where eid = #{eid}
</select>
```

#### 2. 查询部门信息

```java
//DeptMapper里的方法
/**
 * 通过分步查询，员工及所对应的部门信息
 * 分步查询第二步：通过did查询员工对应的部门信息
 * @param
 * @return com.atguigu.mybatis.pojo.Emp
 * @date 2022/2/27 20:23
 */
Dept getEmpAndDeptByStepTwo(@Param("did") Integer did);
```

```xml
<!--此处的resultMap仅是处理字段和属性的映射关系-->
<resultMap id="EmpAndDeptByStepTwoResultMap" type="Dept">
	<id property="did" column="did"></id>
	<result property="deptName" column="dept_name"></result>
</resultMap>
<!--Dept getEmpAndDeptByStepTwo(@Param("did") Integer did);-->
<select id="getEmpAndDeptByStepTwo" resultMap="EmpAndDeptByStepTwoResultMap">
	select * from t_dept where did = #{did}
</select>
```

## 3、一对多映射处理

一的一方创建List &lt Emp &gt（多）属性->创建接口方法->书写映射sql->书写ResultMap->collection处理一对多映射

```java
public class Dept {
    private Integer did;
    private String deptName;
    private List<Emp> emps;
	//...构造器、get、set方法等
}
```

### a、collection

- collection：用来处理一对多的映射关系
- ofType：表示该属性对应的集合中存储的数据的类型

```xml
<resultMap id="DeptAndEmpResultMap" type="Dept">
	<id property="did" column="did"></id>
	<result property="deptName" column="dept_name"></result>
	<collection property="emps" ofType="Emp">
		<id property="eid" column="eid"></id>
		<result property="empName" column="emp_name"></result>
		<result property="age" column="age"></result>
		<result property="sex" column="sex"></result>
		<result property="email" column="email"></result>
	</collection>
</resultMap>
<!--Dept getDeptAndEmp(@Param("did") Integer did);-->
<select id="getDeptAndEmp" resultMap="DeptAndEmpResultMap">
	select * from t_dept left join t_emp on t_dept.did = t_emp.did where t_dept.did = #{did}
</select>
```

### b、分步查询

先在dept表中查询出部门信息，再以did作为查询条件到emp表中查询对应的员工信息，在ResultMap建立属性与字段的映射关系

####  1. 查询部门信息

```java
/**
 * 通过分步查询，查询部门及对应的所有员工信息
 * 分步查询第一步：查询部门信息
 * @param did 
 * @return com.atguigu.mybatis.pojo.Dept
 * @date 2022/2/27 22:04
 */
Dept getDeptAndEmpByStepOne(@Param("did") Integer did);
```

```xml
<resultMap id="DeptAndEmpByStepOneResultMap" type="Dept">
	<id property="did" column="did"></id>
	<result property="deptName" column="dept_name"></result>
	<collection property="emps"
				select="com.atguigu.mybatis.mapper.EmpMapper.getDeptAndEmpByStepTwo"
				column="did"></collection>
</resultMap>
<!--Dept getDeptAndEmpByStepOne(@Param("did") Integer did);-->
<select id="getDeptAndEmpByStepOne" resultMap="DeptAndEmpByStepOneResultMap">
	select * from t_dept where did = #{did}
</select>
```

#### 2. 根据部门id查询部门中的所有员工

```java
/**
 * 通过分步查询，查询部门及对应的所有员工信息
 * 分步查询第二步：根据部门id查询部门中的所有员工
 * @param did
 * @return java.util.List<com.atguigu.mybatis.pojo.Emp>
 * @date 2022/2/27 22:10
 */
List<Emp> getDeptAndEmpByStepTwo(@Param("did") Integer did);
```

```xml
<!--List<Emp> getDeptAndEmpByStepTwo(@Param("did") Integer did);-->
<select id="getDeptAndEmpByStepTwo" resultType="Emp">
	select * from t_emp where did = #{did}
</select>
```

## 延迟加载

- 分步查询的优点：可以实现延迟加载，但是必须在核心配置文件中设置全局配置信息：
- lazyLoadingEnabled：延迟加载的全局开关。当开启时，所有关联对象都会延迟加载
    - aggressiveLazyLoading：当开启时，任何方法的调用都会加载该对象的所有属性。 否则，每个属性会按需加载
- 此时就可以实现**按需加载**，获取的数据是什么，就只会执行相应的sql。此时可通过association和collection中的fetchType属性设置当前的分步查询是否使用延迟加载，fetchType="lazy(延迟加载)|eager(立即加载)"

```xml
<settings>
	<!--开启延迟加载-->
	<setting name="lazyLoadingEnabled" value="true"/>
</settings>
```

```java
@Test
public void getEmpAndDeptByStepOne() {
	SqlSession sqlSession = SqlSessionUtils.getSqlSession();
	EmpMapper mapper = sqlSession.getMapper(EmpMapper.class);
	Emp emp = mapper.getEmpAndDeptByStepOne(1);
	System.out.println(emp.getEmpName());
}
```

- 关闭延迟加载，两条SQL语句都运行了![](http://img.hongxiac.com/image/202309091448928.png)
- 开启延迟加载，只运行获取emp的SQL语句
  ![](http://img.hongxiac.com/image/202309091448997.png)

```java
@Test
public void getEmpAndDeptByStepOne() {
	SqlSession sqlSession = SqlSessionUtils.getSqlSession();
	EmpMapper mapper = sqlSession.getMapper(EmpMapper.class);
	Emp emp = mapper.getEmpAndDeptByStepOne(1);
	System.out.println(emp.getEmpName());
	System.out.println("----------------");
	System.out.println(emp.getDept());
}
```

- 开启后，需要用到查询dept的时候才会调用相应的SQL语句![](http://img.hongxiac.com/image/202309091448014.png)



fetchType：当开启了全局的延迟加载之后，可以通过该属性手动控制延迟加载的效果，fetchType="lazy(延迟加载)|eager(立即加载)"

~~~xml
```xml
<resultMap id="empAndDeptByStepResultMap" type="Emp">
	<id property="eid" column="eid"></id>
	<result property="empName" column="emp_name"></result>
	<result property="age" column="age"></result>
	<result property="sex" column="sex"></result>
	<result property="email" column="email"></result>
	<association property="dept"
				 select="com.atguigu.mybatis.mapper.DeptMapper.getEmpAndDeptByStepTwo"
				 column="did"
				 fetchType="lazy"></association>
</resultMap>
```
~~~

# 