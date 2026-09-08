const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error Caught:', err);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  res.json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    details: err.errors || null // Used for Sequelize validation errors
  });
};

module.exports = { errorHandler };
