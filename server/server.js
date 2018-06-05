const express = require('express');
const bodyParser = require('body-parser');
const { mongoose, ObjectId } = require('./db/mongoose');
const _ = require('lodash');

var { Todo } = require('./models/todo');
var { User } = require('./models/user');

var app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
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
            res.status(400).send();
        });
    } else {
        res.status(404).send();
    }
});

app.delete('/todos/:id', (req, res) => {
    if (ObjectId.isValid(req.params.id)) {
        Todo.findByIdAndRemove(req.params.id).then((todo) => {
            if (todo) {
                res.send(todo);
            } else {
                res.status(404).send();
            }
        }).catch((e) => {
            res.status(400);
        });
    } else {
        res.status(404).send();
    }
});

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);

    if (ObjectId.isValid(id)) {
        if (_.isBoolean(body.completed) && body.completed) {
            body.completedAt = new Date().getTime();
        } else {
            body.completed = false;
            body.completedAt = null;
        }

        Todo.findByIdAndUpdate(id, { $set: body }, { new: true }).then((todo) => {
            if (todo) {
                res.send(todo);
            } else {
                res.status(404).send();
            }
        }).catch((e) => {
            res.status(400).send();
        })

    } else {
        res.status(404).send();
    }
});

app.listen(PORT, () => {
    console.log(`Server up on port ${PORT}`);
});

module.exports = {
    app
};