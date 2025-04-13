"use client";

const FormField = ({ 
  label, 
  name, 
  type = "text", 
  value, 
  onChange, 
  required = false, 
  options, 
  placeholder = "",
  disabled = false,
  autoComplete = "on"
}) => {
  return (
    <div className="w-full">
      <label htmlFor={name} className="form-label">
        {label}
      </label>
      {type === "select" ? (
        <select
          name={name}
          id={name}
          className="form-select"
          onChange={onChange}
          value={value || ""}
          required={required}
          disabled={disabled}
        >
          {options}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          id={name}
          className="form-input"
          placeholder={placeholder}
          value={value || ""}
          onChange={onChange}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
        />
      )}
    </div>
  );
};

export default FormField;