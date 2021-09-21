---
slug: "/blog/travel-of-learning-d3-v6"
title: "d3.js 图表绘制练习"
date: "2021-09-13 16:57:55"
brief: "利用 d3.js v6 版本进行一些基本的图表绘制。"
tag: "d3"
---



### 相关学习链接

- D3.js官网 [https://d3js.org](https://d3js.org) 
- D3.js实例 [https://observablehq.com/@d3](https://observablehq.com/@d3) 



### 散点图

实现思路：

1. x、y轴都使用 `scaleLinear` 比例尺映射数据

2. 散点使用 `<circle>` ，线使用 `<line>`  

3. 鼠标的交互需要对这些散点添加 `mouseenter` 和 `mouseleave` 事件，事件触发时改变 `circle` 元素的半径 `r` 



#### 基础散点图

![d3-scatter-simple.gif](/images/d3-scatter-simple.gif)

```jsx
import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { useWindowResize } from '../../../hooks/resize';

const option = {
  grid: {
    top: 40,
    right: 30,
    bottom: 40,
    left: 50,
  },
  color: '#5470c6',
  symbolSize: 10,
};

function ScatterSimple(props) {
  const chartRef = useRef(null);

  const drawChart = useCallback(() => {
    if (!chartRef.current) return;
    const data = props.data || [],
      r = (props.symbolSize || option.symbolSize) / 2;
    const margin = props.grid
      ? Object.assign({}, option.grid, props.grid)
      : option.grid;

    const $p = chartRef.current.parentNode;
    const width = props.width ? props.width : $p.offsetWidth,
      height = props.height ? props.height : $p.offsetHeight;

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d[0])])
      .nice()
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d[1])])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // 方法挂载供外部调用
    chartRef.current.xScale = x;
    chartRef.current.yScale = y;

    // 图表绘制
    const xAxis = (g) =>
      g
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .style('color', '#6E7079')
        .call(d3.axisBottom(x).ticks(width / 80))
        .call((g) => g.selectAll('.tick text').style('font-size', 12))
        .call((g) =>
          g
            .selectAll('.tick line')
            .clone()
            .attr('y2', -(height - margin.top - margin.bottom))
            .attr('stroke', '#E0E6F1')
            .style('stroke-opacity', (d) => (d === 0 ? 0 : 1))
        );

    const yAxis = (g) =>
      g
        .attr('transform', `translate(${margin.left}, 0)`)
        .style('color', '#6E7079')
        .call(d3.axisLeft(y))
        .call((g) => g.selectAll('.tick text').style('font-size', 12))
        .call((g) =>
          g
            .selectAll('.tick line')
            .clone()
            .attr('x2', width - margin.right - margin.left)
            .attr('stroke', '#E0E6F1')
            .style('stroke-opacity', (d) => (d === 0 ? 0 : 1))
        );

    const svg = d3
      .select(chartRef.current)
      .select('.chart-svg')
      .attr('viewBox', `0 0 ${width} ${height}`);

    svg.selectAll('*').remove();

    svg.append('g').attr('class', 'x-axis').call(xAxis);
    svg.append('g').attr('class', 'y-axis').call(yAxis);
    svg
      .append('g')
      .attr('class', '.dots')
      .style('fill', option.color)
      .call((g) =>
        g
          .selectAll('circle')
          .data(data)
          .join(
            (enter) =>
              enter
                .append('circle')
                .attr('class', 'dot')
                .attr('cx', (d) => x(d[0]))
                .attr('cy', (d) => y(d[1]))
                .attr('r', 0),
            (update) => update,
            (exit) => exit.remove()
          )
          .style('opacity', 0.8)
          .style('cursor', 'pointer')
      )
      .call((g) =>
        g
          .selectAll('circle')
          .transition()
          .duration(750)
          .ease(d3.easeCubicInOut)
          .attr('r', r)
      )
      .call((g) =>
        g
          .selectAll('circle')
          .on('mouseenter', (event) => {
            d3.select(event.target)
              .style('opacity', 0.75)
              .transition()
              .duration(200)
              .ease(d3.easeLinear)
              .attr('r', r * 1.1);
          })
          .on('mouseleave', (event) => {
            d3.select(event.target)
              .style('opacity', 0.8)
              .transition()
              .duration(200)
              .ease(d3.easeLinear)
              .attr('r', r);
          })
      );
  }, [props.grid, props.data, props.symbolSize, props.width, props.height]);

  useEffect(() => {
    drawChart();
  }, [drawChart]);

  useWindowResize(chartRef, drawChart);

  return (
    <div className="chart-wrapper" ref={chartRef}>
      <svg className="chart-svg"></svg>
    </div>
  );
}

export default ScatterSimple;
```



#### Anscombe's quartet

![d3-scatter-anscombe-quartet.gif](/images/d3-scatter-anscombe-quartet.gif)



#### 数据聚合

![d3-scatter-clustering.gif](/images/d3-scatter-clustering.gif)

1. 数值提示框使用 html 元素实现
2. 左侧可交互的图例也使用 html 元素实现

```jsx
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import ecStat from 'echarts-stat';
import { useWindowResize } from '../../../hooks/resize';
import './index.scss';

const option = {
  grid: {
    top: 40,
    right: 30,
    bottom: 40,
    left: 120,
  },
  colors: [
    '#37A2DA',
    '#e06343',
    '#37a354',
    '#b55dba',
    '#b5bd48',
    '#8378EA',
    '#96BFFF',
  ],
  symbolSize: 10,
};

const CLUSTER_COUNT = 6;
const DIENSIION_CLUSTER_INDEX = 2;

function ScatterClustering(props) {
  const chartRef = useRef(null);
  const tooltipRef = useRef(null);
  const [legendData, setLegendData] = useState([]);
  const [legendStatus, setLegendStatus] = useState([]);

  const legendDataReverse = useMemo(
    () => [...legendData].reverse(),
    [legendData]
  );

  useEffect(() => {
    const pieces = [];
    for (let i = 0, len = CLUSTER_COUNT; i < len; i++) {
      pieces.push({
        value: i,
        label: 'cluster ' + i,
        color: option.colors[i],
      });
    }
    setLegendData(pieces);
    setLegendStatus(Array(pieces.length).fill(true));
  }, []);

  useEffect(() => {
    chartRef.current.showTooltip = (
      content,
      x,
      y,
      r,
      colorIndex,
      colorString
    ) => {
      const color = legendStatus[colorIndex] ? colorString : '#fff';

      const tooltipEl = d3
        .select(tooltipRef.current)
        .classed('hidden', false)
        .classed('show', true)
        .style('border-color', color)
        .call((div) =>
          div
            .select('.tooltip__triangle')
            .style('border-bottom-color', color)
            .style('border-right-color', color)
        )
        .call((div) => div.select('.tooltip__txt').text(content))
        .call((div) =>
          div.select('.tooltip__symbol').style('background-color', color)
        );

      const w = tooltipRef.current.offsetWidth,
        h = tooltipRef.current.offsetHeight;

      tooltipEl.style(
        'transform',
        `translate3d(${x - w / 2}px,${y - r - 10 - h}px,0px)`
      );
    };

    chartRef.current.hideTooltip = () => {
      d3.select(tooltipRef.current)
        .classed('show', false)
        .classed('hidden', true);
    };
  }, [legendStatus]);

  const drawChart = useCallback(() => {
    if (!chartRef.current) return;

    const data = props.data || [],
      r = (props.symbolSize || option.symbolSize) / 2;
    const margin = props.grid
      ? Object.assign({}, option.grid, props.grid)
      : option.grid;

    const $p = chartRef.current.parentNode;
    const width = props.width ? props.width : $p.offsetWidth,
      height = props.height ? props.height : $p.offsetHeight;

    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d[0]))
      .nice()
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d[1]))
      .nice()
      .range([height - margin.bottom, margin.top]);

    const color = d3
      .scaleOrdinal()
      .domain(legendData.map((item) => item.value))
      .range(option.colors);

    // 方法挂载供外部调用
    chartRef.current.xScale = x;
    chartRef.current.yScale = y;
    chartRef.current.colorScale = color;
    chartRef.current.dotRadius = r;

    // 图表绘制
    const xAxis = (g) =>
      g
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .style('color', '#6E7079')
        .call(d3.axisBottom(x))
        .call((g) => g.selectAll('.tick text').style('font-size', 12))
        .call((g) => g.selectAll('.tick line').classed('tick-line', true))
        .call((g) =>
          g
            .selectAll('.tick-line')
            .style('stroke-opacity', 0)
            .clone()
            .attr('class', 'split-line')
            .attr('y2', -(height - margin.top - margin.bottom))
            .style('stroke', (d) => (d === 0 ? '#6E7079' : '#E0E6F1'))
            .style('stroke-opacity', 1)
        )
        .call((g) => g.select('.domain').remove())
        .call((g) =>
          g
            .selectAll('.tick')
            .append('line')
            .attr('class', 'cross-tick')
            .attr('y2', 6)
            .style('stroke', 'currentColor')
            .attr('transform', `translate(0, ${-y(0) + margin.top})`)
        );

    const yAxis = (g) =>
      g
        .attr('transform', `translate(${margin.left}, 0)`)
        .style('color', '#6E7079')
        .call(d3.axisLeft(y))
        .call((g) => g.selectAll('.tick text').style('font-size', 12))
        .call((g) =>
          g
            .selectAll('.tick line')
            .attr('class', 'tick-line')
            .style('stroke-opacity', 0)
            .clone()
            .attr('class', 'split-line')
            .attr('x2', width - margin.right - margin.left)
            .attr('stroke', (d) => (d === 0 ? '#6E7079' : '#E0E6F1'))
            .style('stroke-opacity', 1)
        )
        .call((g) => g.select('.domain').remove())
        .call((g) =>
          g
            .selectAll('.tick')
            .append('line')
            .attr('class', 'cross-tick')
            .attr('x2', -6)
            .style('stroke', 'currentColor')
            .attr('transform', `translate(${x(0) - margin.left}, 0)`)
        );

    const svg = d3
      .select(chartRef.current)
      .select('.chart-svg')
      .attr('viewBox', `0 0 ${width} ${height}`);

    svg.selectAll('*').remove();

    svg.append('g').attr('class', 'x-axis').call(xAxis);
    svg.append('g').attr('class', 'y-axis').call(yAxis);

    const result = ecStat.clustering.hierarchicalKMeans(data, {
      clusterCount: CLUSTER_COUNT,
      outputType: 'single',
      outputClusterIndexDimension: DIENSIION_CLUSTER_INDEX,
    });

    svg
      .append('g')
      .attr('class', 'dots')
      .call((g) =>
        g
          .selectAll('circle')
          .data(result.data)
          .join(
            (enter) =>
              enter
                .append('circle')
                .attr('class', (d) => `dot dot-${d[2]}`)
                .attr('cx', (d) => x(d[0]))
                .attr('cy', (d) => y(d[1]))
                .attr('r', 0),
            (update) => update,
            (exit) => exit.remove()
          )
          .style('fill', (d) => color(d[2]))
          .style('stroke', '#555')
          .style('opacity', 0.8)
          .style('cursor', 'pointer')
      )
      .call((g) =>
        g
          .selectAll('circle')
          .transition()
          .duration(750)
          .ease(d3.easeCubicInOut)
          .attr('r', r)
      )
      .call((g) =>
        g
          .selectAll('circle')
          .on('mouseenter', (event, d) => {
            d3.select(event.target)
              .style('opacity', 0.75)
              .transition()
              .duration(200)
              .ease(d3.easeLinear)
              .attr('r', r * 1.1);

            chartRef.current.showTooltip(
              `${d[0]}  ${d[1]}`,
              x(d[0]),
              y(d[1]),
              r,
              d[2],
              color(d[2])
            );
          })
          .on('mouseleave', (event) => {
            d3.select(event.target)
              .style('opacity', 0.8)
              .transition()
              .duration(200)
              .ease(d3.easeLinear)
              .attr('r', r);
            chartRef.current.hideTooltip();
          })
      );
  }, [
    props.grid,
    props.width,
    props.height,
    props.symbolSize,
    props.data,
    legendData,
  ]);

  useEffect(() => {
    drawChart();
  }, [drawChart]);

  useWindowResize(chartRef, drawChart);

  const onToggleLegendItem = (val) => {
    legendStatus[val] = !legendStatus[val];
    setLegendStatus([...legendStatus]);

    const svg = d3.select(chartRef.current).select('.chart-svg');
    svg
      .selectAll(`.dot.dot-${val}`)
      .style(
        'fill',
        legendStatus[val] ? chartRef.current.colorScale(val) : '#fff'
      );
  };

  const onLegendItemEnter = (val) => {
    const svg = d3.select(chartRef.current).select('.chart-svg');
    svg
      .selectAll(`.dot.dot-${val}`)
      .style('opacity', 0.75)
      .transition()
      .duration(200)
      .ease(d3.easeLinear)
      .attr('r', chartRef.current.dotRadius * 1.1);
  };

  const onLegendItemLeave = (val) => {
    const svg = d3.select(chartRef.current).select('.chart-svg');
    svg
      .selectAll(`.dot.dot-${val}`)
      .style('opacity', 0.8)
      .transition()
      .duration(200)
      .ease(d3.easeLinear)
      .attr('r', chartRef.current.dotRadius);
  };

  return (
    <div className="chart-wrapper scatter-clustering" ref={chartRef}>
      <div className="legend">
        {legendData.length > 0 &&
          legendDataReverse.map((item) => {
            const isActive = legendStatus[item.value];

            return (
              <div
                key={item.value}
                className={'legend-item' + (isActive ? '' : ' inactive')}
                onClick={() => onToggleLegendItem(item.value)}
                onMouseEnter={() => onLegendItemEnter(item.value)}
                onMouseLeave={() => onLegendItemLeave(item.value)}
              >
                <span
                  className="legend-item__symbol"
                  style={{ backgroundColor: isActive ? item.color : '#fff' }}
                ></span>
                <span>{item.label}</span>
              </div>
            );
          })}
      </div>
      <svg className="chart-svg"></svg>
      <div className="tooltip hidden" ref={tooltipRef}>
        <div className="tooltip__content">
          <span className="tooltip__symbol"></span>
          <span className="tooltip__txt"></span>
        </div>
        <div className="tooltip__triangle"></div>
      </div>
    </div>
  );
}

export default ScatterClustering;
```



#### 涟漪特效散点图

![d3-scatter-effect.gif](/images/d3-scatter-effect.gif)

动画效果基于 css3 实现



### 柱状图

实现思路：

1. x、y轴的比例尺根据需求选择。类目轴使用 `scaleBand` ，数值轴使用 `scaleLinear` 
2. 条形使用 `<rect>` 



#### 基础柱状图

![d3-bar-simple.gif](/images/d3-bar-simple.gif)

```jsx
import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { useWindowResize } from '../../../hooks/resize';

const option = {
  grid: {
    top: 40,
    right: 30,
    bottom: 40,
    left: 50,
  },
  color: '#5470c6',
  yAxis: {
    axisTick: {
      length: 5,
    },
  },
};

function BarSimple(props) {
  const chartRef = useRef(null);

  const drawChart = useCallback(() => {
    if (!chartRef.current) return;

    const data = props.data || [];
    const color = props.color || option.color;
    const margin = props.grid
      ? Object.assign({}, option.grid, props.grid)
      : option.grid;

    const $p = chartRef.current.parentNode;
    const width = props.width ? props.width : $p.offsetWidth,
      height = props.height ? props.height : $p.offsetHeight;

    const xAxisData = data.map((item) => item.day);

    const x = d3
      .scaleBand()
      .domain(xAxisData)
      .range([margin.left, width - margin.right])
      .paddingOuter(0.2)
      .paddingInner(0.4);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // 方法挂载供外部调用
    chartRef.current.xScale = x;
    chartRef.current.yScale = y;

    // 图表绘制
    const xAxis = (g) =>
      g
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .style('color', '#6E7079')
        .call(d3.axisBottom(x).tickSize(option.yAxis.axisTick.length))
        .call((g) => g.selectAll('.tick text').style('font-size', 12))
        .call((g) => g.selectAll('.tick line').style('stroke-opacity', 0));

    const yAxis = (g) =>
      g
        .attr('transform', `translate(${margin.left}, 0)`)
        .style('color', '#6E7079')
        .call(d3.axisLeft(y).tickSizeOuter(0).tickSizeInner(4))
        .call((g) => g.selectAll('.tick text').style('font-size', 12))
        .call((g) =>
          g
            .selectAll('.tick line')
            .attr('class', 'tick-line')
            .clone()
            .attr('class', 'split-line')
            .attr('x2', width - margin.right - margin.left)
            .attr('stroke', '#E0E6F1')
            .style('stroke-opacity', (d) => (d === 0 ? 0 : 1))
        )
        .call((g) => g.selectAll('.tick-line').style('stroke-opacity', 0))
        .call((g) => g.selectAll('.domain').style('stroke-opacity', 0));

    const svg = d3
      .select(chartRef.current)
      .select('.chart-svg')
      .attr('viewBox', `0 0 ${width} ${height}`);

    svg.selectAll('*').remove();

    svg.append('g').attr('class', 'x-axis').call(xAxis);
    svg.append('g').attr('class', 'y-axis').call(yAxis);

    // x axis tick 与文本的对齐方式
    svg
      .append('g')
      .attr('class', 'x-axis-line')
      .call((g) =>
        g.attr(
          'transform',
          `translate(${margin.left}, ${height - margin.bottom})`
        )
      )
      .call((g) =>
        g
          .selectAll('line')
          .data(d3.range(xAxisData.length - 1))
          .join(
            (enter) =>
              enter
                .append('line')
                .attr('class', 'tick')
                .attr(
                  'x1',
                  (d) =>
                    ((width - margin.right - margin.left) / xAxisData.length) *
                    (d + 1)
                )
                .attr('y1', 0)
                .attr(
                  'x2',
                  (d) =>
                    ((width - margin.right - margin.left) / xAxisData.length) *
                    (d + 1)
                )
                .attr('y2', option.yAxis.axisTick.length),
            (update) => update,
            (exit) => exit.remove()
          )
          .style('stroke', '#6E7079')
      );

    svg
      .append('g')
      .attr('class', 'bars')
      .style('color', color)
      .call((g) =>
        g
          .selectAll('rect')
          .data(data)
          .join('rect')
          .attr('x', (d) => x(d.day))
          .attr('y', y(0))
          .attr('width', x.bandwidth())
          .attr('height', 0)
          .style('fill', 'currentColor')
          .style('cursor', 'pointer')
      )
      .call((g) =>
        g
          .selectAll('rect')
          .transition()
          .duration(1000)
          .ease(d3.easeCubicInOut)
          .attr('y', (d) => y(d.value))
          .attr('height', (d) => y(0) - y(d.value))
      )
      .call((g) =>
        g
          .selectAll('rect')
          .on('mouseenter', (event) => {
            d3.select(event.target).style('fill', '#708bdc');
          })
          .on('mouseleave', (event) => {
            d3.select(event.target).style('fill', 'currentColor');
          })
      );
  }, [props.data, props.grid, props.width, props.height, props.color]);

  useEffect(() => {
    drawChart();
  }, [drawChart]);

  useWindowResize(chartRef, drawChart);

  return (
    <div className="chart-wrapper" ref={chartRef}>
      <svg className="chart-svg"></svg>
    </div>
  );
}

export default BarSimple;
```



#### 带背景色的柱状图

![d3-bar-background.gif](/images/d3-bar-background.gif)



#### 坐标轴刻度与标签对齐

![d3-tick-align.gif](/images/d3-tick-align.gif)



#### 横向的条形图

![d3-bar-y-category.gif](/images/d3-bar-y-category.gif)



#### 数据集

![d3-bar-dataset-simple.gif](/images/d3-bar-dataset-simple.gif)



### 折线图

#### 基础折线图

![d3-line-simple.png](/images/d3-line-simple.png)

```jsx
import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { useWindowResize } from '../../../hooks/resize';
import chartUtil from '../../../utils/chartUtil';

const option = {
  grid: {
    top: 40,
    right: 30,
    bottom: 40,
    left: 50,
  },
  color: '#5470c6',
  symbolSize: 4,
  yAxis: {
    axisTick: {
      length: 5,
    },
  },
};

function LineSimple(props) {
  const chartRef = useRef(null);

  const drawChart = useCallback(() => {
    if (!chartRef.current) return;

    const data = props.data || [];
    const color = props.color || option.color;
    const r = (props.symbolSize || option.symbolSize) / 2;
    const margin = props.grid
      ? Object.assign({}, option.grid, props.grid)
      : option.grid;

    const $p = chartRef.current.parentNode;
    const width = props.width ? props.width : $p.offsetWidth,
      height = props.height ? props.height : $p.offsetHeight;

    const xAxisData = data.map((item) => item.day);

    const x = d3
      .scaleBand()
      .domain(xAxisData)
      .range([margin.left, width - margin.right])
      .paddingOuter(0.5)
      .paddingInner(1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const line = d3
      .line()
      .defined((d) => !Number.isNaN(d.value))
      .x((d) => x(d.day))
      .y((d) => y(d.value));

    // 方法挂载供外部调用
    chartRef.current.xScale = x;
    chartRef.current.yScale = y;

    // 图表绘制
    const xAxis = (g) =>
      g
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .style('color', '#6E7079')
        .call(d3.axisBottom(x).tickSize(option.yAxis.axisTick.length))
        .call((g) => g.selectAll('.tick text').style('font-size', 12))
        .call((g) => g.selectAll('.tick line').style('stroke-opacity', 0));

    const yAxis = (g) =>
      g
        .attr('transform', `translate(${margin.left}, 0)`)
        .style('color', '#6E7079')
        .call(d3.axisLeft(y).tickSizeOuter(0).tickSizeInner(4))
        .call((g) => g.selectAll('.tick text').style('font-size', 12))
        .call((g) =>
          g
            .selectAll('.tick line')
            .attr('class', 'tick-line')
            .clone()
            .attr('class', 'split-line')
            .attr('x2', width - margin.right - margin.left)
            .attr('stroke', '#E0E6F1')
            .style('stroke-opacity', (d) => (d === 0 ? 0 : 1))
        )
        .call((g) => g.selectAll('.tick-line').style('stroke-opacity', 0))
        .call((g) => g.selectAll('.domain').style('stroke-opacity', 0));

    const svg = d3
      .select(chartRef.current)
      .select('.chart-svg')
      .attr('viewBox', `0 0 ${width} ${height}`);

    svg.selectAll('*').remove();

    svg.append('g').attr('class', 'x-axis').call(xAxis);
    svg.append('g').attr('class', 'y-axis').call(yAxis);

    // x axis tick 与文本的对齐方式
    svg
      .append('g')
      .attr('class', 'x-axis-line')
      .call((g) =>
        g.attr(
          'transform',
          `translate(${margin.left}, ${height - margin.bottom})`
        )
      )
      .call((g) =>
        g
          .selectAll('line')
          .data(d3.range(xAxisData.length - 1))
          .join(
            (enter) =>
              enter
                .append('line')
                .attr('class', 'tick')
                .attr(
                  'x1',
                  (d) =>
                    ((width - margin.right - margin.left) / xAxisData.length) *
                    (d + 1)
                )
                .attr('y1', 0)
                .attr(
                  'x2',
                  (d) =>
                    ((width - margin.right - margin.left) / xAxisData.length) *
                    (d + 1)
                )
                .attr('y2', option.yAxis.axisTick.length),
            (update) => update,
            (exit) => exit.remove()
          )
          .style('stroke', '#6E7079')
      );
      
    // line
    const l = chartUtil.getLength(line(data));
    svg
      .append('g')
      .attr('class', 'line')
      .style('color', color)
      .call((g) =>
        g
          .append('path')
          .datum(data)
          .attr('fill', 'none')
          .attr('stroke-dasharray', `0,${l}`)
          .attr('d', line)
          .attr('stroke-linejoin', 'round')
          .attr('stroke-linecap', 'round')
          .style('stroke-width', 2)
          .style('stroke', 'currentColor')
          .style('cursor', 'pointer')
          .transition()
          .duration(1000)
          .ease(d3.easeLinear)
          .attr('stroke-dasharray', `${l},${l}`)
      )
      .call((g) =>
        g
          .select('path')
          .on('mouseenter', (event) => {
            d3.select(event.target)
              .transition()
              .duration(300)
              .ease(d3.easeCubicInOut)
              .style('stroke-width', 3);
          })
          .on('mouseleave', (event) => {
            d3.select(event.target)
              .transition()
              .duration(300)
              .ease(d3.easeCubicInOut)
              .style('stroke-width', 2);
          })
      );

    svg
      .append('g')
      .attr('class', 'dots')
      .style('fill', '#fff')
      .style('stroke', color)
      .style('stroke-width', 2)
      .call((g) =>
        g
          .selectAll('circle')
          .data(data)
          .join('circle')
          .attr('cx', (d) => x(d.day))
          .attr('cy', (d) => y(d.value))
          .attr('r', r)
          .style('cursor', 'pointer')
          .on('mouseenter', (event) => {
            d3.select(event.target)
              .transition()
              .duration(300)
              .ease(d3.easeCubicInOut)
              .attr('r', r * 1.5);
            svg
              .select('.line path')
              .transition()
              .duration(300)
              .ease(d3.easeCubicInOut)
              .style('stroke-width', 3);
          })
          .on('mouseleave', (event) => {
            d3.select(event.target)
              .transition()
              .duration(300)
              .ease(d3.easeCubicInOut)
              .attr('r', r);
            svg
              .select('.line path')
              .transition()
              .duration(300)
              .ease(d3.easeCubicInOut)
              .style('stroke-width', 2);
          })
      );
  }, [
    props.data,
    props.grid,
    props.width,
    props.height,
    props.color,
    props.symbolSize,
  ]);

  useEffect(() => {
    drawChart();
  }, [drawChart]);

  useWindowResize(chartRef, drawChart);

  return (
    <div className="chart-wrapper" ref={chartRef}>
      <svg className="chart-svg"></svg>
    </div>
  );
}

export default LineSimple;
```



#### 基础平滑折线图

![d3-line-smooth.gif](/images/d3-line-smooth.gif)



#### 基础面积图

![d3-line-area.png](/images/d3-line-area.png)
