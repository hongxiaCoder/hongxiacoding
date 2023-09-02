---
title: 进程管理
date: 2023/08/29

---
## 进程的定义与特征


在多道程序环境下，程序的执行属于并发执行，因此它们会失去封闭性，并具有间断性和运行结果不可再现性。通常，程序是不能参与并发执行的，否则，程序的执行就失去了意义。为了使程序可以并发执行，并且可以对并发执行的程序加以描述和控制，人们在OS中引入了“进程”这一概念。
为了使参与并发执行的每个程序(含数据)都能独立地运行，在OS中必须为之配置一个专门的数据结构，称之为进程控制块( process control block, PCB)。系统利用PCB来描述进程的基本情况和活动过程，进而控制和管理进程。这样，由程序段、相关的数据段和PCB这3部分便构成了进程实体(又称为进程映像)。一般情况下，我们把进程实体简称为进程，例如，所谓创建进程，实质上是指创建进程的PCB，而撤销进程，实质上是指撤销进程的PCB。

进程具有以下特征：

- 动态性：进程的实质是程序的执行过程，表现在由创建而产生，由调度而执行，由撤销而消亡。而程序只是一组有序指令的集合
- 并发性：指的是多个进程共存于内存，并能在一段时间内同时执行。而程序（未建立PCB）是不能参与并发。
- 独立性：指的是进程能独立运行，独立获得资源，独立接收调度的基本单位
- 异步性：指的是进程按异步的方式运行

## 进程的基本状态与转换

进程具有5种基本的状态，包括创建，就绪，执行，阻塞，终止，以及额外的挂起操作。

- 就绪(ready)状态：指进程已处于准备好执行的状态，即进程已分配到除CPU以外的所有必要资源后，只要再获得CPU,便可立即执行。如果系统中有许多处于就绪状态的进程，则通常会将它们按一定的策略（如优先级策略)排成一个队列，称该队列为就绪队列。
- 执行（Runniag）状态：是指进程获得CPU后其程序“正在执行”这一状态。对任何一个时刻而言，在单处理机系统中，只有一个进程处于执行状态，而在多处理机系统中，则可能会有多个进程处于执行状态。
- 阻塞（Blocked）状态：正在执行的进程由于发生某事件（如/O请求、申请缓冲区失败等)而暂时无法继续执行，即进程的执行受到了阻塞。此时会引发进程调度，OS会把处理机分配给另一个就绪进程，而让受阻进程处于暂停状态，一般将这种暂停状态称为阻塞状态，有时也称为等待状态或封锁状态。通常系统会将处于阻塞状态的进程排成一个队列，称该队列为阻塞队列。实际上，在较大的系统中，为了减少阻塞队列操作开销，提高系统效率，根据阻塞原因的不同，会设置多个阻塞队列。
- 创建（New）状态：引入创建状态，是为了保证进程的调度必须在创建工作完成后进行，以确保对PCB操作的完整性。同时，创建状态的引入也增加了管理的灵活性，OS可以根据系统性能或内存容量的限制，推迟新进程的提交（使进程处于创建状态）。对于处于创建状态的进程，当其获得了所必需的资源，并完成了对PCB的初始化工作后，便可由创建状态转入就绪状态。
- 终止（Terminated）状态：进程的终止需要两个步骤：首先，等待OS进行善后处理；然后，将进程的PCB清零，并将PCB空间返还OS。当一个进程到达了自然结束点，或是出现了无法克服的错误，或是被OS所终止，或是被其他有终止权的进程所终止时，它就会进入终止状态。进入终止状态的进程不能再被执行，但在OS中依然会保留一个记录，其中会保存状态码和一些计时统计数据以供其他进程收集。一旦其他进程完成了对其信息的提取，系统就会删除该进程，即将其PCB清零，并将该空白PCB返还OS。
- 挂起：挂起进程在操作系统中可以定义为暂时被淘汰出内存的进程，机器的资源是有限的，在资源不足的情况下，操作系统对在内存中的程序进行合理的安排，其中有的进程被暂时调离出内存，当条件允许的时候，会被操作系统再次调回内存，重新进入等待被执行的状态即就绪态，系统在超过一定的时间没有任何动作。

![image-20230828172204328](C:\Users\Doom\AppData\Roaming\Typora\typora-user-images\image-20230828172204328.png)

进程的状态之间的转换是操作系统中的一个关键概念，它由操作系统的进程管理器负责控制。下面我将详细介绍进程在不同状态之间如何转换。

1. **新建状态（New）到就绪状态（Ready）：**
   当一个进程被创建时，它处于新建状态。在这个阶段，操作系统为进程分配必要的资源，比如内存空间和初始寄存器值，并且初始化进程控制块（PCB）。一旦进程准备好了所有必要的资源，它就会被移到就绪状态，表示它已经准备好被调度执行。

2. **就绪状态（Ready）到运行状态（Running）：**
   在就绪状态下，进程等待分配CPU时间片来执行。当操作系统的调度算法选择了这个进程作为下一个要执行的进程时，进程会从就绪状态转换到运行状态。这时，操作系统会为进程分配CPU时间，进程开始执行指令。

3. **运行状态（Running）到阻塞状态（Blocked）：**
   在运行状态下，进程正在执行指令。然而，当进程需要等待某个事件（比如I/O操作）完成时，它会进入阻塞状态。进程会将控制权交还给操作系统，进入等待队列，不再占用CPU。这时，操作系统可以调度其他就绪状态的进程执行。

4. **阻塞状态（Blocked）到就绪状态（Ready）：**
   当一个进程等待的事件完成（比如I/O操作完成），它会从阻塞状态转换回就绪状态。进程此时变为可执行状态，等待调度器从就绪队列中选择一个进程分配CPU时间。

5. **运行状态（Running）到终止状态（Terminated）：**
   当进程完成了它的任务，或者由于某些原因（如发生了错误）被操作系统终止时，进程会从运行状态转换到终止状态。在终止状态下，进程释放它所占用的资源，包括内存空间和打开的文件等。

## 进程控制块PCB

### 存储的信息

为了便于系统描述和管理进程，操作系统为每个进程专门定义了一个数据结构，即PCB。它是进程的一部分，记录了操作系统所需的、用于描述进程当前情况和管理进程运行状态的全部信息。

PCB包括以下四种信息：

- 进程标识符：用来唯一标识一个进程
- 处理机状态：也称为处理机上下文，主要由处理机的各种寄存器中的内容组成，比如通用寄存器、指令计数器、程序状态字寄存器
- 进程调度信息：包括了进程状态、进程优先级、进程调度所需要的其他信息、事件（阻塞原因）
- 进程控制信息：指的是用于进程控制所必须的信息，包括程序和数据地址、进程同步和通信机制、资源清单等

### 作用

1. 作为独立运行基本单位的标志：当系统创建一个进程的时候，就会为它建立一个PCB，进程结束时候就会被回收。PCB作为进程存在于系统中的唯一表示
2. 实现间断性运行方式：进程由于阻塞而暂停运行时，就可以通过PCB来存储运行时的CPU现场信息，以供进程再次被调度运行时候恢复CPU现场信息
3. 提供进程管理所需要的信息：当调度程序调度到某进程时，只能根据进程PCB中记录的程序和数据在内存或外存起始地址，来获取对应的程序和数据
4. 提供进程调度所需要的信息：记录着进程所处状态信息，比如就绪状态，优先级等信息