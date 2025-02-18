const status = require('./status')
const comm = require('./comm')
const routes = require('./routes')




class RoutesService {
    constructor() {
      this.routes = new Map();
      this.routes.set('status', status);
      this.routes.set('comm', comm)
      this.routes.set('routes', routes)
      


    }
    
  
    /**
     * Retrieve a service by name
     * @param {string} name - The name of the service to get
     * @param {function} callback - Callback function with error and service
     */
    get(name, callback) {
      callback = callback || function() {};
      
      if (this.routes.has(name)) {
        callback(null, this.routes.get(name));
      } else {
        callback(new Error(`Service ${name} not found`));
      }
    }
  
    /**
     * Add a new service to the routes or update an existing one
     * @param {Object} service - The service object to add
     * @param {string} name - The name to associate with the service
     * @param {function} callback - Callback function with error and the name of the service added
     */
    put(service, name, callback) {
      callback = callback || function() {};
      
      if (typeof service === 'object' && name) {
        this.routes.set(name, service);
        callback(null, name);
      } else {
        callback(new Error('Invalid service or name'));
      }
    }
  
    /**
     * Remove a service from the routes
     * @param {string} name - The name of the service to remove
     * @param {function} callback - Callback function with error and the name of the service removed
     */
    rem(name, callback) {
      callback = callback || function() {};
      
      if (this.routes.has(name)) {
        this.routes.delete(name);
        callback(null, name);
      } else {
        callback(new Error(`Service ${name} not found`));
      }
    }
  }

  // Create an instance of RoutesService


// Export the methods directly
module.exports = new RoutesService();