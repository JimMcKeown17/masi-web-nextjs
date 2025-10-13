/**
 * Get the full URL for an image from Google Cloud Storage
 * @param path - Path to the image (e.g., 'images/logo.png' or '/images/logo.png')
 * @returns Full URL to the image
 */
export function getImageUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const bucketName = process.env.NEXT_PUBLIC_GCS_BUCKET_NAME;
    
    if (!bucketName) {
      console.warn('NEXT_PUBLIC_GCS_BUCKET_NAME not set, using local path');
      return `/${cleanPath}`;
    }
    
    return `https://storage.googleapis.com/${bucketName}/${cleanPath}`;
  }