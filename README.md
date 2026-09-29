# obix-binding-adapter

> Previous name: `@obinexusltd/obix-binding-adapter` — OBIX packages are named without an npm scope since decision D-102 (2026-09-29); the package, its version and its exports are unchanged.

The Data-Oriented Programming (DOP) paradigm translation layer for OBIX. This package enables seamless conversion between programming paradigms: data-oriented ↔ functional ↔ OOP ↔ reactive.

## Overview

The OBIX Adapter pattern solves a fundamental problem in modern software: different teams, libraries, and frameworks prefer different programming paradigms. The DP Adapter enables a single component definition to work across all these paradigms without duplication or loss of functionality.

### Paradigm Support

- **Data-Oriented (DO)**: Pure data representation as the canonical source
- **Functional (FP)**: Closure-based stateful functions
- **Object-Oriented (OOP)**: Class-based components with bound methods
- **Reactive (RX)**: Observable pattern with subscriptions and notifications

## Installation

```bash
npm install obix-binding-adapter
```

## Quick Start

```typescript
import { DOPAdapter, Paradigm } from "obix-binding-adapter";

// 1. Define your component in data-oriented form
const counterLogic = {
  name: "Counter",
  state: { count: 0 },
  actions: {
    increment: ({ state }) => {
      state.count += 1;
    },
    decrement: ({ state }) => {
      state.count -= 1;
    },
  },
  render: ({ state }) => ({
    text: `Count: ${state.count}`,
    value: state.count,
  }),
};

// 2. Create an adapter
const adapter = new DOPAdapter(counterLogic);

// 3. Transform to any paradigm

// Functional
const FunctionalComponent = adapter.toFunctional();
const result = FunctionalComponent(); // { text: "Count: 0", value: 0 }

// OOP
const OOPClass = adapter.toOOP();
const instance = new OOPClass();
instance.increment();
instance.render(); // { text: "Count: 1", value: 1 }

// Reactive
const reactiveComponent = adapter.toReactive();
reactiveComponent.subscribe((state) => {
  console.log("State changed:", state);
});
reactiveComponent.dispatch("increment");

// Generic
const result = adapter.transform(Paradigm.REACTIVE);
```

## API Reference

### `DOPAdapter<S>`

The main adapter class for paradigm transformations.

#### Constructor

```typescript
new DOPAdapter(logic: ComponentLogic<S>)
```

Creates an adapter from component logic.

#### Methods

##### `toFunctional(): FunctionalComponent<S>`

Transforms the component to a functional paradigm using closures.

```typescript
const adapter = new DOPAdapter(logic);
const FunctionalComponent = adapter.toFunctional();
const output = FunctionalComponent();
```

**Characteristics:**
- Returns a function that encapsulates state in closures
- State is local to each function invocation
- Actions are curried functions within the closure

##### `toOOP(): OOPComponentClass<S>`

Transforms the component to an OOP paradigm with class-based instance.

```typescript
const adapter = new DOPAdapter(logic);
const MyClass = adapter.toOOP();
const instance = new MyClass();
instance.state;      // { count: 0 }
instance.increment(); // executes action
instance.render();    // returns rendered output
```

**Characteristics:**
- Returns a class constructor
- Actions become bound instance methods
- State is a property on the instance
- Mutable state that persists across method calls

##### `toReactive(): ReactiveComponent<S>`

Transforms the component to a reactive paradigm with observable pattern.

```typescript
const adapter = new DOPAdapter(logic);
const reactive = adapter.toReactive();

const unsubscribe = reactive.subscribe((state) => {
  console.log("Updated state:", state);
});

reactive.dispatch("increment"); // triggers notification
unsubscribe(); // stop listening
```

**Characteristics:**
- Returns a component with subscribe/notify pattern
- Actions trigger automatic state notifications
- Multiple subscribers supported
- Change detection for state mutations

##### `toDataOriented(): ComponentLogic<S>`

Returns a normalized data-oriented representation (identity transform).

