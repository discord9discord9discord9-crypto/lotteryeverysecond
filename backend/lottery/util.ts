import { randomInt as _randomInt } from "node:crypto";

// because this is a websocket server we want give
// the event loop as many oppertunities to do stuff as possible
// this is bad for memory but probably good for throughput
const randomInt = (min: number, max: number) => {
  return new Promise<number>((res, rej) => {
    _randomInt(min, max, (err, result) => {
      if (err) {
        rej(err);
      } else {
        res(result);
      }
    });
  });
};

export { randomInt };
