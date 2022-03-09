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
      if (emailExist)
        return res
          .status(400)
          .send({ alert: "user already Exist,try with new Email id" });
      // gen salt using bcrypt
      const salt = await bcrypt.genSalt(10);
      console.log("random string", salt);

      req.body.password = await bcrypt.hash(req.body.password, salt);
      console.log("encrpted password", req.body.password);

      // post the user data to db
      const postData = await mongo.register.insertOne(req.body);
      console.log(postData);
      console.log("user register successfully");
    } catch (err) {
      console.log("err in registration", err);
    }
  },

  // login user service (JWT)
  async login(req, res) {
    try {
      //joi loginschema validation
      const { value, error } = await loginSchema.validate(req.body);

      if (error)
        return res.status(400).send({ Error: error.details[0].message });

      //check first email exist;
      const emailExist = await mongo.register.findOne({
        email: req.body.email,
      });
      //not exist
      if (!emailExist)
        return res.status(404).send({ Alert: "User not found,Please Sign up" });

      //check password valid or not bcrypt.campare
      const passValid = await bcrypt.compare(
        req.body.password,
        emailExist.password
      ); //compare with orignal pass and typed password;

      if (!passValid)
        return res.status(400).send({ Alert: "Enter the correctPassword" });

      //gen Token using jwt
      const token = jwt.sign(
        {
          userId: emailExist._id,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "8h" }
      );
      console.log(token);

      res.status(200).send({ Alert: "Login successfully", token: token });
    } catch (err) {
      console.log("error in login", err);
    }
  },
};

module.exports = service;
