import multer from "multer";

const storage = multer.memoryStorage();

export const uploadConfig = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(
        new Error("Tipo de archivo no soportado. Solo se permiten imágenes."),
        false
      );
    }
  },
});

export const uploadImagesMiddleware = uploadConfig.array("imagenes", 10);
