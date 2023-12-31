# 第四章 需求获取

## **1. 用例是什么？用例的必备的特征是什么？用例图是什么？用例与用例之间存在哪些关系？**

从外部用户的视角看，一个用例是执行者与目标软件系统之间一次典型交互作用，其效果是执行者在软件系统的帮助下完成了某项业务功能。从软件系统内部的视角出发，一个用例代表着系统执行的一系列动作，动作执行的结果能够被外部的执行者所察觉。

相对独立性和完整性是用例必备的两项特征。

用例图表示从软件系统的外部使用者的角度看到的各项系统功能，并清晰地说明软件系统的边界，即用例图中的所有用例的集合构成目标软件系统应该提供的功能，除此之外软件系统不再承诺其他功能。

用例与用例之间的关系主要有：包含关系、扩展关系和继承关系。



## **2. 类图是什么？UML中的类之间的关系有哪些？**

类图描述面向对象软件系统的静态结构。类图的节点表示系统中的类及其属性和操作，类图的边表示类之间的关系。在需求获取或业务理解的过程中，类图表达业务领域中的概念及概念之间的关系；在需求分析阶段，类图表示软件需求模型的静态结构部分；在软件设计和实现阶段，类图表示软件的结构及详细设计。

UML可以表示类之间的关系有：继承，组合，聚合，关联，依赖，实现。聚合关系可进一步细分一般聚合和组合。两个类A、B，如果B的变化导致A必须相应进行修改，称A依赖于B。依赖关系是有向的。

关联和继承都是依赖关系的一种。从耦合度的角度看，继承关系最强，组合次之，不同聚合再次之，普通关联关系最弱。



## **3. 活动图的作用是什么？活动图的节点有哪些，分别表示什么？**

活动图描述实体为完成某项功能而执行的操作序列，其中的某些操作或者操作的子序列可以并发和同步。活动图中包含控制流和信息流。控制流表示一个操作完成后对其后续操作的触发，信息流刻画操作之间的信息交换。活动图适合于精确描述单个用例中的处理流程，也可描述多个用例联合起来形成的处理流程。

活动图的节点有种类型，1）活动。计算过程的抽象表示，或者表示一个基本的计算步骤，或者表示一系列基本的计算步骤和子活动。2）决策点。当到达边为一条、离开边有多条时，决策点表示经条件判断后从多条后续的处理路径中选择一条路径继续推进。3）并发控制。表示控制流经此节点后分叉多条可并行执行的控制流，或者多条并行控制流经此节点后同步合并为单条控制流。前者情形成为分叉，后者情形分为汇合。4）对象。表示活动需要输入的对象或者作为活动的处理结果输出的对象。



## **4 用例驱动的需求获取过程模型的主要步骤是什么？**

\1) 定义软件问题。2）创建框架用例。3）精化用例。4）评审用例模型。

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230902201108.png)



## **5 定义软件问题的大致过程有什么？**

⑴标识客户和用户；

⑵理解业务背景；

⑶策划并实施需求调查；

⑷定义软件系统的轮廓，包括其目标、业务价值、范围及边界。

 
