import cloudinary from "../config/cloudinary.js";

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
