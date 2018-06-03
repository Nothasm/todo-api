const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {ObjectId} = require('mongodb');

var todos = [
    {
        _id: new ObjectId,
        text: "Primeiro todo"
    },
    {
        _id: new ObjectId,
        text: "Segundo todo"
    }
];

beforeEach((done) => {
    Todo.remove({}).then(() => {
        Todo.insertMany(todos).then(() => done());
    });
});

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text';
        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.find({ text: 'Test todo text'}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                })
                .catch((e) => done(e));
            });
    });

    it('should not create a invalid todo', (done) => {
        request(app)
            .post('/todos')
            .send({text: ''})
            .expect(400)
            .end((err, res) => {
                if (err)
                    return done(err);

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                })
                .catch((e) => done(e));
            })
    });
});

describe('GET /todos', () => {
    it('should return all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.status).toBe('OK');
                expect(res.body.results.length).toBe(2);
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {
    let testID = new ObjectId().toHexString();
    it('should return a todo by passing an id', (done) => {
        request(app)
            .get('/todos/' + todos[0]._id.toHexString())
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should return 404 on invalid id', (done) => {
        request(app)
            .get('/todos/' + testID + 'abc123')
            .expect(404)
            .end(done);
    });

    it('should return 404 on ID not found', (done) => {
        request(app)
            .get('/todos/' + testID)
            .expect(404)
            .end(done);
    });
});