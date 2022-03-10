const mongo = require("../schema/mongodb");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const sendMail = require("../schema/sendMailer");
const { ObjectId } = require("mongodb"); //driver

const service = {
  async sendToken(req, res, next) {
    let userExist = await mongo.register.findOne({ email: req.body.email });
    console.log(userExist);
    console.log("reset user choosed");

    //check exit or not
    if (!userExist) res.status(400).send("user doen't exists");

    //if user reset token was not used, remove the reset token unset
    if (userExist.resetToken) {
      let data = await mongo.register.update(
        { email: userExist.email },
        { $unset: { resetToken: 1, resetExpire: 1 } }
      );
      console.log(data);
    }

    //create string for hashing pass; like joi salt;
    let token = crypto.randomBytes(32).toString("hex");
    console.log(token);
    //generation hash reset token: it will store in db
    let hashToken = await bcrypt.hash(token, Number(12));

    console.log("hashTOken:", hashToken);
    console.log("token:", token);

    //expiry timing for 1 hour
    let expiry = new Date(Date.now() + 1 * 3600 * 1000);
    console.log(expiry);

    //updating resetToken and expiry time to user details;
    let data = await mongo.register.findOneAndUpdate(
      { email: userExist.email },
      { $set: { resetToken: hashToken, resetExpire: expiry } },
      { ReturnDocument: "after" }
    );
    console.log(data);
    const link = `https://sakthi-reset-password.netlify.app/resetpassword/${userExist._id}/${token}`;

    await sendMail(userExist.email, "password Reset", link);
    res.status(200).send({
      message: "Link sent to email",
      Id: data.value._id,
      resetToken: hashToken,
    });
  },

  //verify resetToken and expiry time
  async verifyToken(req, res, next) {
    //get user details
    const userExist = await mongo.register.findOne({
      _id: ObjectId(req.params.userId),
    });
    console.log("verify token :", userExist);

    //if user not exist
    if (!userExist) return res.status(400).send("invalid or Expired");

    const token = req.params.token;

    console.log("token:", token);
    //verifing token compare to db resetToken
    const isVaild = await bcrypt.compare(token, userExist.resetToken);

    //verifing expiry timing
    const isExpired = userExist.resetExpire > Date.now();

    //both are valid
    if (isVaild && isExpired) {
      res.status(200).send({ message: true });
    } else {
      res.status(400).send({ Error: "invalid link or Expired" });
    }
  },
  async verifyAndUpdatePasssord(req, res, next) {
    let userExist = await mongo.register.findOne({
      _id: ObjectId(req.params.userId),
    });
    console.log(userExist);

    if (!userExist.resetToken) {
      return res.status(400).send("invalid token");
    }
    const token = req.params.token;

    const isValid = await bcrypt.compare(token, userExist.resetToken); //return true of false
    console.log(isValid);
    const isExpired = userExist.resetExpire > Date.now();

    if (isValid && isExpired) {
      const password = req.body.password;
      const hashPass = await bcrypt.hash(password, Number(12));
      console.log("new pass:", hashPass);
      //new password updated to db with encrpted
      const data = await mongo.register.findOneAndUpdate(
        { _id: ObjectId(req.params.userId) },
        {
          $set: { password: hashPass },
          $unset: { resetToken: 1, resetExpire: 1 },
        },
        { ReturnDocument: "after" }
      );
      console.log(data);
      res.status(200).send({ message: "password updated successfully" });
    } else res.status(400).send("Invalid link or Expired");
  },
};

module.exports = service;
