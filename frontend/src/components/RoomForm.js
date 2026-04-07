import { useState } from "react";
import { Plus, X } from "lucide-react";

// Common hotel amenities
const COMMON_AMENITIES = [
  "WiFi",
  "Air Conditioning",
  "TV",
  "Mini Bar",
  "Room Service",
  "Safe",
  "Hair Dryer",
  "Telephone",
  "Coffee Maker",
  "Kettle",
  "Bathroom Amenities",
  "Towels",
  "Bathrobe",
  "Slippers",
  "Iron & Ironing Board",
  "Desk & Chair",
  "Wardrobe",
  "Balcony",
  "Sea View",
  "City View",
  "Complimentary Water",
  "Daily Housekeeping",
  "24/7 Reception",
  "Laundry Service",
];

const RoomForm = ({ initialValues, onSubmit, submitLabel, loading }) => {
  const [formData, setFormData] = useState(
    initialValues || {
      name: "",
      type: "Single",
      price: "",
      capacity: "",
      size: "",
      description: "",
      amenities: [],
      images: [""],
      available: true,
    }
  );

  const [errors, setErrors] = useState({});
  const [newAmenity, setNewAmenity] = useState("");
  const [showAmenitiesDropdown, setShowAmenitiesDropdown] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "Room name is required";
    }

    // Type validation
    if (!formData.type) {
      newErrors.type = "Room type is required";
    }

    // Price validation
    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    // Capacity validation
    if (!formData.capacity || formData.capacity <= 0) {
      newErrors.capacity = "Capacity must be greater than 0";
    }

    // Size validation
    if (!formData.size || formData.size <= 0) {
      newErrors.size = "Size must be greater than 0";
    }

    // Description validation
    if (!formData.description || formData.description.trim() === "") {
      newErrors.description = "Description is required";
    }

    // Images validation
    const validImages = formData.images.filter(
      (img) => img && img.trim() !== ""
    );
    if (validImages.length === 0) {
      newErrors.images = "At least one image URL is required";
    } else {
      // Basic URL validation
      const urlPattern = /^https?:\/\/.+/i;
      const invalidImages = validImages.filter((img) => !urlPattern.test(img));
      if (invalidImages.length > 0) {
        newErrors.images = "All image URLs must be valid (start with http:// or https://)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
    // Clear images error
    if (errors.images) {
      setErrors({ ...errors, images: undefined });
    }
  };

  const handleAddImage = () => {
    setFormData({ ...formData, images: [...formData.images, ""] });
  };

  const handleRemoveImage = (index) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData({ ...formData, images: newImages });
    }
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, newAmenity.trim()],
      });
      setNewAmenity("");
    }
  };

  const handleSelectAmenity = (amenity) => {
    if (!formData.amenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity],
      });
    }
    setShowAmenitiesDropdown(false);
  };

  const handleRemoveAmenity = (amenity) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((a) => a !== amenity),
    });
  };

  // Filter out already selected amenities from dropdown
  const availableAmenities = COMMON_AMENITIES.filter(
    (amenity) => !formData.amenities.includes(amenity)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Clean up images array (remove empty strings)
    const cleanedData = {
      ...formData,
      images: formData.images.filter((img) => img && img.trim() !== ""),
      image: formData.images[0], // Set primary image
    };

    await onSubmit(cleanedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Room Name */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Room Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-gold"
          placeholder="e.g., Deluxe King Suite"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
        )}
      </div>

      {/* Room Type and Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Room Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleChange("type", e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="Single">Single</option>
            <option value="Double">Double</option>
            <option value="Suite">Suite</option>
          </select>
          {errors.type && (
            <p className="text-red-500 text-sm mt-1">{errors.type}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Price per Night (LKR) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => handleChange("price", e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-gold"
            placeholder="35000"
            min="0"
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price}</p>
          )}
        </div>
      </div>

      {/* Capacity and Size */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Capacity (Guests) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.capacity}
            onChange={(e) => handleChange("capacity", e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-gold"
            placeholder="2"
            min="1"
          />
          {errors.capacity && (
            <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Size (m²) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.size}
            onChange={(e) => handleChange("size", e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-gold"
            placeholder="35"
            min="0"
          />
          {errors.size && (
            <p className="text-red-500 text-sm mt-1">{errors.size}</p>
          )}
        </div>
      </div>

      {/* Availability Status */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.available}
            onChange={(e) => handleChange("available", e.target.checked)}
            className="w-4 h-4 rounded border-border text-gold focus:ring-gold"
          />
          <span className="text-sm font-medium">Available for booking</span>
        </label>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows="4"
          className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-gold resize-none"
          placeholder="Describe the room features and amenities..."
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-sm font-medium mb-2">Amenities</label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newAmenity}
            onChange={(e) => setNewAmenity(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleAddAmenity())
            }
            className="flex-1 px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-gold"
            placeholder="Add custom amenity or select from list (Press Enter to add)"
          />
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAmenitiesDropdown(!showAmenitiesDropdown)}
              className="px-4 py-2 bg-gold text-foreground rounded-lg hover:bg-gold/90 transition-colors flex items-center gap-2"
              title="Select from common amenities"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm font-medium">Quick Select</span>
            </button>
            
            {/* Dropdown for common amenities */}
            {showAmenitiesDropdown && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                <div className="p-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase px-2 py-1">
                    Common Amenities
                  </p>
                  {availableAmenities.length > 0 ? (
                    availableAmenities.map((amenity, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSelectAmenity(amenity)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gold/20 rounded transition-colors"
                      >
                        {amenity}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 px-3 py-2">
                      All amenities added
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.amenities.map((amenity, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 text-gold rounded-full text-sm"
            >
              {amenity}
              <button
                type="button"
                onClick={() => handleRemoveAmenity(amenity)}
                className="hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Image URLs */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Image URLs <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          {formData.images.map((image, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="url"
                value={image}
                onChange={(e) => handleImageChange(index, e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-gold"
                placeholder="https://example.com/image.jpg"
              />
              {formData.images.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="px-3 py-2 border border-border rounded-lg hover:bg-red-500/10 hover:border-red-500 transition-colors"
                >
                  <X className="w-5 h-5 text-red-500" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddImage}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-card transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Another Image
          </button>
        </div>
        {errors.images && (
          <p className="text-red-500 text-sm mt-1">{errors.images}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-gold text-foreground rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {loading ? "Processing..." : submitLabel || "Submit"}
      </button>
    </form>
  );
};

export default RoomForm;
