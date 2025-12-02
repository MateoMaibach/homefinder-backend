import multer from 'multer';

// Configuración de almacenamiento en memoria. 
// Multer almacena el archivo como un Buffer, ideal para enviarlo a servicios externos (Cloudinary/S3).
const storage = multer.memoryStorage(); 

// Configuración del middleware de Multer
export const upload = multer({
    storage: storage,
    limits: {
        // Límite de 5MB por archivo
        fileSize: 5 * 1024 * 1024, 
        // Límite de 10 archivos por solicitud (cumpliendo tu regla de negocio)
        files: 10 
    },
    fileFilter: (req, file, cb) => {
        // Solo permitir archivos de imagen (Puedes refinar esta lista)
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            // Rechazar el archivo si no es una imagen
            cb(new Error('Tipo de archivo no soportado. Solo se permiten imágenes.'), false);
        }
    }
});