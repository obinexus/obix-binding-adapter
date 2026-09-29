/**
 * OBIX DP Adapter - Main Entry Point
 * Data-oriented paradigm translation layer for OBIX
 */

export { DOPAdapter } from "./dop-adapter.js";
export { ReactiveWrapper } from "./reactive.js";

export type {
  Action,
  ActionContext,
  AdapterConfig,
  ComponentLogic,
  FunctionalComponent,
  OOPComponentClass,
  ReactiveComponent,
  TransformResult,
} from "./types.js";

export { Paradigm } from "./types.js";
