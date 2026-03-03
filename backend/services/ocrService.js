const Tesseract = require('tesseract.js');
const sharp = require('sharp');

class OCRService {
  async extractText(imagePath) {
    try {
      // Preprocess image
      const processedImage = await sharp(imagePath)
        .greyscale()
        .normalize()
        .sharpen()
        .toBuffer();

      // Perform OCR
      const { data: { text } } = await Tesseract.recognize(
        processedImage,
        'eng',
        {
          logger: m => console.log('OCR Progress:', m.status, m.progress)
        }
      );
      
      console.log('Extracted Text:', text);
      return text;
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  extractAadhaarName(text) {
    console.log('\n=== Extracting Aadhaar Name ===');

    // Multiple patterns for Aadhaar
    const patterns = [
      /(?:Name|NAME)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /To\s*\n\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/,
      /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/m,
      /(?:^|\n)([A-Z][A-Z\s]{10,50})(?:\n|$)/m
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        // Clean up common OCR artifacts
        const cleanName = name.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
        console.log('Found name:', cleanName);
        return cleanName;
      }
    }

    console.log('No name found, returning null');
    return null;
  }

  extractPANName(text) {
    console.log('\n=== Extracting PAN Name ===');

    const patterns = [
      /(?:Name|NAME)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/m,
      /(?:^|\n)([A-Z][A-Z\s]{10,50})(?:\n|$)/m
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        // Clean up common OCR artifacts
        const cleanName = name.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
        console.log('Found name:', cleanName);
        return cleanName;
      }
    }

    console.log('No name found, returning null');
    return null;
  }

  extractAadhaarNumber(text) {
    console.log('\n=== Extracting Aadhaar Number ===');
    
    // Pattern for Aadhaar number (12 digits with optional spaces)
    const aadhaarPattern = /\b\d{4}\s*\d{4}\s*\d{4}\b|\b\d{12}\b/;
    const match = text.match(aadhaarPattern);
    
    if (match) {
      // Remove spaces and return 12-digit number
      const aadhaar = match[0].replace(/\s/g, '');
      console.log('Found Aadhaar:', aadhaar);
      return aadhaar;
    }
    
    console.log('No Aadhaar number found');
    return null;
  }

  compareNames(name1, name2) {
    console.log('\n=== Comparing Names ===');
    console.log('Name 1 (input):', name1);
    console.log('Name 2 (extracted):', name2);

    if (!name1 || !name2) {
      console.log('One or both names are missing');
      return false;
    }

    // Normalize
    const normalize = (str) => str.toLowerCase().replace(/[^a-z\s]/g, '').trim();
    const n1 = normalize(name1);
    const n2 = normalize(name2);

    console.log('Normalized 1:', n1);
    console.log('Normalized 2:', n2);

    // Exact match
    if (n1 === n2) {
      console.log('✓ Exact match');
      return true;
    }

    // Split into words
    const words1 = n1.split(/\s+/);
    const words2 = n2.split(/\s+/);

    // Check if major words match
    const matchingWords = words1.filter(w => words2.includes(w) && w.length > 2);
    const matchRatio = matchingWords.length / Math.max(words1.length, words2.length);

    console.log('Matching words:', matchingWords);
    console.log('Match ratio:', matchRatio);

    // At least 60% words should match
    if (matchRatio >= 0.6) {
      console.log('✓ Partial match (good enough)');
      return true;
    }

    // Calculate similarity
    const similarity = this.calculateSimilarity(n1, n2);
    console.log('Similarity score:', similarity);

    const isMatch = similarity > 0.7;
    console.log(isMatch ? '✓ Similar enough' : '✗ Not similar enough');

    return isMatch;
  }

