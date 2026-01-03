import { useState, useEffect } from "react";
import type {
  EuroJackpotResult,
  PowerballResult,
} from "@lotteryeverysecond/backend";
import Ball from "./Ball.tsx";
import "./App.css";

function App() {
  const [euroJackpot, setEuroJackpot] = useState<EuroJackpotResult | null>(
    null,
  );
  const [powerball, setPowerball] = useState<PowerballResult | null>(null);
  const [history, setHistory] = useState<
    (EuroJackpotResult | PowerballResult)[]
  >([]);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const itemsPerPage = 20;

  const fetchHistory = async (type: string, page: number) => {
    const response = await fetch(`/history/${type}?page=${page}`);
    const data = await response.json();
    return { data: data.data, total: data.total };
  };

  const refetchAll = async (page: number = 0) => {
    const [euroResult, powerResult] = await Promise.all([
      fetchHistory("eurojackpot", page),
      fetchHistory("powerball", page),
    ]);

    if (page === 0) {
      if (euroResult.data.length > 0) {
        setEuroJackpot(euroResult.data[0]);
      }
      if (powerResult.data.length > 0) {
        setPowerball(powerResult.data[0]);
      }
    }

    const combined = [...euroResult.data, ...powerResult.data]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, itemsPerPage);

    setHistory(combined);
    setTotalCount(Math.max(euroResult.total, powerResult.total));
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    if (page !== 1) {
      setIsPaused(true);
    }
    await refetchAll(page - 1);
  };

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let reconnectAttempt = 0;
    const maxReconnectDelay = 30000;
    const baseDelay = 1000;

    const connect = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

      ws.addEventListener("open", () => {
        reconnectAttempt = 0;
        console.log("WebSocket connected");
      });

      ws.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);

        if (data.lottery_type === "eurojackpot") {
          setEuroJackpot(data as EuroJackpotResult);
          if (!isPaused && currentPage === 1) {
            setHistory((prev) =>
              [data as EuroJackpotResult, ...prev].slice(0, itemsPerPage),
            );
          }
        } else if (data.lottery_type === "powerball") {
          setPowerball(data as PowerballResult);
          if (!isPaused && currentPage === 1) {
            setHistory((prev) =>
              [data as PowerballResult, ...prev].slice(0, itemsPerPage),
            );
          }
        }
      });

      ws.addEventListener("close", () => {
        console.log("WebSocket closed, reconnecting...");
        scheduleReconnect();
      });

      ws.addEventListener("error", (error) => {
        console.error("WebSocket error:", error);
        ws?.close();
      });
    };

    const scheduleReconnect = () => {
      if (reconnectTimeout) {
        return;
      }

      const delay = Math.min(
        baseDelay * Math.pow(2, reconnectAttempt),
        maxReconnectDelay,
      );
      
      reconnectAttempt++;
      console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempt})`);

      reconnectTimeout = setTimeout(() => {
        reconnectTimeout = null;
        connect();
      }, delay);
    };

    connect();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      ws?.close();
    };
  }, [isPaused]);

  const handlePauseToggle = async () => {
    if (isPaused && currentPage === 1) {
      await refetchAll(0);
    }
    setIsPaused(!isPaused);
  };

  const fetchWins = async () => {
    const response = await fetch("/wins");
    const data = await response.json();
    setTotalWins(data.wins);
  };

  useEffect(() => {
    refetchAll(0);
    fetchWins();
    
    const winsInterval = setInterval(fetchWins, 10000);
    return () => clearInterval(winsInterval);
  }, []);

  return (
    <div className="container">
      <header>
        <h1>Lottery Every Second</h1>
        <p className="tagline">
          Why wait a week for disappointment when you can have it every second?
        </p>
        <p className="description">
          We play both Powerball and EuroJackpot lotteries automatically, every
          single second. Watch the dreams come true (or not) in real-time.
        </p>
        <div className="wins-counter">
          <span className="wins-label">Total Jackpot Wins:</span>
          <span className="wins-number">{totalWins}</span>
        </div>
      </header>

      <div className="cards">
        <div className="card eurojackpot">
          <h2>EuroJackpot</h2>
          {euroJackpot ? (
            <>
              <div className="draw-info">
                <span className="draw-label">Game #{euroJackpot.id}</span>
                <span className="score">
                  Match: {(euroJackpot.score * 100).toFixed(1)}%
                </span>
              </div>

              <div className="result-section">
                <h3>Official Draw</h3>
                <div className="numbers">
                  <div className="number-group">
                    <div className="balls">
                      {euroJackpot.draw.numbers.map(
                        (num: number, i: number) => (
                          <Ball key={`draw-${i}`} value={num} />
                        ),
                      )}
                    </div>
                  </div>
                  <div className="number-group">
                    <div className="balls">
                      {euroJackpot.draw.stars.map((star: number, i: number) => (
                        <Ball key={`star-${i}`} value={star} type="star" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="result-section">
                <h3>Our Pick</h3>
                <div className="numbers">
                  <div className="number-group">
                    <div className="balls">
                      {euroJackpot.guesses[0].numbers.map(
                        (num: number, i: number) => (
                          <Ball
                            key={`guess-${i}`}
                            value={num}
                            isMatch={euroJackpot.draw.numbers.includes(num)}
                          />
                        ),
                      )}
                    </div>
                  </div>
                  <div className="number-group">
                    <div className="balls">
                      {euroJackpot.guesses[0].stars.map(
                        (star: number, i: number) => (
                          <Ball
                            key={`guess-star-${i}`}
                            value={star}
                            type="star"
                            isMatch={euroJackpot.draw.stars.includes(star)}
                          />
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="waiting">Waiting for first draw...</p>
          )}
        </div>

        <div className="card powerball">
          <h2>Powerball</h2>
          {powerball ? (
            <>
              <div className="draw-info">
                <span className="draw-label">Game #{powerball.id}</span>
                <span className="score">
                  Match: {(powerball.score * 100).toFixed(1)}%
                </span>
              </div>

              <div className="result-section">
                <h3>Official Draw</h3>
                <div className="numbers">
                  <div className="number-group">
                    <div className="balls">
                      {powerball.draw.numbers.map((num: number, i: number) => (
                        <Ball key={`draw-${i}`} value={num} />
                      ))}
                    </div>
                  </div>
                  <div className="number-group">
                    <div className="balls">
                      <Ball value={powerball.draw.powerball} type="power" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="result-section">
                <h3>Our Pick</h3>
                <div className="numbers">
                  <div className="number-group">
                    <div className="balls">
                      {powerball.guesses[0].numbers.map(
                        (num: number, i: number) => (
                          <Ball
                            key={`guess-${i}`}
                            value={num}
                            isMatch={powerball.draw.numbers.includes(num)}
                          />
                        ),
                      )}
                    </div>
                  </div>
                  <div className="number-group">
                    <div className="balls">
                      <Ball
                        value={powerball.guesses[0].powerball}
                        type="power"
                        isMatch={
                          powerball.draw.powerball ===
                          powerball.guesses[0].powerball
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="waiting">Waiting for first draw...</p>
          )}
        </div>
      </div>

      <div className="info-section">
        <h2>The Astronomical Odds</h2>
        <p>
          You're watching two lotteries being played every single second. Every
          second a new chance to hit it big. But let's talk about what it would
          actually take to win.
        </p>
        <p>
          The odds of winning the Powerball jackpot are 1 in 292,201,338. For
          EuroJackpot, they're slightly better at 1 in 139,838,160. These
          numbers are so large they become meaningless to our brains. This
          website chooses to express these ridiculously large numbers in time.
        </p>
        <p>
          If this website runs 24/7, playing both lotteries every second, here's
          how long it would take <b>on average</b> to hit a jackpot:
        </p>
        <ul>
          <li>
            <strong>Powerball:</strong> Approximately 4.6 years of continuous
            play, every second, to see a single jackpot win.
          </li>
          <li>
            <strong>EuroJackpot:</strong> About 2.2 years of non-stop play to
            witness a jackpot.
          </li>
        </ul>
        <p>
          And that's playing every second. A human buying one ticket per week?
          You'd need to play Powerball for roughly 5.6 million years to have a
          50% chance of winning once. The Neanderthals went extinct only 40,000
          years ago. Humans have existed for about 300,000 years. You'd need to
          live through the entire history of modern humans 18 times over.
        </p>
        <p>
          You are more likely to be struck by lightning (1 in 15,300), become a
          movie star (1 in 1,505,000), or get dealt a royal flush in poker on
          your first hand (1 in 649,740) than to win the lottery jackpot.
        </p>
        <p>
          This website exists to make that absurdity visible. Watch the numbers
          roll. Watch them never match. Feel the seconds tick by. Imagine all
          the money it would cost per ticket. Every second that passes is
          statistics working exactly as expected.
        </p>
      </div>

      <div className="history-section">
        <div className="history-header">
          <h2>Recent History</h2>
          <button className="pause-button" onClick={handlePauseToggle}>
            {isPaused ? "Resume" : "Pause"}
          </button>
        </div>
        <div className="history-table">
          <table>
            <thead>
              <tr>
                <th>Game #</th>
                <th>Type</th>
                <th>Draw</th>
                <th>Guess</th>
                <th>Match</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {history.map((result) => (
                <tr key={`${result.lottery_type}-${result.id}`}>
                  <td>{result.id}</td>
                  <td className="type-cell">
                    {result.lottery_type === "eurojackpot"
                      ? "EuroJackpot"
                      : "Powerball"}
                  </td>
                  <td className="numbers-cell">
                    <div className="balls-inline">
                      {result.lottery_type === "eurojackpot" ? (
                        <>
                          {(result as EuroJackpotResult).draw.numbers.map(
                            (num, i) => (
                              <Ball key={`draw-${i}`} value={num} />
                            ),
                          )}
                          <span className="separator">|</span>
                          {(result as EuroJackpotResult).draw.stars.map(
                            (star, i) => (
                              <Ball
                                key={`star-${i}`}
                                value={star}
                                type="star"
                              />
                            ),
                          )}
                        </>
                      ) : (
                        <>
                          {(result as PowerballResult).draw.numbers.map(
                            (num, i) => (
                              <Ball key={`draw-${i}`} value={num} />
                            ),
                          )}
                          <span className="separator">|</span>
                          <Ball
                            value={(result as PowerballResult).draw.powerball}
                            type="power"
                          />
                        </>
                      )}
                    </div>
                  </td>
                  <td className="numbers-cell">
                    <div className="balls-inline">
                      {result.lottery_type === "eurojackpot" ? (
                        <>
                          {(result as EuroJackpotResult).guesses[0].numbers.map(
                            (num, i) => (
                              <Ball
                                key={`guess-${i}`}
                                value={num}
                                isMatch={(
                                  result as EuroJackpotResult
                                ).draw.numbers.includes(num)}
                              />
                            ),
                          )}
                          <span className="separator">|</span>
                          {(result as EuroJackpotResult).guesses[0].stars.map(
                            (star, i) => (
                              <Ball
                                key={`star-${i}`}
                                value={star}
                                type="star"
                                isMatch={(
                                  result as EuroJackpotResult
                                ).draw.stars.includes(star)}
                              />
                            ),
                          )}
                        </>
                      ) : (
                        <>
                          {(result as PowerballResult).guesses[0].numbers.map(
                            (num, i) => (
                              <Ball
                                key={`guess-${i}`}
                                value={num}
                                isMatch={(
                                  result as PowerballResult
                                ).draw.numbers.includes(num)}
                              />
                            ),
                          )}
                          <span className="separator">|</span>
                          <Ball
                            value={
                              (result as PowerballResult).guesses[0].powerball
                            }
                            type="power"
                            isMatch={
                              (result as PowerballResult).draw.powerball ===
                              (result as PowerballResult).guesses[0].powerball
                            }
                          />
                        </>
                      )}
                    </div>
                  </td>
                  <td className="score-cell">
                    {(result.score * 100).toFixed(1)}%
                  </td>
                  <td className="time-cell">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {history.length === 0 && (
            <p className="waiting">Waiting for results...</p>
          )}
        </div>
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {Math.ceil(totalCount / itemsPerPage)}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= Math.ceil(totalCount / itemsPerPage)}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      </div>

      <footer className="footer">
        <a href="/impressum.html">Impressum</a>
      </footer>
    </div>
  );
}

export default App;
