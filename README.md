# Pronto.js

Pronto is a Node.js library for building very fast applications. Create a request, assign it a list of commands to execute, and then run it.

Pronto is a great fit for:

* Web apps
* JSON servers
* Configurable command-line tools

[Documentation](https://github.com/technosophos/Pronto.js/wiki)

## Airplane View

Pronto.js is a simple tool for executing a sequence of tasks. It looks declarative -- you create a list -- but in the background, Pronto takes full advantage of Node's event model. The result is that you can easily write very fast code.

Pronto encourages you to do the following:

* Break your program into a sequence of tasks.
* Focus on writing concise and fast tasks.
* Use tasks like building blocks, assembling new tools by combining tasks.

And while you focus on building small parts and chaining them together, Pronto handles the "eventing", feeding the application to Node as a fully evented sequence. This allows Node to execute your application at full speed -- even under load.

You can take a look at a sample Pronto project here:
[https://github.com/technosophos/pronto-example](https://github.com/technosophos/pronto-example)

## Getting Started

There are only two things you need to know how to do:

* Build chains of commands (lists of tasks)
* Build your own command

### Building a Chain of Commands

Pronto works by taking a request from the client and responding by executing a list of tasks. Building a Pronto application is basically a process of assembling chains of commands.

Pronto provides a fluent interface for declaring your task list. Here is a simple example:

```javascript
    var register = new pronto.Registry();
    register.route('hello')
      .doesCommand(HelloCommand, 'print-hello');
```

The above registers a single request (`hello`). Executing the `hello` request will execute the task `HelloCommand`, named `print-hello`.

More often than not, a request executes multiple commands in a row, systematically assembling data and returning it only at the end. For example, a simple search engine request might look like this:

```javascript
    register.route('search')
      .does(InitializeSearchService, 'initialization')
      .does(QueryRemoteSearchService, 'do-search')
        .uses('query').from('get:q')
      .does(SearchTheme, 'format-search-results')
        .uses('searchResults').from('cxt:do-search')
    ;
```

The example above declares a request with three commands: `initialization`, `do-search`, and `format-search-results`. In this hypothetical request, we have broken down the task of searching into three steps.

  * initialization: This step might setup the connection with a remote server.
  * do-search: Execute a query on a remote service. Note that `from('get:q')` indicates that the query parameter is retrieved from the `query` GET variable.
  * format-search-results: Taking the response from `do-search` (again: `from('cxt:do-search')`), pass that through a theming system.

While the above is fictional, it illustrates how a chain of commands is assembled.

### Create a Task (or Command)

Along with creating a chain of commands, you may also need to write some custom commands. Commands are small single-purpose units of code.

Creating a command is as simple as extending the base task prototype, implementing just a method or two. Here is an example command that, when executed, prints `Hello World`. There are three things to note about the example below:

* It begins with a constructor.
* It inherits the properties of pronto's `Command` prototype.
* It implements the `execute()` method.

When Pronto encounters this command in a chain, it will run the the command's `execute()` method.

```javascript
    // Constructor
    function HelloCommand() {}

    // Inherit prototype
    util.inherits(HelloCommand, pronto.Command);

    // Override the execute() method.
    HelloCommand.prototype.execute = function(context, params) {
      console.log('Hello World');
      this.done();
    }
```

The above simply prints `Hello World` to the console.

## Development Status

While we're pre-1.0, the Pronto project is fairly stable, now, and has
NPM packages.

## Acknowledgements

* Tom Deryckere coined the name for this package.
* Alex Daw and Sam Boyer provided input at the outset.
* Some of the patterns are derived from [Fortissimo](http://github.com/technosophos/Fortissimo).
* Huge thanks to [ConsumerSearch.com](http://consumersearch.com) for
  continued work.

This project was sponsored by [ConsumerSearch.com](http://www.consumersearch.com), part of the About.Com network, a New York Times company.

## Related Packages

* [Pronto-MongoDB](https://github.com/technosophos/Pronto-MongoDB): MongoDB commands for Pronto.

## License

Pronto.js is made available under an MIT-style license.
