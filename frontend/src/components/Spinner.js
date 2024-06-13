import React from "react";
import { PulseLoader } from "react-spinners";

export default function Spinner() {
  return (
    <div className="spinner-overlay">
      <div className="spinner-container">
        <PulseLoader size={50} color={"#223e9c"} loading={true} />
      </div>
    </div>
  );
}
