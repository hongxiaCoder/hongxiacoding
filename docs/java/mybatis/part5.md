# 五、MyBatis获取参数值的两种方式（重点）

- MyBatis获取参数值的两种方式：${}和#{}
- ${}的本质就是字符串拼接，#{}的本质就是占位符赋值
- ${}使用字符串拼接的方式拼接sql，若为字符串类型或日期类型的字段进行赋值时，需要手动加单引号；但是#{}使用占位符赋值的方式拼接sql，此时为字符串类型或日期类型的字段进行赋值时，可以自动添加单引号

## 1、单个字面量类型的参数

**注意：**

若mapper接口中的方法参数为单个的字面量类型，

- 此时可以使用\${}和#{}以任意的名称（最好见名识意）获取参数的值
- 注意${}需要手动加单引号‘ ’

```xml
<!--User getUserByUsername(String username);-->
<select id="getUserByUsername" resultType="User">
	select * from t_user where username = #{username}
</select>
```

```xml
<!--User getUserByUsername(String username);-->
<select id="getUserByUsername" resultType="User">  
	select * from t_user where username = '${username}'  
</select>
```

## 2、多个字面量类型的参数

- 若mapper接口中的方法参数为多个时，此时MyBatis会自动将这些参数放在一个map集合中

    1. 以arg0,arg1...为键，以参数为值；
    2. 以param1,param2...为键，以参数为值；

- 因此只需要通过\${}和#{}访问map集合的键就可以获取相对应的值，注意${}需要手动加单引号。
- 可以混用，要注意的是，arg是从arg0开始的，param是从param1开始的

![](https://img.hongxiac.com/image/202309121021117.png)

```xml
<!--User checkLogin(String username,String password);-->
<select id="checkLogin" resultType="User">  
	select * from t_user where username = #{arg0} and password = #{arg1}  
</select>
```

```xml
<!--User checkLogin(String username,String password);-->
<select id="checkLogin" resultType="User">
	select * from t_user where username = '${param1}' and password = '${param2}'
</select>
```

## 3、map集合类型的参数

- 若mapper接口中的方法需要的参数为多个时，此时可以手动创建map集合，将这些数据放在map中只需要通过\${}和#{}访问map集合的键就可以获取相对应的值，注意${}需要手动加单引号

```xml
<!--User checkLoginByMap(Map<String,Object> map);-->
<select id="checkLoginByMap" resultType="User">
	select * from t_user where username = #{username} and password = #{password}
</select>
```

```java
@Test
public void checkLoginByMap() {
	SqlSession sqlSession = SqlSessionUtils.getSqlSession();
	ParameterMapper mapper = sqlSession.getMapper(ParameterMapper.class);
	Map<String,Object> map = new HashMap<>();
	map.put("usermane","admin");
	map.put("password","123456");
	User user = mapper.checkLoginByMap(map);
	System.out.println(user);
}
```

## 4、实体类类型的参数

- 若mapper接口中的方法参数为实体类对象时此时可以使用\${}和#{}，**通过访问实体类对象中的属性名获取属性值**，注意${}需要手动加单引号

```xml
<!--int insertUser(User user);-->
<insert id="insertUser">
	insert into t_user values(null,#{username},#{password},#{age},#{sex},#{email})
</insert>
```

```java
@Test
public void insertUser() {
	SqlSession sqlSession = SqlSessionUtils.getSqlSession();
	ParameterMapper mapper = sqlSession.getMapper(ParameterMapper.class);
	User user = new User(null,"Tom","123456",12,"男","123@321.com");
	mapper.insertUser(user);
}
```

## 5、使用@Param标识参数

- 可以通过@Param注解标识mapper接口中的方法参数，此时，会将这些参数放在map集合中

    1. 以@Param注解的value属性值为键，以参数为值；
    2. 以param1,param2...为键，以参数为值；

- 只需要通过\${}和#{}访问map集合的键就可以获取相对应的值，注意${}需要手动加单引号

```xml
<!--User CheckLoginByParam(@Param("username") String username, @Param("password") String password);-->
    <select id="CheckLoginByParam" resultType="User">
        select * from t_user where username = #{username} and password = #{password}
    </select>
```

```java
@Test
public void checkLoginByParam() {
	SqlSession sqlSession = SqlSessionUtils.getSqlSession();
	ParameterMapper mapper = sqlSession.getMapper(ParameterMapper.class);
	mapper.CheckLoginByParam("admin","123456");
}
```

## 总结

- 建议分成两种情况进行处理

    1. 实体类类型的参数
    2. 使用@Param标识参数

# 