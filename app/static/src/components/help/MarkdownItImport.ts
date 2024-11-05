// This module exists to ease unit testing of MarkdownPanel, by allowing it to use a named import, rather than
// 'import *' which jest apparently cannot mock. Named import from markdown-it could be enabled via ts config switches
// esModuleInterop or allowSyntheticDefaultImports - however these result in obscure compilation failures of
// vue-test-utils tests.

import * as MarkdownIt from "markdown-it";

export default MarkdownIt;
