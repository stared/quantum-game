import d3 from 'd3';
import _ from 'lodash';
import {TAU, EPSILON} from './const';
import {Tooltip} from './tooltip';

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
  constructor(selectorSvg, selectorForTooltip, size=200) {
    this.g = selectorSvg.append('g')
      .attr('class', 'transition-heatmap')
      .on('click', () => this.toggleBasis());

    this.tooltip = new Tooltip(selectorForTooltip);
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

    const position = _.fromPairs(labels.map((d, i) => [d, i]));

    const scale = d3.scale.linear()
      .domain([-1, labels.length])
      .range([0, this.size]);

    const squareSize = scale(1) - scale(0);

    // in (top) basis labels

    this.labelIn = this.g
      .selectAll('.label-in')
      .data(labels, (d) => d);

    this.labelIn.enter()
      .append('text')
        .attr('class', 'label-in');

    this.labelIn
    .attr('y', scale(-0.5))
    .style('text-anchor', 'middle')
    .text(prettifyBasis)
    .transition()
      .duration(toggleDuraton)
      .attr('x', (d, i) => scale(i + 0.5))
      .attr('dy', '0.5em');

    this.labelIn.exit()
      .remove();

    // out (left) basis labels

    this.labelOut = this.g
      .selectAll('.label-out')
      .data(labels, (d) => d);

    this.labelOut.enter()
      .append('text')
        .attr('class', 'label-out');

    this.labelOut
      .attr('x', scale(-0.5))
      .style('text-anchor', 'middle')
      .text(prettifyBasis)
      .transition()
        .duration(toggleDuraton)
        .attr('y', (d, i) => scale(i + 0.5))
        .attr('dy', '0.5em');

    this.labelOut.exit()
      .remove();

    // matrix elements

    if (matrixElements != null) {

      this.matrixElement = this.g
        .selectAll('.matrix-element')
        .data(matrixElements, (d) => `${d.from} ${d.to}`);

      this.matrixElement.enter()
        .append('rect')
          .attr('class', 'matrix-element')
          .on('mouseover', (d) => {
            const r = Math.sqrt(d.re * d.re + d.im * d.im);
            const phi = Math.atan2(d.im, d.re) / TAU;
            const sign = d.im >= 0 ? '+' : '-';
            if (r > EPSILON) {
              this.tooltip.show(
                `${d.re.toFixed(3)} ${sign} ${Math.abs(d.im).toFixed(3)} <i>i</i><br>
                = ${r.toFixed(3)} exp(${phi.toFixed(3)} <i>i \u03C4</i>)`
              );
            }
          })
          .on('mouseout', () => this.tooltip.out());

    }

    this.matrixElement
      .attr('width', squareSize - 1)
      .attr('height', squareSize - 1)
      .style('fill', complexToPureColor)
      .style('fill-opacity', complexToOpacity)
      .transition()
        .duration(toggleDuraton)
          .attr('y', (d) => scale(position[d.to]) + 0.5)
          .attr('x', (d) => scale(position[d.from]) + 0.5);

    this.matrixElement.exit()
      .remove();

  }

}
