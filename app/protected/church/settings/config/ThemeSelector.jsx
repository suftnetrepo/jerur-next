'use client';

import { useEffect, useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { MOBILE_THEMES, resolveMobileThemeId } from '../../../../../constants/mobileThemes';
import { CHURCH } from '../../../../../utils/apiUrl';
import { zat } from '../../../../../utils/api';
import { VERBS } from '../../../../../config';
import styles from './theme-selector.module.scss';

export default function ThemeSelector({ value }) {
  const [selectedThemeId, setSelectedThemeId] = useState(resolveMobileThemeId(value));
  const [savedThemeId, setSavedThemeId] = useState(resolveMobileThemeId(value));
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    const resolved = resolveMobileThemeId(value);
    setSelectedThemeId(resolved);
    setSavedThemeId(resolved);
  }, [value]);

  const selectedTheme = MOBILE_THEMES.find((theme) => theme.id === selectedThemeId) || MOBILE_THEMES[0];
  const hasChanges = selectedThemeId !== savedThemeId;

  const handleSave = async () => {
    if (!hasChanges || saving) return;
    setSaving(true);
    setFeedback({ type: '', message: '' });

    const result = await zat(
      CHURCH.uploadOne,
      { theme_id: selectedThemeId },
      VERBS.PUT,
      { action: 'theme' }
    );

    if (result.success) {
      setSavedThemeId(selectedThemeId);
      setFeedback({ type: 'success', message: 'Mobile theme saved successfully.' });
    } else {
      setFeedback({ type: 'error', message: result.errorMessage || 'Unable to save the mobile theme.' });
    }
    setSaving(false);
  };

  return (
    <section className={styles.section} aria-labelledby="mobile-theme-heading">
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Mobile appearance</span>
          <h5 id="mobile-theme-heading">Church default theme</h5>
          <p>Choose the default experience for members. Members can still select a personal theme in the app.</p>
        </div>
        <div className={styles.phonePreview} aria-label={`${selectedTheme.label} theme preview`}>
          <span style={{ background: selectedTheme.preview[0] }} />
          <i style={{ background: selectedTheme.preview[1] }} />
          <b style={{ background: selectedTheme.preview[2] }} />
        </div>
      </div>

      <div className={styles.grid} role="radiogroup" aria-label="Available mobile themes">
        {MOBILE_THEMES.map((theme) => {
          const selected = theme.id === selectedThemeId;
          return (
            <button
              key={theme.id}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`${styles.themeCard} ${selected ? styles.selected : ''}`}
              onClick={() => {
                setSelectedThemeId(theme.id);
                setFeedback({ type: '', message: '' });
              }}
            >
              <span className={styles.cardTop}>
                <span className={styles.themeIcon}><i className={`bi ${theme.icon}`} /></span>
                <span className={styles.swatches} aria-hidden="true">
                  {theme.preview.map((color) => <i key={color} style={{ background: color }} />)}
                </span>
                <span className={styles.check} aria-hidden="true"><i className="bi bi-check-lg" /></span>
              </span>
              <strong>{theme.label}</strong>
            </button>
          );
        })}
      </div>

      {feedback.message && (
        <div className={feedback.type === 'success' ? styles.success : styles.error} role="status">
          <i className={`bi ${feedback.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'}`} />
          {feedback.message}
        </div>
      )}

      <div className={styles.footer}>
        <span>Selected: <strong>{selectedTheme.label}</strong></span>
        <Button type="button" onClick={handleSave} disabled={!hasChanges || saving} className={styles.saveButton}>
          {saving ? <><Spinner size="sm" /> Saving…</> : 'Save theme'}
        </Button>
      </div>
    </section>
  );
}
