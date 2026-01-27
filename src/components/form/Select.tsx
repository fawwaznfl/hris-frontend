import { useEffect, useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  name?: string; // ⬅️ tambahkan ini
  options: Option[];
  placeholder?: string;
  value?: string | null;
  onChange: (name: string, value: string) => void; // ⬅️ ubah signature
  className?: string;
  defaultValue?: string;
}

const Select: React.FC<SelectProps> = ({
  name = "",
  options,
  placeholder = "Select an option",
  value = "",
  onChange,
  className = "",
  defaultValue = "",
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);

  useEffect(() => {
    setSelectedValue(value ?? "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedValue(val);
    onChange(name, val); // ⬅️ kirim name + value
  };

  return (
    <select
      name={name}
      className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 ${className}`}
      value={selectedValue}
      onChange={handleChange}
    >
      <option value="" className="text-gray-700 dark:text-gray-400">
        {placeholder}
      </option>

      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
