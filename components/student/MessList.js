"use client";

const MessList = ({ messes, onSelectMess, selectedMess }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">
          Available Messes
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Choose a mess to view their menu
        </p>
      </div>

      <div className="divide-y">
        {messes.map((mess) => (
          <div
            key={mess.id}
            className={`p-4 cursor-pointer transition-colors ${
              selectedMess?.id === mess.id
                ? "bg-indigo-50 border-l-4 border-l-indigo-500"
                : "hover:bg-gray-50"
            }`}
            onClick={() => onSelectMess(mess)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{mess.name}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {mess.description || "No description available"}
                </p>
                {mess.rating && (
                  <div className="flex items-center mt-2">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-sm text-gray-600 ml-1">
                      {mess.rating} ({mess.reviewCount || 0} reviews)
                    </span>
                  </div>
                )}
              </div>

              {mess.isActive ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Open
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Closed
                </span>
              )}
            </div>

            {mess.specialty && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Special: {mess.specialty}
                </span>
              </div>
            )}
          </div>
        ))}

        {messes.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500">No messes available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessList;
