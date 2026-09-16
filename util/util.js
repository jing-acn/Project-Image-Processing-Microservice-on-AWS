import fs from "fs";
import os from "os";
import path from "path";
import Jimp from "jimp";

// Downloads an image from a public URL,
// applies filtering, and saves it temporarily.
export async function filterImageFromURL(inputURL) {
  console.log("Downloading image:", inputURL);

  // Download the image using Node.js fetch.
  const response = await fetch(inputURL, {
    redirect: "follow"
  });

  if (!response.ok) {
    throw new Error(
      `Image download failed with HTTP status ${response.status}`
    );
  }

  const contentType = response.headers.get("content-type");

  if (!contentType || !contentType.startsWith("image/")) {
    throw new Error(
      `The URL did not return an image. Content-Type: ${
        contentType || "unknown"
      }`
    );
  }

  // Convert the downloaded image into a Buffer for Jimp.
  const arrayBuffer = await response.arrayBuffer();
  const imageBuffer = Buffer.from(arrayBuffer);

  if (imageBuffer.length === 0) {
    throw new Error("The downloaded image is empty.");
  }

  console.log(`Downloaded ${imageBuffer.length} bytes`);
  console.log(`Content-Type: ${contentType}`);

  // Read the downloaded Buffer instead of asking Jimp to download the URL.
  const photo = await Jimp.read(imageBuffer);

  console.log("Image loaded successfully");

  // os.tmpdir() works on Windows, Linux, and deployment environments.
  const filename = `filtered-${Date.now()}.jpg`;
  const outpath = path.join(os.tmpdir(), filename);

  await photo
    .resize(256, 256)
    .quality(60)
    .greyscale()
    .writeAsync(outpath);

  console.log("Filtered image saved:", outpath);

  return outpath;
}

// Deletes temporary local files after the response finishes.
export async function deleteLocalFiles(files) {
  for (const file of files) {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log("Deleted temporary file:", file);
      }
    } catch (error) {
      console.error("Unable to delete temporary file:", error);
    }
  }
}