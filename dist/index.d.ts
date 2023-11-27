import './style.index.less';
import HElement from './element';
import Scrollbar from './scrollbar';
import Resizer from './resizer';
import Selector from './selector';
import Overlayer from './overlayer';
import Editor from './editor';
import TableRenderer, { Style, ColHeader, RowHeader, Range, Rect, Border, Formatter, Gridline, ViewportCell } from '@wolf-table/table-renderer';
import { TableData, Cells, FormulaParser, DataCell, DataRow, DataCol, DataCellValue } from './data';
import { EventEmitter } from './event';
export declare type TableRendererOptions = {
    style?: Partial<Style>;
    headerStyle?: Partial<Style>;
    rowHeader?: Partial<RowHeader>;
    colHeader?: Partial<ColHeader>;
    gridline?: Partial<Gridline>;
    headerGridline?: Partial<Gridline>;
    freeGridline?: Partial<Gridline>;
};
export declare type TableDataOptions = {
    rows?: number;
    cols?: number;
    rowHeight?: number;
    colWidth?: number;
};
export declare type TableOptions = {
    minRowHeight?: number;
    minColWidth?: number;
    scrollable?: boolean;
    resizable?: boolean;
    selectable?: boolean;
    editable?: boolean;
    copyable?: boolean;
    data?: TableDataOptions;
    renderer?: TableRendererOptions;
};
export declare type MoveDirection = 'up' | 'down' | 'left' | 'right';
export declare type EventName = 'click';
export default class Table {
    _rendererOptions: TableRendererOptions;
    _copyable: boolean;
    _editable: boolean;
    _minRowHeight: number;
    _minColWidth: number;
    _width: () => number;
    _height: () => number;
    _contentRect: Rect;
    _container: HElement;
    _data: TableData;
    _renderer: TableRenderer;
    _cells: Cells;
    _vScrollbar: Scrollbar | null;
    _hScrollbar: Scrollbar | null;
    _rowResizer: Resizer | null;
    _colResizer: Resizer | null;
    _editor: Editor | null;
    _editors: Map<any, any>;
    _selector: Selector | null;
    _overlayer: Overlayer;
    _canvas: HElement;
    _emitter: EventEmitter;
    constructor(element: HTMLElement | string, width: () => number, height: () => number, options?: TableOptions);
    contentRect(): Rect;
    container(): HElement;
    resize(): void;
    freeze(ref: string): this;
    isMerged(): boolean;
    isMerged(ref: string): boolean;
    merge(): Table;
    merge(ref: string): Table;
    unmerge(): Table;
    unmerge(ref: string): Table;
    row(index: number): DataRow;
    row(index: number, value: Partial<DataRow>): Table;
    rowHeight(index: number): number;
    rowHeight(index: number, value: number): Table;
    rowsHeight(min: number, max: number): number;
    isLastRow(index: number): boolean;
    col(index: number): DataCol;
    col(index: number, value: Partial<DataCol>): Table;
    colWidth(index: number): number;
    colWidth(index: number, value: number): Table;
    colsWidth(min: number, max: number): number;
    isLastCol(index: number): boolean;
    formulaParser(v: FormulaParser): this;
    formatter(v: Formatter): this;
    style(index: number, withDefault?: boolean): Partial<Style>;
    addStyle(value: Partial<Style>): number;
    clearStyles(): this;
    addBorder(...value: Border): this;
    clearBorder(value: string): this;
    clearBorders(): this;
    cell(row: number, col: number): DataCell;
    cell(row: number, col: number, value: DataCell): Table;
    cellValue(row: number, col: number): DataCellValue;
    cellValueString(row: number, col: number): string;
    render(): this;
    data(): TableData;
    data(data: Partial<TableData>): Table;
    /**
     * copy data to ...
     * @param to
     * @param autofill
     */
    copy(to: string | Range | Table | null, autofill?: boolean): this;
    /**
     * @param html <table><tr><td style="color: white">test</td></tr></table>
     * @param to A1 or B9
     */
    fill(html: string): Table;
    fill(html: string, to: string): Table;
    fill(arrays: DataCellValue[][]): Table;
    fill(arrays: DataCellValue[][], to: string): Table;
    /**
     * @param from A1:H12
     */
    toHtml(from: string): string;
    toArrays(from: string): DataCellValue[][];
    onClick(handler: (cell: ViewportCell, evt: MouseEvent) => void): this;
    /**
     * @param type keyof cell.type
     * @param editor
     * @returns
     */
    addEditor(type: string, editor: Editor): this;
    static create(element: HTMLElement | string, width: () => number, height: () => number, options?: TableOptions): Table;
}
declare global {
    interface Window {
        wolf: any;
    }
}
