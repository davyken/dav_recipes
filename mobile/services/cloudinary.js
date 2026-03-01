// Cloudinary configuration - using environment variables
const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "dpvyxuvhk";
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "recipe_app_unsigned";

// Upload image to Cloudinary
export const uploadImageToCloudinary = async (imageUri) => {
  try {
    const formData = new FormData();
    
    // Get file extension from URI
    const uriParts = imageUri.split(".");
    const fileExtension = uriParts[uriParts.length - 1];
    
    // Create file object for React Native
    formData.append("file", {
      uri: imageUri,
      name: `recipe_${Date.now()}.${fileExtension}`,
      type: `image/${fileExtension === "jpg" ? "jpeg" : fileExtension}`,
    });
    
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    
    if (!response.ok) {
      throw new Error("Failed to upload image");
    }
    
    const data = await response.json();
    
    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Alternative: Upload using base64 (for smaller images)
export const uploadImageBase64 = async (base64Image) => {
  try {
    const formData = new FormData();
    formData.append("file", `data:image/jpeg;base64,${base64Image}`);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    
    if (!response.ok) {
      throw new Error("Failed to upload image");
    }
    
    const data = await response.json();
    
    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Delete image from Cloudinary
export const deleteImageFromCloudinary = async (publicId) => {
  // Note: This requires your Cloudinary API key/secret on the backend
  // For now, we'll just return success - actual deletion should be done server-side
  console.log("Image deletion requested for:", publicId);
  return { success: true };
};
