const express = require('express');
const bodyParser = require('body-parser');
const {mongoose} = require("./db/mongoose");

var {Todo} = require('./models/todo');
var {User} = require('./models/user');

const app = express();

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
})
    .get('/todos', (req, res) => {
        Todo.find().then((result) => res.send(result));
    })

app.listen(3000, () => {
    console.log("Server up on port 3000")
});