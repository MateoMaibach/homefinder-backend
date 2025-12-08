import Propiedad from "../models/Propiedad.js";
import Imagen from "../models/imagen.js";
import { sequelize } from "../config/db.js";
import { Op } from "sequelize";
import { uploadFileToCloudinary } from "../services/cloudinary.service.js";

export const crearPropiedad = async (req, res) => {
  const usuario_id = req.user.id;

  const {
    titulo,
    descripcion,
    precio,
    tipo_operacion,
    tipo_propiedad,
    ambientes,
    dormitorios,
    baños,
    cocheras,
    superficie_cubierta,
    superficie_total,
    antiguedad,
    calle,
    altura,
    ciudad,
    provincia,
    barrio,
    latitud,
    longitud,
  } = req.body;

  if (superficie_cubierta > superficie_total) {
    return res.status(400).json({
      message:
        "Error de validación: La superficie cubierta no puede ser mayor que la superficie total.",
    });
  }

  if (superficie_cubierta && !superficie_total) {
    return res.status(400).json({
      message:
        "Error de validación: Debe especificar la superficie total si especifica la cubierta.",
    });
  }

  try {
    const nuevaPropiedad = await Propiedad.create({
      usuario_id,
      titulo,
      descripcion,
      precio,
      tipo_operacion,
      tipo_propiedad,
      ambientes,
      dormitorios,
      baños,
      cocheras,
      superficie_cubierta,
      superficie_total,
      antiguedad,
      calle,
      altura,
      ciudad,
      provincia,
      barrio,
      latitud,
      longitud,
      activo: false,
    });

    res.status(201).json({
      message:
        "Propiedad creada exitosamente. Continúe con la carga de imágenes.",
      id: nuevaPropiedad.id,
      usuario_id: usuario_id,
    });
  } catch (error) {
    console.error("Error Sequelize (crearPropiedad):", error);
    res.status(500).json({
      message: "Error interno del servidor al crear propiedad.",
      error: error.message,
    });
  }
};

export const subirImagenes = async (req, res) => {
  const { propiedadId } = req.params;
  const files = req.files;

  const MIN_IMAGES = 5;
  const MAX_IMAGES = 10;

  const propiedad = await Propiedad.findByPk(propiedadId);
  if (!propiedad) {
    return res.status(404).json({ message: "Propiedad no encontrada." });
  }

  if (!files || files.length < MIN_IMAGES || files.length > MAX_IMAGES) {
    return res.status(400).json({
      message: `Se requieren mínimamente ${MIN_IMAGES} y máximo ${MAX_IMAGES} imágenes para la propiedad.`,
    });
  }

  const t = await sequelize.transaction();

  try {
    const resultadosSubida = [];

    for (const file of files) {
      const resultCloudinary = await uploadFileToCloudinary(file.buffer);

      const urlImagen = resultCloudinary.secure_url;

      const nuevaImagen = await Imagen.create(
        {
          propiedad_id: propiedadId,
          url: urlImagen,

          tipo_recurso: "imagen",
          es_principal: false,
        },
        { transaction: t }
      );

      resultadosSubida.push(nuevaImagen);
    }

    await Propiedad.update(
      { activo: true },
      {
        where: { id: propiedadId },
        transaction: t,
      }
    );

    await t.commit();

    res.status(201).json({
      message: `Propiedad activada y ${files.length} imágenes asociadas exitosamente.`,
      imagenes: resultadosSubida,
    });
  } catch (error) {
    await t.rollback();

    console.error("Error al subir y asociar imágenes:", error);

    res
      .status(500)
      .json({
        error: "Fallo interno al procesar las imágenes o en la base de datos.",
      });
  }
};

export const obtenerPropiedades = async (req, res) => {
  try {
    const propiedades = await Propiedad.findAll({
      where: { activo: true },
      order: [["creado_en", "DESC"]],
      include: [
        {
          model: Imagen,
          as: "imagenes",
          attributes: ["url", "tipo_recurso", ["es_principal", "es_portada"]],
        },
      ],
    });

    res.status(200).json(propiedades);
  } catch (error) {
    console.error("Error Sequelize (obtenerPropiedades):", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const obtenerPropiedadPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const propiedad = await Propiedad.findByPk(id, {
      include: [
        {
          model: Imagen,
          as: "imagenes",
          attributes: ["url", "tipo_recurso", ["es_principal", "es_portada"]],
        },
      ],
    });

    if (!propiedad) {
      return res.status(404).json({ message: "Propiedad no encontrada." });
    }

    res.status(200).json(propiedad);
  } catch (error) {
    console.error("Error Sequelize (obtenerPropiedadPorId):", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const actualizarPropiedad = async (req, res) => {
  const { id } = req.params;
  const usuario_id_token = req.user.id;
  const usuario_role_token = req.user.role;
  const updateData = req.body;

  try {
    const propiedad = await Propiedad.findByPk(id, {
      attributes: ["usuario_id"],
    });

    if (!propiedad) {
      return res.status(404).json({ message: "Propiedad no encontrada." });
    }

    const propietario_id = propiedad.usuario_id;

    if (propietario_id !== usuario_id_token && usuario_role_token !== "admin") {
      return res.status(403).json({
        message: "No tienes permisos para actualizar esta propiedad.",
      });
    }

    const [rowsAffected] = await Propiedad.update(updateData, {
      where: { id },
    });

    if (rowsAffected === 0) {
      return res.status(400).json({
        message: "No se pudo actualizar la propiedad o no se hicieron cambios.",
      });
    }

    res.status(200).json({ message: "Propiedad actualizada correctamente." });
  } catch (error) {
    console.error("Error Sequelize (actualizarPropiedad):", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const eliminarPropiedad = async (req, res) => {
  const { id } = req.params;
  const usuario_id_token = req.user.id;
  const usuario_role_token = req.user.role;

  const t = await sequelize.transaction();

  try {
    const propiedad = await Propiedad.findByPk(id, {
      attributes: ["usuario_id"],
      transaction: t,
    });

    if (!propiedad) {
      await t.commit();
      return res.status(404).json({ message: "Propiedad no encontrada." });
    }

    const propietario_id = propiedad.usuario_id;

    if (propietario_id !== usuario_id_token && usuario_role_token !== "admin") {
      await t.commit();
      return res
        .status(403)
        .json({ message: "No tienes permisos para eliminar esta propiedad." });
    }

    await Imagen.destroy({
      where: { propiedad_id: id },
      transaction: t,
    });

    const rowsDeleted = await Propiedad.destroy({
      where: { id },
      transaction: t,
    });

    if (rowsDeleted === 0) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "No se pudo eliminar la propiedad." });
    }
    await t.commit();

    res.status(200).json({ message: "Propiedad eliminada correctamente." });
  } catch (error) {
    await t.rollback();
    console.error("Error Sequelize (eliminarPropiedad):", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};
