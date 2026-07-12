# JavaScript Interview Cheatsheet

## 1. Closures
A closure is a function that retains access to its outer scope even after the outer function has returned.

```js
function counter() {
  let count = 0;
  return function() { return ++count; };
}
const c = counter();
c(); // 1
c(); // 2
```

## 2. Promises & Async/Await
A Promise represents a value that may be available now, later, or never.

```js
const fetchData = () => new Promise((resolve) => {
  setTimeout(() => resolve('data'), 1000);
});

// async/await syntax
async function getData() {
  const result = await fetchData();
  console.log(result);
}
```

## 3. The `this` Keyword
`this` refers to the execution context. Its value depends on how a function is called:

| Call context       | `this` value               |
|--------------------|----------------------------|
| Global scope       | `window` / `globalThis`    |
| Object method      | The object                 |
| Arrow function     | Lexical scope (parent)     |
| Constructor (new)  | New instance               |
| `.call()` / `.apply()` | First argument        |

## 4. Prototypes & Inheritance
Every JS object has an internal `[[Prototype]]` link to another object.

```js
function Animal(name) { this.name = name; }
Animal.prototype.speak = function() {
  return `${this.name} makes a sound.`;
};

const dog = new Animal('Rex');
dog.speak(); // "Rex makes a sound."
```

Modern equivalent using `class`:

```js
class Animal {
  constructor(name) { this.name = name; }
  speak() { return `${this.name} makes a sound.`; }
}
```

## 5. Event Loop & Microtasks
JS runs a single-threaded event loop. Macrotasks (setTimeout, DOM events) and microtasks (Promise.then) are queued separately.

```
1. Execute current script (macrotask)
2. Process all microtasks (Promise callbacks)
3. Render (if needed)
4. Pick next macrotask
```

```js
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// Output: 1, 4, 3, 2
```

## 6. Hoisting
`var` declarations are hoisted and initialized as `undefined`. `let`/`const` are hoisted but not initialized (Temporal Dead Zone).

```js
console.log(a); // undefined (var hoisted)
var a = 5;

console.log(b); // ReferenceError: Cannot access before initialization
let b = 10;
```

## 7. Debouncing & Throttling
**Debounce**: Wait until a pause in calls. **Throttle**: Limit to one call per interval.

```js
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function throttle(fn, limit) {
  let inThrottle = false;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
```

## 8. Array Methods
| Method    | Returns          | Mutates? | Use case              |
|-----------|------------------|----------|-----------------------|
| map()     | New array        | No       | Transform elements    |
| filter()  | New array        | No       | Select matching items |
| reduce()  | Single value     | No       | Aggregate data        |
| forEach() | undefined        | No       | Side effects          |
| find()    | First match      | No       | Search                |
| some()    | Boolean          | No       | Any match?            |

## 9. Spread & Rest Operators
```js
// Spread — expand iterables
const arr = [1, 2, 3];
const copy = [...arr];        // [1, 2, 3]
const merged = [...arr, 4, 5]; // [1, 2, 3, 4, 5]

// Rest — collect remaining parameters
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}
```

## 10. Modules (ESM)
```js
// math.js
export const add = (a, b) => a + b;
export default class Calculator { /* ... */ }

// app.js
import Calculator, { add } from './math.js';
```

---

**MicroVenture Labs** — More resources at buymeacoffee.com/microventurelabs