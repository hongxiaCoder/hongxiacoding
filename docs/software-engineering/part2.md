
# 第二章 UML与RUP统一过程

## **1. 面向对象方法学包括的核心概念有哪几个？面向对象方法学的优势？**

对象 类 继承 聚合 多态 消息

优势：简化软件开发过程 支持软件复用 改善软件结构



## **2. UML定义了哪5种图形机制，各种图形机制包括的内容以及作用是什么？**

用例视图：包括用例图，从外部用户的角度描述系统的功能，并指出功能的参与者。

结构视图：包括包图、类图和对象图，它们分别从不同的层面表示系统的静态结构。包图描述系统的分解结构，表示包与包之间的关系，包由子包及类构成，包之间的关系包括继承、构成和依赖。类图描述系统的静态结构。

行为视图：包括交互图、状态图、活动图，从不同的侧面刻画系统的动态行为。交互图描述对象之间通过消息传递进行的交互与协作，又可分为顺序图和通信图。状态图描述类的对象的动态行为，包含对象所有可能的状态、在每个状态下能够响应的事件以及事件发生时的状态迁移和响应动作。活动图描述系统为完成某项功能而执行的操作序列。

构件视图：包括构件图，描述软件系统中各组成构件、构件的内部结构以及构件之间的依赖关系。

部署视图：包括部署图，描述软件系统中的各类工件在物理运行环境中的分布情况。



## **3. RUP作为一个软件项目开发框架包括的内容有哪些？**

RUP将软件生存周期，即软件制品的进化状态划分为初始、细化、构造、移交、生产5个阶段，将软件开发过程分解为业务建模、需求、设计、实现、验证与确认、部署、配置和变更管理、项目管理、环境9个工作流。



## **4. RUP过程九个工作流的主要任务?**

| **工作流** | **任  务**                                                   |
| ---------- | ------------------------------------------------------------ |
| 管理       | 实施软件项目管理，包括：项目计划、项目控制、项目组织         |
| 环境       | 为软件开发团队提供可用的适宜的软件工具、环境                 |
| 配置变更   | 制定配置管理规划、实施变更管理、实施版本和发布管理、组织系统变更、测试 |
| 业务建模   | 了解用户的业务及过程，对业务过程建模，生成业务用例           |
| 需求       | 实施需求分析与描述、需求验证等                               |
| 分析设计   | 根据规约，采用适宜的方法进行软件体系结构设计，软构件选取和设计 |
| 实现       | 编写、调试代码或构造系统组件，并将他们集成到子系统，采用自动代码生成技术可提高实现效率 |
| V&V        | V&V包括走查、评审、单元测试、集成测试、系统测试等，贯穿软件开发全过程 |
| 部署       | 创建和发布软件制品版本，并安装到工作现场                     |

 

 