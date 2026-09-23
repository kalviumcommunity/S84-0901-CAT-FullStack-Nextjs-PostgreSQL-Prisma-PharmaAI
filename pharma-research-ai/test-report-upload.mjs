import fs from 'node:fs';

const API_URL = 'http://localhost:3000/api/documents';
const DUMMY_PDF_PATH_VALID = './valid-report.pdf';
const DUMMY_PDF_PATH_INVALID = './large-report.pdf';

async function testReportUpload() {
  console.log('Testing Report Upload API (with 10MB limit)...');

  // Create a small valid PDF file
  const smallPdf = Buffer.from('%PDF-1.4\n%EOF\n');
  fs.writeFileSync(DUMMY_PDF_PATH_VALID, smallPdf);

  // Create a fake large PDF file > 10MB (11MB)
  const largePdf = Buffer.alloc(11 * 1024 * 1024, '%PDF-1.4\n');
  fs.writeFileSync(DUMMY_PDF_PATH_INVALID, largePdf);

  try {
    // Test 1: Valid Upload
    console.log(`\n--- Test 1: Uploading valid file (< 10MB) to ${API_URL} ---`);
    const validBlob = new Blob([fs.readFileSync(DUMMY_PDF_PATH_VALID)], { type: 'application/pdf' });
    const validFormData = new FormData();
    validFormData.append('file', validBlob, 'valid-report.pdf');

    const validResponse = await fetch(API_URL, { method: 'POST', body: validFormData });
    const validData = await validResponse.json();

    if (validResponse.ok) {
      console.log('✅ Valid upload succeeded as expected!');
      console.log('Response:', validData);
    } else {
      console.error('❌ Valid upload failed unexpectedly!');
      console.error('Status:', validResponse.status);
      console.error('Response:', validData);
    }

    // Test 2: Invalid Upload (Exceeds 10MB limit)
    console.log(`\n--- Test 2: Uploading invalid file (> 10MB) to ${API_URL} ---`);
    const invalidBlob = new Blob([fs.readFileSync(DUMMY_PDF_PATH_INVALID)], { type: 'application/pdf' });
    const invalidFormData = new FormData();
    invalidFormData.append('file', invalidBlob, 'large-report.pdf');

    const invalidResponse = await fetch(API_URL, { method: 'POST', body: invalidFormData });
    const invalidData = await invalidResponse.json();

    if (!invalidResponse.ok && invalidResponse.status === 400) {
      console.log('✅ Invalid upload rejected as expected!');
      console.log('Response:', invalidData);
    } else {
      console.error('❌ Invalid upload did not behave as expected! (Should have been rejected with 400 status)');
      console.error('Status:', invalidResponse.status);
      console.error('Response:', invalidData);
    }
  } catch (error) {
    console.error('❌ Request failed to connect to the server. Is the Next.js server running on localhost:3000?');
    console.error(error.message);
  } finally {
    // Cleanup
    if (fs.existsSync(DUMMY_PDF_PATH_VALID)) fs.unlinkSync(DUMMY_PDF_PATH_VALID);
    if (fs.existsSync(DUMMY_PDF_PATH_INVALID)) fs.unlinkSync(DUMMY_PDF_PATH_INVALID);
  }
}

testReportUpload();
