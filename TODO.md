TODO:

Router:

- Add @route internal routes (taint mode)

Registry:

- Inline func support: request('foo').executes(function (cxt, params) {}).using(...)
- Include support: request('foo').includes('otherRequest')

HTTPServer:

- Figure out a good unit testing solution
- Add Cookie data handling

CLI:

- Add an args parser datasource

Context:

- Caches: Add a caching mechanism to context.

Commands:

- AddToContext
- RemoveFromContext
- Cookie encoding?

CommandList:

- Needs to be rebuilt as a Generator.