```typescript
const adapter = new DOPAdapter(logic);
const normalizedLogic = adapter.toDataOriented();
// Returns a fresh copy of the component logic
```

##### `transform(target: Paradigm): TransformResult<S>`

Generic transformation dispatcher that routes to the appropriate method.

```typescript
const result = adapter.transform(Paradigm.REACTIVE);
// result.paradigm === Paradigm.REACTIVE
// result.component is the transformed component
// result.metadata contains source and timestamp
```

##### `static fromAny(input: any, sourceParadigm: Paradigm): DOPAdapter<S>`

Creates an adapter from a component in any paradigm (reverse adaptation).

```typescript
const functionalComponent = /* ... */;
const adapter = DOPAdapter.fromAny(functionalComponent, Paradigm.FUNCTIONAL);

const oopClass = /* ... */;
const adapter = DOPAdapter.fromAny(oopClass, Paradigm.OOP);
```

This enables paradigm detection and conversion for existing components.

### `ReactiveWrapper<S>`

Direct reactive wrapper implementation (usually created via `toReactive()`).

```typescript
import { ReactiveWrapper } from "obix-binding-adapter";

const wrapper = new ReactiveWrapper(logic);
```

#### Methods

- `subscribe(callback): unsubscribe` - Register state change listener
- `dispatch(actionName, ...args)` - Execute action and notify subscribers
- `notify()` - Manually trigger notifications
- `render()` - Get rendered output for current state

## Type Definitions

### `ComponentLogic<S>`

The canonical data-oriented component representation:

```typescript
interface ComponentLogic<S> {
  name: string;                              // Component name
  state: S;                                  // Initial state
  actions: Record<string, Action<S>>;        // Action map
  render: (context: ActionContext<S>) => any; // Render function
  metadata?: {                               // Optional metadata
    version?: string;
    description?: string;
    tags?: string[];
    [key: string]: any;
  };
}
```

### `ActionContext<S>`

Context passed to action functions:

```typescript
interface ActionContext<S> {
  state: S;           // Current state (mutable)
  [key: string]: any; // Other actions and utilities
}
```

### `Paradigm` Enum

```typescript
enum Paradigm {
  DATA_ORIENTED = "DATA_ORIENTED",
  FUNCTIONAL = "FUNCTIONAL",
  OOP = "OOP",
  REACTIVE = "REACTIVE",
}
```

## Advanced Usage

### Round-Trip Transformations

Convert between paradigms and back:

```typescript
const adapter = new DOPAdapter(counterLogic);

// data → functional → data
const functional = adapter.toFunctional();
const reverseAdapter = DOPAdapter.fromAny(functional, Paradigm.FUNCTIONAL);
const logic = reverseAdapter.toDataOriented();

// data → OOP → reactive → data
const oopClass = adapter.toOOP();
const reverseAdapter = DOPAdapter.fromAny(oopClass, Paradigm.OOP);
const reactive = reverseAdapter.toReactive();
const finalAdapter = DOPAdapter.fromAny(reactive, Paradigm.REACTIVE);
```

### Chaining Transformations

```typescript
const adapter = new DOPAdapter(logic);
const OOPClass = adapter.toOOP();
const reverseAdapter = DOPAdapter.fromAny(OOPClass, Paradigm.OOP);
const functionalComponent = reverseAdapter.toFunctional();
```

### Complex State Structures

The adapter works with any state type:

```typescript
interface AppState {
  user: {
    name: string;
    age: number;
  };
  todos: Array<{ id: string; text: string; done: boolean }>;
}

const appLogic: ComponentLogic<AppState> = {
  name: "App",
  state: {
    user: { name: "Alice", age: 30 },
    todos: [],
  },
  actions: {
    updateUserName: ({ state }, name: string) => {
      state.user.name = name;
    },
    addTodo: ({ state }, text: string) => {
      state.todos.push({
        id: Math.random().toString(),
        text,
        done: false,
      });
    },
  },
  render: ({ state }) => ({
    greeting: `Hello, ${state.user.name}!`,
    todoCount: state.todos.length,
  }),
};
```

