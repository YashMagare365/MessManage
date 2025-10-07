"use client";
import { useState, useEffect } from "react";
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { createMessDocument } from "../../lib/auth";
import { uploadImageToCloudinary } from "../../lib/cloudinary-upload";

export default function MenuManager({ messId }) {
  const [menuItems, setMenuItems] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messExists, setMessExists] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "main",
    isVeg: true,
    isAvailable: true,
    image: null,
    imageFile: null,
  });

  useEffect(() => {
    loadMenuItems();
  }, [messId]);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const messDoc = await getDoc(doc(db, "messes", messId));

      if (messDoc.exists()) {
        const messData = messDoc.data();
        setMenuItems(messData.menu || []);
        setMessExists(true);
        console.log("Mess document loaded successfully");
      } else {
        // Mess document doesn't exist, create it
        console.log("Mess document not found, creating now...");
        await createMessDocument(messId, "Your Mess");
        setMenuItems([]);
        setMessExists(true);
        console.log("New mess document created");
      }
    } catch (error) {
      console.error("Error loading menu items:", error);
      alert("Error loading menu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file (JPEG, PNG, WebP, etc.)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("Please select an image smaller than 5MB");
        return;
      }

      setFormData({
        ...formData,
        imageFile: file,
        image: URL.createObjectURL(file),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = formData.image;

      // If a new image file is selected, upload to Cloudinary
      if (formData.imageFile) {
        setUploadingImage(true);
        try {
          console.log("Uploading image to Cloudinary...");
          imageUrl = await uploadImageToCloudinary(formData.imageFile);
          console.log("Image uploaded successfully:", imageUrl);
        } catch (uploadError) {
          console.error("Cloudinary upload failed:", uploadError);
          alert(
            "Failed to upload image. Please try again or continue without image."
          );
          setUploadingImage(false);
          return;
        }
      }

      const newItem = {
        id: editingItem ? editingItem.id : Date.now().toString(),
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        isVeg: formData.isVeg,
        isAvailable: formData.isAvailable,
        image: imageUrl,
        createdAt: new Date(),
      };

      const updatedMenu = editingItem
        ? menuItems.map((item) => (item.id === editingItem.id ? newItem : item))
        : [...menuItems, newItem];

      // Ensure mess document exists before updating
      const messDoc = await getDoc(doc(db, "messes", messId));
      if (!messDoc.exists()) {
        await createMessDocument(messId, "Your Mess");
      }

      // Update Firestore
      await updateDoc(doc(db, "messes", messId), {
        menu: updatedMenu,
        updatedAt: new Date(),
      });

      setMenuItems(updatedMenu);
      resetForm();
      alert(editingItem ? "Menu item updated!" : "Menu item added!");
    } catch (error) {
      console.error("Error saving menu item:", error);
      alert("Error saving menu item: " + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "main",
      isVeg: true,
      isAvailable: true,
      image: null,
      imageFile: null,
    });
    setEditingItem(null);
    setIsAdding(false);
  };

  const editItem = (item) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      image: item.image, // This is the Cloudinary URL
      imageFile: null,
    });
    setEditingItem(item);
    setIsAdding(true);
  };

  const deleteItem = async (itemId) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        const updatedMenu = menuItems.filter((item) => item.id !== itemId);

        // Ensure mess document exists before updating
        const messDoc = await getDoc(doc(db, "messes", messId));
        if (!messDoc.exists()) {
          await createMessDocument(messId, "Your Mess");
        }

        await updateDoc(doc(db, "messes", messId), {
          menu: updatedMenu,
          updatedAt: new Date(),
        });

        setMenuItems(updatedMenu);
        alert("Menu item deleted!");
      } catch (error) {
        console.error("Error deleting menu item:", error);
        alert("Error deleting menu item: " + error.message);
      }
    }
  };

  const removeImage = () => {
    setFormData({
      ...formData,
      image: null,
      imageFile: null,
    });
  };

  const categories = [
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "dinner", label: "Dinner" },
    { value: "main", label: "Main Course" },
    { value: "starter", label: "Starters" },
    { value: "dessert", label: "Desserts" },
    { value: "beverage", label: "Beverages" },
    { value: "snacks", label: "Snacks" },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!messExists) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Mess Setup Required
          </h3>
          <p className="text-gray-600 mb-4">
            Your mess profile needs to be set up before you can manage the menu.
          </p>
          <button
            onClick={loadMenuItems}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Set Up Mess
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Menu Management
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Add and manage your menu items
            </p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add New Item
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingItem) && (
        <div className="p-6 border-b bg-gray-50">
          <h3 className="text-lg font-medium mb-4">
            {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter price"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Describe the item (optional)"
              />
            </div>

            {/* Cloudinary Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Image
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {formData.image && (
                  <div className="relative">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Upload a high-quality image of your dish (JPEG, PNG, WebP, max
                5MB)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isVeg}
                    onChange={(e) =>
                      setFormData({ ...formData, isVeg: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Vegetarian</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isAvailable: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Available</span>
                </label>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={uploadingImage}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {uploadingImage
                  ? "Uploading Image..."
                  : editingItem
                  ? "Update Item"
                  : "Add Item"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Menu Items List with Images */}
      <div className="p-6">
        <h3 className="text-lg font-medium mb-4">
          Current Menu ({menuItems.length} items)
        </h3>

        {menuItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Item Image from Cloudinary */}
                <div className="h-48 bg-gray-200 overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg
                        className="w-12 h-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {item.name}
                    </h4>
                    <span
                      className={`w-3 h-3 rounded-full border-2 flex-shrink-0 mt-1 ${
                        item.isVeg
                          ? "border-green-500 bg-green-500"
                          : "border-red-500 bg-red-500"
                      }`}
                    ></span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-green-600">
                      ₹{item.price}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm px-2 py-1 rounded ${
                        item.isAvailable
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.isAvailable ? "Available" : "Unavailable"}
                    </span>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => editItem(item)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg mb-2">No menu items yet</p>
            <p className="text-gray-400 text-sm mb-4">
              Add your first dish to start receiving orders
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Add Your First Item
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
