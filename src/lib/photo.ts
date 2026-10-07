const WIDTH = 1280;
const HEIGHT = 960;

/**
 * Prépare une photo dans le navigateur avant envoi : cadrage 4:3 sur fond blanc
 * (comme les photos existantes), sans jamais agrandir une image plus petite, en JPEG.
 */
export async function preparePhoto(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(WIDTH / bitmap.width, HEIGHT / bitmap.height, 1);
  const canvasWidth = Math.round(Math.max(bitmap.width * scale, (bitmap.height * scale * 4) / 3));
  const canvasHeight = Math.round((canvasWidth * 3) / 4);

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Préparation de l'image impossible");

  const width = bitmap.width * scale;
  const height = bitmap.height * scale;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvasWidth, canvasHeight);
  context.drawImage(bitmap, (canvasWidth - width) / 2, (canvasHeight - height) / 2, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.85),
  );
  if (!blob) throw new Error("Préparation de l'image impossible");

  return new File([blob], "photo.jpg", { type: "image/jpeg" });
}
