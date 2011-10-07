TODO:

Router:

- Add @route internal routes
- Add route parsing.

Registry:

- Inline func support: request('foo').executes(function (cxt, params) {}).using(...)
- Include support: request('foo').includes('otherRequest')

HTTPServer:

- Figure out a good unit testing solution
- Add POST data handling
- Add Cookie data handling