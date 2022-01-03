let Category = require("../models/Category.js");

const createCategory = (req, res) => {
  const name = req.body.name;
  const labels = req.body.labels;
  const newCategory = new Category({ name, labels });
  console.log(newCategory);
  newCategory
    .save()
    .then(() =>
      res.json({
        msg: "Category created successfully",
        data: newCategory,
        error: null,
      })
    )
    .catch((err) =>
      res.status(400).json({
        msg: "error creating Category",
        data: null,
        error: err,
      })
    );
};

const getAllCategories = (req, res) => {
  Category.find()
    .then((categories) => res.json(categories))
    .catch((err) => res.status(400).json("Error: " + err));
};

const getCategoryById = (req, res) => {
  Category.findById(req.params.id)
    .then((category) => res.json(category))
    .catch((err) => res.status(400).json("Error: " + err));
};

const deleteCategory = (req, res) => {
  const category = Category.findById(req.params.id);
  category
    .remove()
    .then(() =>
      res.json({
        msg: "category deleted successfully",
        data: null,
        error: null,
      })
    )
    .catch((err) =>
      res.status(400).json({
        msg: "error deleting category !",
        data: null,
        error: err,
      })
    );
};
module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  deleteCategory,
};
