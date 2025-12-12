import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

const FOLDER = "homefinder/propiedades";

export const uploadFileToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const b64 = Buffer.from(fileBuffer).toString("base64");
    const dataURI = "data:image/jpeg;base64," + b64;

    const options = {
      folder: FOLDER,
    };

    cloudinary.uploader.upload(dataURI, options, (error, result) => {
      if (error) {
        console.error("Error al subir a Cloudinary:", error);
        return reject(new Error("Fallo al subir archivo a Cloudinary."));
      }

      resolve(result);
    });
  });
};

export const deleteFileFromCloudinary = (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error("Error al eliminar de Cloudinary:", error);

        if (result && result.result === "not found") {
          return resolve({
            message: "Recurso no encontrado en Cloudinary (OK para borrar DB).",
          });
        }
        return reject(new Error("Fallo al eliminar archivo en Cloudinary."));
      }
      resolve(result);
    });
  });
};
