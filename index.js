const express = require("express");
const app = express();
const path = require("path");

app.use(express.static("public"));

app.get("/json", (req, res) => {
    res.sendFile(path.join(__dirname + "/frequencies.json"));
});

app.listen(8080, (req, res) => {
    console.log("listening...");
});
