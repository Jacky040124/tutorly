import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
import { storage } from "@/lib/firebase";

interface UploadImageResult {
  downloadUrl: string;
  path: string;
}

export async function downloadFileFromUrl(path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error("Error in downloadFileFromUrl:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to get download URL: ${error.message}`);
    }
    throw new Error("Failed to get download URL: Unknown error occurred");
  }
}

export async function uploadImage(file: File, folder: string = "avatars"): Promise<UploadImageResult> {
  try {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("Invalid file type. Please upload an image file.");
    }

    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > MAX_SIZE) {
      throw new Error("File size too large. Maximum size is 5MB.");
    }

    // Create a unique filename using timestamp
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const path = `${folder}/${fileName}`;

    // Create storage reference
    const storageRef = ref(storage, path);

    // Upload file
    console.log(`Uploading file: ${fileName}`);
    await uploadBytes(storageRef, file);

    // Get download URL
    const downloadUrl = await getDownloadURL(storageRef);
    console.log(`File uploaded successfully: ${fileName}`);

    return {
      downloadUrl,
      path,
    };
  } catch (error) {
    console.error("Error in uploadImage:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    throw new Error("Failed to upload image: Unknown error occurred");
  }
}


