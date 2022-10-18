import Table from '.';
import Resizer from './resizer';
import selector from './index.selector';

function init(t: Table) {
  t._rowResizer = new Resizer(
    'row',
    t._container,
    t._minRowHeight,
    () => t._width(),
    (value, { row, height }) => {
      t.rowHeight(row, height + value).render();
      selector.reset(t);
      t._canvas.focus();
    }
  );
  t._colResizer = new Resizer(
    'col',
    t._container,
    t._minColWidth,
    () => t._height(),
    (value, { col, width }) => {
      t.colWidth(col, width + value).render();
      selector.reset(t);
      t._canvas.focus();
    }
  );
}

export default {
  init,
};
