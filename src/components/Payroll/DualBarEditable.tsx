import { useEffect, useState } from "react";

interface DualBarEditableProps {
  title: string;

  count: number;
  countSuffix: string;
  onCountChange: (value: number) => void;

  amount: number;
  amountLabel: string;
  onAmountChange: (value: number) => void;
}

export default function DualBarEditable({
  title,
  count,
  countSuffix,
  onCountChange,
  amount,
  amountLabel,
  onAmountChange,
}: DualBarEditableProps) {
  const [countDisplay, setCountDisplay] = useState("");
  const [amountDisplay, setAmountDisplay] = useState("");

  // sync dari luar
  useEffect(() => {
    setCountDisplay(count > 0 ? String(count) : "");
  }, [count]);

  useEffect(() => {
    setAmountDisplay(amount > 0 ? amount.toLocaleString("id-ID") : "");
  }, [amount]);

  return (
    <div className="flex flex-col space-y-3">
      <span className="text-sm font-medium text-gray-700">{title}</span>

      {/* BAR COUNT */}
      <div className="flex overflow-hidden rounded-xl border bg-gray-100">
        <input
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={countDisplay}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            setCountDisplay(raw);
            onCountChange(raw === "" ? 0 : Number(raw));
          }}
          className="flex-1 bg-orange-400 px-4 py-2 text-black outline-none"
        />
        <div className="bg-gray-200 px-4 py-2 text-gray-700 whitespace-nowrap">
          {countSuffix}
        </div>
      </div>

      {/* BAR AMOUNT (MANUAL) */}
      <div className="flex overflow-hidden rounded-xl border bg-gray-100">
        <input
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={amountDisplay}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            const num = Number(raw) || 0;
            setAmountDisplay(raw ? num.toLocaleString("id-ID") : "");
            onAmountChange(num);
          }}
          className="flex-1 bg-white px-4 py-2 text-black outline-none"
        />
        <div className="bg-gray-200 px-4 py-2 text-gray-700 whitespace-nowrap">
          {amountLabel}
        </div>
      </div>
    </div>
  );
}
