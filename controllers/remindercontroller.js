"use strict";

const firebase = require("../db");
const Reminder = require("../models/reminder");
const { firestore } = require("@google-cloud/firestore");

const addReminder = async (req, res, next) => {
  try {
    const data = req.body;
    await firestore.collection("reminders").doc().set(data);
    res.send("Record saved successfuly");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const getAllReminders = async (req, res, next) => {
  try {
    const reminders = await firestore.collection("reminders");
    const data = await reminders.get();
    const remindersArray = [];
    if (data.empty) {
      res.status(404).send("No reminder record found");
    } else {
      data.forEach(doc => {
        const reminder = new Reminder(
          doc.id,
          doc.data().taskName,
          doc.data().taskTime,
          doc.data().taskTimeOG,
          doc.data().clientNumber
        );
        remindersArray.push(reminder);
      });
      res.send(remindersArray);
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const getReminder = async (req, res, next) => {
  try {
    const id = req.params.id;
    const reminder = await firestore.collection("reminders").doc(id);
    const data = await reminder.get();
    if (!data.exists) {
      res.status(404).send("Reminder with the given ID not found");
    } else {
      res.send(data.data());
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const updateReminder = async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const reminder = await firestore.collection("reminders").doc(id);
    await reminder.update(data);
    res.send("Reminder record updated successfuly");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const deleteReminder = async (req, res, next) => {
  try {
    const id = req.params.id;
    await firestore.collection("reminders").doc(id).delete();
    res.send("Record deleted successfuly");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports = {
  addReminder,
  getAllReminders,
  getReminder,
  updateReminder,
  deleteReminder,
};
