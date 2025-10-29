import type {D3Selection} from './types';

export class Tooltip {
  private tooltip: D3Selection;

  constructor(selector: D3Selection) {
    this.tooltip = selector
      .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);
  }

  show(html: string, pageX: number, pageY: number): void {
    this.tooltip.style('opacity', 0.8)
      .style('left', (pageX + 15) + 'px')
      .style('top', (pageY + 8) + 'px')
      .html(html);
  }

  out(): void {
    this.tooltip
      .style('opacity', 0);
  }

  destroy(): void {
    this.tooltip.remove();
  }

}
