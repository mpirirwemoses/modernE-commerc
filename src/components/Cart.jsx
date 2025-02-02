import { useEffect, useState, useContext } from "react";
import { shopContext } from "../assets/context/Shopcontext";
import Checkout from "./Checkout";
import {X} from "lucide-react"
import { useNavigate } from "react-router-dom";

const Cart = () => {
    const { cart,clearItem,addToCart, removeFromCart,totalAmount } = useContext(shopContext);
    const navigate = useNavigate();

   /* // Initialize newCart with the cart data and add a "quantity" field
    useEffect(() => {
        const updatedCart = cart.map((item) => ({
            ...item,
            quantity: item.quantity || 1, // Initialize quantity if not present
        }));
        setNewCart(updatedCart);
    }, [cart]);
   
    // Increase the quantity of a specific product
    const increase = (id) => {
        setNewCart((prevCart) =>
            prevCart.map((item) =>
                item.id === id ? { ...item, quantity: item.quantity + 1 } : item
            )
        );
    };

    // Decrease the quantity of a specific product
    const decrease = (id) => {
        setNewCart((prevCart) =>
            prevCart.map((item) =>
                item.id === id && item.quantity > 1
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
        );
    };
*/
    return (
        <div className="flex border border-blue-200 bg-orange-50 p-2 relative rounded items-center justify-center flex-col p-6">
            <button onClick ={()=>{navigate(-1)}} className="absolute w-8 h-8  px-1 py-1 bg-gray-400 hover:bg-red-500 hover:text-white top-4 right-8"><X/></button>
            <div className="flex flex-col items-center mt-[20px] ">
  <h2 className="text-black-500 text-2xl font-semibold italic text-center border-b-[150 px] mb-4">Your Cart</h2>
  
</div>
            {/* Header Row */}
            <div className="">
  <hr className="border-t-2 border-black w-3/4" />
</div>

            <div className="grid grid-cols-6 gap-4 border-b-2 py-4 bg-white pb-2 w-full max-w-5xl text-center font-semibold">
                <p>clear Item</p>
                <p>Item Name</p>
                <p>Image</p>
                <p>Quantity</p>
                <p>Actions</p>
                <p>Amount</p>
            </div>

            {/* Cart Items */}
            <div className="w-full max-w-5xl">
                {cart.map((item) => (
                    <div
                        key={item.id}
                        className="grid grid-cols-6 gap-4 py-2 bg-white border-b items-center text-center"
                    >
                        <button className="ml-16" onClick={()=>{clearItem(item.id)}}><X className="bg-gray-500 hover:bg-red-500 text-white"/></button>
                        <p>{item.name}</p>
                        <img
                            className="rounded w-[50px] h-[50px] object-cover mx-auto"
                            src={item.image}
                            alt={item.name}
                        />
                        <p>{item.quantity}</p>
                        <div className="flex justify-center gap-2">
                            <button
                                onClick={() => addToCart(item.id)}
                                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                            >
                                +
                            </button>
                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                            >
                                -
                            </button>
                        </div>
                        <p>${item.newPrice * item.quantity}</p>
                    </div>

                ))}
                <div className="flex">
                    <Checkout Amount={totalAmount}/>
                </div>
            </div>
        </div>
    );
};

export default Cart;
