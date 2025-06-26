export const uploadImage = async (file: File, uploadURL: string) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(uploadURL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload to Cloudflare");
    }

    return response.json();
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};
