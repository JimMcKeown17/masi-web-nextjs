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

    // Properly encode each path segment to handle spaces and special characters
    // This ensures Next.js Image Optimization can fetch the images in production
    const encodedPath = cleanPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
    return `https://storage.googleapis.com/${bucketName}/${encodedPath}`;
  }

/**
 * Get the full URL for any asset (PDFs, documents, etc.) from Google Cloud Storage
 * @param path - Path to the asset (e.g., 'reports/annual-report.pdf' or '/reports/annual-report.pdf')
 * @returns Full URL to the asset
 */
export function getAssetUrl(path: string): string {
    return getImageUrl(path); // Same logic as images
  }