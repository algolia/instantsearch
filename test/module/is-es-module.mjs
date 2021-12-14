/* eslint-disable import/extensions */
import assert from 'assert';

import instantsearch from '../../es/index.js';
import * as connectors from '../../es/connectors/index.js';
import * as helpers from '../../es/helpers/index.js';
import * as middlewares from '../../es/middlewares/index.js';
import * as widgets from '../../es/widgets/index.js';

assert.ok(instantsearch);
assert.ok(connectors);
assert.ok(helpers);
assert.ok(middlewares);
assert.ok(widgets);
