// TicTacToeApp.jsx
// Single-file React component (default export) using Tailwind CSS + Framer Motion.
// Drop this into a React app with Tailwind configured and framer-motion installed.
// Features:
// - 2-player local or vs CPU (easy) mode
// - animated X and O SVGs
// - funny win/lose/draw animations and micro-interactions
// - score tracking, reset, and playful UI
// - accessible and responsive layout

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWinner(board) {
  for (let line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  if (board.every(Boolean)) return "draw";
  return null;
}

function easyAIMove(board, player) {
  // simple AI: win if possible, block if needed, else random
  const opponent = player === "X" ? "O" : "X";
  // try win
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const copy = board.slice();
      copy[i] = player;
      if (checkWinner(copy) === player) return i;
    }
  }
  // try block
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const copy = board.slice();
      copy[i] = opponent;
      if (checkWinner(copy) === opponent) return i;
    }
  }
  // random center-first
  if (!board[4]) return 4;
  const empties = board.map((v, idx) => (!v ? idx : -1)).filter((v) => v !== -1);
  return empties[Math.floor(Math.random() * empties.length)];
}

function XIcon({ animateOn }) {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className="w-20 h-20"
      initial={{ scale: 0.6, rotate: -30 }}
      animate={animateOn ? { scale: [1, 1.08, 1], rotate: [0, 5, 0] } : { scale: 1, rotate: 0 }}
      transition={{ duration: 0.6 }}
    >
      <line x1="20" y1="20" x2="80" y2="80" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
      <line x1="80" y1="20" x2="20" y2="80" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
    </motion.svg>
  );
}

function OIcon({ animateOn }) {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className="w-20 h-20"
      initial={{ scale: 0.6 }}
      animate={animateOn ? { scale: [1, 1.08, 1], rotate: [0, -6, 0] } : { scale: 1, rotate: 0 }}
      transition={{ duration: 0.6 }}
    >
      <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="10" fill="transparent" />
    </motion.svg>
  );
}

