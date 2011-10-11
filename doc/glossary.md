# Glossary of Presto Terms

  Chain of Command (List of Tasks):
  
    Chain of Command is a design pattern wherein a particular request
    or operation is associated with one or more commands that are run
    in sequence. Each command is given its opportunity to operate on 
    the data (passed in the Context) before passing control to the 
    next command.
    
    Pronto uses CoC instead of MVC as its top-level pattern. Using a 
    Registry, application developers declare chains of commands. At
    request time, the Router maps a request to a chain of commands, and
    then executes the chain.

  Command:
  
    A command is a prototype object that contains the code to execute
    one unit of work. The unit should be small and focused. Heavy
    computations or IO should always be handled asynchronously.
    
    Commands are organized into chains of commands, and are executed
    in a command list.

  Command List:
  
    The Command List (commandlist) is responsible for running a chain 
    of commands. A command list is always managed by the router.
    
    The command list uses the Node.js event/emitter model to pass control
    from command to command as the chain is processed. Each command is
    created, executed, and then left to do its processing until it 
    triggers an event notifying the system that it is done. Then the
    next command in the chain is executed.

  Context:
  
    A Context keeps state information for a request. Each command that
    executes during a request can place data into or retrieve data from
    the context. Every request has ONE context. When a request is 
    executed from another request, it may inherit the context of the
    former.
    
    Contexts contain two types of data: state information (add()/get())
    and datasources. State information is intended to be used for passing
    pieces of data from command to command. Datasources provide access to
    data containers, such as databases, caches, or in-memory data structures.

  HTTPServer:
  
    Presto extends the Node.js HTTP server. The Presto version uses a 
    registry to build a new router, and then routes HTTP requests 
    accordingly.

  Registry:
  
    Links a request name to a chain of commands. This is basically a 
    configuration object.

  Resolver:
  
    Given some source of user input (e.g. a URL), looks up the URL to find out the
    appropriate request name. The router relies on the resolver for this service.

  Router:
  
    Given a request (or a request name), the router resolves a request name
    (using a resolver), gets the spec for how that request should be executed,
    and then begins the execution of that request.
  
  
