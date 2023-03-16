import { TableData } from '.';
import { Border, Range } from '@wolf-table/table-renderer';

export function addBorder(t: TableData, value: Border) {
  if (!t.borders) t.borders = [];
  const borderRange = Range.with(value[0]);
  const { borders } = t;
  for (let i = 0; i < borders.length; i += 1) {
    const [it, ...others] = borders[i];
    const itRange = Range.with(it);
    if (itRange.intersects(borderRange)) {
      if (!itRange.within(borderRange)) {
        borders.push(value);
        itRange.difference(borderRange).forEach((r1) => {
          borders.push([r1.toString(), ...others]);
        });
      }
      borders.splice(i, 1);
      return;
    } else if (others.every((it, index) => it === value[index + 1])) {
      if (itRange.touches(borderRange)) {
        borders[i][0] = itRange.union(borderRange).toString();
        return;
      }
    }
  }
  borders.push(value);
}

export function clearBorder(t: TableData, ref: string) {
  const { borders } = t;
  if (borders) {
    const addBorders: Border[] = [];
    const target = Range.with(ref);
    for (let i = 0; i < borders.length; i += 1) {
      const [it, ...others] = borders[i];
      const itRange = Range.with(it);
      if (itRange.intersects(target)) {
        if (!itRange.within(target)) {
          // merge
          itRange.difference(target).forEach((r1) => {
            addBorders.push([r1.toString(), ...others]);
          });
        }
        borders.splice(i, 1);
        i -= 1;
      }
    }
    borders.push(...addBorders);
  }
}

export function clearBorders(t: TableData) {
  t.borders.length = 0;
}
