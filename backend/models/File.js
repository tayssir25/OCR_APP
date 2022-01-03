const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FileSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  src: {
      type: Object,
  },
  QRcode: {
    type: String,
  },
  category: {type: Schema.Types.ObjectId, ref : 'Category'},
  owner : {type: Schema.Types.ObjectId, ref : 'User'},
  permittedTo : [{type: Schema.Types.ObjectId, ref : 'User'}],
  comments : [String]
},
{timestamps: true}
);

module.exports= mongoose.model("File", FileSchema);