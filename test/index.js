import {expect} from 'chai';
import * as restfool from '../src/index';

describe('restfool', function () {

  it('contains the various factory functions', function () {
    expect(restfool).to.have.property('create').that.is.a('function');
    expect(restfool).to.have.property('resource').that.is.a('function');
    expect(restfool).to.have.property('fixture').that.is.a('function');
  });


});
