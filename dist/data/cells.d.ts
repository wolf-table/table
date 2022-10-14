import { Formatter } from 'table-renderer';
import { DataIndexCell, DataCell, TableData, FormulaParser } from '.';
export default class Cells {
    _: DataIndexCell[];
    _indexes: Map<any, any>;
    _formulas: number[];
    _formulaParser: FormulaParser;
    _formatter: Formatter;
    constructor();
    formulaParser(v: FormulaParser): this;
    formatter(v: Formatter): this;
    load({ cells }: TableData): void;
    get(row: number, col: number): DataCell | null;
    set(row: number, col: number, cell: DataCell): void;
    private resetIndexes;
    private updateIndex;
    private addFormula;
    private resetFormulas;
}
export declare function cellValue(cell: DataCell): string | number | null | undefined;
export declare function cellValueString(cell: DataCell): string;
