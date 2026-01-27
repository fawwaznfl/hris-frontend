import { useEffect, useState } from "react";

export interface DualBarEditableCountProps {
  title: string;
  count: number;
  onCountChange: (val: number) => void;
  countSuffix: string;
  amount: number;
  onAmountChange: (val: number) => void;
  amountLabel: string;
}

export default function DualBarEditableCount({
  title,
  count,
  onCountChange,
  countSuffix,
  amount,
  onAmountChange,
  amountLabel,
}: DualBarEditableCountProps) {
  const [countDisplay, setCountDisplay] = useState("");
  const [amountDisplay, setAmountDisplay] = useState("");

  // sync COUNT
  useEffect(() => {
    setCountDisplay(count > 0 ? String(count) : "");
  }, [count]);

  // sync AMOUNT (rupiah, tanpa .00)
  useEffect(() => {
    setAmountDisplay(
      amount > 0 ? Math.floor(amount).toLocaleString("id-ID") : ""
    );
  }, [amount]);

  return (
    <div className="flex flex-col space-y-3">
      <span className="text-sm font-medium text-gray-700">{title}</span>

      {/* BAR ATAS - COUNT */}
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

      {/* BAR BAWAH - AMOUNT (RUPIAH) */}
      <div className="flex overflow-hidden rounded-xl border bg-gray-100">
        <input
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={amountDisplay}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            const num = raw === "" ? 0 : Number(raw);

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
