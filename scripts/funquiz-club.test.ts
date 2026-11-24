import assert from "node:assert/strict";
import { addLink, clubBoard, clubHome, listLinks, login, recordScore, signup } from "../lib/funquiz/club";
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
  assert.equal(home.board[0]?.email, "paul@example.com");
  assert.equal(home.board[0]?.points, 8);
  assert.equal(home.board[0]?.best, 8);
  assert.equal(home.board[0]?.games, 1);
  assert.equal(home.board.find((row) => row.email === "sam@example.com")?.points, 3);
  assert.equal(home.recent.length, 2);
  assert.equal(home.board.length, 2);
  assert.ok(home.scoreboard.games.length >= 22);
  const movie = home.scoreboard.games.find((game) => game.title === "Name That Movie");
  assert.equal(movie?.players.every((row) => row.points === 0 && row.games === 0), true);
  const foodHome = home.scoreboard.games.find((game) => game.title === "Draw the Fast Food");
  assert.equal(foodHome?.players.find((row) => row.id === created.account.id)?.points, 8);
  assert.equal(foodHome?.players.find((row) => row.id === sam.account.id)?.points, 0);
  const turns = home.scoreboard.games.find((game) => game.title === "Fun Quiz · Take turns");
  assert.equal(turns?.players.find((row) => row.id === sam.account.id)?.points, 3);
  assert.ok(home.scoreboard.matches.some((row) => row.email === "sam@example.com" && row.game === "Fun Quiz · Take turns"));
  assert.ok(home.scoreboard.matches.some((row) => row.email === "paul@example.com" && row.game === "Draw the Fast Food" && row.score === 8 && row.won));

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

  const saved = await addLink(created.token, {
    kind: "podcast",
    name: "Night desk",
    url: "https://example.com/night",
    description: "Late interviews",
  });
  assert.ok("item" in saved && saved.item.name === "Night desk");
  const badUrl = await addLink(created.token, { kind: "music", name: "Nope", url: "javascript:alert(1)", description: "no" });
  assert.equal("error" in badUrl ? badUrl.status : 0, 400);
  const podcasts = await listLinks(created.token, "podcast");
  assert.ok(!("error" in podcasts));
  if ("error" in podcasts) return;
  assert.equal(podcasts.items[0]?.email, "paul@example.com");
  assert.equal(podcasts.items[0]?.url, "https://example.com/night");
  const music = await listLinks(sam.token, "music");
  assert.ok(!("error" in music) && music.items.length === 0);
  const book = await addLink(sam.token, {
    kind: "book",
    name: "The City",
    url: "https://example.com/city-book",
    description: "A novel",
  });
  assert.ok("item" in book && book.item.email === "sam@example.com");
  const books = await listLinks(created.token, "book");
  assert.ok(!("error" in books));
  if ("error" in books) return;
  assert.equal(books.items[0]?.name, "The City");
  assert.equal(books.items[0]?.email, "sam@example.com");
  const film = await addLink(created.token, {
    kind: "movie",
    name: "Night Train",
    url: "https://example.com/night-train",
    description: "A film",
  });
  assert.ok("item" in film && film.item.name === "Night Train");
  const series = await addLink(sam.token, {
    kind: "tv",
    name: "Harbor",
    url: "https://example.com/harbor-show",
    description: "A series",
  });
  assert.ok("item" in series && series.item.email === "sam@example.com");
  const shows = await listLinks(created.token, "tv");
  assert.ok(!("error" in shows));
  if ("error" in shows) return;
  assert.equal(shows.items[0]?.name, "Harbor");
  const noUrl = await addLink("", {
    kind: "tv",
    name: "Mobland",
    url: "",
    description: "Tom Hardy in an amazing gangster series",
    savedBy: "",
  });
  assert.ok("item" in noUrl && noUrl.item.name === "Mobland" && noUrl.item.url === "" && noUrl.item.email === "");

  const week = weeklyGame();
  const first = mulberry32(weekSeed(week.path));
  const second = mulberry32(weekSeed(week.path));
  assert.equal(first(), second());
  assert.ok(week.path.startsWith("/draw-the-"));
  console.log("funquiz-club.test.ts OK", week.title);
}

void main();
