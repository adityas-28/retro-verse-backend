const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Something went wrong!";
    
    res.status(statusCode).json({
      success: false,
      message: message,
      ...(error.errors && { errors: error.errors }),
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
    
    console.error(`Error in ${fn.name ? fn.name : "anonymous"}: ${error.message}`);
  }
};

export { asyncHandler };
