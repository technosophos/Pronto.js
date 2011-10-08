TODO:

Router:

- Add @route internal routes
- Add route parsing.

Registry:

- Inline func support: request('foo').executes(function (cxt, params) {}).using(...)
- Include support: request('foo').includes('otherRequest')

HTTPServer:

- Figure out a good unit testing solution
- Add Cookie data handling
- Add a path datasource

CLI:

- Add an args parser datasource

Context:

- Datasources: Refactor?
- Caches: Add a caching mechanism to context.

Commands:

- AddToContext
- RemoveFromContext
- Cookie encoding?