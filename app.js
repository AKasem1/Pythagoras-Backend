require("dotenv").config();
const cors = require("cors");
const path = require("path");
const express = require("express");
const { default: mongoose } = require("mongoose");
const userRoute = require("./routes/user");
const adminRoute = require("./routes/admin");

mongoose.set("strictQuery", false);
const app = express();

app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3000", "https://pythagoras-fronttend.vercel.app"]
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use("/user", userRoute);
app.use("/admin", adminRoute);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("connected to db & listening on port:", process.env.PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });

console.log("Hello World");
