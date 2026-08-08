'use client';

import React, { useState } from 'react';
import dayjs from 'dayjs';
import {
  MdPhoneIphone,
  MdDesktopWindows,
  MdInfoOutline,
  MdCalendarToday,
  MdAccessTime,
  MdCampaign,
  MdEvent,
  MdSell,
  MdMenuBook,
  MdWavingHand,
  MdWarning,
  MdSmartDisplay
} from 'react-icons/md';
import { getNotificationType, getNotificationPriority } from '../../../../../constants/notificationTypes';

// Same icon map as notification.jsx's type cards - kept local to each file
// rather than shared, since it's a trivial lookup and both files already
// import the icon components they render directly.
const TYPE_ICONS = {
  campaign: MdCampaign,
  event: MdEvent,
  sell: MdSell,
  menu_book: MdMenuBook,
  waving_hand: MdWavingHand,
  warning: MdWarning,
  smart_display: MdSmartDisplay
};

const formatDatePart = (value) => {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('DD MMM YYYY') : null;
};

const formatTimePart = (value) => {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('hh:mm A') : null;
};

// Combines a start/end pair into a single "X - Y" range for display,
// falling back to whichever single side is actually set - same optionality
// as before (start_date/expiry_date are each independently optional),
// just formatted as one range row instead of two "Starts:"/"Ends:" lines.
const formatRange = (start, end) => {
  if (start && end) return `${start} - ${end}`;
  return start || end || null;
};

/**
 * Live mirror of the mobile notification card - reads straight off the
 * form's `fields` state (see notification.jsx), so it updates on every
 * keystroke/toggle with no save required. Purely presentational: no data
 * fetching, no local persistence.
 */
const NotificationPreview = ({ fields, previewUrl }) => {
  const [device, setDevice] = useState('mobile');

  const type = getNotificationType(fields?.type);
  const priority = getNotificationPriority(fields?.priority);
  const Icon = TYPE_ICONS[type.icon];
  const imageSrc = previewUrl || fields?.secure_url;
  const cardWidth = device === 'mobile' ? 340 : 480;

  const dateRange = formatRange(formatDatePart(fields?.start_date), formatDatePart(fields?.expiry_date));
  const timeRange = formatRange(formatTimePart(fields?.start_date), formatTimePart(fields?.expiry_date));

  const deviceButtonStyle = (active) => ({
    border: 'none',
    backgroundColor: active ? '#f0fdfa' : 'transparent',
    color: active ? '#0d9488' : '#9ca3af',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 30
  });

  const TypeBadge = ({ overlay }) => (
    <span
      className="d-inline-flex align-items-center"
      style={{
        gap: 6,
        borderRadius: 999,
        padding: '6px 14px',
        backgroundColor: overlay ? `${type.color}E6` : `${type.color}1A`,
        color: overlay ? '#fff' : type.color,
        fontSize: 12.5,
        fontWeight: 700,
        backdropFilter: overlay ? 'blur(4px)' : undefined
      }}
    >
      {Icon && <Icon size={15} />}
      {type.label}
    </span>
  );

  return (
    <div
      className="bg-white p-4"
      style={{ border: '1px solid #ececec', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h5 className="fw-bold text-dark mb-0">Preview</h5>
        <div className="d-flex" style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
          <button type="button" onClick={() => setDevice('mobile')} style={deviceButtonStyle(device === 'mobile')}>
            <MdPhoneIphone size={18} />
          </button>
          <button type="button" onClick={() => setDevice('desktop')} style={deviceButtonStyle(device === 'desktop')}>
            <MdDesktopWindows size={18} />
          </button>
        </div>
      </div>

      <div className="d-flex justify-content-center">
        <div
          style={{
            width: cardWidth,
            maxWidth: '100%',
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid #ececec',
            boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
            transition: 'width .15s ease'
          }}
        >
          {imageSrc && (
            <div style={{ position: 'relative', width: '100%', height: 230, backgroundColor: '#eee' }}>
              <img src={imageSrc} alt="Notification" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', top: 14, left: 14 }}>
                <TypeBadge overlay />
              </div>
            </div>
          )}

          <div className="p-3">
            <div className="d-flex align-items-start justify-content-between" style={{ gap: 12 }}>
              <div>
                {!imageSrc && (
                  <div className="mb-3">
                    <TypeBadge />
                  </div>
                )}
                <h5 className="fw-bold text-dark mb-2">{fields?.title || 'Notification title'}</h5>
                <p className="text-muted mb-0" style={{ fontSize: 13.5, lineHeight: 1.5 }}>
                  {fields?.message || 'Your notification message will appear here.'}
                </p>
              </div>

              {imageSrc && (
                <div
                  className="d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 44, height: 44, borderRadius: 999, backgroundColor: `${type.color}1A`, color: type.color }}
                >
                  {Icon && <Icon size={20} />}
                </div>
              )}
            </div>

            <div style={{ width: 48, height: 3, borderRadius: 2, backgroundColor: type.color, margin: '14px 0' }} />

            {(dateRange || timeRange) && (
              <div style={{ backgroundColor: '#f9fafb', border: '1px solid #eef0f2', borderRadius: 12, padding: '4px 14px' }}>
                {dateRange && (
                  <div
                    className="d-flex align-items-center"
                    style={{ gap: 12, padding: '10px 0', borderBottom: timeRange ? '1px solid #eef0f2' : 'none' }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 30, height: 30, borderRadius: 999, backgroundColor: `${type.color}1A`, color: type.color }}
                    >
                      <MdCalendarToday size={14} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>Date</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>{dateRange}</div>
                    </div>
                  </div>
                )}
                {timeRange && (
                  <div className="d-flex align-items-center" style={{ gap: 12, padding: '10px 0' }}>
                    <div
                      className="d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 30, height: 30, borderRadius: 999, backgroundColor: `${type.color}1A`, color: type.color }}
                    >
                      <MdAccessTime size={14} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>Time</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>{timeRange}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Priority accent - low/normal/high/urgent, see constants/notificationTypes.js */}
          <div style={{ height: 4, backgroundColor: priority.color }} />
        </div>
      </div>

      <div
        className="d-flex align-items-start mt-4 p-3"
        style={{ gap: 10, backgroundColor: '#eef2ff', borderRadius: 10, fontSize: 12.5, color: '#4338ca' }}
      >
        <MdInfoOutline size={16} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>This is how your notification will appear to users in the mobile app.</span>
      </div>
    </div>
  );
};

export default NotificationPreview;
