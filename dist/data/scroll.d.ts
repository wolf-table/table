import { TableData } from '.';
export default class Scroll {
    _value: [number, number];
    _data: () => TableData;
    constructor(data: () => TableData);
    x(): number;
    x(direction: '+' | '-', n: number): boolean;
    y(): number;
    y(direction: '+' | '-', n: number): boolean;
}
