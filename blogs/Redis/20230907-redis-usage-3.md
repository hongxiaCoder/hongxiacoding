---
title: 如何使用Redis实现附近商家查询
date: 2023/09/07
tags:
- 实际应用
categories:
- Redis
---

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907125735.png)

## 导读

在日常生活中，我们经常能看见查询附近商家的功能。

常见的场景有，比如你在点外卖的时候，就可能需要按照距离查询附近几百米或者几公里的商家。

本文将介绍如何使用Redis实现按照距离查询附近商户的功能，并以SpringBoot项目作为举例。

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907125802.png)

**想知道这样的功能是如何实现的吗？接着往下看吧！**

## Redis地理位置功能

Redis是一种高性能的键值存储数据库，具有快速读写能力和丰富的数据结构支持。在Redis 3.2版本之后，它引入了地理位置（Geospatial）功能，使其可以轻松处理与地理位置相关的数据。

地理位置功能的核心数据结构是有序集合（Sorted Set），它将元素与分数（score）关联起来。在地理位置功能中，分数表示地理位置的经度和纬度，而元素则是一个标识符，比如商户的ID。

**我们只需要在数据库中存储商家的经纬度，以商家id作为key，经纬度作为value存入redis中，就可以通过redis命令来获得以某一个点为圆心一定范围内的商家，以及他们之间的距离。**

