module.exports = URIRequestResolver;

function URIRequestResolver (){
	this.tree = {};
}

URIRequestResolver.prototype.resolve = function(path) {
	
}

/**
 * Build a request URI Tree.
 *
 * This can be intensive, and should be done as rarely as
 * possible, since it is synchronous.
 */
URIRequestResolver.prototype.buildTree = function(registry) {
	var requests = registry.getAllRequests();

	// We are going to cheat.
	var keys = Object.keys(requests);
	for(var i = 0; i < keys.length; ++i) {
		var name = keys[i];
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
	else if(names.length == 0) {
		throw new Error('Path already exists: ' + pathString);
	}
	
	this.insertTreeEntry(names, node[name], pathString);
}