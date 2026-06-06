import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const arenaFile = path.join(root, "src/pages/arena/index.astro");
const source = fs.readFileSync(arenaFile, "utf8");
const start = source.indexOf("// ===== ArenaEngine START =====");
const end = source.indexOf("// ===== ArenaEngine END =====");

if (start < 0 || end < 0 || end <= start) {
  throw new Error("ArenaEngine markers not found in index.astro");
}

const context = {};
vm.runInNewContext(source.slice(start, end), context, { filename: "ArenaEngine.extract.js" });
const E = context.ArenaEngine;

if (!E) {
  throw new Error("ArenaEngine did not evaluate");
}

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}
function assert(value, message) {
  if (!value) throw new Error(message);
}
function stone(board, row, col, who) {
  board[E.idx(row - 1, col - 1)] = who;
}
function moveName(j) {
  const [r, c] = E.rc(j);
  return `${r + 1},${c + 1}`;
}
function hasAny(value, allowed) {
  return allowed.includes(moveName(value));
}

test("horizontal five wins", () => {
  const b = E.emptyBoard();
  for (let c = 3; c <= 7; c++) stone(b, 8, c, E.BLACK);
  assert(E.checkWin(b, 7, 6, E.BLACK), "black horizontal five should win");
});

test("overline six also wins under free rules", () => {
  const b = E.emptyBoard();
  for (let c = 2; c <= 7; c++) stone(b, 5, c, E.WHITE);
  assert(E.checkWin(b, 4, 5, E.WHITE), "white overline should win");
});

test("vertical five wins", () => {
  const b = E.emptyBoard();
  for (let r = 4; r <= 8; r++) stone(b, r, 10, E.BLACK);
  assert(E.checkWin(b, 6, 9, E.BLACK), "black vertical five should win");
});

test("down diagonal five wins", () => {
  const b = E.emptyBoard();
  for (let i = 0; i < 5; i++) stone(b, 3 + i, 4 + i, E.WHITE);
  assert(E.checkWin(b, 4, 5, E.WHITE), "white down diagonal five should win");
});

test("up diagonal five wins", () => {
  const b = E.emptyBoard();
  for (let i = 0; i < 5; i++) stone(b, 10 - i, 4 + i, E.BLACK);
  assert(E.checkWin(b, 5, 7, E.BLACK), "black up diagonal five should win");
});

test("four is not a win", () => {
  const b = E.emptyBoard();
  for (let c = 4; c <= 7; c++) stone(b, 9, c, E.BLACK);
  assert(!E.checkWin(b, 8, 6, E.BLACK), "four stones must not win");
});

test("empty board candidate starts in center", () => {
  const b = E.emptyBoard();
  assert(moveName(E.candidates(b, 1)[0]) === "8,8", "empty candidate should be center");
});

test("candidate generation stays near existing stones", () => {
  const b = E.emptyBoard();
  stone(b, 8, 8, E.BLACK);
  const names = E.candidates(b, 50).map(moveName);
  assert(names.includes("8,9"), "adjacent candidate missing");
  assert(!names.includes("1,1"), "far candidate should not be generated");
});

test("best move takes immediate winning point", () => {
  const b = E.emptyBoard();
  for (let c = 5; c <= 8; c++) stone(b, 8, c, E.BLACK);
  const move = E.bestMoveFor(b, E.BLACK);
  assert(hasAny(move, ["8,4", "8,9"]), `expected winning end, got ${moveName(move)}`);
});

test("best move blocks opponent immediate win", () => {
  const b = E.emptyBoard();
  for (let c = 5; c <= 8; c++) stone(b, 8, c, E.WHITE);
  const move = E.bestMoveFor(b, E.BLACK);
  assert(hasAny(move, ["8,4", "8,9"]), `expected block, got ${moveName(move)}`);
});

test("full board has no legal moves", () => {
  const b = E.emptyBoard();
  for (let i = 0; i < b.length; i++) b[i] = i % 2 ? E.BLACK : E.WHITE;
  assert(E.isFull(b), "board should be full");
  assert(E.candidates(b, 10).length === 0, "full board should have no candidates");
});

test("legal hint returns bounded readable empty points", () => {
  const b = E.emptyBoard();
  stone(b, 8, 8, E.BLACK);
  const hint = E.legalHint(b, 5);
  assert(hint.split("、").length === 5, `expected 5 hints, got ${hint}`);
  assert(hint.includes("行") && hint.includes("列"), "hint should be readable");
});

test("best move stays under 300ms on midgame board", () => {
  const b = E.emptyBoard();
  for (let i = 0; i < 80; i++) {
    const r = (i * 7 + 3) % 15;
    const c = (i * 11 + 5) % 15;
    const j = E.idx(r, c);
    if (b[j] === E.EMPTY) b[j] = i % 2 ? E.BLACK : E.WHITE;
  }
  const started = performance.now();
  const move = E.bestMoveFor(b, E.BLACK);
  const elapsed = performance.now() - started;
  assert(move >= 0, "engine should return a move");
  assert(elapsed < 300, `engine took ${elapsed.toFixed(2)}ms`);
  return `${elapsed.toFixed(2)}ms`;
});

let passed = 0;
const details = [];
for (const item of tests) {
  const result = item.fn();
  passed += 1;
  details.push(`ok ${passed} - ${item.name}${result ? ` (${result})` : ""}`);
}

console.log(`arena-engine-test: ${passed}/${tests.length} passed`);
for (const line of details) console.log(line);
