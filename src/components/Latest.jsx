import { useContext } from "react";
import { shopContext } from "../assets/context/ShopContext";
import { Link } from "react-router-dom";


const Latest = () => {
    const{products, addToCart} = useContext(shopContext);
    return (<div className="mt-4 p-3 text-center">
        <h2 className="text-2xl font-bold">Latest Products</h2>
        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-3 justify-center">
          {products
            .reverse()
            .slice(0, 9)
            .map((item, index) => (
              <div key={index} className="m-2">
                <Link
                  to={`/pd/${item.id}`}
                 
                  className="w-full"
                >
                  <img
                    className="rounded-md w-full h-64 object-cover"
                    src={item.image}
                    alt={item.name}
                  />
                </Link>
                <div className="mt-4">
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
                  className="mt-4 bg-yellow-400 text-white px-6 py-2 rounded-md hover:bg-orange-500 transition duration-300"
                  onClick={() => {
                    addToCart(item.id);
                  }}
                >
                  Add to Cart
                </button>
              </div>
            ))}
        </div>
      </div>
      );

    
}
 
export default Latest;