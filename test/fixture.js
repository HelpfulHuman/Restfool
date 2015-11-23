import {expect} from 'chai';
import * as fixture from '../src/factories/fixture';

describe('fixture', function () {

  describe('runNestedFunctions()', function () {

    it('doesnt affect pure-value objects', function () {
      let input  = { a: 1, b: { c: 2 } };
      let result = fixture.runNestedFunctions(input);
      expect(result).to.deep.equal(input);
    });

    it('runs functions and adds their results to the array on shallow objects', function () {
      let result = fixture.runNestedFunctions({
        a: function () {
          return 55;
        }
      });
      expect(result).to.deep.equal({ a: 55 });
    });

    it('runs functions and adds their results to the array on nested objects', function () {
      let result = fixture.runNestedFunctions({
        a: {
          b: {
            c: function () {
              return 100;
            }
          }
        }
      });
      expect(result).to.deep.equal({ a: { b: { c: 100 } } });
    });

  });

  describe('makeRow()', function () {

    it('creates a single row when only the schema is provided', function () {
      let result = fixture.makeRow({ foo: 'bar' });
      expect(result).to.deep.equal({ foo: 'bar' });
    });

    it('creates a single row using the schema and modifier objects', function () {
      let result = fixture.makeRow({ a: 1 }, { b: 2 });
      expect(result).to.deep.equal({ a: 1, b: 2 });
    })

    it('passes the given schema to the modifier function and returns the result', function () {
      let modifier = function (data) {
        data.b = 5;
        return data;
      }

      let result   = fixture.makeRow({ a: 4, b: 0 }, modifier);
      expect(result).to.deep.equal({ a: 4, b: 5 });
    });

  });

  describe('factory()', function () {

    it('throws an error if anything other than an oject or function is provided for the schema', function () {
      expect(function () {
        let testFixture = fixture.factory([1,2,3,4]);
      }).to.throw('You must pass either an object or a function!');
    });

    it('creates a new instance with make() and makeOne() using a schema object', function () {
      let testFixture = fixture.factory({ a: 1, b: 2});
      expect(testFixture).to.have.property('make').that.is.a('function');
      expect(testFixture).to.have.property('makeOne').that.is.a('function');
    });

    it('creates a new instance with make() and makeOne() using a schema function', function () {
      let testFixture = fixture.factory(function () {
        return { a: 1, b: 2};
      });
      expect(testFixture).to.have.property('make').that.is.a('function');
      expect(testFixture).to.have.property('makeOne').that.is.a('function');
    });

  });

  describe('instance#makeOne()', function () {

    it('creates a single record using a schema object', function () {
      let testFixture = fixture.factory({ a: 1, b: 2 });
      let result = testFixture.makeOne();
      expect(result).to.deep.equal({ a: 1, b: 2 });
    });

    it('creates a single record using a schema function', function () {
      let testFixture = fixture.factory(function () {
        return { a: 1, b: 2 };
      });
      let result = testFixture.makeOne();
      expect(result).to.deep.equal({ a: 1, b: 2 });
    });

    it('creates a single record and allows generated schema to be overriden by a modifier object', function () {
      let testFixture = fixture.factory({ a: 1, b: 2 });
      let result = testFixture.makeOne({ b: 57 });
      expect(result).to.deep.equal({ a: 1, b: 57 });
    });

    it('creates a single record and allows generated schema to be overriden by a modifier function', function () {
      let testFixture = fixture.factory({ a: 1, b: 2 });
      let result = testFixture.makeOne(function (data) {
        data.b = data.b * 2;
        return data;
      });
      expect(result).to.deep.equal({ a: 1, b: 4 });
    });

  });

  describe('instance#make()', function () {

    let testFixture;

    beforeEach(function () {
      testFixture = fixture.factory({ a: 1, b: 2 });
    });

    it('creates an array of containing the requested number of records', function () {
      let result = testFixture.make(10);
      expect(result).to.be.an('array');
      expect(result.length).to.equal(10);
    });

    it('creates an array with each record having the modifier object applied', function () {
      let result = testFixture.make(3, { a: 100 });
      expect(result[0]).to.deep.equal({ a: 100, b: 2 });
      expect(result[1]).to.deep.equal({ a: 100, b: 2 });
      expect(result[2]).to.deep.equal({ a: 100, b: 2 });
    });

    it('creates an array with each record having the results of the modifier function applied', function () {
      let modifierCount = 0;
      let result = testFixture.make(3, function (data) {
        modifierCount++;
        data.b = modifierCount;
        return data;
      });
      expect(modifierCount).to.equal(3);
      expect(result[0]).to.deep.equal({ a: 1, b: 1 });
      expect(result[1]).to.deep.equal({ a: 1, b: 2 });
      expect(result[2]).to.deep.equal({ a: 1, b: 3 });
    });

  });

});
