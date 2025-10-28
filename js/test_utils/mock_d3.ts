// Very simple mock of a d3 selection.
// It has some empty methods that are chainable.
export class MockD3 {
  append(..._args: unknown[]): MockD3 {
    return new MockD3();
  }
  attr(..._args: unknown[]): this {
    return this;
  }
  classed(..._args: unknown[]): this {
    return this;
  }
  remove(..._args: unknown[]): this {
    return this;
  }
}
