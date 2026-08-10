export async function urlToFile(url: string, filename: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], filename, { type: blob.type });
    return file;
  } catch (error) {
    console.error("Error converting URL to File:", error);
    throw error;
  }
}
