import d3 from 'd3';
import {tileSize, repositionSpeed} from './config';

export const bindDrag = (tileSelection, board, stock) => {

  function reposition(data, keep = true) {
    delete data.newI;
    delete data.newJ;

    data.g
      .transition()
      .duration(repositionSpeed)
      .attr(
        'transform',
        `translate(${data.x + tileSize / 2},${data.y + tileSize / 2})`
      )
      .delay(repositionSpeed)
      .each((d) => {
        if (!keep) {
          d.g.remove();
        }
      });
  }

  const drag = d3.behavior.drag();
  drag
    .on('dragstart', (source) => {

      d3.event.sourceEvent.stopPropagation();
      source.top = false;

      if (board.particleAnimation) {
        board.stop();
        board.titleManager.displayMessage(
          'Experiment disturbed! Quantum states are fragile...',
          'failure');
      }

      // Is it from stock?
      if (source.fromStock) {
        if (stock.stock[source.tileName] === 0) {
          source.dontDrag = true;
          return;
        }
        stock.regenerateTile(d3.select(source.node.parentNode));
        stock.updateCount(source.tileName, -1);
        source.g.classed('stock-dragged', true);
      }

    })
    .on('drag', function (source) {

      // Is it impossible to drag item?
      if (source.frozen) {
        return;
      }

      if (source.dontDrag) {
        return;
      }

      // Move element to the top
      if (!source.top) {
        // TODO still there are problems in Safari
        source.node.parentNode.appendChild(source.node);
        source.top = true;
      }

      d3.select(this)
        .attr('transform', `translate(${d3.event.x},${d3.event.y})`);
      source.newI = Math.floor(d3.event.x / tileSize);
      source.newJ = Math.floor(d3.event.y / tileSize);
    })
    .on('dragend', (source) => {

      if (source.dontDrag) {
        delete source.dontDrag;
        return;
      }

      // No drag? Return.
      if (source.newI == null || source.newJ == null) {
        if (source.fromStock) {
          source.g.remove();
        }
        return;
      }

      // Drag ended outside of board?
      // The put in into the stock!
      if (
           source.newI < 0 || source.newI >= board.level.width
        || source.newJ < 0 || source.newJ >= board.level.height
      ) {
        stock.updateCount(source.tileName, +1);
        if (source.fromStock) {
          reposition(source, false);
        } else {
          board.removeTile(source.i, source.j);
        }
        return;
      }

      // Otherwise...
      // Find target and target element
      const target = board.tileMatrix[source.newI][source.newJ];

      //  Dragged on an occupied tile?
      if (target.tileName !== 'Vacuum') {
        if (source.fromStock) {
          reposition(source, false);
          stock.updateCount(source.tileName, +1);
        } else {
          reposition(source, true);
        }
        return;
      }

      // Dragging on and empty tile
      if (!source.fromStock) {
        board.tileMatrix[source.i][source.j] = new tile.Tile(tile.Vacuum, 0, false, source.i, source.j);
      }
      board.tileMatrix[target.i][target.j] = source;
      source.i = target.i;
      source.j = target.j;
      if (source.fromStock) {
        source.fromStock = false;
        board.boardGroup.node().appendChild(source.node);
        board.clickBehavior(source.g, board);
        source.g.insert('rect', ':first-child')
          .attr('class', (d) => d.frozen ? 'frost frost-frozen' : 'frost frost-nonfrozen')
          .attr('x', -tileSize / 2)
          .attr('y', -tileSize / 2)
          .attr('width', tileSize)
          .attr('height', tileSize);
      }
      reposition(source, true);

    });

  tileSelection
    .call(drag);
}
