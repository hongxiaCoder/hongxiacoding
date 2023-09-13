---
title: 黑马点评面试题（功能实现版）
date: 2023/09/06
categories:
- reco
- 项目
---
# 5项目每个部分的问题

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230906162841.png)

## 1.你是怎么实现登录的？

我这里使用的是短信验证，不过没有具体实现，因为实现需要使用第三方的接口调用短信服务的api接口
实现登录，由三部分构成，分别是：发送短信验证码，验证登录信息，保持登录态和刷新登陆态

### 发送短信验证码过程

1. 校验手机号是否符合规则，如果不符合则返回错误信息，这里校验用的是正则表达式，我单独建立了一个存放正则表达式的类，因为还会有其他的正则表达式，例如邮箱，账户，密码，验证码的正则，如果不符合规则直接报错。
2. 如果手机号符合规则，生成六位随机数字验证码，这里使用了Hutool工具类的RandomUtil工具类，随机生成6位随机数字。
3. 将验证码保存在 Redis 中，使用redis的String字符串数据结构来保存，保存的验证码因为要有唯一性，我这里用手机号作为key，不过加了一个前缀来标识，因为后面还会有很多的其他key值，设置一个前缀能够很好地区分其它存储在缓存中的 Key 值，并且单独建了一个工具类，存了这些静态的名称，方便管理和调用，比如这个登陆验证码就叫做“login:code:”，看redis数据的时候比较方便也好理解。最后设置了2分钟的过期时间，达到这个时间自动删除。
4. 发送短信验证码。
5. 返回成功信息。

### 验证登录信息过程

1. 校验手机号是否符合规则，如果不符合则返回错误信息。
2. 从 Redis 中获取该手机号对应的验证码，并判断验证码是否与用户输入的一致，如果不一致则返回错误信息。
3. 如果验证码一致，根据手机号查询用户是否存在。
4. 如果用户不存在，创建用户。
5. 将用户信息存储到 Redis 中。
6. 随机生成一个 token，作为用户的登录令牌，将用户信息以 hash 的形式保存在 Redis 中，key 为 LOGIN_USER_KEY + token。这里的token用了UUID随机生成全局唯一标识，避免token重复，还设置了一个有效期，不然就会一直挂在那里。
7. 返回 token。

### 登陆态和刷新登陆态实现

用户在前端输入用户名和密码，发送了POST请求到后端，后端进行验证，如果验证通过，则在后端创建一个Token，并将该Token保存在Redis中，同时将Token和用户不重要的信息返回给前端。例如用户id，用户名称，头像这种，不需要保密的信息返回，所以我这里用了一个UserDTO，把User实体类的一些需要的属性提炼了出来，进行使用。
我这里使用了两个拦截器，一个拦截所有请求用于检查用户是否已登录，例如存入redis的token已经过期了，就属于退出登录了。
一个是用来刷新Token的拦截器，如果用户访问页面超过了30分钟，也是有操作的，如果不刷新token，就会导致突然下线，这样用户体验不好嘛

## 2.你是怎么实现商户缓存？为什么要这样做呐？

### redis缓存商户信息

商户信息缓存的实现一般是将商户信息存储到 Redis 中，下次查询时先从缓存中获取，如果缓存中存在数据则直接返回给用户，否则从数据库中查询并将结果存入缓存。

1. 从 Redis 中获取 id 对应的店铺信息，如果缓存命中则直接返回。
2. 如果没有命中 Redis 缓存，则从数据库中获取 id 对应的店铺信息。
3. 如果数据库中也没有该店铺信息，则返回查询失败的信息。
4. 如果在数据库中找到了该店铺信息，将其转换为 JSON 字符串，并将其存入 Redis 中，以便下次查询时使用。
5. 最后将找到的店铺信息返回给客户端。

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230906163322.png)
这个方法的优点是可以减轻数据库的查询负担，因为如果 Redis 缓存中存在该店铺信息，就可以直接返回，不用查询数据库。缺点在于需要手动管理 Redis 缓存的更新，确保与数据库中的信息一致。
所以我下面就开始解决缓存更新问题。

### 缓存更新问题

缓存更新我了解到的大概有以下三种方案：

- 内存淘汰：Redis自动进行，当Redis内存大道我们设定的max-memery时，会自动触发淘汰机制，淘汰掉一些不重要的数据（可以自己设置策略方式）
- 超时剔除：当我们给Redis设置了过期时间TTL之后，Redis会将超时的数据进行删除，方便我们继续使用缓存
- 主动更新：我们可以手动调用方法把缓存删除掉，通常用于解决缓存和数据库不一致问题

业务场景

- 低一致性需求：使用内存淘汰机制，例如店铺类型的查询缓存（因为这个很长一段时间都不需要更新）
- 高一致性需求：主动更新，并以超时剔除作为兜底方案，例如店铺详情查询的缓存

我们这里悬着用主动更新的双写方案解决店铺信息缓存和数据库不一致问题，也就是当缓存调用者在更新完数据库之后再去更新缓存，我这里是直接删除缓存，因为更新缓存需要进行一些无效的写操作，直接删除缓存快一些，还不容易出错
下面我就是先操作数据库，再删除缓存，尽量的避免线程安全问题。
这种情况下的线程问题，只有一种情况，就是当线程1在查询缓存的时候，缓存TTL刚好失效，需要查询数据库并写入缓存，这个操作耗时相对较短，但是就在这么短的时间内，线程2进来了，更新数据库，删除缓存，但是线程1虽然查询完了数据（更新前的旧数据），但是还没来得及写入缓存，所以线程2的更新数据库与删除缓存，并没有影响到线程1的查询旧数据，写入缓存，造成线程安全问题。但是这种情况，很少出现。

### 缓存穿透问题

缓存穿透：缓存穿透是指客户端请求的数据在缓存中和数据库中都不存在，这样缓存永远都不会生效（只有数据库查到了，才会让redis缓存，但现在的问题是查不到），会频繁的去访问数据库。

- 常见的结局方案有两种
    1. 缓存空对象
        - 优点：实现简单，维护方便
        - 缺点：额外的内存消耗，可能造成短期的不一致
    2. 布隆过滤
        - 优点：内存不占用，没有多余的key
        - 缺点：实现复杂，可能存在误判

- 缓存空对象思路分析：当我们客户端访问不存在的数据时，会先请求redis，但是此时redis中也没有数据，就会直接访问数据库，但是数据库里也没有数据，那么这个数据就穿透了缓存，直击数据库。但是数据库能承载的并发不如redis这么高，所以如果大量的请求同时都来访问这个不存在的数据，那么这些请求就会访问到数据库，简单的解决方案就是哪怕这个数据在数据库里不存在，我们也把这个这个数据存在redis中去（这就是为啥说会有额外的内存消耗），这样下次用户过来访问这个不存在的数据时，redis缓存中也能找到这个数据，不用去查数据库。可能造成的短期不一致是指在空对象的存活期间，我们更新了数据库，把这个空对象变成了正常的可以访问的数据，但由于空对象的TTL还没过，所以当用户来查询的时候，查询到的还是空对象，等TTL过了之后，才能访问到正确的数据，不过这种情况很少见罢了。
- 布隆过滤思路分析：布隆过滤器其实采用的是哈希思想来解决这个问题，通过一个庞大的二进制数组，根据哈希思想去判断当前这个要查询的数据是否存在，如果布隆过滤器判断存在，则放行，这个请求会去访问redis，哪怕此时redis中的数据过期了，但是数据库里一定会存在这个数据，从数据库中查询到数据之后，再将其放到redis中。如果布隆过滤器判断这个数据不存在，则直接返回。这种思想的优点在于节约内存空间，但存在误判，误判的原因在于：布隆过滤器使用的是哈希思想，只要是哈希思想，都可能存在哈希冲突。

我这里使用的是缓存空对象的方式，实现的步骤如下：

1. 先去 Redis 中查询目标数据是否已经缓存，如果能查询到就直接返回缓存的数据；
2. 如果 Redis 中不存在目标数据，则去 MySQL 数据库中查询是否存在该数据；
3. 如果数据库中也查询不到，则将一个空字符串作为响应内容存入 Redis，设置**短暂（一般5分钟以内）**的过期时间，并返回错误信息；
4. 如果数据库中存在该数据，则将数据缓存到 Redis 中，并设置过期时间。

```java
@Override
public Result queryById(Long id) {
    //先从Redis中查，这里的常量值是固定的前缀 + 店铺id
    String shopJson = stringRedisTemplate.opsForValue().get(CACHE_SHOP_KEY + id);
    //如果不为空（查询到了），则转为Shop类型直接返回
    if (StrUtil.isNotBlank(shopJson)) {
        Shop shop = JSONUtil.toBean(shopJson, Shop.class);
        return Result.ok(shop);
    }
    //如果查询到的是空字符串，则说明是我们缓存的空数据
    if (shopjson != null) {
        return Result.fail("店铺不存在！！");
    }
    //否则去数据库中查
    Shop shop = getById(id);
    //查不到，则将空字符串写入Redis
    if (shop == null) {
        //这里的常量值是2分钟
        stringRedisTemplate.opsForValue().set(CACHE_SHOP_KEY + id, "", CACHE_NULL_TTL, TimeUnit.MINUTES);
        return Result.fail("店铺不存在！！");
    }
    //查到了则转为json字符串
    String jsonStr = JSONUtil.toJsonStr(shop);
    //并存入redis，设置TTL
    stringRedisTemplate.opsForValue().set(CACHE_SHOP_KEY + id, jsonStr, CACHE_SHOP_TTL, TimeUnit.MINUTES);
    //最终把查询到的商户信息返回给前端
    return Result.ok(shop);
}
```

小总结：

- 缓存穿透产生的原因是什么？
    - 用户请求的数据在缓存中和在数据库中都不存在，不断发起这样的请求，会给数据库带来巨大压力
- 缓存穿透的解决方案有哪些？

1. 布隆过滤器：通过布隆过滤器进行缓存前置过滤，过滤掉肯定不存在的Key，减少对后端存储系统的无用查询。
2. 数据预热：在系统启动时，将热点数据提前加载到缓存中，避免后续在访问静态数据时缓存穿透。
3. 缓存空值：当缓存中不存在指定数据时，将一个空值或哨兵值写入缓存，可以缓解缓存穿透问题。
4. 降级保护：当缓存数据不存在或缓存系统出错时，通过熔断等手段返回默认值或错误提示，避免数据来源被攻击造成故障。
5. 黑白名单：加上一个限制机制，例如限制每个 IP 对同一目标数据的访问频率，如果某个 IP 访问频率异常高，就暂时将其加入黑名单，拒绝新的访问请求。

