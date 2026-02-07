import { useState, useRef, useEffect } from 'react';
import { Form, Image } from 'react-bootstrap';
import imageCompression from 'browser-image-compression';

const resizeToExactDimensions = (file, targetWidth, targetHeight) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new window.Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');

        // Calculate scaling to cover the entire canvas (crop to fit)
        const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        // Center the image
        const x = (targetWidth - scaledWidth) / 2;
        const y = (targetHeight - scaledHeight) / 2;

        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        canvas.toBlob(
          (blob) => {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(resizedFile);
          },
          file.type,
          0.9 // Quality
        );
      };

      img.onerror = reject;
      img.src = e.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

function ImageUploader({ onImageChange, initialImage, maxSizeMB = 2 }) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!initialImage) return;

    if (typeof initialImage === 'string') {
      setPreview(initialImage);
      return;
    }

    if (initialImage instanceof Blob) {
      const objectUrl = URL.createObjectURL(initialImage);
      setPreview(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [initialImage]);


  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    try {

      const compressedFile = await imageCompression(file, {
        maxSizeMB,
        maxWidthOrHeight: 1280, // Set to the larger dimension
        useWebWorker: true,
        initialQuality: 0.9 // Adjust quality if needed
      });

      const resizedFile = await resizeToExactDimensions(compressedFile, 1280, 720);
      const fileSizeMB = resizedFile.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        setError(`Image must be less than ${maxSizeMB}MB.`);
        return;
      }

      const previewUrl = URL.createObjectURL(compressedFile);
      setPreview(previewUrl);
      setError('');

      onImageChange?.(compressedFile);

    } catch (err) {
      console.error(err);
      setError('Failed to process image.');
    }
  };


  return (
    <Form.Group controlId="formImageUpload" className="mb-3">
      <Form.Label className="text-dark">Upload image</Form.Label>
      <div
        onClick={() => fileInputRef.current.click()}
        style={{
          cursor: 'pointer',
          width: '100%',
          maxWidth: '300px',
          height: '200px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: '#f9f9f9'
        }}
      >
        {preview ? (
          <Image src={preview} alt="Preview" fluid />
        ) : (
          <span className="text-muted">Click to upload image</span>
        )}
      </div>
      <Form.Control
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      {error && <div className="text-danger mt-2">{error}</div>}
    </Form.Group>
  );
}

export { ImageUploader };
