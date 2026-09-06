export const notFound = (req, res) => {
  res.status(404);
  throw new Error(`Route not found: ${req.originalUrl}`);
};

export const errorHandler = (err, _req, res, _next) => {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({
    success: false,
    message: err.message || "Server error"
  });
};
