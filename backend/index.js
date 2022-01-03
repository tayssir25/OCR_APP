const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const userRoute = require("./routes/users");
const fileRoute = require("./routes/files");
const categoryRoute = require("./routes/categories");

app.use(cors());
app.use(express.json());

mongoose.connect(
  "mongodb://localhost:27017/OCRDB",
  { UseNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (!err) {
      console.log("successfully connected ! ");
    } else {
      console.log("error connection to the data base !");
      console.log(err);
    }
  }
);

const connection = mongoose.connection;
connection.once("open", () => {
  console.clear();
  console.log("MongoDB");
});

app.use("/users", userRoute);
app.use("/files", fileRoute);
app.use("/categories", categoryRoute);

app.listen(5000, () => {
  console.log("backend server is running on port 5000");
});
