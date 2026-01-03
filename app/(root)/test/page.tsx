"use client"
import React, { useState } from "react";

const Page = () => {
    const [open, setOpen] = useState<boolean>(false);
    
  return (
    <div className="font-poppins text-white w-full flex h-screen items-center justify-center">
      <h1>Test page</h1>

      <div className="relative"> {/* Added wrapper for positioning */}
        <button
          id="dropdownDefaultButton"
          data-dropdown-toggle="dropdown"
          className="inline-flex items-center justify-center text-white bg-brand box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none"
          type="button"
          onClick={() => setOpen(!open)}
        >
          Dropdown button
          <svg
            className={`w-4 h-4 ms-1.5 -me-0.5 transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m19 9-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown menu - conditionally rendered based on open state */}
        {open && (
          <div
            id="dropdown"
            className="absolute top-full left-0 mt-2 z-10 bg-neutral-primary-medium border border-default-medium rounded-base shadow-lg w-44 h-40 overflow-y-scroll"
          >
            <ul
              className="p-2 text-sm text-body font-medium"
              aria-labelledby="dropdownDefaultButton"
            >
              {[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map((item)=>(
                <li key={item}>Testing</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;