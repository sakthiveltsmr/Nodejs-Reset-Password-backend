const router = require("express").Router();

const service = require("../Service/resetPass.service");

//gen token and sending mail
router.post("/", service.sendToken);

//verify resetToken and Expiry time
router.post("/:userId/:token", service.verifyAndUpdatePasssord);

router.get("/:userId/:token", service.verifyToken);

module.exports = router;
