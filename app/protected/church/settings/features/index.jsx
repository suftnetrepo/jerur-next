'use client';

import React, { useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { Switch } from '@mui/material';
import {
  MdPayments,
  MdCampaign,
  MdFrontHand,
  MdRecordVoiceOver,
  MdGroups,
  MdPersonAdd,
  MdLibraryMusic,
  MdHowToReg,
  MdEvent,
  MdSchedule,
  MdCall,
  MdRestaurant,
  MdDirectionsBus,
  MdSchool,
  MdWorkspacePremium,
  MdEditNote,
  MdMenuBook,
  MdOndemandVideo,
  MdSelfImprovement
} from 'react-icons/md';
import { OkDialogue } from '../../../../../src/components/elements/ConfirmDialogue';
import ErrorDialogue from '../../../../../src/components/elements/errorDialogue';
import { useFeatures } from '../../../../../hooks/useSettings';
import { groupFeaturesByCategory } from '../../../../../constants/mobileFeatures';

// Maps the string icon identifiers stored in constants/mobileFeatures.js to
// their react-icons/md component.
const FEATURE_ICONS = {
  payments: MdPayments,
  campaign: MdCampaign,
  front_hand: MdFrontHand,
  record_voice_over: MdRecordVoiceOver,
  groups: MdGroups,
  person_add: MdPersonAdd,
  library_music: MdLibraryMusic,
  how_to_reg: MdHowToReg,
  event: MdEvent,
  schedule: MdSchedule,
  call: MdCall,
  restaurant: MdRestaurant,
  directions_bus: MdDirectionsBus,
  school: MdSchool,
  workspace_premium: MdWorkspacePremium,
  edit_note: MdEditNote,
  menu_book: MdMenuBook,
  ondemand_video: MdOndemandVideo,
  self_improvement: MdSelfImprovement
};

const FeatureCard = ({ feature, checked, onToggle }) => {
  const Icon = FEATURE_ICONS[feature.icon];

  return (
    <div className="col-md-6 mb-3">
      <div
        className="d-flex align-items-start justify-content-between p-3 h-100 bg-white"
        style={{
          border: '1px solid #ececec',
          borderRadius: 14,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          transition: 'box-shadow .15s ease'
        }}
      >
        <div className="d-flex align-items-start">
          <div
            className="d-flex align-items-center justify-content-center flex-shrink-0 me-3"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: `${feature.color}1A`,
              color: feature.color
            }}
          >
            {Icon && <Icon size={22} />}
          </div>
          <div>
            <div className="text-dark fw-semibold">{feature.label}</div>
            <div className="text-muted" style={{ fontSize: 13, maxWidth: 320 }}>
              {feature.description}
            </div>
          </div>
        </div>
        <Switch
          checked={checked}
          onChange={(e) => onToggle(feature.id, e.target.checked)}
          color="primary"
          inputProps={{ 'aria-label': `Toggle ${feature.label}` }}
        />
      </div>
    </div>
  );
};

const Features = ({ data }) => {
  const { error, success, fields, loading, handleSave, handleChange, handleSelect, handleReset } = useFeatures();
  const enabledFeatures = fields?.features || [];
  const categories = groupFeaturesByCategory();

  useEffect(() => {
    handleSelect(data?.features || []);
  }, [data]);

  const handleToggle = (featureId, isEnabled) => {
    const nextFeatures = isEnabled
      ? [...new Set([...enabledFeatures, featureId])]
      : enabledFeatures.filter((id) => id !== featureId);

    handleChange('features', nextFeatures);
  };

  const handleSubmit = async () => {
    handleSave(fields).then(() => {});
  };

  return (
    <div className="me-5" style={{ maxWidth: 900 }}>
      {categories.map(({ category, features }) => (
        <div key={category} className="mb-4">
          <h6 className="text-dark fw-bold mb-3">{category}</h6>
          <div className="row">
            {features.map((feature) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                checked={enabledFeatures.includes(feature.id)}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="d-flex justify-content-start">
        <Button type="button" variant="primary" disabled={loading} onClick={() => handleSubmit()}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {success && (
        <OkDialogue
          show={success}
          message="Your changes was save successfully"
          onConfirm={() => {
            handleReset();
          }}
        />
      )}
      {error && <ErrorDialogue showError={error} onClose={() => {}} />}
    </div>
  );
};

export default Features;
