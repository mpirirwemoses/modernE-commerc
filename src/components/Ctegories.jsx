import { useEffect, useState } from "react";

import Items from "./categori";
import { Link } from "react-router-dom";

const Category = ({ title, images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [display , setDisplay] = useState(false);

  

  const handleImageChange = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };
  

  useEffect(() => {
    const interval = setInterval(() => {
      handleImageChange();
    }, 3000); // Change image every 3 seconds
    return () => clearInterval(interval); // Cleanup on component unmount
  }, [images.length]);

  return (<>
    
   <Link
            key={title}
            to={`/${title}`}
            state={{name: title}}
            
          > 
          <div className="flex flex-col items-center w-full max-w-xs mx-auto p-4" >
         
      <div className="relative w-full h-64  transition duration-[2000ms]">
        <img
          src={images[currentIndex]}
          alt="Category"
          className="w-full h-full object-cover rounded-md"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 flex justify-center items-center">
          <div className="text-white p-2 text-center font-semibold">{title}</div>
        </div>
      </div>
    </div>
    </Link>
    </>
    
  );
};

export default Category;
