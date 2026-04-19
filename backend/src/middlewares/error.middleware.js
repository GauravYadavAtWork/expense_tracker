function notFoundHandler(req, res) {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, _req, res, _next) {
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid resource identifier",
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      message: "Duplicate value violates a unique constraint",
    });
  }

  if (err.code === "23505") {
    return res.status(409).json({
      message: "Duplicate value violates a unique constraint",
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    message,
    ...(err.details ? { details: err.details } : {}),
    ...(process.env.NODE_ENV !== "production" && err.stack ? { stack: err.stack } : {}),
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
