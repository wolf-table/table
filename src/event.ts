export function bind(target: any, name: string, callback: (evt: any) => void) {
  target.addEventListener(name, callback);
}

export function unbind(
  target: any,
  name: string,
  callback: (evt: any) => void
) {
  target.removeEventListener(name, callback);
}

export function bindMousemoveAndMouseup(
  target: any,
  move: (evt: any) => void,
  up: (evt: any) => void
) {
  const upHandler = (evt: any) => {
    up(evt);
    unbind(target, 'mousemove', move);
    unbind(target, 'mouseup', upHandler);
  };
  bind(target, 'mousemove', move);
  bind(target, 'mouseup', upHandler);
}

// event.emitter
type Handler = (...args: any) => void;

export class EventEmitter {
  _events = new Map();

  on(type: string, handler: Handler) {
    const { _events } = this;
    if (!_events.has(type)) {
      _events.set(type, []);
    }
    _events.get(type).push(handler);
    return this;
  }

  off(type: string, handler?: Handler) {
    const { _events } = this;
    if (_events.has(type)) {
      const handlers = _events.get(type);
      if (handler) {
        const findIndex = handlers.findIndex(it, it === handler);
        if (findIndex !== -1) {
          handlers.splice(findIndex, 1);
        }
      } else {
        handlers.length = 0;
      }
    }
    return this;
  }

  emit(type: String, ...args: any) {
    const { _events } = this;
    if (_events.has(type)) {
      _events.get(type).forEach((handler: Handler) => handler(...args));
    }
    return this;
  }
}
