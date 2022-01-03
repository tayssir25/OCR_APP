let User = require("../models/User.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var nodemailer = require("nodemailer");
const generateQR = require("../middleware/QRcodegenerator");

const sendMail = (req, res) => {
  const email = req.body.email;
  const link = "https://www.arsela.co/en/";
  var data = {
    from: "tayssira1925@hotmail.com",
    to: email,
    subject: "verifier email",
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
          <html
            xmlns="http://www.w3.org/1999/xhtml"
            xmlns:v="urn:schemas-microsoft-com:vml"
            xmlns:o="urn:schemas-microsoft-com:office:office"
          >
            <head>
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Portfolio - Responsive Email Template</title>
            </head>
            <body style="padding: 0; margin: 0" bgcolor="#EEEEEE">
              <h1>Confirmation email</h1> </br>
              <p>cliquez sur ce lien pour verifier votre email : ${link}</p>
            </body>
          </html>`,
  };
  var transporter4 = nodemailer.createTransport({
    service: "hotmail",
    auth: {
      user: "tayssira1925@hotmail.com",
      pass: "etoiliste1925",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  transporter4.sendMail(data, function (error, info) {
    if (error) {
      console.log(error);
      return res.json({ err: "error in email sender" });
    } else {
      return res.json({
        message: "email has been sent",
      });
    }
  });
};

const getAllUsers = (req, res) => {
  User.find()
    .then((users) => res.json(users))
    .catch((err) => res.status(400).json("Error: " + err));
};

const getUserById = (req, res) => {
  User.findById(req.params.id)
    .then((user) => res.json(user))
    .catch((err) => res.status(400).json("Error: " + err));
};

const addAdmin = (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const role = "admin";
  //********* generation of QRCode****** */
  let stringData = username + "/ " + email + "/ " + role;
  stringData = generateQR(stringData);
  const newUser = new User({
    username: username,
    email: email,
    password: password,
    role: role,
    QRcode: stringData,
    enabled: true,
  });
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      newUser
        .save()
        .then(() =>
          res.json({
            msg: "admin registered successfully",
            data: newUser,
            error: null,
          })
        )
        .catch((err) => console.log(err));
    });
  });
};

const addEmployee = (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = "";
  const role = "employee";
  const enabled = true;
  //**QR code generation for every employee*****
  let stringData = username + "/ " + email + "/ " + role;
  stringData = generateQR(stringData);
  const newUser = new User({
    username: username,
    email: email,
    password: password,
    role: role,
    QRcode: stringData,
    enabled: enabled,
  });

  newUser
    .save()
    .then(() =>
      res.json({
        msg: "employee added successfully",
        data: newUser,
        error: null,
      })
    )
    .catch((err) =>
      res.status(400).json({
        msg: "error adding employee",
        data: null,
        error: err,
      })
    );
};

const deleteEmployee = (req, res) => {
  const user = User.findById(req.params.id);
  user
    .remove()
    .then(() =>
      res.json({
        msg: "employee deleted successfully",
        data: null,
        error: null,
      })
    )
    .catch((err) =>
      res.status(400).json({
        msg: "error deleting employee !",
        data: null,
        error: err,
      })
    );
};

const enableEmployee = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.enabled = true;
    user.save();
  } catch (err) {
    console.log("error enabling employee : " + err);
  }
};

const disableEmployee = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.enabled = false;
    user.save();
  } catch (err) {
    console.log("error disabling employee : " + err);
  }
};

const loginAdmin = async (req, res) => {
  User.findOne({ username: req.body.username })
    .then(async (user) => {
      if (user.role !== "admin") {
        return res.status(403).json({
          msg: "Please make sure you are logging in from the right portal.",
        });
      }
      let isMatch = await bcrypt.compare(req.body.password, user.password);
      if (isMatch) {
        let token = await jwt.sign(
          {
            user_id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            QRcode: user.QRcode,
          },
          "SECRET"
        );
        console.log("token", token);

        let result = {
          username: user.username,
          email: user.email,
          role: user.role,
          QRcode: user.QRcode,
          token: `Bearer ${token}`,
          expiresIn: 168,
        };
        console.log("result", result);

        return res.status(200).json({
          msg: " You are now logged in.",
          data: result,
          error: null,
        });
      } else {
        return res.status(403).json({
          msg: "Incorrect password.",
        });
      }
    })
    .catch((err) =>
      res.status(400).json({
        msg: "no user with such a username, check again",
        data: null,
        error: err,
      })
    );
};

const loginEmployee = async (req, res) => {
  User.findOne({ username: req.body.username })
    .then(async (user) => {
      if (user.role !== "employee") {
        return res.status(403).json({
          msg: "Please make sure you are logging in from the right portal.",
        });
      }
      let isMatch = await bcrypt.compare(req.body.password, user.password);
      if (isMatch) {
        let token = await jwt.sign(
          {
            user_id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            QRcode: user.QRcode,
          },
          "SECRET"
        );
        console.log("token", token);

        let result = {
          username: user.username,
          email: user.email,
          role: user.role,
          QRcode: user.QRcode,
          token: `Bearer ${token}`,
          expiresIn: 168,
        };
        console.log("result", result);

        return res.status(200).json({
          msg: " You are now logged in.",
          data: result,
          error: null,
        });
      } else {
        return res.status(403).json({
          msg: "Incorrect password.",
        });
      }
    })
    .catch((err) =>
      res.status(400).json({
        msg: "no user with such a username, check again",
        data: null,
        error: err,
      })
    );
};

const patchUser = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const result = await User.findByIdAndUpdate(id, updates);
    res.send(result);
  } catch (err) {
    console.log(err);
  }
};
module.exports = {
    sendMail,
    getAllUsers,
    getUserById,
    addAdmin,
    addEmployee,
    deleteEmployee,
    enableEmployee,
    disableEmployee,
    loginAdmin,
    loginEmployee,
    patchUser,
};