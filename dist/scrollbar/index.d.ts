import HElement from '../element';
export declare type ScrollbarChanger = ((direction: '+' | '-', value: number, event: Event) => void) | null;
export default class Scrollbar {
    _: HElement;
    _content: HElement;
    _value: number;
    _maxValue: number;
    _type: 'vertical' | 'horizontal';
    _change: ScrollbarChanger;
    constructor(type: 'vertical' | 'horizontal', target: HElement);
    get value(): number;
    change(value: ScrollbarChanger): this;
    scroll(): any;
    scroll(value: number): Scrollbar;
    test(value: number): boolean;
    resize(value: number, contentValue: number): this;
}
