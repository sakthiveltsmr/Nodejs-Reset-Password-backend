const { MongoClient } = require("mongodb");

const URL = process.env.MONGODB_URL;
const NAME = process.env.MONGODB_NAME;

const client = new MongoClient(URL);

module.exports = {
  db: null,
  register: null,

  async connect() {
    await client.connect();
    console.log("mongodb connected sucessfully");
    this.db = client.db(NAME);
    console.log("database name is", NAME);
    this.register = this.db.collection("register");
  },
};
