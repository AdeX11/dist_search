const fs = require('fs');
const repl = require('repl');

class NativeObjectRegistry {
    constructor() {
        this.nativeMap = new Map();
        this.discoverNativeObjects();
    }

    discoverNativeObjects() {
        const stack = [
            { obj: global, path: 'global' },
            ...repl._builtinLibs.map(libName => ({ obj: require(libName), path: libName }))
        ];
        const visited = new Set();  // Keep track of visited objects

        while (stack.length > 0) {
            const { obj, path } = stack.pop();
            if (obj === null || typeof obj !== 'object') continue;
            if (visited.has(obj)) continue;  // Skip if we've already visited this object

            visited.add(obj);  // Mark this object as visited

            for (let key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    let currentPath = path ? `${path}.${key}` : key;
                    let value = obj[key];

                    if (typeof value === 'function') {
                        if (value.toString().includes('[native code]')) {
                            this.nativeMap.set(value, currentPath);
                        }
                    } else if (typeof value === 'object') {
                        stack.push({ obj: value, path: currentPath });
                    }
                }
            }
        }
    }

    isNative(obj) {
        return this.nativeMap.has(obj);
    }

    getNativeId(obj) {
        return this.nativeMap.get(obj);
    }

    getNativeObjectById(id) {
        try {
            // Use parentheses to immediately invoke the returned function
            return new Function(`return ${id};`)();
        } catch (e) {
            throw new Error(`Failed to deserialize native object with id ${id}: ${e.message}`);
        }
    }
}

class Serializer {
    constructor() {
        this.nativeRegistry = new NativeObjectRegistry();
    }

    serialize(object) {
        const seen = new Map();
        const serialized = this._serialize(object, seen);
        return JSON.stringify(serialized)// Convert to JSON string
      }

      _serialize(obj, seen) {
        if (obj === undefined) {
          return { type: 'Undefined' }; // Handle undefined explicitly
        }
        if (obj === null) {
          return { type: 'Null' }; // Handle null explicitly
        }
      
        const type = typeof obj;
        switch (type) {
          case 'boolean':
            return { type: 'Boolean', value: obj.toString() }; // Convert boolean to string
          case 'number':
            let value = obj.toString();
            if (Number.isNaN(obj)) value = 'NaN';
            else if (obj === Infinity) value = 'Infinity';
            else if (obj === -Infinity) value = '-Infinity';
            return { type: 'Number', value }; // Convert number to string
          case 'string':
            return { type: 'String', value: obj }; // Handle strings
          case 'function':
            const nativeId = this.nativeRegistry.getNativeId(obj);
            if (nativeId) {
              return { type: 'Native', id: nativeId, name: obj.name || 'anonymous' }; // Handle native functions
            }
            if (this.nativeRegistry.isNative(obj)) {
              throw new Error("Native function not supported"); // Reject unsupported native functions
            }
            return { type: 'Function', value: obj.toString(), name: obj.name || 'anonymous' }; // Handle regular functions
          case 'object':
            if (seen.has(obj)) {
              return { type: 'Ref', id: seen.get(obj) }; // Handle circular references
            }
            const id = seen.size + 1;
            seen.set(obj, id);
      
            if (Array.isArray(obj)) {
              return { type: 'Array', value: obj.map(item => this._serialize(item, seen)), id }; // Handle arrays
            }
      
            const objType = Object.prototype.toString.call(obj);
            switch (objType) {
              case '[object Date]':
                return { type: 'Date', value: obj.toISOString(), id }; // Handle Date objects
              case '[object Error]':
                return {
                  type: 'Error',
                  value: this._serialize({
                    message: obj.message,
                    stack: obj.stack,
                    name: obj.name,
                  }, seen),
                  id,
                }; // Handle Error objects
              case '[object Object]':
                const value = {};
                for (let key in obj) {
                  if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    value[key] = this._serialize(obj[key], seen); // Recursively serialize object properties
                  }
                }
                return { type: 'Object', value, id }; // Handle plain objects
              default:
                throw new Error(`Unsupported object type: ${objType}`); // Reject unsupported object types
            }
          default:
            throw new Error(`Unsupported type: ${type}`); // Reject unsupported types
        }
      }
}
class Deserializer {
    static parseNumber(value) {
        switch (value) {
            case 'NaN': return NaN;
            case 'Infinity': return Infinity;
            case '-Infinity': return -Infinity;
            default: return parseFloat(value);
        }
    }

    static evalFunction(value, name) {
        try {
            // Check if it's a built-in constructor (like Object, Array)
            if (['Object', 'Array'].includes(name)) {
                return global[name];
            }
            // For standard functions
            return new Function(`return (${value});`)();
        } catch (e) {
            throw new Error(`Failed to deserialize function: ${e.message}`);
        }
    }

    static deserialize(serializedString) {
        const serialized = JSON.parse(serializedString);
        return this._deserialize(serialized, new Map());
    }

    static _deserialize(serialized, refs) {
        if (!serialized || typeof serialized !== 'object') {
            console.log("type:", typeof serialized)
            //throw new Error("Invalid serialized input");
        }
        console.log(serialized)
        
        switch (serialized.type) {
          case 'Undefined':
            return undefined; // Handle undefined
          case 'Null':
            return null; // Handle null
          case 'Boolean':
            return serialized.value === 'true'; // Convert string back to boolean
          case 'Number':
            return Deserializer.parseNumber(serialized.value); // Convert string back to number
          case 'String':
            return serialized.value; // Return string as-is
          case 'Function':
            return Deserializer.evalFunction(serialized.value, serialized.name); // Reconstruct function
          case 'Array':
            const arr = [];
            if (serialized.id !== undefined) refs.set(serialized.id, arr);
            serialized.value.forEach(el => arr.push(Deserializer._deserialize(el, refs)));
            return arr; // Reconstruct array
          case 'Date':
            const date = new Date(serialized.value);
            if (serialized.id !== undefined) refs.set(serialized.id, date);
            return date; // Reconstruct Date object
          case 'Error':
            const errorValue = Deserializer._deserialize(serialized.value, refs);
            const error = new Error(errorValue.message);
            error.stack = errorValue.stack;
            error.name = errorValue.name;
            if (serialized.id !== undefined) refs.set(serialized.id, error);
            return error; // Reconstruct Error object
          case 'Object':
            const obj = {};
            if (serialized.id !== undefined) refs.set(serialized.id, obj);
            for (let key in serialized.value) {
              obj[key] = Deserializer._deserialize(serialized.value[key], refs);
            }
            return obj; // Reconstruct plain object
          case 'Ref':
            return refs.get(serialized.id); // Handle circular references
          case 'Native':
            return Deserializer.deserializeNative(serialized); // Reconstruct native functions
          default:
            throw new SyntaxError(`Unknown type: ${typeof serialized.type}`); // Reject unknown types
        }
      }
    static deserializeNative(serialized) {
        const nativeRegistry = new NativeObjectRegistry();
        const nativeFunc = nativeRegistry.getNativeObjectById(serialized.id);
        
        if (nativeFunc && nativeFunc.name !== serialized.name) {
            throw new Error(`Mismatch in deserialized native function: expected ${serialized.name}, got ${nativeFunc.name}`);
        }
        
        return nativeFunc;
    }
}

function serialize(object) {
    const serializer = new Serializer();
    return serializer.serialize(object);
}

function deserialize(serialized) {
    return Deserializer.deserialize(serialized);
}

module.exports = {
    serialize: serialize,
    deserialize: deserialize
};