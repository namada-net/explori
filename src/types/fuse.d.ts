declare module "fuse.js" {
  export interface FuseResult<T> {
    item: T;
    score?: number;
    matches?: Array<unknown>;
  }

  export interface FuseOptions<T> {
    includeScore?: boolean;
    threshold?: number;
    ignoreLocation?: boolean;
    minMatchCharLength?: number;
    keys?: Array<string | { name: string; weight?: number }>;
  }

  export default class Fuse<T> {
    constructor(list: ReadonlyArray<T>, options?: FuseOptions<T>);
    search(pattern: string): FuseResult<T>[];
  }
}

