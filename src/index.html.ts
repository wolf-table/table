import {
  Align,
  BorderLineStyle,
  BorderType,
  Border,
  Cell,
  Style,
  VerticalAlign,
  xy2expr,
  Range,
} from '@wolf-table/table-renderer';
import Table from '.';
import { pt2px } from './helper';

/**
 * the table content to html
 * @param t Table
 * @param from the range reference, like A1:H22
 */
export function toHtml(t: Table, from: string) {
  let htmlStr =
    '<table xmlns="http://www.w3.org/1999/xhtml" style="border-spacing: 0; border-collapse: collapse;">';
  const fromRange = Range.with(from);

  // merges
  const merges = t._data.merges
    .map((it) => Range.with(it))
    .filter((it) => it.intersects(fromRange));

  // borders
  // const borders = t._data.borders.filter((it) => Range.with(it[0]).intersects(fromRange));
  const border2css = (lineStyle: BorderLineStyle, color: string) => {
    if (lineStyle === 'dashed' || lineStyle === 'dotted') {
      return `1px ${lineStyle} ${color}`;
    } else {
      return `${
        lineStyle === 'thick' ? 3 : lineStyle === 'medium' ? 2 : 1
      }px solid ${color}`;
    }
  };
  const cellIndexes = new Map();
  for (let border of t._data.borders) {
    const [ref, borderType, lineStyle, color] = border;
    // console.log('border:', border);
    const it = Range.with(ref);
    if (it.intersects(fromRange)) {
      const { startRow, startCol, endRow, endCol } = it;
      it.each((r, c) => {
        const borderValue = border2css(lineStyle, color);
        let borderNames = [];
        if (borderType === 'all') {
          borderNames.push('border');
        }
        if (borderType === 'outside' || borderType === 'left') {
          if (c === startCol) borderNames.push('border-left');
        }
        if (borderType === 'outside' || borderType === 'right') {
          if (c === endCol) borderNames.push('border-right');
        }
        if (borderType === 'outside' || borderType === 'top') {
          if (r === startRow) borderNames.push('border-top');
        }
        if (borderType === 'outside' || borderType === 'bottom') {
          if (r === endRow) borderNames.push('border-bottom');
        }
        if (borderType === 'inside' || borderType === 'vertical') {
          if (c >= startCol && c < endCol) borderNames.push('border-right');
        }
        if (borderType === 'inside' || borderType === 'horizontal') {
          if (r >= startRow && r < endRow) borderNames.push('border-bottom');
        }
        if (borderNames.length > 0) {
          cellIndexes.set(
            `${r}_${c}`,
            borderNames.map((it) => `${it}:${borderValue};`).join('')
          );
        }
      });
    }
  }

  // colgroup
  htmlStr += '<colgroup>';
  fromRange.eachCol((c) => {
    htmlStr += `<col width="${t.colWidth(c)}"/>`;
  });
  htmlStr += '</colgroup>';

  // tr
  htmlStr += '<tbody>';
  fromRange.eachRow((r) => {
    htmlStr += `<tr style="height: ${t.rowHeight(r)}px;">`;
    fromRange.eachCol((c) => {
      const cell = t.cell(r, c);
      const cellRange = Range.create(r, c);

      let isMerged = false;
      let [rowspan, colspan] = [1, 1];
      for (let merge of merges) {
        if (merge.startRow === r && merge.startCol === c) {
          rowspan = merge.rows + 1;
          colspan = merge.cols + 1;
          break;
        }
        if (merge.intersects(cellRange)) {
          isMerged = true;
          break;
        }
      }

      if (!isMerged) {
        htmlStr += `<td`;
        if (rowspan > 1) htmlStr += ` rowspan="${rowspan}"`;
        if (colspan > 1) htmlStr += ` colspan="${colspan}"`;
        let cssStyleStr = ''; // border2css(borders, cellRange);
        const key = `${r}_${c}`;
        if (cellIndexes.has(key)) {
          cssStyleStr += cellIndexes.get(key);
        }
        if (cell && cell instanceof Object && cell.style !== undefined) {
          cssStyleStr += style2css(t.style(cell.style, true));
        }
        if (cssStyleStr !== '') htmlStr += ` style="${cssStyleStr}"`;
        htmlStr += `>${t.cellValueString(r, c)}</td>`;
      }
    });
    htmlStr += '</tr>';
  });
  return htmlStr + '</tbody></table>';
}

