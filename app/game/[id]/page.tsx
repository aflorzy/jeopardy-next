import { Game } from "@/app/api/game/route";
import React from "react";
import GameBoard from "./GameBoard";

const BASE_URL = process.env.BASE_URL || "";

const GamePage = async ({ params }: { params: { id: string } }) => {
  const gameDataRaw = await fetch(`${BASE_URL}/api/game?id=${params.id}`, {
    next: {
      revalidate: 60,
    },
  });
  const gameData: Game = await gameDataRaw.json();

  const randomId = Math.floor(Math.random() * 8000);

  return (
    <div className="container text-center">
      {!gameData && (
        <div className="error-message flex flex-col justify-center items-center">
          <p className="font-itc-korinna-std text-2xl text-red-500">
            No game was found with that ID. Please try another.
          </p>
        </div>
      )}
      {gameData && (
        <div className="game-data">
          <div className="subtitle">{gameData?.game_title}</div>

          {gameData && <GameBoard gameData={gameData} randomId={randomId} />}
        </div>
      )}
    </div>
  );
};

export default GamePage;
