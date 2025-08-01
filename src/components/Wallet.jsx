import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { shopContext } from '../assets/context/ShopContext';
import { FaCreditCard, FaWallet, FaPlus, FaTrash, FaEdit, FaEye, FaEyeSlash, FaTimes } from 'react-icons/fa';

const Wallet = () => {
  const { user } = useContext(shopContext);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showCVV, setShowCVV] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const [cards, setCards] = useState([
    {
      id: 1,
      type: 'visa',
      last4: '4242',
      expiry: '12/25',
      name: 'John Doe',
      isDefault: true
    },
    {
      id: 2,
      type: 'mastercard',
      last4: '8888',
      expiry: '08/26',
      name: 'John Doe',
      isDefault: false
    }
  ]);

  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCard(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const card = {
        id: Date.now(),
        type: 'visa', // You would determine this from the card number
        last4: newCard.cardNumber.slice(-4),
        expiry: `${newCard.expiryMonth}/${newCard.expiryYear}`,
        name: newCard.cardholderName,
        isDefault: cards.length === 0
      };

      setCards(prev => [...prev, card]);
      setNewCard({
        cardNumber: '',
        cardholderName: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: ''
      });
      setShowAddCard(false);
      setSuccess('Card added successfully!');
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }, 1000);
  };

  const handleRemoveCard = (cardId) => {
    setCards(prev => prev.filter(card => card.id !== cardId));
  };

  const handleSetDefault = (cardId) => {
    setCards(prev => prev.map(card => ({
      ...card,
      isDefault: card.id === cardId
    })));
  };

  const toggleCVV = (cardId) => {
    setShowCVV(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to access your wallet</h2>
          <p className="text-gray-600">You need to be logged in to view your payment methods.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <FaWallet className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
                  <p className="text-gray-600">Manage your payment methods</p>
                </div>
              </div>
              <motion.button
                onClick={() => setShowAddCard(true)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Add Card
              </motion.button>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <motion.div
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {success}
            </motion.div>
          )}

          {/* Cards List */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h2>
            <div className="space-y-4">
              {cards.map((card) => (
                <motion.div
                  key={card.id}
                  className="border border-gray-200 rounded-lg p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                        <FaCreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">
                            {card.type.charAt(0).toUpperCase() + card.type.slice(1)} •••• {card.last4}
                          </h3>
                          {card.isDefault && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {card.name} • Expires {card.expiry}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        onClick={() => toggleCVV(card.id)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {showCVV[card.id] ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                      </motion.button>
                      {!card.isDefault && (
                        <motion.button
                          onClick={() => handleSetDefault(card.id)}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Set Default
                        </motion.button>
                      )}
                      <motion.button
                        onClick={() => handleRemoveCard(card.id)}
                        className="p-2 text-red-400 hover:text-red-600"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FaTrash className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {cards.length === 0 && (
                <div className="text-center py-8">
                  <FaCreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods</h3>
                  <p className="text-gray-600 mb-4">Add a payment method to get started</p>
                  <motion.button
                    onClick={() => setShowAddCard(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Add Payment Method
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          {/* Add Card Modal */}
          {showAddCard && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Add Payment Method</h2>
                  <button
                    onClick={() => setShowAddCard(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddCard} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={newCard.cardNumber}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      name="cardholderName"
                      value={newCard.cardholderName}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Month
                      </label>
                      <select
                        name="expiryMonth"
                        value={newCard.expiryMonth}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">MM</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                          <option key={month} value={month.toString().padStart(2, '0')}>
                            {month.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year
                      </label>
                      <select
                        name="expiryYear"
                        value={newCard.expiryYear}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">YY</option>
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                          <option key={year} value={year.toString().slice(-2)}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={newCard.cvv}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="123"
                        maxLength="4"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <motion.button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? 'Adding...' : 'Add Card'}
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setShowAddCard(false)}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Wallet; 