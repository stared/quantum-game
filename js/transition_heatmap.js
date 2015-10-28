import d3 from 'd3';
import _ from 'lodash';
import {TAU} from './const';

const toggleDuraton = 1000;

const complexToPureColor = (z) => {
  if (z.re === 0 && z.im === 0) {
    return '#ffffff';
  } else {
    const angleInDegrees = (Math.atan2(z.im, z.re) * 360 / TAU + 360) % 360;
    // NOTE for color (light theme) it would be: d3.hsl(angleInDegrees, 1, 1 - r / 2)
    return d3.hsl(angleInDegrees, 1, 0.5).toString();
  }
};

const complexToOpacity = (z) => Math.sqrt(z.re * z.re + z.im * z.im);

// see http://www.fileformat.info/info/unicode/block/arrows/utf8test.htm
const prettierArrows = {
  '>': '\u21e2',  // ⇢
  '^': '\u21e1',  // ⇡
  '<': '\u21e0',  // ⇠
  'v': '\u21e3',  // ⇣
  '-': '\u2194',  // ↔
  '|': '\u2195',  // ↕
};

const prettifyBasis = (basis) => `${prettierArrows[basis[0]]}${prettierArrows[basis[1]]}`;

const basisDirPol = ['>-', '>|', '^-', '^|', '<-', '<|', 'v-', 'v|'];
const basisPolDir = ['>-', '^-', '<-', 'v-', '>|', '^|', '<|', 'v|'];

export class TransitionHeatmap {
  constructor(selector, size=300) {
    this.svg = selector.append('svg')
      .attr('class', 'transition-heatmap')
      .attr('width', size)
      .attr('height', size)
      .on('click', () => this.toggleBasis());

    this.size = size;
    this.basis = basisDirPol;
  }

  updateFromTensor(tensor) {

    const arrayContent = this.basis
      .map((outputBase) => this.basis
        .map((inputBase) => {
          const element = tensor.get(inputBase).get(outputBase) || {re: 0, im: 0};
          return {
            from: inputBase,
            to: outputBase,
            re: element.re,
            im: element.im,
          };
        })
      );

    this.update(this.basis, _.flatten(arrayContent));
  }

  toggleBasis() {

    if (this.basis === basisDirPol) {
      this.basis = basisPolDir;
    } else {
      this.basis = basisDirPol;
    }

    this.update(this.basis);

  }

  update(labels, matrixElements=null) {

    const position = _.zipObject(labels.map((d, i) => [d, i]));

    const scale = d3.scale.linear()
      .domain([-1, labels.length])
      .range([0, this.size]);

    const squareSize = scale(1) - scale(0);

    // in (top) basis labels

    this.labelIn = this.svg
      .selectAll('.label-in')
      .data(labels, (d) => d);

    this.labelIn.enter()
      .append('text')
        .attr('class', 'label-in');

    this.labelIn
      .attr('x', scale(-0.5))
      .style('text-anchor', 'middle')
      .text(prettifyBasis)
      .transition()
        .duration(toggleDuraton)
        .attr('y', (d, i) => scale(i + 0.5));

    this.labelIn.exit()
      .remove();

    // out (left) basis labels

    this.labelOut = this.svg
      .selectAll('.label-out')
      .data(labels, (d) => d);

    this.labelOut.enter()
      .append('text')
        .attr('class', 'label-out');

    this.labelOut
      .attr('y', scale(-0.5))
      .style('text-anchor', 'middle')
      .text(prettifyBasis)
      .transition()
        .duration(toggleDuraton)
        .attr('x', (d, i) => scale(i + 0.5));

    this.labelOut.exit()
      .remove();

    // matrix elements

    if (matrixElements != null) {

      this.matrixElement = this.svg
        .selectAll('.matrix-element')
        .data(matrixElements, (d) => `${d.from} ${d.to}`);

      this.matrixElement.enter()
        .append('rect')
          .attr('class', 'matrix-element');

    }

    this.matrixElement
      .attr('width', squareSize)
      .attr('height', squareSize)
      .style('fill', complexToPureColor)
      .style('opacity', complexToOpacity)
      .transition()
        .duration(toggleDuraton)
          .attr('y', (d) => scale(position[d.to]))
          .attr('x', (d) => scale(position[d.from]));

    this.matrixElement.exit()
      .remove();

  }

}