### Error Handling

```typescript
const adapter = new DOPAdapter(logic);
const reactive = adapter.toReactive();

try {
  reactive.dispatch("nonExistentAction");
} catch (error) {
  console.error(error.message); // "Action "nonExistentAction" not found"
}
```

## Performance Considerations

1. **State Cloning**: Each paradigm maintains its own isolated state copy for immutability
2. **Reactive Subscriptions**: Multiple subscribers are O(n) per dispatch
3. **Functional Closures**: Each function call has minimal overhead
4. **OOP Instances**: Class instantiation is lightweight

## Testing

The package includes comprehensive test coverage:

```bash
# Run tests once
npm test

# Watch mode
npm test:watch
```

Tests cover:
- All paradigm transformations
- State management and mutations
- Action execution
- Reactive subscriptions
- Round-trip conversions
- Error cases
- Complex nested state

## Architecture

### Data-Oriented Foundation

The `ComponentLogic` is the canonical representation. All paradigms are derived transformations:

```
    ComponentLogic (DATA_ORIENTED)
         |
    _____|_____
   |     |     |
   v     v     v
  FP    OOP   RX

Reverse adapters allow:
  FP → DO, OOP → DO, RX → DO
```

### State Management Strategy

Each paradigm implements state independently:

- **Functional**: Closure-scoped, re-initialized per call
- **OOP**: Instance property, mutable, persistent
- **Reactive**: Proxy-wrapped for change detection, notifies subscribers

### Action Execution

All actions receive an `ActionContext` containing:
- Current mutable state
- All other available actions
- Any additional utilities

Actions mutate state directly; no explicit return needed.

## Integration with OBIX

This adapter is the foundational pattern for OBIX components, enabling:

1. **Interoperability**: Use any component with any framework/pattern
2. **Migration**: Convert existing components between paradigms
3. **Composition**: Mix paradigms in the same application
4. **Testing**: Test components in any paradigm independently

## License

MIT

## Author

OBINexus <okpalan@protonmail.com>

<!-- obix-release:begin — generated by scripts/release/prepare.mjs; edit the text above this line -->

## Installation

```bash
npm install obix-binding-adapter
```

## API surface

- `obix-binding-adapter` — 3 value exports: `DOPAdapter`, `Paradigm`, `ReactiveWrapper`
- Type declarations: `./dist/index.d.ts` (and a declaration next to every JS entry point).

## Architecture role

`obix-binding-adapter` is a **public building block**: the umbrella `obix` depends on it and re-exports its stable API, so applications normally reach it through `obix`; it can also be installed on its own.

The architecture of OBIX — the package families and which packages are public API — is indexed in the umbrella: [docs/architecture.md](https://github.com/obinexus/obix/blob/main/docs/architecture.md).

## Package relationships

- Depends on (OBIX): no other OBIX package.
- Used by (OBIX): [`obix`](https://github.com/obinexus/obix).

## Testing

- 1 test file ships in the npm package (`__tests__/`): the evidence of the package's contract, published so that its verification can be inspected — not runtime code (no entry point reaches it).
- **Standalone**: 1 of 1 — it reads nothing outside the package.
- Run them with `npm test` (`vitest run`) in the OBIX monorepo, which provides the test tooling (Node's test runner, Vitest, TypeScript) and the harness.

## Documentation

- [CHANGELOG.md](CHANGELOG.md)
- The OBIX architecture index: [obix/docs/architecture.md](https://github.com/obinexus/obix/blob/main/docs/architecture.md)

## Repository

- https://github.com/obinexus/obix-binding-adapter — `git@github.com:obinexus/obix-binding-adapter.git`
- Issues: https://github.com/obinexus/obix-binding-adapter/issues
- The repository is a clean export of the package from the OBIX monorepo. Its lineage — the sources it was recovered from and its earlier names — is `PROVENANCE.json`, shipped in this package; the repository's copy also records the monorepo commit it was exported from.

## License

MIT — see [LICENSE](LICENSE).

<!-- obix-release:end -->
