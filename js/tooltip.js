import d3 from 'd3';

export class Tooltip {

  constructor(selector) {
    this.tooltip = selector
      .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);
  }

  show(html) {
    this.tooltip.style('opacity', 0.8)
      .style('left', (d3.event.pageX + 15) + 'px')
      .style('top', (d3.event.pageY + 8) + 'px')
      .html(html);
  }

  out() {
    this.tooltip
      .style('opacity', 0);
  }

  destroy() {
    this.tooltip.remove();
  }

}
