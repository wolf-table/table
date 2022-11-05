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
