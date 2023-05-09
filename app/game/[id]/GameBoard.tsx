"use client";
import { Clue, Game, Category, Round } from "@/app/api/game/route";
import React, { useState, useCallback, useEffect } from "react";
import { HiX } from "react-icons/hi";
import { BiShuffle } from "react-icons/bi";
import $ from "jquery";
import Link from "next/link";

const getBaseCategoryFontSize = () => {
  const xl = useMediaQuery(1280);
  const lg = useMediaQuery(1024);
  const md = useMediaQuery(768);
  const sm = useMediaQuery(640);
  const xs = useMediaQuery(475);
  const xxs = useMediaQuery(400);
  const xxxs = useMediaQuery(325);

  const categoryFontSize: number = xxxs
    ? 10
    : xxs
    ? 12
    : xs
    ? 15
    : sm
    ? 20
    : md
    ? 24
    : lg
    ? 32
    : 40;

  return categoryFontSize;
};

const useMediaQuery = (width: number) => {
  const [targetReached, setTargetReached] = useState(false);

  const updateTarget = useCallback((e: any) => {
    if (e.matches) {
      setTargetReached(true);
    } else {
      setTargetReached(false);
    }
  }, []);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${width}px)`);
    media.addEventListener("change", updateTarget);

    // Check on mount (callback is not called until a change occurs)
    if (media.matches) {
      setTargetReached(true);
    }

    return () => media.removeEventListener("change", updateTarget);
  }, []);

  return targetReached;
};

const GameBoard = ({
  gameData,
  randomId,
}: {
  gameData: Game;
  randomId: string | number;
}) => {
  const timeoutDuration = 3000;
  const [selectedRound, setSelectedRound] = useState<Round | null>(
    gameData.jeopardy_round
  );
  const [activeClue, setActiveClue] = useState<Clue | null>(null);
  const [visitedClues, setVisitedClues] = useState<Clue[]>([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [timer, setTimer] = useState(timeoutDuration / 1000);

  useEffect(() => {
    timer > 0 && setInterval(() => setTimer(timer - 1), 1000);
  }, [timer]);

  setTimeout(() => setIsButtonDisabled(false), timeoutDuration);
  const selectRound = (round: string) => {
    if (!gameData) {
      setSelectedRound(null);
      return;
    }

    switch (round) {
      case "Jeopardy! Round":
        setSelectedRound(gameData.jeopardy_round);
        break;
      case "Double Jeopardy! Round":
        setSelectedRound(gameData.double_jeopardy_round);
        break;
    }
  };

  return (
    <div className="container flex flex-col items-center mt-2 mb-8">
      <div className="board max-w-[1280px] relative">
        {activeClue && (
          <div className="clue-overlay-container w-full h-full absolute top-0 left-0">
            <ClueOverlay
              clue={activeClue}
              onClueExit={() => {
                activeClue && setVisitedClues([...visitedClues, activeClue]);
                setActiveClue(null);
              }}
            />
          </div>
        )}
        <div className="categories flex flex-row justify-center items-center sm:gap-2 3xs:gap-1">
          {selectedRound &&
            selectedRound.categories.map((category: Category, index) => (
              <Category
                key={index}
                category={category}
                onClueClick={(e: Clue) => setActiveClue(e)}
                visitedClues={visitedClues}
                colId={index}
                selectedRound={selectedRound}
              />
            ))}
        </div>
      </div>

      <div className="actions-bar flex flex-row gap-16 justify-between items-center">
        <button
          className="bg-fuchsia-500 text-white hover:bg-fuchsia-700 hover:text-gray-300 disabled:bg-fuchsia-950 disabled:text-gray-500 disabled:cursor-not-allowed px-3 py-2 rounded flex flex-row gap-1 justify-center items-center"
          disabled={isButtonDisabled}>
          {!isButtonDisabled && (
            <Link
              href={`/game/${randomId}`}
              className="flex flex-row gap-1 justify-center items-center">
              <BiShuffle size={20} />
              Random
            </Link>
          )}
          {isButtonDisabled && (
            <>
              ({timer})
              Random
            </>
          )}
        </button>

        <div className="radio-group flex flex-row gap-8 font-itc-korinna-std text-white">
          <div className="radio">
            <label>
              <input
                type="radio"
                className="mr-2"
                value="Jeopardy! Round"
                checked={selectedRound?.title === "Jeopardy! Round"}
                onChange={(e) => selectRound(e.target.value)}
              />
              Jeopardy!
            </label>
          </div>
          <div className="radio">
            <label>
              <input
                type="radio"
                className="mr-2"
                value="Double Jeopardy! Round"
                checked={selectedRound?.title === "Double Jeopardy! Round"}
                onChange={(e) => selectRound(e.target.value)}
              />
              Double Jeopardy!
            </label>
          </div>
        </div>

        <button
          className="bg-red-700 text-white hover:bg-red-800 hover:text-gray-300 disabled:bg-red-950 disabled:text-gray-500 disabled:cursor-not-allowed px-3 py-2 rounded"
          onClick={() => setVisitedClues([])}
          disabled={!visitedClues.length}>
          Reset
        </button>
      </div>
    </div>
  );
};

const Category = ({
  category,
  onClueClick,
  visitedClues,
  colId,
  selectedRound,
}: {
  category: Category;
  onClueClick: Function;
  visitedClues: Clue[];
  colId: number;
  selectedRound: Round;
}) => {
  // Function to check if clue has been visited
  const baseCategoryFontSize = getBaseCategoryFontSize();

  useEffect(() => {
    const doResize = () => {
      // Resize category text if it overflows
      const minCellPaddingFraction = 0.075;
      let $textElem = $(`#category-${colId} span`);
      let textWidth = $textElem.outerWidth();
      let textHeight = $textElem.outerHeight();

      let $colElem = $(`#category-${colId}`);
      let colWidth = $colElem.outerWidth();
      let colHeight = $colElem.outerHeight();

      if (!textWidth || !textHeight || !colWidth || !colHeight) return;

      const widthOverflow = textWidth - colWidth * (1 - minCellPaddingFraction);
      const heightOverflow =
        textHeight - colHeight * (1 - minCellPaddingFraction);
      const maxOverflow = Math.max(widthOverflow, heightOverflow);
      if (maxOverflow <= 0) {
        return;
      }

      switch (maxOverflow) {
        case widthOverflow:
          $textElem.css(
            "transform",
            `scale(${colWidth / textWidth - minCellPaddingFraction})`
          );
          break;
        case heightOverflow:
          $textElem.css(
            "transform",
            `scale(${colHeight / textHeight - minCellPaddingFraction})`
          );
          break;
      }
    };

    doResize();
  }, [selectedRound]);

  const isClueVisited = (clue: Clue): boolean => {
    return visitedClues.some(
      (visitedClue) =>
        clue.clue + clue.correctResponse ===
        visitedClue.clue + visitedClue.correctResponse
    );
  };
  return (
    <div className="column text-white flex flex-col sm:gap-2 3xs:gap-1">
      <div
        id={`category-${colId}`}
        className="cell category-title noselect flex flex-row justify-center items-center font-swiss-911-compressed leading-none overflow-hidden"
        style={{ fontSize: `${baseCategoryFontSize}px` }}>
        <span>{category.title}</span>
      </div>

      {category.clues.map((clue: Clue, index) =>
        !clue.clue ? (
          <div
            key={index}
            className="cell missing-clue flex flex-row justify-center items-center text-gray-600">
            <HiX />
          </div>
        ) : isClueVisited(clue) ? (
          <div key={index} className="cell"></div>
        ) : (
          <Clue key={index} clue={clue} onClueClick={onClueClick} />
        )
      )}
    </div>
  );
};

const Clue = ({ clue, onClueClick }: { clue: Clue; onClueClick: Function }) => {
  return (
    <div
      className="cell clueValue noselect flex flex-row justify-center items-center hover:bg-blue-900 hover:cursor-pointer"
      onClick={() => onClueClick(clue)}>
      <div>${clue.value}</div>
    </div>
  );
};

const ClueOverlay = ({
  clue,
  onClueExit,
}: {
  clue: Clue;
  onClueExit: Function;
}) => {
  const [clueRevealed, setClueRevealed] = useState<boolean>(false);
  return (
    <div
      className="clue-overlay noselect p-8 w-full h-full flex flex-col justify-center items-center relative font-itc-korinna-std text-white bg-blue-800 z-10"
      onClick={() => (!clueRevealed ? setClueRevealed(true) : onClueExit())}>
      <div className="clue-text">{clue.clue}</div>
      {clueRevealed && (
        <div className="clue-answer absolute bottom-4">
          Answer: {clue.correctResponse}
        </div>
      )}
    </div>
  );
};

export default GameBoard;
