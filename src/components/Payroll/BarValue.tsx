import { useEffect, useState } from "react";

interface BarValueProps {
  title?: string;
  value: number;
  suffix?: string;
  onChange?: (val: number) => void;
}

export default function BarValue({
  title,
  value,
  suffix,
  onChange,
}: BarValueProps) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    setDisplay(value ? value.toLocaleString("id-ID") : "");
  }, [value]);

  return (
    <div className="flex flex-col space-y-2">
      <span className="text-sm font-medium text-gray-700">{title}</span>

      <div className="flex overflow-hidden rounded-xl border bg-gray-100">
        <input
          type="text"
          inputMode="numeric"
          value={display}
          placeholder="0"
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            const num = Number(raw) || 0;

            setDisplay(raw ? num.toLocaleString("id-ID") : "");
            onChange?.(num);
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
