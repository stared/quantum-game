// Very simple mock of a d3 selection.
// It has some empty methods that are chainable.
export class MockD3 {
  append() {
    return new MockD3();
  }
  attr() {
    return this;
  }
  classed() {
    return this;
  }
  remove() {
    return this;
  }
}
