import React, { useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { OkDialogue } from '@/src/components/elements/ConfirmDialogue';
import ErrorDialogue from '@/src/components/elements/errorDialogue';
import { useFeatures } from '@/hooks/useSettings';
import { featuresOptions } from '@/utils/helpers';
import MultiSelectDropdown from '@/components/reuseable/MultiSelectDropdown';

const Features = ({ data }) => {
  const { error, success, fields, handleSave, handleChange, handleSelect, handleReset } = useFeatures();

  useEffect(() => {
    data?.features && handleSelect(data?.features);
  }, [data]);

  const handleSubmit = async () => {
    fields?.features?.length > 0 && handleSave(fields).then(() => {});
  };

  return (
    <div style={{ marginLeft: 25, width: '40%', backgroundColor: 'white' }}>
      <Form>
        <div className="row">
          <div className="col-md-12">
            <MultiSelectDropdown
              options={featuresOptions}
              label="Features"
              selectedValues={fields?.features || []}
              onChange={(value) => handleChange('features', value)}
              placeholder="Select Features..."
            />
          </div>
        </div>

        <div className="d-flex justify-content-start">
          <Button type="button" variant="primary" onClick={() => handleSubmit()}>
            Save Changes
          </Button>
        </div>
      </Form>
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
