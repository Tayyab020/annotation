const { protect, authorize } = require('./auth');
const errorHandler = require('./errorHandler');
const { validateRegister, validateLogin, checkValidation } = require('./validation');
const { upload, handleMulterError } = require('./upload');

module.exports = {
  protect,
  authorize,
  errorHandler,
  validateRegister,
  validateLogin,
  checkValidation,
  upload,
  handleMulterError
};