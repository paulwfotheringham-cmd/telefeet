import assert from "node:assert/strict";
import { clubBoard, clubHome, login, recordScore, signup } from "../lib/funquiz/club";
import { mulberry32, weekSeed, weeklyGame } from "../lib/funquiz/weekly";

process.env.SUPABASE_SERVICE_ROLE_KEY = "";

async function main() {
  const created = await signup("paul@example.com", "secret1");
  assert.ok("token" in created && created.token);
  const again = await signup("paul@example.com", "secret1");
  assert.equal("error" in again ? again.status : 0, 409);
  const signed = await login("paul@example.com", "secret1");
  assert.ok("token" in signed && signed.account.name.toLowerCase().startsWith("paul"));
  const wrong = await login("paul@example.com", "nope12");
  assert.equal("error" in wrong ? wrong.status : 0, 401);

  const sam = await signup("sam@example.com", "secret2");
  assert.ok("token" in sam && sam.token);
  await recordScore(created.token, { game: "Draw the Fast Food", roomCode: "ABC123", score: 8, won: true });
  await recordScore(created.token, { game: "Draw the Fast Food", roomCode: "ABC123", score: 8, won: true });
  await recordScore(sam.token, { game: "Fun Quiz · Take turns", roomCode: "XYZ789", score: 3, won: false });
  const home = await clubHome(created.token);
  assert.ok(!("error" in home));
  if ("error" in home) return;
  assert.equal(home.board[0]?.name, created.account.name);
  assert.equal(home.board[0]?.points, 8);
  assert.equal(home.board[0]?.games, 1);
  assert.equal(home.recent.length, 2);
  assert.equal(home.board.length, 2);

  const quiet = await signup("quiet@example.com", "secret3");
  assert.ok("token" in quiet && quiet.token);
  const board = await clubBoard(created.token);
  assert.ok(!("error" in board));
  if ("error" in board) return;
  assert.equal(board.players.length, 3);
  assert.equal(board.players.find((row) => row.name === quiet.account.name)?.games, 0);
  const food = board.games.find((game) => game.title === "Draw the Fast Food");
  assert.equal(food?.players[0]?.name, created.account.name);
  assert.equal(food?.players[0]?.points, 8);
  assert.equal(food?.players[0]?.best, 8);
  assert.equal(food?.players[0]?.wins, 1);
  const quiz = board.games.find((game) => game.title === "Fun Quiz · Take turns");
  assert.equal(quiz?.players[0]?.name, sam.account.name);
  assert.equal(quiz?.players[0]?.points, 3);

  const week = weeklyGame();
  const first = mulberry32(weekSeed(week.path));
  const second = mulberry32(weekSeed(week.path));
  assert.equal(first(), second());
  assert.ok(week.path.startsWith("/draw-the-"));
  console.log("funquiz-club.test.ts OK", week.title);
}

void main();
