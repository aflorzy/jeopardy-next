"use client";
import Link from "next/link";
import React from "react";
import { BiShuffle } from "react-icons/bi";

const Random = ({ randomId }: { randomId: number | string }) => {
  return (
    <Link
      href={`/game/${randomId}`}
      className="bg-blue-500 text-white hover:bg-blue-700 hover:text-gray-300 disabled:bg-blue-950 disabled:text-gray-500 disabled:cursor-not-allowed px-3 py-2 rounded flex flex-row gap-1 justify-center items-center">
      <BiShuffle size={20} />
      Random
    </Link>
  );
};

export default Random;
