import { useContext, useState } from "react";
import Paypal from "./Paypal";
import { shopContext } from "../assets/context/ShopContext";

const Checkout = ({ Amount }) => {
    const {setCart,cart}= useContext(shopContext);
    const [paymentDetails, setPaymentDetails] = useState({
        mtn: "",
        airtel: "",
    });
    const [isCheckoutVisible, setIsCheckoutVisible] = useState(false);

    // Handle input changes dynamically for MTN and Airtel
    const handlePaymentChange = (e, provider) => {
        setPaymentDetails((prev) => ({
            ...prev,
            [provider]: e.target.value,
        }));
    };

    // Toggle the visibility of the checkout form
    const toggleCheckoutDisplay = () => {
        setIsCheckoutVisible(!isCheckoutVisible);
    };

    return (
        <div className="flex flex-col items-start p-4 space-x-8 space-y-4">
            {/* Summary Section */}
            <div className="flex flex-col space-y-2">
                <h2 className="text-lg font-semibold text-gray-800">Order Summary</h2>
                <div className="flex items-center justify-between space-x-4">
                    <p className="text-gray-600">Total Amount:</p>
                    <p className="font-bold text-black">${Amount}</p>
                </div>
                <button
                    className="bg-black text-white font-bold rounded px-4 py-2 hover:bg-gray-800 transition"
                    onClick={toggleCheckoutDisplay}
                >
                    Checkout
                </button>
            </div>

            {/* Payment Form */}
            {isCheckoutVisible && (
                <div className="border-t pt-4 w-full flex flex-row space-x-32">
                    {/* MTN Payment Section */}
                    <div className="flex flex-col space-y-2">
                        <h3 className="text-sm font-semibold text-gray-700">Pay with MTN Money</h3>
                        <label className="text-sm text-gray-600">MTN Mobile Money:</label>
                        <input
                            type="text"
                            placeholder="Enter MTN number"
                            value={paymentDetails.mtn}
                            onChange={(e) => handlePaymentChange(e, "mtn")}
                            className="border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-gray-300"
                        />
                        <button
                            className="bg-black text-white font-bold rounded px-4 py-2 hover:bg-gray-800 transition"
                            onClick={toggleCheckoutDisplay}
                        >
                            Pay Now
                        </button>
                    </div>

                    {/* Airtel Payment Section */}
                    <div className="flex flex-col space-y-2">
                        <h3 className="text-sm font-semibold text-gray-700">Pay with Airtel Money</h3>
                        <label className="text-sm text-gray-600">Airtel Money:</label>
                        <input
                            type="text"
                            placeholder="Enter Airtel number"
                            value={paymentDetails.airtel}
                            onChange={(e) => handlePaymentChange(e, "airtel")}
                            className="border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-gray-300"
                        />
                        <button
                            className="bg-black text-white font-bold rounded px-4 py-2 hover:bg-gray-800 transition"
                            onClick={toggleCheckoutDisplay}
                        >
                            Pay Now
                        </button>
                    </div>

                    {/* PayPal Section */}
                    <div className="flex flex-col space-y-2">
                        <h3 className="text-sm font-semibold text-gray-700">Pay with PayPal</h3>
                        <div className="max-w-[250px]">
                            <Paypal total={Amount} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;
