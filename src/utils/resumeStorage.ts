/**
 * Resume storage utilities for handling file storage and retrieval
 */

export interface StoredResume {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  data: string; // base64 encoded
  uploadDate: string;
}

/**
 * Convert file to base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Store resume in localStorage with candidate ID
 */
export const storeResume = async (candidateId: string, file: File): Promise<StoredResume> => {
  try {
    const base64Data = await fileToBase64(file);
    
    const storedResume: StoredResume = {
      id: candidateId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      data: base64Data,
      uploadDate: new Date().toISOString(),
    };

    // Store in localStorage
    localStorage.setItem(`resume_${candidateId}`, JSON.stringify(storedResume));
    
    return storedResume;
  } catch (error) {
    throw new Error(`Failed to store resume: ${error}`);
  }
};

/**
 * Retrieve resume from localStorage
 */
export const getResume = (candidateId: string): StoredResume | null => {
  try {
    const stored = localStorage.getItem(`resume_${candidateId}`);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to retrieve resume:', error);
    return null;
  }
};

/**
 * Delete resume from localStorage
 */
export const deleteResume = (candidateId: string): boolean => {
  try {
    localStorage.removeItem(`resume_${candidateId}`);
    return true;
  } catch (error) {
    console.error('Failed to delete resume:', error);
    return false;
  }
};

/**
 * Get resume URL for viewing
 */
export const getResumeViewUrl = (candidateId: string): string | null => {
  const resume = getResume(candidateId);
  return resume ? resume.data : null;
};

/**
 * Check if resume exists for candidate
 */
export const hasResume = (candidateId: string): boolean => {
  return getResume(candidateId) !== null;
};

/**
 * Get resume info (without data) for display
 */
export const getResumeInfo = (candidateId: string): Omit<StoredResume, 'data'> | null => {
  const resume = getResume(candidateId);
  if (!resume) return null;
  
  const { data, ...info } = resume;
  return info;
};