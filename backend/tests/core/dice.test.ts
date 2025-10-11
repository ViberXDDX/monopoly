import { describe, it, expect } from 'vitest';
import { Dice } from '../../src/core/dice';

describe('Dice', () => {
  describe('roll', () => {
    it('should roll valid dice', () => {
      const roll = Dice.roll();

      expect(roll.d1).toBeGreaterThanOrEqual(1);
      expect(roll.d1).toBeLessThanOrEqual(6);
      expect(roll.d2).toBeGreaterThanOrEqual(1);
      expect(roll.d2).toBeLessThanOrEqual(6);
      expect(roll.total).toBe(roll.d1 + roll.d2);
      expect(roll.isDouble).toBe(roll.d1 === roll.d2);
    });

    it('should roll different values on multiple calls', () => {
      const rolls = Array.from({ length: 10 }, () => Dice.roll());
      const totals = rolls.map(r => r.total);

      // Should have some variation (very unlikely all same)
      const uniqueTotals = new Set(totals);
      expect(uniqueTotals.size).toBeGreaterThan(1);
    });

    it('should occasionally roll doubles', () => {
      const rolls = Array.from({ length: 100 }, () => Dice.roll());
      const doubles = rolls.filter(r => r.isDouble);

      // Should have some doubles (probability is 1/6)
      expect(doubles.length).toBeGreaterThan(0);
    });
  });

  describe('rollDoubles', () => {
    it('should always roll doubles', () => {
      const roll = Dice.rollDoubles();

      expect(roll.d1).toBe(roll.d2);
      expect(roll.isDouble).toBe(true);
      expect(roll.total).toBe(roll.d1 * 2);
    });

    it('should roll valid dice values', () => {
      const roll = Dice.rollDoubles();

      expect(roll.d1).toBeGreaterThanOrEqual(1);
      expect(roll.d1).toBeLessThanOrEqual(6);
      expect(roll.d2).toBeGreaterThanOrEqual(1);
      expect(roll.d2).toBeLessThanOrEqual(6);
    });
  });

  describe('isValidRoll', () => {
    it('should validate correct roll', () => {
      const roll = { d1: 3, d2: 4, total: 7, isDouble: false };
      expect(Dice.isValidRoll(roll)).toBe(true);
    });

    it('should validate double roll', () => {
      const roll = { d1: 3, d2: 3, total: 6, isDouble: true };
      expect(Dice.isValidRoll(roll)).toBe(true);
    });

    it('should reject invalid dice values', () => {
      const roll = { d1: 7, d2: 4, total: 11, isDouble: false };
      expect(Dice.isValidRoll(roll)).toBe(false);
    });

    it('should reject incorrect total', () => {
      const roll = { d1: 3, d2: 4, total: 8, isDouble: false };
      expect(Dice.isValidRoll(roll)).toBe(false);
    });

    it('should reject incorrect double flag', () => {
      const roll = { d1: 3, d2: 3, total: 6, isDouble: false };
      expect(Dice.isValidRoll(roll)).toBe(false);
    });
  });
});
