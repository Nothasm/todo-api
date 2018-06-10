require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const { mongoose, ObjectId } = require('./db/mongoose');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
var { Todo } = require('./models/todo');
var { User } = require('./models/user');
var { authenticate } = require('./middleware/authenticate');

var app = express();
const PORT = process.env.PORT;

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

app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);
    user.save().then((user) => {
       return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => res.status(400).send(e));

});

app.get('/users/me', authenticate, (req, res) => {
   res.send(req.user);
});

app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
    }).catch((e) => {
        res.status(400).send();
    });
});

app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }).catch((e) => {
        res.status(400).send();
    });
});

app.listen(PORT, () => {
    console.log(`Server up on port ${PORT}`);
});

module.exports = {
    app
};