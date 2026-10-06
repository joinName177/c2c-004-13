import { describe, expect, it } from 'vitest';
import { packItems, validateSuitcase } from '../packing-engine';
import type { PackingItem, Suitcase } from '../models';

const suitcase = (overrides: Partial<Suitcase> = {}): Suitcase => ({ length: 10, width: 8, height: 6, maxWeight: 10, ...overrides });
const item = (id: string, overrides: Partial<PackingItem> = {}): PackingItem => ({
  id, name: id, category: '衣物', length: 3, width: 2, height: 1, weight: 1, priority: 2, mustHave: false, ...overrides,
});

describe('validateSuitcase', () => {
  it('rejects each non-positive capacity', () => {
    expect(validateSuitcase(suitcase({ height: 0 }))).toContain('行李箱高度必须大于 0');
    expect(validateSuitcase(suitcase({ maxWeight: -1 }))).toContain('承重必须大于 0');
  });
});

describe('packItems', () => {
  it('allows total weight exactly at the suitcase limit', () => {
    const plan = packItems(suitcase({ maxWeight: 2 }), [item('a'), item('b')], 'comfort');
    expect(plan.placements).toHaveLength(2);
    expect(plan.totalWeight).toBe(2);
  });

  it('uses rotation when the original orientation does not fit', () => {
    const plan = packItems(suitcase({ length: 4, width: 3, height: 2 }), [item('rotated', { length: 2, width: 4, height: 3 })], 'comfort');
    expect(plan.placements[0]?.dimensions).toEqual({ length: 4, width: 3, height: 2 });
  });

  it('keeps placements inside bounds and non-overlapping', () => {
    const plan = packItems(suitcase(), [item('a'), item('b'), item('c')], 'comfort');
    expect(plan.placements.every((p) => p.x + p.dimensions.length <= 10 && p.y + p.dimensions.width <= 8 && p.z + p.dimensions.height <= 6)).toBe(true);
    expect(new Set(plan.placements.map((p) => `${p.x}:${p.y}:${p.z}`)).size).toBe(3);
  });

  it('returns deterministic coordinates and an unplaced reason', () => {
    const inputs = [item('a'), item('huge', { length: 30 })];
    expect(packItems(suitcase(), inputs, 'comfort')).toEqual(packItems(suitcase(), inputs, 'comfort'));
    expect(packItems(suitcase(), inputs, 'comfort').unplaced[0]?.reason).toContain('空间');
  });

  it('turns upright items within the base plane without changing height', () => {
    const plan = packItems(suitcase({ length: 3, width: 4, height: 2 }), [item('bottle', { length: 4, width: 3, height: 2, orientation: 'upright' })], 'comfort');
    expect(plan.placements[0]?.dimensions).toEqual({ length: 3, width: 4, height: 2 });
  });

  it('leaves upright items out with a direction reason when only lying down fits', () => {
    const bottle = item('bottle', { length: 2, width: 2, height: 5, orientation: 'upright' });
    const plan = packItems(suitcase({ height: 4 }), [bottle], 'comfort');
    expect(plan.placements).toHaveLength(0);
    expect(plan.unplaced[0]?.reason).toContain('方向受限');
    expect(plan.unplaced[0]?.reason).toContain('保持直立');
  });

  it('never swaps dimensions for fixed items and explains the restriction', () => {
    const gear = item('gear', { length: 2, width: 4, height: 3, orientation: 'fixed' });
    const plan = packItems(suitcase({ length: 4, width: 3, height: 2 }), [gear], 'comfort');
    expect(plan.placements).toHaveLength(0);
    expect(plan.unplaced[0]?.reason).toContain('方向受限');
    expect(plan.unplaced[0]?.reason).toContain('保持原方向');
  });

  it('still rotates items without a constraint into the same space', () => {
    const plan = packItems(suitcase({ length: 4, width: 3, height: 2 }), [item('gear', { length: 2, width: 4, height: 3 })], 'comfort');
    expect(plan.placements).toHaveLength(1);
  });
});
