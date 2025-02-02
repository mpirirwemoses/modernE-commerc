import React, { useContext, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useNavigate } from "react-router-dom";
import { shopContext } from "../assets/context/ShopContext";


// Component to display messages
function Message({ content }) {
  return <div className="message">{content}</div>;
}

function PayPal({total}) {
    const {clearCart} =useContext(shopContext);
  const initialOptions = {
    "client-id":  "ARjPTUZQ1GhgH-chgM_7AcFcspnlJExBxUI2RKj1gFIF881jW_eKhyF5r0Wn3vwoVhCZqqm3g5hodN0y",
    "enable-funding": "paylater,venmo",
    "data-sdk-integration-source": "integrationbuilder_sc",
  };
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const cart = [
    {
      id: "product_12345",
      name: "Product 1",
      description: "Description of Product 1",
      quantity: 1,
      price: total,
    },
  ];
  const handlePaymentCompletion = () => {
    
    
    // Clear the cart
   

    // Show the success message for 5 seconds and then navigate to home
    setTimeout(() => {
      
      clearCart();
      navigate("/");
    }, 4000);
  };

  return (
    <div className="App">
      <h1>PayPal Payment Integration</h1>
      <PayPalScriptProvider options={initialOptions}>
        <PayPalButtons
          style={{
            shape: "rect",
            layout: "vertical",
            color: "gold",
            label: "paypal",
            tagline: false,
          }}
          createOrder={async () => {
            setLoading(true);
            try {
              const response = await fetch("http://localhost:4600/api/orders", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ cart }),
              });

              const orderData = await response.json();

              if (orderData.id) {
                setLoading(false);
                return orderData.id; // Return the PayPal order ID
              } else {
                throw new Error("Could not create PayPal order.");
              }
            } catch (error) {
              setLoading(false);
              console.error("Error in createOrder:", error);
              setMessage(`Could not initiate PayPal Checkout: ${error.message}`);
              throw error;
            }
          }}
          onApprove={async (data, actions) => {
            setLoading(true);
            try {
              const response = await fetch(
                `http://localhost:4600/api/orders/${data.orderID}/capture`,
                {
                  method: "POST",
                }
              );

              const orderData = await response.json();
              const transaction = orderData.purchase_units[0].payments.captures[0];

              setMessage(`Transaction ${transaction.status}.\nWith Transaction id:  ${transaction.id}`);
              setLoading(false);
              handlePaymentCompletion();
            } catch (error) {
              console.error("Error in onApprove:", error);
              setLoading(false);
              setMessage(`Transaction could not be processed: ${error.message}`);
            }
          }}
          onError={(err) => {
            console.error("PayPal Buttons Error:", err);
            setMessage(`PayPal encountered an error: ${err.message}`);
          }}
        />
      </PayPalScriptProvider>
      <Message content={message} />
      {loading && <div className="text-center">Processing...</div>}
    </div>
  );
}

export default PayPal;
