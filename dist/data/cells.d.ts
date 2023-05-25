import { Formatter } from '@wolf-table/table-renderer';
import { IndexDataCell, DataCell, TableData, FormulaParser, DataCellValue } from '.';
export default class Cells {
    _: IndexDataCell[];
    _indexes: Map<any, any>;
    _formulas: number[];
    _formulaParser: FormulaParser;
    _formatter: Formatter;
    constructor();
    formulaParser(v: FormulaParser): this;
    formatter(v: Formatter): this;
    load({ cells }: TableData): void;
    get(row: number, col: number): IndexDataCell | null;
    remove(row: number, col: number): this;
    set(row: number, col: number, cell: DataCell): void;
    private resetIndexes;
    private updateIndex;
    private addFormula;
    private resetFormulas;
}
export declare function cellValue(cell: DataCell): DataCellValue;
export declare function cellValueString(cell: DataCell): string;
