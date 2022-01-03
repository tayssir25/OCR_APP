const express = require("express");
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  deleteCategory,
} = require("../controllers/categoriesController");

//----create category
router.post("/", createCategory);
//----get all categories
router.get("/", getAllCategories);
//----get Category by ID
router.get("/:id", getCategoryById);
//----Delete Category
router.delete("/:id", deleteCategory);

module.exports = router;
