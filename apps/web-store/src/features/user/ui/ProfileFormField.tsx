interface ProfileFormFieldProps {
  id: string;
  label: string;
  type: 'text' | 'tel' | 'url';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export function ProfileFormField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  error,
}: ProfileFormFieldProps) {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          display: 'block',
          width: '100%',
          padding: '8px',
          marginTop: '4px',
        }}
      />
      {error && (
        <p
          role="alert"
          style={{ color: 'red', fontSize: '14px', margin: '4px 0 0' }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
