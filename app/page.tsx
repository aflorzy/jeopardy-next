import React from "react";
import Random from "./components/Random";

const Home = async () => {
  const initialRandomId = Math.floor(Math.random() * 8000);
  return (
    <>
      <Random randomId={initialRandomId} />
    </>
  );
};

export default Home;
