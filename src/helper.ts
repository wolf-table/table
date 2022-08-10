export function sum(min: number, max: number, getv: (index: number) => number) {
  let total = 0;
  for (let i = min; i < max; i += 1) total += getv(i);
  return total;
}

export function equals(obj1: any, obj2: any) {
  const keys = Object.keys(obj1);
  if (keys.length !== Object.keys(obj2).length) return false;
  for (let i = 0; i < keys.length; i += 1) {
    const k = keys[i];
    const v1 = obj1[k];
    const v2 = obj2[k];
    if (v2 === undefined) return false;
    if (typeof v1 === 'string' || typeof v1 === 'number' || typeof v1 === 'boolean') {
      if (v1 !== v2) return false;
    } else if (Array.isArray(v1)) {
      if (v1.length !== v2.length) return false;
      for (let ai = 0; ai < v1.length; ai += 1) {
        if (!equals(v1[ai], v2[ai])) return false;
      }
    } else if (typeof v1 !== 'function' && !Array.isArray(v1) && v1 instanceof Object) {
      if (!equals(v1, v2)) return false;
    }
  }
  return true;
}
