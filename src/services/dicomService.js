/**
 * Converts a regular URL to a Cornerstone image ID.
 * Orthanc usually requires 'wadouri:' or 'dicomweb:' prefix for cornerstoneDICOMImageLoader.
 * @param {string} url - The URL of the DCM file.
 * @returns {string} - The Cornerstone Image ID.
 */
export function getCornerstoneImageId(url) {
  if (!url) return null;
  // If it's already a cornerstone imageId, return it
  if (url.startsWith('wadouri:') || url.startsWith('dicomweb:')) {
    return url;
  }
  // Default to wadouri for simple URL access
  return `wadouri:${url}`;
}

/**
 * Fetches instance IDs from the local Orthanc server.
 * @param {string} baseUrl - The base URL of the Orthanc server.
 * @returns {Promise<Array>} - Array of { name, url }
 */
export async function fetchOrthancInstances(baseUrl = 'http://localhost:8042') {
  try {
    const response = await fetch(`${baseUrl}/instances`);
    if (!response.ok) throw new Error('Failed to fetch instances from Orthanc');
    
    const instanceIds = await response.json();
    
    // Map instance IDs to the format expected by DcmViewport
    return instanceIds.map(id => ({
      name: `Instance ${id.substring(0, 8)}...`,
      url: `${baseUrl}/instances/${id}/file`
    }));
  } catch (err) {
    console.error('Orthanc fetch error:', err);
    return [];
  }
}

/**
 * Mock function to simulate fetching data if needed.
 */
export const dicomService = {
  getCornerstoneImageId,
  fetchOrthancInstances,
};
