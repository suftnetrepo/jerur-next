import React from 'react';
import { Dropdown } from 'react-bootstrap';

const CurrencyDropdown = ({ selectedCurrency, onSelectCurrency }) => {
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'INR'];

  return (
    <Dropdown onSelect={onSelectCurrency} style={{ width: '100%' }}>
      <Dropdown.Toggle
        variant="secondary"
        id="dropdown-basic"
        className='d-flex flex-row'
    
      >
        {selectedCurrency || 'Select Currency'}
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ width: '100%' }}>
        {currencies.map((currency) => (
          <Dropdown.Item key={currency} eventKey={currency}>
            {currency}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default CurrencyDropdown;
