require('babel/register');
var restfool = require('./src/index');

var app = restfool.create({
  notify: true
});

app.get('/', function (req, res, next) {
  res.send('OK');
});

var faker = require('faker')


// posts fixture factory
var postFixture = restfool.fixture({
  title: faker.lorem.sentence,
  body: faker.lorem.paragraphs
})

var shortid = require('shortid')
var postsResource = restfool.resource({
  name: 'posts',
  seed: postFixture.make(10, {published:true}),
  onCreate: function (data) {
    data.id = shortid()
    return data
  }
})

app.use(postsResource)

app.listen(5602, function () {
  console.log('listening on port', 5602);
});
