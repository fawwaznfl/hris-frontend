import { useState } from "react";
import { useCamera } from "../../../hooks/useCamera";
import api from "../../../api/axios";
import Swal from "sweetalert2";

export default function FaceEnroll() {
  const { videoRef, capture } = useCamera();
  const [photos, setPhotos] = useState<Blob[]>([]);
  const MAX = 5;

  const takePhoto = async () => {
    if (photos.length >= MAX) return;

    const photo = await capture();
    setPhotos(prev => [...prev, photo]);
  };

  const submit = async () => {
    if (photos.length < 3) {
      Swal.fire("Minimal 3 foto", "Ambil wajah dari beberapa sudut", "warning");
      return;
    }

    const formData = new FormData();
    photos.forEach((p, i) =>
      formData.append("photos[]", p, `face-${i}.jpg`)
    );

    await api.post("/face/enroll", formData);
    Swal.fire("Berhasil", "Wajah berhasil direkam", "success");
  };

  return (
    <div className="space-y-4">
      <video ref={videoRef} autoPlay className="rounded-xl" />

      <div className="flex gap-2">
        <button onClick={takePhoto} className="btn">
          Ambil Foto ({photos.length}/{MAX})
        </button>
        <button
          onClick={submit}
          disabled={photos.length < 3}
          className="btn-primary"
        >
          Simpan Wajah
        </button>
      </div>
    </div>
  );
}
