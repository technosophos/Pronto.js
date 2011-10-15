TODO:

BUGS:

- The path resolver for CommandList.constructCommand is not working.
- In some cases, an 'error' event may come back 'Error: undefined' and hang the router.

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

- When a command emits an interrupt, the commandList should stop processing.

