const validationErrors = async function (error, res) {
  const errors = Object.values(error.errors).map((errObj) => {
    return {
      name: errObj.path,
      message: errObj.message,
    };
  });
  res.status(error.statusCode).send({
    status: error.status,
    code: error.statusCode,
    errors: {
      type: error.name,
      fields: errors,
    },
  });
};
const fieldErrors = async function (error, res) {
  res.status(error.statusCode).send({
    status: error.status,
    code: error.statusCode,
    errors: error.message,
  });
};
const duplicateErrors = async function (error, res) {
  res.send({
    status: error.status,
    code: error.statusCode,
    errors: {
      type: "Duplicate field error",
      name: error.message.match(/(["'])(\\?.)*?\1/)[0].match(/"(.+?)"/)[1],
    },
  });
};
const castErrors = async function (error, res) {
  res.status(error.statusCode).send({
    status: error.status,
    code: error.statusCode,
    errors: {
      type: "Cast error",
      name: error.message,
    },
  });
};
const tokenExpiredErrors = async function (error, res) {
  error.expiredAt = new Date(error.expiredAt).toLocaleString();
  res.status(error.statusCode).send({
    status: error.status,
    code: error.statusCode,
    errors: {
      name: error.name,
      message: error.message,
      expiredAt: error.expiredAt,
    },
  });
};
const globalErrorHandler = async function (error, req, res, next) {
  error.status = error.status || "Error";
  error.statusCode = error.statusCode || 500;

  if (error.name == "TokenExpiredError") {
    tokenExpiredErrors(error, res);
  } else if (error.name === "ValidationError") {
    validationErrors(error, res);
  } else if (error.name === "Error") {
    fieldErrors(error, res);
  } else if (error.code === 11000) {
    duplicateErrors(error, res);
  } else if (error.name === "CastError") {
    castErrors(error, res);
  }
  // print unCaught errors
  // console.log(error);
};
export default globalErrorHandler;
