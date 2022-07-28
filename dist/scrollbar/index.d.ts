import Element from '../element';
export declare type ScrollbarChanger = ((value: number, event: Event) => void) | null;
export default class Scrollbar {
    _: Element;
    _content: Element;
    _type: 'vertical' | 'horizontal';
    _change: ScrollbarChanger;
    constructor(type: 'vertical' | 'horizontal');
    change(value: ScrollbarChanger): this;
    scroll(): any;
    scroll(value: number): Scrollbar;
    resize(value: number, contentValue: number): this;
}
