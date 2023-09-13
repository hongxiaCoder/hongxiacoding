---
title: 如何使用脚本批量获取用户token，并用jmeter对秒杀接口进行压力测试
date: 2023/09/07
tags:
- 实际应用
categories:
- Redis
---
![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907124407.png)

## 需求

现在有一个秒杀优惠券的接口，需要模拟1000个不同登录用户下的秒杀场景，测试这个接口的性能。（黑马点评项目秒杀接口多用户压力测试）

## 分析

1.如何模拟这1000个用户？

我们可以使用for循环在数据库中批量添加这1000个用户，然后需要对这1000个用户进行登录以获取这1000个用户的token，以便在jmeter发起的请求头中携带这1000个token模拟1000个用户。

2.如何批量获取token？

编写脚本发起1000个登录请求，并将响应的token写入txt文件中。

## 实现

在编写脚本之前，我先声明本项目的登录流程、接口格式、响应格式，方便大家进行参照和修改。

**1.登录接口：**

本项目使用的是手机号和验证码登录方式，这两个参数携带在请求体（requestbody）中，而不是请求参数中（url路径中），如果根据手机号登录，需要将验证验证码的代码注释掉（即注释掉验证逻辑），以便直接根据手机号登录而无需验证。

```java
/**
 * 登录功能
 * @param loginForm 登录参数，包含手机号、验证码；或者手机号、密码
 */
@PostMapping("/login")
public Result login(@RequestBody LoginFormDTO loginForm, HttpSession session){
    String phone = loginForm.getPhone();
    String code = loginForm.getCode();
    if(phone == null){
        return Result.fail("手机号为空！");
    }
    //        if(code == null){
	//            return Result.fail("验证码为空！");
	//        }
        return userService.login(loginForm, session);
}
```

**2.登录流程：**

用户登录成功后，服务端会将token作为data数据返回给客户端，并将token存储到Redis中。之后客户端将token添加到请求头Authorization中，每次发起请求都需要携带该请求头，后端拦截器会根据请求头进行用户身份验证。

**3.响应格式：**

用户登录成功服务端响应格式

{"success":true,"data":"301130fd-7e25-4c93-8a79-9eb7d54c6fed"}//响应体
批量获取token脚本（Java）
思路：使用userService从数据库中获取用户集合（这里使用的是Mybatis-plus），遍历集合中的每个用户，将用户的手机号添加到请求体中，使用Java的Http客户端发起请求。之后从json响应体中获取token并写入txt文件中。

## 编写测试类（脚本）

```Java
package com.hmdp.utils;
import com.hmdp.entity.User;
import com.hmdp.service.IUserService;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClients;

import org.apache.http.util.EntityUtils;
import org.json.JSONObject;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.BufferedWriter;
import java.io.FileWriter;

import java.util.List;
@SpringBootTest
public class UserLoginBatch {
@Autowired
private IUserService userService;

@Test
public void function(){
    String loginUrl = "http://localhost:8080/api/user/login"; // 替换为实际的登录URL
    String tokenFilePath = "tokens.txt"; // 存储Token的文件路径
   
    try {
        HttpClient httpClient = HttpClients.createDefault();

        BufferedWriter writer = new BufferedWriter(new FileWriter(tokenFilePath));

        // 从数据库中获取用户手机号
        List<User> users = userService.list();

        for(User user : users) {
            String phoneNumber = user.getPhone();

            // 构建登录请求
            HttpPost httpPost = new HttpPost(loginUrl);
            //（1.如果作为请求参数传递）
            //List<NameValuePair> params = new ArrayList<>();
            //params.add(new BasicNameValuePair("phone", phoneNumber));
            // 如果登录需要提供密码，也可以添加密码参数
            // params.add(new BasicNameValuePair("password", "user_password"));
            //httpPost.setEntity(new UrlEncodedFormEntity(params));
            // (2.如果作为请求体传递)构建请求体JSON对象
            JSONObject jsonRequest = new JSONObject();
            jsonRequest.put("phone", phoneNumber);
            StringEntity requestEntity = new StringEntity(
                    jsonRequest.toString(),
                    ContentType.APPLICATION_JSON);
            httpPost.setEntity(requestEntity);

            // 发送登录请求
            HttpResponse response = httpClient.execute(httpPost);

            // 处理登录响应，获取token
            if (response.getStatusLine().getStatusCode() == 200) {
                HttpEntity entity = response.getEntity();
                String responseString = EntityUtils.toString(entity);
                System.out.println(responseString);
                // 解析响应，获取token，这里假设响应是JSON格式的
                // 根据实际情况使用合适的JSON库进行解析
                String token = parseTokenFromJson(responseString);
                System.out.println("手机号 " + phoneNumber + " 登录成功，Token: " + token);
                // 将token写入txt文件
                writer.write(token);
                writer.newLine();
            } else {
                System.out.println("手机号 " + phoneNumber + " 登录失败");
            }
        }

        writer.close();
    } catch (Exception e) {
        e.printStackTrace();
    }
}

// 解析JSON响应获取token的方法，这里只是示例，具体实现需要根据实际响应格式进行解析
private static String parseTokenFromJson(String json) {
   	 try {
       	 // 将JSON字符串转换为JSONObject
       	 JSONObject jsonObject = new JSONObject(json);
         // 从JSONObject中获取名为"token"的字段的值
      	 String token = jsonObject.getString("data");
       	 return token;
    	 } catch (Exception e) {
       		 e.printStackTrace();
       		 return null; // 解析失败，返回null或者抛出异常，具体根据实际需求处理
    	}
	}
}
```




运行之后可得到存储了1000个用户token的txt文件

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907123403.png)

Jmeter工具进行压力测试
这里使用到了Jmeter工具，如果不懂如何下载使用的后面会出一篇教程。

定义1000个线程即1000个用户秒杀库存100的优惠券。

1.定义线程组

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907123433.png)

2.设置导入的tokens数据文件

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907123444.png)

3.设置HTTP信息头管理器

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907123458.png)

4.设置HTTP请求

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907123507.png)

5.运行并得到结果

![img](https://img-blog.csdnimg.cn/b785c4f3356847a8aabce72f044c7dc5.png)

100条订单数据

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907123536.png)

完成测试！！！可以根据Jemter的测试结果进行分析啦！

