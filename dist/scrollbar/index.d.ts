import HElement from '../element';
export declare type ScrollbarChanger = ((direction: '+' | '-', value: number, event: Event) => void) | null;
export default class Scrollbar {
    _: HElement;
    _content: HElement;
    _value: number;
    _maxValue: number;
    _lastOffset: number;
    _type: 'vertical' | 'horizontal';
    _change: ScrollbarChanger;
    constructor(type: 'vertical' | 'horizontal', target: HElement);
    get value(): number;
    change(value: ScrollbarChanger): this;
    scrollBy(value: number): Scrollbar;
    scrollToStart(): this;
    scrollToEnd(): this;
    scroll(): any;
    scroll(value: number): Scrollbar;
    resize(value: number, contentValue: number): this;
}
