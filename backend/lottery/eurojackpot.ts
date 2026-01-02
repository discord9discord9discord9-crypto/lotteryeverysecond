import z from "zod";
import { lottery } from "./base.ts";
import { randomInt } from "./util.ts";

const euroJackpot = lottery(
  "eurojackpot",
  z.object({
    type: z.literal("eurojackpot"),
    numbers: z.array(z.number()).length(5),
    stars: z.array(z.number()).length(2),
  }),
  {
    async draw() {
      const numbers = new Set<number>();
      while (numbers.size < 5) {
        numbers.add(randomInt(1, 51));
      }
      const stars = new Set<number>();
      while (stars.size < 2) {
        stars.add(randomInt(1, 13));
      }
      return {
        type: "eurojackpot",
        numbers: Array.from(numbers).sort((a, b) => a - b),
        stars: Array.from(stars).sort((a, b) => a - b),
      };
    },
    score(guess, target) {
      const matchedNumbers = guess.numbers.filter((n) =>
        target.numbers.includes(n),
      ).length;
      const matchedStars = guess.stars.filter((s) =>
        target.stars.includes(s),
      ).length;

      return (matchedNumbers + matchedStars) / 7;
    },
  },
);

export { euroJackpot };
