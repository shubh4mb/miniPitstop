import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

const ImageCropper = ({
  imageUrl,
  onCropComplete,
  onCancel,
  aspectRatio = 1,
  circularCrop = false,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async () => {
    try {
      const image = await createImage(imageUrl);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      // Set canvas size to match the cropped area
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      // Draw the cropped image onto the canvas
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      // If circular crop is enabled, create a circular clip
      if (circularCrop) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) / 2;

        // Create a temporary canvas for the circular crop
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');

        if (!tempCtx) {
          throw new Error('No 2d context');
        }

        tempCtx.beginPath();
        tempCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        tempCtx.closePath();
        tempCtx.clip();
        tempCtx.drawImage(canvas, 0, 0);

        // Replace the original canvas with the circular one
        canvas.width = radius * 2;
        canvas.height = radius * 2;
        ctx.drawImage(tempCanvas, 0, 0);
      }

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            console.error('Canvas is empty');
            return;
          }
          blob.name = 'cropped.jpeg';
          const croppedImageUrl = URL.createObjectURL(blob);
          resolve({ url: croppedImageUrl, blob });
        }, 'image/jpeg', 1);
      });
    } catch (e) {
      console.error('Error creating cropped image:', e);
      throw e;
    }
  };

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg();
      onCropComplete(croppedImage);
    } catch (e) {
      console.error('Error saving crop:', e);
    }
  };

  return (
    <div className="image-cropper">
      <div className="relative h-[400px] w-full bg-gray-50 rounded-lg overflow-hidden">
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteHandler}
          onZoomChange={onZoomChange}
          cropShape={circularCrop ? 'round' : 'rect'}
          showGrid={!circularCrop}
          classes={{
            containerClassName: 'h-full',
          }}
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Zoom: {zoom.toFixed(1)}x
        </label>
        <input
          type="range"
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          aria-labelledby="Zoom"
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Crop Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-lg transition-all duration-200 flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          <span>Crop</span>
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <p className="font-medium mb-2">
          {circularCrop ? 'Circular Logo Crop' : 'Banner Crop'} - {aspectRatio}:1 ratio
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Drag to reposition the image</li>
          <li>Use the slider to zoom in/out</li>
          <li>Aspect ratio is fixed for consistency</li>
          {circularCrop && <li>Final output will be circular</li>}
        </ul>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ImageCropper;
