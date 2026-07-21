import React, { useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';

const ClientKeyPage = ({client_secret}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ marginLeft: 25, width: '80%', backgroundColor: 'white' }}>
      <Form>
        <div className="row">
          <div className="col-md-12">
            <Form.Group>
              <Form.Label className="text-dark">Client Secret</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  value={client_secret || ''}
                />
                <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? 'Hide' : 'Show'}
                </Button>
              </InputGroup>{' '}
            </Form.Group>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default ClientKeyPage;
