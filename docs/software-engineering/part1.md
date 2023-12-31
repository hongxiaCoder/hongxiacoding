# 第一章 软件与软件工程

::: tip 介绍
软件工程是一门关注于系统化、规范化地开发、维护和管理软件的学科。它在现代社会中具有极其重要的地位。<br>
对于每一位编程学习者，都应该了解和学习软件工程。 这篇文档梳理总结了《软件工程》中每一章的知识点，包括了软件和软件工程定义
、需求获取、需求分析与验证、软件测试、软件维护等内容。<br>
本篇文章适合从未了解过软件工程的同学进行学习和课外阅读，以扩充自己的知识; 也适合了解过软件工程的同学进行复习和备考。
:::

## **1.软件与软件组成？软件工程常用的8个质量要素的定义？**

计算机科学对软件的定义：软件是在计算机系统支持下，能够完成特定功能和性能的程序、数据和相关的文档。软件可形式化表示为：软件=知识+程序+数据+文档

用户关注软件质量的外部属性，如软件的正确性、可靠性、有效性、安全性、可用性、可维护性、可移植性、可复用性等。

软件工程师更关注软件质量的内部属性，通过提高软件内部属性，如模块化、一致性、简洁性、可测试性、自文档化等，支持和保证软件外部质量属性的实现。



## **2. 软件工程常用的八个质量要素的定义和解释。**

(1)正确性(correctness)。

软件满足需求规约及完成用户目标的程度。

(2)可用性(usability)。

学习和使用软件的难易程度，包括：操作软件、为软件准备输入数据，解释软件输出结果等。

(3)可靠性(reliability)。

软件完成预期功能，成功运行的概率。软件可靠性反映了软件无故障工作的状况。

(4)有效性(efficiency)。

软件系统利用计算机的时间资源和空间资源完成系统功能的能力。

各种计算机软件无不将系统的时／空开销和网络环境下的信息传输开销作为衡量软件质量的一项重要技术指标。

(5)可维护性(maintainability)。

软件制品交付用户使用后，能够对它进行修改，以便改正潜伏的缺陷、改进性能和其他属性，使软件制品适应环境的变化等等。

(6)可移植性(portability)。

将软件安装在不同计算机系统或环境的难易程度。

(7)安全性(security)。

控制或保护程序和数据不受破坏的机制，以防止程序和数据受到意外的或蓄意的存取、使用、修改、毁坏或泄密。在网络环境下计算机犯罪、恶作剧增多，软件安全受到人们的高度重视。

(8)可复用性(reusebility)。

概念或功能相对独立的一个或一组相关模块定义为一个软构件。

软构件可以在多种场合应用的程度称为构件的可复用性。



## **3. 什么是软件工程?构成软件工程的主要要素是什么?影响软件工程技术进步的动力是什么？**

软件工程定义(IEE93)：将系统的、规范的、可量化的方法应用于软件的开发、运行和维护的过程，以及上述方法的研究。

构成软件工程的五要素：项目、人、过程、方法和工具。

软件工程发展的主要要素是信息社会的广泛需求，软、硬件技术的进步，软件从业人员的工作，软件产业的兴起，软件学科建设和人才培养。





## **4.  遵循的软件工程过程的原则有哪些？**

1)抽象(Abstraction),抽取事物最基本的特性和行为。

2)信息隐藏(Infomation Hiding),将模块中的软件设计决策封装起来的技术。

3)模块化(Modulation),模块是程序中逻辑上相对独立的成分，一个独立的编程单位。

4)局部化(Localization),一个物理模块内集中逻辑上相互关联的计算资源。

5)一致性(Consistency),整个软件系统(包括文档和程序)的各个模块均应使用一致的概念、符号和术语。

6)完全性(Completeness),软件系统完全实现系统所需功能,不遗漏任何重要成分的程度。

7)可验证性(Verification）系统分解应该遵循系统可验证的原则，即容易检查、测试、评审，以便保证系统的正确性.



## **5. 软件开发的主要方法?**

针对不同的软件开发任务，选择适宜的软件开发方法。

1)结构化方法。用分层的数据流图和控制流图开发系统的功能模型和数据模型，是按照系统功能模型，自顶向下，逐步求精，最终得到组成系统的模块及它们之间的控制关系。

2)面向对象方法。是以对象、对象关系构建软件系统的方法，包括面向对象分析、设计、编码和测试几个方面。

