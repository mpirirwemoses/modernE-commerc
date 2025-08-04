import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { shopContext } from '../assets/context/Shopcontext';
import { FaBell, FaShieldAlt, FaPalette, FaGlobe, FaCreditCard, FaUserSecret, FaTrash } from 'react-icons/fa';

const Settings = () => {
  const { user, handleLogout } = useContext(shopContext);
  const [activeTab, setActiveTab] = useState('notifications');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotions: false,
    newsletter: true
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowTracking: true
  });

  const [themeSettings, setThemeSettings] = useState({
    theme: 'light',
    fontSize: 'medium',
    language: 'en'
  });

  const handleNotificationChange = (key) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePrivacyChange = (key, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleThemeChange = (key, value) => {
    setThemeSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSuccess('Settings saved successfully!');
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }, 1000);
  };

  const tabs = [
    { id: 'notifications', name: 'Notifications', icon: FaBell },
    { id: 'privacy', name: 'Privacy & Security', icon: FaShieldAlt },
    { id: 'appearance', name: 'Appearance', icon: FaPalette },
    { id: 'payment', name: 'Payment Methods', icon: FaCreditCard },
    { id: 'account', name: 'Account', icon: FaUserSecret }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to access settings</h2>
          <p className="text-gray-600">You need to be logged in to view your settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account preferences and settings</p>
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

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-orange-100 text-orange-700 border-l-4 border-orange-500'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.name}</span>
                      </motion.button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">Email Notifications</h3>
                          <p className="text-sm text-gray-600">Receive updates via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.emailNotifications}
                            onChange={() => handleNotificationChange('emailNotifications')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">SMS Notifications</h3>
                          <p className="text-sm text-gray-600">Receive updates via SMS</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.smsNotifications}
                            onChange={() => handleNotificationChange('smsNotifications')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">Order Updates</h3>
                          <p className="text-sm text-gray-600">Get notified about order status changes</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.orderUpdates}
                            onChange={() => handleNotificationChange('orderUpdates')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">Promotions & Offers</h3>
                          <p className="text-sm text-gray-600">Receive promotional emails and offers</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.promotions}
                            onChange={() => handleNotificationChange('promotions')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacy & Security</h2>
                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Profile Visibility</h3>
                        <select
                          value={privacySettings.profileVisibility}
                          onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="public">Public</option>
                          <option value="friends">Friends Only</option>
                          <option value="private">Private</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">Show Email Address</h3>
                          <p className="text-sm text-gray-600">Allow others to see your email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privacySettings.showEmail}
                            onChange={() => handlePrivacyChange('showEmail', !privacySettings.showEmail)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">Allow Analytics Tracking</h3>
                          <p className="text-sm text-gray-600">Help us improve by allowing analytics</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privacySettings.allowTracking}
                            onChange={() => handlePrivacyChange('allowTracking', !privacySettings.allowTracking)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Appearance</h2>
                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Theme</h3>
                        <select
                          value={themeSettings.theme}
                          onChange={(e) => handleThemeChange('theme', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">Auto</option>
                        </select>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Font Size</h3>
                        <select
                          value={themeSettings.fontSize}
                          onChange={(e) => handleThemeChange('fontSize', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Language</h3>
                        <select
                          value={themeSettings.language}
                          onChange={(e) => handleThemeChange('language', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Payment Tab */}
                {activeTab === 'payment' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Methods</h2>
                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-4">Saved Payment Methods</h3>
                        <p className="text-gray-600 mb-4">No payment methods saved yet.</p>
                        <motion.button
                          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Add Payment Method
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Account Tab */}
                {activeTab === 'account' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Management</h2>
                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-4">Danger Zone</h3>
                        <div className="space-y-3">
                          <motion.button
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaTrash className="inline w-4 h-4 mr-2" />
                            Delete Account
                          </motion.button>
                          <motion.button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Sign Out
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <motion.button
              onClick={handleSaveSettings}
              disabled={loading}
              className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings; 