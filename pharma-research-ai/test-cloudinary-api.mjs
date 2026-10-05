const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error("Missing Cloudinary CI environment variables");
}

const response = await fetch(
  `https://api.cloudinary.com/v1_1/${cloudName}/resources/image`,
  {
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${apiKey}:${apiSecret}`).toString("base64"),
    },
  }
);

if (!response.ok) {
  const body = await response.text();
  throw new Error(`Cloudinary API request failed: ${response.status} ${body}`);
}

console.log("Cloudinary API authentication succeeded");
