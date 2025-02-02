import React, { useState, useEffect } from 'react';

const RotatingNumber = ({ finalNumber }) => {
  const [currentNumber, setCurrentNumber] = useState(0);  // Start from 0

  useEffect(() => {
    const totalDuration = 8000;  // Total duration for the counting effect (in milliseconds)
    const incrementInterval = 100;  // Time interval for each increment (in milliseconds)
    const steps = totalDuration / incrementInterval;  // Number of steps for incrementing

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep += 1;
      const nextNumber = Math.min(Math.round((finalNumber / steps) * currentStep), finalNumber);  // Increment number
      setCurrentNumber(nextNumber);  // Update current number

      if (currentStep >= steps) {
        clearInterval(interval);  // Clear interval when we reach the final number
      }
    }, incrementInterval);

    return () => clearInterval(interval);  // Cleanup interval on component unmount
  }, [finalNumber]);

  return (
    <div className="text-5xl font-bold animate-slide-in ease-in-out text-blue-600">
      {currentNumber}
    </div>
  );
};

export default RotatingNumber;
