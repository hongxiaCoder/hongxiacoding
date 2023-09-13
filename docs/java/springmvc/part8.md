# 八、RESTful案例

## 1、准备工作

和传统 CRUD 一样，实现对员工信息的增删改查。

- 搭建环境

- 准备实体类

  ```java
  package com.atguigu.mvc.bean;
  
  public class Employee {
  
     private Integer id;
     private String lastName;
  
     private String email;
     //1 male, 0 female
     private Integer gender;
     
     public Integer getId() {
        return id;
     }
  
     public void setId(Integer id) {
        this.id = id;
     }
  
     public String getLastName() {
        return lastName;
     }
  
     public void setLastName(String lastName) {
        this.lastName = lastName;
     }
  
     public String getEmail() {
        return email;
     }
  
     public void setEmail(String email) {
        this.email = email;
     }
  
     public Integer getGender() {
        return gender;
     }
  
     public void setGender(Integer gender) {
        this.gender = gender;
     }
  
     public Employee(Integer id, String lastName, String email, Integer gender) {
        super();
        this.id = id;
        this.lastName = lastName;
        this.email = email;
        this.gender = gender;
     }
  
     public Employee() {
     }
  }
  ```

- 准备dao模拟数据

  ```java
  package com.atguigu.mvc.dao;
  
  import java.util.Collection;
  import java.util.HashMap;
  import java.util.Map;
  
  import com.atguigu.mvc.bean.Employee;
  import org.springframework.stereotype.Repository;
  
  
  @Repository
  public class EmployeeDao {
  
     private static Map<Integer, Employee> employees = null;
     
     static{
        employees = new HashMap<Integer, Employee>();
  
        employees.put(1001, new Employee(1001, "E-AA", "aa@163.com", 1));
        employees.put(1002, new Employee(1002, "E-BB", "bb@163.com", 1));
        employees.put(1003, new Employee(1003, "E-CC", "cc@163.com", 0));
        employees.put(1004, new Employee(1004, "E-DD", "dd@163.com", 0));
        employees.put(1005, new Employee(1005, "E-EE", "ee@163.com", 1));
     }
     
     private static Integer initId = 1006;
     
     public void save(Employee employee){
        if(employee.getId() == null){
           employee.setId(initId++);
        }
        employees.put(employee.getId(), employee);
     }
     
     public Collection<Employee> getAll(){
        return employees.values();
     }
     
     public Employee get(Integer id){
        return employees.get(id);
     }
     
     public void delete(Integer id){
        employees.remove(id);
     }
  }
  ```

## 2、功能清单

| 功能                | URL 地址    | 请求方式 |
| ------------------- | ----------- | -------- |
| 访问首页√           | /           | GET      |
| 查询全部数据√       | /employee   | GET      |
| 删除√               | /employee/2 | DELETE   |
| 跳转到添加数据页面√ | /toAdd      | GET      |
| 执行保存√           | /employee   | POST     |
| 跳转到更新数据页面√ | /employee/2 | GET      |
| 执行更新√           | /employee   | PUT      |

## 3、具体功能：访问首页

### a>配置view-controller

```xml
<mvc:view-controller path="/" view-name="index"/>
```

### b>创建页面

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8" >
    <title>Title</title>
</head>
<body>
<h1>首页</h1>
<a th:href="@{/employee}">访问员工信息</a>
</body>
</html>
```

## 4、具体功能：查询所有员工数据

### a>控制器方法

```java
@RequestMapping(value = "/employee", method = RequestMethod.GET)
public String getEmployeeList(Model model){
    Collection<Employee> employeeList = employeeDao.getAll();
    model.addAttribute("employeeList", employeeList);
    return "employee_list";
}
```

### b>创建employee_list.html

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Employee Info</title>
    <script type="text/javascript" th:src="@{/static/js/vue.js}"></script>
</head>
<body>

    <table border="1" cellpadding="0" cellspacing="0" style="text-align: center;" id="dataTable">
        <tr>
            <th colspan="5">Employee Info</th>
        </tr>
        <tr>
            <th>id</th>
            <th>lastName</th>
            <th>email</th>
            <th>gender</th>
            <th>options(<a th:href="@{/toAdd}">add</a>)</th>
        </tr>
        <tr th:each="employee : ${employeeList}">
            <td th:text="${employee.id}"></td>
            <td th:text="${employee.lastName}"></td>
            <td th:text="${employee.email}"></td>
            <td th:text="${employee.gender}"></td>
            <td>
                <a class="deleteA" @click="deleteEmployee" th:href="@{'/employee/'+${employee.id}}">delete</a>
                <a th:href="@{'/employee/'+${employee.id}}">update</a>
            </td>
        </tr>
    </table>
</body>
</html>
```

## 5、具体功能：删除

总体思路：

如果要用a标签来表示一个删除功能的话，其默认的method为get，需要进行一系列的操作让其提交的method转化为delete

