/**
 * The CommandList prototype.
 *
 * A command queue holds a queue of commands, which it gets from
 * Presto. It will execute these asynchronously, but in sequence.
 */

module.exports = CommandList; 

function CommandList(config) {
  this.config = config;
  this.position = 0;
  this.commands = [];
}

// Run the entire queue.
CommandList.prototype.run = function(context, request) {
  // Get the request from the config
  if (this.config.requests[request] == undefined) {
    // WE have an error!
    console.log('No such request: ' + request);
    return context;
  }
  this.context = context;
  this.commands = this.config.requests[request];
  this.execCurrent();
}

// Iterate the position counter.
CommandList.prototype.next = function() {
  this.position++;
}

// Get the current queue item. (This doesn't pop yet.)
CommandList.prototype.current = function() {
  return this.commands[this.position];
}

// Find out if there are more in the queue
CommandList.prototype.hasNext = function() {
  return this.position + 1 < this.commands.length;
}

// execute the current command, and have it execute
// subsequent commands.
CommandList.prototype.execCurrent = function() {
  // Run the current command
  cmd = new this.commands[this.position]();
  
  // Wait for it to say it's done
  // When it says it's done, let the queue continue.
  var cqueue = this;
  cmd.on('continue', function(data) {cqueue.execNext(data);});
  
  // Execute the actual command.
  cmd.execute(this.context, {id: 'cmd-' + this.position});
  
}

// Execute the next command on the queue.
CommandList.prototype.execNext = function(data) {
  //console.log('exec next with index ' . this.position);
  console.log('answering continue');
  //console.log(this); return;
  if (this.hasNext()) {
    this.next();
    this.execCurrent();
  }
}