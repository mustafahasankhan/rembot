const express = require("express");
const {
  addreminder,
  getAllreminders,
  getreminder,
  updatereminder,
  deletereminder,
} = require("../controllers/remindercontroller");

const router = express.Router();

router.post("/reminder", addreminder);
router.get("/reminders", getAllreminders);
router.get("/reminder/:id", getreminder);
router.put("/reminder/:id", updatereminder);
router.delete("/reminder/:id", deletereminder);

module.exports = {
  routes: router,
};
