import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, MapPin, Image as ImageIcon, AlignLeft, X, Type, Upload, Map, Navigation } from 'lucide-react';

export default function Destinations() {
  // --- STATE ---
  const [destinations, setDestinations] = useState([
    {
      id: 1,
      title: 'Hidden Lagoon',
      location: 'Palawan',
      address: 'El Nido, Palawan, Philippines',
      coordinates: '11.1965, 119.3245',
      description: 'A beautiful secret lagoon surrounded by limestone cliffs.',
      category: 'Nature',
      imageUrl: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=500&q=80',
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Added address, coordinates, and imageFile
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    location: '',
    address: '',
    coordinates: '',
    description: '',
    category: 'Nature',
    imageUrl: '', 
    imageFile: null, 
  });

  // --- HANDLERS ---
  const openModal = (destination = null) => {
    if (destination) {
      setFormData({ ...destination, imageFile: null }); // Reset file input when editing
      setIsEditing(true);
    } else {
      setFormData({ id: null, title: '', location: '', address: '', coordinates: '', description: '', category: 'Nature', imageUrl: '', imageFile: null });
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

  // New handler specifically for file uploads
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a temporary local URL to preview the image immediately
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        imageUrl: previewUrl 
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Note: In a real app, you would use FormData to append the imageFile and send it to your backend
    // const submitData = new FormData();
    // submitData.append('image', formData.imageFile);
    // submitData.append('title', formData.title);
    // ...etc
    
    if (isEditing) {
      setDestinations(prev => prev.map(dest => dest.id === formData.id ? formData : dest));
    } else {
      const newDest = { ...formData, id: Date.now() }; 
      setDestinations(prev => [newDest, ...prev]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this destination?')) {
      setDestinations(prev => prev.filter(dest => dest.id !== id));
    }
  };

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

      {/* Destinations Grid */}
      {destinations.length === 0 ? (
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
                key={dest.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg shadow-emerald-100/50 transition-all hover:shadow-xl hover:shadow-emerald-200/50"
              >
                {/* Image Section */}
                <div className="relative h-48 w-full shrink-0 bg-emerald-100">
                  {dest.imageUrl ? (
                    <img src={dest.imageUrl} alt={dest.title} className="h-full w-full object-cover" />
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
                      onClick={() => handleDelete(dest.id)}
                      className="rounded-full bg-white/90 p-2 text-rose-500 shadow-sm hover:bg-white hover:text-rose-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-emerald-800 shadow-sm">
                    {dest.category}
                  </span>
                </div>

                {/* Content Section */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="mb-1 text-xl font-bold text-emerald-900">{dest.title}</h3>
                  <div className="mb-3 space-y-1">
                    <p className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <MapPin size={12} /> {dest.location}
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
                        <MapPin size={16} /> General Location (Region/City)
                      </label>
                      <input 
                        type="text" required name="location"
                        value={formData.location} onChange={handleChange}
                        className="w-full rounded-xl border border-emerald-100 bg-white px-4 py-3 text-emerald-900 focus:border-emerald-500 focus:outline-none"
                        placeholder="e.g. Palawan"
                      />
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