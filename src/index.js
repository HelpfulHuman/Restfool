import {factory as createServer} from './factories/server';
import {factory as createFixture} from './factories/fixture';

export default {

  create: createServer,

  fixture: createFixture,

  resource: createResource,

}
