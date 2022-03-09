require("dotenv").config();

const cors = require("cors");

const express = require("express");

const mongo = require("./schema/mongodb");

const userRoute = require("./Routes/users.routes");

const app = express();

(async () => {
  try {
    await mongo.connect();
    app.use(cors);
    app.use(express.json());

    app.use((req, res, next) => {
      console.log("user middle ware called");
      next();
    });

    app.use("/users", userRoute);
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`server running at ${port}`));
  } catch (err) {
    console.log("connection failiure", err.message);
  }
})();
