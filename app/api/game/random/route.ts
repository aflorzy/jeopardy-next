import { constructGame } from "../route";

export async function GET() {
  console.log("Getting random game");
  const maxGameId = 10000;
  const maxTries = 10;
  let id;
  let game: any;
  let tries = 0;
  while ((!game || game.error) && tries++ < maxTries) {
    // Random id based off current time
    id = new Date().getTime() % maxGameId;
    console.log(`Trying game with id: ${id}`);
    game = await constructGame(id);

    if (!game || game.error) {
      console.log(`Invalid id: ${id}. Waiting to retry...`);
      game = null;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log(`Found game: ${id}`);
  return game;
}
