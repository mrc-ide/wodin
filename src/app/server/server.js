const express = require("express");
const path = require("path");

const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('*', (req, res, next) => {
    console.log("Handling: " + req.url);

    const options = {
        root: path.join(__dirname, "public", "html")
    };

    const fileName = 'basic.html';
    res.sendFile(fileName, options, function (err) {
        if (err) {
            console.log("Error:", err);
            next(err);
        }
    });
});

app.listen(port, () => {
    console.log(`wodin server listening on port ${port}`)
});
