// src/middleware/authMiddleware.js
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    return res.status(403).json({ message: 'Acceso denegado: Solo administradores pueden realizar esta acción.' });
  };
  
  export const isUser = (req, res, next) => {
    if (req.user && req.user.role === 'user') {
      return next();
    }
    return res.status(403).json({ message: 'Acceso denegado: Solo usuarios pueden agregar productos al carrito.' });
  };
  