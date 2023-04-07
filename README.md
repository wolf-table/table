<p align="center">
  <a href="https://github.com/wolf-table/table">
    <img src="https://raw.githubusercontent.com/wolf-table/table/main/logo.svg" height="80px" width="450px"/>
  </a>
</p>
<p align="center">
  <img src="https://img.shields.io/github/actions/workflow/status/wolf-table/table/npm-publish-github-packages.yml" alt="GitHub Workflow Status">
  <a href="https://www.npmjs.org/package/@wolf-table/table"><img src="https://img.shields.io/npm/v/@wolf-table/table.svg" alt="npm package"></a>
  <img src="https://img.shields.io/github/downloads/wolf-table/table/total" alt="GitHub all releases">
  <img src="https://img.shields.io/github/license/wolf-table/table" alt="GitHub">
  <img src="https://img.shields.io/github/languages/code-size/wolf-table/table" alt=" code size in bytes">
</p>

## wolf-table
> A web-based(canvas) JavaScript Table

## Demo
<a href="https://stackblitz.com/edit/wolf-table-lts2dq?file=index.ts">Open in Stackblitz</a>
<a href="https://wolf-table-lts2dq.stackblitz.io">Preview in browser</a>

## NPM
npm install
```shell
npm install @wolf-table/table@0.0.1
```
## Usage
```javascript
import '@wolf-table/table/dist/table.min.css';
import Table from "@wolf-table/table";

const t = Table.create(
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
      { bold: true, strikethrough: true, color: '#21ba45', italic: true, align: 'center', fontSize: 12 },
    ],
    cells: [
      [0, 0, 'abc'],
      [1, 1, 100],
      [2, 6, { value: 'formua', style: 0 }],
      [9, 5, { value: '', formula: '=sum(A1:A10)' }],
    ],
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
t.cell(2, 2, { value: 'set-value', style: si }).render();

// get cell
console.log('cell[2,2]:', t.cell(2, 2));
```

## Development

```shell
git clone https://github.com/wolf-table/table.git
cd table
npm install
npm run dev
```

Open your browser and visit http://127.0.0.1:8080.

## Browser Support

Modern browsers(chrome, firefox, Safari).

## LICENSE

MIT

Copyright (c) 2022-present, myliang