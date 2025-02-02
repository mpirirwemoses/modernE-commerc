import { useContext } from "react";
import { shopContext } from "../assets/context/ShopContext";
import {Link} from "react-router-dom";

const Item = (props) => {
  const { products, addToCart } = useContext(shopContext);

  return (
    
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4 bg-purple-200">
          {products.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-center bg-white shadow-md rounded-md p-4 hover:shadow-lg transition-shadow"
            >
              <Link
            key={item.id}
            to={`/pd/${item.id}`}
            className="w-full"
              >
                <img
                  className="rounded-md w-full h-64 object-cover"
                  src={item.image}
                  alt={item.name}
                />
              </Link>
              <div className="mt-4 text-center">
                <p className="text-lg font-bold text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-500">{item.category}</p>
                <p className="text-md font-semibold text-green-600">
                  ${item.newPrice.toFixed(2)}
                </p>
                <p className="text-sm text-gray-400 line-through">
                  ${item.oldPrice.toFixed(2)}
                </p>
                <p className="text-sm text-red-500">
                  {parseInt(
                    ((item.oldPrice - item.newPrice) / item.oldPrice) * 100
                  )}
                  % OFF
                </p>
              </div>
              <button
                className="mt-4 bg-yellow-400 text-white px-6 py-2 rounded-md hover:bg-yellow-500 transition"
                onClick={ ()=>{addToCart(item.id)}}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      );
    };
export default Item;
