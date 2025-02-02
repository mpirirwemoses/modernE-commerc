import React from 'react';

const Card = ({ image, title, description }) => {
  return (
    <div className="card bg-white w-[400px] h-[400px] shadow-lg py-2 px-1 bg-gradient-to-b from-white to-purple-500 rounded-md overflow-hidden transform hover:scale-105 transition-all">
      {/* Image */}
      <div className= "flex-row flex">
      <img className="w-[60px]  rounded-full h-[60px] object-cover" src={image} alt={title} />

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-xl ml-2 font-semibold text-gray-800">{title}</h3>
        </div>
        </div>
        {/* Description */}
        <p className="text-gray-600 mt-2 max-w-full overflow-y-scroll scrollbar  text-black scrollbar-thumb-purple-500 scrollbar-track-purple-200"><span className="w-[50px] ml-16"></span>{description}</p>
        
    
        
      </div>
    )}
    export default Card;