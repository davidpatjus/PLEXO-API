export const isAdmin = (req, res, next) => {
  console.log(req.user)
  if (req.user && req.user.admin) {
    
    next(); // Si el usuario es administrador, permite continuar
  } else {
    res.status(403).json({ message: 'No autorizado. Requiere permisos de administrador.' });
  }
};

