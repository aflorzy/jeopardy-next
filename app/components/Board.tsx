"use client";
import React from "react";
import { Category, Clue, Game, Round } from "../api/game/route";
import ProgressBar from "./ProgressBar";
import { HiX } from "react-icons/hi";
import { BiShuffle } from "react-icons/bi";

const INITIAL_ROUND: Round = {
  title: "",
  categories: [],
};
const INITIAL_GAME: Game = {
  id: "",
  game_title: "",
  game_comments: "",
  contestants: [],
  jeopardy_round: INITIAL_ROUND,
  double_jeopardy_round: INITIAL_ROUND,
};

async function fetchGameById(gameId: string | number) {
  const res = await fetch(`api/game?id=${gameId}`, {
    next: {
      revalidate: 60,
    },
  });

  const data = await res.json();
  return data;
}

async function fetchRandomGame() {
  const res = await fetch("api/game/random", {
    next: {
      revalidate: 60,
    },
  });

  const data = await res.json();
  return data;
}

function getLongestWordLength(phrase: string): number {
  const words = phrase.split(" ");
  const longestWord = words.reduce((a, b) => {
    return a.length > b.length ? a : b;
  });
  return longestWord.length;
}

function getCategoryFontSize(title: string): any {
  const longestWordLength = getLongestWordLength(title);

  const baseFontSize = 30;
  const wordLengthThreshhold = 10;
  const titleLengthThreshhold = 16;
  let fontSize = baseFontSize;
  if (longestWordLength >= wordLengthThreshhold) {
    const extraLength = longestWordLength - wordLengthThreshhold;
    const scaleFactor = 0.91;
    fontSize = baseFontSize * Math.pow(scaleFactor, extraLength);
  } else if (title.length >= titleLengthThreshhold) {
    let extraLength = title.length - titleLengthThreshhold;
    extraLength = extraLength > 7 ? 7 : extraLength;
    const scaleFactor = 0.94;
    fontSize = baseFontSize * Math.pow(scaleFactor, extraLength);
  }

  const result = { fontSize: `${fontSize}px`, lineHeight: `${fontSize}px` };
  return result;
}

