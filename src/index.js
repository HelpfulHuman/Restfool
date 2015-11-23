import {factory as createServer} from './factories/server';
import {factory as createFixture} from './factories/fixture';
import {factory as createResource} from './factories/resource';

export default {

  create: createServer,

  fixture: createFixture,

  resource: createResource,

}
