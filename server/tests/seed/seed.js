const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const { Todo } =  require('./../../models/todo');
const { User } = require('./../../models/user');

const userOneId = new ObjectId();
const userTwoId = new ObjectId();

const users = [{
    _id: userOneId,
    email: 'test@gmail.com',
    password: 'userOnePass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
    }]
}, {
    _id: userTwoId,
    email: 'test@yahoo.com',
    password: 'userTwoPass'
}];
 
var todos = [
    {
        _id: new ObjectId,
        text: 'Primeiro todo'
    },
    {
        _id: new ObjectId,
        text: 'Segundo todo',
        completed: true,
        completedAt: 1500
    }
];

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        Todo.insertMany(todos).then(() => done());
    });
};

const populateUsers = (done => {
    User.remove({}).then(() => {
        let userOne = new User(users[0]).save();
        let userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo]);
    }).then(() => done());
});

module.exports = {
    todos,
    populateTodos,
    users,
    populateUsers
};