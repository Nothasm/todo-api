const express = require('express');
const bodyParser = require('body-parser');
const { mongoose } = require("./db/mongoose");

var { Todo } = require('./models/todo');
var { User } = require('./models/user');

var app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    console.log(req.body);
    let newTodo = new Todo({
        text: req.body.text
    });

    newTodo.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then((results) => {
        res.send({
            status: "OK",
            results
        });
    }, (err) => res.status(400).send(err));
});

app.listen(3000, () => {
    console.log("Server up on port 3000")
});

module.exports = {
    app
};