const Board = () => {
  const [gameId, setGameId] = React.useState<string>("");
  const [gameData, setGameData] = React.useState<Game | null>(null);
  const [activeRound, setActiveRound] = React.useState<Round | null>(
    INITIAL_ROUND
  );
  const [roundRadioSelected, setRoundRadioSelected] =
    React.useState<string>("single");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [activeClue, setActiveClue] = React.useState<Clue | null>(null);
  const [showResponse, setShowResponse] = React.useState<boolean>(false);
  const [selectedClues, setSelctedClues] = React.useState<any[]>([]);
  const [error, setError] = React.useState<boolean>(false);

  const handleGetGameClick = async (event: any) => {
    event.preventDefault();
    setLoading(true);
    const data = await fetchGameById(gameId);
    console.log("Retrieved game by id: ", data);

    initializeGame(data);
  };

  const handleRandomGameClick = async (event: any) => {
    event.preventDefault();
    setLoading(true);
    const data = await fetchRandomGame();
    console.log("Retrieved random game: ", data);

    initializeGame(data);
  };

  const initializeGame = (data: Game) => {
    setGameData(data);

    if (!data) {
      setLoading(false);
      setError(true);
      return;
    }

    setError(false);
    setActiveRound(data.jeopardy_round);
    setActiveClue(null);
    setSelctedClues([]);
    setActiveRound(data.jeopardy_round);
    setRoundRadioSelected("single");
    setGameId(data.id);
    setLoading(false);
  };

  const handleInput = (val: any) => {
    const gameIdTemp = val.target.value;

    if (gameIdTemp) {
      setGameId(gameIdTemp.replace(/\D/g, ""));
    }
  };

  const handleRoundChange = (val: any) => {
    const round = val.target.value;
    setRoundRadioSelected(round);

    if (!gameData) {
      setError(true);
      return;
    }

    setError(false);
    if (round === "single") {
      setActiveRound(gameData.jeopardy_round);
    } else if (round === "double") {
      setActiveRound(gameData.double_jeopardy_round);
    }
  };

  const handleClueValueClick = (
    round: string,
    col: number,
    row: number,
    clue: Clue
  ) => {
    setActiveClue(clue);
    setSelctedClues([...selectedClues, { round, col, row, clue }]);
  };

  const handleClueTextClick = () => {
    if (showResponse) {
      setActiveClue(null);
      setShowResponse(false);
    } else {
      setShowResponse(true);
    }
  };

  const checkClueClicked = (
    round: string,
    col: number,
    row: number
  ): boolean => {
    return selectedClues.some(
      (clue) => clue.round === round && clue.col === col && clue.row === row
    );
  };

  const clueClassBase: string =
    "clue w-36 h-20 bg-blue-800 flex flex-row justify-center items-center";

  return (
    <div className="container flex flex-col p-8 pt-0 items-center">
      {loading && <ProgressBar progressPercentage={100} />}

      {gameData && (
        <p className="game-info font-itc-korinna-std text-2xl underline underline-offset-8">
          {gameData.game_title}
        </p>
      )}
      <div className="actions-bar flex flex-row w-full justify-center items-center gap-16 py-4">
        <form
          className="search-form flex flex-row gap-2 items-center m-4"
          onSubmit={handleGetGameClick}>
          <input
            type="text"
            id="game-id"
            className="w-36 p-2 rounded text-black font-itc-korinna-std text-cente"
            autoComplete="off"
            placeholder="Game ID"
            value={gameId}
            onInput={(val: any) => handleInput(val)}
          />
          <button
            className="bg-green-500 hover:bg-green-700 font-itc-korinna-std text-white py-2 px-4 cursor-pointer rounded disabled:bg-green-900 disabled:cursor-default disabled:text-gray-400"
            type="submit"
            disabled={!gameId || loading || gameId === gameData?.id}>
            Go
          </button>

          <button
            className="bg-fuchsia-500 hover:bg-fuchsia-700 font-itc-korinna-std text-white py-2 px-4 cursor-pointer rounded flex flex-row items-center justify-center gap-1 disabled:bg-fuchsia-900 disabled:cursor-default disabled:text-gray-400"
            type="button"
            disabled={loading}
            onClick={handleRandomGameClick}>
            <BiShuffle size={20} /> Random
          </button>
        </form>

        {gameData && (
          <div className="game-actions flex flex-row gap-4">
            <div className="radio-group flex flex-col font-itc-korinna-std">
              <div className="radio">
                <label className="flex flex-row gap-2 text-white">
                  <input
                    type="radio"
                    value="single"
                    checked={roundRadioSelected === "single"}
                    onChange={handleRoundChange}
                  />
                  Jeopardy!
                </label>
              </div>
              <div className="radio">
                <label className="flex flex-row gap-2 text-white">
                  <input
                    type="radio"
                    value="double"
                    checked={roundRadioSelected === "double"}
                    onChange={handleRoundChange}
                  />
                  Double Jeopardy!
                </label>
              </div>
            </div>

            <button
              className="bg-red-500 hover:bg-red-700 font-itc-korinna-std text-white font-bold py-2 px-4 cursor-pointer rounded disabled:bg-red-900 disabled:cursor-default disabled:text-gray-400"
              disabled={selectedClues.length === 0}
              onClick={() => setSelctedClues([])}>
              Reset
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message flex flex-col justify-center items-center">
          <p className="font-itc-korinna-std text-2xl text-red-500">
            No game was found with that ID. Please try another.
          </p>
        </div>
      )}

      <div className="gameBoard flex flex-row gap-2 justify-center items-center">
        {activeClue && (
          <div
            className="noselect active-clue p-10 w-full h-full flex flex-col justify-center items-center bg-blue-800 text-white font-itc-korinna-std text-5xl cursor-pointer relative"
            onClick={() => handleClueTextClick()}>
            {activeClue.media && (
              <img
                className="text-xl border border-slate-600 p-4 aspect-square mb-12"
                src={activeClue.media}
                alt="Clue media"
              />
            )}
            <span className="text-center p-0 m-0">{activeClue.clue}</span>
            {showResponse && (
              <span className="text-center p-0 m-0 absolute bottom-4 text-2xl">
                Answer: {activeClue.correctResponse}
              </span>
            )}
          </div>
        )}
        {!activeClue &&
          activeRound?.categories.map((category: Category, categoryIndex) => (
            <div className="category flex flex-col gap-2" key={categoryIndex}>
              <div
                className={`category-title h-20 w-36 bg-blue-800 text-white font-swiss-911-compressed noselect flex flex-row justify-center items-center p-2`}
                style={getCategoryFontSize(category.title)}>
                <span className="text-center clue-text">{category.title}</span>
              </div>
              <div className="category-clues flex flex-col gap-2">
                {category.clues.map((clue: Clue, clueIndex) => (
                  <span key={clueIndex}>
                    {(!checkClueClicked(
                      roundRadioSelected,
                      categoryIndex,
                      clueIndex
                    ) &&
                      clue.clue && (
                        <div
                          className={`${clueClassBase} hover:bg-blue-900 cursor-pointer`}
                          onClick={() =>
                            handleClueValueClick(
                              roundRadioSelected,
                              categoryIndex,
                              clueIndex,
                              clue
                            )
                          }>
                          <div className="clueValue noselect">
                            ${clue.value}
                          </div>
                        </div>
                      )) ||
                      (!clue.clue && (
                        <div
                          className={`${clueClassBase} noclue text-gray-700 text-6xl`}>
                          <HiX />
                        </div>
                      )) || <div className={`${clueClassBase}`}></div>}
                  </span>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Board;
