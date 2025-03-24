// import { useState } from "react";

// export function ContactForm() {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     message: "",
//   });

//   const [status, setStatus] = useState(null);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setStatus("Sending...");

//     const response = await fetch("https://574e6dpelf.execute-api.us-east-1.amazonaws.com/test", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(formData),
//     });

//     if (response.ok) {
//       setStatus("Message sent successfully!");
//       setFormData({ name: "", email: "", message: "" });
//     } else {
//       setStatus("Failed to send message.");
//     }
//   };

//   return (
//     <div className="p-4 max-w-md mx-auto">
//       <form onSubmit={handleSubmit} className="mt-4">
//         <input
//           type="text"
//           name="name"
//           placeholder="Name"
//           value={formData.name}
//           onChange={handleChange}
//           required
//           className="block w-full p-2 border rounded mb-2"
//         />
//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           value={formData.email}
//           onChange={handleChange}
//           required
//           className="block w-full p-2 border rounded mb-2"
//         />
//         <textarea
//           name="message"
//           placeholder="Your Message"
//           value={formData.message}
//           onChange={handleChange}
//           required
//           className="block w-full p-2 border rounded mb-2"
//         />
//         <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
//           Send
//         </button>
//       </form>
//       {status && <p className="mt-2">{status}</p>}
//     </div>
//   );
// }




// import { useState, useEffect } from "react";

// export function ContactForm({ itemName }) {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     message: "",
//   });

//   const [status, setStatus] = useState(null);
//   const [errors, setErrors] = useState({
//     name: "",
//     email: "",
//   });

//   useEffect(() => {
//     if (itemName) {
//       setFormData((prev) => ({
//         ...prev,
//         message: `I am interested in ${itemName}`,
//       }));
//     }
//   }, [itemName]);

//   const validateEmail = (email) => {
//     const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return regex.test(email);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));

//     // Clear error when user starts typing
//     setErrors((prev) => ({ ...prev, [name]: "" }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     let valid = true;
//     let newErrors = { name: "", email: "" };

//     if (!formData.name.trim()) {
//       newErrors.name = "Name is required.";
//       valid = false;
//     }

//     if (!formData.email.trim()) {
//       newErrors.email = "Email is required.";
//       valid = false;
//     } else if (!validateEmail(formData.email)) {
//       newErrors.email = "Email is not valid.";
//       valid = false;
//     }

//     setErrors(newErrors);

//     if (!valid) return;

//     setStatus("Sending...");

//     const response = await fetch("https://574e6dpelf.execute-api.us-east-1.amazonaws.com/test", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(formData),
//     });

//     if (response.ok) {
//       setStatus("Message sent successfully!");
//       setFormData({ name: "", email: "", message: `I am interested in ${itemName}` });
//     } else {
//       setStatus("Failed to send message.");
//     }
//   };

//   const isFormValid = formData.name.trim() && formData.email.trim();

//   return (
//     <div className="p-4 max-w-md mx-auto">
//       <form onSubmit={handleSubmit} className="mt-4">
//         <input
//           type="text"
//           name="name"
//           placeholder="Name"
//           value={formData.name}
//           onChange={handleChange}
//           className="block w-full p-2 border rounded mb-1"
//         />
//         {errors.name && <p className="text-red-500 text-sm mb-2">{errors.name}</p>}

//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           value={formData.email}
//           onChange={handleChange}
//           className="block w-full p-2 border rounded mb-1"
//         />
//         {errors.email && <p className="text-red-500 text-sm mb-2">{errors.email}</p>}

//         <textarea
//           name="message"
//           placeholder="Your Message"
//           value={formData.message}
//           onChange={handleChange}
//           className="block w-full p-2 border rounded mb-2"
//         />

//         <button
//           type="submit"
//           disabled={!isFormValid}
//           className={`px-4 py-2 rounded text-white ${
//             isFormValid ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"
//           }`}
//         >
//           Send
//         </button>
//       </form>
//       {status && <p className="mt-2">{status}</p>}
//     </div>
//   );
// }

'use client';

import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';

export function ContactForm() {
  const searchParams = useSearchParams();
  const itemName = searchParams.get('item') || '';

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    if (itemName) {
      setFormData((prev) => ({
        ...prev,
        message: `I am interested in the ${itemName}`,
      }));
    }
  }, [itemName]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let valid = true;
    let newErrors = { name: "", email: "" };

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
      valid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
      valid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Email is not valid.";
      valid = false;
    }

    setErrors(newErrors);
    if (!valid) return;

    setStatus("Sending...");

    const response = await fetch("https://574e6dpelf.execute-api.us-east-1.amazonaws.com/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      setStatus("Message sent successfully!");
      setFormData({ name: "", email: "", message: `I am interested in the ${itemName}` });
    } else {
      setStatus("Failed to send message.");
    }
  };

  const isFormValid = formData.name.trim() && formData.email.trim();

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            className="w-full p-3 h-48 border border-gray-300 rounded resize-none"
          />

          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-3 rounded text-white font-semibold transition ${
              isFormValid ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Send
          </button>
        </form>
        {status && <p className="mt-4 text-center">{status}</p>}
      </div>
    </div>
  );
}

