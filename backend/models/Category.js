const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  test:{},
  name: {
    type: String,
    require: true,
  },
  labels: [{ type: [String] }]
},
{timestamps: true}
);

module.exports= mongoose.model("Category", CategorySchema);