需要额外写一个method为post、并且带有_method参数且值为delete的form表单，通过对a标签绑定单击事件，阻止a标签的默认行为而提交form表单，表单的提交地址由a标签的href赋值给它，再通过springMVC提供的HiddenHttpMethodFilter过滤器将post请求转化为delete请求



### a>创建处理delete请求方式的表单

```html
<!-- 作用：通过超链接控制表单的提交，将post请求转换为delete请求 -->
<form id="delete_form" method="post">
    <!-- HiddenHttpMethodFilter要求：必须传输_method请求参数，并且值为最终的请求方式 -->
    <input type="hidden" name="_method" value="delete"/>
</form>
```

### b>删除超链接绑定点击事件

引入vue.js

```html
<script type="text/javascript" th:src="@{/static/js/vue.js}"></script>
```

删除超链接

```html
<a class="deleteA" @click="deleteEmployee" th:href="@{'/employee/'+${employee.id}}">delete</a>
```

通过vue处理点击事件

```html
<script type="text/javascript">
    var vue = new Vue({
        el:"#dataTable",
        methods:{
            //event表示当前事件
            deleteEmployee:function (event) {
                //通过id获取表单标签
                var delete_form = document.getElementById("delete_form");
                //将触发事件的超链接的href属性为表单的action属性赋值
                delete_form.action = event.target.href;
                //提交表单
                delete_form.submit();
                //阻止超链接的默认跳转行为
                event.preventDefault();
            }
        }
    });
</script>
```

### c>控制器方法

```java
@RequestMapping(value = "/employee/{id}", method = RequestMethod.DELETE)
public String deleteEmployee(@PathVariable("id") Integer id){
    employeeDao.delete(id);
    return "redirect:/employee";
}
```

### d>配置springMVC.xml

首先**静态资源**在进行访问的时候会交由前端控制器DispartcherServlet进行处理，如果在控制器中找不到静态资源的请求映射，就应该交给default-servlet处理（所以要开放对静态资源的访问），如果能找到对应的资源就访问资源，如果找不到资源就报错

![](https://img.hongxiac.com/image/202309091526950.png)

注意，要**同时配置mvc注解驱动**，否则所有请求都由defaultServlet进行处理

![](https://img.hongxiac.com/image/202309091526394.png)

### 补充

tomcat下的config中有个web.xml，作用于部署到tomcat服务器上的所有工程。而工程中的xml只作用于当前工程，相当于继承关系。如果二者发生冲突，以当前工程的xml为准。

tomcat配置文件config中的web.xml配置了一个defaultServlet，用于处理所有请求，请求映射的地址为/。而我们在工程的web.xml中也配置了一个请求映射地址为/的前端控制器DispartcherServlet，二者发生冲突，以后者为准.



## 6、具体功能：跳转到添加数据页面

### a>配置view-controller

```xml
<mvc:view-controller path="/toAdd" view-name="employee_add"></mvc:view-controller>
```

### b>创建employee_add.html

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Add Employee</title>
</head>
<body>

<form th:action="@{/employee}" method="post">
    lastName:<input type="text" name="lastName"><br>
    email:<input type="text" name="email"><br>
    gender:<input type="radio" name="gender" value="1">male
    <input type="radio" name="gender" value="0">female<br>
    <input type="submit" value="add"><br>
</form>

</body>
</html>
```

## 7、具体功能：执行保存

### a>控制器方法

```java
@RequestMapping(value = "/employee", method = RequestMethod.POST)
public String addEmployee(Employee employee){
    employeeDao.save(employee);
    return "redirect:/employee";
}
```

## 8、具体功能：跳转到更新数据页面

### a>修改超链接

```html
<a th:href="@{'/employee/'+${employee.id}}">update</a>
```

### b>控制器方法

```java
@RequestMapping(value = "/employee/{id}", method = RequestMethod.GET)
public String getEmployeeById(@PathVariable("id") Integer id, Model model){
    Employee employee = employeeDao.get(id);
    model.addAttribute("employee", employee);
    return "employee_update";
}
```

### c>创建employee_update.html

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Update Employee</title>
</head>
<body>

<form th:action="@{/employee}" method="post">
    <input type="hidden" name="_method" value="put">
    <input type="hidden" name="id" th:value="${employee.id}">
    lastName:<input type="text" name="lastName" th:value="${employee.lastName}"><br>
    email:<input type="text" name="email" th:value="${employee.email}"><br>
    <!--
        th:field="${employee.gender}"可用于单选框或复选框的回显
        若单选框的value和employee.gender的值一致，则添加checked="checked"属性
    -->
    gender:<input type="radio" name="gender" value="1" th:field="${employee.gender}">male
    <input type="radio" name="gender" value="0" th:field="${employee.gender}">female<br>
    <input type="submit" value="update"><br>
</form>

</body>
</html>
```

## 9、具体功能：执行更新

### a>控制器方法

```java
@RequestMapping(value = "/employee", method = RequestMethod.PUT)
public String updateEmployee(Employee employee){
    employeeDao.save(employee);
    return "redirect:/employee";
}
```