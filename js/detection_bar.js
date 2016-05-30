import d3 from 'd3';
import _ from 'lodash';

import {tileSize, absorptionDuration} from './config';

const barHeight = tileSize / 3;
const barWidth = 2 * tileSize;
const textMargin = 10;

const percentStr = (probability) =>
  (100 * probability).toFixed(1)

export class DetectionBar {
  constructor(svg) {
    this.g = svg.append('g')
      .attr('class', 'detection-bar');
    this.draw();
  }

  draw() {

    //
    // percent group
    //
    this.percentG = this.g.append('g');

    this.percentScale = d3.scale.linear()
      .domain([0, 1])
      .range([0, barWidth]);

    this.percentActual = this.percentG.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 0)
      .attr('height', barHeight)
      .style('fill', '#0a0')
      .style('stroke', 'none');

    this.percentRequired = this.percentG.append('rect')
      .attr('class', 'detection-bar-box-stroke')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 0)
      .attr('height', barHeight);

    // border
    this.percentG.append('rect')
      .attr('class', 'detection-bar-box-stroke')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', barWidth)
      .attr('height', barHeight)
      .style('fill', 'none');

    this.percentText = this.percentG.append('text')
      .attr('class', 'detection-bar-text')
      .attr('x', barWidth + textMargin)
      .attr('y', barHeight / 2);

    //
    // count group
    //
    this.countG = this.g.append('g')
      .attr('transform', `translate(${7 * tileSize},0)`);

    this.detectorsText = this.countG.append('text')
      .attr('class', 'detection-bar-text')
      .attr('y', barHeight / 2)
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
      .attr('class', 'count-box detection-bar-box-stroke')
      .attr('x', (d, i) => barHeight * i)
      .attr('y', 0)
      .attr('width', barHeight / 2)
      .attr('height', barHeight)
      .style('fill', '#fff')
      .style('fill-opacity', 0.2);

    this.countBoxes.exit()
      .remove();

    this.detectorsText
      .attr('x', barHeight * count - barHeight / 2 + textMargin);

    this.updateActual(0, 0);
  }

  updateActual(probability, count) {

    this.percentActual.transition().duration(absorptionDuration)
      .attr('width', this.percentScale(probability));

    this.percentText
      .text(`${percentStr(probability)}% (out of ${percentStr(this.requiredProbability)}%) detection`);

    this.countBoxes.transition().duration(absorptionDuration)
      .style('fill', (d, i) => count > i ? '#0a0' : '#fff')
      .style('fill-opacity', (d, i) => count > i ? 1 : 0.2);

  }

}
