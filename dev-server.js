require('babel-core/register');
var restfool = require('./src/index');
var faker = require('faker');

// create a new RESTfool server (along with the UI server)
var app = restfool.create({
  notify: true
});

// posts fixture factory
var postsFixture = restfool.fixture({
  title: faker.lorem.sentence,
  body: faker.lorem.paragraphs
});

// posts resource
app.use(restfool.resource({
  name: 'posts',
  seed: postsFixture.make(10, { published: true })
}));

// users fixture factory
var usersFixture = restfool.fixture({
  first_name: faker.name.firstName,
  last_name: faker.name.lastName,
  email: faker.internet.emal
});

// users resource
app.use(restfool.resource({
  name: 'users',
  seed: usersFixture.make(4)
}));

// start listening
app.listen(5602);
