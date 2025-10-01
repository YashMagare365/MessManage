"use client";
import { useState, useEffect } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { storage, db } from "../../lib/firebase";

export default function MenuManager({ messId }) {
  const [menuItems, setMenuItems] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "main",
    isVeg: true,
    isAvailable: true,
    image: null,
  });

  useEffect(() => {
    loadMenuItems();
  }, [messId]);

  const loadMenuItems = async () => {
    try {
      const messDoc = await getDoc(doc(db, "messes", messId));
      if (messDoc.exists()) {
        const messData = messDoc.data();
        setMenuItems(messData.menu || []);
      }
    } catch (error) {
      console.error("Error loading menu items:", error);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return null;

    try {
      setUploadingImage(true);
      const storageRef = ref(
        storage,
        `menu-images/${messId}/${Date.now()}-${file.name}`
      );
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = formData.image;

      // If a new image file is selected, upload it
      if (formData.image instanceof File) {
        imageUrl = await handleImageUpload(formData.image);
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

      // Update Firestore
      await updateDoc(doc(db, "messes", messId), {
        menu: updatedMenu,
      });

      setMenuItems(updatedMenu);
      resetForm();
      alert(editingItem ? "Menu item updated!" : "Menu item added!");
    } catch (error) {
      alert("Error saving menu item: " + error.message);
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
      image: item.image,
    });
    setEditingItem(item);
    setIsAdding(true);
  };

  const deleteItem = async (itemId) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        const updatedMenu = menuItems.filter((item) => item.id !== itemId);
        await updateDoc(doc(db, "messes", messId), {
          menu: updatedMenu,
        });
        setMenuItems(updatedMenu);
        alert("Menu item deleted!");
      } catch (error) {
        alert("Error deleting menu item: " + error.message);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
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

            {/* Image Upload */}
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
                  <div className="w-16 h-16 border rounded overflow-hidden">
                    {formData.image instanceof File ? (
                      <img
                        src={URL.createObjectURL(formData.image)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={formData.image}
                        alt="Current"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Upload a high-quality image of your dish (optional)
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
                  ? "Uploading..."
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

      {/* Menu Items List */}
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
                {/* Item Image */}
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
