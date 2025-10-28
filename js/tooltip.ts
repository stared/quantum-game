import d3 from './d3-wrapper';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type D3Selection = any;

export class Tooltip {
  private tooltip: D3Selection;

  constructor(selector: D3Selection) {
    this.tooltip = selector
      .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);
  }

  show(html: string): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    this.tooltip.style('opacity', 0.8)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      .style('left', ((d3 as any).event.pageX + 15) + 'px')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      .style('top', ((d3 as any).event.pageY + 8) + 'px')
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
