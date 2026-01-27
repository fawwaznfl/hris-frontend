import { useEffect, useState } from "react";

interface BarValueEditProps {
  title?: string;
  value: number;
  suffix?: string;
  onChange: (val: number) => void;
}

export default function BarValueEdit({
  title,
  value,
  suffix,
  onChange,
}: BarValueEditProps) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    setDisplay(value > 0 ? value.toLocaleString("id-ID") : "");
  }, [value]);

  return (
    <div className="flex flex-col space-y-2">
      {title && (
        <span className="text-sm font-medium text-gray-700">{title}</span>
      )}

      <div className="flex overflow-hidden rounded-xl border bg-gray-100">
        <input
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={display}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            const num = Number(raw) || 0;

            setDisplay(raw ? num.toLocaleString("id-ID") : "");
            onChange(num);
          }}
          className="flex-1 bg-orange-400 px-4 py-2 text-black outline-none"
        />

        {suffix && (
          <div className="bg-gray-200 px-4 py-2 text-gray-700 whitespace-nowrap">
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}
