'use client';
import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';

// Test all the problematic images
const testImages = [
  { name: 'Eastern Cape Photo', path: 'images/eastern_cape_photo.jpg' },
  { name: 'Jim McKeown', path: 'images/staff/Jim McKeown.jpg' },
  { name: 'Ta Fiks Mahola', path: 'images/staff/Ta Fiks Mahola.jpg' },
  { name: 'Zama Zulu', path: 'images/staff/zama-zulu-masked.webp' },
];

export default function ImageDebugPage() {
  const bucketName = process.env.NEXT_PUBLIC_GCS_BUCKET_NAME;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Image Debug Tool</h1>

      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">Environment Check</h2>
        <p><strong>NEXT_PUBLIC_GCS_BUCKET_NAME:</strong> {bucketName || '❌ NOT SET'}</p>
        {!bucketName && (
          <p className="text-red-600 mt-2">
            ⚠️ Bucket name not set! Images will try to load from local paths.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {testImages.map((img) => {
          const url = getImageUrl(img.path);
          return (
            <div key={img.path} className="border p-4 rounded">
              <h3 className="font-semibold mb-2">{img.name}</h3>
              <p className="text-sm text-gray-600 mb-2">Path: {img.path}</p>
              <p className="text-sm text-gray-600 mb-4 break-all">URL: {url}</p>

              {/* Test with Next.js Image */}
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Next.js &lt;Image&gt; Component:</p>
                <div className="relative w-48 h-48 bg-gray-200">
                  <Image
                    src={url}
                    alt={img.name}
                    fill
                    className="object-cover"
                    onError={() => console.error(`Failed to load: ${url}`)}
                  />
                </div>
              </div>

              {/* Test with regular img */}
              <div>
                <p className="text-sm font-medium mb-2">Regular &lt;img&gt; Tag:</p>
                <img
                  src={url}
                  alt={img.name}
                  className="w-48 h-48 object-cover bg-gray-200"
                  onError={(e) => {
                    console.error(`Failed to load: ${url}`);
                    e.currentTarget.style.border = '2px solid red';
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
