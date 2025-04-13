'use client';

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
  autoComplete = "on",
  readOnly = false
}) => {
  return (
    <div className="w-full">
      <label htmlFor={name} className=" form-label block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {type === "select" ? (
        <select
          name={name}
          id={name}
          className=" form-input w-full px-3 py-2 border rounded-md"
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
          className={`w-full px-3 py-2 border rounded-md ${readOnly ? "bg-gray-100" : ""}`}
          placeholder={placeholder}
          value={value || ""}
          onChange={onChange || (() => {})} // Add empty function if onChange not provided
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          readOnly={readOnly}
        />
      )}
    </div>
  );
};

export default FormField;