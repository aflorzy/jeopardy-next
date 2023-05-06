import { constructGame } from "../route";

export async function GET() {
  const maxGameId = 10000;
  const maxTries = 10;
  // Random id based off current time
  const id = new Date().getTime() % maxGameId;
  let game: any;
  let tries = 0;
  while ((!game || game.error) && tries++ < maxTries) {
    game = await constructGame(id);

    if (!game || game.error) {
      console.log(`Invalid id: ${id}. Waiting to retry...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log(`Found game: ${id}`);
  return game;
}
