import { useEffect, useState, ChangeEvent } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { ScanFace } from "lucide-react";
import { useRef } from "react";
import axios from "axios";


export default function FaceRecognition() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [pegawaiName, setPegawaiName] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [cameraFinished, setCameraFinished] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraOn, setCameraOn] = useState(false);


  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const capturePhoto = () => {
    if (photos.length >= 3) {
      Swal.fire("Info", "Sudah mengambil 3 foto", "info");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], `face_${photos.length + 1}.jpg`, {
        type: "image/jpeg",
      });

      setPhotos((prev) => {
        const next = [...prev, file];

        if (next.length >= 3) {
          stopCamera();
          setCameraFinished(true); // 🔥 tandai selesai
        }

        return next;
      });
    }, "image/jpeg");

  };


  const stopCamera = () => {
  if (videoRef.current?.srcObject) {
    const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
    tracks.forEach((track) => track.stop());
    videoRef.current.srcObject = null;
    setCameraOn(false);
  }
};



  // convert image → base64
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setImageBase64(base64.split(",")[1]); // buang prefix data:image/*
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    if (cameraFinished) return; 

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraOn(true);
      }
    } catch (err) {
      Swal.fire(
        "Izin Kamera Ditolak",
        "Silakan izinkan akses kamera untuk melanjutkan",
        "warning"
      );
    }
  };


  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);


  useEffect(() => {
  const fetchPegawai = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/pegawais/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("pegawai response:", res.data);
      setPegawaiName(res.data.name ?? "");
    } catch (err) {
      Swal.fire("Error", "Data pegawai tidak ditemukan", "error");
      navigate("/pegawai");
    }
  };

  if (id) {
    fetchPegawai();
  }
}, [id, navigate]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (photos.length !== 3) {
      Swal.fire("Gagal", "Harus ambil 3 foto wajah", "warning");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("pegawai_id", String(id));

      photos.forEach((photo) => {
        formData.append("files[]", photo);
      });


      await axios.post(
        "http://localhost:8000/api/v1/face/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );


      Swal.fire("Berhasil", "Wajah berhasil diregistrasi", "success");
      navigate("/pegawai");
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", "Registrasi wajah gagal", "error");
    }

    setLoading(false);
  };

  // USER INTERFACE

  return (
    <>
      <PageMeta title="Face Recognition" description="Registrasi Wajah Pegawai" />

      <PageHeader
        pageTitle="Face Recognition"
        titleClass="text-[32px] dark:text-white"
        rightContent={
          <button
            onClick={() => {
              stopCamera();
              navigate("/pegawai");
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-5 py-2 rounded-xl"
          >
            Kembali
          </button>
        }
      />

      <div className="space-y-5 mt-4">
        <ComponentCard
          title={`Registrasi Wajah - ${pegawaiName || "Pegawai"}`}
          className="dark:bg-gray-800 dark:border-gray-700"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload Foto */}
            <div>
              {/* Nama Pegawai */}
              <div>
                <label className="text-gray-700 dark:text-gray-200">
                  Nama Pegawai
                </label>
                <input
                  type="text"
                  value={pegawaiName}
                  disabled
                  className="w-full border px-3 py-2 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                />
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Ambil 3 foto wajah dari sudut berbeda (depan, kiri, kanan)
            </p>

            {/* Kamera */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-indigo-500 bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>

              {!cameraOn && !cameraFinished && (
                <button
                  type="button"
                  onClick={startCamera}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl"
                >
                  Aktifkan Kamera
                </button>
              )}

              <button
                type="button"
                onClick={capturePhoto}
                disabled={!cameraOn || photos.length >= 3}
                className={`px-4 py-2 rounded-xl text-white ${
                  cameraOn && photos.length < 3
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Ambil Foto ({photos.length}/3)
              </button>
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {photos.length > 0 && (
              <div className="flex gap-4 justify-center">
                {photos.map((photo, idx) => (
                  <img
                    key={idx}
                    src={URL.createObjectURL(photo)}
                    className="w-24 h-24 rounded-full border-2 border-indigo-500 object-cover"
                  />
                ))}
              </div>
            )}

            {cameraFinished && (
                <p className="text-green-600 text-sm font-medium text-center">
                  Foto wajah lengkap. Silakan simpan.
                </p>
              )}


            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-white px-6 py-2 rounded-xl"
              >
                <ScanFace size={18} />
                {loading ? "Memproses..." : "Registrasi Wajah"}
              </button>
            </div>

          </form>
        </ComponentCard>
      </div>
    </>
  );
}
