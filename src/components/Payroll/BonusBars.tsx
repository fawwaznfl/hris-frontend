import { useEffect, useState } from "react";

interface BonusBarsProps {
  pribadi: number;
  team: number;
  jackpot: number;

  labelPribadi: string;
  labelTeam: string;
  labelJackpot: string;

  onPribadiChange?: (val: number) => void;
  onTeamChange?: (val: number) => void;
  onJackpotChange?: (val: number) => void;
}

export default function BonusBars({
  pribadi,
  team,
  jackpot,
  labelPribadi,
  labelTeam,
  labelJackpot,
  onPribadiChange,
  onTeamChange,
  onJackpotChange,
}: BonusBarsProps) {
  const [p, setP] = useState("");
  const [t, setT] = useState("");
  const [j, setJ] = useState("");

  useEffect(() => {
    setP(pribadi > 0 ? pribadi.toLocaleString("id-ID") : "");
  }, [pribadi]);

  useEffect(() => {
    setT(team > 0 ? team.toLocaleString("id-ID") : "");
  }, [team]);

  useEffect(() => {
    setJ(jackpot > 0 ? jackpot.toLocaleString("id-ID") : "");
  }, [jackpot]);

  const renderBar = (
    value: number,
    display: string,
    setDisplay: (v: string) => void,
    onChange?: (val: number) => void,
    label?: string
  ) => (
    <div className="flex overflow-hidden rounded-xl border bg-gray-100">
      {onChange ? (
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
      ) : (
        <div className="flex-1 bg-orange-400 px-4 py-2 text-black">
          {value.toLocaleString("id-ID")}
        </div>
      )}

      <div className="bg-gray-200 px-4 py-2 text-gray-700 whitespace-nowrap">
        {label}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col space-y-4">
      {renderBar(pribadi, p, setP, onPribadiChange, labelPribadi)}
      {renderBar(team, t, setT, onTeamChange, labelTeam)}
      {renderBar(jackpot, j, setJ, onJackpotChange, labelJackpot)}
    </div>
  );
}
