export interface EuroJackpotDraw {
  type: "eurojackpot";
  numbers: number[];
  stars: number[];
}

export interface PowerballDraw {
  type: "powerball";
  numbers: number[];
  powerball: number;
}

export interface DrawResult<T> {
  id: number;
  lottery_type: string;
  draw: T;
  guesses: T[];
  score: number;
  timestamp: string;
}

export type EuroJackpotResult = DrawResult<EuroJackpotDraw>;
export type PowerballResult = DrawResult<PowerballDraw>;
