import {
  Align,
  BorderLineStyle,
  BorderType,
  Cell,
  Style,
  VerticalAlign,
  xy2expr,
  Range,
} from 'table-renderer';
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

    const skips: Range[] = [];
    const trs = template.content.querySelectorAll('tr');
    trs.forEach((tr, rowIndex) => {
      const tds = tr.querySelectorAll('td');
      for (let colIndex = 0; colIndex < tds.length; colIndex += 1) {
        const td = tds[colIndex];
        let [r, c] = [rowIndex + toRow, colIndex + toCol];
        const ref = xy2expr(c, r);

        if (skips.length > 0) {
          // const findIt = skips.find((it) => it.contains(r, c));
          skips.forEach((it) => {
            if (it.containsRow(r) && it.startCol <= c) {
              c += it.cols;
              if (it.startRow !== r) c += 1;
            }
          });
        }

        // merge cell
        let [rowspan, colspan] = [1, 1];
        elementAttrValue(td, 'rowspan', (v) => (rowspan = parseInt(v)));
        elementAttrValue(td, 'colspan', (v) => (colspan = parseInt(v)));
        if (rowspan > 1 || colspan > 1) {
          const range = Range.create(r, c, r + rowspan - 1, c + colspan - 1);
          t.merge(range.toString());
          skips.push(range);
        }

        // style
        const nstyle: Partial<Style> = {};
        elementStylePropValue(td, 'background-color', dstyle.bgcolor, (v) => (nstyle.bgcolor = v));
        elementStylePropValue(td, 'color', dstyle.color, (v) => (nstyle.color = v));
        elementStylePropValue(td, 'text-align', dstyle.align, (v) => (nstyle.align = v as Align));
        elementStylePropValue(
          td,
          'vertical-align',
          dstyle.valign,
          (v) => (nstyle.valign = v as VerticalAlign)
        );
        elementStyleBooleanValue(td, 'white-space', 'nowrap', (v) => (nstyle.textwrap = true));
        elementStyleBooleanValue(td, 'text-decoration', 'underline', (v) => (nstyle.underline = true));
        elementStyleBooleanValue(td, 'text-decoration', 'line-through', (v) => (nstyle.strikethrough = true));
        elementStyleBooleanValue(td, 'font-weight', 'bold', (v) => (nstyle.bold = true));
        elementStyleBooleanValue(td, 'font-style', 'italic', (v) => (nstyle.italic = true));
        elementStylePropValue(td, 'font-family', dstyle.fontFamily, (v) => (nstyle.fontFamily = v));
        elementStylePropValue(td, 'font-size', dstyle.fontSize, (v) => (nstyle.fontSize = parseInt(v)));

        // border
        // const border: Border = [];
        const cssBorder = (v: string): [BorderLineStyle, string] => {
          const [w, s, c] = v.split(' ').map((it) => it.trim());
          let borderStyle: BorderLineStyle = 'thin';
          if (s === 'solid') {
            if (parseInt(w) === 2) {
              borderStyle = 'medium';
            } else if (parseInt(w) === 3) {
              borderStyle = 'thick';
            }
          } else {
            borderStyle = s as BorderLineStyle;
          }
          return [borderStyle, c];
        };
        ['top', 'right', 'bottom', 'left'].forEach((it) => {
          elementStylePropValue(td, `border-${it}`, 'none', (v) =>
            t.addBorder(ref, it as BorderType, ...cssBorder(v))
          );
        });

        // the cell value
        const text = td.innerHTML
          .replace(/<br(\/){0,1}>/gi, '\n')
          .replace(/(<([^>]+)>|)/gi, '')
          .replace('&nbsp;', ' ');
        // console.log('text: ', td.innerHTML);
        const cell: Cell = {};
        if (Object.keys(nstyle).length > 0) {
          cell.style = t.addStyle(nstyle);
        }
        if (text !== null && !/^\s*$/.test(text)) {
          cell.value = text;
        }
        if (Object.keys(cell).length > 0) {
          t.cell(r, c, cell);
        }
      }
    });
  }
}

function elementAttrValue(el: HTMLElement, attrName: string, cb: (v: string) => void) {
  if (el.hasAttribute(attrName)) {
    const value = el.getAttribute(attrName);
    if (value != null) cb(value);
  }
}

function elementStylePropValue(
  el: HTMLElement,
  propName: string,
  defaultValue: any,
  cb: (v: string) => void
) {
  const value = el.style.getPropertyValue(propName);
  if (value !== null && value !== '' && value !== defaultValue) cb(value);
}

function elementStyleBooleanValue(
  el: HTMLElement,
  propName: string,
  targetValue: any,
  cb: (v: string) => void
) {
  const value = el.style.getPropertyValue(propName);
  if (value === targetValue) cb(value);
}
