import * as cheerio from "cheerio";
import { NextResponse } from "next/server";
import * as fs from "fs";

const baseUrl = "https://j-archive.com/showgame.php?game_id=";

export interface Contestant {
  name: string;
  media?: string;
  description?: string;
}
export interface Category {
  title: string;
  comments: string;
  clues: Clue[];
}
export interface Clue {
  clue: string;
  correctResponse: string;
  value: number;
  orderNumber: number;
  media?: string;
  right: string[];
  wrong: string[];
}
export interface Round {
  title: string;
  categories: Category[];
}
export interface Game {
  id: string;
  game_title: string;
  game_comments: string;
  contestants: Contestant[];
  jeopardy_round: Round;
  double_jeopardy_round: Round;
}

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query: string = searchParams.get("id") || "";

  return constructGame(query);
}

export async function constructGame(id: string | number) {
  try {
    // See if game html exists locally, else fetch and save
    let $: cheerio.CheerioAPI;
    console.log("Before existsSync");
    if (fs.existsSync(`public/html/${id}.html`)) {
      $ = cheerio.load(fs.readFileSync(`public/html/${id}.html`, "utf8"));
      console.log("Getting game from fs: ", id);
    } else {
      console.log("Fetching game by id: ", id);
      const response = await fetch(`${baseUrl}${id}`);
      console.log("After fetch");
      const html = await response.text();
      console.log("After text");
      fs.writeFileSync(`public/html/${id}.html`, html);
      console.log("Wrote file");
      $ = cheerio.load(html);
    }
    console.log("After fetching game");

    if ($(".error")?.text().toLowerCase().includes("error: no game")) {
      console.log("Invalid id: ", id);
      return NextResponse.json(null);
    }

    const game: Game = {
      id: id.toString(),
      game_title: $("#game_title").text(),
      game_comments: $("#game_comments").text(),
      contestants: getContestants($),
      jeopardy_round: getRoundData($, "J"),
      double_jeopardy_round: getRoundData($, "DJ"),
    };

    return NextResponse.json(game);
  } catch (err: any) {
    console.log(err);
    return NextResponse.json({
      error: err.message,
    });
  }
}

const getContestants = ($: cheerio.CheerioAPI) => {
  let contestants: Contestant[] = [];
  $(".contestants a").each((i, elem) => {
    let text = $(elem).text();
    // Remove all whitespace except for single space characters
    text = text.replace(/\s\s+/g, " ");

    const contestant = {
      name: $(elem, "a").text().replace(/\s\s+/g, " ").trim(),
      media: $(elem, "a").attr("href")?.replace(/\s\s+/g, " ").trim(),
      // Get outside text from parent element
      description: $(elem)
        .parent()
        .contents()
        .filter(function () {
          return this.type === "text";
        })
        .text()
        .replace(/\s\s+/g, " ")
        .trim(),
    };
    contestants.push(contestant);
  });

  return contestants;
};

// Extract round data
// 3 types: jeopardy_round, double_jeopardy_round, final_round
// Has h2 with title, table with categories, categories with clues
const getRoundData = ($: cheerio.CheerioAPI, roundAbv: string) => {
  let roundData: Round = {
    title: "",
    categories: [],
  };
  const round = roundAbv === "J" ? "jeopardy_round" : "double_jeopardy_round";
  $(`#${round} h2`).each((i, elem) => {
    roundData.title = $(elem).text();
  });

  let categories: Category[] = Array(6).fill({
    title: "",
    comments: "",
    clues: Array(5).fill({
      clue: "",
      correctResponse: "",
      value: 0,
      orderNumber: -1,
      media: "",
      right: [],
      wrong: [],
    }),
  });

  $(`#${round} .category_name`).each((i, elem) => {
    const value = $(elem).text().replace(/\s\s+/g, " ").trim();
    categories = categories.map((cat, index) => {
      if (index === i) {
        return { ...cat, ...{ title: value } };
      } else {
        return cat;
      }
    });
  });

  $(`#${round} .category_comments`).each((i, elem) => {
    const value = $(elem).text().replace(/\s\s+/g, " ").trim();
    categories = categories.map((cat, index) => {
      if (index === i) {
        return { ...cat, ...{ comments: value } };
      } else {
        return cat;
      }
    });
  });

  roundData.categories = getRoundClues($, roundAbv, categories);
  return roundData;
};

const getRoundClues = (
  $: cheerio.CheerioAPI,
  round: string,
  categories: Category[]
) => {
  // Clues are in format `clue_J_1_1` for Jeopardy, `clue_DJ_1_1` for Double Jeopardy
  // Clue responses are in format `clue_J_1_1_r` for Jeopardy, `clue_DJ_1_1_r` for Double Jeopardy

  const numCategories = 6;
  const numClues = 5;

  for (let i = 1; i <= numCategories; i++) {
    for (let j = 1; j <= numClues; j++) {
      const clue = $(`#clue_${round}_${i}_${j}`)
        .text()
        .replace(/\s\s+/g, " ")
        .trim();
      const correctResponse = $(`#clue_${round}_${i}_${j}_r .correct_response`)
        .text()
        .replace(/\s\s+/g, " ")
        .trim();
      const media = $(`#clue_${round}_${i}_${j} a`)
        .attr("href")
        ?.replace(/\s\s+/g, " ")
        .trim();

      // List of names for each correct response
      const right: string[] = [];
      $(`#clue_${round}_${i}_${j}_r .right`).each((i, elem) => {
        right.push($(elem).text().replace(/\s\s+/g, " ").trim());
      });

      // List of names for each incorrect response
      const wrong: string[] = [];
      $(`#clue_${round}_${i}_${j}_r .wrong`).each((i, elem) => {
        wrong.push($(elem).text().replace(/\s\s+/g, " ").trim());
      });

      categories = categories.map((cat, index) => {
        if (index === i - 1) {
          return {
            ...cat,
            ...{
              clues: cat.clues.map((clueObj: Clue, clueIndex: number) => {
                if (clueIndex === j - 1) {
                  return {
                    ...clueObj,
                    ...{
                      clue,
                      correctResponse,
                      value: 200 * j * (round === "DJ" ? 2 : 1),
                      orderNumber: clueObj.orderNumber,
                      media,
                      right,
                      wrong,
                    },
                  };
                } else {
                  return clueObj;
                }
              }),
            },
          };
        } else {
          return cat;
        }
      });
    }
  }

  return categories;
};
