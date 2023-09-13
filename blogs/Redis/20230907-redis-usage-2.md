---
title: 如何使用Redis实现内容推送功能
date: 2023/09/07
tags:
- 实际应用
categories:
- Redis
---
![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907124624.png)

## 导读

在日常使用中，我们经常能看见内容推送功能。

常见的场景有，比如你在bilibili关注了某个up主，当up主发布视频后，就会推送到你的收件箱或者是动态中，让粉丝能够及时得知所关注的人发布了内容。

又比如朋友圈，也是按照时间的顺序，将好友发布的动态推送给你，如果你下拉刷新，就可以获取到新的好友的动态。

**想知道这些功能是如何实现的吗？接着往下看吧！**

这个需求，其实我们又把他叫做Feed流，关注推送也叫做Feed流，直译为投喂。为用户持续的提供“沉浸式”的体验，通过无限下拉刷新获取新的信息。

对于传统模式的内容解锁：我们是需要用户去通过搜索引擎或者是其他的方式去解锁想要看的内容

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907124753.png)

 而对于Feed模式，则是主动推送给用户内容

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907124801.png)

##  Feed流的两种模式

Feed流的实现有两种模式：

Timeline：不做内容筛选，简单的按照内容发布时间排序，常用于好友或关注。例如朋友圈

- 优点：信息全面，不会有缺失。并且实现也相对简单

- 缺点：信息噪音较多，用户不一定感兴趣，内容获取效率低


智能排序：利用智能算法屏蔽掉违规的、用户不感兴趣的内容。推送用户感兴趣信息来吸引用户

- 优点：投喂用户感兴趣信息，用户粘度很高，容易沉迷


- 缺点：如果算法不精准，可能起到反作用


**我们本次关注-推送的功能，采用的就是Timeline的方式，只需要拿到我们关注用户的信息，然后按照时间排序即可。**

该模式的实现方案有三种：拉模式，推模式，推拉结合

### 拉模式（读扩散）

该模式的核心含义就是：当张三和李四和王五发了消息后，都会保存在自己的邮箱中，假设赵六要读取信息，那么他会从读取他自己的收件箱，此时系统会从他关注的人群中，把他关注人的信息全部都进行拉取，然后在进行排序

- 优点：比较节约空间，因为赵六在读信息时，并没有重复读取，而且读取完之后可以把他的收件箱进行清除。


- 缺点：比较延迟，当用户读取数据时才去关注的人里边去读取数据，假设用户关注了大量的用户，那么此时就会拉取海量的内容，对服务器压力巨大。


![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907124833.png)

### 推模式（写扩散）

推模式是没有写邮箱的，当张三写了一个内容，此时会主动的把张三写的内容发送到他的粉丝收件箱中去，假设此时李四再来读取，就不用再去临时拉取了

- 优点：时效快，不用临时拉取


- 缺点：内存压力大，假设一个大V写信息，很多人关注他， 就会写很多分数据到粉丝那边去


![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907124841.png)

### 推拉结合模式

推拉模式是一个折中的方案，站在发件人这一段，如果是个普通的人，那么我们采用写扩散的方式，直接把数据写入到他的粉丝中去，因为普通的人他的粉丝关注量比较小，所以这样做没有压力，如果是大V，那么他是直接将数据先写入到一份到发件箱里边去，然后再直接写一份到活跃粉丝收件箱里边去，现在站在收件人这端来看，如果是活跃粉丝，那么大V和普通的人发的都会直接写入到自己收件箱里边来，而如果是普通的粉丝，由于他们上线不是很频繁，所以等他们上线时，再从发件箱里边去拉信息。

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907124928.png)

## Redis实现思路

我们使用Redis来实现Feed流，就需要选择合适的数据结构。

Feed流有两种特点，一是需要进行时间排序，二是数据不断在更新变化，即角标不断变化。

可以进行排序的数据结构有list，sortedset，都满足第一点需求。

feed流推送过来的内容，我们通常不是一次性查询所有内容，而是需要分页查询。传统的分页查询使用page和size来圈定范围，但是feed流不断进行内容推送，数据不断进行更新（类似栈结构，时间戳越大的在上头），数据角标不断变化，使用传统的分页模式就会导致内容的重复查询。所以需要使用滚动查询，滚动查询指的是记录上一次所查询的位置，下次查询时接着往下查询。所以使用sortedset结构我们可以记录每次查询最小的时间戳，下次查询的时候再找比这个时间戳更小的，就实现了滚动查询的效果。而list结构只能通过角标查询。所以我们最终选择sortedset结构。

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907124944.png)

 ![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907125000.png)

 

