import { DiceRoll } from './types';

export class Dice {
  static roll(): DiceRoll {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;

    return {
      d1,
      d2,
      total: d1 + d2,
      isDouble: d1 === d2
    };
  }

  static rollDoubles(): DiceRoll {
    const value = Math.floor(Math.random() * 6) + 1;

    return {
      d1: value,
      d2: value,
      total: value * 2,
      isDouble: true
    };
  }

  static isValidRoll(roll: DiceRoll): boolean {
    return roll.d1 >= 1 && roll.d1 <= 6 &&
           roll.d2 >= 1 && roll.d2 <= 6 &&
           roll.total === roll.d1 + roll.d2 &&
           roll.isDouble === (roll.d1 === roll.d2);
  }
}
