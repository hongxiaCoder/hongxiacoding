# 四、MyBatis的增删改查

1. 添加

   ```xml
   <!--int insertUser();-->
   <insert id="insertUser">
   	insert into t_user values(null,'admin','123456',23,'男','12345@qq.com')
   </insert>
   ```

2. 删除

   ```xml
   <!--int deleteUser();-->
    <delete id="deleteUser">
        delete from t_user where id = 6
    </delete>
   ```

3. 修改

   ```xml
   <!--int updateUser();-->
    <update id="updateUser">
        update t_user set username = '张三' where id = 5
    </update>
   ```

4. 查询一个实体类对象

   ```xml
   <!--User getUserById();-->  
   <select id="getUserById" resultType="com.atguigu.mybatis.bean.User">  
   	select * from t_user where id = 2  
   </select>
   ```

5. 查询集合

   ```xml
   <!--List<User> getUserList();-->
   <select id="getUserList" resultType="com.atguigu.mybatis.bean.User">
   	select * from t_user
   </select>
   ```

- 注意：

    1. 查询的标签select必须设置属性resultType或resultMap，用于设置实体类和数据库表的映射关系
        - resultType：自动映射，用于属性名和表中字段名一致的情况
        - resultMap：自定义映射，用于一对多或多对一或字段名和属性名不一致的情况
    2. 当查询的数据为多条时，不能使用实体类作为返回值，只能使用集合，否则会抛出异常TooManyResultsException；但是若查询的数据只有一条，可以使用实体类或集合作为返回值

# 