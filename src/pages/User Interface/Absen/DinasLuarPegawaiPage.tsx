import { useEffect, useState, useRef } from "react";
import ComponentCard from "../../../components/common/ComponentCard";
import { Clock } from "lucide-react";
import api from "../../../api/axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function DinasLuarPegawaiPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [absenStatus, setAbsenStatus] = useState<"masuk" | "pulang" | "selesai">("masuk");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const pegawai_id = user.id;

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [currentTime, setCurrentTime] = useState("");
  const [shiftToday, setShiftToday] = useState<any>(null);

  const today = new Date().toISOString().slice(0, 10);

  const [location, setLocation] = useState({
    lat: null as number | null,
    lon: null as number | null,
  });

  const [photoData, setPhotoData] = useState<string | null>(null);

  // CLOCK REALTIME
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("id-ID", { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // FETCH SHIFT HARI INI
  const fetchShiftToday = async () => {
    try {
      const res = await api.get(`/dinas-luar-mapping/today/${pegawai_id}`);
      setShiftToday(res.data.data || null);
    } catch {
      setShiftToday(null);
    }
  };

  const fetchStatusHariIni = async () => {
    const res = await api.get(`/dinas-luar/status-pegawai/${pegawai_id}`);

    if (res.data.data.status_absen === "sudah_masuk") {
      setAbsenStatus("pulang");
    } else if (res.data.data.status_absen === "sudah_pulang") {
      setAbsenStatus("selesai");
    }
  };


  useEffect(() => {
    fetchShiftToday();
    fetchStatusHariIni();
    handleGetLocation();
  }, []);

  useEffect(() => {
    if (absenStatus === "selesai") {
      stopCamera();
    }
  }, [absenStatus]);

  // GET LOCATION
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      return Swal.fire("Error", "Browser tidak mendukung GPS", "error");
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      () => {
        Swal.fire("GPS Error", "Aktifkan GPS untuk aplikasi ini.", "error");
      }
    );
  };

  // CAMERA
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch {
      Swal.fire("Error", "Tidak bisa mengakses kamera", "error");
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    const data = canvas.toDataURL("image/jpeg");
    setPhotoData(data);
  };

  // SAVE ABSENSI (MASUK / PULANG)
  const saveAbsen = async () => {
    if (!photoData) return Swal.fire("Error", "Foto belum diambil.", "error");

    const blob = base64ToBlob(photoData);
    const formData = new FormData();

    formData.append("pegawai_id", pegawai_id);
    formData.append("shift_id", shiftToday.shift.id);
    formData.append("tanggal", today);
    formData.append("lokasi", `${location.lat},${location.lon}`);
    formData.append("foto", blob, "absen.jpg");

    const res = await api.post("/dinas-luar/auto", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    Swal.fire("Berhasil", res.data.message, "success");

    // === Update status berdasarkan response backend ===
    if (res.data.message.includes("Absen masuk")) {
      setAbsenStatus("pulang");
    } else if (res.data.message.includes("Absen pulang")) {
      setAbsenStatus("selesai");
    }

    navigate("/home-pegawai");
  };

  function base64ToBlob(base64: string) {
    const byteCharacters = atob(base64.split(",")[1]);
    const byteArrays = [];

    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i));
    }

    return new Blob([new Uint8Array(byteArrays)], { type: "image/jpeg" });
  }

  // USER INTERFACE
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-4 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-xl"
      >
        <span className="text-xl">←</span> Kembali
      </button>

      <h1 className="text-2xl font-bold text-center">
        {absenStatus === "masuk"
          ? "Absen Masuk Pegawai"
          : absenStatus === "pulang"
          ? "Absen Pulang Pegawai"
          : "Absensi Selesai"}
      </h1>

      {/* SHIFT DETAIL */}
      <ComponentCard title="Shift Hari Ini">
        {shiftToday ? (
          <>
            <p><strong>Tanggal:</strong> {today}</p>
            <p><strong>Shift:</strong> {shiftToday.shift.nama}</p>
            <p><strong>Jam Masuk:</strong> {shiftToday.shift.jam_masuk}</p>
            <p><strong>Jam Pulang:</strong> {shiftToday.shift.jam_pulang}</p>
          </>
        ) : (
          <p className="text-red-500">Tidak ada shift hari ini.</p>
        )}
      </ComponentCard>

      {/* CLOCK */}
      <ComponentCard title="Jam Sekarang">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6" />
          <p className="text-lg font-semibold">{currentTime}</p>
        </div>
      </ComponentCard>

      {/* LOCATION */}
      {absenStatus !== "selesai" && (
      <ComponentCard title="Lokasi Pegawai">
        {location.lat ? (
          <p>Lat: {location.lat} — Lon: {location.lon}</p>
        ) : (
          <p className="text-gray-500">Lokasi belum terdeteksi</p>
        )}
        <button
          onClick={handleGetLocation}
          className="bg-blue-600 w-full py-2 mt-3 text-white rounded-xl"
        >
          Deteksi Lokasi
        </button>
      </ComponentCard>
    )}

      {/* CAMERA */}
      {absenStatus !== "selesai" && (
        <ComponentCard title="Kamera Absen">
          <video ref={videoRef} autoPlay className="w-full rounded-xl bg-black"></video>
          <canvas ref={canvasRef} className="hidden"></canvas>

          {!stream ? (
            <button
              onClick={startCamera}
              className="bg-green-600 text-white w-full mt-3 py-2 rounded-xl"
            >
              Aktifkan Kamera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="bg-red-600 text-white w-full mt-3 py-2 rounded-xl"
            >
              Matikan Kamera
            </button>
          )}

          <button
            onClick={takePhoto}
            className="bg-yellow-600 text-white w-full mt-3 py-2 rounded-xl"
          >
            Ambil Foto
          </button>

          <button
            onClick={saveAbsen}
            className="bg-blue-700 text-white w-full mt-3 py-2 rounded-xl"
          >
            Simpan Absen
          </button>

          {photoData && (
            <img src={photoData} className="w-full rounded-xl mt-3" />
          )}
        </ComponentCard>
      )}
    </div>
  );
}
