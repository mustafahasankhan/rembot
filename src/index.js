const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const twilio = require("twilio");
const _ = require("lodash");
const cron = require("node-cron");
const moment = require("moment-timezone");
const SID = process.env.SID;
const config = require("../config");
const reminderRoutes = require("../routes/reminder-routes");
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const axios = require("axios").default;
const client = new twilio(SID, AUTH_TOKEN);
const {
  extractClientNumber,
  sendMessage,
  testInput,
} = require("../utils/utils.js");
const WA = require("../helper-function/whatsapp-send-message");

// Start the webapp
const webApp = express();

// Webapp settings
webApp.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
webApp.use(bodyParser.json());
WebApp.use("/api", reminderRoutes.routes);
// Server Port
const PORT = process.env.PORT;

// Home route
webApp.get("/", (req, res) => {
  res.send(`Hello World.!`);
});

// Route for WhatsApp
webApp.post("/whatsapp", async (req, res) => {
  let message = req.body.Body;
  let senderID = req.body.From;
  const query = message.split(" ");
  switch (query[0]) {
    case "set":
      const taskName = query[1];
      const time = query[2];
      var hours = parseInt(time.slice(0, 2));
      var minutes = parseInt(time.slice(2, 4));
      var year = new Date().getUTCFullYear();
      if (!query[3] || query[3] === "today") {
        if (testInput(query)) {
          const istString = moment
            .tz(new Date().toISOString(), "Asia/Kolkata")
            .format()
            .slice(0, 16);
          var month = istString.slice(5, 7);
          var date = istString.slice(8, 10);
          const isoString = new Date(
            year,
            month - 1,
            date,
            hours,
            minutes,
            0,
            0
          ).toISOString();
          const taskTime = isoString.slice(0, 16);
          console.log(`Reminder created for: ${taskTime}`);
          axios
            .post("/reminder", {
              taskName: taskName,
              taskTime: taskTime,
              taskTimeOG:
                new Date(year, month - 1, date, hours, minutes, 0, 0)
                  .toDateString()
                  .slice(0, 16) +
                " at " +
                new Date(year, month - 1, date, hours, minutes, 0, 0)
                  .toTimeString()
                  .slice(0, 5),
              clientNumber: clientNumber,
            })
            .then(function (response) {
              console.log(response);
              sendMessage(`Ok, will remind about *${taskName}*`, res);
            })
            .catch(function (error) {
              console.log(error);
            });
        } else {
          sendMessage(
            "Please enter valid inputs and try again. Possible error: *Inputs not according to specified format* or *Reminder time given in past* (I hope you know time travel isn't possible yet)",
            res
          );
        }
      }

      // For any day
      else {
        if (testInput(query)) {
          const dateMonthString = query[3];
          var date = parseInt(dateMonthString.split("/")[0]);
          var month = parseInt(dateMonthString.split("/")[1]) - 1;
          const isoString = new Date(
            year,
            month,
            date,
            hours,
            minutes,
            0,
            0
          ).toISOString();
          const taskTime = isoString.slice(0, 16);
          console.log(`Reminder created for *${taskTime}*`);
          const taskInfo = new Reminder({
            taskName: taskName,
            taskTime: taskTime,
            taskTimeOG:
              new Date(year, month, date, hours, minutes, 0, 0)
                .toDateString()
                .slice(0, 16) +
              " at " +
              new Date(year, month, date, hours, minutes, 0, 0)
                .toTimeString()
                .slice(0, 5),
            clientNumber: clientNumber,
          });
          taskInfo.save(err => {
            if (err) {
              console.log(err);
            } else {
              sendMessage(`Ok, will remind you about *${taskName}*`, res);
            }
          });
        } else {
          sendMessage(
            "Please enter valid inputs and try again. Possible error: *Inputs not according to specified format* or *Reminder time given in past* (I hope you know time travel isn't possible yet)",
            res
          );
        }
      }
      break;
    case "view":
      // code block
      break;
    case "help":
      break;
    default:
      await WA.sendMessage("rules are.", senderID);
  }
  // Write a function to send message back to WhatsApp
  if (message.includes("view")) {
    await WA.sendMessage("rules are.", senderID);
  }
  await WA.sendMessage("Hello from the other side.", senderID);
});

// Start the server
webApp.listen(PORT, () => {
  console.log(`Server is up and running at ${PORT}`);
});