### 缓存雪崩问题及解决方案



缓存雪崩是指在同一时间段，大量缓存的key同时失效，或者Redis服务宕机，导致大量请求到达数据库，带来巨大压力
解决方案

- 给不同的Key的TTL添加随机值，让其在不同时间段分批失效
- 缓存数据永不过期：对于一些不会经常改变的数据，可以设置为永不过期，这样可以将这些数据作为一种缓存数据的备选方案，避免缓存雪崩导致数据不可用。
- 利用Redis集群提高服务的可用性（使用一个或者多个哨兵(Sentinel)实例组成的系统，对redis节点进行监控，在主节点出现故障的情况下，能将从节点中的一个升级为主节点，进行故障转义，保证系统的可用性。 ）
- 给缓存业务添加降级限流策略
- 给业务添加多级缓存（浏览器访问静态资源时，优先读取浏览器本地缓存；访问非静态资源（ajax查询数据）时，访问服务端；请求到达Nginx后，优先读取Nginx本地缓存；如果Nginx本地缓存未命中，则去直接查询Redis（不经过Tomcat）；如果Redis查询未命中，则查询Tomcat；请求进入Tomcat后，优先查询JVM进程缓存；如果JVM进程缓存未命中，则查询数据库）

### 缓存击穿问题及解决思路

- 缓存击穿也叫热点Key问题，就是一个被高并发访问并且缓存重建业务较复杂的key突然失效了，那么无数请求访问就会在瞬间给数据库带来巨大的冲击
- 举个不太恰当的例子：一件秒杀中的商品的key突然失效了，大家都在疯狂抢购，那么这个瞬间就会有无数的请求访问去直接抵达数据库，从而造成缓存击穿
- 常见的解决方案有下面几种

1. 热点数据预热
2. 布隆过滤器
3. 互斥锁方案
4. 逻辑过期方案

解决方案一：互斥锁

- 利用锁的互斥性，假设线程过来，只能一个人一个人的访问数据库，从而避免对数据库频繁访问产生过大压力，但这也会影响查询的性能，将查询的性能从并行变成了串行，我们可以采用tryLock方法+double check来解决这个问题
- 线程1在操作的时候，拿着锁把房门锁上了，那么线程2、3、4就不能都进来操作数据库，只有1操作完了，把房门打开了，此时缓存数据也重建好了，线程2、3、4直接从redis中就可以查询到数据。

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230906163338.png)
解决方案二：逻辑过期方案

- 方案分析：我们之所以会出现缓存击穿问题，主要原因是在于我们对key设置了TTL，如果我们不设置TTL，那么就不会有缓存击穿问题，但是不设置TTL，数据又会一直占用我们的内存，所以我们可以采用逻辑过期方案
- 我们之前是TTL设置在redis的value中，注意：这个过期时间并不会直接作用于Redis，而是我们后续通过逻辑去处理。假设线程1去查询缓存，然后从value中判断当前数据已经过期了，此时线程1去获得互斥锁，那么其他线程会进行阻塞，获得了锁的进程他会开启一个新线程去进行之前的重建缓存数据的逻辑，直到新开的线程完成者逻辑之后，才会释放锁，而线程1直接进行返回，假设现在线程3过来访问，由于线程2拿着锁，所以线程3无法获得锁，线程3也直接返回数据（但只能返回旧数据，牺牲了数据一致性，换取性能上的提高），只有等待线程2重建缓存数据之后，其他线程才能返回正确的数据
- 这种方案巧妙在于，异步构建缓存数据，缺点是在重建完缓存数据之前，返回的都是脏数据.

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230906163350.png)
**对比互斥锁与逻辑删除**

- 互斥锁方案：由于保证了互斥性，所以数据一致，且实现简单，只是加了一把锁而已，也没有其他的事情需要操心，所以没有额外的内存消耗，缺点在于有锁的情况，就可能死锁，所以只能串行执行，性能会受到影响
- 逻辑过期方案：线程读取过程中不需要等待，性能好，有一个额外的线程持有锁去进行重构缓存数据，但是在重构数据完成之前，其他线程只能返回脏数据，且实现起来比较麻烦

| 解决方案               | 优点                     | 缺点 |
| ---------------------- | ------------------------ | ---- |
| 互斥锁                 | 没有额外的内存消耗       |      |
| 保证一致性             |                          |      |
| 实现简单               | 线程需要等待，性能受影响 |      |
| 可能有死锁风险         |                          |      |
| 逻辑过期               |                          |      |
| 线程无需等待，性能较好 | 不保证一致性             |      |
| 有额外内存消耗         |                          |      |
| 实现复杂               |                          |      |

### 利用互斥锁解决缓存击穿问题

- 核心思路：相较于原来从缓存中查询不到数据后直接查询数据库而言，现在的方案是，进行查询之后，如果没有从缓存中查询到数据，则进行互斥锁的获取，获取互斥锁之后，判断是否获取到了锁，如果没获取到，则休眠一段时间，过一会儿再去尝试，知道获取到锁为止，才能进行查询
- 如果获取到了锁的线程，则进行查询，将查询到的数据写入Redis，再释放锁，返回数据，利用互斥锁就能保证只有一个线程去执行数据库的逻辑，防止缓存击穿

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230906163400.png)
核心思路就是利用redis的setnx方法来表示获取锁，如果redis没有这个key，则插入成功，返回1，如果已经存在这个key，则插入失败，返回0。在StringRedisTemplate中返回true/false，我们可以根据返回值来判断是否有线程成功获取到了锁。

这里简单总结一下该方法的实现步骤：

1. 先从 Redis 缓存中获取指定 id 的商店信息(以 CACHE_SHOP_KEY + id 作为 Redis 的 key)，如果命中缓存则直接返回缓存中的商店信息。
2. 如果缓存未命中，则加锁(用分布式锁，以保证并发读取时的数据安全，这里使用的是redis的setnx命令 (set if not exists)。这个命令是原子性的，即同一时间只能有一个客户端能够成功地获取锁。)。
3. 再次从缓存中获取指定 id 的商店信息，如果此时缓存命中则表示其他线程已经读取缓存，当前线程等待一段时间后再次获取缓存(这里是等待50毫秒)。
4. 如果缓存未命中，则从数据库中获取该商店的信息。
5. 如果数据库中存在该商店信息，则将该信息序列化为 json 字符串，并将 json 字符串保存至 Redis 缓存中，并设置过期时间；如果数据库中不存在该商店信息，则在 Redis 缓存中写入空值，并设置空值的过期时间。
6. 最后释放分布式锁。
7. 返回查询到的商店信息。

总的来说，该方法的实现步骤可以概括为：缓存命中则直接返回；缓存未命中则加锁，再次从缓存中获取，如果仍未命中则从数据库中获取，并将结果写入缓存中；最后释放锁并返回查询结果。

### 利用逻辑过期解决缓存击穿问题

- 需求：根据id查询商铺的业务，基于逻辑过期方式来解决缓存击穿问题
- 思路分析：当用户开始查询redis时，判断是否命中
    - 如果没有命中则直接返回空数据，不查询数据库
    - 如果命中，则将value取出，判断value中的过期时间是否满足
        - 如果没有过期，则直接返回redis中的数据
        - 如果过期，则在开启独立线程后，直接返回之前的数据，独立线程去重构数据，重构完成后再释放互斥锁

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230906163429.png)

- 封装数据：因为现在redis中存储的数据的value需要带上过期时间，此时要么你去修改原来的实体类，要么新建一个类包含原有的数据和过期时间，这里选择新建一个类。

这里我们选择新建一个实体类，包含原有数据(用万能的Object)和过期时间，这样对原有的代码没有侵入性

```java
@Data
public class RedisData<T> {
    private LocalDateTime expireTime;
    private T data;
}
```

这样就可以把商品信息存为data，还有一个单独的expireTime，具体的json代码如下：
![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230906163441.png)
正式代码如下：

```java
//这里需要声明一个线程池，因为下面我们需要新建一个现成来完成重构缓存
private static final ExecutorService CACHE_REBUILD_EXECUTOR = Executors.newFixedThreadPool(10);

@Override
public Shop queryWithLogicalExpire(Long id) {
    //1. 从redis中查询商铺缓存
    String json = stringRedisTemplate.opsForValue().get(CACHE_SHOP_KEY + id);
    //2. 如果未命中，则返回空
    if (StrUtil.isBlank(json)) {
        return null;
    }
    //3. 命中，将json反序列化为对象
    RedisData redisData = JSONUtil.toBean(json, RedisData.class);
    //3.1 将data转为Shop对象
    JSONObject shopJson = (JSONObject) redisData.getData();
    Shop shop = JSONUtil.toBean(shopJson, Shop.class);
    //3.2 获取过期时间
    LocalDateTime expireTime = redisData.getExpireTime();
    //4. 判断是否过期
    if (LocalDateTime.now().isBefore(time)) {
        //5. 未过期，直接返回商铺信息
        return shop;
    }
    //6. 过期，尝试获取互斥锁
    boolean flag = tryLock(LOCK_SHOP_KEY + id);
    //7. 获取到了锁
    if (flag) {
        //8. 开启独立线程
        CACHE_REBUILD_EXECUTOR.submit(() -> {
            try {
                this.saveShop2Redis(id, LOCK_SHOP_TTL);
            } catch (Exception e) {
                throw new RuntimeException(e);
            } finally {
                unlock(LOCK_SHOP_KEY + id);
            }
        });
        //9. 直接返回商铺信息
        return shop;
    }
    //10. 未获取到锁，直接返回商铺信息
    return shop;
}
```

## 3.你在实现优惠劵秒杀有出现哪些问题？

1. 设计优惠劵
2. 实现抢优惠劵逻辑
3. 超卖问题
4. 一人一单问题
5. 集群情况下，并发问题

### 1.设计优惠劵

当用户抢购商品时，生成的订单会保存到tb_voucher_order表中，而订单表如果使用数据库自增ID就会存在一些问题

1. id规律性太明显
2. 受单表数据量的限制

