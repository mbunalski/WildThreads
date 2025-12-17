'use client';

import { useState, useEffect } from 'react';
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
  const [availableItems, setAvailableItems] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [inventoryStatus, setInventoryStatus] = useState('');
  const [activeTab, setActiveTab] = useState('Available'); // 'Available' or 'History'
 
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

    setStatus(`Uploading 0/${formData.files.length} files...`);

    try {
      // Upload files one at a time to avoid API Gateway 10MB payload limit
      for (let i = 0; i < formData.files.length; i++) {
        const file = formData.files[i];
        const isMain = i === formData.mainFileIndex;

        setStatus(`Uploading ${i + 1}/${formData.files.length} files...`);

        const body = new FormData();
        body.append('name', formData.name);
        body.append('price', formData.price);
        body.append('fileIndex', i);
        body.append('isMain', isMain);
        body.append('file', file);

        const res = await fetch('https://fpvemqdbve.execute-api.us-east-1.amazonaws.com/test', {
          method: 'POST',
          body,
        });

        if (!res.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }

      setStatus('Upload successful!');
      setFormData({ name: '', price: '', files: [], mainFileIndex: null });
      fetchAvailableItems(); // Refresh the list
    } catch (err) {
      setStatus(`Upload failed: ${err.message}`);
      console.error(err);
    }
  };

  const fetchAvailableItems = async () => {
    try {
      const response = await fetch("https://tn5znlmkek.execute-api.us-east-1.amazonaws.com/test/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: "Available" }),
      });

      const text = await response.text();
      const full = JSON.parse(text);
      const data = JSON.parse(full.body);

      setAvailableItems(data);
    } catch (error) {
      console.error('Error fetching available items:', error);
      setInventoryStatus('Failed to load items');
    }
  };

  const fetchHistoryItems = async () => {
    try {
      const response = await fetch("https://tn5znlmkek.execute-api.us-east-1.amazonaws.com/test/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: "History" }),
      });

      const text = await response.text();
      const full = JSON.parse(text);
      const data = JSON.parse(full.body);

      setHistoryItems(data);
    } catch (error) {
      console.error('Error fetching history items:', error);
      setInventoryStatus('Failed to load history items');
    }
  };

  const handleItemSelection = (directory) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(directory)) {
      newSelected.delete(directory);
    } else {
      newSelected.add(directory);
    }
    setSelectedItems(newSelected);
  };

  const handleMarkAsSold = async () => {
    if (selectedItems.size === 0) {
      setInventoryStatus('Please select items to mark as sold');
      return;
    }

    setInventoryStatus(`Moving ${selectedItems.size} items to history...`);

    try {
      const response = await fetch('https://d7rjek31n0.execute-api.us-east-1.amazonaws.com/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: Array.from(selectedItems),
          action: 'move', // Move to History
          folder: 'Available'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to move items');
      }

      const result = await response.json();
      console.log('Move result:', result);

      setInventoryStatus('Items marked as sold!');
      setSelectedItems(new Set());
      fetchAvailableItems();
    } catch (err) {
      setInventoryStatus(`Failed to move items: ${err.message}`);
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (selectedItems.size === 0) {
      setInventoryStatus('Please select items to delete');
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete ${selectedItems.size} item(s) from ${activeTab}?`)) {
      return;
    }

    setInventoryStatus(`Deleting ${selectedItems.size} items...`);

    try {
      const response = await fetch('https://d7rjek31n0.execute-api.us-east-1.amazonaws.com/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: Array.from(selectedItems),
          action: 'delete', // Delete only, no move
          folder: activeTab
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete items');
      }

      const result = await response.json();
      console.log('Delete result:', result);

      setInventoryStatus('Items deleted!');
      setSelectedItems(new Set());
      if (activeTab === 'Available') {
        fetchAvailableItems();
      } else {
        fetchHistoryItems();
      }
    } catch (err) {
      setInventoryStatus(`Failed to delete items: ${err.message}`);
      console.error(err);
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchAvailableItems();
      fetchHistoryItems();
    }
  }, [authenticated]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedItems(new Set());
    setInventoryStatus('');
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
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Upload Section */}
      <div className="bg-white shadow-md rounded-xl p-6">
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

      {/* Inventory Management Section */}
      <div className="bg-white shadow-md rounded-xl p-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => handleTabChange('Available')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'Available'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Available Items
          </button>
          <button
            onClick={() => handleTabChange('History')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'History'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            History
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Manage {activeTab} Items</h2>
          <div className="flex gap-3">
            {activeTab === 'Available' && (
              <button
                onClick={handleMarkAsSold}
                disabled={selectedItems.size === 0}
                className={`px-6 py-2 rounded font-semibold ${
                  selectedItems.size > 0
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Mark as Sold ({selectedItems.size})
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={selectedItems.size === 0}
              className={`px-6 py-2 rounded font-semibold ${
                selectedItems.size > 0
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Delete ({selectedItems.size})
            </button>
          </div>
        </div>
        {inventoryStatus && (
          <p className="text-center mb-4 text-sm font-semibold">{inventoryStatus}</p>
        )}

        {/* Items Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(activeTab === 'Available' ? availableItems : historyItems).map((item) => (
            <div
              key={item.directory}
              className={`border rounded-lg p-3 cursor-pointer transition ${
                selectedItems.has(item.directory)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handleItemSelection(item.directory)}
            >
              <div className="flex items-start mb-2">
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.directory)}
                  onChange={() => {}}
                  className="mt-1 mr-2"
                />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{item.directory}</p>
                </div>
              </div>
              {item.mainImage && (
                <img
                  src={item.mainImage}
                  alt={item.directory}
                  className="w-full h-32 object-cover rounded"
                />
              )}
            </div>
          ))}
        </div>
        {((activeTab === 'Available' && availableItems.length === 0) ||
          (activeTab === 'History' && historyItems.length === 0)) && (
          <p className="text-center text-gray-500 py-8">No {activeTab.toLowerCase()} items found</p>
        )}
      </div>
    </div>
  );
}
