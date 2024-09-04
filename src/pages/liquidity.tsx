'use client';
import React from 'react';
import Navbar from '../components/Navbar';
import LiquidityComponent from '../components/LiquidityComponent';

const liquidity = () => {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <main className="container mx-auto px-4 py-8 mt-12">
        <div className="flex justify-center">
          <LiquidityComponent />
        </div>
      </main>
    </div>
  );
};

export default liquidity;