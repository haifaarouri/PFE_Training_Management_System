import React from "react";
import { PulseLoader } from "react-spinners";

const Spinner = () => {
  return (
    <div className="spinner-overlay">
      <div className="spinner-container">
        <PulseLoader size={50} color={"#223e9c"} loading={true} />
      </div>
    </div>
  );
};

export default Spinner;
