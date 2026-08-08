'use client';

import React, { useRef } from 'react';

/**
 * Click-to-upload image box used by the settings forms (Pastor, About Us, ...).
 * Shows the in-progress preview if one exists, otherwise the saved image, otherwise
 * a placeholder. Clicking anywhere on the box opens the file picker.
 *
 * `onRemove` is optional - pass it to also show a small "x" button (only
 * when there's actually an image to remove) that clears the current
 * preview/saved image instead of opening the file picker. Every existing
 * caller that doesn't pass it keeps behaving exactly as before.
 */
const ImageUploadPanel = ({
  previewUrl,
  imageUrl,
  onFileSelect,
  onRemove,
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

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    onRemove?.();
  };

  const imageStyle = { width, height, objectFit: 'cover', cursor: 'pointer' };
  const hasImage = Boolean(previewUrl || imageUrl);

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
        {onRemove && hasImage && (
          <button
            type="button"
            onClick={handleRemoveClick}
            aria-label={`Remove ${alt}`}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 26,
              height: 26,
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'rgba(0,0,0,0.55)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              lineHeight: 1,
              cursor: 'pointer'
            }}
          >
            &times;
          </button>
        )}
      </div>
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} hidden />
    </div>
  );
};

export default ImageUploadPanel;
