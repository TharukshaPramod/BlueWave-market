//maintainence

const validateRequest = (req, res, next) => {
    const errors = [];
    for (const [key, value] of Object.entries(req.body)) {
      if (value === undefined || value === null || value === '') {
        errors.push(`${key} is required`);
      }
    }
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    next();
  };
  
  module.exports = validateRequest;