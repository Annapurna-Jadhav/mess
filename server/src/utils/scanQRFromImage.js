import jsQR from "jsqr";
import { createCanvas, loadImage } from "canvas";

export const scanQRFromImage = async (buffer) => {
  const img = await loadImage(buffer);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const qr = jsQR(imageData.data, canvas.width, canvas.height);
  if (!qr) throw new Error("QR not found in receipt image");

  return qr.data; // this is your signed QR token
};
