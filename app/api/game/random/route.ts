import { constructGame } from "../route";

export async function GET() {
  const maxGameId = 10000;
  const id = Math.floor(Math.random() * maxGameId);
  let game: any;
  while (!game || game.error) {
    game = await constructGame(id);

    if (!game || game.error) {
      console.log(`Invalid id: ${id}. Waiting to retry...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log(`Found game: ${id}`);
  return game;
}
