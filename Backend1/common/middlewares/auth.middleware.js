const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log("Auth Header:", authHeader.token);
  if (!authHeader) {
    console.log("Headers:", req.headers);
    return res.status(401).json({ success: false, message: 'No token provideddddddd' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token missing' });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("JWT Error:", err.name);


    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired, please login again.',
      });
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token provided.',
      });
    }


    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Please login again.',
    });
  }

};
