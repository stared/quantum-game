import d3 from 'd3';
import _ from 'lodash';

import {tileSize, absorptionDuration} from './config';

const barHeight = tileSize / 3;
const barMargin = (tileSize - barHeight) / 2;
const barWidth = 2 * tileSize;

const percentStr = (probability) =>
  (100 * probability).toFixed(1)

export class DetectionBar {
  constructor(svg) {
    this.g = svg.append('g')
      .attr('class', 'detection-bar');
    this.draw();
  }

  draw() {

    this.g.append('rect')
    .attr('x', -barHeight / 2)
    .attr('y', barMargin - barHeight / 2)
    .attr('width', 5 * barWidth + barHeight)
    .attr('height', 2 * barHeight)
    .attr('rx', 5)
    .attr('ry', 5)
    .style('fill', 'black')
    .style('opacity', 0.7);

    // percent
    this.percentG = this.g.append('g');

    this.percentScale = d3.scale.linear()
      .domain([0, 1])
      .range([0, barWidth]);


    this.percentRequired = this.percentG.append('rect')
      .attr('x', 0)
      .attr('y', barMargin)
      .attr('width', 0)
      .attr('height', barHeight)
      .style('fill', '#a00')
      .style('stroke', 'none');

    this.percentActual = this.percentG.append('rect')
      .attr('x', 0)
      .attr('y', barMargin)
      .attr('width', 0)
      .attr('height', barHeight)
      .style('fill', '#0a0')
      .style('stroke', 'none');

    // border
    this.percentG.append('rect')
      .attr('x', 0)
      .attr('y', barMargin)
      .attr('width', barWidth)
      .attr('height', barHeight)
      .style('fill', 'none')
      .style('stroke', '#a00')
      .style('stroke-width', '4px');

    this.percentText = this.percentG.append('text')
      .attr('x', barWidth + barMargin)
      .attr('y', barMargin + barHeight / 2)
      .style('font-size', 24)
      .style('fill', 'white')
      .style('dominant-baseline', 'central');

    // count group
    this.countG = this.g.append('g')
      .attr('transform', `translate(${6 * tileSize},0)`);

    this.detectorsText = this.countG.append('text')
      .attr('x', barWidth)
      .attr('y', barMargin + barHeight / 2)
      .style('font-size', 24)
      .style('fill', 'white')
      .style('dominant-baseline', 'central')
      .text('detectors');

  }

  updateRequirements(probability, count) {

    this.requiredProbability = probability;
    this.requiredCount = count;

    this.percentRequired
      .attr('width', this.percentScale(probability));

    this.counts = _.range(count);
    this.countBoxes = this.countG
      .selectAll('.count-box')
      .data(this.counts);

    this.countBoxes.enter()
      .append('rect')
      .attr('class', 'count-box')
      .attr('x', (d, i) => barHeight * i)
      .attr('y', barMargin)
      .attr('width', barHeight / 2)
      .attr('height', barHeight)
      .style('fill', '#a00');

    this.countBoxes.exit()
      .remove();

    this.detectorsText
      .attr('x', barHeight * count - barHeight / 2 + barMargin);

    this.updateActual(0, 0);
  }

  updateActual(probability, count) {

    this.percentActual.transition().duration(absorptionDuration)
      .attr('width', this.percentScale(probability));

    this.percentText
      .text(`${percentStr(probability)}% out of ${percentStr(this.requiredProbability)}% detection in`);

    this.countBoxes.transition().duration(absorptionDuration)
      .style('fill', (d, i) => count > i ? '#0a0' : '#a00');

  }

}
