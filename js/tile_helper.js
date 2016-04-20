import d3 from 'd3';
import {tileSize, stockBottomMargin} from './config';

// shamelessly stolen from https://bl.ocks.org/mbostock/7555321
const wrap = (text, width) => {
  text.each(function() {
    const text = d3.select(this);
    const words = text.text().split(/\s+/).reverse();
    let word;
    let line = [];
    let lineNumber = 0;
    const lineHeight = 1.1; // ems
    const y = text.attr('y');
    const dy = parseFloat(text.attr('dy'));
    let tspan = text.text(null).append('tspan')
      .attr('x', 0)
      .attr('y', y)
      .attr('dy', dy + 'em');
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(' '));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(' '));
        line = [word];
        tspan = text.append('tspan')
          .attr('x', 0)
          .attr('y', y)
          .attr('dy', ++lineNumber * lineHeight + dy + 'em')
          .text(word);
      }
    }
  });
}

export class TileHelper {
  constructor(svg, bareBoard) {
    this.svg = svg;
    this.width = (stockBottomMargin - 1) * tileSize;
    this.height = (stockBottomMargin - 1) * tileSize;

    // NOTE this is a bit problematic as it depends on the level
    this.shiftX = (bareBoard.level.width + 1) * tileSize;
    this.shiftY = (bareBoard.level.height - stockBottomMargin + 1) * tileSize;
    this.initialDraw();
  }

  initialDraw() {

    // Reset element
    this.svg.select('.helper').remove();

    // Create
    this.helperGroup = this.svg
      .append('g')
        .attr('class', 'helper')
        .attr('transform', `translate(${this.shiftX},${this.shiftY})`);

    this.helperGroup.append('rect')
      .attr('class', 'helper-background')
      .attr('width', `${this.width}`)
      .attr('height', `${this.height}`)
      .attr('rx', 10)
      .attr('ry', 10)
      .style('fill', 'white');

    this.tileUse = this.helperGroup.append('use')
      .attr('class', 'element helper-element')
      .attr('x', tileSize / 2)
      .attr('y', tileSize / 2);

    this.tileName = this.helperGroup.append('text')
      .attr('class', 'helper-name')
      .attr('x', 2 * tileSize)
      .attr('y', tileSize / 2 + 11);

    this.tileSummmary = this.helperGroup.append('text')
      .attr('class', 'helper-summary')
      .attr('x', 0.25 * tileSize)
      .attr('y', 1.5 * tileSize);

    // TODO(migdal) link

  }

  show(tile) {

    this.tileUse.attr('xlink:href', `#${tile.type.svgName}`)
    this.tileName.text(tile.type.desc.name);
    this.tileSummmary.text(tile.type.desc.summary);

  }

}
