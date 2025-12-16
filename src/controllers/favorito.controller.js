import Favorito from "../models/Favorito.js";
import Propiedad from "../models/Propiedad.js";
import User from "../models/User.js";

const toggleFavorito = async (req, res) => {
  const usuarioId = req.user ? req.user.id : undefined;

  const { propiedadId } = req.params;
  if (!usuarioId) {
    return res
      .status(401)
      .json({ message: "Usuario no autenticado. Token requerido." });
  }

  try {
    const propiedad = await Propiedad.findByPk(propiedadId);
    if (!propiedad) {
      return res.status(404).json({ message: "Propiedad no encontrada." });
    }

    const [favorito, created] = await Favorito.findOrCreate({
      where: {
        usuario_id: usuarioId,
        propiedad_id: propiedadId,
      },
    });

    if (created) {
      return res.status(201).json({
        message: "Propiedad agregada a favoritos.",
        isFavorito: true,
      });
    } else {
      await favorito.destroy();
      return res.status(200).json({
        message: "Propiedad eliminada de favoritos.",
        isFavorito: false,
      });
    }
  } catch (error) {
    console.error("Error al manejar favoritos:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

const getFavoritos = async (req, res) => {
  const usuarioId = req.user ? req.user.id : undefined;

  if (!usuarioId) {
    return res.status(401).json({ message: "Usuario no autenticado." });
  }

  try {
    const userWithFavoritas = await User.findByPk(usuarioId, {
      attributes: [],
      include: [
        {
          model: Propiedad,
          as: "favoritas",
          through: { attributes: [] },
        },
      ],
    });

    if (!userWithFavoritas) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    res.status(200).json(userWithFavoritas.favoritas);
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

const isFavorito = async (req, res) => {
  const usuarioId = req.user ? req.user.id : undefined;
  const { propiedadId } = req.params;

  if (!usuarioId) {
    return res.status(200).json({ isFavorito: false });
  }

  try {
    const favorito = await Favorito.findOne({
      where: {
        usuario_id: usuarioId,
        propiedad_id: propiedadId,
      },
    });

    const isFavoritoStatus = !!favorito;

    res.status(200).json({ isFavorito: isFavoritoStatus });
  } catch (error) {
    console.error("Error al verificar favorito:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

export { toggleFavorito, getFavoritos, isFavorito };
