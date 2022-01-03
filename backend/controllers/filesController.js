let File = require("../models/File.js");
const generateQR = require("../middleware/QRcodegenerator");
const ocrSpace = require("../middleware/OCRSpace");
const getFactureData = require("../middleware/getFactureData");
const getRBData = require("../middleware/getRBData");

const getAllFiles = (req, res) => {
  File.find()
    .populate("category")
    .populate("owner")
    .populate("permittedTo")
    .then((files) => res.json(files))
    .catch((err) => res.status(400).json("Error: " + err));
};
const getFileById = (req, res) => {
  File.findById(req.params.id)
    .populate("category")
    .populate("owner")
    .populate("permittedTo")
    .then((file) => res.json(file))
    .catch((err) => res.status(400).json("Error: " + err));
};

const createFile = async (req, res) => {
  const name = req.body.name;
  const src = req.file;
  const category = req.body.category;
  const owner = req.body.owner;
  let permittedTo = [owner];
  //**QR code generation for every file*****
  let stringData = src + owner + category;

  stringData = generateQR(stringData);
  const QRcode = stringData;

  const newFile = new File({ name, src, QRcode, category, owner, permittedTo });
  newFile
    .save()
    .then(() =>
      res.json({
        msg: "File added successfully",
        data: newFile,
        error: null,
      })
    )
    .catch((err) =>
      res.json({
        msg: "error adding file",
        error: err,
      })
    );
};

const patchFile = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const result = await File.findByIdAndUpdate(id, updates);
    res.send(result);
  } catch (err) {
    console.log(err);
  }
};

const deleteFile = (req, res) => {
  const file = File.findById(req.params.id);
  file
    .remove()
    .then(() =>
      res.json({
        msg: "file deleted successfully",
        data: null,
        error: null,
      })
    )
    .catch((err) =>
      res.status(400).json({
        msg: "error deleting file !",
        data: null,
        error: err,
      })
    );
};

const givePermission = async (req, res) => {
  try {
    const newEmployee = req.body.newEmployee;
    let file = await File.findById(req.params.id);
    file.permittedTo.push(newEmployee);
    file.save();
    //result = await File.findByIdAndUpdate( req.params.id, {permittedTo: File.permittedTo.concat(newEmployee)});
    res.send(file);
  } catch (err) {
    console.log(err);
  }
};

const commentFile = async (req, res) => {
  try {
    let file = await File.findById(req.params.id);
    file.comments.push(req.body.newComment);
    file.save();
    res.send(file.comments);
  } catch (err) {
    console.log("you have an error : " + err);
  }
};

const parseFile = async (req, res, filePath) => {
  try {
    // const isCreateSearchablePdf = req.body.isCreateSearchablePdf;
    // const isSearchablePdfHideTextLayer = req.body.isSearchablePdfHideTextLayer;
    // const isTable = req.body.isTable;
    // const language = req.body.language;
    const isCreateSearchablePdf = false;
    const isSearchablePdfHideTextLayer = false;
    const isTable = true;
    const language = req.body.language;
    if (!filePath) {
      const FilePath = String(filePath);
      var result = await ocrSpace(FilePath, {
        language,
        isCreateSearchablePdf,
        isSearchablePdfHideTextLayer,
        isTable,
      });
    } else
      var result = await ocrSpace(filePath.path, {
        language,
        isCreateSearchablePdf,
        isSearchablePdfHideTextLayer,
        isTable,
      });
    return (result);
  } catch (err) {
    console.log("you have an error " + err);
    return (err);
  }
};

const factureParser = async (req, res) => {
  try{
   var filePath = req.file;
   const result =  await parseFile(req, res, filePath);
   const DATA = await getFactureData (result.ParsedResults[0].TextOverlay);
  // console.log(result.ParsedResults[0].TextOverlay);
 // console.log(result.SearchablePDFURL);
 console.log(DATA)
   res.json(DATA);
  } catch (err){
    res.send(err);
  }
};

const RBParser = async (req, res) => {
  var filePath = req.file;
  try{
    const result =  await parseFile(req, res, filePath);
    const DATA = await getRBData (result.ParsedResults[0].TextOverlay);
    console.log(DATA);
    res.json(DATA)
    //res.json(result.ParsedResults[0].TextOverlay);
   // console.log(result.SearchablePDFURL);
  } catch (err){
    res.send(err);
  }
};

module.exports = {
  getAllFiles,
  getFileById,
  createFile,
  patchFile,
  deleteFile,
  givePermission,
  commentFile,
  factureParser,
  RBParser,
};