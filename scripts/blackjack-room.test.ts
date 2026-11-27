import assert from "node:assert/strict";
import {
  addBlackjackPlayer,
  applyBlackjackRoomAction,
  createBlackjackRoom,
  createMultiHumanGame,
  startBlackjackRoom,
  toBlackjackClientState,
} from "../lib/blackjack/room";
import { clearBlackjackRoomsForTests, persistNewBlackjackRoom, loadBlackjackRoom } from "../lib/blackjack/room-store";

clearBlackjackRoomsForTests();

let room = createBlackjackRoom("host-1", "Host", "ABCD12");
assert.equal(room.phase, "lobby");
assert.equal(room.players.length, 1);

room = addBlackjackPlayer(room, "guest-1", "Guest");
assert.equal(room.phase, "playing");
assert.equal(room.players.length, 2);
assert.ok(room.game);
assert.equal(room.game!.seats.filter((s) => s.isHuman).length, 2);
assert.equal(room.game!.seats.filter((s) => !s.isHuman).length, 3);

const client = toBlackjackClientState(room, "guest-1");
assert.equal(client.game?.humanSeatId, "guest-1");
assert.equal(client.waitingForGuest, false);

let soloHost = createBlackjackRoom("host-2", "SoloHost", "EFGH34");
soloHost = startBlackjackRoom(soloHost, "host-2");
assert.equal(soloHost.phase, "playing");
assert.equal(soloHost.game!.seats.filter((s) => s.isHuman).length, 1);
assert.equal(soloHost.game!.seats.filter((s) => !s.isHuman).length, 4);

const multi = createMultiHumanGame([
  { id: "a", name: "A" },
  { id: "b", name: "B" },
]);
assert.equal(multi.seats.length, 5);

let playing = createBlackjackRoom("h", "H", "JKLM56");
playing = addBlackjackPlayer(playing, "g", "G");
playing = applyBlackjackRoomAction(playing, "h", { type: "SELECT_CHIP", amount: 25 });
playing = applyBlackjackRoomAction(playing, "h", { type: "ADD_BET" });
const hostSeat = playing.game!.seats.find((s) => s.id === "h")!;
const guestSeat = playing.game!.seats.find((s) => s.id === "g")!;
assert.ok(hostSeat.pendingBet > 0);
assert.equal(guestSeat.pendingBet, 0);

async function storeSmoke() {
  await persistNewBlackjackRoom(createBlackjackRoom("p", "P", "STORE1"));
  const loaded = await loadBlackjackRoom("STORE1");
  assert.ok(loaded);
  assert.equal(loaded!.hostId, "p");
}

void storeSmoke().then(() => {
  console.log("blackjack-room.test.ts OK");
});
