import React from 'react';
import Navbar from '../components/Navbar';
import SwapComponent from '../components/SwapComponent';
import TimeSlotSystem from '../components/TimeSlotSystem';

const swap = () => {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-12">
        <div className="flex flex-col md:flex-row justify-center items-start gap-8">
          <div className="w-full md:w-1/2">
            <TimeSlotSystem />
          </div>
          <div className="w-full md:w-1/2">
            <SwapComponent />
          </div>
        </div>
      </main>
    </div>
  );
};

export default swap;