## 流程

### 1.保存笔记并推送

在用户发布笔记保存到数据库的同时，也需要将笔记id推送到粉丝的收件箱中，即sortedSet集合中。key是“feed:粉丝id”，value是blog的id，score是当前时间戳

savaBlog（）：

- 验证用户是否登录
- 验证blog是否完整（发布者id，内容，关联商户）

- 保存blog到数据库


- 推送blog给粉丝


- 获取登录用户粉丝集合


- 循环遍历每个粉丝，保存blogId到粉丝sortedset集合


- 返回blog的id


### 2.获取推送笔记

如何使用Redis的sortedSet结构来实现滚动分页，获取推送的笔记内容？

```
ZREVRANGEBYSCORE key max min [WITHSCORES] [LIMIT offset count]
```

命令解释：根据score值进行降序排序，查询count条集合中score范围为max到min的值

- key：键


- max，min：查询max到min范围的值


- [WITHSCORES ]：是否带上score值

- offset：偏移量，表示对于max值的偏移量，0表示对max偏移量为0，即取max值


- count：查询几条


实现滚动分页，我们将时间戳作为score值，对score值进行降序排序就可以根据发布时间对笔记进行排序。

滚动分页的基本思想是：记录上一次查询的最小时间戳，下次查询时从所记录的位置开始查询。如果是第一次查询，max值就是当前时间戳，offset值取0，min值取0（因为时间戳最小为0，不可能为负数）；如果不是第一次查询，max值就是上一次查询的最小时间戳，offset值取1（即不包括上一次查询的位置，否则会重复查询），min值取0。

**需要注意的是，offset的值第一次查询时为0，之后的查询不一定为1，因为有可能会出现时间戳相等的情况：**

比如score值降序排序后为5 2 2 3 2 2，每次查询3条记录。

那么第一次所查到的score是5 2 2，此次记录的最小时间戳是2。下次查询时，redis会查找到score值为2的位置，即第一个2，然后根据偏移量进行便宜，如果偏移量为1，那么结果就会为 2 3 2 ，而不是 3 2 2。所以偏移量offset的值应该是当前查询最小时间戳的重复次数。

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907125117.png)

所以通过上面的分析，我们发现min和count值是不变的。max和offset都需要通过前端作为请求参数传递。

当第一次查询时，前端发送的请求参数max为当前时间戳，offset默认为0可以不传递，当后端查询出所需要的笔记集合，还需要记录本次查询的最小时间戳，以及计算偏移量，并返回给前端，这两个数据将作为下一次查询的参数。而前端每次上下拖动的时候，就会刷新会发起请求。

queryBlogOfFollow（max，offset）:

- 检验是否登录，获取当前登录用户


- 查看收件箱


- 滚动查询收件箱，获取笔记id


- 根据笔记id查询笔记


- 封装返回


```Java
 @Override
    public Result queryBlogOfFollow(Long max, Integer offset) {
        //获取当前用户
        Long userId = UserHolder.getUser().getId();
        //查看收件箱
        String key = FEED_KEY + userId;
        Set<ZSetOperations.TypedTuple<String>> typedTuples = stringRedisTemplate.opsForZSet().reverseRangeByScoreWithScores(key, 0, max, offset, 2);
        //非空校验
        if(typedTuples == null || typedTuples.isEmpty()){
            return Result.ok();
        }
        //取出收件箱的笔记id放入集合
        List<Long> idList = new ArrayList<>(typedTuples.size());
        long minTime = 0;
        int os = 1;
        for (ZSetOperations.TypedTuple<String> typedTuple : typedTuples) {
            idList.add(Long.valueOf(typedTuple.getValue()));
            //获取最小的时间戳，记录偏移量
            long time = typedTuple.getScore().longValue();
            if(time == minTime){
                os++;
            }else{
                minTime = time;
                os = 1;
            }
        }
        //根据id集合查询blog
        String idStr = StrUtil.join(",",idList);
        List<Blog> blogs = query().in("id", idList).last("ORDER BY FIELD(id," + idStr + ")").list();
 
        //查询blog点赞和相关用户
        for(Blog blog : blogs){
            queryBlogUser(blog);
            isBlogLiked(blog);
        }
 
        //封装并返回
        ScrollResult result = new ScrollResult();
        result.setList(blogs);
        result.setOffset(os);
        result.setMinTime(minTime);
 
        return Result.ok(result);
    }
```

