import { Align, Style, VerticalAlign, xy2expr } from 'table-renderer';
import Table from '.';

/**
 * the table content to html
 * @param t Table
 * @param from the range reference, like A1:H22
 */
export function toHtml(t: Table, from: string) {}

/**
 * fill the table content from html
 * @param t Table
 * @param html content: <table><tr><td style="color: white;">test</td>..</tr>..</table>
 * @param to [row, col]
 */
export function fromHtml(t: Table, html: string, [toRow, toCol]: [number, number]) {
  if (html && html.includes('</table>')) {
    const { _data } = t;
    const dstyle = _data.style;
    const template = document.createElement('template');
    template.innerHTML = html;
    const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_ELEMENT);
    let [rowIndex, colIndex] = [-1, -1];
    // const rows = [];
    // const cols = [];
    while (walker.nextNode()) {
      const el = walker.currentNode as HTMLElement;
      const { nodeName } = el;
      if (nodeName === 'TR') {
        // get the row's height
        rowIndex += 1;
        colIndex = -1;
        // for wps google-sheet
        // elementAttrValue(el, 'height', (v) => (rows[rowIndex] = parseInt(v)));
        // elementStyleAttrValue(el, 'height', (v) => (rows[rowIndex] = parseInt(v)));
      } else if (nodeName === 'TD') {
        colIndex += 1;
        // for office-excel
        // elementStyleAttrValue(el, 'height', (v) => (rows[rowIndex] = parseInt(v)));
        // elementStyleAttrValue(el, 'width', (v) => (cols[colIndex] = parseInt(v)));

        const ref = xy2expr(colIndex + toCol, rowIndex + toRow);

        // merge cell
        elementAttrValue(el, 'rowspan', (v) => {});
        elementAttrValue(el, 'colspan', (v) => {});

        // style
        const nstyle: Partial<Style> = {};
        elementStyleAttrValue(el, 'backgroundColor', dstyle.bgcolor, (v) => (nstyle.bgcolor = v));
        elementStyleAttrValue(el, 'color', dstyle.color, (v) => (nstyle.color = v));
        elementStyleAttrValue(el, 'textAlign', dstyle.align, (v) => (nstyle.align = v as Align));
        elementStyleAttrValue(
          el,
          'verticalAlign',
          dstyle.valign,
          (v) => (nstyle.valign = v as VerticalAlign)
        );
        elementStyleAttrValue(el, 'whiteSpace', dstyle.textwrap, (v) => (nstyle.textwrap = v === 'nowrap'));
        elementStyleAttrValue(
          el,
          'textDecoration',
          dstyle.underline,
          (v) => (nstyle.underline = v === 'underline')
        );
        elementStyleAttrValue(
          el,
          'textDecoration',
          dstyle.strikethrough,
          (v) => (nstyle.strikethrough = v === 'line-through')
        );
        elementStyleAttrValue(el, 'fontWeight', dstyle.bold, (v) => (nstyle.bold = v === 'bold'));
        elementStyleAttrValue(el, 'fontStyle', dstyle.italic, (v) => (nstyle.italic = v === 'italic'));
        elementStyleAttrValue(el, 'fontFamily', dstyle.fontFamily, (v) => (nstyle.fontFamily = v));
        elementStyleAttrValue(el, 'fontSize', dstyle.fontSize, (v) => (nstyle.fontSize = parseInt(v)));

        // border
        // const border: Border = [];
        const cssBorder = (v: string) => {
          const [w, s, c] = v.split(' ');
          let lineType = 'thin';
          if (parseInt(w) === 2) {
            lineType = 'm';
          }
        };
        // elementStyleAttrValue(el, 'borderTop', 'none', (v) => t.addBorder(ref, 'top'));

        // the cell value
        const text = el.textContent;
        if (text !== null && !/^\s*$/.test(text)) {
        }

        console.log('text:', el.textContent);
      } else if (nodeName === 'COL') {
        // get the col's width
        // for wps google-sheet
        // elementAttrValue(el, 'width', (v) => (cols[colIndex] = parseInt(v)));
        // elementStyleAttrValue(el, 'width', (v) => (cols[colIndex] = parseInt(v)));
      }
      console.log('currentNode:', el, el.nodeName);
    }
  }
}

function elementAttrValue(el: HTMLElement, attrName: string, cb: (v: string) => void) {
  if (el.hasAttribute(attrName)) {
    const value = el.getAttribute(attrName);
    if (value != null) cb(value);
  }
}

function elementStyleAttrValue(
  el: HTMLElement,
  attrName: string,
  defaultValue: any,
  cb: (v: string) => void
) {
  const value = el.style.getPropertyValue(attrName);
  if (value && value !== '' && value !== defaultValue) cb(value);
}
