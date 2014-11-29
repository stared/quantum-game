COUNTER = 0;
SPACING = 60;

svg = d3.select('svg')

drawElement = (name, rotations, angle) ->
  COUNTER++
  svg.append('g').selectAll('use')
    .data([0...rotations])
    .enter()
    .append('use')
      .attr('xlink:href', '#' + name)
      .attr('transform', (d) ->
        "translate(#{ SPACING * (d + 1)} #{ SPACING * COUNTER}) rotate(#{ -angle * d})"
      )

drawElement('polarizing-beam-splitter', 2, 90)
drawElement('beam-splitter', 4, 45)
drawElement('thin-mirror', 4, 45)
drawElement('laser', 4, 90)