# 六、SpringMVC的视图

SpringMVC中的视图是View接口，视图的作用渲染数据，将模型Model中的数据展示给用户

SpringMVC视图的种类很多，默认有转发视图和重定向视图

当工程引入jstl的依赖，转发视图会自动转换为JstlView

若使用的视图技术为Thymeleaf，在SpringMVC的配置文件中配置了Thymeleaf的视图解析器，由此视图解析器解析之后所得到的是ThymeleafView

## 1、ThymeleafView

当控制器方法中所设置的视图名称**没有任何前缀**时，此时的视图名称会被SpringMVC配置文件中所配置的视图解析器解析，视图名称拼接视图前缀和视图后缀所得到的最终路径，会通过转发的方式实现跳转

```java
@RequestMapping("/testHello")
public String testHello(){
    return "hello";
}
```

如何通过断点进入

![](https://img.hongxiac.com/image/202309091524746.png)

步骤：

![](https://img.hongxiac.com/image/202309091524718.png)

![](https://img.hongxiac.com/image/202309091524306.png)

![](https://img.hongxiac.com/image/202309091524717.png)

![](https://img.hongxiac.com/image/202309091524245.png)

processDispatchResult（）：处理模型数据和视图信息的方法

render（）：渲染

resolveViewName（）：解析视图名称进而获取视图对象



## 2、转发视图

SpringMVC中默认的转发视图是InternalResourceView

SpringMVC中创建转发视图的情况：

当控制器方法中所设置的视图名称以"forward:"为前缀时，创建InternalResourceView视图，此时的视图名称不会被SpringMVC配置文件中所配置的视图解析器解析，而是会将前缀"forward:"去掉，剩余部分作为最终路径通过转发的方式实现跳转

例如"forward:/"，"forward:/employee"

```java
@RequestMapping("/testForward")
public String testForward(){
    return "forward:/testHello";
}
```

![](https://img.hongxiac.com/image/202309091525741.png)

## 3、重定向视图

SpringMVC中默认的重定向视图是RedirectView

当控制器方法中所设置的视图名称以"redirect:"为前缀时，创建RedirectView视图，此时的视图名称不会被SpringMVC配置文件中所配置的视图解析器解析，而是会将前缀"redirect:"去掉，剩余部分作为最终路径通过重定向的方式实现跳转

例如"redirect:/"：重定向到首页

"redirect:/employee"

**注意：**

```
//重定向到的应该是一个请求而不是具体的页面
//原因是重定向不能够访问web-info下的内容，而页面都在web-info下
//现在的页面都需要通过thymeleaf进行解析，必须使用转发去访问thymeleaf视图
```

```java
@RequestMapping("/testRedirect")
public String testRedirect(){
    return "redirect:/testHello";
}
```

![](https://img.hongxiac.com/image/202309091525845.png)

> 注：
>
> 重定向视图在解析时，会先将redirect:前缀去掉，然后会判断剩余部分是否以/开头，若是则会自动拼接上下文路径

## 4、视图控制器view-controller

当控制器方法中，仅仅用来实现页面跳转，即只需要设置视图名称时，可以将处理器方法使用view-controller标签进行表示

```xml
<!--
	path：设置处理的请求地址
	view-name：设置请求地址所对应的视图名称
-->
<mvc:view-controller path="/testView" view-name="success"></mvc:view-controller>
```

> 注：
>
> 当SpringMVC中设置任何一个view-controller时，其他控制器中的请求映射将全部失效，**此时需要在SpringMVC的核心配置文件中设置开启mvc注解驱动的标签**：
>
> <mvc:annotation-driven />