const express = require('express');
const bodyParser = require('body-parser');
const { mongoose, ObjectId } = require("./db/mongoose");

var { Todo } = require('./models/todo');
var { User } = require('./models/user');

var app = express();
const PORT = process.env.PORT || 3000;

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

app.get('/todos/:id', (req, res) => {
    if (ObjectId.isValid(req.params.id)) {
        Todo.findById(req.params.id).then((todo) => {
            if(todo) {    
                res.send(todo);
            } else {
                res.status(404).send();
            }
        }).catch((e) => {
            res.status(404).send();
        });
    } else {
        res.status(404).send();
    }
});

app.listen(PORT, () => {
    console.log(`Server up on port ${PORT}`)
});

module.exports = {
    app
};