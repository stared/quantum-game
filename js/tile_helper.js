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
    const x = text.attr('x') || 0;
    const y = text.attr('y') || 0;
    const dy = parseFloat(text.attr('dy')) || 0;
    let tspan = text.text(null).append('tspan')
      .attr('x', x)
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
          .attr('x', x)
          .attr('y', y)
          .attr('dy', ++lineNumber * lineHeight + dy + 'em')
          .text(word);
      }
    }
  });
}

export class TileHelper {
  constructor(svg, bareBoard, game) {
    this.svg = svg;
    this.game = game;
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
      .attr('y', tileSize * 0.4); // 0.5 factor might be too much for 3 lines

    this.tileSummmary = this.helperGroup.append('text')
      .attr('class', 'helper-summary')
      .attr('x', 0.25 * tileSize)
      .attr('y', 1.25 * tileSize);

    this.helperHitbox = this.helperGroup.append('rect')
      .attr('class', 'helper-hitbox')
      .attr('width', `${this.width}`)
      .attr('height', `${this.height}`)
      .attr('rx', 10)
      .attr('ry', 10);

  }

  show(tile) {

    this.helperHitbox.on('click', () => {
      this.game.setEncyclopediaItem(tile.tileName);
      this.game.setView('encyclopediaItem');
    });
    this.tileUse.attr('xlink:href', `#${tile.type.svgName}`)
    this.tileName.text(tile.type.desc.name)
      .call(wrap, 2 * tileSize);
    this.tileSummmary.text(tile.type.desc.summary)
      .call(wrap, 2.5 * tileSize);

  }

}
