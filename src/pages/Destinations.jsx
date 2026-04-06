import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, MapPin, Image as ImageIcon, AlignLeft, X, Type, Upload, Map, Navigation, Loader2 } from 'lucide-react';

export default function Destinations() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    region: 'Luzon',
    address: '',
    coordinates: '',
    description: '',
    category: 'Nature',
    imageUrl: '', 
    imageFile: null, 
  });

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch('/api/destinations');
        if (!response.ok) throw new Error('Failed to fetch destinations');
        
        const data = await response.json();
        setDestinations(data);
      } catch (err) {
        console.error("Error fetching destinations:", err);
        setError('Failed to load destinations.');
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const openModal = (dest = null) => {
    if (dest) {
      setFormData({ 
        id: dest._id, 
        title: dest.name || '', 
        region: dest.region || 'Luzon', 
        address: dest.address || '', 
        coordinates: dest.coordinates || '', 
        description: dest.description || '', 
        category: dest.category || 'Nature', 
        imageUrl: dest.image || '', 
        imageFile: null 
      });
      setIsEditing(true);
    } else {
      setFormData({ id: null, title: '', region: 'Luzon', address: '', coordinates: '', description: '', category: 'Nature', imageUrl: '', imageFile: null });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // UPDATED: Convert the image to a Base64 string so MongoDB can store it permanently
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      
      // When the file is finished loading, it converts to a base64 string
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          imageFile: file,
          imageUrl: reader.result // This is the Base64 string!
        }));
      };
      
      // Tell the reader to read the file
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.imageUrl) {
      alert("Please upload an image before submitting.");
      return;
    }

    const payload = {
      name: formData.title,
      region: formData.region, 
      address: formData.address,
      coordinates: formData.coordinates,
      category: formData.category,
      description: formData.description,
      image: formData.imageUrl, // This is now a permanent Base64 string
    };

    try {
      const token = localStorage.getItem('token');
      
      if (isEditing) {
        const response = await fetch(`/api/destinations/${formData.id}`, {
          method: 'PATCH', 
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          const updatedDest = await response.json();
          setDestinations(prev => prev.map(dest => dest._id === formData.id ? updatedDest : dest));
          closeModal();
          alert("Destination updated successfully!");
        } else {
          alert("Failed to update destination");
        }
      } else {
        const response = await fetch('/api/destinations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const savedDest = await response.json();
          setDestinations(prev => [savedDest, ...prev]);
          closeModal();
          
          if (savedDest.status === 'pending') {
            alert("Success! Your destination has been submitted and is currently PENDING approval. It will appear for everyone once an Admin approves it on the Requests page.");
          } else {
            alert("Destination created and published successfully!");
          }
        } else {
          alert("Failed to create destination. Make sure the image size isn't too massive.");
        }
      }
    } catch (err) {
      console.error("Error saving destination:", err);
      alert("An error occurred while saving.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this destination?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/destinations/${id}`, {
          method: 'DELETE', 
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setDestinations(prev => prev.filter(dest => dest._id !== id));
        } else {
          alert("Failed to delete destination");
        }
      } catch (err) {
        console.error("Error deleting destination:", err);
        alert("An error occurred while deleting.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900">Manage Destinations</h1>
          <p className="text-emerald-600">Add, edit, or remove tourist spots in your region.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-800 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-100 transition-all hover:scale-[1.02]"
        >
          <Plus size={20} /> Add Destination
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 p-4 text-center text-rose-600">
          {error}
        </div>
      )}

      {/* Destinations Grid */}
      {destinations.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-emerald-100 bg-white p-12 text-center shadow-xl shadow-emerald-100/50">
          <MapPin size={48} className="mb-4 text-emerald-200" />
          <h3 className="text-xl font-bold text-emerald-900">No destinations yet</h3>
          <p className="text-emerald-600">Click the button above to add your first destination.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {destinations.map((dest) => (
              <motion.div
                key={dest._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg shadow-emerald-100/50 transition-all hover:shadow-xl hover:shadow-emerald-200/50"
              >
                {/* Image Section */}
                <div className="relative h-48 w-full shrink-0 bg-emerald-100">
                  {dest.image ? (
                    <img src={dest.image} alt={dest.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-emerald-400">
                      <ImageIcon size={48} />
                    </div>
                  )}
                  <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button 
                      onClick={() => openModal(dest)}
                      className="rounded-full bg-white/90 p-2 text-emerald-700 shadow-sm hover:bg-white hover:text-emerald-900"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(dest._id)}
                      className="rounded-full bg-white/90 p-2 text-rose-500 shadow-sm hover:bg-white hover:text-rose-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-emerald-800 shadow-sm">
                    {dest.category || 'Nature'}
                  </span>
                  {dest.status === 'pending' && (
                    <span className="absolute bottom-3 right-3 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-bold text-white shadow-sm">
                      Pending
                    </span>
                  )}
                </div>

                {/* Content Section */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="mb-1 text-xl font-bold text-emerald-900">{dest.name}</h3>
                  <div className="mb-3 space-y-1">
                    <p className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <MapPin size={12} /> {dest.region}
                    </p>
                    {dest.address && (
                      <p className="flex items-center gap-1 text-xs font-medium text-emerald-500">
                        <Map size={12} /> {dest.address}
                      </p>
                    )}
                  </div>
                  <p className="line-clamp-2 text-sm text-emerald-700">{dest.description}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal for Create/Update Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-emerald-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-emerald-100 bg-white p-8 shadow-2xl custom-scrollbar"
            >
              <button 
                onClick={closeModal}
                className="absolute right-6 top-6 text-emerald-400 hover:text-emerald-700"
              >
                <X size={24} />
              </button>

              <h2 className="mb-6 text-2xl font-bold text-emerald-900">
                {isEditing ? 'Edit Destination' : 'Add New Destination'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Image Upload Area */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                    <ImageIcon size={16} /> Destination Image
                  </label>
                  <div className="relative flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-6 transition-colors hover:border-emerald-400 hover:bg-emerald-50">
                    {formData.imageUrl ? (
                      <div className="relative h-40 w-full overflow-hidden rounded-xl">
                        <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-emerald-900/40 opacity-0 transition-opacity hover:opacity-100">
                          <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-emerald-900">
                            <Upload size={16} /> Change Image
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-emerald-500">
                        <Upload size={32} className="mb-2" />
                        <p className="text-sm font-medium">Click to upload an image</p>
                        <p className="text-xs opacity-70">JPG, PNG or WEBP (Max 5MB)</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                  </div>
                </div>

                {/* Title & Category */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                      <Type size={16} /> Title
                    </label>
                    <input 
                      type="text" required name="title"
                      value={formData.title} onChange={handleChange}
                      className="w-full rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-emerald-900 focus:border-emerald-500 focus:outline-none"
                      placeholder="e.g. Hidden Lagoon"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                      <MapPin size={16} /> Category
                    </label>
                    <select 
                      name="category" value={formData.category} onChange={handleChange}
                      className="w-full rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-emerald-900 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Nature">Nature</option>
                      <option value="Historical">Historical</option>
                      <option value="Beach">Beach</option>
                      <option value="Urban">Urban</option>
                    </select>
                  </div>
                </div>

                {/* Location Group */}
                <div className="space-y-5 rounded-2xl border border-emerald-100 bg-emerald-50/30 p-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                        <MapPin size={16} /> Region
                      </label>
                      <select 
                        name="region" value={formData.region} onChange={handleChange}
                        className="w-full rounded-xl border border-emerald-100 bg-white px-4 py-3 text-emerald-900 focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="Luzon">Luzon</option>
                        <option value="Visayas">Visayas</option>
                        <option value="Mindanao">Mindanao</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                        <Navigation size={16} /> Map Coordinates
                      </label>
                      <input 
                        type="text" name="coordinates"
                        value={formData.coordinates} onChange={handleChange}
                        className="w-full rounded-xl border border-emerald-100 bg-white px-4 py-3 text-emerald-900 focus:border-emerald-500 focus:outline-none"
                        placeholder="e.g. 11.1965, 119.3245"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                      <Map size={16} /> Full Address
                    </label>
                    <input 
                      type="text" required name="address"
                      value={formData.address} onChange={handleChange}
                      className="w-full rounded-xl border border-emerald-100 bg-white px-4 py-3 text-emerald-900 focus:border-emerald-500 focus:outline-none"
                      placeholder="e.g. Brgy. Buena Suerte, El Nido, Palawan"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                    <AlignLeft size={16} /> Description
                  </label>
                  <textarea 
                    required name="description" rows="3"
                    value={formData.description} onChange={handleChange}
                    className="w-full resize-none rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-emerald-900 focus:border-emerald-500 focus:outline-none"
                    placeholder="Describe the destination..."
                  />
                </div>

                <button 
                  type="submit"
                  className="mt-6 w-full rounded-2xl bg-emerald-800 py-4 font-bold text-white shadow-lg shadow-emerald-100 transition-all hover:scale-[1.02]"
                >
                  {isEditing ? 'Save Changes' : 'Create Destination'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}