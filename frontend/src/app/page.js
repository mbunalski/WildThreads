"use client";

import { useState } from 'react';
import {Header} from './components/Header.js';
import {ToggleButtons} from './components/ToggleButtons.js';
import {Display} from './components/Display.js';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 text-center flex justify-center flex-col items-center bg-[url(/wildflower-field.webp)] bg-local md:bg-fixed bg-no-repeat bg-cover">
        <Header />
        <Display />
    </div>
  );
}
