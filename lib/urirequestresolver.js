module.exports = URIRequestResolver;

function URIRequestResolver (){
  this.tree = {};
}

URIRequestResolver.prototype.init = function (registry) {
  this.tree = {};
  this.buildTree(registry);
}

URIRequestResolver.prototype.resolve = function(path) {
  var parts = path.split('/');  
  return this._resolve(parts, this.tree, []);
}

URIRequestResolver.prototype._resolve = function(names, node, buffer) {

  var subdirMatch = undefined;

  if (names.length == 0) {
    // Yay!
    return buffer.join('/');
  }
  
  var name = names.shift();
  
  // If the name isn't in the map, see if there is a 
  // wildcard.
  if (node[name] == undefined) {
    if (node['*'] == undefined) {
      // No wildcard. Return NULL.
      return undefined;
    }
    // Wildcard
    buffer.push('*');
    name = '*';
  }
  else {
    buffer.push(name);
  }
  return this._resolve(names, node[name], buffer) || subdirMatch;
}

/**
 * Build a request URI Tree.
 *
 * This can be intensive, and should be done as rarely as
 * possible, since it is synchronous.
 *
 * Note that this does not destroy the existing registry, so it
 * can safely be used to update an existing registry.
 */
URIRequestResolver.prototype.buildTree = function(registry) {
  var requests = registry.getAllRequests();
  var keys = Object.keys(requests);
  
  for(var i = 0; i < keys.length; ++i) {
    var name = keys[i];
    
    // Note that on absolute URIs, this will return an empty ("") result first.
    // For our purposes, that is okay, because /a/b/c is different than a/b/c and
    // @a/b/c
    var parts = name.split('/');
    
    this.insertTreeEntry(parts, this.tree, name);
  }
}

URIRequestResolver.prototype.insertTreeEntry = function(names, node, pathString) {
  
  if (names.length == 0) {
    return;
  }
  
  var name = names.shift();
  
  if (node[name] == undefined) {
    node[name] = {};
  }
  // It's not clear that this is actually an error condition.
  // else if(names.length == 0) {
  //  throw new Error('Path already exists: ' + pathString);
  // }
  
  return this.insertTreeEntry(names, node[name], pathString);
}
