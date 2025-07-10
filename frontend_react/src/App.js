import React, { useState, useEffect } from "react";
import "./App.css";

// Color variables from request
const PRIMARY = "#1976d2";
const SECONDARY = "#424242";
const ACCENT = "#e53935";

// Helper functions for game logic
const EMPTY_BOARD = Array(9).fill(null);

// PUBLIC_INTERFACE
function calculateWinner(squares) {
  /** Returns 'X', 'O', or null if the game continues. */
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // columns
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

// PUBLIC_INTERFACE
function isBoardFull(squares) {
  /** Returns true if the board is full (draw). */
  return squares.every((cell) => cell != null);
}

// PUBLIC_INTERFACE
function findBestMove(squares, ai, human) {
  /**
   * Simple minimax-based AI for Tic Tac Toe.
   * Returns the best move index for AI ('O') assuming human is 'X'.
   */
  function minimax(newSquares, depth, isMaximizing) {
    const winner = calculateWinner(newSquares);
    if (winner === ai) return { score: 10 - depth };
    if (winner === human) return { score: depth - 10 };
    if (isBoardFull(newSquares)) return { score: 0 };

    if (isMaximizing) {
      let bestScore = -Infinity;
      let move = null;
      for (let i = 0; i < 9; ++i) {
        if (!newSquares[i]) {
          newSquares[i] = ai;
          const result = minimax(newSquares, depth + 1, false);
          newSquares[i] = null;
          if (result.score > bestScore) {
            bestScore = result.score;
            move = i;
          }
        }
      }
      return { score: bestScore, move };
    } else {
      let bestScore = Infinity;
      let move = null;
      for (let i = 0; i < 9; ++i) {
        if (!newSquares[i]) {
          newSquares[i] = human;
          const result = minimax(newSquares, depth + 1, true);
          newSquares[i] = null;
          if (result.score < bestScore) {
            bestScore = result.score;
            move = i;
          }
        }
      }
      return { score: bestScore, move };
    }
  }

  const { move } = minimax([...squares], 0, true);
  // Fallback: pick the first available cell if minimax doesn't provide a move (only possible if board is full)
  return move !== undefined ? move : squares.findIndex((c) => c === null);
}

// Square component (presentational)
function Square({ value, onClick, disabled, highlight }) {
  return (
    <button
      className="ttt-square"
      style={{
        color: value === "X" ? PRIMARY : value === "O" ? ACCENT : SECONDARY,
        borderColor: highlight ? ACCENT : "var(--border-color)",
        cursor: disabled ? "default" : "pointer",
        background: highlight ? "rgba(229,57,53,0.08)" : "",
        transition: "background 0.2s, border-color 0.2s"
      }}
      onClick={onClick}
      disabled={disabled}
      aria-label={value ? `Cell with ${value}` : "Empty cell"}
      tabIndex={0}
    >
      {value}
    </button>
  );
}

// PUBLIC_INTERFACE
function App() {
  // "X" always goes first
  const [board, setBoard] = useState([...EMPTY_BOARD]);
  const [xIsNext, setXIsNext] = useState(true);
  const [status, setStatus] = useState("");
  const [mode, setMode] = useState("2p"); // "2p" or "ai"
  const [winnerLine, setWinnerLine] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  // Determine next player symbol
  const current = xIsNext ? "X" : "O";

  // Handle cell click
  const handleClick = (idx) => {
    if (board[idx] || gameOver) return;
    if (mode === "ai" && !xIsNext) return; // prevent user clicking during AI turn

    const newBoard = board.slice();
    newBoard[idx] = current;
    updateGameState(newBoard, !xIsNext);
  };

  // Helper to check for win/draw and update state
  const updateGameState = (newBoard, nextX) => {
    const winner = calculateWinner(newBoard);

    if (winner) {
      setStatus(`Winner: ${winner === "X" ? "Player 1" : mode === "2p" ? "Player 2" : "AI"}`);
      setGameOver(true);
      // Find the winning line for highlight
      const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
      ];
      for (const line of lines) {
        const [a, b, c] = line;
        if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
          setWinnerLine(line);
          break;
        }
      }
    } else if (isBoardFull(newBoard)) {
      setStatus("It's a draw!");
      setGameOver(true);
      setWinnerLine([]);
    } else {
      setStatus(
        mode === "2p"
          ? `Next turn: ${nextX ? "Player 1 (X)" : "Player 2 (O)"}`
          : nextX
            ? "Your turn (X)"
            : "AI's turn (O)"
      );
      setGameOver(false);
      setWinnerLine([]);
    }
    setBoard(newBoard);
    setXIsNext(nextX);
  };

  // AI move effect
  useEffect(() => {
    if (mode === "ai" && !xIsNext && !gameOver) {
      // Delay AI move for realism
      const timer = setTimeout(() => {
        const idx = findBestMove(board, "O", "X");
        if (idx !== -1) {
          const newBoard = board.slice();
          newBoard[idx] = "O";
          updateGameState(newBoard, true);
        }
      }, 480);
      return () => clearTimeout(timer);
    }
  }, [board, xIsNext, mode, gameOver]);

  // Game reset handler
  const handleReset = () => {
    setBoard([...EMPTY_BOARD]);
    setXIsNext(true);
    setStatus(mode === "ai" ? "Your turn (X)" : "Next turn: Player 1 (X)");
    setWinnerLine([]);
    setGameOver(false);
  };

  // Mode change handler
  const handleModeChange = (e) => {
    setMode(e.target.value);
    setBoard([...EMPTY_BOARD]);
    setXIsNext(true);
    setWinnerLine([]);
    setGameOver(false);
    setStatus(e.target.value === "ai" ? "Your turn (X)" : "Next turn: Player 1 (X)");
  };

  // Set initial status on mount & mode change
  useEffect(() => {
    setStatus(mode === "ai" ? "Your turn (X)" : "Next turn: Player 1 (X)");
  }, [mode]);

  // --- Responsive/Minimal styling injected for the grid only ---
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
    .ttt-board {
      display: grid;
      grid-template-columns: repeat(3, minmax(68px, 1fr));
      grid-template-rows: repeat(3, minmax(68px, 1fr));
      gap: 8px;
      background: #fff;
      max-width: 330px;
      margin: 0 auto;
      box-shadow: 0 2px 12px 0 rgba(66,66,66,.06), 0 1.5px 4px 0 rgba(25,118,210,0.03);
      border-radius: 18px;
      padding: 20px 14px;
      transition: box-shadow 0.2s, background 0.2s;
    }
    .ttt-square {
      font-size: 2.3rem;
      font-weight: 700;
      border: 2px solid var(--border-color);
      border-radius: 12px;
      min-width: 64px;
      min-height: 64px;
      background: #f8fafb;
      box-shadow: 0 1.5px 4px 0 rgba(25,118,210,0.07);
      outline: none;
      cursor: pointer;
      transition: border-color 0.15s, background .20s;
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ttt-square:active {
      background: #e3eefc;
    }
    .ttt-statusbar {
      margin-bottom: 22px;
      font-size: 1.1rem;
      font-weight: 500;
      color: ${SECONDARY};
      letter-spacing: 0.03em;
      text-align: center;
      min-height: 20px;
    }
    .ttt-mode-select {
      display: flex;
      justify-content: center;
      gap: 14px;
      margin: 8px 0 26px 0;
    }
    .ttt-btn {
      margin-top: 30px;
      margin-bottom: 15px;
      border: none;
      border-radius: 8px;
      padding: 14px 35px;
      font-size: 1.05rem;
      font-weight: 600;
      background: ${PRIMARY};
      color: #fff;
      box-shadow: 0 1.5px 5px 0 rgba(33,33,33,0.06);
      cursor: pointer;
      letter-spacing: .02em;
      transition: background 0.16s;
    }
    .ttt-btn:active, .ttt-btn:hover {
      background: ${ACCENT};
    }
    .ttt-title {
      font-size: 2.8rem;
      font-weight: 800;
      letter-spacing: 0.01em;
      margin-bottom: 2px;
      color: ${PRIMARY};
      text-align: center;
    }
    .ttt-subtitle {
      font-size: 1rem;
      color: ${SECONDARY};
      font-weight: 400;
      text-align: center;
      margin-bottom: 28px;
    }
    @media (max-width: 700px) {
      .ttt-board {
        max-width: 98vw;
        padding: 8px 2px;
        gap: 5px;
      }
      .ttt-square {
        font-size: 1.45rem;
        min-width: 40px;
        min-height: 40px;
        border-radius: 9px;
      }
      .ttt-title {
        font-size: 1.55rem;
      }
      .ttt-btn {
        padding: 10px 18px;
        font-size: 0.9rem;
      }
    }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div
      className="App"
      style={{
        background: "var(--bg-primary)",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh"
      }}
    >
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh"
        }}
      >
        <div className="ttt-title">Tic Tac Toe</div>
        <div className="ttt-subtitle" aria-label="game description">
          Modern, minimalistic two-player &amp; AI game
        </div>
        <div className="ttt-mode-select">
          <label>
            <input
              type="radio"
              name="gameMode"
              value="2p"
              checked={mode === "2p"}
              onChange={handleModeChange}
            />
            2 Player
          </label>
          <label>
            <input
              type="radio"
              name="gameMode"
              value="ai"
              checked={mode === "ai"}
              onChange={handleModeChange}
            />
            Play vs AI
          </label>
        </div>
        <div className="ttt-statusbar" role="status" aria-live="polite">
          {status}
        </div>
        <div className="ttt-board" role="grid" aria-label="tic tac toe board">
          {board.map((cell, idx) => (
            <Square
              key={idx}
              value={cell}
              onClick={() => handleClick(idx)}
              disabled={!!cell || gameOver || (mode === "ai" && !xIsNext)}
              highlight={winnerLine.includes(idx)}
            />
          ))}
        </div>
        <button
          className="ttt-btn"
          onClick={handleReset}
          tabIndex={0}
          aria-label="Reset game"
        >
          Reset Game
        </button>
        <footer style={{ marginTop: "auto", color: "#999", fontSize: "0.9rem", paddingBottom: 8 }}>
          <span>
            &copy; {new Date().getFullYear()} Modern Tic Tac Toe.
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;