export default function TicTacToeApp() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("X");
  const [mode, setMode] = useState("local"); // 'local' or 'cpu'
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [result, setResult] = useState(null);
  const [highlight, setHighlight] = useState([]);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const w = checkWinner(board);
    if (w) {
      setResult(w);
      if (w === "draw") setScores((s) => ({ ...s, draws: s.draws + 1 }));
      else setScores((s) => ({ ...s, [w]: s[w] + 1 }));
      // set highlight line if win
      if (w !== "draw") {
        for (let line of LINES) {
          const [a, b, c] = line;
          if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            setHighlight(line);
            break;
          }
        }
      }
    }
  }, [board]);

  useEffect(() => {
    if (mode === "cpu" && turn === "O" && !result) {
      // simple delay to feel 'human'
      const t = setTimeout(() => {
        const idx = easyAIMove(board, "O");
        makeMove(idx);
      }, 700 + Math.random() * 600);
      return () => clearTimeout(t);
    }
  }, [turn, mode, board, result]);

  function makeMove(i) {
    if (board[i] || result) {
      // silly shake if invalid
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    const copy = board.slice();
    copy[i] = turn;
    setBoard(copy);
    setTurn((t) => (t === "X" ? "O" : "X"));
  }

  function resetBoard(full = false) {
    setBoard(Array(9).fill(null));
    setTurn("X");
    setResult(null);
    setHighlight([]);
    if (full) setScores({ X: 0, O: 0, draws: 0 });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-sky-900 p-6">
      <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Tic Tac Toe — Party Mode</h1>
            <div className="text-sm text-slate-300">Made with ✨ graphics & goofy animations</div>
          </div>

          <div className="mb-4 flex gap-3 items-center">
            <label className="text-slate-300 text-sm">Mode:</label>
            <div className="inline-flex bg-white/6 rounded-full p-1">
              <button
                onClick={() => { setMode("local"); resetBoard(); }}
                className={`px-3 py-1 rounded-full text-sm ${mode === "local" ? "bg-white text-slate-900 font-semibold" : "text-white/80"}`}
              >
                2-player
              </button>
              <button
                onClick={() => { setMode("cpu"); resetBoard(); }}
                className={`px-3 py-1 rounded-full text-sm ${mode === "cpu" ? "bg-white text-slate-900 font-semibold" : "text-white/80"}`}
              >
                vs CPU
              </button>
            </div>
            <div className="ml-auto text-slate-400">Turn: <span className="font-semibold text-white">{turn}</span></div>
          </div>

          <div className={`grid grid-cols-3 gap-3 bg-white/6 p-3 rounded-lg ${shake ? "animate-shake" : ""}`}>
            {board.map((cell, i) => {
              const isHighlight = highlight.includes(i);
              return (
                <motion.button
                  key={i}
                  onClick={() => makeMove(i)}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`aspect-square bg-gradient-to-br from-white/3 to-white/6 rounded-xl flex items-center justify-center relative overflow-hidden border ${isHighlight ? 'ring-4 ring-yellow-400/60' : 'border-white/5'}`}
                >
                  <div className="z-10 text-white text-2xl">
                    <AnimatePresence>
                      {cell === 'X' && (
                        <motion.div key={'x'+i} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
                          <XIcon animateOn={isHighlight} />
                        </motion.div>
                      )}
                      {cell === 'O' && (
                        <motion.div key={'o'+i} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
                          <OIcon animateOn={isHighlight} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* tiny goofy sparkles */}
                  <motion.div
                    aria-hidden
                    initial={{ opacity: 0 }}
                    animate={{ opacity: cell ? 0.15 : 0 }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                      <g>
                        <circle cx="15" cy="20" r="2" fill="white" opacity="0.06" />
                        <circle cx="80" cy="70" r="2" fill="white" opacity="0.06" />
                        <circle cx="50" cy="50" r="1.5" fill="white" opacity="0.06" />
                      </g>
                    </svg>
                  </motion.div>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button onClick={() => resetBoard(false)} className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20">New Round</button>
            <button onClick={() => resetBoard(true)} className="px-4 py-2 rounded-lg bg-rose-500/90 text-white text-sm hover:brightness-105">Reset All</button>
            <div className="ml-auto text-sm text-slate-300">Tip: Click tiles or tap — try to trick the CPU 🤪</div>
          </div>

          <div className="mt-4 p-3 bg-white/3 rounded-xl border border-white/5">
            <div className="flex gap-4 items-center justify-between text-white/90">
              <div className="flex flex-col">
                <div className="text-xs text-slate-300">Scores</div>
                <div className="text-lg font-semibold">X: {scores.X} — O: {scores.O} — Draws: {scores.draws}</div>
              </div>

              <div className="text-right text-sm text-slate-300">
                <div>Mode: <span className="font-medium text-white">{mode === 'cpu' ? 'vs CPU' : 'Local 2-player'}</span></div>
                <div className="mt-1">Last result: <span className="font-semibold text-white">{result || '—'}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: whimsical scoreboard + instructions + celebration */}
        <div className="bg-white/6 p-6 rounded-2xl border border-white/5 shadow-xl flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg bg-white/8 flex items-center justify-center">🎲</div>
            <div>
              <div className="text-white font-bold">Party Board</div>
              <div className="text-slate-300 text-sm">Animated pieces & cheeky soundbites</div>
            </div>
          </div>

          <div className="grow flex flex-col items-center justify-center">
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full text-center"
                >
                  <div className="text-2xl font-extrabold text-white mb-2">
                    {result === 'draw' ? 'It\'s a Draw! 😅' : `${result} Wins! 🎉`}
                  </div>
                  <div className="text-slate-300 mb-3">{result === 'draw' ? 'Nobody scored — free snacks!' : (result === 'X' ? 'X smashed it!' : 'O did the magic!')}</div>

                  {/* playful confetti made from small squares */}
                  <div className="relative w-full h-32 pointer-events-none">
                    {Array.from({ length: 18 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ y: -10, opacity: 0, x: 0 }}
                        animate={{ y: 120 + Math.random() * 40, opacity: 1, x: (Math.random() - 0.5) * 120, rotate: Math.random() * 360 }}
                        transition={{ delay: 0.1 + i * 0.03, duration: 0.9 + Math.random() * 0.6 }}
                        className="w-3 h-3 bg-white/90 rounded-sm absolute"
                        style={{ left: `${10 + (i * 5) % 90}%` }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!result && (
              <div className="text-center text-slate-300">
                <div className="mb-2">Make a move — be as theatrical as you like.</div>
                <div className="text-xs">Protip: center & corners are your friends vs CPU.</div>
              </div>
            )}
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/6">
            <div className="text-sm text-slate-200 mb-2">Controls</div>
            <div className="flex gap-2 text-sm text-slate-300">
              <div className="flex-1">• Click tile to place piece</div>
              <div className="flex-1">• New Round clears board</div>
            </div>
          </div>

          <div className="text-xs text-slate-400">Want mobile-ready version or export as an APK/Expo project? Ask and I\'ll make that next.</div>
        </div>
      </div>

      <style>{`
        .animate-shake { animation: shake 0.35s ease; }
        @keyframes shake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-6px) rotate(-1deg); }
          40% { transform: translateX(6px) rotate(1deg); }
          60% { transform: translateX(-4px) rotate(-1deg); }
          80% { transform: translateX(4px) rotate(1deg); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
