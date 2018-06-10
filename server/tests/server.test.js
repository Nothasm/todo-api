const expect = require('expect');
const request = require('supertest');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');
const { ObjectId } = require('mongodb');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');


beforeEach(populateTodos);
beforeEach(populateUsers);

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
    });
});

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    });
    it('should return 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});

describe('POST /users', () => {
    it('should create a user', (done) => {
        let email = 'example@gmail.com';
        let password = "123example";

        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist();
                expect(res.body._id).toExist();
                expect(res.body.email).toBe(email);
            })
            .end((err) => {
                if (err) {
                    return done(err);
                }

                User.findOne({email}).then((user) => {
                    expect(user).toExist();
                    expect(user.password).toNotBe(password);
                    done();
                }).catch((e) => done(e));
            });

    });

    it('should return validation errors if request invalid', (done) => {
        request(app)
            .post('/users')
            .send({email: 'blabla@blabla' , password: '123'})
            .expect(400)
            .end(done);
    });

    it('should not create user if email in use', (done) => {
        let email = users[0].email;
        let password = '1234567';
        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .end(done);
    });
});

describe('POST /users/login', () =>{
    it('should login user and return auth token', (done) => {
        let email = users[1].email;
        let password =  users[1].password;
        let id =  users[1]._id;
        request(app)
            .post('/users/login')
            .send({
                email,
                password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist();
            })
            .end((err, res) => {
                if (err)
                    return done(err);
                User.findById(id).then((user) => {
                    expect(user.tokens[0]).toInclude({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should reject invalid login', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password + '1'
            })
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth']).toNotExist();
            })
            .end((err, res) => {
                if (err)
                    return done(err);
                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch((e) => done(e));
            });
    });
}); 

describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', (done) => {
        request(app)
            .delete('/users/me/token')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .end((err, res) => {
                if (err)
                    return done(err);

                User.findById(users[0]._id).then((user) => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch((e) => done(e));
            });
    });
});