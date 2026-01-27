import { useEffect, useRef } from "react";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream;

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(s => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });

    return () => {
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const capture = async (): Promise<Blob> => {
    const video = videoRef.current!;
    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);

    return new Promise(resolve =>
      canvas.toBlob(blob => resolve(blob!), "image/jpeg", 0.9)
    );
  };

  return { videoRef, capture };
}