  calculateSimilarity(s1, s2) {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(s1, s2) {
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  async verifyAadhaar(imagePath, inputName, inputAadhaar) {
    try {
      console.log('\n=== AADHAAR VERIFICATION ===');
      console.log('Input Name:', inputName);
      console.log('Input Aadhaar:', inputAadhaar);
      console.log('Image:', imagePath);

      // Extract text from image
      const extractedText = await this.extractText(imagePath);
      
      // Extract Aadhaar number
      const extractedAadhaar = this.extractAadhaarNumber(extractedText);
      
      // Extract name
      const extractedName = this.extractAadhaarName(extractedText);
      
      console.log('\n=== Extracted Data ===');
      console.log('Extracted Aadhaar:', extractedAadhaar);
      console.log('Extracted Name:', extractedName);

      // Compare Aadhaar numbers
      const aadhaarMatch = extractedAadhaar && inputAadhaar === extractedAadhaar;
      
      // Compare names
      const nameMatch = extractedName && this.compareNames(inputName, extractedName);
      
      const similarity = extractedName ? this.calculateSimilarity(
        inputName.toLowerCase().replace(/[^a-z\s]/g, '').trim(),
        extractedName.toLowerCase().replace(/[^a-z\s]/g, '').trim()
      ) : 0;

      console.log('\n=== Verification Result ===');
      console.log('Aadhaar Match:', aadhaarMatch);
      console.log('Name Match:', nameMatch, '| Similarity:', similarity);

      if (aadhaarMatch && nameMatch) {
        return {
          success: true,
          verified: true,
          message: 'Aadhaar verified successfully!',
          extractedName: extractedName,
          extractedAadhaar: extractedAadhaar,
          nameMatch: nameMatch,
          aadhaarMatch: aadhaarMatch,
          similarity: similarity
        };
      } else if (extractedAadhaar && aadhaarMatch) {
        return {
          success: true,
          verified: false,
          message: 'Aadhaar number verified but name could not be fully verified',
          extractedName: extractedName,
          extractedAadhaar: extractedAadhaar,
          nameMatch: nameMatch,
          aadhaarMatch: aadhaarMatch,
          similarity: similarity,
          warning: 'Manual verification may be required'
        };
      } else {
        return {
          success: false,
          message: 'Could not verify Aadhaar number from image. Please ensure image is clear.',
          extractedName: extractedName,
          extractedAadhaar: extractedAadhaar,
          nameMatch: nameMatch,
          aadhaarMatch: aadhaarMatch,
          similarity: similarity,
          warning: 'Manual verification may be required'
        };
      }
    } catch (error) {
      console.error('Aadhaar Verification Error:', error);
      return {
        success: false,
        message: 'Error during Aadhaar verification: ' + error.message
      };
    }
  }

  async verifyPan(imagePath, inputName, inputPan) {
    try {
      console.log('\n=== PAN VERIFICATION ===');
      console.log('Input Name:', inputName);
      console.log('Input PAN:', inputPan);
      console.log('Image:', imagePath);

      // Extract text from image
      const extractedText = await this.extractText(imagePath);
      
      // Extract name
      const extractedName = this.extractPANName(extractedText);
      
      console.log('\n=== Extracted Data ===');
      console.log('Extracted Name:', extractedName);

      // Compare names
      const nameMatch = extractedName && this.compareNames(inputName, extractedName);
      
      const similarity = extractedName ? this.calculateSimilarity(
        inputName.toLowerCase().replace(/[^a-z\s]/g, '').trim(),
        extractedName.toLowerCase().replace(/[^a-z\s]/g, '').trim()
      ) : 0;

      console.log('\n=== Verification Result ===');
      console.log('Name Match:', nameMatch, '| Similarity:', similarity);

      if (nameMatch) {
        return {
          success: true,
          verified: true,
          message: 'PAN verified successfully!',
          extractedName: extractedName,
          nameMatch: nameMatch,
          similarity: similarity
        };
      } else if (extractedName) {
        return {
          success: true,
          verified: false,
          message: 'PAN document uploaded but name could not be fully verified',
          extractedName: extractedName,
          nameMatch: nameMatch,
          similarity: similarity,
          warning: 'Manual verification may be required'
        };
      } else {
        return {
          success: false,
          message: 'Could not extract name from PAN image. Please ensure image is clear.',
          extractedName: extractedName,
          nameMatch: nameMatch,
          similarity: similarity,
          warning: 'Manual verification may be required'
        };
      }
    } catch (error) {
      console.error('PAN Verification Error:', error);
      return {
        success: false,
        message: 'Error during PAN verification: ' + error.message
      };
    }
  }
}

module.exports = new OCRService();