3)形式化开发方法。以软件开发的正确性为目标，软件需求规约用形式化需求规约语言描述，如VDM的META-IV,CSP,Z语言等。



## **6. 软件过程模型有哪三种类型，又分别包括哪些模型？**

第1种是将软件开发过程的分解与软件生存周期划分绑定在一起的瀑布模型及其变形；

第2种是软件开发过程的分解与软件生存周期划分相对独立的通用过程模型；

第3种是专用模型，包括基于构件的软件过程模型、Web应用软件过程模型、面向方面AOP的软件过程模型。



## **7. 阐述瀑布模型，分析瀑布模型的优缺点，说明哪些软件项目的开发可采用瀑布模型，哪些不适合？  有哪些改进的软件过程模型?**

瀑布模型也称软件生存周期模型，将软件开发过程分解为可行性研究、软件需求、设计、编码、测试、运行与维护、退役几个阶段，既是软件开发过程的分解，也是软件生存周期的阶段划分。

优点：思路简洁、明确，上一阶段的开发结果是下一阶段开发的输入，相邻两个阶段具有因果关系，紧密联系。对于规模小、软件需求比较稳定的项目和子系统，采用瀑布模型能够显著提高软件开发的质量和效率。

缺点：1）必须要求客户和系统分析员确定软件需求后才能进行后续的软件开发工作。

2）需求确定后，用户和软件项目负责人要等待相当长的时间才能得到一份软件的最初版本。

3）上游的过失给软件制品带来的缺陷会误导下游的开发活动。

大型软件项目获取全部需求是困难的，不适合使用瀑布模型。

针对第3个缺点，提出带反馈的瀑布模型和V字型瀑布模型。针对第2个缺点提出增量过程，模型增量过程模型的基本思想是，开发人员与用户协商将需求分解，划分为一系列增量，并为增量排序，急需的增量排在前面先开发，不急需的放在后面。每个增量都历经需求、设计、编码、测试、移交几个阶段。针对第1个缺点提出原型建造模型，软件开发人员根据客户提出的软件(全部或部分)定义，快速的开发一个原型。原型向客户展示了待开发软件系统的全部或部分功能和性能，在征求客户对原型意见的过程中，进一步修改、完善、确认软件系统的需求并达到一致的理解。





## **8. 阐述通用软件开发过程的五项活动，分析通用软件过程的优点。**

通用软件开发过程划分为沟通、策划、建模、构建、部署5项。

沟通--包括项目立项，软件系统工程师和领域专家、用户的交流。

策划--包括风险分析、项目规划、成本估算、制定项目计划、项目管理。

建模--包括软件开发的需求建模和软件体系结构设计。

构建--包括软件开发的构件获取或构件设计、编码和测试。

部署--包括发布软件制品、现场安装、运行、维护以及用户培训。



优点：通用软件过程模型用”沟通、策划、建模、构建、部署”5项活动构建软件过程模型，在软件项目管理等普适性活动的支持下进行软件开发，增强了软件开发能力，突出了软件工程特色，具有较大的灵活性和适应性。



## **9. 试论述 软件质量要素与 软件工程遵循原则之间的关联关系。**

抽象和信息隐藏、模块化和局部化的原则支持软件工程的可靠性、可移植性和可复用性，有助于提高软件产品的质量和开发效率。

一致性原则支持系统的正确性和可靠性。

系统分解应该遵循系统可验证的原则，即容易检查、测试、评审，以便保证系统的正确性。

使用一致性、完全性、可验证性的原则可以帮助人们实现一个正确的系统。



## **10. 极限编程的10项实践的概念**

1）完整的团队，2）增量式规划，3）客户参与全过程，4）简单设计，5）结对编程，6）测试驱动开发，7）适时重构，8）持续集成，9）代码集体所有，10）其他。



## **11. 原型是什么?在软件工程中发挥什么作用?有哪两类原型？**

原型是软件的一个早期可运行的版本，专注于展示软件的可见部分，反映最终系统的部分重要特性，用于实验和评价，以指导进一步的软件开发和生产。

主要作用在于统一客户和软件开发人员对项目需求的理  解，有助于需求的定义和确认。

原型主要有两类：一类是抛弃式原型，也称实验性原型，利用原型定义和确认软件需求后，原型就完成了任务；另一类是应用原型，也称进化性原型，利用原型确认软件需求后，对原型进一步加工、完善，使之成为系统的一个组成部分。

 
