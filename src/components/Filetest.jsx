import React, { useState, useEffect } from "react";

const Filetest = () => {
  // Define an array of products
  const products = [
    { name: "mango", id: "950t" },
    { name: "orange", id: "9120t" }
  ];

  // Cart state
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Get cart from localStorage on component mount
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  // Function to add product to cart
  const addToCart = (productId) => {
    const product = products.find(p => p.id === productId);  // Find product by id
    if (!product) return;

    const updatedCart = [...cart];
    const existingProductIndex = updatedCart.findIndex(item => item.id === product.id);

    if (existingProductIndex !== -1) {
      // If product exists, increase quantity
      updatedCart[existingProductIndex].quantity += 1;
    } else {
      // If product doesn't exist, add it with quantity 1
      updatedCart.push({ ...product, quantity: 1 });
    }

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // Function to remove product from cart
  const removeFromCart = (productId) => {
    const updatedCart = cart.filter(item => item.id !== productId); // Filter out the product by id
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  return (
    <div>
      <h1>Products</h1>
      <div>
        {products.map(product => (
          <div key={product.id}>
            <h3>{product.name}</h3>
            <button onClick={() => addToCart(product.id)}>Add to Cart</button>
          </div>
        ))}
      </div>

      <h2>Cart</h2>
      <ul>
        {cart.map(item => (
          <li key={item.id}>
            {item.name} - Quantity: {item.quantity}
            <button onClick={() => removeFromCart(item.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Filetest;
