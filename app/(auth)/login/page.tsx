import LoginForm from "../(components)/LoginForm";
import React from "react";

const page = () => {
  return (
    <div className="h-screen flex items-center justify-center p-4 font-poppins">
      <div className="h-fit w-120 bg-white rounded-lg ">
        <LoginForm />
      </div>
    </div>
  );
};

export default page;
