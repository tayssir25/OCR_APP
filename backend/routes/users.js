const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/usersController");


//----send email
router.post("/send", sendMail);

//----Get all users
router.get("/", getAllUsers);
//----Get user by id
router.get("/:id", getUserById);

//Add User : admin
router.post("/addAdmin", addAdmin); 
//Add User : employee
router.post("/addEmployee", addEmployee);

//----Delete employee
router.delete("/:id", deleteEmployee); 

//----Login Admin
router.post("/login-admin",loginAdmin); 
//----Login employee
router.post("/login-employee", loginEmployee);
//----patch user
router.patch("/:id", patchUser);
//----enable employee
router.patch("/enable/:id", enableEmployee);
//----disable employee
router.patch("/disable/:id", disableEmployee);
module.exports = router;
