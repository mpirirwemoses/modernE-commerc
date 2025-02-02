import React, { useContext, useState } from "react";
import { shopContext } from "../assets/context/ShopContext";
import { Link } from "react-router-dom";

const Header = () => {
  const {totalItems} = useContext(shopContext)
  // const [cartCount, setCartCount] = useState(3); // Example cart count
  const profileImage = "https://via.placeholder.com/150"; // Replace with actual profile image URL

  return (
    <header className="bg-orange-400  shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left Section: Menu Icon */}
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-md hover:bg-gray-200 focus:ring focus:ring-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-6 h-6 text-gray-700"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Search Bar */}
          <div className="relative flex-1">
            <div className="flex flex-row">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border rounded-l-md focus:outline-none focus:ring focus:ring-blue-300"
            />
             <button
    className="bg-black m--5 text-white ml-[-5 px] px-4 py-2 z-4 rounded-r-md hover:bg-red-300 focus:ring focus:ring-blue-300"
  >
    Search
  </button>
  </div>
            <div className="absolute left-3 top-2 text-gray-400">
                
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 7.65a7.5 7.5 0 010 10.6z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Right Section: Cart & Profile */}
  <div className="flex items-center space-x-8">
          {/* Cart Icon with Counter */}
          <Link to= "/cart">      <div className="relative">
            <button className="p-2 rounded-md hover:bg-gray-200 focus:ring focus:ring-gray-300">
            <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  className="w-6 h-6 text-gray-700"
>
  <circle cx="9" cy="21" r="1" />
  <circle cx="20" cy="21" r="1" />
  <path d="M1 1h4l2.68 13.39a1 1 0 0 0 1 .61h9.72a1 1 0 0 0 1-.76l3.38-12.33H5.22" />
</svg>

            </button>
            <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs font-bold rounded-full h-8 w-8 flex items-center justify-center">
              {totalItems}
            </span>
          </div></Link>

          {/* Profile Image */}
          <img
            src={profileImage}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-blue-500"
          />
        </div>
      </div>
      </header>
   
  );
};

export default Header;
