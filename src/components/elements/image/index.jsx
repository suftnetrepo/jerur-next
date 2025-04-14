import { useState, useRef, useEffect } from 'react';
import { Form, Image } from 'react-bootstrap';

function ImageUploader({ onImageChange, initialImage, maxSizeMB = 2 }) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(()=> {
    setPreview(initialImage)
  }, [initialImage])

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }

      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        setError(`Image must be less than ${maxSizeMB}MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setError('');
        if (onImageChange) {
          onImageChange(file);
        }
      };
      reader.readAsDataURL(file);
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
