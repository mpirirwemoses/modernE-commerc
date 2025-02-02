import React from "react";
import Category from "./Ctegories";
import items from "./Maps";

import image2 from '../assets/images/StockCake-Bold Fashion Statement_1725943050.jpg';
import image3 from '../assets/images/StockCake-Colorful Boutique Shopping_1725943175.jpg';
import image4 from '../assets/images/StockCake-Colorful eyeglasses collection_1725943583.jpg';
import image5 from '../assets/images/StockCake-Corporate Event Gathering_1725730960.jpg';
import image6 from '../assets/images/StockCake-Edgy Fashion Pose_1725942587.jpg';
import image7 from '../assets/images/StockCake-Edgy Fashion Pose_1725943075.jpg';
import image8 from '../assets/images/StockCake-Elegant Professional Attire_1725943120.jpg';
import image9 from '../assets/images/StockCake-Fashionable Businesswoman Posing_1725943109.jpg';
import image10 from '../assets/images/StockCake-Focused Technical Professional_1725730789.jpg';
import image11 from '../assets/images/StockCake-Focused Office Workers_1725730342.jpg';
import image12 from '../assets/images/StockCake-Futuristic Fashion Model_1725942572.jpg';
import image13 from '../assets/images/StockCake-Joyful Eyewear Fashion_1725943539.jpg';
import image14 from '../assets/images/StockCake-Urban Style Cycling_1725943255.jpg';

const categories = [
  {
    title: "Men",
    images: [image2, image4, image3],
  },
  {
    title: "Women",
    images: [image5,image6,image7],
  },
  {
    title: "Kids",
    images: [image8, image9, image10],
  },
];

const CategoriesList = () => {
  return (<>
    <h2 className="text-2xl text-center block font-bold">Our Categories</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      
      {categories.map((category, index) => (
        <Category key={index} title={category.title} images={category.images} />
      ))}
    </div>
    </>
  );
};

export default CategoriesList;
