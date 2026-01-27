import { useEffect, useState } from "react";

interface EditableBarValueProps {
  title: string;
  value: number;
  onChange: (val: number) => void;
}

export default function EditableBarValue({
  title,
  value,
  onChange,
}: EditableBarValueProps) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    setDisplay(value ? value.toLocaleString("id-ID") : "");
  }, [value]);

  return (
    <div className="flex flex-col space-y-2">
      <span className="text-sm font-medium text-gray-700">{title}</span>

      <div className="flex overflow-hidden rounded-xl border bg-gray-100">
        {/* INPUT ORANGE */}
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
          className="flex-1 bg-white px-4 py-2 text-black outline-none"
        />
      </div>
    </div>
  );
}
