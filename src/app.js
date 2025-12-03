const express = require("express");
const cors = require("cors");
const router = require("./routes/index");
const cron = require("./utils/cron-schedulers");
const cookieParser = require('cookie-parser');
const { ErrorHandler } = require("./utils/responseHandler");


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
    cors({
        origin: "*",
        methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);


app.use('/', router)

app.get("/", (req, res) => {
    res.send("VMB Server is running");
});

cron.setupSchedulers();

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
    ErrorHandler("Not a valid API route", 404, req, res);
});

module.exports = app;