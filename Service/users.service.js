const mongo = require("../schema/mongodb");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const { registerSchema, loginSchema } = require("../schema/schema");

const service = {
  // register data service
  async register(req, res) {
    try {
      //validation using joi schema(value,error)
      const { value, error } = await registerSchema.validate(req.body);

      if (error)
        return res.status(400).send({ Error: error.details[0].message });

      // check email exist or not
      const emailExist = await mongo.register.findone({
        email: req.body.email,
      });
      console.log(emailExist);
    } catch (err) {}
  },
};