- 如果我们的订单id有太明显的规律，那么对于用户或者竞争对手，就很容易猜测出我们的一些敏感信息，例如商城一天之内能卖出多少单，这明显不合适
- 随着我们商城的规模越来越大，MySQL的单表容量不宜超过500W，数据量过大之后，我们就要进行拆库拆表，拆分表了之后，他们从逻辑上讲，是同一张表，所以他们的id不能重复，于是乎我们就要保证id的唯一性

所以我们这里使用了全局ID生成器

- 全局ID生成器是一种在分布式系统下用来生成全局唯一ID的工具，一般要满足一下特性
    - 唯一性
    - 高可用
    - 高性能
    - 递增性
    - 安全性
- 为了增加ID的安全性，我们可以不直接使用Redis自增的数值，而是拼接一些其他信息
- ID组成部分
    - 符号位：1bit，永远为0
    - 时间戳：31bit，以秒为单位，可以使用69年（2^31秒约等于69年）
    - 序列号：32bit，秒内的计数器，支持每秒传输2^32个不同ID

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230906163454.png)
这里进行了一个封装，将这个生成全局唯一ID功能封装起来

```java
@Component
public class RedisIdWorker {
    // 开始时间戳
    private static final long BEGIN_TIMESTAMP = 1640995200L;
    // 时间戳位数位移数,也就是序列号的位数
    private static final int COUNT_BITS = 32;

    private StringRedisTemplate stringRedisTemplate;

    public RedisIdWorker(StringRedisTemplate stringRedisTemplate) {
        this.stringRedisTemplate = stringRedisTemplate;
    }

    // 传入一个key前缀，在不同程序下生成的全局Id不一样
    public long nextId(String keyPrefix){
        // 1.生成时间戳
        LocalDateTime now = LocalDateTime.now();
        long nowSecond = now.toEpochSecond(ZoneOffset.UTC);
        long timestamp = nowSecond - BEGIN_TIMESTAMP;

        // 2.生成序列号
        // 2.1.获取当前日期，精确到天
        String date = now.format(DateTimeFormatter.ofPattern("yyyy:MM:dd"));
        // 2.2.自增长
        long count = stringRedisTemplate.opsForValue().increment("icr:" + keyPrefix + ":" + date);

        // 3.拼接并返回
        return timestamp << COUNT_BITS | count;
    }
}
```

### 2.实现抢优惠劵逻辑

1. 首先提交优惠券id，然后查询优惠券信息
2. 之后判断秒杀时间是否开始

- 开始了，则判断是否有剩余库存
    - 有库存，那么删减一个库存
        - 然后创建订单
    - 无库存，则返回一个错误信息
- 没开始，则返回一个错误信息

3. 创建成功，返回订单id

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230906163510.png)

```java
public Result seckillVoucher(Long voucherId) {
    LambdaQueryWrapper<SeckillVoucher> queryWrapper = new LambdaQueryWrapper<>();
    //1. 查询优惠券
    queryWrapper.eq(SeckillVoucher::getVoucherId, voucherId);
    SeckillVoucher seckillVoucher = seckillVoucherService.getOne(queryWrapper);
    //2. 判断秒杀时间是否开始
    if (LocalDateTime.now().isBefore(seckillVoucher.getBeginTime())) {
        return Result.fail("秒杀还未开始，请耐心等待");
    }
    //3. 判断秒杀时间是否结束
    if (LocalDateTime.now().isAfter(seckillVoucher.getEndTime())) {
        return Result.fail("秒杀已经结束！");
    }
    //4. 判断库存是否充足
    if (seckillVoucher.getStock() < 1) {
        return Result.fail("优惠券已被抢光了哦，下次记得手速快点");
    }
    //5. 扣减库存
    boolean success = seckillVoucherService.update()
        .setSql("stock = stock - 1")
        .eq("voucher_id",voucherId)
        .update();
    if (!success) {
        return Result.fail("库存不足");
    }
    //6. 创建订单
    VoucherOrder voucherOrder = new VoucherOrder();
    //6.1 设置订单id
    long orderId = redisIdWorker.nextId("order");
    //6.2 设置用户id
    Long id = UserHolder.getUser().getId();
    //6.3 设置代金券id
    voucherOrder.setVoucherId(voucherId);
    voucherOrder.setId(orderId);
    voucherOrder.setUserId(id);
    //7. 将订单数据保存到表中
    save(voucherOrder);
    //8. 返回订单id
    return Result.ok(orderId);
}
```

### 3.超卖问题

导致超卖问题的原因：
假设现在只剩下一张优惠券，线程1过来查询库存，判断库存数大于1，但还没来得及去扣减库存，此时库线程2也过来查询库存，发现库存数也大于1，那么这两个线程都会进行扣减库存操作，最终相当于是多个线程都进行了扣减库存，那么此时就会出现超卖问题。
超卖问题是典型的多线程安全问题，针对这一问题的常见解决方案就是加锁：而对于加锁，我们通常有两种解决方案

1. 悲观锁

- 悲观锁认为线程安全问题一定会发生，因此在操作数据之前先获取锁，确保线程串行执行
- 例如Synchronized、Lock等，都是悲观锁

2. 乐观锁

- 乐观锁认为线程安全问题不一定会发生，因此不加锁，只是在更新数据的时候再去判断有没有其他线程对数据进行了修改
    - 如果没有修改，则认为自己是安全的，自己才可以更新数据
    - 如果已经被其他线程修改，则说明发生了安全问题，此时可以重试或者异常

悲观锁：悲观锁可以实现对于数据的串行化执行，比如syn，和lock都是悲观锁的代表，同时，悲观锁中又可以再细分为公平锁，非公平锁，可重入锁，等等
乐观锁：乐观锁会有一个版本号，每次操作数据会对版本号+1，再提交回数据时，会去校验是否比之前的版本大1 ，如果大1 ，则进行操作成功，这套机制的核心逻辑在于，**如果在操作过程中，版本号只比原来大1 ，那么就意味着操作过程中没有人对他进行过修改，他的操作就是安全的，如果不大1，则数据被修改过**，当然乐观锁还有一些变种的处理方式比如cas。
这里并不需要真的来指定一下版本号，完全可以使用stock来充当版本号，在扣减库存时，比较查询到的优惠券库存和实际数据库中优惠券库存是否相同。
在扣减库存的语句里添加一段判断语句，eq("stock",seckillVoucher.getStock())

```java
//4. 判断库存是否充足
    if (seckillVoucher.getStock() < 1) {
        return Result.fail("优惠券已被抢光了哦，下次记得手速快点");
    }
    //5. 扣减库存
    boolean success = seckillVoucherService.update()
            .setSql("stock = stock - 1")
            .eq("voucher_id", voucherId)
+           .eq("stock",seckillVoucher.getStock())
            .update();
    if (!success) {
        return Result.fail("库存不足");
    }
```

不过这样也会出现一个问题：
以上逻辑的核心含义是：只要我扣减库存时的库存和之前我查询到的库存是一样的，就意味着没有人在中间修改过库存，那么此时就是安全的，但是以上这种方式通过测试发现会有很多失败的情况，**失败的原因在于：**在使用乐观锁过程中假设100个线程同时都拿到了100的库存，然后大家一起去进行扣减，但是100个人中只有1个人能扣减成功，其他的人在处理时，他们在扣减时，库存已经被修改过了，所以此时其他线程都会失败
所以继续完善代码：
**在这种场景，我们可以只判断是否有剩余优惠券，即只要数据库中的库存大于0，都能顺利完成扣减库存操作**
去掉原来的判断，改成大于gt("stock", 0)

```java
//5. 扣减库存
    boolean success = seckillVoucherService.update()
            .setSql("stock = stock - 1")
            .eq("voucher_id", voucherId)
+           .gt("stock", 0)
            .update();
    if (!success) {
        return Result.fail("库存不足");
    }
```

### 4.一人一单问题

- 需求：修改秒杀业务，要求同一个优惠券，一个用户只能抢一张
- 具体操作逻辑如下：我们在判断库存是否充足之后，根据我们保存的订单数据，判断用户订单是否已存在
    - 如果已存在，则不能下单，返回错误信息
    - 如果不存在，则继续下单，获取优惠券

在扣减库存前，加上判断该用户是否抢过优惠劵

```java
// 一人一单逻辑
Long userId = UserHolder.getUser().getId();
int count = query().eq("voucherId", voucherId).eq("userId", userId).count();
if (count > 0){
    return Result.fail("你已经抢过优惠券了哦");
}
```

- 存在问题：还是和之前一样，如果这个用户故意开多线程抢优惠券，那么在判断库存充足之后，执行一人一单逻辑之前，在这个区间如果进来了多个线程，还是可以抢多张优惠券的，那我们这里使用悲观锁来解决这个问题
- 初步代码，我们把一人一单逻辑之后的代码都提取到一个createVoucherOrder方法中，然后给这个方法加锁
- 不管哪一个线程（例如线程A），运行到这个方法时，都要检查有没有其它线程B（或者C、 D等）正在用这个方法(或者该类的其他同步方法)，有的话要等正在使用synchronized方法的线程B（或者C 、D）运行完这个方法后再运行此线程A，没有的话，锁定调用者，然后直接运行。

```java
private Result createVoucherOrder(Long voucherId) {
    // 一人一单逻辑
    Long userId = UserHolder.getUser().getId();
    int count = query().eq("voucherId", voucherId).eq("userId", userId).count();
    if (count > 0) {
        return Result.fail("你已经抢过优惠券了哦");
    }
    // 略。。。。。
}
```

但是这样加锁，锁的细粒度太粗了，在使用锁的过程中，控制锁粒度是一个非常重要的事情，因为如果锁的粒度太大，会导致每个线程进来都会被锁住，现在的情况就是所有用户都公用这一把锁，串行执行，效率很低，我们现在要完成的业务是一人一单，所以这个锁，应该只加在单个用户上，用户标识可以用userId

```java
@Transactional
public Result createVoucherOrder(Long voucherId) {
    // 一人一单逻辑
    Long userId = UserHolder.getUser().getId();
    synchronized (userId.toString().intern()) {
        int count = query().eq("voucherId", voucherId).eq("userId", userId).count();
        if (count > 0) {
            return Result.fail("你已经抢过优惠券了哦");
        }
        // 略。。。。
    }
    //执行到这里，锁已经被释放了，但是可能当前事务还未提交，如果此时有线程进来，不能确保事务不出问题
}
```

