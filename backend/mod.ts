import { euroJackpot } from "./lottery/eurojackpot.ts";
import { powerball } from "./lottery/poweball.ts";
import { drawSchema } from "./lottery/db.ts";
import z from "zod";

export { euroJackpot, powerball };

export const euroJackpotDrawSchema = drawSchema(euroJackpot.schema);
export const powerballDrawSchema = drawSchema(powerball.schema);

export type EuroJackpotDraw = z.infer<typeof euroJackpot.schema>;
export type PowerballDraw = z.infer<typeof powerball.schema>;
export type EuroJackpotResult = z.infer<typeof euroJackpotDrawSchema>;
export type PowerballResult = z.infer<typeof powerballDrawSchema>;
