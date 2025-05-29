import axios from "axios";
import toast from "react-hot-toast";

/**
 * Uploads an image file to Cloudinary after client-side validation.
 * @param {File} file - The image file to upload.
 * @param {object} options - Validation options.
 * @param {number} [options.maxSizeMB=2] - Maximum allowed file size in megabytes.
 * @param {string[]} [options.allowedTypes=["image/jpeg", "image/png", "image/gif", "image/jpg"]] - Allowed MIME types.
 * @returns {Promise<string|null>} A promise that resolves with the secure URL of the uploaded image, or null if upload fails.
 */
export const uploadImageToCloudinary = async (file, options = {}) => {
	const {
		maxSizeMB = 2,
		allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"],
	} = options;

	if (!file) {
		toast.error("No file selected.");
		return null;
	}

	// Client-side validation
	if (file.size > maxSizeMB * 1024 * 1024) {
		toast.error(`Image size must be less than ${maxSizeMB}MB.`);
		return null;
	}

	if (!allowedTypes.includes(file.type)) {
		toast.error(
			`Invalid file type. Allowed types: ${allowedTypes.join(", ")}.`
		);
		return null;
	}

	const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
	const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

	if (!cloudName || !uploadPreset) {
		toast.error("Cloudinary configuration is missing. Please contact support.");
		console.error(
			"Cloudinary cloudName or uploadPreset is not defined in .env"
		);
		return null;
	}

	const formData = new FormData();
	formData.append("file", file);
	formData.append("upload_preset", uploadPreset);

	try {
		const response = await axios.post(
			`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
			formData,
			{
				withCredentials: false, // Important for Cloudinary direct uploads
				headers: { "Content-Type": "multipart/form-data" },
			}
		);
		return response.data.secure_url;
	} catch (error) {
		console.error(
			"Error uploading image to Cloudinary:",
			error.response?.data || error.message
		);
		toast.error("Failed to upload image. Please try again or contact support.");
		return null;
	}
};
