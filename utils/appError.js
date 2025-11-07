class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructour);
    ` ${statusCode}${' '.startsWith('4')}` ? (this.status = 'fail') : 'error';
  }
}

module.exports = AppError;
