"use client";

import { useState } from 'react';
import {Header} from './components/Header.js';
import {ToggleButtons} from './components/ToggleButtons.js';
import {Display} from './components/Display.js';

export default function Home() {
  return (
    <div className="min-h-screen text-center flex justify-center flex-col items-center">
        <Header />
        <Display />
    </div>
  );
}
