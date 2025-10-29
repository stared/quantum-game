import d3 from './d3-wrapper';
import {tileSize, repositionSpeed} from './config';
import {SoundService} from './sound_service';
import * as tile from './tile';
import type {D3Selection} from './types';
import type {Tile} from './tile';
import type {BareBoard} from './bare_board';
import type {Stock} from './stock';

// TODO should also work without stock
export const bindDrag = (tileSelection: D3Selection, board: BareBoard, stock: Stock): void => {

  function reposition(data: Tile, keep = true): void {
    delete data.newI;
    delete data.newJ;

    data.g
      .transition()
      .duration(repositionSpeed)
      .attr(
        'transform',
        `translate(${data.x + tileSize / 2},${data.y + tileSize / 2})`,
      )
      .delay(repositionSpeed)
      .each((d: Tile) => {
        if (!keep) {
          d.g.remove();
        }
      });
  }

  const drag = d3.drag<Element, Tile>();
  drag
    .on('dragstart', (event: d3.D3DragEvent<Element, Tile, Tile>, source: Tile) => {

      const sourceEvent = event.sourceEvent as Event;
      sourceEvent.stopPropagation();
      source.top = false;

      if (board.animationExists) {
        board.stop();
        board.callbacks.animationInterrupt();
      }

      // Is it from stock?
      if (source.fromStock === true) {
        if (stock.stock[source.tileName] === 0) {
          source.dontDrag = true;
          SoundService.playThrottled('error');
          return;
        }
        const parentNode = source.node?.parentNode;
        if (parentNode !== null && parentNode !== undefined) {
          stock.regenerateTile(d3.select(parentNode as Element) as D3Selection);
        }
        stock.updateCount(source.tileName, -1);
        source.g.classed('stock-dragged', true);
      }

      // Is it impossible to drag item and it's not a Source? Play sound.
      if (source.frozen === true && source.tileName !== 'Source') {
        SoundService.playThrottled('error');
      }
    })
    .on('drag', function (event: d3.D3DragEvent<Element, Tile, Tile>, source: Tile) {

      // Is it impossible to drag item?
      if (source.frozen === true) {
        return;
      }

      if (source.dontDrag === true) {
        return;
      }

      // Move element to the top
      if (source.top !== true) {
        // TODO still there are problems in Safari
        const parentNode = source.node?.parentNode;
        if (parentNode !== null && parentNode !== undefined && source.node !== null) {
          parentNode.appendChild(source.node as Node);
        }
        source.top = true;
      }

      d3.select(this)
        .attr('transform', `translate(${event.x},${event.y})`);
      source.newI = Math.floor(event.x / tileSize);
      source.newJ = Math.floor(event.y / tileSize);
    })
    .on('dragend', (_event, source: Tile) => {

      if (source.dontDrag === true) {
        delete source.dontDrag;
        return;
      }

      // No drag? Return.
      if (source.newI == null || source.newJ == null) {
        if (source.fromStock === true) {
          source.g.remove();
          stock.updateCount(source.tileName, +1);
        }
        return;
      }

      // rotation fallback
      if (source.newI == source.i && source.newJ == source.j && source.fromStock !== true) {
        source.rotate();
        SoundService.playThrottled('blip');
        board.logger.logAction('rotate', {name: source.tileName, i: source.i, j: source.j, toRotation: source.rotation});
        board.callbacks.tileRotated(source);
        // no return as I need to move it back to stick to the grid
      }

      // Drag ended outside of board?
      // The put in into the stock!
      if (
           source.newI < 0 || source.newI >= board.level.width
        || source.newJ < 0 || source.newJ >= board.level.height
      ) {
        stock.updateCount(source.tileName, +1);
        board.logger.logAction('drag', {
          name: source.tileName,
          fromStock: source.fromStock === true,
          fromI: source.i,
          fromJ: source.j,
          toStock: true,
          success: source.fromStock !== true,
        });
        if (source.fromStock === true) {
          reposition(source, false);
        } else {
          board.removeTile(source.i, source.j);
        }
        return;
      }

      // Otherwise...
      // Find target and target element
      const targetRow = board.tileMatrix[source.newI];
      const target = targetRow?.[source.newJ];
      if (!target) {
        // Should not happen as we validated bounds above
        return;
      }

      //  Dragged on an occupied tile?
      if (target.tileName !== 'Vacuum') {
        board.logger.logAction('drag', {
          name: source.tileName,
          fromStock: source.fromStock === true,
          fromI: source.i,
          fromJ: source.j,
          toStock: source.fromStock === true,
          toI: target.i,
          toJ: target.i,
          success: false,
        });
        if (source.fromStock === true) {
          reposition(source, false);
          stock.updateCount(source.tileName, +1);
        } else {
          reposition(source, true);
        }
        return;
      }

      // Dragging on and empty tile
      if (source.fromStock !== true) {
        const sourceRow = board.tileMatrix[source.i];
        if (sourceRow) {
          sourceRow[source.j] = new tile.Tile(tile.Vacuum, 0, false, source.i, source.j);
        }
      }
      board.logger.logAction('drag', {
        name: source.tileName,
        fromStock: source.fromStock === true,
        fromI: source.i,
        fromJ: source.j,
        toStock: false,
        toI: target.i,
        toJ: target.i,
        success: true,
      });
      if (targetRow !== undefined) {
        targetRow[target.j] = source;
      }
      source.i = target.i;
      source.j = target.j;
      if (source.fromStock === true) {
        source.fromStock = false;
        const boardGroupNode = board.boardGroup?.node() as Element | null | undefined;
        if (boardGroupNode !== null && boardGroupNode !== undefined && source.node !== null) {
          boardGroupNode.appendChild(source.node as Node);
        }
        board.clickBehavior(source.g, board);
        source.g.insert('rect', ':first-child')
          .attr('class', (d: Tile) => d.frozen ? 'frost frost-frozen' : 'frost frost-nonfrozen')
          .attr('x', -tileSize / 2)
          .attr('y', -tileSize / 2)
          .attr('width', tileSize)
          .attr('height', tileSize);
      }
      reposition(source, true);

    });

  tileSelection.call(drag);
}
