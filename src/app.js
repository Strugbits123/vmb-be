const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const router = require("./routes/index");
const utils = require("./utils/util");
const cookieParser = require('cookie-parser');


const app = express();

dotenv.config({ 
    path: "./src/config/.env" 
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
    cors({
        origin: "*",
        methods: ["GET","POST","PUT","DELETE","OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);


app.use('/', router)

app.get("/", (req, res) => {
    res.send("VMB Server is running");
});

utils.setupSchedulers();

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
    console.log("Not found");
    res.status(404).json({ error: "Not found" });
});

module.exports = app;