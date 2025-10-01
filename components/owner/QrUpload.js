"use client";
import { useState } from "react";

export default function QrUpload({ messId }) {
  const [qrCode, setQrCode] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("Please select an image smaller than 2MB");
        return;
      }

      setQrCode(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadQrCode = async () => {
    if (!qrCode) {
      alert("Please select a QR code image first");
      return;
    }

    setUploading(true);
    try {
      // Simulate upload - replace with actual Firebase storage code
      console.log("Uploading QR code for mess:", messId);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert("QR code uploaded successfully!");
      setQrCode(null);
      setPreviewUrl("");

      // Clear file input
      const fileInput = document.getElementById("qr-upload");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Error uploading QR code:", error);
      alert("Error uploading QR code: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeQrCode = async () => {
    if (confirm("Are you sure you want to remove the QR code?")) {
      try {
        // Simulate remove operation
        console.log("Removing QR code for mess:", messId);
        setPreviewUrl("");
        alert("QR code removed successfully!");
      } catch (error) {
        alert("Error removing QR code: " + error.message);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        UPI QR Code Management
      </h2>

      <div className="space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Upload a clear image of your UPI QR code</li>
            <li>Supported formats: JPG, PNG, WebP (max 2MB)</li>
            <li>Students will scan this code for online payments</li>
            <li>Ensure the QR code is readable and well-lit</li>
          </ul>
        </div>

        {/* Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {previewUrl ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={previewUrl}
                  alt="QR Code Preview"
                  className="max-w-xs max-h-64 border rounded-lg"
                />
              </div>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={uploadQrCode}
                  disabled={uploading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Confirm Upload"}
                </button>
                <button
                  onClick={() => {
                    setQrCode(null);
                    setPreviewUrl("");
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-center mb-4">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 48 48"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  />
                </svg>
              </div>
              <label htmlFor="qr-upload" className="cursor-pointer">
                <span className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                  Select QR Code Image
                </span>
                <input
                  id="qr-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500 mt-2">or drag and drop</p>
            </div>
          )}
        </div>

        {/* Current QR Code Display */}
        <div className="border-t pt-6">
          <h3 className="font-medium text-gray-900 mb-4">Current QR Code</h3>
          <div className="flex items-center space-x-6">
            <div className="w-48 h-48 border rounded-lg bg-gray-100 flex items-center justify-center">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Current QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-gray-400 text-sm">
                  No QR code uploaded
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-4">
                This QR code will be shown to students for online payments. Make
                sure it's always up to date.
              </p>
              {previewUrl && (
                <button
                  onClick={removeQrCode}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  Remove QR Code
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Payment Instructions for Students */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">
            How it works for students:
          </h3>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Student selects online payment at checkout</li>
            <li>Your QR code is displayed to the student</li>
            <li>Student scans the code with any UPI app</li>
            <li>Payment is processed instantly</li>
            <li>Order is confirmed automatically upon successful payment</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
