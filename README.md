# Pronto.js

Pronto is a Node.js library that allows you to declare a sequence of tasks.

## Airplane View

Pronto.js is a simple tool for executing a sequence of tasks. It looks declarative -- you create a list -- but in the background, Pronto takes full advantage of Node's event model. The result is that you can easily write very fast code.

There are only two things you need to know how to do:

### Declare a List of Tasks (or Commands)

Pronto provides a fluent interface for declaring your task list:

    pronto = require('pronto');
    
    pronto.register.request('hello')
      .doesCommand('print-hello')
      .whichInvokes(HelloCommand);

The above creates a new instance of the `pronto` toolkit and registers a single request.  

### Create a Task (or Command)

Creating a task is as simple as extending the base task prototype, implementing just a method or two:

    // Constructor
    function HelloCommand() {}

    // Inherit prototype
    util.inherits(HelloCommand, pronto.Command);

    // Override the execute() method.
    HelloCommand.prototype.execute = function(context, params) {
      console.log('Hello World');
      this.done();
    }

The above simply prints `Hello World` to the console.

## Development Status

Pronto is currently pre-release. We will add `npm` packages as soon as it stabilizes.

## Acknowledgements

* Tom Derykere coined the name for this module.
* Alex Daw and Sam Boyer provided input at the outset.
* Some of the patterns are derived from [Fortissimo](http://github.com/technosophos/Fortissimo).

This project was sponsored by [ConsumerSearch.com](http://www.consumersearch.com), part of the About.Com network, a New York Times company.

## License

Pronto.js is made available under an MIT-style license.