import { createContext, useEffect, useState } from "react";
import items from "../../components/Maps";
export const shopContext = createContext(null)
const ShopcontextProvider = (props) => {
const products = [...items];
    const[cart , setCart] = useState([])
    const [loggedIn , setIsLoggedIn] = useState(false)


   /* const addToCart = (productId)=>{
        const temporaryCart = [];
        if(loggedIn===false){
            temporaryCart.push(productId );
localStorage.setItem("cart", json.stringify(temporaryCart))
            

        }
        
        else{
            const currentCart = JSON.parse(localStorage.getItem("cart"))
        const updatedCart = [...cart]
            // Iterate through each product ID in local storage
  currentCart.forEach((id) => {
    const product = products.find((product) => product.id === id);
    const existingIndex = updatedCart.findIndex((item) => item.id === id);

    if (existingIndex !== -1) {
      // If product exists in the updated cart, increment its quantity
      updatedCart[existingIndex].quantity += 1;
    } else if (product) {
      // If product doesn't exist, add it with quantity 1
      updatedCart.push({ ...product, quantity: 1 });
    }
  })
        
        const product = products.find((product)=> product.id === productId)
        const existing = cart.findIndex((id)=> id===productId)
        if (existing !== -1) {
            // If product exists, increase quantity
            updatedCart[existing].quantity += 1;
          } else {
            // If product doesn't exist, add it with quantity 1
            updatedCart.push({ ...product, quantity: 1 });
          }
      
          setCart(updatedCart);
        } 
    }

    const addToCart = (productId) => {
      const temporaryCart = JSON.parse(localStorage.getItem("cart")) || [];
  
      if (!loggedIn) {
          // User not logged in: Add productId to localStorage
          temporaryCart.push(productId);
          localStorage.setItem("cart", JSON.stringify(temporaryCart));
      } else {
          // User logged in: Synchronize cart and update state
          const updatedCart = [...cart];
          
          // Add product IDs from localStorage to the cart
          temporaryCart.forEach((id) => {
              const product = products.find((p) => p.id === id);
              const existingIndex = updatedCart.findIndex((item) => item.id === id);
  
              if (existingIndex !== -1) {
                  updatedCart[existingIndex].quantity += 1;
              } else if (product) {
                  updatedCart.push({ ...product, quantity: 1 });
              }
          });
  
          // Add the currently selected productId to the cart
          const product = products.find((p) => p.id === productId);
          const existingIndex = updatedCart.findIndex((item) => item.id === productId);
  
          if (existingIndex !== -1) {
              updatedCart[existingIndex].quantity += 1;
          } else if (product) {
              updatedCart.push({ ...product, quantity: 1 });
          }
  
          setCart(updatedCart);
          console.log(cart)
      }
  };*/
  const addToCart = (productId) => {
    // Retrieve existing cart from localStorage or initialize an empty array
    const temporaryCart = JSON.parse(localStorage.getItem("cart")) || [];
    const updatedCart = [];

    // Add product IDs from localStorage to the updated cart
    temporaryCart.forEach((id) => {
        const product = products.find((p) => p.id === id);
        const existingIndex = updatedCart.findIndex((item) => item.id === id);

        if (existingIndex !== -1) {
            updatedCart[existingIndex].quantity += 1;
        } else if (product) {
            updatedCart.push({ ...product, quantity: 1 });
        }
    });

    // Add the currently selected productId to the updated cart
    const product = products.find((p) => p.id === productId);
    const existingIndex = updatedCart.findIndex((item) => item.id === productId);

    if (existingIndex !== -1) {
        updatedCart[existingIndex].quantity += 1;
    } else if (product) {
        updatedCart.push({ ...product, quantity: 1 });
    }

    // Save the updated cart back to localStorage and update state
    localStorage.setItem("cart", JSON.stringify([...temporaryCart, productId]));
    setCart(updatedCart);

    console.log("Updated Cart:", updatedCart);
};

    // Function to clear a specific item from the cart
    const clearItem = (id) => {
      const updatedCart = cart.filter((item) => item.id !== id);
      setCart(updatedCart); // Update global state
  };

    
    const removeFromCart = (productId) => {
        const updatedCart = cart.map((item) => {
          if (item.id === productId) {
            if (item.quantity > 1) {
              // Decrease quantity if greater than 1
              return { ...item, quantity: item.quantity - 1 };
            }
            // Remove item by returning null if quantity reaches 0
            return null;
          }
          return item; // Keep other items as is
        }).filter(Boolean); // Filter out null values (i.e., removed items)
      
        setCart(updatedCart);
      };
      

    const clearCart =()=>{
        setCart([])
    }

    const totalItems = cart.reduce( (acc ,totalitems )=>{
        const totalItems = acc+totalitems.quantity
        return totalItems
    }, 0)
    const totalAmount = cart.reduce((acc , item )=>{
        const totalAmount = acc + item.newPrice * item.quantity
        return totalAmount},0)
    

    const token = localStorage.getItem("token");
    const handleLogout = ()=>{
        localStorage.removeItem("token");
        setIsLoggedIn(false)
    }
    const handleLogin = ()=>{
        setIsLoggedIn(true)
    }
    useEffect(()=>{
    handleLogin
},[token])


    const value = {addToCart,removeFromCart,clearCart ,totalItems,totalAmount, handleLogout,products,cart,clearItem, handleLogin }
    return (<shopContext.Provider value= {value}>
        {props.children}
    </shopContext.Provider>  );
}
 
export default ShopcontextProvider;