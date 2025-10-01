import { ResumeData } from '../types';

/**
 * Extract email from text using improved regex
 */
const extractEmail = (text: string): string | undefined => {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const matches = text.match(emailRegex);
  
  if (matches) {
    // Return the first valid email, preferring non-generic domains
    const sortedEmails = matches.sort((a, b) => {
      const genericDomains = ['example.com', 'test.com', 'sample.com'];
      const aIsGeneric = genericDomains.some(domain => a.includes(domain));
      const bIsGeneric = genericDomains.some(domain => b.includes(domain));
      
      if (aIsGeneric && !bIsGeneric) return 1;
      if (!aIsGeneric && bIsGeneric) return -1;
      return 0;
    });
    
    return sortedEmails[0];
  }
  
  return undefined;
};

/**
 * Extract phone number from text using improved regex
 */
const extractPhone = (text: string): string | undefined => {
  // Multiple patterns for different phone formats
  const phonePatterns = [
    /\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/, // +1-234-567-8900, (123) 456-7890
    /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/, // (123) 456-7890, 123-456-7890
    /\d{10}/, // 1234567890
    /\+\d{1,3}\s?\d{3,4}\s?\d{3,4}\s?\d{3,4}/ // International formats
  ];
  
  for (const pattern of phonePatterns) {
    const match = text.match(pattern);
    if (match && match[0].replace(/\D/g, '').length >= 10) {
      return match[0].trim();
    }
  }
  
  return undefined;
};

/**
 * Extract name from text (enhanced heuristic)
 */
const extractName = (text: string): string | undefined => {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  // Common resume headers to skip
  const skipPatterns = [
    /resume|curriculum|vitae|cv|profile|summary|objective/i,
    /@|email|phone|address|linkedin|github/i,
    /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/,
    /^[A-Z]{2,}$/,  // All caps words
    /experience|education|skills|projects/i
  ];
  
  // Try to find name in first 10 lines
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].trim();
    
    // Skip if matches any skip pattern
    if (skipPatterns.some(pattern => pattern.test(line))) {
      continue;
    }
    
    // Clean and split words
    const words = line.replace(/[^a-zA-Z\s'.-]/g, ' ').split(/\s+/).filter(word => word.length > 1);
    
    if (words.length >= 2 && words.length <= 4 && line.length >= 5 && line.length < 50) {
      const isLikelyName = words.every(word => {
        // More flexible name pattern
        return /^[A-Z][a-zA-Z'.-]*$/i.test(word) && 
               word.length > 1 && 
               !/^(mr|mrs|ms|dr|prof)$/i.test(word);
      });
      
      if (isLikelyName) {
        return words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
      }
    }
  }
  
  return undefined;
};

/**
 * Extract skills from text
 */
const extractSkills = (text: string): string[] => {
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB',
    'SQL', 'PostgreSQL', 'MySQL', 'Python', 'Java', 'C++', 'HTML', 'CSS',
    'Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'REST API',
    'GraphQL', 'Redux', 'Vue', 'Angular', 'Next.js', 'Nest.js'
  ];
  
  const foundSkills: string[] = [];
  const lowerText = text.toLowerCase();
  
  commonSkills.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });
  
  return foundSkills;
};

/**
 * Parse resume text and extract structured data
 */
export const parseResumeText = (text: string): ResumeData => {
  // Clean and normalize text
  const cleanText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n');
  
  const resumeData: ResumeData = {
    rawText: cleanText,
  };
  
  // Extract basic information with multiple attempts
  resumeData.name = extractName(cleanText) || extractNameFallback(cleanText);
  resumeData.email = extractEmail(cleanText);
  resumeData.phone = extractPhone(cleanText);
  resumeData.skills = extractSkills(cleanText);
  
  return resumeData;
};

/**
 * Fallback name extraction method
 */
const extractNameFallback = (text: string): string | undefined => {
  // Look for patterns like "Name: John Doe" or "Full Name: Jane Smith"
  const namePatterns = [
    /(?:name|full name|candidate)\s*:?\s*([A-Z][a-zA-Z\s'.-]{2,40})/i,
    /^([A-Z][a-zA-Z]+\s+[A-Z][a-zA-Z]+)/m  // First line with two capitalized words
  ];
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      if (name.split(' ').length >= 2 && name.length < 50) {
        return name;
      }
    }
  }
  
  return undefined;
};

/**
 * Parse PDF file and extract text using pdfjs-dist
 */
export const parsePdfFile = async (file: File): Promise<ResumeData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
        
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        
        let fullText = '';
        
        // Extract text from all pages with better formatting
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => {
              // Preserve line breaks and spacing
              return item.str + (item.hasEOL ? '\n' : ' ');
            })
            .join('');
          fullText += pageText + '\n';
        }
        
        const resumeData = parseResumeText(fullText);
        resolve(resumeData);
      } catch (error) {
        console.error('PDF parsing error:', error);
        reject(new Error('Failed to parse PDF file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parse DOCX file and extract text using mammoth
 */
export const parseDocxFile = async (file: File): Promise<ResumeData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        // Dynamic import of mammoth
        const mammoth = await import('mammoth');
        
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const result = await mammoth.extractRawText({ arrayBuffer });
        const fullText = result.value;
        
        const resumeData = parseResumeText(fullText);
        resolve(resumeData);
      } catch (error) {
        console.error('DOCX parsing error:', error);
        reject(new Error('Failed to parse DOCX file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Main function to parse resume file based on type
 */
export const parseResumeFile = async (file: File): Promise<ResumeData> => {
  const fileType = file.type;
  
  if (fileType === 'application/pdf') {
    return parsePdfFile(file);
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return parseDocxFile(file);
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
  }
};
