// validate(schema) parses req.body with a zod schema and replaces it with the clean result
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    next(err); // handled in error.middleware.js
  }
};

export default validate;