由于toString的源码是new String，所以如果我们只用userId.toString()拿到的也不是同一个用户，需要使用intern()，如果字符串常量池中已经包含了一个等于这个string对象的字符串（由equals（object）方法确定），那么将返回池中的字符串。否则，将此String对象添加到池中，并返回对此String对象的引用。

```java
public static String toString(long i) {
    if (i == Long.MIN_VALUE)
        return "-9223372036854775808";
    int size = (i < 0) ? stringSize(-i) + 1 : stringSize(i);
    char[] buf = new char[size];
    getChars(i, size, buf);
    return new String(buf, true);
}
```

但是以上代码还是存在问题，问题的原因在于当前方法被Spring的事务控制，如果你在内部加锁，可能会导致当前方法事务还没有提交，但是锁已经释放了，这样也会导致问题，所以我们选择将当前方法整体包裹起来，确保事务不会出现问题

```java
@Override
public Result seckillVoucher(Long voucherId) {
    LambdaQueryWrapper<SeckillVoucher> queryWrapper = new LambdaQueryWrapper<>();
    //1. 查询优惠券
    queryWrapper.eq(SeckillVoucher::getVoucherId, voucherId);
    SeckillVoucher seckillVoucher = seckillVoucherService.getOne(queryWrapper);
    //2. 判断秒杀时间是否开始
    if (LocalDateTime.now().isBefore(seckillVoucher.getBeginTime())) {
        return Result.fail("秒杀还未开始，请耐心等待");
    }
    //3. 判断秒杀时间是否结束
    if (LocalDateTime.now().isAfter(seckillVoucher.getEndTime())) {
        return Result.fail("秒杀已经结束！");
    }
    //4. 判断库存是否充足
    if (seckillVoucher.getStock() < 1) {
        return Result.fail("优惠券已被抢光了哦，下次记得手速快点");
    }
    Long userId = UserHolder.getUser().getId();
    synchronized (userId.toString().intern()) {
        return createVoucherOrder(voucherId);
    }
}
```

但是以上做法依然有问题，因为你调用的方法，其实是this.的方式调用的，事务想要生效，还得利用代理来生效，所以这个地方，我们需要获得原始的事务对象， 来操作事务，这里可以使用AopContext.currentProxy()来获取当前对象的代理对象，然后再用代理对象调用方法，记得要去IVoucherOrderService中创建createVoucherOrder方法

```java
Long userId = UserHolder.getUser().getId();
synchronized (userId.toString().intern()) {
    IVoucherOrderService proxy = (IVoucherOrderService) AopContext.currentProxy();
    return proxy.createVoucherOrder(voucherId);
}
```

但是该方法会用到一个依赖，我们需要导入一下

```java
<dependency>
    <groupId>org.aspectj</groupId>
    <artifactId>aspectjweaver</artifactId>
</dependency>
```

同时在启动类上加上@EnableAspectJAutoProxy(exposeProxy = true)注解

```java
@MapperScan("com.hmdp.mapper")
@SpringBootApplication
@EnableAspectJAutoProxy(exposeProxy = true)
public class HmDianPingApplication {
    public static void main(String[] args) {
        SpringApplication.run(HmDianPingApplication.class, args);
    }

}
```

## 4.你是怎么集群环境下的并发问题？

原因分析：由于我们部署了多个Tomcat，每个Tomcat都有一个属于自己的jvm，那么假设在服务器A的Tomcat内部，有两个线程，即线程1和线程2，这两个线程使用的是同一份代码，那么他们的锁对象是同一个，是可以实现互斥的。但是如果在Tomcat的内部，又有两个线程，但是他们的锁对象虽然写的和服务器A一样，但是锁对象却不是同一个，所以线程3和线程4可以实现互斥，但是却无法和线程1和线程2互斥。
![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230906163526.png)
这就是集群环境下，syn锁失效的原因，在这种情况下，我们需要使用分布式锁来解决这个问题，让锁不存在于每个jvm的内部，而是让所有jvm公用外部的一把锁（Redis)

### 1.分布式锁的实现

- 分布式锁：满足分布式系统或集群模式下多线程课件并且可以互斥的锁
- 分布式锁的核心思想就是让大家共用同一把锁，那么我们就能锁住线程，不让线程进行，让程序串行执行，这就是分布式锁的核心思路

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230906163545.png)

- 那么分布式锁应该满足一些什么条件呢？
    1. 可见性：多个线程都能看到相同的结果。注意：这里说的可见性并不是并发编程中指的内存可见性，只是说多个进程之间都能感知到变化的意思
    2. 互斥：互斥是分布式锁的最基本条件，使得程序串行执行
    3. 高可用：程序不已崩溃，时时刻刻都保证较高的可用性
    4. 高性能：由于加锁本身就让性能降低，所以对于分布式锁需要他较高的加锁性能和释放锁性能
    5. 安全性：安全也是程序中必不可少的一环
- 常见的分布式锁有三种
    1. MySQL：MySQL本身就带有锁机制，但是由于MySQL的性能一般，所以采用分布式锁的情况下，使用MySQL作为分布式锁比较少见
    2. Redis：Redis作为分布式锁是非常常见的一种使用方式，现在企业级开发中基本都是用Redis或者Zookeeper作为分布式锁，利用SETNX这个方法，如果插入Key成功，则表示获得到了锁，如果有人插入成功，那么其他人就回插入失败，无法获取到锁，利用这套逻辑完成互斥，从而实现分布式锁
    3. Zookeeper：Zookeeper也是企业级开发中较好的一种实现分布式锁的方案，但本文是学Redis的，所以这里就不过多阐述了

|        | MySQL                     | Redis                    | Zookeeper                        |
| ------ | ------------------------- | ------------------------ | -------------------------------- |
| 互斥   | 利用mysql本身的互斥锁机制 | 利用setnx这样的互斥命令  | 利用节点的唯一性和有序性实现互斥 |
| 高可用 | 好                        | 好                       | 好                               |
| 高性能 | 一般                      | 好                       | 一般                             |
| 安全性 | 断开连接，自动释放锁      | 利用锁超时时间，到期释放 | 临时节点，断开连接自动释放       |

我这里使用的redis的setnx命令
获取锁

- 互斥：确保只能有一个线程获取锁
- 非阻塞：尝试一次，成功返回true，失败返回false

```java
SET lock thread01 NX EX 10
```

释放锁

- 手动释放
- 超时释放：获取锁的时候添加一个超时时间

```java
DEL lock
```

核心思路

- 我们利用redis的SETNX方法，当有多个线程进入时，我们就利用该方法来获取锁。第一个线程进入时，redis 中就有这个key了，返回了1，如果结果是1，则表示他抢到了锁，那么他去执行业务，然后再删除锁，退出锁逻辑，没有抢到锁（返回了0）的线程，等待一定时间之后重试

### 2.Redis分布式锁误删情况

逻辑说明

- 持有锁的线程1在锁的内部出现了阻塞，导致他的锁TTL到期，自动释放
- 此时线程2也来尝试获取锁，由于线程1已经释放了锁，所以线程2可以拿到
- 但是现在线程1阻塞完了，继续往下执行，要开始释放锁了
- 那么此时就会将属于线程2的锁释放，这就是误删别人锁的情况

解决方案

- 解决方案就是在每个线程释放锁的时候，都判断一下这个锁是不是自己的，如果不属于自己，则不进行删除操作。
- 假设还是上面的情况，线程1阻塞，锁自动释放，线程2进入到锁的内部执行逻辑，此时线程1阻塞完了，继续往下执行，开始删除锁，但是线程1发现这把锁不是自己的，所以不进行删除锁的逻辑，当线程2执行到删除锁的逻辑时，如果TTL还未到期，则判断当前这把锁是自己的，于是删除这把锁

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230906163601.png)
**解决Redis分布式锁误删问题**

- 需求：修改之前的分布式锁实现
- 满足：在获取锁的时候存入线程标识（**用UUID标识，在一个JVM中，ThreadId一般不会重复，但是我们现在是集群模式，有多个JVM，多个JVM之间可能会出现ThreadId重复的情况**），在释放锁的时候先获取锁的线程标识，判断是否与当前线程标识一致
    - 如果一致则释放锁
    - 如果不一致则不释放锁
- 核心逻辑：在存入锁的时候，放入自己的线程标识，在删除锁的时候，判断当前这把锁是不是自己存入的
    - 如果是，则进行删除
    - 如果不是，则不进行删除

### 3. 分布式锁的原子性问题

更为极端的误删逻辑说明

- 假设线程1已经获取了锁，在判断标识一致之后，准备释放锁的时候，又出现了阻塞（例如JVM垃圾回收机制）
- 于是锁的TTL到期了，自动释放了
- 那么现在线程2趁虚而入，拿到了一把锁
- 但是线程1的逻辑还没执行完，那么线程1就会执行删除锁的逻辑
- 但是在阻塞前线程1已经判断了标识一致，所以现在线程1把线程2的锁给删了
- 那么就相当于判断标识那行代码没有起到作用
- 这就是删锁时的原子性问题
- 因为线程1的拿锁，判断标识，删锁，不是原子操作，所以我们要防止刚刚的情况

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230906163611.png)

