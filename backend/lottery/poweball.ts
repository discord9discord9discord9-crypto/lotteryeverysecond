import z from "zod";
import { lottery } from "./base.ts";
import { randomInt } from "./util.ts";

const powerball = lottery(
  "powerball",
  z.object({
    type: z.literal("powerball"),
    numbers: z.array(z.number()).length(5),
    powerball: z.number(),
  }),
  {
    async draw() {
      const numbers = new Set<number>();
      while (numbers.size < 5) {
        numbers.add(await randomInt(1, 70));
      }
      const powerball = await randomInt(1, 27);

      return {
        type: "powerball",
        numbers: Array.from(numbers),
        powerball,
      };
    },
    score(guess, target) {
      const matchedNumbers = guess.numbers.filter((n) =>
        target.numbers.includes(n),
      ).length;
      const matchedPowerball = guess.powerball === target.powerball ? 1 : 0;

      return (matchedNumbers + matchedPowerball) / 6;
    },
  },
);

export { powerball };
