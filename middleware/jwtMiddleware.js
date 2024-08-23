import jwt from 'jsonwebtoken';
import { promisify } from 'util';

const verifyJwt = promisify(jwt.verify);

export const authenticateJWT = async (req, res, next) => {
  const token = req.cookies.plexoCookie;

  if (!token) {
    return res.status(401).json({ message: 'No hay token proporcionado' });
  }

  try {
    const decoded = await verifyJwt(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    console.error('Error verificando token:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expirado' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Token inválido' });
    } else {
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
};

