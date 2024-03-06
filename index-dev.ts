import WolfTable, { h } from './src';

const t = WolfTable.create(
  '#table',
  () => 1400,
  () => 600,
  {
    scrollable: true,
    resizable: true,
    selectable: true,
    editable: true,
    copyable: true,
  }
)
  .freeze('D5')
  .merge('F10:G11')
  .merge('I10:K11')
  .addBorder('E8:L12', 'all', 'medium', '#21ba45')
  .formulaParser((v) => `${v}-formula`)
  .data({
    styles: [
      {
        bold: true,
        strikethrough: true,
        color: '#21ba45',
        italic: true,
        align: 'center',
        fontSize: 12,
      },
    ],
    cells: [
      [0, 0, 'abc'],
      [1, 1, 100],
      [2, 6, { value: 'formua', style: 0 }],
      [9, 5, { value: '', formula: '=sum(A1:A10)' }],
    ],
  })
  .onClick((cell, evt) => {
    // console.log('cell:', cell, evt);
  })
  .onContextmenu((cell, evt) => {
    console.log('contetmenu:', cell);
    const { x, y, width, height } = cell;
    const content = h('div')
      .css({ background: '#ddd', padding: '10px', 'z-index': '100' })
      .css({
        left: x,
        top: y,
        width,
        height,
        position: 'absolute',
      });
    content.html('---abc--');
    t.container().append(content);
  })
  .render();

// add style
const si = t.addStyle({
  bold: true,
  italic: true,
  underline: true,
  color: '#1b1c1d',
});
// set cell
t.cell(2, 2, { value: 'set-value', style: si });
t.cell(15, 7, {
  type: 'text',
  value: 'option',
  options: async (q) =>
    ['option1', 'option2', 'option3', 'option4', 'option5', 'option6'].filter(
      (it) => it.startsWith(q)
    ),
});
t.render();

// get cell
console.log('cell[2,2]:', t.cell(2, 2));
