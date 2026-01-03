import jsQR from "jsqr";
import { createCanvas, loadImage } from "canvas";
import vision from "@google-cloud/vision";

const visionClient = new vision.ImageAnnotatorClient();

export async function extractQrFromImage(buffer) {
  
  try {
    const img = await loadImage(buffer);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);

    const qr = jsQR(imageData.data, img.width, img.height);

    if (qr?.data) {
      return qr.data.trim();
    }
  } catch (_) {
   
  }

 
  const [result] = await visionClient.annotateImage({
    image: { content: buffer.toString("base64") },
    features: [{ type: "BARCODE_DETECTION" }],
  });

  const barcodes = result.barcodeAnnotations;

  if (!barcodes || barcodes.length === 0) {
    throw new Error("No QR detected in image");
  }

  return barcodes[0].rawValue.trim();
}
