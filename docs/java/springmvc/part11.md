# 十一、拦截器

## 1、拦截器的配置

SpringMVC中的拦截器用于拦截控制器方法的执行

SpringMVC中的拦截器需要实现HandlerInterceptor接口

SpringMVC的拦截器必须在SpringMVC的配置文件中进行配置：

```xml
<bean class="com.atguigu.interceptor.FirstInterceptor"></bean>
<ref bean="firstInterceptor"></ref>
<!-- 以上两种配置方式都是对DispatcherServlet所处理的所有的请求进行拦截 -->
<mvc:interceptor>
    <mvc:mapping path="/**"/>
    <mvc:exclude-mapping path="/testRequestEntity"/>
    <ref bean="firstInterceptor"></ref>
</mvc:interceptor>
<!-- 
	以上配置方式可以通过ref或bean标签设置拦截器，通过mvc:mapping设置需要拦截的请求，通过mvc:exclude-mapping设置需要排除的请求，即不需要拦截的请求
-->
```

**注意：**

- /**表示拦截所有请求
- /*表示拦截一层目录的请求

## 2、拦截器的三个抽象方法

SpringMVC中的拦截器有三个抽象方法：

preHandle（）：控制器方法执行之前执行preHandle()，其boolean类型的返回值表示是否拦截或放行，返回true为放行，即调用控制器方法；返回false表示拦截，即不调用控制器方法

postHandle（）：控制器方法执行之后执行postHandle()

afterComplation（）：处理完视图和模型数据，渲染视图完毕之后执行afterComplation()

## 3、多个拦截器的执行顺序

a>若每个拦截器的preHandle()都返回true

此时多个拦截器的执行顺序和拦截器在SpringMVC的配置文件的配置顺序有关：

preHandle()会按照配置的顺序执行，而postHandle()和afterComplation()会按照配置的反序执行

b>若某个拦截器的preHandle()返回了false

preHandle()返回false和它之前的拦截器的preHandle()都会执行，postHandle()都不执行，返回false的拦截器之前的拦截器的afterComplation()会执行

源码：

![](https://img.hongxiac.com/image/202309091527377.png)

![](https://img.hongxiac.com/image/202309121021816.png)

源码中在执行preHandle方法中，会循环遍历一个存储了所有拦截器的集合（包括springMVC的自带的一个拦截器），遍历过程中执行每一个拦截器的preHandle（）方法，如果该方法的返回值是false，则再执行完该拦截器的afterHandle（）方法后就会直接返回。在遍历的同时会标识一个**递增**的拦截器索引。

之后的applyPostHandle（）以及triggerAfterComplation（）方法会根据拦截器索引**递减**的遍历拦截器集合中的拦截器