import WolfTable from './src';

const t = WolfTable.create(
  '#table',
  () => 1400,
  () => 600,
  {
    scrollable: true,
    resizable: true,
    selectable: true,
    rows: 1000,
  }
)
  .freeze('D5')
  .merge('F10:G11')
  .merge('I10:K11')
  .formula(v => `${v}-formula`)
  .data({
    styles: [{bold: true, strikethrough: true, color: '#21ba45', italic: true, align: 'center', fontSize: 12}],
    cells: [
      [0, 0, 'abc'],
      [1, 1, 100],
      [2, 6, { value: 'formua', style: 0 }],
      [9, 5, { value: '', formula: '=sum(A1:A10)' }],
    ],
  })
  .render();

t.cell(2, 2, { value: 'set-value', style: 0 }).render()
