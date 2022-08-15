import { DataIndexCell, DataCell, TableData, FormulaFunc } from '.';
export default class Cells {
    _: DataIndexCell[];
    _indexes: Map<any, any>;
    _formulas: number[];
    _formula: FormulaFunc;
    constructor();
    formula(v: FormulaFunc): this;
    load({ cells }: TableData): void;
    get(row: number, col: number): DataCell | null;
    set(row: number, col: number, cell: DataCell): void;
    private resetIndexes;
    private updateIndex;
    private addFormula;
    private resetFormulas;
}
