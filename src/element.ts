function createFragment(...nodes: (HElement | Node | string)[]) {
  const fragment = document.createDocumentFragment();
  nodes.forEach((node) => {
    let nnode: Node;
    if (node instanceof HElement) nnode = node._;
    else if (typeof node === 'string') nnode = document.createTextNode(node);
    else nnode = node;
    fragment.appendChild(nnode);
  });
  return fragment;
}

export type CSSAttrs = {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  position?: string;
  [property: string]: any;
};

export default class HElement {
  _: HTMLElement;
  _data = new Map();

  constructor(tag: string | Node, className?: string | string[] | Object) {
    this._ =
      tag instanceof Node ? <HTMLElement>tag : document.createElement(tag);
    if (className) {
      if (typeof className === 'string') {
        this._.className = className;
      } else if (Array.isArray(className)) {
        this._.className = className.join(' ');
      } else {
        for (let [key, value] of Object.entries(className)) {
          if (value) this._.classList.add(key);
        }
      }
    }
  }

  element(): any {
    return this._;
  }

  data(key: string): any;
  data(key: string, value: any): HElement;
  data(key: string, value?: any) {
    if (value) {
      this._data.set(key, value);
      return this;
    } else {
      return this._data.get(key);
    }
  }

  on(eventName: string, handler: (evt: any) => void) {
    const [evtName, ...prop] = eventName.split('.');
    this._.addEventListener(evtName, (evt) => {
      handler(evt);
      for (let i = 0; i < prop.length; i += 1) {
        if (prop[i] === 'stop') {
          evt.stopPropagation();
        }
        if (prop[i] === 'prevent') {
          evt.preventDefault();
        }
      }
    });
    return this;
  }

  focus() {
    this._.focus();
    return this;
  }

  value(): string;
  value(v: string): HElement;
  value(v?: string): any {
    if (v !== undefined) {
      (this._ as any).value = v;
      return this;
    }
    return (this._ as any).value;
  }

  textContent(v: string) {
    this._.textContent = v;
    return this;
  }

  html(v: string) {
    this._.innerHTML = v;
    return this;
  }

  attr(key: string): string;
  attr(key: string, value: string): HElement;
  attr(key: string, value?: string): any {
    if (value) {
      this._.setAttribute(key, value);
      return this;
    }
    return this._.getAttribute(key);
  }

  css(key: string): string;
  css(props: CSSAttrs): HElement;
  css(key: string, value: string): HElement;
  css(key: any, value?: string): any {
    const { style } = this._;
    if (value) {
      style.setProperty(key, value);
      return this;
    }
    if (typeof key === 'string') {
      return style.getPropertyValue(key);
    }
    Object.keys(key).forEach((k) => {
      let v: any = key[k];
      if (typeof v === 'number') v = `${v}px`;
      style.setProperty(k, v);
    });
    return this;
  }

  rect() {
    return this._.getBoundingClientRect();
  }

  offset() {
    const { _ } = this;
    return {
      x: _.offsetLeft,
      y: _.offsetTop,
      width: _.offsetWidth,
      height: _.offsetHeight,
    };
  }

  computedStyle() {
    return window.getComputedStyle(this._);
  }

  show(flag: boolean = true) {
    this.css('display', flag ? 'block' : 'none');
    return this;
  }

  hide() {
    this.css('display', 'none');
    return this;
  }

  scrollx(): number;
  scrollx(value: number): HElement;
  scrollx(value?: number): any {
    const { _ } = this;
    if (value !== undefined) {
      _.scrollLeft = value;
      return this;
    }
    return _.scrollLeft;
  }

  scrolly(): number;
  scrolly(value: number): HElement;
  scrolly(value?: number): any {
    const { _ } = this;
    if (value !== undefined) {
      _.scrollTop = value;
      return this;
    }
    return _.scrollTop;
  }

  after(...nodes: (HElement | Node | string)[]) {
    this._.after(createFragment(...nodes));
    return this;
  }

  before(...nodes: (HElement | Node | string)[]) {
    this._.before(createFragment(...nodes));
    return this;
  }

  append(...nodes: (HElement | Node | string)[]) {
    this._.append(createFragment(...nodes));
    return this;
  }

  remove(...nodes: (HElement | Node)[]) {
    nodes.forEach((node) => {
      this._.removeChild(node instanceof HElement ? node._ : node);
    });
  }

  cloneNode() {
    return this._.cloneNode(true);
  }

  get firstChild(): HElement | null {
    const first = this._.firstChild;
    return first ? new HElement(first) : null;
  }
}

export function h(
  tag: string | HTMLElement,
  className?: string | string[] | Object
) {
  return new HElement(tag, className);
}

export function textWidth(text: string, fontSize: string, fontFamily: string) {
  const el = document.createElement('span');
  el.style.display = 'inline-block';
  el.style.position = 'absolute';
  el.style.zIndex = '-900';
  el.style.whiteSpace = 'nowrap';
  el.style.fontSize = fontSize;
  el.style.fontFamily = fontFamily;
  el.textContent = text;
  document.body.appendChild(el);
  const width = el.clientWidth;
  document.body.removeChild(el);
  return width;
}
