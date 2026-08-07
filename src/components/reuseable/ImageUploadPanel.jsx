'use client';

import React, { useRef } from 'react';

/**
 * Click-to-upload image box used by the settings forms (Pastor, About Us, ...).
 * Shows the in-progress preview if one exists, otherwise the saved image, otherwise
 * a placeholder. Clicking anywhere on the box opens the file picker.
 */
const ImageUploadPanel = ({
  previewUrl,
  imageUrl,
  onFileSelect,
  alt = 'Image',
  width = 460,
  height = 579,
  borderRadius = '8%',
  placeholderSrc = '/img/blank_insert.png'
}) => {
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile && selectedFile.type.startsWith('image/')) {
      onFileSelect?.(selectedFile);
    }
    // Reset the input so selecting the same file again still fires onChange.
    e.target.value = null;
  };

  const imageStyle = { width, height, objectFit: 'cover', cursor: 'pointer' };

  return (
    <div className="d-flex flex-column justify-content-start align-items-start">
      <div
        style={{
          width,
          height,
          borderRadius,
          overflow: 'hidden',
          backgroundColor: '#ccc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
        className="mb-3"
      >
        {previewUrl ? (
          <img src={previewUrl} alt={`${alt} Preview`} className="img-fluid" style={imageStyle} onClick={handleImageClick} />
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={alt}
            className="img-fluid"
            style={imageStyle}
            onClick={handleImageClick}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = placeholderSrc;
            }}
          />
        ) : (
          <img src={placeholderSrc} alt={alt} className="img-fluid" style={imageStyle} onClick={handleImageClick} />
        )}
      </div>
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} hidden />
    </div>
  );
};

export default ImageUploadPanel;
