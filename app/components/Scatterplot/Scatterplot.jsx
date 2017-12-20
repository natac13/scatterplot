import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import moment from 'moment';

import style from './style.scss';

export default class BarChartComponent extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    chartData: PropTypes.array,
    xKey: PropTypes.string,
    yKey: PropTypes.string,
  };

  constructor(props) {
    super(props);


    this.margin = { top: 25, bottom: 85, right: 25, left: 150 };
    const { chartData, xKey, yKey } = props;
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillReceiveProps(nextProps) {
    console.log('Scatterplot', nextProps);
    if (nextProps.chartData.length !== 0) {
      this.d3Render(nextProps);
    }
  }

  formatCountry = (abbr) => {
    const countryMap = {
      ITA: 'Italy',
      GER: 'Germany',
      USA: 'USA',
      COL: 'Columbia',
      ESP: 'Spain',
      SUI: 'Switzerland',
      DEN: 'Denmark',
      FRA: 'France',
      POR: 'Portugal',
      UKR: 'Ukraine',
      RUS: 'Russia',
      All: 'All Countries',
      Dop: 'Dopers',
    };
    return countryMap[abbr];
  }

  d3Render = (props) => {
    const self = this;
    const node = this.node;
    const width = props.width - this.margin.left - this.margin.right;
    const height = props.height - this.margin.bottom - this.margin.top;
    const chartData = props.chartData;

    const xExtent = d3.extent(chartData, (d) => d.Place);
    const xRange = [0, width];
    const yExtent = d3.extent(chartData, (d) => d.Seconds);
    const yRange = [height, this.margin.bottom];

    const formatTime = d3.timeFormat('%M:%S');
    const formatRaceTime = (d) => {
      const t = moment(new Date(2017, 0, 1, 0, 0, d));
      return formatTime(t);
    };

    const x = d3.scaleLinear()
      .range(xRange)
      .domain(xExtent);


    const y = d3.scaleLinear()
      .domain(yExtent)
      .range(yRange);

    const xAxis = d3.axisBottom(x).ticks(14);
    const yAxis = d3.axisLeft(y)
      .ticks(8)
      .tickFormat(formatRaceTime)
      .tickSizeInner(-width)
      .tickSizeOuter(0)
      .tickPadding(10);

    const chart = d3.select(node)
      .append('g')
        .classed(style.chart, true)
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
    /* X-axis */
    chart.append('g')
      .classed(style.xAxis, true)
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dy', '-.5em')
        .attr('y', 40)
        .attr('transform', 'rotate(-30)');
    /* X Legend */
    chart.append('text')
      .classed(style.xLegend, true)
      .text('Place')
      .attr('x', width / 2)
      .attr('y', height + this.margin.bottom)
      .attr('text-anchor', 'middle');

    /* Y-axis*/
    chart.append('g')
      .classed(style.yAxis, true)
      .call(yAxis);

    /* Y Legend */
    chart.append('text')
      .classed(style.yLegend, true)
      .text('Race Time')
      .attr('x', -height / 2)
      .attr('dy', -this.margin.left / 1.3)
      .style('text-anchor', 'end')
      .attr('transform', 'rotate(-90)');

    /* Tooltip Creation */
    const popup = d3.select(`.${style.svgWrapper}`)
      .append('div')
      .classed(style.tooltip, true)
      .style('opacity', 0);

    const mainLegend = chart.append('g')
      .classed(style.mainLegend, true)
    mainLegend
      .append('circle')
      .classed(style.didDope, true)
      .attr('cx', width - this.margin.right)
      .attr('cy', height / 2)
      .attr('r', 10)
      .attr('fill', '#FF672E')
    mainLegend
      .append('text')
        .text('Doper')
        .attr('text-anchor', 'end')
        .attr('x', x(33.25))
        .attr('y', y(2311))
        .attr('fill', 'white')
    mainLegend
      .append('text')
        .text('Non-Doper')
        .attr('text-anchor', 'end')
        .attr('x', x(33.25))
        .attr('y', y(2302))
        .attr('fill', 'white')
    mainLegend
      .append('circle')
      .classed(style.noDope, true)
      .attr('cx', width - this.margin.right)
      .attr('cy', (height / 2) + 30)
      .attr('r', 10)
      .attr('fill', '#0096A4')

    /* Populate Chart with Data */
    chart.selectAll(`.${style.plots}`)
      .data(chartData)
      .enter()
      .append('circle')
        .classed(style.plots, true)
        .attr('cx', (d) => x(d.Place))
        .attr('cy', (d) => y(d.Seconds))
        .attr('r', 7)
        .attr('fill', (d) => {
          if (!d.Doping) {
            return '#0096A4';
          }
          return '#FF672E';
        })
        .on('mouseover', function mouseOver(d) {
          d3.select(this)
            .raise()
            .transition()
            .duration(250)
            .attr('opacity', 0.5);

          popup
            .transition()
            .duration(50)
            .style('opacity', 0.9);
          popup
            .style('left', `${d3.event.pageX + 35}px`)
            .style('top', `${d3.event.pageY - 75}px`)
            .html(`<p>${d.Year} - ${d.Name}</p>
                   <p>${self.formatCountry(d.Nationality)}</p>
                   <p>Time - ${d.Time}</p>
                   <p>${d.Doping}</p>`);
        })
        .on('mouseout', function mouseOut(d) {
          d3.select(this)
            .transition()
            .duration(250)
            .attr('opacity', 1);
          popup
            .transition()
            .duration(800)
            .style('opacity', 0);
        });

    const countries = d3.nest()
      .key((d) => d.Nationality)
      .rollup((v) => v.length)
      .entries(chartData);
    /* Add All Selection to Countries List */
    countries
      .unshift({ key: 'Dop', value: 7 });
    countries
      .unshift({ key: 'All', value: d3.sum(countries, (d) => d.value) - 7 })
    console.log('countries', countries);


    const selector = d3.select(`.${style.selecting}`);
    selector
      .selectAll('option')
      .data(countries)
      .enter()
        .append('option')
        .text((d) => `${self.formatCountry(d.key)} - ${d.value}`)
        .attr('value', (d) => d.key);
    selector
      .on('change', () => {
        console.log('changeing')
        d3.selectAll(`.${style.plots}`)
          .attr('opacity', 1);
        const countryAbbr = selector.property('value')
        console.log('countryAbbr', countryAbbr);
        if (countryAbbr === 'Dop') {
          return d3.selectAll(`.${style.plots}`)
            .filter((d) => !d.Doping)
            .attr('opacity', 0.1);
        }
        if (countryAbbr !== 'All') {
          return d3.selectAll(`.${style.plots}`)
            .filter((d) => d.Nationality !== countryAbbr)
            .attr('opacity', 0.1);
        }
      });

    chart.exit().remove();
  }

  render() {
    return (
      <div className={style.svgWrapper}>
        <select className={style.selecting}></select>
        <svg
          className={style.svg}
          width={this.props.width} height={this.props.height}
          ref={(node) => this.node = node}
        >
        </svg>
      </div>
    );
  }
}
