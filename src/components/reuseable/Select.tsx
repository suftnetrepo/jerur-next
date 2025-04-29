import { FC } from 'react';

// ==================================================================
type SelectProps = {
  options: { id: number | string; title: string; value: string }[];
  value: string; // currently selected value
  onChange: (value: string) => void; // callback function when selection changes
};
// ==================================================================

const Select: FC<SelectProps> = ({ options, value, onChange }) => {
  return (
    <div className="form-select-wrapper">
      <select
        className="form-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(({ value, id, title }) => (
          <option value={value} key={id}>
            {title}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
