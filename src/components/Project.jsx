import React from "react";

const ProjectCard = ({id,title, description, image }) => {
  
console.log(image)
  return (
    <div className="group w-[200px] sm:w-[400px] lg:w-[600px] relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
      {/* Project Image */}
     {image && (<img
        className="w-full h-[600px] object-cover transform group-hover:scale-110 transition-transform duration-300 "
        src={image}
        alt={`Project ${id}`}
      />
    ) }
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-0 group-hover:opacity-80 transition-opacity duration-300"></div>

      {/* Content */}
      <div className="absolute bottom-24 left-0 w-full p-4 text-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm mt-2">{description}</p>
       
      </div>
      <div className ="absolute bottom-0 left-0 w-full p-4 text-center text-white ">
      <button className="rounded-full px-8 py-3 w-[200px] text-lg font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-md transition-all duration-500 hover:shadow-[0_0_15px_5px_rgba(128,0,255,0.6)] hover:scale-105 hover:bg-gradient-to-l from-purple-900 to-transparent">
          view 
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
