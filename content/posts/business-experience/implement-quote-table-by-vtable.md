---
author: "Roc"
title: "用VTable实现一个行情报价表"
date: "2025-03-31 11:30:29"
tags: [
    "React",
]
type: post
showTableOfContents: true
---

## 概述

利用字节开源的[vtable](https://visactor.io/vtable)组件，简易实现一个行情报价表。

<video src="https://shared-public.oss-cn-shenzhen.aliyuncs.com/vtable-demo.mp4" controls style="width: 100%;height: 300px;"></video>

## 背景和思考

源于一次内部分享，有同事分享了这个vtable，好奇就想试试用它实现一个报价表怎么样，因为报价表最主要的就是需要有虚拟滚动(有几千条股票)、性能好(因为要订阅整屏数据)、支持固定行列(表头和股票代码必须固定)。

在此基本需求下PC端报价表对于**固定行列**大多数都是使用手写的双层表格，一层专门显示固定列一层显示静态剩余列，这种写法在pc上面还好，因为现在的pc大多数都是8G以上，但是到了移动端，这样写就一点都不行了，低端安卓机同步滚动卡顿非常明显，试过无数种方式，没有一种完美解决方案。
这也是为什么很多移动端行情表格要么表头和列滚动同步明显，要么就表头固定。

canvas其实可以完美解决这个问题，他不需要去固定这固定那的，只需要不断地计算位置去重绘，就是成本略高，并且很难让外部定制，因为他不是dom节点，外部定制最后都得转换成canvas API实现，**所以想开源这种基于canvas的表格，可定制化的衡量是最重要的**，仔细看了看vtable的api非常多而全，所以手痒想试一把效果。

## 期望

这次的想法是快速实现不考虑UI，实现一个支持排序、展示价格涨跌色、名称和code上下显示、支持异步加载的表格就ok。

## 过程简述

### React or vanilla?

最开始倾向于用[React-VTable](https://visactor.io/vtable/guide/Developer_Ecology/react)，但是试用过程中发现一些问题，比如React19没法用会报错，看了下Issues，发现有人提了一个说明不是只有我一个人遇到，但是还没解决，只能先降低到18了。

这个问题还不算致命，主要是React版本的文档太简陋了，只寥寥几句，在写其他功能的过程中不想传Records这个参数但是没发现其他办法，

因为只是尝试，所以没有深入追究，立马换了vanilla版本，API文档全，也有demo。

### 实现懒加载数据

实现懒加载数据一般有几种做法，一种是不知道总页码，触底加载下一页，PC端基本不会用这种方式，移动端大部分用这种方式，但是这种其实数据是不对的，因为报价表在基于排序条件的时候，动态加载下一页可能数据会错乱，因为现价等一直在变化。

知道总页码之后也有两种做法，但基本都是根据可视区域计算可视区域起始点，然后根据pageSize和PageNum去请求数据，其实就是虚拟滚动。

先试了第一种做法，使用它的[SCROLL_VERTICAL_END](https://visactor.io/vtable/api/events##SCROLL_VERTICAL_END)事件和[SCROLL](https://visactor.io/vtable/api/events##SCROLL)试了试效果发现事件和请求都ok，就是用了[setRecords](https://visactor.io/vtable/api/Methods##setRecords)和[addRecords](https://visactor.io/vtable/api/Methods##addRecords)添加数据一直有问题，就放弃了这个做法，转而使用第二种方式，也是最常用的做法。就是提前获取总页码：

```tsx
const getRowData = useCallback(
  (index: number) => {
    const loadStartIndex = Math.floor(index / 200) * 200;
    if (!tableDataDict.current[loadStartIndex]) {
      tableDataDict.current[loadStartIndex] = queryData(loadStartIndex, 200);
    }

    return tableDataDict.current[loadStartIndex].then((_data) => _data[index - loadStartIndex]);
  },
  [queryData],
);

useWSClientEffect((client) => {
  tableOption.current = {...};

  querySymbolRankByMarket(client, {
    marketList,
    begin: 0,
    count: 1,
  }).then((response) => {
    const { totalcount } = response;
    totalcountRef.current = totalcount;
    tableRef.current = new ListTable(document.getElementById('container') as HTMLElement, tableOption.current);
    tableRef.current.dataSource = new data.CachedDataSource({
      get(index: number) {
        return getRowData(index);
      },
      length: totalcountRef.current,
    });

    // Not export type
    tableRef.current.on('sort_click', sortHandler as any);
  });
}, []);
```

这里是参考[Lazy load data asynchronously](https://visactor.io/vtable/guide/data/async_data)，这里有个问题，刚开始页码用的100，不知道为什么他的预加载是200条，导致不得不放大了pageSize为200。

### 定制cell

定制cell主要就两个需求，一个是实现涨跌颜色，这个虽然[style](https://visactor.io/vtable/guide/theme_and_style/style)可以定制颜色，
但是他只能拿到`arg.value`，不能拿到当前行数据，我很不喜欢每次render都去计算。所以就使用了[customRender](https://visactor.io/vtable/guide/custom_define/custom_layout)，这个更灵活的API，
并且他自己实现了一个`flex`和`padding`，还挺好用的。就是有个问题，好像必须使用`VGroup`包裹一下，`VText`不能单独显示出来。

代码如下：

```tsx
function customLayoutOfPriceChg(key: string) {
  return (args: VTable.TYPES.CustomRenderFunctionArg) => {
    const { table, row, col, rect } = args;
    const { height, width } = rect || table.getCellRect(col, row);
    const record = table.getCellOriginRecord(col, row);

    const container = (
      <VGroup
        id="container-right"
        attribute={{
          width,
          height,
          opacity: 0.1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <VText
          attribute={{
            text: record[key],
            fontSize: 13,
            fontFamily: 'sans-serif',
            fill: record.priceColor,
            boundsPadding: [0, 0, 0, 10],
          }}
        />
      </VGroup>
    );

    return {
      rootContainer: container,
      renderDefault: false,
    };
  };
}
```

### 实现排序

虽然vtable支持本地排序，但是报价表是一定需要服务端排序的，所以上来就需要把默认排序关了。

```tsx
const sortHandler = (params: { field: string; order: 'asc' | 'desc' }) => {
  tableDataDict.current = {};
  setSortInfo({
    field: params.field,
    order: params.order,
  });

  tableRef.current?.setRecords([], { sortState: params });
  return false;
};

useEffect(() => {
  tableOption.current.sortState = {
    field: sortInfo.field,
    order: sortInfo.order,
  };
  // Force update
  tableRef.current?.updateOption(tableOption.current);

  if (tableRef.current) {
    tableRef.current.dataSource = new data.CachedDataSource({
      get(index: number) {
        return getRowData(index);
      },
      length: totalcountRef.current,
    });
  }
}, [getRowData]);
```

这个sort函数其实写的有点奇怪，首先就是先把cache的缓存清掉，因为排序后所有的数据都变了，旧数据没有存在的必要了。然后就是更改`sort`的state，
因为重新请求需要拿到这些最新信息，最奇怪的就是第三行和后面的，我得先把数据清空了之后，再去`updateOption`强制刷新，没有这样做之前各种bug，不知道是不是
vtable的bug，还是我没有研究太深入。反正目前这个功能的实现感觉像是黑魔法。

### 订阅行情？

订阅行情没有做，但是脑暴了一下，就是监听scroll的时候动态获取可视区域页码，节流一下就可以正常订阅数据再调用`updateRecords`更新数据（这里应该有大坑，因为他的数据机制）。
vtable的数据管理感觉很是有点奇怪，特别在用了`cachedDataSource`之后，这个API的文档也不够详细。

```js
tableRef.current?.getBodyVisibleRowRange();
```

## 总结

期望的效果其实都实现了，感觉vtable还是挺强大的，基本能想到的场景都支持，就是那个data管理有点奇怪。算是一个比较成功的小尝试。

## 代码

完整代码如下：

  - 仅实现功能，未做代码优化
  - 隐藏了部分代码，比如请求的内部数据

```tsx
import { toFixed, toPercent, toPositiveSign } from '@dz-web/o-orange';
import { useWSClientEffect, useQuoteClientSelector } from '@dz-web/quote-client-react-s6';
import { querySymbolRankByMarket, RankDesc } from '@dz-web/quote-client-s6';
import VTable, { themes, ListTable, data, VText, VGroup } from '@visactor/vtable';
import { useState, useCallback, useRef, useEffect } from 'react';

import { getSortField, marketList } from './utils';

export default function HomePage() {
  const wsClient = useQuoteClientSelector((state) => state.wsClient);
  const isWsClientReady = useQuoteClientSelector((state) => state.isWsClientReady);

  const [sortInfo, setSortInfo] = useState<{
    field: string;
    order: 'asc' | 'desc';
  }>({
    field: 'priceChgPercent',
    order: 'desc',
  });

  const tableRef = useRef<ListTable>();
  const tableDataDict = useRef<Record<number, Promise<any>>>({});
  const tableOption = useRef<Record<string, any>>({});
  const totalcountRef = useRef(0);

  const queryData = useCallback(
    (begin: number, count: number) => {
      if (!wsClient || !isWsClientReady) return Promise.resolve({ symbol: [] });

      return querySymbolRankByMarket(wsClient, {
        marketList,
        begin,
        count,
        sortField: getSortField(sortInfo.field),
        desc: sortInfo.order === 'asc' ? RankDesc.ASC : RankDesc.DESC,
      }).then((response) => {
        const { symbol } = response;

        const _data = symbol.map((item, index) => ({
          ...item,
          index: begin + index + 1,
          safeNow: toFixed(item.safeNow),
          priceChg: toPositiveSign(toFixed(item.priceChg)),
          priceColor: item.priceChg > 0 ? 'red' : 'green',
          priceChgPercent: toPercent(Number(item.priceChgPercent)),
        }));

        return _data;
      });
    },
    [wsClient, isWsClientReady, sortInfo],
  );

  const getRowData = useCallback(
    (index: number) => {
      const loadStartIndex = Math.floor(index / 200) * 200;
      if (!tableDataDict.current[loadStartIndex]) {
        tableDataDict.current[loadStartIndex] = queryData(loadStartIndex, 200);
      }

      return tableDataDict.current[loadStartIndex].then((_data) => _data[index - loadStartIndex]);
    },
    [queryData],
  );

  const sortHandler = (params: { field: string; order: 'asc' | 'desc' }) => {
    tableDataDict.current = {};
    setSortInfo({
      field: params.field,
      order: params.order,
    });

    tableRef.current?.setRecords([], { sortState: params });
    return false;
  };

  useWSClientEffect((client) => {
    tableOption.current = {
      width: '100%',
      height: '100%',
      theme: themes.DARK,
      columns: [
        {
          field: 'index',
          title: '序号',
          width: 100,
        },
        {
          field: 'name',
          title: '名称',
          width: 100,
          sort: true,
          customLayout: customLayoutOfNameCode(),
        },
        {
          field: 'safeNow',
          title: '最新价',
          sort: true,
          width: 100,
        },
        {
          field: 'priceChg',
          title: '涨跌',
          sort: true,
          width: 100,
          customLayout: customLayoutOfPriceChg('priceChg'),
        },
        {
          field: 'priceChgPercent',
          title: '涨跌幅',
          width: 100,
          sort: true,
          customLayout: customLayoutOfPriceChg('priceChgPercent'),
        },
      ],
      sortState: {
        field: sortInfo.field,
        order: sortInfo.order,
      },
    };

    querySymbolRankByMarket(client, {
      marketList,
      begin: 0,
      count: 1,
    }).then((response) => {
      const { totalcount } = response;
      totalcountRef.current = totalcount;
      tableRef.current = new ListTable(document.getElementById('container') as HTMLElement, tableOption.current);
      tableRef.current.dataSource = new data.CachedDataSource({
        get(index: number) {
          return getRowData(index);
        },
        length: totalcountRef.current,
      });

      // Not export type
      tableRef.current.on('sort_click', sortHandler as any);
    });
  }, []);

  useEffect(() => {
    tableOption.current.sortState = {
      field: sortInfo.field,
      order: sortInfo.order,
    };
    // Force update
    tableRef.current?.updateOption(tableOption.current);

    if (tableRef.current) {
      tableRef.current.dataSource = new data.CachedDataSource({
        get(index: number) {
          return getRowData(index);
        },
        length: totalcountRef.current,
      });
    }
  }, [getRowData]);

  return <div style={{ position: 'absolute', width: '600px', height: '800px' }} id="container" />;
}

function customLayoutOfPriceChg(key: string) {
  return (args: VTable.TYPES.CustomRenderFunctionArg) => {
    const { table, row, col, rect } = args;
    const { height, width } = rect || table.getCellRect(col, row);
    const record = table.getCellOriginRecord(col, row);

    const container = (
      <VGroup
        id="container-right"
        attribute={{
          width,
          height,
          opacity: 0.1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <VText
          attribute={{
            text: record[key],
            fontSize: 13,
            fontFamily: 'sans-serif',
            fill: record.priceColor,
            boundsPadding: [0, 0, 0, 10],
          }}
        />
      </VGroup>
    );

    return {
      rootContainer: container,
      renderDefault: false,
    };
  };
}

function customLayoutOfNameCode() {
  return (args: VTable.TYPES.CustomRenderFunctionArg) => {
    const { table, row, col, rect } = args;
    const { height, width } = rect || table.getCellRect(col, row);
    const record = table.getCellOriginRecord(col, row);

    const container = (
      <VGroup
        id="container-right"
        attribute={{
          width,
          height,
          opacity: 0.1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <VText
          attribute={{
            text: record.name,
            fontSize: 13,
            fill: '##fff',
            fontFamily: 'sans-serif',
            boundsPadding: [0, 0, 0, 10],
          }}
        />
        <VText
          attribute={{
            text: record.code,
            fontSize: 13,
            fill: '##fff',
            fontFamily: 'sans-serif',
            boundsPadding: [5, 0, 0, 10],
          }}
        />
      </VGroup>
    );

    return {
      rootContainer: container,
      renderDefault: false,
    };
  };
}
```
