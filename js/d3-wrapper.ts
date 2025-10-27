// @ts-nocheck
// Wrapper for D3 v3 loaded as a global script
// This allows D3 v3 to run in its expected UMD/global context
// while still being importable as an ES module

// D3 is loaded via script tag in index.html and available as window.d3
const d3 = window.d3;

if (!d3) {
  console.error('D3 v3 not loaded! Make sure d3.min.js is loaded via script tag before app.js');
}

export default d3;
