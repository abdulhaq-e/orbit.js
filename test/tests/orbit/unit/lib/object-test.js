import { Class, clone, defineClass, expose, extend, extendClass, isArray, isNone } from 'orbit/lib/objects';

module("Orbit - Lib - Object", {
});

test("`clone` creates a deep clone of an object's own properties", function() {
  var obj = {
    a: 1,
    b: '2',
    c: ['3', {d: '4', e: ['5', '6']}, 7],
    f: new Date(),
    g: /123/g
  };

  var copy = clone(obj);

  deepEqual(obj, copy, 'clone is deeply equal to original');
  notStrictEqual(obj, copy, 'clone is not strictly equal to original');
});

test("`expose` can expose all the properties and methods from one object on another", function() {
  var earth = {
    name: 'earth',
    age: 4.5,
    greeting: function() {
      return 'hi from ' + this.name;
    }
  };

  var blank = {
    age: 0
  };

  expose(blank, earth);

  equal(blank.name, earth.name, 'name matches');
  equal(blank.age, earth.age, 'age matches');
  equal(blank.greeting(), earth.greeting(), 'greeting matches');

  blank.name = 'blank';
  equal(blank.greeting(), 'hi from earth', 'functions are evaluated with original context');
});

test("`expose` can expose specific properties and methods from one object on another", function() {
  var earth = {
    name: 'earth',
    age: 4.5,
    greeting: function() {
      return 'hi from ' + this.name;
    }
  };

  var blank = {
    name: 'blank',
    age: 0
  };

  expose(blank, earth, 'age', 'greeting');

  equal(blank.name, 'blank', 'name has not changed');
  equal(blank.age, earth.age, 'age matches');
  equal(blank.greeting(), earth.greeting(), 'greeting matches');

  blank.name = 'blank';
  equal(blank.greeting(), 'hi from earth', 'functions are evaluated with original context');
});

test("`extend` can copy all the properties and methods from one object to another", function() {
  var blank = {
    age: 0
  };

  var earth = {
    name: 'earth',
    age: 4.5,
    greeting: function() {
      return 'hi from ' + this.name;
    }
  };

  extend(blank, earth);

  equal(blank.name, earth.name, 'name matches');
  equal(blank.age, earth.age, 'age matches');
  equal(blank.greeting(), earth.greeting(), 'greeting matches');

  blank.name = 'blank';
  equal(blank.greeting(), 'hi from blank', 'functions are evaluated with the destination context');
});

test("`extend` can copy all the properties and methods from multiple objects to another", function() {
  var blank = {
    age: 0
  };

  var earth = {
    name: 'earth',
    greeting: function() {
      return 'hi from ' + this.name;
    },
    hasPeople: true
  };

  var jupiter = {
    name: 'jupiter',
    age: 5
  };

  extend(blank, earth, jupiter);

  equal(blank.name, 'jupiter', 'name came from jupiter');
  equal(blank.age, 5, 'age came from jupiter');
  equal(blank.hasPeople, true, 'hasPeople came from earth, and was not overridden');
  equal(blank.greeting(), 'hi from jupiter', 'greeting came from earth but was evaluated in destination context');
});

test("`defineClass` can create a new base class which can create objects", function() {
  var Planet = defineClass();
  ok(Planet);

  var earth = new Planet();
  ok(earth instanceof Object);
  ok(earth instanceof Planet);
});

test("`defineClass` can create a subclass which can create objects", function() {
  var CelestialObject = defineClass();
  var Planet = defineClass(CelestialObject);
  ok(Planet);

  var earth = new Planet();
  ok(earth instanceof Object);
  ok(earth instanceof CelestialObject);
  ok(earth instanceof Planet);
});

test("`defineClass` can create a new base class with properties and methods", function() {
  var Planet = defineClass(null, {
    name: 'TBD',
    greeting: function() {
      return 'hello from ' + this.name;
    }
  });

  var earth = new Planet();
  equal(earth.name, 'TBD', 'property comes from class prototype');
  equal(earth.greeting(), 'hello from TBD', 'functions come from class prototype');

  earth.name = 'earth';
  equal(earth.greeting(), 'hello from earth', 'functions are evaluated in proper context');
});

test("`defineClass` can create a new subclass with properties and methods", function() {
  var CelestialObject = defineClass(null, {
    name: 'TBD',
    greeting: function() {
      return 'hello from ' + this.name;
    }
  });
  var Planet = defineClass(CelestialObject, {
    greeting: function() {
      return this._super() + '!';
    }
  }, {
    isPlanet: true
  });

  var earth = new Planet();
  equal(earth.name, 'TBD', 'property comes from superclass');
  equal(earth.greeting(), 'hello from TBD!', 'functions come from class prototype');
  equal(earth.isPlanet, true, 'property comes from mixin');

  earth.name = 'earth';
  equal(earth.greeting(), 'hello from earth!', 'functions are evaluated in proper context');
});

test("`extendClass` makes _super accessible within overridden methods", function() {
  var Planet = defineClass(null, {
    name: 'TBD',
    greeting: function() {
      return 'hello from ' + this.name;
    }
  });
  extendClass(Planet.prototype, {
    greeting: function() {
      return this._super() + '!';
    }
  }, {
    isPlanet: true
  });

  var earth = new Planet();
  equal(earth.name, 'TBD', 'property comes from superclass');
  equal(earth.greeting(), 'hello from TBD!', 'functions can access _super');
  equal(earth.isPlanet, true, 'property comes from mixin');

  earth.name = 'earth';
  equal(earth.greeting(), 'hello from earth!', 'functions are evaluated in proper context');
});

test("`Class` can be extended to easily define and subclass classes", function() {
  var CelestialObject = Class.extend({
    name: 'TBD',
    init: function() {
      this._super();
      this.isCelestialObject = true;
    },
    greeting: function() {
      return 'hello from ' + this.name;
    }
  });
  var Planet = CelestialObject.extend({
    init: function() {
      this._super();
      this.isPlanet = true;
    }
  }, {
    greeting: function() {
      return this._super() + '!';
    },
  });

  var earth = new Planet();

  ok(earth instanceof Object);
  ok(earth instanceof Class);
  ok(earth instanceof CelestialObject);
  ok(earth instanceof Planet);

  equal(earth.name, 'TBD', 'property comes from superclass');
  equal(earth.greeting(), 'hello from TBD!', 'functions come from class prototype');
  equal(earth.isCelestialObject, true, 'property comes from CelestialObject.init');
  equal(earth.isPlanet, true, 'property comes from Planet.init');

  earth.name = 'earth';
  equal(earth.greeting(), 'hello from earth!', 'functions are evaluated in proper context');
});

test("`isArray` checks whether an object is an array", function() {
  var obj = {length: 1};

  var arr = [];

  equal(isArray(obj), false, 'Fake array is not an array');

  equal(isArray(arr), true, 'Array can be identified');
});

test("`isNone` checks whether an object is `null` or `undefined`", function() {
  equal(isNone({}), false, 'Object is not null or undefined');
  equal(isNone(null), true, 'isNone identifies null');
  equal(isNone(undefined), true, 'isNone identifies undefined');
});