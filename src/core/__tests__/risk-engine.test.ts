import { describe, expect, it } from 'vitest';
import { detectRisks } from '../risk-engine';
import type { PackingItem, PackingPlan, Suitcase } from '../models';

const suitcase: Suitcase = { length: 10, width: 8, height: 6, maxWeight: 10 };
const item = (id: string, overrides: Partial<PackingItem> = {}): PackingItem => ({ id, name: id, category: '其他', length: 2, width: 2, height: 2, weight: 1, priority: 2, mustHave: false, ...overrides });
const basePlan = (): PackingPlan => ({ id: 'comfort', name: '舒适版', placements: [], unplaced: [], totalWeight: 0, usedVolume: 0, capacityRatio: 0 });

describe('detectRisks', () => {
  it('reports overweight and high volume', () => {
    const plan = { ...basePlan(), totalWeight: 11, usedVolume: 460, capacityRatio: 0.96 };
    expect(detectRisks(plan, suitcase, []).map((risk) => risk.id)).toEqual(expect.arrayContaining(['overweight', 'high-volume']));
  });

  it('reports an oversized unplaced item', () => {
    const huge = item('huge', { length: 11 });
    const plan = { ...basePlan(), unplaced: [{ item: huge, reason: '没有可用的连续空间' }] };
    expect(detectRisks(plan, suitcase, [huge]).some((risk) => risk.id === 'oversized-huge')).toBe(true);
  });

  it('flags direction-constrained items instead of calling them oversized', () => {
    const bottle = item('bottle', { length: 2, width: 2, height: 7, orientation: 'upright' });
    const plan = { ...basePlan(), unplaced: [{ item: bottle, reason: '方向受限（保持直立）：仅横放才能装入，未放入箱内' }] };
    const risks = detectRisks(plan, suitcase, [bottle]);
    expect(risks).toContainEqual(expect.objectContaining({ id: 'orientation-bottle', severity: 'warning' }));
    expect(risks.some((risk) => risk.id === 'oversized-bottle')).toBe(false);
  });

  it('still counts a must-have item lost to direction limits as missing', () => {
    const bottle = item('bottle', { length: 2, width: 2, height: 7, orientation: 'upright', mustHave: true });
    const plan = { ...basePlan(), unplaced: [{ item: bottle, reason: '方向受限（保持直立）：仅横放才能装入，未放入箱内' }] };
    const risks = detectRisks(plan, suitcase, [bottle]);
    expect(risks).toContainEqual(expect.objectContaining({ id: 'missing-bottle', severity: 'critical' }));
  });

  it('reports fragile items with a box stacked above', () => {
    const glass = item('glass', { fragile: true });
    const top = item('top');
    const plan = { ...basePlan(), placements: [
      { itemId: 'glass', x: 0, y: 0, z: 0, dimensions: { length: 2, width: 2, height: 2 } },
      { itemId: 'top', x: 0, y: 0, z: 2, dimensions: { length: 2, width: 2, height: 2 } },
    ] };
    expect(detectRisks(plan, suitcase, [glass, top]).some((risk) => risk.id === 'fragile-glass')).toBe(true);
  });

  it('reports heavy items placed high', () => {
    const heavy = item('heavy', { weight: 4 });
    const plan = { ...basePlan(), placements: [{ itemId: 'heavy', x: 0, y: 0, z: 4, dimensions: { length: 2, width: 2, height: 2 } }] };
    expect(detectRisks(plan, suitcase, [heavy]).some((risk) => risk.id === 'high-heavy')).toBe(true);
  });

  it('marks an omitted must-have item as critical', () => {
    const required = item('passport', { mustHave: true });
    const plan = { ...basePlan(), unplaced: [{ item: required, reason: '空间不足' }] };
    expect(detectRisks(plan, suitcase, [required])).toContainEqual(expect.objectContaining({ id: 'missing-passport', severity: 'critical' }));
  });
});
