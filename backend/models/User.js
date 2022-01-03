const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
    unique: true,
  },
  email: {
    type: String,
    require: true,
  },
  password: {
      type:String,
      require:true,
      min:6,
  },
  role: {
    type:String,
    require:true,
    enum : ["admin","employee"],
},
enabled: {
  type: Boolean,
},
QRcode: {
  type: String
},
},
{timestamps: true}
);

module.exports= mongoose.model("User", UserSchema);
