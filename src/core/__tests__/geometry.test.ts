import { describe, expect, it } from 'vitest';
import { allowedRotations, intersects, rotationsOf } from '../geometry';
import type { PackingItem, Placement } from '../models';

const item = (length: number, width: number, height: number) => ({ length, width, height }) as PackingItem;

describe('rotationsOf', () => {
  it('returns six unique rotations for three unequal edges', () => {
    expect(rotationsOf(item(2, 3, 4))).toHaveLength(6);
  });

  it('removes duplicate rotations for a cube', () => {
    expect(rotationsOf(item(3, 3, 3))).toEqual([{ length: 3, width: 3, height: 3 }]);
  });
});

describe('allowedRotations', () => {
  it('defaults to all six rotations when no constraint is set', () => {
    expect(allowedRotations(item(2, 3, 4))).toHaveLength(6);
    expect(allowedRotations({ ...item(2, 3, 4), orientation: 'free' })).toHaveLength(6);
  });

  it('only turns upright items within the base plane', () => {
    expect(allowedRotations({ ...item(2, 3, 4), orientation: 'upright' })).toEqual([
      { length: 2, width: 3, height: 4 },
      { length: 3, width: 2, height: 4 },
    ]);
  });

  it('collapses to one rotation for an upright item with a square base', () => {
    expect(allowedRotations({ ...item(3, 3, 4), orientation: 'upright' })).toEqual([{ length: 3, width: 3, height: 4 }]);
  });

  it('never swaps any dimension for fixed items', () => {
    expect(allowedRotations({ ...item(2, 3, 4), orientation: 'fixed' })).toEqual([{ length: 2, width: 3, height: 4 }]);
  });
});

describe('intersects', () => {
  const box = (x: number, y: number, z: number): Placement => ({
    itemId: 'box', x, y, z, dimensions: { length: 2, width: 2, height: 2 },
  });

  it('allows boxes whose faces only touch', () => {
    expect(intersects(box(0, 0, 0), box(2, 0, 0))).toBe(false);
  });

  it('detects boxes with overlapping volume', () => {
    expect(intersects(box(0, 0, 0), box(1, 1, 1))).toBe(true);
  });
});
