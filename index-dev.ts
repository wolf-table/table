import WolfTable from './src';

WolfTable.create(
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
  .data({
    cells: [
      [0, 0, 'abc'],
      [1, 1, 100],
      [2, 6, { value: 'formua' }],
      [9, 5, { value: '', formula: '=sum(A1:A10)' }],
    ],
  })
  .render();
