import React from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';

// Simple responsive map component using Google Maps embed
// Provide `lat` and `lng` props as decimal coordinates (e.g., 31.7833, 76.9866)
const MandalMap = ({
  lat = 31.568966,
  lng = 77.110055,
  placeName = 'Jai Dev Balatika Shegal Yuvak Mandal Burahan',
  zoom = 15,
  height = 400
}) => {
  const src = `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;

  return (
    <section id="about" className="pt-12 pb-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <MapPinIcon className="w-5 h-5 text-indigo-600" />
            Location
          </h3>
          <p className="text-sm text-gray-600">{placeName}</p>
        </div>

        <div className="rounded-lg overflow-hidden shadow-md">
          {height ? (
            <div style={{ height: `${height}px`, width: '100%' }}>
              <iframe
                title="Mandal Location"
                src={src}
                width="100%"
                height={height}
                className="border-0 w-full h-full"
                loading="lazy"
              />
            </div>
          ) : (
            <div style={{ position: 'relative', paddingTop: '56.25%' /* 16:9 */ }}>
              <iframe
                title="Mandal Location"
                src={src}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                className="border-0"
                loading="lazy"
              />
            </div>
          )}
        </div>

        <div className="mt-3 text-sm text-gray-600">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
            target="_blank"
            rel="noreferrer"
            className="text-indigo-600 hover:underline"
          >
            Open in Google Maps
          </a>
        </div>
      </div>
    </section>
  );
};

export default MandalMap;
