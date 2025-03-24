"use client";

import {ContactForm} from '../components/ContactForm.js';
import {Header} from '../components/Header.js';

export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-100 text-center flex justify-center flex-col items-center bg-[url(/wildflower-field.webp)] bg-fixed bg-no-repeat bg-cover">
      <Header/>
      <ContactForm/>
    </div>
  );
}
