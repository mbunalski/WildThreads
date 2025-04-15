"use client";

import { useState } from 'react';
import {Header} from './components/Header.js';
import {ToggleButtons} from './components/ToggleButtons.js';
import {Display} from './components/Display.js';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-auto">
      {/* Background layer */}
      <div className="fixed inset-0 z-0 bg-[url('/wildflower-field.png')] bg-cover bg-center bg-no-repeat" />

      {/* Scrollable content */}
      <div className="relative z-10 min-h-screen">
        <Header />
        <Display />
      </div>
    </div>
  );
}
