const expect = require('expect');
const request = require('supertest');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { ObjectId } = require('mongodb');

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

describe('DELETE /todos/:id', () => {
    let testID = new ObjectId().toHexString();
    it('should delete a todo by passing an id', (done) => {
        request(app)
            .delete('/todos/' + todos[0]._id.toHexString())
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(todos[0]._id.toHexString());
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                }
                
                Todo.findById(todos[0]._id.toHexString()).then((res)=> {
                    expect(res).toNotExist();
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should return 404 on invalid id', (done) => {
        request(app)
            .delete('/todos/' + testID + 'abc123')
            .expect(404)
            .end(done);
    });

    it('should return 404 on ID not found', (done) => {
        request(app)
            .delete('/todos/' + testID)
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it('should update the todo', (done) => {
        let id = todos[0]._id.toHexString();
        request(app)
            .patch(`/todos/${id}`)
            .send({ text: 'Ok', completed: true })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe('Ok');
                expect(res.body.completed).toBe(true);
                expect(res.body.completedAt).toBeA('number');
            })
            .end(done);
    });

    it('should clear completedAt when todo is not completed', (done) => {
        let id = todos[1]._id.toHexString();
        request(app)
            .patch(`/todos/${id}`)
            .send({ text: 'OkiDoki', completed: false })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe('OkiDoki');
                expect(res.body.completed).toBe(false);
                expect(res.body.completedAt).toNotExist();
            })
            .end(done);
    })
});