![](https://cdn.jsdelivr.net/gh/hongxiaCoder/Pictures@master/20230907125835.png)

 

### 常用命令

### GEOADD：将地理位置添加到有序集合中

使用GEOADD命令，可以将一个或多个地理位置添加到有序集合中。语法如下：

```
GEOADD key longitude latitude member [longitude latitude member ...]

示例：
   GEOADD stores 116.404 39.915 "storeA"
   GEOADD stores 116.418 39.917 "storeB"
```


### GEODIST：计算两个位置之间的距离

  GEODIST命令用于计算两个位置之间的距离，可以指定单位（米、千米、英里、英尺等）。

```
GEODIST key member1 member2 [unit]

示例：
   GEODIST stores storeA storeB km
```


### GEORADIUS：按照距离查询位置范围内的元素

GEORADIUS命令用于在指定的地理位置范围内查询元素。它可以按照经纬度坐标和半径来查询，还可以限制返回的结果数量。

```
GEORADIUS key longitude latitude radius unit [WITHCOORD] [WITHDIST] [WITHHASH] [COUNT count] [ASC|DESC] [STORE key]

示例：
   GEORADIUS stores 116.408 39.916 1 km WITHDIST COUNT 5
```



### GEOHASH：获取位置的geohash值

GEOHASH命令用于获取指定位置的geohash值，geohash是一种将地理位置编码成字符串的方法，可以用于快速近似的位置计算。

```
GEOHASH key member [member ...]

示例：
   GEOHASH stores storeA storeB
```


### GEOPOS：获取一个或多个位置的经纬度坐标

GEOPOS命令用于获取一个或多个位置的经纬度坐标。

```
GEOPOS key member [member ...]

示例：
   GEOPOS stores storeA storeB
```



### GEORADIUSBYMEMBER：根据成员获取范围内的元素

这个命令与GEORADIUS类似，但是它以一个已有的成员作为中心点进行查询。

```
GEORADIUSBYMEMBER key member radius unit [WITHCOORD] [WITHDIST] [WITHHASH] [COUNT count] [ASC|DESC] [STORE key]

示例：
   GEORADIUSBYMEMBER stores storeA 1 km
```

地理位置功能不仅在查询附近商户等实际应用中非常有用，还可以应用于地理分析、位置推荐等领域。它通过利用Redis强大的有序集合数据结构，使得处理地理信息变得高效、灵活，并且易于集成到现有的应用中。无论是构建LBS应用还是处理位置相关数据，Redis的地理位置功能都能为开发者提供强大的支持。

## Java代码实现

### 将数据库中的商家经纬度存入redis

数据库中有一张商家表，其中有经度，纬度这两个字段。我们可以通过单元测试批量将这些商家的经纬度数据存入redis。key为商家id，value为经纬度。

```java
/**
     * 将数据库中的商户坐标添加到缓存
 */
    @Test
    void addShopGeo2Redis(){
        //获取商户集合
        List<Shop> list = shopService.list();
        //根据商户类型分类
        Map<Long, List<Shop>> collect = list.stream().collect(Collectors.groupingBy(Shop::getTypeId));
        for (Map.Entry<Long, List<Shop>> longListEntry : collect.entrySet()) {
            Long typeId = longListEntry.getKey();
            String key = "shop:geo:" + typeId;
            //获取商户经纬度
            List<Shop> shopList = longListEntry.getValue();
            List<RedisGeoCommands.GeoLocation<String>> locations = new ArrayList<>(shopList.size());
            for (Shop shop : shopList) {
//                stringRedisTemplate.opsForGeo().add(key,new Point(shop.getX(),shop.getY()),shop.getId().toString());
                //先收集完所有商户的地理位置，再一次性添加到redis
                locations.add(new RedisGeoCommands.GeoLocation<>(shop.getId().toString(),new Point(shop.getX(),shop.getY())));
            }
            stringRedisTemplate.opsForGeo().add(key,locations);
        }
    }
```




### 服务类：queryShopByType（typeId，current，x，y）

1.首先判断是否经纬度参数x和y是否为空

2.计算分页参数（redis无法分页，需要手动分页）

3.查询redis

4.获取商户id集合

5.根据商户id查询数据库

6.返回

```Java
  @Override
    public Result queryShopByType(Integer typeId, Integer current, Double x, Double y) {
        //1.判断是否需要根据坐标查询
        if(x == null || y == null){
            //直接数据库查询
            Page<Shop> page = query().eq("type_id", typeId).page(new Page<>(current, SystemConstants.DEFAULT_PAGE_SIZE));
            return Result.ok(page.getRecords());
        }
        //2.计算分页参数
        int from = (current - 1) * SystemConstants.DEFAULT_PAGE_SIZE;
        int end = current * SystemConstants.DEFAULT_PAGE_SIZE;
 
        //3.查询redis，按照距离排序，分页。结果：shopId，distance
        String key = SHOP_GEO_KEY + typeId;
        GeoResults<RedisGeoCommands.GeoLocation<String>> results = stringRedisTemplate.opsForGeo()
                .search(
                        key,
                        GeoReference.fromCoordinate(x, y),
                        new Distance(5000),
                        RedisGeoCommands.GeoSearchCommandArgs.newGeoSearchArgs().includeDistance().limit(end)
                );
 
        //4.解析出id
        if(results == null){
            return Result.ok(Collections.emptyList());
        }
        List<GeoResult<RedisGeoCommands.GeoLocation<String>>> list = results.getContent();
        if(list.size() <= from){
            //没有下一页
            return Result.ok(Collections.emptyList());
        }
        //4.1截取from——end部分
        List<Long> ids = new ArrayList<>(list.size());
        Map<String, Distance> distanceMap = new HashMap<>(list.size());
        list.stream().skip(from).forEach(result -> {
            String shopIdStr = result.getContent().getName();
            ids.add(Long.valueOf(shopIdStr));
            Distance distance = result.getDistance();
            distanceMap.put(shopIdStr,distance);
        });
        //5.根据id查询shop
        String idStr = StrUtil.join(",",ids);
        List<Shop> shops = query().in("id",ids).last("ORDER BY FIELD(id," + idStr + ")").list();
        for (Shop shop : shops){
            shop.setDistance(distanceMap.get(shop.getId().toString()).getValue());
        }
 
        //6.返回
        return Result.ok(shops);
    }
}
```
## 注意点

1.redis查询的结果是从第1条到第end条，不能直接返回第begin条到第end条。那么如何跳过begin前面的记录呢？

> 可以使用stream（）流的skip（）方法，skip（）方法中指定参数begin，就会跳过前面的begin条记录。



2.通过redis获取的ids集合，再使用mybatis-plus使用query().in()进行查询时，会破坏数据顺序，如何解决？

> 手动指定顺序。在后面加上last("ORDER BY FIELD(id," + idStr + ")").list()。而idStr = StrUtil.join(",",ids);