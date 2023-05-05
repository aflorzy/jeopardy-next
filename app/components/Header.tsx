import Link from "next/link";
import React from "react";

const Header = () => {
  return (
    <header className="header flex flex-col items-center">
      <h1 className="title">
        <Link href="https://j-archive.com/">Jeopardy</Link>
      </h1>
    </header>
  );
};

export default Header;
