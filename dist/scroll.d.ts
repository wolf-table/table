import { TableData } from './data';
export default class Scroll {
    _value: [number, number];
    _data: () => TableData;
    constructor(data: () => TableData);
    x(n: number): [boolean, number, number] | undefined;
    y(n: number): [boolean, number, number] | undefined;
    stepCol(n: number): number | undefined;
    stepRow(n: number): number | undefined;
}
