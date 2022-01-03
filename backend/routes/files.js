const express = require("express");
const router = express.Router();
const {
  getAllFiles,
  getFileById,
  createFile,
  patchFile,
  deleteFile,
  givePermission,
  commentFile,
  factureParser,
  RBParser,
} = require("../controllers/filesController");
const upload = require("../middleware/uploadFile");
// ----get all files
router.get("/", getAllFiles);
//----get file by ID
router.get("/:id", getFileById);
//----create file
router.post("/", upload.single("src"), createFile);
//----patch file
router.patch("/:id", patchFile);
//----delete file
router.delete("/:id", deleteFile);
//----give permission to another user
router.patch("/permission/:id", givePermission);
//-----Add Comment to a file
router.patch("/comment/:id", commentFile);
//---- facture parser
router.post("/factureParser", upload.single("filePath"), factureParser);
//---- relevé bancaire parser
router.post("/RBParser", upload.single("filePath"), RBParser);
module.exports = router;