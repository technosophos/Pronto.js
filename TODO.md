TODO:

CommandList:

- Needs to be rebuilt as a Generator.

Router:

- Add @route internal routes

Registry:

- Inline func support: request('foo').executes(function (cxt, params) {}).using(...)
- Include support: request('foo').includes('otherRequest')

HTTPServer:

- FIXME: Need to convert cxt.request/cxt.response to datasources.
- Figure out a good unit testing solution
- Add Cookie data handling

CLI:

- Add an args parser datasource

Context:

- Datasources: Refactor?
- Caches: Add a caching mechanism to context.

Commands:

- AddToContext
- RemoveFromContext
- Cookie encoding?