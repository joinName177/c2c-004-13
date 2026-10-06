import type { Dimensions, PackingItem, Placement } from './models';

type SizedItem = Pick<PackingItem, 'length' | 'width' | 'height'>;

export function rotationsOf(item: SizedItem): Dimensions[] {
  const [a, b, c] = [item.length, item.width, item.height];
  const candidates: Dimensions[] = [
    { length: a, width: b, height: c }, { length: a, width: c, height: b },
    { length: b, width: a, height: c }, { length: b, width: c, height: a },
    { length: c, width: a, height: b }, { length: c, width: b, height: a },
  ];
  return unique(candidates);
}

export function allowedRotations(item: SizedItem & Pick<PackingItem, 'orientation'>): Dimensions[] {
  const constraint = item.orientation ?? 'free';
  if (constraint === 'fixed') return [{ length: item.length, width: item.width, height: item.height }];
  if (constraint === 'upright') {
    return unique([
      { length: item.length, width: item.width, height: item.height },
      { length: item.width, width: item.length, height: item.height },
    ]);
  }
  return rotationsOf(item);
}

function unique(candidates: Dimensions[]): Dimensions[] {
  return candidates.filter((value, index) => candidates.findIndex((candidate) =>
    candidate.length === value.length && candidate.width === value.width && candidate.height === value.height,
  ) === index);
}

export function intersects(a: Placement, b: Placement): boolean {
  return a.x < b.x + b.dimensions.length && a.x + a.dimensions.length > b.x
    && a.y < b.y + b.dimensions.width && a.y + a.dimensions.width > b.y
    && a.z < b.z + b.dimensions.height && a.z + a.dimensions.height > b.z;
}
