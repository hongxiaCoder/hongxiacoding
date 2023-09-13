# Reids设计与实现（持续更新中）

## Base理论

Base理论是CAP原则中对一致性妥协而形成的理论。

BASE是Basically Available（基本可用）、Soft state（软状态）和Eventually consistent（最终一致性）三个短语的简写。

CAP分别指的是一致性，可用性，分区容错性，指的在分布式系统中，这三个要素只能同时实现两点，不能三者兼顾。

Base理论不追求强一致性原则，允许数据在一段时间内不一致，但最终要达到一致，从而来获得更高的可用性和性能。

## 对象

### String

#### 是什么

String就是字符串，是Redis中最基本的数据对象，最大为512M，当然也可以使用配置项来修改他。

#### 使用场景

一般可以用于存储字节数据，文本数据，序列化之后的对象数据，只要是字符串都可以往里存储。

比如缓存场景，Value存储Json字符串等信息；计数场景，存储如访问次数、点赞、转发、库存数量等，因为Redis处理命令是单线程的，所以执行命令的过程是原子的。

#### 常用命令

```
创建,更新
SET key value [EX/PX] [NX]
SETNX key value
查询
GET key
MGET key1, key2
删除
DEL
```

NX指的是当key不存在时才会进行设置。如果不使用NX参数或者SETNX命令，直接使用SET命令，如果key存在的话就会覆盖掉原来的value

#### 底层实现

##### 3种编码方式

String数据对象的底层有3种编码方式，包括INT，EMBSTR和RAW

- INT编码：当存储的数据可以被理解为long类型的整数，就是用INT编码进行存储。（即存储的是一个整型，就用INT编码）
- EMBSTR编码：如果字符串小于等于阈值字节，使用EMBSTR编码
- RAW编码：如果字符串大于阈值字节，使用RAW编码

这个**阈值**源码中是使用常量OBJ_ENCODING_EMBSTR-SIZE_LIMIT来表示的，3.2版本之前是39字节，3.2版本之后是44字节。

EMBSTR编码和RAW编码都由redisObject和sds结构组成，区别在于EMBSTR编码下这两个结构是连续的内存，而RAW编码下是不连续的。

EMBSTR编码连续的结构**好处在于**，能够为这两个结构一次性分配内存空间，**缺点在于**如果需要重新分配空间，整体都需要重新分配，所以EMBSTR结构被设计为只读，使用EMBSTR编码存储的数据一旦被更新，就会变为RAW编码。理念是发生过修改的字符串通常会认为是需要经常变化的。

编码可能转变的情况：

INT->RAW：当存储的内容不再是整数，或者大小超过long类型

EMBSTR->RAW：当发生写操作后