- Redis提供了Lua脚本功能，在一个脚本中编写多条Redis命令，确保多条命令执行时的原子性。
- Lua是一种编程语言，它的基本语法可以上菜鸟教程看看，链接：[https://www.runoob.com/lua/lua-tutorial.html](https://www.runoob.com/lua/lua-tutorial.html)
- 这里重点介绍Redis提供的调用函数，我们可以使用Lua去操作Redis，而且还能保证它的原子性，这样就可以实现拿锁，判断标识，删锁是一个原子性动作了

**解决方案，使用redis提供的lua脚本实现原子性**

- Redis提供了Lua脚本功能，在一个脚本中编写多条Redis命令，确保多条命令执行时的原子性。
- Lua是一种编程语言，它的基本语法可以上菜鸟教程看看，链接：[https://www.runoob.com/lua/lua-tutorial.html](https://www.runoob.com/lua/lua-tutorial.html)
- 这里重点介绍Redis提供的调用函数，我们可以使用Lua去操作Redis，而且还能保证它的原子性，这样就可以实现拿锁，判断标识，删锁是一个原子性动作了

原逻辑

```java
@Override
public void unlock() {
    // 获取当前线程的标识
    String threadId = ID_PREFIX + Thread.currentThread().getId();
    // 获取锁中的标识
    String id = stringRedisTemplate.opsForValue().get(KEY_PREFIX + name);
    // 判断标识是否一致
    if (threadId.equals(id)) {
        // 释放锁
        stringRedisTemplate.delete(KEY_PREFIX + name);
    }
}
```

改为lua脚本

```lua
-- 这里的KEYS[1]就是传入锁的key
-- 这里的ARGV[1]就是线程标识
-- 比较锁中的线程标识与线程标识是否一致
if (redis.call('get', KEYS[1]) == ARGV[1]) then
  -- 一致则释放锁
  return redis.call('del', KEYS[1])
end
return 0
```

**利用Java代码调用Lua脚本改造分布式锁**

- 在RedisTemplate中，可以利用execute方法去执行lua脚本

```java
public <T> T execute(RedisScript<T> script, List<K> keys, Object... args) {
    return this.scriptExecutor.execute(script, keys, args);
}
```

- 对应的Java代码如下

```java
private static final DefaultRedisScript<Long> UNLOCK_SCRIPT;

static {
    UNLOCK_SCRIPT = new DefaultRedisScript();
    UNLOCK_SCRIPT.setLocation(new ClassPathResource("unlock.lua"));
    UNLOCK_SCRIPT.setResultType(Long.class);
}

@Override
public void unlock() {
    stringRedisTemplate.execute(UNLOCK_SCRIPT,
            Collections.singletonList(KEY_PREFIX + name),
            ID_PREFIX + Thread.currentThread().getId());
}
```

### 4.基于SETNX实现的分布式锁存在的问题

**具体笔记：**[https://cyborg2077.github.io/2022/10/22/RedisPractice/#%E5%88%86%E5%B8%83%E5%BC%8F%E9%94%81-Redisson](https://cyborg2077.github.io/2022/10/22/RedisPractice/#%E5%88%86%E5%B8%83%E5%BC%8F%E9%94%81-Redisson)
**具体视频：**
[https://www.bilibili.com/video/BV1cr4y1671t?p=64&vd_source=1491518ed1752c63645a181ab2704402](https://www.bilibili.com/video/BV1cr4y1671t?p=64&vd_source=1491518ed1752c63645a181ab2704402)

1. 重入问题

- 重入问题是指获取锁的线程，可以再次进入到相同的锁的代码块中，可重入锁的意义在于防止死锁，例如在HashTable这样的代码中，它的方法都是使用synchronized修饰的，加入它在一个方法内调用另一个方法，如果此时是不可重入的，那就死锁了。所以可重入锁的主要意义是防止死锁，我们的synchronized和Lock锁都是可重入的

2. 不可重试

- 我们编写的分布式锁只能尝试一次，失败了就返回false，没有重试机制。但合理的情况应该是：当线程获取锁失败后，他应该能再次尝试获取锁

3. 超时释放

- 我们在加锁的时候增加了TTL，这样我们可以防止死锁，但是如果卡顿(阻塞)时间太长，也会导致锁的释放。虽然我们采用Lua脚本来防止删锁的时候，误删别人的锁，但现在的新问题是没锁住，也有安全隐患

4. 主从一致性

- 如果Redis提供了主从集群，那么当我们向集群写数据时，主机需要异步的将数据同步给从机，万一在同步之前，主机宕机了(主从同步存在延迟，虽然时间很短，但还是发生了)，那么又会出现死锁问题

那么什么是Redisson呢

- Redisson是一个在Redis的基础上实现的Java驻内存数据网格(In-Memory Data Grid)。它不仅提供了一系列的分布式Java常用对象，还提供了许多分布式服务，其中就包含了各种分布式锁的实现

Redis提供了分布式锁的多种多样功能

1. 可重入锁(Reentrant Lock)
2. 公平锁(Fair Lock)
3. 联锁(MultiLock)
4. 红锁(RedLock)
5. 读写锁(ReadWriteLock)
6. 信号量(Semaphore)
7. 可过期性信号量(PermitExpirableSemaphore)
8. 闭锁(CountDownLatch)

**Redisson可重入锁原理**

- 在Lock锁中，他是借助于等曾的一个voaltile的一个state变量来记录重入的状态的
    - 如果当前没有人持有这把锁，那么state = 0
    - 如果有人持有这把锁，那么state = 1
        - 如果持有者把锁的人再次持有这把锁，那么state会+1
    - 如果对于synchronize而言，他在c语言代码中会有一个count
    - 原理与state类似，也是重入一次就+1，释放一次就-1，直至减到0，表示这把锁没有被人持有
- 在redisson中，我们也支持可重入锁
    - 在分布式锁中，它采用hash结构来存储锁，其中外层key表示这把锁是否存在，内层key则记录当前这把锁被哪个线程持有
- method1在方法内部调用method2，method1和method2出于同一个线程，那么method1已经拿到一把锁了，想进入method2中拿另外一把锁，必然是拿不到的，于是就出现了死锁

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230906163626.png)
这里有个WatchDog，看门狗功能需要注意：
Redisson的WatchDog是一个用于监听分布式场景下数据变化的组件。它会监控一个或多个Redis键的变化，并在发生变化时触发回调函数。WatchDog可以用来处理一些场景，比如数据变化后需要进行特定的业务处理。
WatchDog可以监控多个Redis键，支持多个回调函数，支持异步回调和同步回调，支持对监控频率的控制，可以根据不同的情况下调整监控频率，以达到最优化的性能。同时，加入了Redisson的分布式锁功能，能够有效处理分布式场景下的并发更新问题。
**Redisson锁的MutiLock原理**

- 为了提高Redis的可用性，我们会搭建集群或者主从，现在以主从为例
- 此时我们去写命令，写在主机上，主机会将数据同步给从机，但是假设主机还没来得及把数据写入到从机去的时候，主机宕机了
- 哨兵会发现主机宕机了，于是选举一个slave(从机)变成master(主机)，而此时新的master(主机)上并没有锁的信息，那么其他线程就可以获取锁，又会引发安全问题
- 为了解决这个问题。Redisson提出来了MutiLock锁，使用这把锁的话，那我们就不用主从了，每个节点的地位都是一样的，都可以当做是主机，那我们就需要将加锁的逻辑写入到每一个主从节点上，只有所有的服务器都写入成功，此时才是加锁成功，假设现在某个节点挂了，那么他去获取锁的时候，只要有一个节点拿不到，都不能算是加锁成功，就保证了加锁的可靠性

**小结**

1. 不可重入Redis分布式锁
    - 原理：利用SETNX的互斥性；利用EX避免死锁；释放锁时判断线程标识
    - 缺陷：不可重入、无法重试、锁超时失效
2. 可重入Redis分布式锁
    - 原理：利用Hash结构，记录线程标识与重入次数；利用WatchDog延续锁时间；利用信号量控制锁重试等待
    - 缺陷：Redis宕机引起锁失效问题
3. Redisson的multiLock
    - 原理：多个独立的Redis节点，必须在所有节点都获取重入锁，才算获取锁成功

## 5.你是怎么实现秒杀业务的？有出现什么问题吗？怎么解决的？

### 1.优化秒杀异步下单的实现

- 当用户发起请求，此时会先请求Nginx，Nginx反向代理到Tomcat，而Tomcat中的程序，会进行串行操作，分为如下几个步骤
    1. 查询优惠券
    2. 判断秒杀库存是否足够
    3. 查询订单
    4. 校验是否一人一单
    5. 扣减库存
    6. 创建订单
- 在这六个步骤中，有很多操作都是要去操作数据库的，而且还是一个线程串行执行，这样就会导致我们的程序执行很慢，所以我们需要异步程序执行，那么如何加速呢？
- 优化方案：我们将耗时较短的逻辑判断放到Redis中，例如：库存是否充足，是否一人一单这样的操作，只要满足这两条操作，那我们是一定可以下单成功的，不用等数据真的写进数据库，我们直接告诉用户下单成功就好了。然后后台再开一个线程，后台线程再去慢慢执行队列里的消息，这样我们就能很快的完成下单业务。

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230906163636.png)
这里还存在两个难点

1. 我们怎么在Redis中快速校验是否一人一单，还有库存判断
2. 我们校验一人一单和将下单数据写入数据库，这是两个线程，我们怎么知道下单是否完成。

- 我们需要将一些信息返回给前端，同时也将这些信息丢到异步queue中去，后续操作中，可以通过这个id来查询下单逻辑是否完成

我们现在来看整体思路：当用户下单之后，判断库存是否充足，只需要取Redis中根据key找对应的value是否大于0即可，如果不充足，则直接结束。如果充足，则在Redis中判断用户是否可以下单，如果set集合中没有该用户的下单数据，则可以下单，并将userId和优惠券存入到Redis中，并且返回0，整个过程需要保证是原子性的，所以我们要用Lua来操作，同时由于我们需要在Redis中查询优惠券信息，所以在我们新增秒杀优惠券的同时，需要将优惠券信息保存到Redis中
完成以上逻辑判断时，我们只需要判断当前Redis中的返回值是否为0，如果是0，则表示可以下单，将信息保存到queue中去，然后返回，开一个线程来异步下单，其阿奴单可以通过返回订单的id来判断是否下单成功
![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230906163645.png)
步骤：

1. 新增秒杀优惠券的同时，将优惠券信息保存到Redis中
2. 基于Lua脚本，判断秒杀库存、一人一单，决定用户是否秒杀成功

### 2.基于阻塞队列实现秒杀优化

修改下单的操作，我们在下单时，是通过Lua表达式去原子执行判断逻辑，如果判断结果不为0，返回错误信息，如果判断结果为0，则将下单的逻辑保存到队列中去，然后异步执行
需求

1. 如果秒杀成功，则将优惠券id和用户id封装后存入阻塞队列
2. 开启线程任务，不断从阻塞队列中获取信息，实现异步下单功能

```java
@Service
@Slf4j
public class VoucherOrderServiceImpl extends ServiceImpl<VoucherOrderMapper, VoucherOrder> implements IVoucherOrderService {

    @Autowired
    private ISeckillVoucherService seckillVoucherService;

    @Autowired
    private RedisIdWorker redisIdWorker;

    @Resource
    private StringRedisTemplate stringRedisTemplate;

    @Resource
    private RedissonClient redissonClient;

    private IVoucherOrderService proxy;


    private static final DefaultRedisScript<Long> SECKILL_SCRIPT;

    static {
        SECKILL_SCRIPT = new DefaultRedisScript();
        SECKILL_SCRIPT.setLocation(new ClassPathResource("seckill.lua"));
        SECKILL_SCRIPT.setResultType(Long.class);
    }

    private static final ExecutorService SECKILL_ORDER_EXECUTOR = Executors.newSingleThreadExecutor();

    @PostConstruct
    private void init() {
        SECKILL_ORDER_EXECUTOR.submit(new VoucherOrderHandler());
    }

    private final BlockingQueue<VoucherOrder> orderTasks = new ArrayBlockingQueue<>(1024 * 1024);

    private void handleVoucherOrder(VoucherOrder voucherOrder) {
        //1. 获取用户
        Long userId = voucherOrder.getUserId();
        //2. 创建锁对象，作为兜底方案
        RLock redisLock = redissonClient.getLock("order:" + userId);
        //3. 获取锁
        boolean isLock = redisLock.tryLock();
        //4. 判断是否获取锁成功(理论上必成功，redis已经帮我们判断了)
        if (!isLock) {
            log.error("不允许重复下单!");
            return;
        }
        try {
            //5. 使用代理对象，由于这里是另外一个线程，
            proxy.createVoucherOrder(voucherOrder);
        } finally {
            redisLock.unlock();
        }
    }

    private class VoucherOrderHandler implements Runnable {
        @Override
        public void run() {
            while (true) {
                try {
                    //1. 获取队列中的订单信息
                    VoucherOrder voucherOrder = orderTasks.take();
                    //2. 创建订单
                    handleVoucherOrder(voucherOrder);
                } catch (Exception e) {
                    log.error("订单处理异常", e);
                }
            }
        }
    }

    @Override
    public Result seckillVoucher(Long voucherId) {
        Long result = stringRedisTemplate.execute(SECKILL_SCRIPT,
                Collections.emptyList(), voucherId.toString(),
                UserHolder.getUser().getId().toString());
        if (result.intValue() != 0) {
            return Result.fail(result.intValue() == 1 ? "库存不足" : "不能重复下单");
        }
        long orderId = redisIdWorker.nextId("order");
        //封装到voucherOrder中
        VoucherOrder voucherOrder = new VoucherOrder();
        voucherOrder.setVoucherId(voucherId);
        voucherOrder.setUserId(UserHolder.getUser().getId());
        voucherOrder.setId(orderId);
        //加入到阻塞队列
        orderTasks.add(voucherOrder);
        //主线程获取代理对象
        proxy = (IVoucherOrderService) AopContext.currentProxy();
        return Result.ok(orderId);
    }


    @Transactional
    public void createVoucherOrder(VoucherOrder voucherOrder) {
        // 一人一单逻辑
        Long userId = voucherOrder.getUserId();
        Long voucherId = voucherOrder.getVoucherId();
        synchronized (userId.toString().intern()) {
            int count = query().eq("voucher_id", voucherId).eq("user_id", userId).count();
            if (count > 0) {
                log.error("你已经抢过优惠券了哦");
                return;
            }
            //5. 扣减库存
            boolean success = seckillVoucherService.update()
                    .setSql("stock = stock - 1")
                    .eq("voucher_id", voucherId)
                    .gt("stock", 0)
                    .update();
            if (!success) {
                log.error("库存不足");
            }
            //7. 将订单数据保存到表中
            save(voucherOrder);
        }
    }
}
```

在优惠券秒杀系统中，当用户发出秒杀请求后，系统会将订单信息封装到一个VoucherOrder对象中，并放入阻塞队列orderTasks中。
阻塞队列是指一个内部长度固定的队列，在队列满时，新加入的元素被阻塞，直到队列中有元素被取出才能加入。这种队列通常用于并发编程中，用于保持线程安全的通信。
在这段代码中，使用BlockingQueue实现阻塞队列，并定义它的长度为1024 * 1024，即最多可以同时处理1024 * 1024个订单请求。当订单请求被加入阻塞队列中后，另外一个线程会不断地从中取出请求，并进行处理。这样，订单请求的处理和商品库存的扣减是在不同的线程中进行的，避免了时间冲突的问题，提高了并发处理能力。
具体来说，在阻塞队列中，当有新的订单请求被加入时，处理该请求的线程会从队列中取出订单信息，并将它传递给handleVoucherOrder()方法进行处理。该方法会先获取用户id，然后创建一个锁对象，锁定指定用户的订单。这是为了防止同一个用户多次下单。获得锁成功后，该方法会调用代理对象的createVoucherOrder()方法，在其中处理扣减库存和保存订单等操作。当订单处理完成后，线程将释放锁，并尝试去取下一个订单进行处理。
可以看出，阻塞队列的作用是将秒杀请求和订单处理隔离开来，保证了订单的正常处理，也增强了系统的并发运作能力。
**小结：**

- 秒杀业务的优化思路是什么？
    1. 先利用Redis完成库存容量、一人一单的判断，完成抢单业务
    2. 再将下单业务放入阻塞队列，利用独立线程异步下单
- 基于阻塞队列的异步秒杀存在哪些问题？
    1. 内存限制问题：
        - 我们现在使用的是JDK里的阻塞队列，它使用的是JVM的内存，如果在高并发的条件下，无数的订单都会放在阻塞队列里，可能就会造成内存溢出，所以我们在创建阻塞队列时，设置了一个长度，但是如果真的存满了，再有新的订单来往里塞，那就塞不进去了，存在内存限制问题
    2. 数据安全问题：
        - 经典服务器宕机了，用户明明下单了，但是数据库里没看到

### 3.使用redis的消息队列完成异步秒杀

## 6.认识消息队列

- 什么是消息队列？字面意思就是存放消息的队列，最简单的消息队列模型包括3个角色
    1. 消息队列：存储和管理消息，也被称为消息代理（Message Broker）
    2. 生产者：发送消息到消息队列
    3. 消费者：从消息队列获取消息并处理消息
- 使用队列的好处在于解耦：举个例子，快递员(生产者)吧快递放到驿站/快递柜里去(Message Queue)去，我们(消费者)从快递柜/驿站去拿快递，这就是一个异步，如果耦合，那么快递员必须亲自上楼把快递递到你手里，服务当然好，但是万一我不在家，快递员就得一直等我，浪费了快递员的时间。所以解耦还是非常有必要的
- 那么在这种场景下我们的秒杀就变成了：在我们下单之后，利用Redis去进行校验下单的结果，然后在通过队列把消息发送出去，然后在启动一个线程去拿到这个消息，完成解耦，同时也加快我们的响应速度
- 这里我们可以直接使用一些现成的(MQ)消息队列，如kafka，rabbitmq等，但是如果没有安装MQ，我们也可以使用Redis提供的MQ方案。

**redis实现消息队列有三种方案：**

|                                        | List               | PubSub           | Stream |
| -------------------------------------- | ------------------ | ---------------- | ------ |
| 消息持久化                             | 支持               | 不支持           | 支持   |
| 阻塞读取                               | 支持               | 支持             | 支持   |
| 消息堆积处理                           | 受限于内存空间，   |                  |        |
| 可以利用多消费者加快处理               | 受限于消费者缓冲区 | 受限于队列长度， |        |
| 可以利用消费者组提高消费速度，减少堆积 |                    |                  |        |
| 消息确认机制                           | 不支持             | 不支持           | 支持   |
| 消息回溯                               | 不支持             | 不支持           | 支持   |

Stream消息队列实现异步秒杀下单
步骤：

1. 创建一个Stream类型的消息队列，名为stream.orders
2. 修改之前的秒杀下单Lua脚本，在认定有抢购资格后，直接向stream.orders中添加消息，内容包含voucherId、userId、orderId
3. 项目启动时，开启一个线程任务，尝试获取stream.orders中的消息，完成下单

具体实现步骤如下：

1. 使用RedisTemplate的opsForStream方法从队列中读取一条消息。
2. 判断读取的消息是否为空，若为空，则继续循环等待下一条消息。
3. 将读取的消息转换为VoucherOrder对象。
4. 执行下单逻辑，并将数据保存到数据库中。
5. 手动ACK，确认当前处理的消息已经被处理完成。

## 7.你是怎么实现发送笔记和点赞的功能？

### 1.发布笔记

设置数据库的时候设置了用户id，但是发布笔记的时候，需要用户姓名，图标等信息，这个时候在实体类就需要加上几个信息，用@TableField(exist = false)注解，标识数据库没有的字段

```java
@PostMapping
public Result saveBlog(@RequestBody Blog blog) {
    // 获取登录用户
    UserDTO user = UserHolder.getUser();
    blog.setUserId(user.getId());
    // 保存探店博文
    blogService.save(blog);
    // 返回id
    return Result.ok(blog.getId());
}
```

还有一个上传图片，也是发送一个请求，我这里只是放在本地，实际开发中图片一般会放在nginx上或者是云存储上。

### 2.查看笔记

在Service类中创建对应方法之后，在Impl类中实现，我们查看用户探店笔记的时候，需要额外设置用户名和其头像，由于设置用户信息这个操作比较通用，所以这里封装成了一个方法。

```java
@Override
public Result queryById(Integer id) {
    Blog blog = getById(id);
    if (blog == null) {
        return Result.fail("笔记不存在或已被删除");
    }
    queryBlogUser(blog);
    return Result.ok(blog);
}

private void queryBlogUser(Blog blog) {
    Long userId = blog.getUserId();
    User user = userService.getById(userId);
    blog.setName(user.getNickName());
    blog.setIcon(user.getIcon());
}
```

### 3.点赞功能

- 需求
    1. 同一个用户只能对同一篇笔记点赞一次，再次点击则取消点赞
    2. 如果当前用户已经点赞，则点赞按钮高亮显示（前端已实现，判断字段Blog类的isLike属性）
- 实现步骤
    1. 修改点赞功能，利用Redis中的set集合来判断是否点赞过，未点赞则点赞数+1，已点赞则点赞数-1
    2. 修改根据id查询的业务，判断当前登录用户是否点赞过，赋值给isLike字段
    3. 修改分页查询Blog业务，判断当前登录用户是否点赞过，赋值给isLike字段

点赞时会将当前登录用户的 ID 存入对应博客的 set 集合中，这个 set 集合中的元素即为点赞该博客的所有用户 ID。因此，在存入 set 集合中时，key 的格式为 "blog:liked:id"，其中 id 为博客的 ID；value 的值为点赞该博客的用户 ID。这样，在查询博客时，可以使用 RedisTemplate 从该 set 集合中查找当前登录用户的 ID 是否存在，以判断用户是否点赞了该博客。

### 4.点赞排行榜

- 当我们点击探店笔记详情页面时，应该按点赞顺序展示点赞用户，比如显示最早点赞的TOP5，形成点赞排行榜，就跟QQ空间发的说说一样，可以看到有哪些人点了赞
- 之前的点赞是放到Set集合中，但是Set集合又不能排序，所以这个时候，我们就可以改用SortedSet(Zset)
- 那我们这里顺便就来对比一下这些集合的区别

|          | List                 | Set          | SortedSet       |
| -------- | -------------------- | ------------ | --------------- |
| 排序方式 | 按添加顺序排序       | 无法排序     | 根据score值排序 |
| 唯一性   | 不唯一               | 唯一         | 唯一            |
| 查找方式 | 按索引查找或首尾查找 | 根据元素查找 | 根据元素查找    |

```java
@Override
public Result likeBlog(Long id) {
    //1. 获取当前用户信息
    Long userId = UserHolder.getUser().getId();
    //2. 如果当前用户未点赞，则点赞数 +1，同时将用户加入set集合
    String key = BLOG_LIKED_KEY + id;
    //尝试获取score
    Double score = stringRedisTemplate.opsForZSet().score(key, userId.toString());
    //为null，则表示集合中没有该用户
    if (score == null) {
        //点赞数 +1
        boolean success = update().setSql("liked = liked + 1").eq("id", id).update();
        //将用户加入set集合
        if (success) {
            stringRedisTemplate.opsForZSet().add(key, userId.toString(), System.currentTimeMillis());
        }
        //3. 如果当前用户已点赞，则取消点赞，将用户从set集合中移除
    } else {
        //点赞数 -1
        boolean success = update().setSql("liked = liked - 1").eq("id", id).update();
        if (success) {
            //从set集合移除
            stringRedisTemplate.opsForZSet().remove(key, userId.toString());
        }
    }
    return Result.ok();
}
```

这是博客系统点赞功能的优化版本实现代码。与之前使用 set 数据结构不同的是，这里使用了 Redis 的 zset 数据结构来存储点赞用户。
zset 是一个有序的、不重复的元素集合，能够存储元素和元素对应的分值（在博客系统中使用分值记录用户点赞时间），可以使用 RedisTemplate 来操作 zset 集合。在这个实现版本中，点赞时会将当前登录用户的 ID 和当前时间的毫秒值存入 zset 集合中，这个 zset 集合中的每一个元素都是一个用户的 ID 和用户点赞的时间，因此，尝试获取 score 时就可以判断当前用户是否已经点赞了该博客以及点赞时间。
在存入 zset 集合时，key 的格式为 "blog:liked:id"，其中 id 为博客的 ID；value 的值为点赞该博客的用户 ID；score 的值为点赞该博客的时间戳。
在查询博客时，可以使用 RedisTemplate 从该 zset 集合中查找当前登录用户的 ID 是否存在，以及对应的 score 是否过期，如果已经点赞并且未过期，则将对应的结果设置到博客对象的 isLike 属性中。

## 8.你是怎么实现好友关注和粉丝功能的？

### 1.关注和取消关注

- 当我们进入到笔记详情页面时，会发送一个请求，判断当前登录用户是否关注了笔记博主请求网址: [http://localhost:8080/api/follow/or/not/2](http://localhost:8080/api/follow/or/not/2)
  请求方法: GET
- 当我们点击关注按钮时，会发送一个请求，实现关注/取关请求网址:

[http://localhost:8080/api/follow/2/true](http://localhost:8080/api/follow/2/true)
请求方法: PUT
Controller

```java
@RestController
@RequestMapping("/follow")
public class FollowController {
    @Resource
    private IFollowService followService;
    //判断当前用户是否关注了该博主
    @GetMapping("/or/not/{id}")
    public Result isFollow(@PathVariable("id") Long followUserId) {
        return followService.isFollow(followUserId);
    }
    //实现取关/关注
    @PutMapping("/{id}/{isFollow}")
    public Result follow(@PathVariable("id") Long followUserId, @PathVariable("isFollow") Boolean isFellow) {
        return followService.follow(followUserId,isFellow);
    }
}
```

FellowServiceImpl

```java
@Service
public class FollowServiceImpl extends ServiceImpl<FollowMapper, Follow> implements IFollowService {

    @Override
    public Result isFollow(Long followUserId) {
        //获取当前登录的userId
        Long userId = UserHolder.getUser().getId();
        LambdaQueryWrapper<Follow> queryWrapper = new LambdaQueryWrapper<>();
        //查询当前用户是否关注了该笔记的博主
        queryWrapper.eq(Follow::getUserId, userId).eq(Follow::getFollowUserId, followUserId);
        //只查询一个count就行了
        int count = this.count(queryWrapper);
        return Result.ok(count > 0);
    }

    @Override
    public Result follow(Long followUserId, Boolean isFellow) {
        //获取当前用户id
        Long userId = UserHolder.getUser().getId();
        //判断是否关注
        if (isFellow) {
            //关注，则将信息保存到数据库
            Follow follow = new Follow();
            follow.setUserId(userId);
            follow.setFollowUserId(followUserId);
            save(follow);
        } else {
            //取关，则将数据从数据库中移除
            LambdaQueryWrapper<Follow> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(Follow::getUserId, userId).eq(Follow::getFollowUserId, followUserId);
            remove(queryWrapper);
        }
        return Result.ok();
    }
}
```

首先，通过 UserHolder 类获取当前登录用户的信息。
在查询是否关注时，使用 LambdaQueryWrapper 封装查询条件，查询当前用户是否关注了指定的用户，如果查询结果数量大于 0，则表示当前用户已经关注了该用户，否则未关注该用户。
在关注和取关时，根据传入的 isFellow 参数来判断当前用户的操作，并将关注和取关的信息保存到数据库中，并使用 Redis 来缓存关注用户的信息。这里为了方便，未对 Redis 缓存的数据进行有效期管理，当数据发生变化时需要对 Redis 缓存进行更新。

### 2.共同关注

- 查看共同关注请求网址: [http://localhost:8080/api/follow/common/undefined](http://localhost:8080/api/follow/common/undefined)
  请求方法: GET
- 查看用户自己的笔记并分页请求网址: [http://localhost:8080/api/blog/of/user?&id=2&current=1](http://localhost:8080/api/blog/of/user?&id=2&current=1)
  请求方法: GET

```java
@GetMapping("/of/user")
public Result queryBlogByUserId(@RequestParam(value = "current", defaultValue = "1") Integer current, @RequestParam("id") Long id) {
   LambdaQueryWrapper<Blog> queryWrapper = new LambdaQueryWrapper<>();
   queryWrapper.eq(Blog::getUserId, id);
   Page<Blog> pageInfo = new Page<>(current, SystemConstants.MAX_PAGE_SIZE);
   blogService.page(pageInfo, queryWrapper);
   List<Blog> records = pageInfo.getRecords();
   return Result.ok(records);
}
```

**实现方式：**
**在set集合中，有交集并集补集的api，可以把二者关注的人放入到set集合中，然后通过api查询两个set集合的交集。**
**所以，在关注博主的同时，需要将数据放到set集合中，方便后期我们实现共同关注，当取消关注时，也需要将数据从set集合中删除。**

```java
@Override
public Result followCommons(Long id) {
    //获取当前用户id
    Long userId = UserHolder.getUser().getId();
    String key1 = "follows:" + id;
    String key2 = "follows:" + userId;
    //对当前用户和博主用户的关注列表取交集
    Set<String> intersect = stringRedisTemplate.opsForSet().intersect(key1, key2);
    if (intersect == null || intersect.isEmpty()) {
        //无交集就返回个空集合
        return Result.ok(Collections.emptyList());
    }
    //将结果转为list
    List<Long> ids = intersect.stream().map(Long::valueOf).collect(Collectors.toList());
    //之后根据ids去查询共同关注的用户，封装成UserDto再返回
    List<UserDTO> userDTOS = userService.listByIds(ids).stream().map(user ->
            BeanUtil.copyProperties(user, UserDTO.class)).collect(Collectors.toList());
    return Result.ok(userDTOS);
}
```

### 3.Feed流实现方式

Feed流的实现有两种模式

1. Timeline：不做内容筛选，简单的按照内容发布时间排序，常用于好友或关注(B站关注的up，朋友圈等)

- 优点：信息全面，不会有缺失，并且实现也相对简单
- 缺点：信息噪音较多，用户不一定感兴趣，内容获取效率低

2. 智能排序：利用智能算法屏蔽掉违规的、用户不感兴趣的内容，推送用户感兴趣的信息来吸引用户

- 优点：投喂用户感兴趣的信息，用户粘度很高，容易沉迷
- 缺点：如果算法不精准，可能会起到反作用（给你推的你都不爱看）

这里针对好友的操作，采用的是Timeline方式，只需要拿到我们关注用户的信息，然后按照时间排序即可
采用Timeline模式，有三种具体的实现方案

1. 拉模式
2. 推模式
3. 推拉结合

- 拉模式：也叫读扩散
    - 该模式的核心含义是：当张三和李四、王五发了消息之后，都会保存到自己的发件箱中，如果赵六要读取消息，那么他会读取他自己的收件箱，此时系统会从他关注的人群中，将他关注人的信息全都进行拉取，然后进行排序
    - 优点：比较节约空间，因为赵六在读取信息时，并没有重复读取，并且读取完之后，可以将他的收件箱清除
    - 缺点：有延迟，当用户读取数据时，才会去关注的人的时发件箱中拉取信息，假设该用户关注了海量用户，那么此时就会拉取很多信息，对服务器压力巨大
      ![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230906163715.png)
- 推模式：也叫写扩散
    - 推模式是没有写邮箱的，当张三写了一个内容，此时会主动把张三写的内容发送到它粉丝的收件箱中，假设此时李四再来读取，就不用再去临时拉取了
    - 优点：时效快，不用临时拉取
    - 缺点：内存压力大，假设一个大V发了一个动态，很多人关注他，那么就会写很多份数据到粉丝那边去
      ![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230906163735.png)
- 推拉结合：页脚读写混合，兼具推和拉两种模式的优点
    - 推拉模式是一个折中的方案，站在发件人这一边，如果是普通人，那么我们采用写扩散的方式，直接把数据写入到他的粉丝收件箱中，因为普通人的粉丝数量较少，所以这样不会产生太大压力。但如果是大V，那么他是直接将数据写入一份到发件箱中去，在直接写一份到活跃粉丝的收件箱中，站在收件人这边来看，如果是活跃粉丝，那么大V和普通人发的都会写到自己的收件箱里，但如果是普通粉丝，由于上线不是很频繁，所以等他们上线的时候，再从发件箱中去拉取信息。

### 4.推送到粉丝收件箱（Feed流分页）

我这里用的是推模式，因为并没有那么多数据
需求：

1. 修改新增探店笔记的业务，在保存blog到数据库的同时，推送到粉丝的收件箱
2. 收件箱满足可以根据时间戳排序，必须使用Redis的数据结构实现
3. 查询收件箱数据时，课实现分页查询

- Feed流中的数据会不断更新，所以数据的角标也会不断变化，所以我们不能使用传统的分页模式
- 假设在t1时刻，我们取读取第一页，此时page = 1，size = 5，那么我们拿到的就是10~6这几条记录，假设t2时刻有发布了一条新纪录，那么在t3时刻，我们来读取第二页，此时page = 2，size = 5，那么此时读取的数据是从6开始的，读到的是6~2，那么我们就读到了重复的数据，所以我们要使用Feed流的分页，不能使用传统的分页
  ![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230906163755.png)
- Feed流的滚动分页
    - 我们需要记录每次操作的最后一条，然后从这个位置去开始读数据
    - 举个例子：我们从t1时刻开始，拿到第一页数据，拿到了10~6，然后记录下当前最后一次读取的记录，就是6，t2时刻发布了新纪录，此时这个11在最上面，但不会影响我们之前拿到的6，此时t3时刻来读取第二页，第二页读数据的时候，从6-1=5开始读，这样就拿到了5~1的记录。我们在这个地方可以使用SortedSet来做，使用时间戳来充当表中的1~10
      ![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230906163804.png)
- 核心思路：我们保存完探店笔记后，获取当前用户的粉丝列表，然后将数据推送给粉丝

```java
@Override
public Result saveBlog(Blog blog) {
    // 获取登录用户
    UserDTO user = UserHolder.getUser();
    blog.setUserId(user.getId());
    // 保存探店博文
    save(blog);
    // 条件构造器
    LambdaQueryWrapper<Follow> queryWrapper = new LambdaQueryWrapper<>();
    // 从follow表最中，查找当前用户的粉丝  select * from follow where follow_user_id = user_id
    queryWrapper.eq(Follow::getFollowUserId, user.getId());
    //获取当前用户的粉丝
    List<Follow> follows = followService.list(queryWrapper);
    for (Follow follow : follows) {
        Long userId = follow.getUserId();
        String key = FEED_KEY + userId;
        //推送数据
        stringRedisTemplate.opsForZSet().add(key, blog.getId().toString(), System.currentTimeMillis());
    }
    // 返回id
    return Result.ok(blog.getId());
}
```

### 5.实现滚动分页查询收件箱

- 需求：在个人主页的关注栏中，查询并展示推送的Blog信息
- 具体步骤如下
    1. 每次查询完成之后，我们要分析出查询出的最小时间戳，这个值会作为下一次的查询条件
    2. 我们需要找到与上一次查询相同的查询个数，并作为偏移量，下次查询的时候，跳过这些查询过的数据，拿到我们需要的数据（例如时间戳8 6 6 5 5 4，我们每次查询3个，第一次是8 6 6，此时最小时间戳是6，如果不设置偏移量，会从第一个6之后开始查询，那么查询到的就是6 5 5，而不是5 5 4，如果这里说的不清楚，那就看后续的代码）
- 综上：我们的请求参数中需要携带lastId和offset，即上一次查询时的最小时间戳和偏移量，这两个参数

具体看视频：[https://www.bilibili.com/video/BV1cr4y1671t?p=87&vd_source=1491518ed1752c63645a181ab2704402](https://www.bilibili.com/video/BV1cr4y1671t?p=87&vd_source=1491518ed1752c63645a181ab2704402)

## 9.怎么实现附近商户功能？

### 1.使用Redis的GEO数据结构存储商铺位置

首先，存商家的地址到Redis

- 将数据库中的数据导入到Redis中去，GEO在Redis中就是一个member和一个经纬度，经纬度对应的就是tb_shop中的x和y，而member，我们用shop_id来存，因为Redis只是一个内存级数据库，如果存海量的数据，还是力不从心，所以我们只存一个id，用的时候再拿id去SQL数据库中查询shop信息
- 但是此时还有一个问题，我们在redis中没有存储shop_type，无法根据店铺类型来对数据进行筛选，解决办法就是将type_id作为key，存入同一个GEO集合即可

| Key           | Value  | Score             |
| ------------- | ------ | ----------------- |
| shop:geo:美食 | 海底捞 | 40691512240174598 |
|               | 吉野家 | 40691519846517915 |
| shop:geo:KTV  | KTV 01 | 40691165486458787 |
|               | KTV 02 | 40691514154651657 |

**这里注意：**
**SpringDataRedis的2.3.9版本并不支持Redis 6.2提供的GEOSEARCH命令，因此我们需要提示其版本，修改自己的pom.xml文件**

## 10.你是怎么实现用户签到功能的？

- 我使用二进制位来记录每个月的签到情况，签到记录为1，未签到记录为0
- 把每一个bit位对应当月的每一天，形成映射关系，用0和1标识业务状态，这种思路就成为位图（BitMap）。这样我们就能用极小的空间，来实现大量数据的表示
- Redis中是利用String类型数据结构实现BitMap，因此最大上限是512M，转换为bit则是2^32个bit位
- BitMap的操作命令有
    - SETBIT：向指定位置（offset）存入一个0或1
    - GETBIT：获取指定位置（offset）的bit值
    - BITCOUNT：统计BitMap中值为1的bit位的数量
    - BITFIELD：操作（查询、修改、自增）BitMap中bit数组中的指定位置（offset）的值
    - BITFIELD_RO：获取BitMap中bit数组，并以十进制形式返回
    - BITOP：将多个BitMap的结果做位运算（与、或、异或）
    - BITPOS：查找bit数组中指定范围内第一个0或1出现的位置

**思路：我们可以把年和月作为BitMap的key，然后保存到一个BitMap中，每次签到就把对应位上的0变成1，只要是1就说明这一天已经签到了，反之则没有签到。**

```java
@Override
public Result sign() {
    //1. 获取当前用户
    Long userId = UserHolder.getUser().getId();
    //2. 获取日期
    LocalDateTime now = LocalDateTime.now();
    //3. 拼接key
    String keySuffix = now.format(DateTimeFormatter.ofPattern(":yyyyMM"));
    String key = USER_SIGN_KEY + userId + keySuffix;
    //4. 获取今天是当月第几天(1~31)
    int dayOfMonth = now.getDayOfMonth();
    //5. 写入Redis  BITSET key offset 1
    stringRedisTemplate.opsForValue().setBit(key, dayOfMonth - 1, true);
    return Result.ok();
}
```

**签到统计**
如何获取本月到今天为止的所有签到数据？

- BITFIELD key GET u[dayOfMonth] 0

如何从后往前遍历每个bit位，获取连续签到天数

- 连续签到天数，就是从末尾往前数，看有多少个1
- 简单的位运算算法

```java
int count = 0;
while(true) {
    if((num & 1) == 0)
        break;
    else
        count++;
    // 数字右移，抛弃最后一位
    num >>>= 1;
}
return count;
```

这里的循环遍历是为了计算签到次数，具体运算流程如下：

1. 定义一个计数器count，用来计算签到次数。
2. 定义一个long类型变量num，并将今天的签到记录存储在其中。
3. 通过循环遍历，判断签到记录的每一位是否为1，若为1则表示用户当日已签到，签到次数count递增。
4. 由于使用二进制来存储签到历史记录，需要将数字右移，抛弃最后一位。
5. 当二进制数全部判断完毕后，返回计数器count，表示当前用户签到的次数。

举个例子，如果num的值为01010101（二进制），则循环遍历每一位标记，可以得出该用户共有4次签到，具体计算方法如下：

1. 初始count为0，num为01010101（二进制）。
2. 遍历num的最后一位数字5（二进制表示为101），由于最后一位是1，count递增1。
3. 将num右移一位，即变为00101010，继续判断最后一位数字2，由于最后一位是0，不递增count。
4. 将num右移一位变为00010101，判断数字1，由于最后一位是1，count递增1。
5. 将num右移一位变为00001010，判断数字0，不递增count。
6. 将num右移两位变为00000010，判断数字2，由于最后一位是0，不递增count。
7. 将num右移一位变为00000001，判断数字1，由于最后一位是1，count递增1。
8. 循环完成，最终count为4，即该用户共签到了4次。

## 11.你是怎么实现UV统计

### HyperLogLog

- UV：全称Unique Visitor，也叫独立访客量，是指通过互联网访问、浏览这个网页的自然人。1天内同一个用户多次访问该网站，只记录1次。
- PV：全称Page View，也叫页面访问量或点击量，用户每访问网站的一个页面，记录1次PV，用户多次打开页面，则记录多次PV。往往用来衡量网站的流量。
- 本博客的首页侧边栏就有本站访客量和本站总访问量，对应的就是UV和PV
- 通常来说PV会比UV大很多，所以衡量同一个网站的访问量，我们需要综合考虑很多因素。
- UV统计在服务端做会很麻烦，因为要判断该用户是否已经统计过了，需要将统计过的信息保存，但是如果每个访问的用户都保存到Redis中，那么数据库会非常恐怖，那么该如何处理呢？
- HyperLogLog(HLL)是从Loglog算法派生的概率算法，用户确定非常大的集合基数，而不需要存储其所有值，算法相关原理可以参考下面这篇文章：[https://juejin.cn/post/6844903785744056333#heading-0](https://juejin.cn/post/6844903785744056333#heading-0)
- Redis中的HLL是基于string结构实现的，单个HLL的内存永远小于16kb，内存占用低的令人发指！作为代价，其测量结果是概率性的，有小于0.81％的误差。不过对于UV统计来说，这完全可以忽略。