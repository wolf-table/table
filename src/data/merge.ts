import { Range } from '@wolf-table/table-renderer';
import { TableData } from '.';

// can be merged
export function isMerged({ merges }: TableData, ref: string) {
  if (merges) {
    const range = Range.with(ref);
    for (let i = 0; i < merges.length; i += 1) {
      if (Range.with(merges[i]).equals(range)) {
        return true;
      }
    }
  }
  return false;
}
// merge
export function merge(data: TableData, ref: string) {
  const range = Range.with(ref);
  if (!range.multiple) return;
  data.merges ||= [];
  const { merges } = data;
  if (merges.length <= 0) {
    merges.push(ref);
  } else {
    merges.forEach((it, index) => {
      if (Range.with(it).within(range)) {
        merges.splice(index, 1);
      }
    });
    merges.push(ref);
  }
}
// unmerge
export function unmerge({ merges }: TableData, ref: string) {
  if (merges) {
    for (let i = 0; i < merges.length; i += 1) {
      if (merges[i] === ref) {
        merges.splice(i, 1);
        return;
      }
    }
  }
}

export function rangeUnoinMerges({ merges }: TableData, range: Range) {
  if (merges) {
    for (let i = 0; i < merges.length; i += 1) {
      const r = Range.with(merges[i]);
      if (r.intersects(range)) {
        range = r.union(range);
      }
    }
  }
  return range;
}
