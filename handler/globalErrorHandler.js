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
const globalErrorHandler = async function (error, req, res, next) {
  error.status = error.status || "Error";
  error.statusCode = error.statusCode || 500;

  if (error.name === "ValidationError") {
    validationErrors(error, res);
  } else if (error.name === "Error") {
    fieldErrors(error, res);
  } else if (error.code === 11000) {
    duplicateErrors(error, res);
  } else if (error.name === "CastError") {
    castErrors(error, res);
  } else {
    console.log(error);
    res.status(500).send({
      status: "Internal Error",
      code: 500,
      message: "Internal server error occurred",
    });
  }
};
export default globalErrorHandler;
