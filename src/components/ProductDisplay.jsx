import React, { useContext, useState } from "react";
import Typewriter from "./Typewriter";

import { useParams, useNavigate } from "react-router-dom";
import { shopContext } from "../assets/context/ShopContext";
import { ChevronLeft, X, Star,ChevronRight } from 'lucide-react';

const ProductDisplay = () => {
  const {addToCart, products}= useContext(shopContext);
  const {id} = useParams();
  console.log(id)
  const[count , setCOunt] = useState(1);

  const product = products.find((item) => item.id ===Number(id)); 
  console.log(product)
  
    const colors = [
      { name: "Blue", class: "bg-blue-500" },
      { name: "Red", class: "bg-red-500" },
      { name: "Green", class: "bg-green-500" },
      { name: "White", class: "bg-white border border-orange-300" },
      
      { name: "Any", class: " bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-white via-blue-500 to-purple-500" },
    ];
  
    const [selectedColor, setSelectedColor] = useState("");
  
  const navigate = useNavigate();
    const handleColorSelect = (colorName) => {
      setSelectedColor(colorName);
    };
    const liner = `Yet, fashion is also collective. Global trends
           emerge from runways in Paris, Milan, 
          and New York, influencing street styles
           and wardrobes worldwide. Social media
           platforms amplify these trends, making fashion more
            accessible and inclusive 
           than ever before. Today, fast fashion brands replicate 
           high-end designs at affordable prices, 
           bridging the gap between luxury and everyday wear.

Sustainability has become a
 pivotal aspect of modern fashion.
 As concerns about environmental impact grow, many designers and
  consumers are turning to eco-friendly fabrics, ethical production methods,
   and timeless styles. This shift reflects a broader desire to balance aesthetics with responsibility..`;
   const [rating, setRating] = useState(4);
   const totalStars = 5;
 
   return (
    <>
    <div className="flex border-t relative  border rounded border-orange-200 bg-orange-100 p-4">
    <div className="flex absolute  top-4 left-3/4 transform -translate-x-3/4 items-center space-x-2">
    <h2 className="text-2xl font-bold ">Rating: </h2>
      {Array.from({ length: totalStars }, (_, index) => (
        <div>
        
        <button
          key={index}
          onClick={() => setRating(index + 1)}
          className="focus:outline-none"
        >
          <Star
  className={`w-6 h-6 ${
    rating > index ? "text-yellow-500" : "text-gray-300"
  } transition-all duration-300`}
  fill={rating > index ? "currentColor" : "none"}
/>

        </button>
       </div>
      ))}
    </div>
    {/* Product Image and Actions */}
    {product &&(
    <div className="flex flex-col items-center w-1/3">
      <div className="relative">
  <ChevronLeft className="absolute left-0 top-1/2 w-20 h-20 transform -translate-y-1/2 bg-transparent text-white p-2 hover:text-orange-700"/>
  <img
    src={product.image}
    alt={product.name}
    className="w-[600px] h-[400px] object-cover rounded-md shadow-md"
  />
  <ChevronRight className="absolute right-0 top-1/2 w-20 h-20 transform -translate-y-1/2 bg-transparent hover:text-orange-700 text-white p-2 "/>
  <p className="absolute right-0 bottom-0 text-2xl italic transform  bg-transparent text-white p-2">{count} / 5</p>
</div>
      <div className="flex gap-4 mt-4">
        <button
          className="rounded-md px-4 py-2 bg-yellow-400 text-white hover:bg-orange-500 transition"
          onClick={() => addToCart(product.id)}
        >
          Add to Cart
        </button>
        <button
          className="rounded-md px-4 py-2 bg-lime-500 text-white hover:bg-lime-900 transition"
          onClick={() => addToCart(product.id)}
        >
          Buy Now
        </button>
      </div>
    </div>
)}
    {/* Product Details */}
    <div className="flex relative  flex-col w-2/3 pl-6">
      <h2 className="text-2xl font-bold mb-2">{product.name || "Product Name"}</h2><button onClick ={()=>{navigate(-1)}}className="flex-end absolute text-4xl top-0 right-0 bg-gray-100 px-1 py-1 text-black  hover:bg-red-500 "><X /></button>
      <p className="text-gray-500 text-xl font-semibold mb-2">
        {"Brand Name"}: byd
      </p>
      <div className="text-lg text-gray-700 mb-4">
        <Typewriter text={liner} speed={25} />
      </div>
      <div className="flex flex-row ml-16 text-center gap-[150px]"> 
      <p className="text-3xl font-semibold text-green-600">
                <strong>New Price :</strong>  ${product.newPrice.toFixed(2)}
                </p>
                <p className="text-lg text-gray-400">
              Old Price : <span className="line-through">   ${product.oldPrice.toFixed(2)}</span>
                </p>
                <p className="text-2xl text-red-500">
               Discount :   {parseInt(
                    ((product.oldPrice - product.newPrice) / product.oldPrice) * 100
                  )}
                  % OFF
                </p></div>
      <div className="text-lg font-semibold">
        Colors: {" colors available"}
        <div className="flex flex-wrap gap-4 mt-2">
          {colors.map((color) => (
            <label
              key={color.name}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="radio"
                name="color"
                value={color.name}
                checked={selectedColor === color.name}
                onChange={() => handleColorSelect(color.name)}
                className="hidden"
              />
              <div
                className={`w-10 h-10 rounded-full border-2 ${
                  selectedColor === color.name
                    ? "border-black"
                    : "border-transparent"
                } ${color.class}`}
              ></div>
              <span className="text-gray-700">{color.name}</span>
            </label>
          ))}
        </div>
      </div>
      {selectedColor && (
        <p className="mt-4 text-lg text-gray-700">
          You selected: <strong>{selectedColor}</strong>
        </p>
      )}
    </div>
  </div></>
      
    
  );
};

export default ProductDisplay;
