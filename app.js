require("dotenv").config();

const cors = require("cors");

const express = require("express");

const mongo = require("./schema/mongodb");

const userRoute = require("./Routes/users.routes");
const resetRoute = require("./Routes/resetPass.routes");

const app = express();

(async () => {
  try {
    await mongo.connect();
    app.use(cors());
    app.use(express.json());

    // app.use((req, res, next) => {
    //   console.log("user middle ware called");
    //   res.send("server running");
    //   next();
    // });

    app.use("/users", userRoute);

    app.use("/resetpassword", resetRoute);

    const port = process.env.PORT || 3001;
    app.listen(port, () => console.log(`server running at ${port}`));
  } catch (err) {
    console.log("connection failiure", err.message);
  }
})();
