[![Build Status](https://travis-ci.org/HelpfulHuman/Restfool.svg)](https://travis-ci.org/HelpfulHuman/Restfool)

RESTfool is largely just a set of higher order functions that produce middleware for mocking responses with assertions and fixture data.  These middleware also report request and response information to a RESTfool Dashboard instance for debugging and analysis of each made call.

## Getting Started

Install via npm:

```
npm install restfool
```

Create a `server.js` file and require restfool:

```javascript
var restfool = require('restfool')
```

## Starting a server

RESTfool requires an Express server to serve mocked routes and the dashboard.  You can choose to add the middleware yourself, but it's recommended to have RESTfool create and configure a server for you.

```javascript
var server = restfool.create()

server.get('/', function (req, res, next) {
  res.send('OK')
})

server.listen(4050)
```

## Fixture Data

RESTfool makes it easy to generate fake fixture data by using the `fixture()` method.  The `fixture()` methods accepts either an object literal containing, or a function that returns, the desired output schema.  When using the object literal method, you can pass in functions to generate values dynamically.

_Note: We're using the [faker](https://www.npmjs.com/package/faker) library below to quickly generate fake data._

```javascript
var faker = require('faker')

// object literal
var postFixture = restfool.fixture({

  title: faker.lorem.sentence,

  body: faker.lorem.paragraph,

})

// function
var userFixture = restfool.fixture(function () {
  return {

    name: faker.name.firstName() + ' '+ faker.name.lastName(),

    email: faker.internet.email()

  }
})
```

### Generating rows

Now that you've defined the schema for the data, you can output a single row by calling the `makeOne()` method or a defined number of rows using the `make()` method.

```javascript
var one = postFixture.makeOne()
// => { title: 'Lorem ipsum dolor', ... }

var many = postFixture.make(3)
// => [ {...}, {...}, {...} ]
```

You can override the results of custom values by passing an object or function in as a second argument.

```javascript
var active = userFixture.make(2, { active: true })
// => [ {name: '...', active: true}, {name: '...', active: true} ]

var noNicks = userFixture.make(10, function (user) {
  // return false to filter out records
  if (user.name.match(/^nic(k|holas) .*/i)) return false

  return user
})
```

### Generating middleware

You can also generate middleware quickly using the `send()` and `sendOne()` methods.  These methods function the same as their "make" counterparts but will send a 200 JSON response containing the data.

```javascript
server.get('/posts', postFixture.send(10, { published: true }))
```

## Mocking entire resources

You know what's even cooler than sending completely dynamic fixture data?  Mocking data persistence complete with scaffolded routes!

_Note: RESTfool simply stores the data in memory.  This means that the data will be lost once the server is closed._

```javascript
var uuid = require('uuid')

var posts = restfool.resource({
  // define the endpoint/resource name
  name: 'posts',

  // provide an initial set seed data
  seed: postFixture.make(10),

  // format the resource data on output
  format: function (data) {
    var req = this
    var output = { data: data }

    if (Array.isArray(data)) {
      data.page = req.query.page || 1
      data.results = data.length
    }

    return data;
  }

  // run this function when a post is made
  onCreate: function (post) {
    // if the primary key doesn't have a value then an auto-incrementing
    // index will be provided
    post.id = uuid.v1()

    return post
  }
})
```

The following events are supported: _create, update, save, delete_
