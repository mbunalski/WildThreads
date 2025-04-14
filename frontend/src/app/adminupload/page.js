'use client';

import { useState } from 'react';
import imageCompression from 'browser-image-compression';

const ADMIN_PASSWORD = 'wildthreads2024';

export default function UploadPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    files: [],
    mainFileIndex: null,
  });
 
  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1,              // ~1MB target
      maxWidthOrHeight: 1600,    // Resize large images
      useWebWorker: true,
    };
  
    try {
      const compressedFile = await imageCompression(file, options);
      console.log("Original:", file.size, "Compressed:", compressedFile.size);
      
      return new File([compressedFile], file.name, {
        type: file.type,
        lastModified: file.lastModified,
      });
    } catch (err) {
      console.error("Image compression error:", err);
      return file; // Fallback to original if compression fails
    }
  };
  
  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const handleFileChange = async (e) => {
    const originalFiles = Array.from(e.target.files);
    const compressedFiles = await Promise.all(originalFiles.map(compressImage));
    console.log("Compressed files:", compressedFiles.map(f => ({
        name: f.name,
        type: f.type,
        size: f.size,
      })));
    setFormData({ ...formData, files: compressedFiles });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || formData.files.length === 0 || formData.mainFileIndex === null) {
      setStatus('Please fill in all fields and select a main file.');
      return;
    }
  
    const body = new FormData();
    body.append('name', formData.name);
    body.append('price', formData.price);
    body.append('mainFileIndex', formData.mainFileIndex);
  
    formData.files.forEach((file, index) => {
      body.append(`file_${index}`, file);
    });
  
    try {
      const res = await fetch('https://fpvemqdbve.execute-api.us-east-1.amazonaws.com/test', {
        method: 'POST',
        body, // FormData automatically sets the multipart headers
      });
  
      if (res.ok) {
        setStatus('Upload successful!');
        setFormData({ name: '', price: '', files: [], mainFileIndex: null });
      } else {
        setStatus('Upload failed.');
      }
    } catch (err) {
      setStatus('Error connecting to Lambda.');
      console.error(err);
    }
  };




  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border rounded mb-4"
        />
        <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded">
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-md rounded-xl mt-8">
      <h1 className="text-2xl font-bold mb-4">Upload New Item</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Item Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-3 border rounded"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Price"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="w-full p-3 border rounded"
        />
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="w-full p-3 border rounded"
        />
        {formData.files.length > 0 && (
          <div>
            <p className="font-semibold mb-2">Select Main Image:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.files.map((file, index) => (
                <label key={index} className="flex flex-col items-center">
                  <input
                    type="radio"
                    name="mainFile"
                    value={index}
                    checked={formData.mainFileIndex === index}
                    onChange={() => setFormData({ ...formData, mainFileIndex: index })}
                  />
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`preview-${index}`}
                    className="mt-1 h-24 object-cover border rounded"
                  />
                </label>
              ))}
            </div>
          </div>
        )}
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded">
          Upload to S3
        </button>
        {status && <p className="text-center mt-2 text-sm">{status}</p>}
      </form>
    </div>
  );
}
