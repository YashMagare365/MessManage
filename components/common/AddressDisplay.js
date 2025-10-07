"use client";

export default function AddressDisplay({ address, title = "Address" }) {
  if (!address) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">{title}</h4>
        <p className="text-gray-500 text-sm">No address provided</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-medium text-gray-900 mb-2">{title}</h4>
      <div className="text-sm text-gray-600 space-y-1">
        {typeof address === "string" ? (
          <p>{address}</p>
        ) : (
          <>
            {address.street && <p>{address.street}</p>}
            {address.city && (
              <p>
                {address.city}, {address.state} {address.zipCode}
              </p>
            )}
            {address.landmark && <p>Landmark: {address.landmark}</p>}
          </>
        )}
      </div>
    </div>
  );
}