/**
 * fill the table content from html
 * @param t Table
 * @param html content: <table><tr><td style="color: white;">test</td>..</tr>..</table>
 * @param to [row, col]
 */
export function fromHtml(
  t: Table,
  html: string,
  [toStartRow, toStartCol]: [number, number]
): [number, number] {
  const toEnd: [number, number] = [0, 0];
  if (html && html.includes('</table>')) {
    const { _data } = t;
    const dstyle = _data.style;
    const template = document.createElement('template');
    template.innerHTML = html;

    const skips: Range[] = [];
    const trs = template.content.querySelectorAll('tr');
    toEnd[0] = toStartRow + trs.length - 1;

    const borderss: Border[][] = [];

    trs.forEach((tr, rowIndex) => {
      const tds = tr.querySelectorAll('td');
      if (rowIndex === 0) toEnd[1] = toStartCol + tds.length - 1;

      // is border the same in tr
      let prevBorder: Border | null = null;
      const borders: Border[] = [];

      for (let colIndex = 0; colIndex < tds.length; colIndex += 1) {
        const td = tds[colIndex];
        let [r, c] = [rowIndex + toStartRow, colIndex + toStartCol];
        if (skips.length > 0) {
          skips.forEach((it) => {
            if (it.containsRow(r) && it.startCol <= c) {
              c += it.cols;
              if (it.startRow !== r) c += 1;
            }
          });
        }
        const ref = xy2expr(c, r);

        // merge cell
        let [rowspan, colspan] = [1, 1];
        elementAttrValue(td, 'rowspan', (v) => (rowspan = parseInt(v)));
        elementAttrValue(td, 'colspan', (v) => (colspan = parseInt(v)));
        if (rowspan > 1 || colspan > 1) {
          const range = Range.create(r, c, r + rowspan - 1, c + colspan - 1);
          t.merge(range.toString());
          skips.push(range);
        }
        if (rowIndex === 0) toEnd[1] += colspan - 1;

        // style
        const nstyle: Partial<Style> = {};
        elementStylePropValue(
          td,
          'background-color',
          '',
          (v) => (nstyle.bgcolor = v)
        );
        elementStylePropValue(
          td,
          'color',
          dstyle.color,
          (v) => (nstyle.color = v)
        );
        elementStylePropValue(
          td,
          'text-align',
          dstyle.align,
          (v) => (nstyle.align = v as Align)
        );
        elementStylePropValue(
          td,
          'vertical-align',
          dstyle.valign,
          (v) => (nstyle.valign = v as VerticalAlign)
        );
        elementStyleBooleanValue(
          td,
          'white-space',
          'normal',
          (v) => (nstyle.textwrap = true)
        );
        elementStyleBooleanValue(
          td,
          'text-decoration',
          'underline',
          (v) => (nstyle.underline = true)
        );
        elementStyleBooleanValue(
          td,
          'text-decoration',
          'line-through',
          (v) => (nstyle.strikethrough = true)
        );
        elementStyleBooleanValue(
          td,
          'font-style',
          'italic',
          (v) => (nstyle.italic = true)
        );
        elementStylePropValue(td, 'font-weight', 'normal', (v) => {
          if (v === 'bold' || parseInt(v) >= 700) nstyle.bold = true;
        });
        elementStylePropValue(
          td,
          'font-family',
          dstyle.fontFamily,
          (v) => (nstyle.fontFamily = v)
        );
        elementStylePropValue(
          td,
          'font-size',
          dstyle.fontSize,
          (v) => (nstyle.fontSize = parseInt(v))
        );

        // border
        // const border: Border = [];
        const css2border = (v: string): [BorderLineStyle, string] => {
          const [w, s, ...c] = v.split(' ').map((it) => it.trim());
          let borderStyle: BorderLineStyle = 'thin';
          if (s === 'solid') {
            let width = parseInt(w);
            if (w.includes('pt')) width = pt2px(parseInt(w));
            if (width === 2) {
              borderStyle = 'medium';
            } else if (width === 3) {
              borderStyle = 'thick';
            }
          } else {
            borderStyle = s as BorderLineStyle;
          }
          return [borderStyle, c.join('')];
        };

        let borderxs: string[] = [];
        let curBorder: Border | null = null;
        // let border: Border | undefined = undefined;
        elementStylePropValue(td, 'border-width', '', (it) =>
          borderxs.push(it)
        );
        elementStylePropValue(td, 'border-style', '', (it) =>
          borderxs.push(it)
        );
        elementStylePropValue(td, 'border-color', '', (it) =>
          borderxs.push(it)
        );
        if (borderxs.length >= 3) {
          curBorder = [ref, 'all', ...css2border(borderxs.join(' '))];
          // t.addBorder(ref, 'all', ...css2border(borderxs.join(' ')));
        } else {
          if (
            !elementStylePropValue(
              td,
              'border',
              'none',
              (it) => (curBorder = [ref, 'all', ...css2border(it)])
            )
          ) {
            ['top', 'right', 'bottom', 'left'].forEach((it) => {
              elementStylePropValue(
                td,
                `border-${it}`,
                'none',
                (v) => (curBorder = [ref, it as BorderType, ...css2border(v)])
              );
            });
          }
        }

        if (prevBorder === null) {
          if (curBorder !== null) {
            prevBorder = curBorder;
          }
        } else {
          if (
            curBorder !== null &&
            curBorder[1] === prevBorder[1] &&
            curBorder[2] === prevBorder[2] &&
            curBorder[3] === prevBorder[3]
          ) {
            prevBorder[0] = `${prevBorder[0].split(':')[0]}:${ref}`;
          } else {
            borders.push(prevBorder);
            prevBorder = curBorder;
          }
        }

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
      if (prevBorder != null) {
        borders.push(prevBorder);
      }

      // auto merge borders in trs
      const prevBorders = borderss.at(-1);
      if (prevBorders && prevBorders.length > 0) {
        // console.log('prevBorders.length:', prevBorders.length, borders.length);
        if (
          prevBorders.length === 1 &&
          borders.length === 1 &&
          prevBorders[0][1] === 'all' &&
          prevBorders[0][1] === borders[0][1] &&
          prevBorders[0][2] === borders[0][2] &&
          prevBorders[0][3] === borders[0][3]
        ) {
          const range = Range.with(prevBorders[0][0]);
          range.endRow += 1;
          // console.log('range:', range.toString());
          prevBorders[0][0] = range.toString();
        } else {
          borderss.push(borders);
        }
      } else {
        borderss.push(borders);
      }
    });

    // add border ...
    if (borderss.length > 0) {
      for (let borders of borderss) {
        borders.forEach((it) => t.addBorder(...it));
      }
    }
  }
  return toEnd;
}

function elementAttrValue(
  el: HTMLElement,
  attrName: string,
  cb: (v: string) => void
) {
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
): boolean {
  const value = el.style.getPropertyValue(propName);
  const flag = value !== null && value !== '' && value !== defaultValue;
  if (flag) cb(value);
  return flag;
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

function style2css(s: Partial<Style>) {
  let cssStr = '';
  if (s.bgcolor) cssStr += `background-color: ${s.bgcolor};`;
  if (s.color) cssStr += `color: ${s.color};`;
  if (s.align) cssStr += `text-align: ${s.align};`;
  if (s.valign) cssStr += `vertical-align: ${s.valign};`;
  if (s.textwrap === true) cssStr += `white-space: normal;`;
  if (s.underline === true) cssStr += `text-decoration: underline;`;
  if (s.strikethrough === true) cssStr += `text-decoration: line-through;`;
  if (s.bold === true) cssStr += `font-weight: bold;`;
  if (s.italic === true) cssStr += `font-style: italic;`;
  if (s.fontFamily) cssStr += `font-family: ${s.fontFamily};`;
  if (s.fontSize) cssStr += `font-size: ${s.fontSize}pt;`;
  return cssStr;
}
