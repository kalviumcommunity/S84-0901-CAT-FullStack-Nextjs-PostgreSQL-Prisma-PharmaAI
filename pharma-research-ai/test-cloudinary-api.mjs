import fs from 'node:fs';

const API_URL = 'http://localhost:3000/api/upload';
const DUMMY_FILE_PATH = './dummy-image.png';

async function testCloudinaryUpload() {
  console.log('Testing Cloudinary upload API...');
  
  // Create a tiny dummy image file (a valid 1x1 PNG)
  const dummyImg = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==', 'base64');
  fs.writeFileSync(DUMMY_FILE_PATH, dummyImg);

  try {
    const fileBlob = new Blob([fs.readFileSync(DUMMY_FILE_PATH)], { type: 'image/png' });
    const formData = new FormData();
    formData.append('file', fileBlob, 'dummy-image.png');

    console.log(`Sending POST request to ${API_URL}...`);
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Cloudinary Upload API works!');
      console.log('Response:', data);
    } else {
      console.error('❌ Cloudinary Upload API failed!');
      console.error('Status:', response.status);
      console.error('Response:', data);
    }
  } catch (error) {
    console.error('❌ Request failed to connect to the server. Is the Next.js server running on localhost:3000?');
    console.error(error.message);
  } finally {
    // Cleanup
    if (fs.existsSync(DUMMY_FILE_PATH)) {
      fs.unlinkSync(DUMMY_FILE_PATH);
    }
  }
}

testCloudinaryUpload();
