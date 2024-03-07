+++
author = "Roc"
title = "情绪高度 Source Code"
date = "2023-11-06T13:33:11+08:00"
tags = [
    "Source-Code",
]
+++

# 背景

源于`230922`/`230926`xx分享的国诚项目情绪高度页面的代码。觉得里面写的很好，所以记录一下。

![img](https://moonlit-private.oss-cn-shenzhen.aliyuncs.com/emotional-index/CleanShot%202023-11-06%20at%2017.01.38.png)

页面长这样，主要就是使用d3自己实现了一个比较复杂的折线图。

# 速记

- [x] React query
- [x] Generocmemo 包裹
- [x] Function挂名字好调试
- [x] React multiple单词拼错了
- [x] Nice函数
- [ ] Scale.range
- [x] Usesize
- [x] Layout tsx react集成js 利用useReducer
- [x] 拖动用位移

# 231106记录

## 代码设计

### `gc-line-chart.tsx`

主要的图表代码，看了下设计就是有一个`useInteractive`hooks去计算交互之后该显示的数据`visible`、以及当前鼠标的位置.

然后根据比例尺去获取到`selectedIndex`

```tsx
const selectedIndex = clamp(Math.floor(xScale.invert(currentPointer.x)), 0, getVisibleData().length - 1);
```

#### render

```tsx
<div className={classNames(pClass(), className)} style={{ height }}>
  {/* tooltip部分 */}
  <div
    ref={floatingWindowRef}
    style={
      visible
        ? {
          left: shouldPlaceOn === 'right' ? (selectedIndexXpoint + xOffset + 10) : 'auto',
          right: shouldPlaceOn === 'left' ? clientWidth - selectedIndexXpoint - xOffset + 10 : 'auto',
        }
        : {
          left: '-99999px',
          visibility: 'hidden',
        }
    }
    className={classNames(pClass('floating-window'), {
      'on-left': shouldPlaceOn === 'left',
      'on-right': shouldPlaceOn === 'right',
    })}
  >
    {
      DetailComponent
      && <DetailComponent activeKeys={activeKeys} selectedIndex={selectedIndex} data={getVisibleData()} />
    }
  </div>
  <svg ref={svgRef} className={pClass('svg')}>
    {
      !!yAxixYScale && (
        <YAxis
          xScale={xScale}
          yScale={yAxixYScale.scale}
          tickFormatter={mergedOptions.YTicksFormatter}
        />
      )
    }
    {
      !!subYAxixYScale && (
        <YAxis
          xScale={xScale}
          yScale={subYAxixYScale.scale}
          tickFormatter={mergedOptions.YTicksFormatter}
          tickCount={6}
          showGrid={false}
          side="right"
        />
      )
    }
    <XAxis
      xScale={xScale}
      yScale={yAxixYScale.scale}
    />
    <XTicks
      xScale={xScale}
      yScale={yAxixYScale.scale}
      data={getVisibleData()}
      tickFormatter={mergedOptions.xTicksFormatter}
      offset={xOffset}
    />
    {
      visible && (
        <rect
          className={pClass('hover-rect')}
          x={selectedIndexXpoint}
          y={minYPoint}
          width={xOffset * 2}
          height={maxYPoint - minYPoint}
        />
      )
    }
    {
      activeCharts.map(({ type, key, color }) => {
        const yScale = multipleYScale[key];

        if (type === ChartType.line) {
          return (
            <Line
              key={key}
              data={getVisibleData()}
              xScale={xScale}
              yScale={yScale.scale}
              color={color}
              dataKey={key}
              xOffset={xOffset}
            />
          );
        }

        if (type === ChartType.dashedLine) {
          return (
            <Line
              key={key}
              data={getVisibleData()}
              xScale={xScale}
              yScale={yScale.scale}
              color={color}
              dataKey={key}
              xOffset={xOffset}
              dashed
              showOpacityOutline={false}
            />
          );
        }

        if (type === ChartType.area) {
          return (
            <Area
              key={key}
              data={getVisibleData()}
              xScale={xScale}
              yScale={yScale.scale}
              color={color}
              dataKey={key}
              xOffset={xOffset}
            />
          );
        }

        return null;
      })
    }
  </svg>
</div>
```

### useInteractive

`interactive.tsx`

使用位运算来代表多种状态

```tsx
/* eslint-disable no-bitwise */
import { RefObject, useEffect, useReducer, useRef, useState } from 'react';
import { ChartLayoutOptions } from './layout';

export type MovingFloatWindowOptions = ChartLayoutOptions;

export enum InteractiveState {
  None = 0,
  ShowDetail = 1,
  // 为了高性能与方便同时存在多种状态，使用位运算
  // eslint-disable-next-line no-bitwise
  Dragging = 1 << 1,
  // eslint-disable-next-line no-bitwise
  Srolling = 1 << 2,
}

export interface IUseInteractiveOptions<Data> {
  floatingWindowRef: RefObject<HTMLDivElement>;
  svgRef: RefObject<SVGSVGElement>;
  data: Data[];
  /**
   * 每列数据的绘制宽度，拖动超过此宽度就会触发onDragMove
   */
  columnWidth: number;
  onDragMove?: (count: number) => void
}

export function useInteractive<T>({
  floatingWindowRef,
  svgRef,
  data,
  columnWidth,
  onDragMove,
}: IUseInteractiveOptions<T>) {
  const rerender = useReducer(() => ({}), {})[1];
  const interactiveState = useRef(InteractiveState.None);
  const [currentPointer, setCurrentPointer] = useState({
    x: 0,
    y: 0,
  });
  const [currentClientPointer, setCurrentClientPointer] = useState({
    clientX: 0,
    clientY: 0,
  });
  const [isOverlapWithPointer, setIsOverlapWithPointer] = useState(false);
  const [shouldPlaceOn, setShouldPlaceOn] = useState<'left' | 'right'>('left');
  const dragInfo = useRef({
    lastMouseX: 0,
    hasMoved: 0,
  });

  useEffect(() => {
    function drag(clientX: number) {
      const cur = dragInfo.current;
      const distance = clientX - cur.lastMouseX;
      cur.lastMouseX = clientX;
      const dist = distance;
      cur.hasMoved += dist;
      const width = columnWidth;
      let count = cur.hasMoved / width;
      count = count > 0 ? Math.floor(count) : Math.ceil(count);
      cur.hasMoved %= width;
      if (count !== 0) {
        onDragMove?.(-count);
      }
    }

    function calc(clientX: number, clientY) {
      const { left, top } = svgRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
      const documentWidth = document.body.clientWidth;

      const currentPointerX = clientX - left;
      const currentPointerY = clientY - top;
      setCurrentPointer({ x: currentPointerX, y: currentPointerY });
      setCurrentClientPointer({ clientX, clientY });

      const floatingWindowRect = floatingWindowRef.current?.getBoundingClientRect();

      if (floatingWindowRect) {
        const isOverlap = clientX > floatingWindowRect.left && clientX < floatingWindowRect.right;
        setIsOverlapWithPointer(isOverlap);
        // -100 是为了给浮动窗口在右边留出空间, 防止浏览器滚动条突然出现
        const canPlaceOnRight = documentWidth - clientX - 100 > floatingWindowRect.width;

        if (canPlaceOnRight) {
          setShouldPlaceOn('right');
        } else {
          setShouldPlaceOn('left');
        }
      }
    }

    function setFloatingWindowVisible(v: boolean) {
      if (!data || data.length === 0) {
        interactiveState.current &= ~InteractiveState.ShowDetail;
        rerender();
        return;
      }
      if (v) {
        interactiveState.current |= InteractiveState.ShowDetail;
      } else {
        interactiveState.current &= ~InteractiveState.ShowDetail;
      }
      rerender();
    }

    function getPointerPosition(e: TouchEvent) {
      const { clientX, clientY } = e.touches[0];
      calc(clientX, clientY);
    }

    function onTouchStart(e: TouchEvent) {
      getPointerPosition(e);
      setFloatingWindowVisible(true);
    }

    function onTouchEnd() {
      setFloatingWindowVisible(false);
    }

    function onTouchMove(e: TouchEvent) {
      if (e.cancelable) {
        e.preventDefault();
      }
      getPointerPosition(e);
    }

    function onMouseDown(e: MouseEvent) {
      interactiveState.current |= InteractiveState.Dragging;
      dragInfo.current.lastMouseX = e.clientX;
    }

    function onMouseUp() {
      interactiveState.current &= ~InteractiveState.Dragging;
    }

    function onMouseEnter(e: MouseEvent) {
      calc(e.clientX, e.clientY);
      setFloatingWindowVisible(true);
    }

    function onMouseMove(e: MouseEvent) {
      const { clientX, clientY } = e;
      calc(clientX, clientY);
      setFloatingWindowVisible(true);

      if (interactiveState.current & InteractiveState.Dragging) {
        drag(clientX);
      }
    }

    function onMouseLeave() {
      interactiveState.current &= ~InteractiveState.Dragging;
      setFloatingWindowVisible(false);
    }

    svgRef.current?.addEventListener('touchstart', onTouchStart, {
      passive: true,
    });
    svgRef.current?.addEventListener('touchend', onTouchEnd);
    svgRef.current?.addEventListener('touchmove', onTouchMove, {
      passive: false,
    });

    svgRef.current?.addEventListener('mousedown', onMouseDown);
    svgRef.current?.addEventListener('mouseup', onMouseUp);
    svgRef.current?.addEventListener('mouseenter', onMouseEnter);
    svgRef.current?.addEventListener('mousemove', onMouseMove);
    svgRef.current?.addEventListener('mouseleave', onMouseLeave);

    return () => {
      svgRef.current?.removeEventListener('touchstart', onTouchStart);
      svgRef.current?.removeEventListener('touchend', onTouchEnd);
      svgRef.current?.removeEventListener('touchmove', onTouchMove);
      svgRef.current?.removeEventListener('mousedown', onMouseDown);
      svgRef.current?.removeEventListener('mouseup', onMouseUp);
      svgRef.current?.removeEventListener('mouseenter', onMouseEnter);
      svgRef.current?.removeEventListener('mousemove', onMouseMove);
      svgRef.current?.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [data, columnWidth, onDragMove]);

  return {
    visible: interactiveState.current & InteractiveState.ShowDetail,
    isOverlapWithPointer,
    currentPointer,
    currentClientPointer,
    shouldPlaceOn,
  };
}
```

### `useChartLayout.tsx`

创建`scale`的地方。

```tsx
import { RefObject, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';
import { scaleLinear, extent, ScaleLinear } from 'd3';
import { useSize } from 'ahooks';
import { MovableRange } from '../algorithm/range';

export interface ChartLayoutOptions {
  yAxisLabelWidth: number
  /**
   * 在图表后面留出x项数据的空白, 默认为0
   */
  domainEnd?: number;
  mustMax?: number;
  mustMin?: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  }
}

export function useChartLayout<T>(
  svgRef: RefObject<SVGSVGElement>,
  data: T[],
  options: ChartLayoutOptions,
  dataAccessor?: (T) => number,
) {
  const { yAxisLabelWidth, padding: { left, right }, domainEnd } = options;
  const [clientWidth, setClientWidth] = useState(10000);
  const [clientHeight, setClientHeight] = useState(10000);
  const xEnd = clientWidth - right;
  const originX = left + yAxisLabelWidth;

  const [min, max] = useMemo(() => (dataAccessor ? extent(data, dataAccessor) as [number, number] : [0, 0]), [data]);

  const xScale = useMemo(
    () => scaleLinear()
      .clamp(true)
      .domain(data.length > 1 ? [0, domainEnd || (data.length - 1)] : [0, 1]) // 数据少于2个时，返回[0, 1]
      .range([originX, xEnd]),
    [clientWidth, data],
  );

  const { padding: { top, bottom } } = options;

  const yScale = (dataAccessor ? scaleLinear()
    .domain([min, max])
    .range([clientHeight - bottom, top]) : scaleLinear());

  xScale.clamp(true);

  const size = useSize(svgRef);

  useLayoutEffect(() => {
    if (svgRef.current) {
      const { clientWidth: cw, clientHeight: ch } = svgRef.current;
      setClientWidth(cw);
      setClientHeight(ch);
    }
  }, [size?.width, size?.height]);

  useLayoutEffect(() => {
    // 没有这个，pc端把窗口拖到比较小时，会画出边界
    const onResize = () => {
      if (svgRef.current) {
        const { clientWidth: cw, clientHeight: ch } = svgRef.current;
        setClientWidth(cw);
        setClientHeight(ch);
      }
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const origin = { x: originX, y: clientHeight - bottom };

  return {
    yScale,
    xScale,
    clientHeight,
    clientWidth,
    origin,
    xEnd,
    min,
    max,
  };
}

export function useBasicDiagramLayout<T>(
  svgRef: RefObject<SVGSVGElement>,
  data: T[],
  options: ChartLayoutOptions,
  dataAccessor: (T) => number,
) {
  return useChartLayout(svgRef, data, options, dataAccessor);
}

export interface MultipleYScale {
  scale: ScaleLinear<number, number>;
}

export interface MultipleYScaleMap {
  [index: string]: MultipleYScale;
}

export interface ChartConfig {
  key: string;
  options : {
    mustMin?: number;
    mustMax?: number;
    /**
     * 额外扩大函数，用于扩大最大值，防止画太到边, 不美观
     */
    extraMaxFn?: (max: number) => number;
    /**
     * 额外缩小函数，用于缩小最小值，防止画太到边, 不美观
     */
    extraMinFn?: (max: number) => number;
    extraMinFactor?: number;
    yScaleCareForKeys?: string[], // 指定要把哪些字段的值合并到一起计算yScale
  }
}

export interface MultipleChartLayoutOptions extends ChartLayoutOptions {
  activeKeys?: string[];
}

export function useMultipleChartLayout<T, C extends ChartConfig>(
  svgRef: RefObject<SVGSVGElement>,
  data: T[],
  charts: C[], // 需要计算yScale的数据对应在data中的key
  options: MultipleChartLayoutOptions,
) {
  const { padding: { top, bottom }, activeKeys = [] } = options;
  const xLayout = useChartLayout(svgRef, data, options);
  const { clientHeight, clientWidth } = xLayout;

  const activeCharts = useMemo(() => {
    if (!activeKeys?.length) {
      return charts;
    }
    return charts.filter(({ key }) => activeKeys.includes(key));
  }, [charts, activeKeys]);

  const multipleYScale: MultipleYScaleMap = useMemo(() => {
    const yScales: MultipleYScaleMap = {};

    const yScalesCache = {};
    for (let i = 0; i < activeCharts.length; i += 1) {
      const k = activeCharts[i];

      const kStr = typeof k === 'string' ? k : k.key;
      let careKeys: string[] = [];

      if (typeof k === 'string') {
        careKeys = [k];
      } else if (k.options?.yScaleCareForKeys) {
        if (!activeKeys?.length) {
          careKeys = k.options.yScaleCareForKeys;
        } else {
          careKeys = k.options.yScaleCareForKeys.filter((key) => activeKeys.includes(key));
        }
      }
      const cachedYScale = yScalesCache[careKeys.join(',')];

      // 减少重复计算
      if (cachedYScale) {
        yScales[kStr] = cachedYScale;
        // eslint-disable-next-line no-continue
        continue;
      }
      let dataForCalcYScale = [] as number[];

      for (let j = 0; j < careKeys.length; j += 1) {
        const mkey = careKeys[j];
        dataForCalcYScale = dataForCalcYScale.concat(data.map((d) => d[mkey]));
      }

      let [min, max] = extent(
        dataForCalcYScale,
      ) as [number, number];

      if (typeof k !== 'string') {
        if (k.options.mustMin !== undefined) {
          min = Math.min(k.options.mustMin, min);
        }

        if (k.options.extraMinFn) {
          min = k.options.extraMinFn(min);
        }

        if (k.options.mustMax !== undefined) {
          max = Math.max(k.options.mustMax, max);
        }

        if (k.options.extraMaxFn) {
          max = k.options.extraMaxFn(max);
        }
      }

      const yScale = scaleLinear()
        .domain([min, max])
        .range([clientHeight - bottom, top]);

      const yScaleObj = {
        scale: yScale,
        min,
        max,
      };

      yScalesCache[careKeys.join(',')] = yScaleObj;

      // 使用相同y轴的数据，应该缓存起来，只计算一次
      yScales[kStr] = yScaleObj;
    }
    return yScales;
  }, [clientHeight, bottom, top, data, activeCharts, activeKeys]);

  return {
    ...xLayout,
    origin: {
      x: xLayout.origin.x,
      y: clientHeight - bottom,
    },
    clientHeight,
    clientWidth,
    multipleYScale,
    activeCharts,
  };
}

export interface IUseScrollableLayoutOptions extends MultipleChartLayoutOptions {
  hasNextPage?: boolean;
  fetchNextPage?: () => Promise<any>;
  isFetchingNextPage?: boolean;
  /**
   * 获取下一页数据的阈值，当滚动到还剩余这里指定的n条数据时，触发获取下一页数据的回调, 默认为10
   */
  threshold?: number;
  visibleLength?: number;
}

export function useScrollableChartLayout<T, C extends ChartConfig>(
  svgRef: RefObject<SVGSVGElement>,
  data: T[],
  charts: C[], // 需要计算yScale的数据对应在data中的key
  options: IUseScrollableLayoutOptions,
) {
  const {
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    threshold = 10,
    visibleLength = 10,
  } = options;

  const rerender = useReducer(() => ({}), {})[1];
  const movableRange = useRef(new MovableRange(data, visibleLength));

  function guardRerender<R extends(...args: any[]) => any>(fn: R) {
    return (...args: Parameters<R>): ReturnType<R> => {
      const r = fn(...args);
      rerender();
      return r;
    };
  }

  const move = guardRerender((count: number) => {
    const [moved, startPos] = movableRange.current.move(count);
    if (startPos < threshold) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage?.();
      }
    }

    return moved;
  });

  const setData = guardRerender((d: T[]) => {
    movableRange.current.setData(d);
  });

  useEffect(() => {
    setData(data);
  }, [data]);

  return {
    getVisibleData() {
      return movableRange.current.visible();
    },
    move,
    ...useMultipleChartLayout(svgRef, movableRange.current.visible(), charts, options),
  };
}
```

## highlights

### React query

里面大量使用了`React query` + `axios`，达到了请求的最佳实践。

### Generocmemo

每个组件都试用`Generocmemo`包裹了下。

```tsx
import { memo } from 'react';

export const genericMemo: <T>(component: T) => T = memo;
```

这种写法有待商榷。就是给`memo`加了个类型。

### Function挂名字好调试

他的每个组件都使用的是Function，并且带着name，这样`devtools`上面的每个组件都会有名字，而不是anoymous.

```tsx
export const GCLineChart = genericMemo(function GCLineChart<T>(props: GCLineChartProps<T>) {
  const {
    data, height, options, className, detailCompoent: DetailComponent,
    charts,
    yAxisKey,
    subYAxisKey,
  } = props;
})
```

![img](https://moonlit-private.oss-cn-shenzhen.aliyuncs.com/emotional-index/CleanShot%202023-11-06%20at%2017.14.05.png)

### 使用svg组件替换d3-select

在`tsx`中直接使用`svg`先写好组件，这样用起来就和用dom一样的好弄，不用像之前那种使用`d3-select`要跟jQuery一样创建元素。

想法还比较好。

然后path再使用`d3`的函数辅助生成。

```ts
const lineGen = line<T>()
  .x((_, i) => xScale(i) + xOffset)
  .y((d) => yScale(d[dataKey]))
  .defined((d) => isDefined(d[dataKey]));

const path = lineGen(data) || '';
```

### useSize

使用ahooks的[useSize](https://ahooks.js.org/hooks/use-size)来监听dom元素的大小变化，动态获取`width`和`height`信息。

### flatMap的用法

```tsx
// use-emotional-index.tsx#53
const allPagesData = useMemo(() => [...(data?.pages ?? [])].reverse().flatMap((item) => item.data), [data?.pages]);
```

这里的`data`数据是这样的

```js
[
  {
    nextStartTime: 1,
    data: [xx, xx]
  },
  {
    nextStartTime: 2,
    data: [xx, xx]
  }
]
```

他想把`data`里面的值合并到一个新的数组里面，如果正常使用我可能会用`map` + `[...data]`这样，但是这一手`flatMap`刚好会把返回值拍平。

`flatMap()`方法返回一个新数组，但它对每个元素应用回调函数后的结果进行了一次展开（平铺）操作，最终返回的是一个扁平化的数组。

完美适应这个场景。

### onChange?.(keys)

```tsx
// area-legend-group.tsx#34
onChange?.(keys);
```

`AreaLegendGroup`组件接收一个`onChange`回调，这里就是判断有`onChange`的时候才会调用。之前都是这样写的：

```ts
if (onChange) onChange();

// 或者
onChange && onChange();
```

这个`?.`还真有点东西。

### rerender

```tsx
const rerender = useReducer(() => ({}), {})[1];
```

之前的代码用的纯js写的，放在tsx中需要出发rerender，使用了一个这样的操作。

### guardRerender

```tsx
// layout.tsx

// 这个函数应该是因为之前他写的都是纯js，没有重绘现在放在react中搞了一个包裹函数，触发重绘
function guardRerender<R extends(...args: any[]) => any>(fn: R) {
  return (...args: Parameters<R>): ReturnType<R> => {
    const r = fn(...args);
    rerender();
    return r;
  };
}

const move = guardRerender((count: number) => {
  const [moved, startPos] = movableRange.current.move(count);
  if (startPos < threshold) {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage?.();
    }
  }

  return moved;
});
```

这里还有个有意思的点是`guardRerender`的类型声明不太好写。

在上述代码中，我们使用了类型推断来推断 move 函数的类型。让我们分析一下推断的过程和原理：
1.	首先，我们定义了 move 变量并将其赋值为调用 guardRerender 函数的结果。在 guardRerender 函数的调用中，我们传入了一个匿名函数作为参数。
2.	匿名函数的参数类型是 (count: number) => boolean，这意味着它接受一个 number 类型的参数 count，并返回一个 boolean 类型的值。
3.	在 guardRerender 函数内部，泛型 R 被推断为匿名函数的类型 (count: number) => boolean。这是因为在函数调用中，传递的参数类型会与泛型 R 进行匹配，并且根据参数类型推断出 R 的具体类型。
4.	推断出的 R 类型会被用于定义返回的匿名函数的类型。因此，返回的匿名函数的类型为 (...args: Parameters<R>) => ReturnType<R>，即接受与传入函数的参数类型相同的参数，并返回与传入函数的返回类型相同的值。
5.	最后，我们将 move 变量赋值为返回的匿名函数。
通过这个过程，TypeScript 能够推断出 move 函数的类型为 (count: number) => boolean。这使得在后续的代码中，我们可以使用 move 函数并传入一个 number 类型的参数，并期望获得一个 boolean 类型的返回值，而不需要显式地指定类型。
这种类型推断的能力是 TypeScript 的一个重要特性，它使得代码的类型定义更加简洁和灵活。

### d3.nice

nice()函数用于调整比例尺的域（domain），使其更易于阅读和理解。

```ts
const data = [0.25, 0.5, 0.75, 1];

const scale = d3.scaleLinear()
  .domain([0, 1])
  .range([0, 100]);

console.log(scale.domain()); // [0, 1]

scale.nice();

console.log(scale.domain()); // [0, 1]
```
