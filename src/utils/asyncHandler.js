const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false
    });
    console.error(`Error in ${fn.name ? fn.name : "anonymous"}: ${error.message}`);
  }
};

export { asyncHandler };
