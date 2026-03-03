const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const OCR_API_KEY = "k89582573588957";

/* ---------------- NORMALIZATION HELPERS ---------------- */

const normalizeName = (name = "") =>
  name
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const normalizeNumber = (value = "") =>
  value.replace(/\D/g, "").trim();

/* ---------------- OCR CORE ---------------- */

async function callOCRSpace(filePath) {
  const formData = new FormData();
  formData.append("apikey", OCR_API_KEY);
  formData.append("language", "eng");
  formData.append("isOverlayRequired", "false");
  formData.append("file", fs.createReadStream(filePath));

  const response = await axios.post(
    "https://api.ocr.space/parse/image",
    formData,
    { headers: formData.getHeaders() }
  );

  if (!response.data || response.data.IsErroredOnProcessing) {
    throw new Error("OCR processing failed");
  }

  return response.data.ParsedResults?.[0]?.ParsedText || "";
}

/* ---------------- STRING SIMILARITY ---------------- */

function calculateSimilarity(a, b) {
  if (!a || !b) return 0;

  const aWords = a.split(" ");
  const bWords = b.split(" ");

  let matchCount = 0;
  aWords.forEach(word => {
    if (bWords.includes(word)) matchCount++;
  });

  return matchCount / Math.max(aWords.length, bWords.length);
}

/* ---------------- AADHAAR VERIFICATION ---------------- */

async function verifyAadhaar(imagePath, inputName, inputAadhaar) {
  const rawText = await callOCRSpace(imagePath);
  const cleanText = rawText.replace(/\n/g, " ");

  // Aadhaar extraction
  const aadhaarMatch = cleanText.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/);
  const extractedAadhaar = aadhaarMatch
    ? normalizeNumber(aadhaarMatch[0])
    : "";

  // Name extraction
  const nameMatch = cleanText.match(
    /(Name|नाम)\s*[:\-]?\s*([A-Za-z ]{3,})/i
  );
  const extractedName = nameMatch ? nameMatch[2].trim() : "";

  // Normalization
  const normInputName = normalizeName(inputName);
  const normExtractedName = normalizeName(extractedName);
  const normInputAadhaar = normalizeNumber(inputAadhaar);

  // Matching
  const aadhaarMatched =
    extractedAadhaar && extractedAadhaar === normInputAadhaar;

  const similarity = calculateSimilarity(
    normInputName,
    normExtractedName
  );

  let result;

  /* ----------- FINAL DECISION LOGIC (FIXED) ----------- */

  if (aadhaarMatched && similarity === 1) {
    // ✅ FULL MATCH
    result = {
      success: true,
      verified: true,
      message: "Aadhaar verified successfully!",
      extractedName,
      extractedAadhaar,
      nameMatch: true,
      aadhaarMatch: true,
      similarity
    };
  } else {
    // ❌ TOTAL FAILURE
    result = {
      success: false,
      verified: false,
      message: "Verification failed.",
      extractedName,
      extractedAadhaar,
      nameMatch: false,
      aadhaarMatch: false,
      similarity
    };
  }

  return result;
}

/* ---------------- PAN VERIFICATION (UNCHANGED) ---------------- */

async function verifyPan(imagePath, inputName, inputPAN) {
  const rawText = await callOCRSpace(imagePath);
  const cleanText = rawText.replace(/\n/g, " ");

  const panMatch = cleanText.match(/\b[A-Z]{5}[0-9]{4}[A-Z]\b/);
  const extractedPAN = panMatch ? panMatch[0] : "";

  const nameMatch = cleanText.match(
    /(Name)\s*[:\-]?\s*([A-Za-z ]{3,})/i
  );
  const extractedName = nameMatch ? nameMatch[2].trim() : "";

  const normInputName = normalizeName(inputName);
  const normExtractedName = normalizeName(extractedName);
  const normInputPAN = inputPAN.toUpperCase().replace(/\s/g, "");

  const nameSimilarity = calculateSimilarity(
    normInputName,
    normExtractedName
  );

  const panMatched =
    extractedPAN && extractedPAN === normInputPAN;

  return {
    success: panMatched && nameSimilarity >= 0.6,
    verified: panMatched && nameSimilarity >= 0.6,
    message:
      panMatched && nameSimilarity >= 0.6
        ? "PAN verified successfully!"
        : "PAN document uploaded but could not fully verify",
    extractedName,
    extractedPAN,
    nameMatch: nameSimilarity >= 0.6,
    panMatch: panMatched,
    similarity: nameSimilarity
  };
}

/* ---------------- EXPORTS ---------------- */

module.exports = {
  verifyAadhaar,
  verifyPan
};
