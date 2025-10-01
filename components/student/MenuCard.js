"use client";
import { useState } from "react";

export default function MenuCard({ mess, onAddToCart }) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    "all",
    "breakfast",
    "lunch",
    "dinner",
    "main",
    "starter",
    "dessert",
    "beverage",
    "snacks",
  ];

  const filteredMenu =
    selectedCategory === "all"
      ? mess.menu || []
      : (mess.menu || []).filter((item) => item.category === selectedCategory);

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Menu - {mess.name}
          </h2>
          <span className="text-sm text-gray-500">
            {filteredMenu.length} items
          </span>
        </div>

        {/* Category Filter */}
        <div className="flex space-x-2 mt-3 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedCategory === category
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {filteredMenu.length > 0 ? (
          <div className="space-y-4">
            {filteredMenu.map((item, index) => (
              <div
                key={index}
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Item Image */}
                <div className="flex-shrink-0 w-16 h-16 mr-4">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                      <svg
                        className="w-6 h-6"
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
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    <span
                      className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ml-2 ${
                        item.isVeg
                          ? "border-green-500 bg-green-500"
                          : "border-red-500 bg-red-500"
                      }`}
                    ></span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-semibold text-green-600">
                      ₹{item.price}
                    </span>

                    {item.isAvailable ? (
                      <button
                        onClick={() => onAddToCart(item)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <span className="text-red-500 text-sm font-medium">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No items available in this category.
            </p>
          </div>
        )}

        {!mess.menu ||
          (mess.menu.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                This mess hasn't added any menu items yet.
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}
