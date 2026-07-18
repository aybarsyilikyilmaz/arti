const { ZodError } = require('zod');

// Zod şemasıyla body doğrulaması. Şema strip modunda olduğu için
// bilinmeyen alanlar sessizce atılır (mass-assignment koruması).
const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: err.issues[0]?.message || 'Geçersiz istek verisi.',
        errors: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      });
    }
    next(err);
  }
};

// Query parametreleri için aynı doğrulama (coerce'lu şemalarla kullanılır)
const validateQuery = (schema) => (req, res, next) => {
  try {
    req.query = schema.parse(req.query);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: err.issues[0]?.message || 'Geçersiz sorgu parametresi.',
        errors: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      });
    }
    next(err);
  }
};

module.exports = { validateBody, validateQuery };
