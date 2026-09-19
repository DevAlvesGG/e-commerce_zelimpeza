//ESTUDAR ESTE MIDDLEWARE
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      return res.status(400).json({ error: 'Dados inválidos.', details: errors });
    }

    // Substitui req.body pelos dados já validados e "limpos" (sem campos extras)
    req.body = result.data;
    next();
  };
}

module.exports = validate;