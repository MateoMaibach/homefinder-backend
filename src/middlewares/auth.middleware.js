import jwt from 'jsonwebtoken';


export const verifyToken = (req, res, next) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
       
        return res.status(401).json({ message: "Acceso denegado. No se proporcionó token." });
    }


    try {
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
       
        req.user = decoded; 
        
 
        next(); 

    } catch (error) {
        
        return res.status(403).json({ message: "Token inválido o expirado." });
    }
};


export const verifyAdminRole = (req, res, next) => {
    
    if (req.user && req.user.rol === 'admin') {
        
        next();
    } else {
      
        return res.status(403).json({ message: "Acceso prohibido. Requiere rol de Administrador." });
    }
};