![](https://img.hongxiac.com/image/202309102049796.png)

![](https://img.hongxiac.com/image/202309102049747.png)

##### sds

在Redis中，像字符串的追加，计算长度都是比较常见的操作。一般来说追加字符串就需要为字符串**重新分配内存**，计算字符串长度需要O(N)的复杂度，是有一定开销的。所以Redis就封装了叫SDS的字符串结构，用来解决这些问题：

1. 追加字符串需要重新分配内存
2. 计算字符串需要O(N)的时间复杂度
3. 非二进制安全

> 非二进制安全指的是，在C语言中的字符串，使用字符数组存储字符串，并用'\0'结尾表示一个字符串的结尾。所以字符串中出现了这个'\0'，就会被截断，这是不安全的。
>
> 二进制安全是一种主要用于**字符串操作函数相关的计算机编程术语**。
> 其描述的是：**将输入作为原始的、无任何特殊格式意义的数据流。对于每个字符都公平对待，不特殊处理某一个字符**。

SDS结构中，包括了len字段表示已使用的内存空间大小，alloc字段表示总共分配了多少内存，这两个的差值就是预留空间的大小，预留的空间能够方便字符串的追加。还有flag字段，数据buf[]数组。

预留空间的大小规则如下：

- 如果len小于1M，则alloc = 2 * len，即预留len大小的空间
- 如果len大于1M，则alloc = 1M + len，即预留1M大小的空间

所以Redis定义的SDS结构，就能对应解决上述的问题：

1. 增加len长度字段，可以直接返回
2. 增加预留空间，方便字符串追加，而无需重新分配空间
3. 不再以'\0'最为结束标志，保证二进制安全

### List

#### 是什么

List是一组连接起来的字符串集合，和Java中的LinedList类似，可以看作是双向链表结构。

在我使用的5.0.1中，List最大元素个数是2^32 - 1，新版本已经是2^64 - 1了

#### 使用场景

List作为列表存储，通常会存储一批任务数据，存储一批消息，比如像朋友圈的点赞列表，评论列表

#### 常用命令

```
创建
LPUSH key value [value2 ...] 从左侧添加元素，返回List中总元素个数
RPUSH key value [value2 ...] 从右侧添加元素，返回List中总元素个数
更新
LPUSH
RPUSH
LPOP key [count]从左侧移除并获取列表的第一个[count]元素
RPOP key [count]从右侧移除并获取列表的第一个[count]元素
LREM key count value 移除值等于value的元素，返回移除的个数
（count = 0时，移除所有等于value的元素
  count > 0时，从左侧移除count个等于value的元素
  count < 0时，从右侧移除count个等于value的元素
）
查询
LLEN key 查看List的长度，即元素总数
LRANGE key start stop 查看角标为start到stop的元素，角标从0开始；如果为负数，表示倒数第几个元素
删除
DEL key [key ...] 删除对象，返回值为删除成功的个数
UNLINK key [key ...] 删除对象，返回值为删除成功的个数
```

DEL和UNLINK二者都能够删除键，区别在于del命令是同步删除，会阻塞客户端直至删除完成。而unlink命令是异步删除，不会阻塞客户端，会先取消KEY在键空间的关联，使其无法被查询。

#### 底层实现

3.2版本之前，List对象有两种编码方式，一种是ZIPLIST，另一种是LINKEDLIST。在3.2之后多了一种QUICKLIST

当满足如下条件时，使用ZIPLIST编码：

1. 列表对象保存的所有**字符串对象长度都小于64字节**
2. 列表对象元素少于512个，超过则变为LINKEDLIST

ZIPLIST底层使用压缩列表实现的，是内存紧凑的，占用连续的内存空间。这样的好处是能够节约内存空间

![](https://img.hongxiac.com/image/202309121029047.png)

如果不满足ZIPLIST编码的条件，就会使用LINKEDLIST编码。

LINKEDLIST数据是以链表的形式连接在一起，不占用连续的内存空间。这样的好处是删除操作会更加灵活，加快处理性能。但因为指针会占用一定的内存空间，所以是牺牲了内存空间；另外每个节点都是单独分配，会加剧内存碎片。

**所以当列表个数或节点数据长度比较大的时候，才会使用LINKEDLIST编码。**

![](https://img.hongxiac.com/image/202309102049766.png)

QUICKLIST是ZIPLIST和LINKEDLIST的结合体，它将LINKEDLIST按段切分，每一段使用ZIPLIST来紧凑存储，多个ZIPLIST之间使用双向指针连接

![](https://img.hongxiac.com/image/202309102049203.png)

### ZIPLIST

#### 压缩列表

压缩列表就是排列紧凑的列表，在内存中占用连续的空间

压缩列表在Redis底层有两种编码模式，一种是ZIPLIST，平常说的压缩列表就是指ZIPLIST。另一种是LISTPACK，是在5.0引入的，直到7.0完全替换了ZIPLIST

#### 压缩列表解决了什么问题

压缩列表由于在内存中使用连续的存储空间，它的内存是紧凑的，所以相比于LinkedList能够节约内存，节省链表指针的内存开销，适合小数据量的情况。

#### 结构

Redis源码注释中，标注了ZIPLIST的结构

```
1 * The general layout of the ziplist is as follows:
2 *
3 * <zlbytes><zltail><zllen><entry><entry>..<entry><zlend>
```

比如有3个节点的ZIPLIST结构

![](https://img.hongxiac.com/image/202309102049757.png)

- zlbytes：表示该ZIPLIST一共占用了多少字节，包括了zlbytes本身占用的字节数

- zltail：表示ZIPLIST尾巴结点相对于开头（起始指针）的偏移字节数。通过计算

  ZIPLIST起始地址和偏移量之和，能够定位到最后的节点。如果没有尾节点（即空ZIPLIST），就会定位到zllen

- zllen：表示有有多少个数据节点

- entry：表示ZIPLIST的数据节点

- zlend：表示ZIPLIST的结束

所以整个ZIPLIST的结构，记录了总字节数，偏移量，数据节点的个数，数据节点，尾部节点共5项

#### ZIPLIST节点结构

ZIPLIST ENTRY定义如下：

```
<prevlen><encoding><entry-data>
```

- prevlen：表示上一个节点的长度。通过这个字段可以定位到上一个节点的地址，也就是当前节点起始地址 - prevlen。**所以压缩列表能够从后往前遍历**。

  如果前一个节点的长度小于254字节，那么prevlen就需要占用1个字节的空间来保存上一个节点的长度。

  如果上一个节点的长度大于254字节，那么prevlen就需要占用5个字节的空间，其中第一个字节为11111110，用来标志这是占用了5个字节的prevlen，剩下4个字节表示大小。

- encoding：表示编码类型，其中包含了entry的长度信息。根据节点起始地址和entry长度信息，能够计算得到下一个节点的地址。**所以压缩列表能够从前往后遍历**。

- entry-data：实际的数据

#### encoding说明

encoding字段是一个整型数据，二进制编码由内容数据的类型（字符串或者int）和内容数据的字节大小两部分组成。

![](https://img.hongxiac.com/image/202309102049789.png)

如果是String类型，那么encoding有两部分，一般前几位表示类型，后几位标识字符串长度。类型指的是，根据字符串的长度将String又继续分类。

如果是int类型，encoding整体占用1个字节。因为int类型包括了2个字节的int16类型，4个字节的int32类型，8个字节的int64类型，只要知道int类型，就知道entry-data大小

#### ZIPLIST查询数据

- 查询数据总量：由于ZIPLIST结构中定义了zllen来记录数据节点的总数，所以通常能在O（1）复杂度返回。但是因为zllen占用了2个字节，所以如果数据节点的数量超过了2个字节（即2^16）,zllen就无法记录，那么就需要对节点数量进行遍历。

  这样设计的原因也是符合ZIPLIST的使用场景，即小数据量的情况，所以zllen就设计的比较小，节省内存空间

- 查询指定数据：需要遍历整个压缩列表，平均时间复杂度为O（N）

#### ZIPLIST更新数据

List中的更新指的从头尾增加，删除数据。平均时间复杂度是O（N）。因为从头部增加数据，需要后面的节点往后移动，而尾部只需要直接添加即可。

#### 连锁更新问题

更新操作可能带来连锁更新。指的是增加节点导致的后面节点往后移动，这个过程发生了不止一次，而是多次。

比如增加一个头部节点且字符串长度大于254个字节，那么该节点后面的节点的prevlen字段原本只占用1个字节，现在需要占用4个字节，整个entry的大小因此也变大，当新数据插入导致后移完成之后，还需要逐步迭代更新。也就是不仅新插入数据后需要整体后移，而且prevlen导致的entry变大也需要后面的元素再次后移。

时间复杂度是O(N^2)，6.2之后优化为O(N)。但实际业务中，很少会遇到需要迭代更新超过2个节点的情况。所以ZIPLIST更新平均时间复杂度，还是可以看作O(N)。ZIPLIST最大的问题还是因为连锁更新导致的性能不稳定。

![](https://img.hongxiac.com/image/202309102050603.png)

#### LISTPACK优化连锁更新

连锁更新的本质还是因为ZIPLIST结构中的prevlen字段，它所占用的字节大小会受到前一个数据节点字符串长度的影响。

但如果没有了prevlen，该如何进行从后往前的遍历呢？

LISTPACK定义了节点的另外一种形式，不需要prevlen，也能够实现从后往前遍历，关键在于element-tot-len

```
<encoding-type><element-data><element-tot-len>
```

- encoding-type：表示编码类型
- element-data：表示数据内容
- element-tot-len：表示除了它自身以外，整个数据节点的长度。

element-tot-len所占用的每个字节，第一个bit位都用来标识是否结束，0表示结束，1表示继续，剩下的七个bit位用来存储数据大小。

当需要查找当前元素的上一个元素时，就可以从当前元素的起始地址开始，从后往前依次查找每个字节（即在上一个元素的element-tot-len中查找），直到找到结束标识。除了首位标志位，把每个字节二进制位取出来就能得知element-type + element-data的大小（注意这个是上一个元素的），然后从结束标识位，往前走element-type + element-data，就可以找到当前元素的上一个元素的起始地址

### Set

#### 是什么

Redis的Set是一个不重复，无序的字符串集合。（使用INTESET编码其实是有序的，不过整体还是看成无序的）

#### 使用场景

适用于无序集合场景，比如用户关注了哪些公众号。此外还适用于求交集，并集的场景，比如共同关注

#### 常用命令

```
创建
SADD key member [member...] 返回成功添加了几个元素
删除
SREM key member [member...] 返回成功删除了几个元素
查询
查询元素是否存在
SISMEMBER key member 返回1存在，0不存在
查询集合元素个数
SCARD key
查询集合的所有元素
SMEMBERS key
查询指定下标开始的元素，默认10个,可模糊查询
SSCAN key count [MATCH pattern] [COUNT count]

查询集合的交集
SINTER key [key...]
查询集合的并集
SUNION key [key...]
查询第一个集合存在，其他集合不存在的元素
SDIFF key [key...]
```

#### 底层实现

##### 编码方式

支持两种编码方式，分别为INTSET和HASHTABLE

- INTSET：如果集群元素都是整数，且元素个数不超过512，则使用INTSET编码。排列紧凑，占用内存少，但查询需要二分搜索
- HASHTABLE：查询性能高，能在O(1)时间找到元素是否存在

![](https://img.hongxiac.com/image/202309102050526.png)

![](https://img.hongxiac.com/image/202309102050963.png)