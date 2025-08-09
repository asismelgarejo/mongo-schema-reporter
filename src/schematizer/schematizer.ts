import { Static, TSchema, Type } from "@sinclair/typebox";
import { Binary, BSONRegExp, Decimal128, Long, ObjectId, Timestamp } from "mongodb";

//#region options
/** Base options available for all schema types */
type BaseOptions = { description?: string; required?: boolean };
/** Additional options for object types */
type ObjectOptions = { additionalProperties?: boolean; title?: string };
type ArrayOptions = { uniqueItems?: boolean; minItems?: number; maxItems?: number };
/** String-specific constraints for Mongo JSON Schema */
type StringOptions = {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: string[];
};

/** Number-specific constraints for Mongo JSON Schema */
type NumberOptions = {
  enum?: number[];
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
};

//#endregion

//#region utils
/**
 * Internal symbol used to mark if a field is required in the JSON Schema.
 * This symbol will never appear in the final serialized schema.
 */
const RequiredSym = Symbol("required");

/**
 * Removes the internal `RequiredSym` marker from a schema node to avoid
 * leaking internal metadata into the final JSON Schema.
 *
 * @param obj - The schema node to clean.
 * @returns A shallow copy of the schema without the `RequiredSym` property.
 */
const stripReq = (obj: TSchema & { [RequiredSym]?: boolean }) => {
  if (!obj || typeof obj !== "object") return obj;
  const { [RequiredSym]: _ignored, ...rest } = obj;
  return rest;
};

/**
 * Forces TypeScript to expand a type into its full, readable form.
 * Useful for debugging and for making inferred types easier to inspect.
 */
type Prettify<T> = { [K in keyof T]: T[K] } & {};

/**
 * Infers the static type `S` from a Builder instance.
 * @example
 * ```ts
 * type UserType = Infer<typeof userSchema>;
 * ```
 */
export type Infer<B> = B extends Builder<TSchema, infer S> ? S : never;

/**
 * Produces a union of keys in `T` whose value type includes `undefined`.
 * These keys will be marked as optional in the final inferred type.
 */
type UndefinedKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];
//#endregion

/**
 * Transforms an object type into a Zod-like inferred type:
 * - Keys whose value type does NOT include `undefined` remain required.
 * - Keys whose value type includes `undefined` become optional (`?`).
 */
type ZodifyObject<T> = { [K in Exclude<keyof T, UndefinedKeys<T>>]: T[K] } & {
  [K in UndefinedKeys<T>]?: Exclude<T[K], undefined>;
};

/**
 * Builder type:
 * - `TS` is the underlying TSchema (TypeBox/MongoDB schema definition)
 * - `S` is the static inferred TypeScript type.
 */
export type Builder<TS extends TSchema = TSchema, S = never> = {
  /** The underlying schema with the internal required flag. */
  $: TS & { [RequiredSym]?: boolean };

  /** Adds or replaces the `description` property of the schema. */
  describe(txt: string): Builder<TS, S>;

  /**
   * Marks this field as optional (Zod-style):
   * - Adds `undefined` to the inferred type `S`.
   * - Removes the field from the "required" list in the JSON Schema.
   */
  optional(): Builder<TS, S | undefined>;
};

/**
 * Creates a Builder instance from a given schema node.
 *
 * @param node - The TypeBox schema node to wrap.
 * @param required - Whether the field is required (default: true).
 */
const makeBuilder = <TS extends TSchema & { [RequiredSym]?: boolean }, S>(
  node: TS,
  required = true,
): Builder<TS, S> => {
  const withNode = (patch: BaseOptions) => makeBuilder<TS, S>({ ...node, ...patch }, node[RequiredSym] ?? required);

  return {
    $: Object.assign({}, node, { [RequiredSym]: required }),
    describe(text: string) {
      return withNode({ description: text });
    },
    optional() {
      // Zod-style: add `undefined` to the inferred type and mark as not required
      return makeBuilder<TS, S | undefined>(node, false);
    },
  };
};

/**
 * MongoDB/TypeBox schema builder with Zod-like API for ergonomics.
 */
export const Schematizer = {
  /**
   * Creates an ObjectId field.
   * Inferred type: `ObjectId`
   */
  ObjectId() {
    const base = Type.Unsafe<ObjectId>({ bsonType: "objectId" });
    return makeBuilder<typeof base, ObjectId>(base);
  },

  /** String field (bsonType: "string") */
  String(options: StringOptions = {}) {
    const base = Type.Unsafe<string>({ bsonType: "string", ...options });
    return makeBuilder<typeof base, string>(base);
  },

  /**
   * Number field (mapped to bsonType: "int" by your design).
   * If you need other numeric bsonTypes, use Int/Long/Double/Decimal128 below.
   */
  Number(options: NumberOptions = {}) {
    const base = Type.Unsafe<number>({ bsonType: "int", ...options });
    return makeBuilder<typeof base, number>(base);
  },

  /** 32-bit integer (bsonType: "int") */
  Int(options: NumberOptions = {}) {
    const base = Type.Unsafe<number>({ bsonType: "int", ...options });
    return makeBuilder<typeof base, number>(base);
  },

  /** 64-bit integer (bsonType: "long") */
  Long(options: NumberOptions = {}) {
    const base = Type.Unsafe<Long>({ bsonType: "long", ...options });
    return makeBuilder<typeof base, Long>(base);
  },

  /** Double precision float (bsonType: "double") */
  Double(options: NumberOptions = {}) {
    const base = Type.Unsafe<number>({ bsonType: "double", ...options });
    return makeBuilder<typeof base, number>(base);
  },

  /** High-precision decimal (bsonType: "decimal") */
  Decimal128(options: NumberOptions = {}) {
    const base = Type.Unsafe<Decimal128>({ bsonType: "decimal", ...options });
    return makeBuilder<typeof base, Decimal128>(base);
  },

  /** Boolean field (bsonType: "bool") */
  Boolean() {
    const base = Type.Unsafe<boolean>({ bsonType: "bool" });
    return makeBuilder<typeof base, boolean>(base);
  },

  /** Date field (bsonType: "date") */
  Date() {
    const base = Type.Unsafe<Date>({ bsonType: "date" });
    return makeBuilder<typeof base, Date>(base);
  },

  /** Null value (bsonType: "null") */
  Null() {
    const base = Type.Unsafe<null>({ bsonType: "null" });
    return makeBuilder<typeof base, null>(base);
  },

  /** Undefined value (bsonType: "undefined") */
  Undefined() {
    const base = Type.Unsafe<undefined>({ bsonType: "undefined" });
    return makeBuilder<typeof base, undefined>(base);
  },

  /** Regular expression (bsonType: "regex") */
  Regex(options: BaseOptions = {}) {
    const base = Type.Unsafe<BSONRegExp>({ bsonType: "regex", ...options });
    return makeBuilder<typeof base, BSONRegExp>(base);
  },

  /** Binary data (bsonType: "binData") */
  Binary(options: BaseOptions = {}) {
    const base = Type.Unsafe<Binary>({ bsonType: "binData", ...options });
    return makeBuilder<typeof base, Binary>(base);
  },

  /** Timestamp (bsonType: "timestamp") */
  Timestamp(options: BaseOptions = {}) {
    const base = Type.Unsafe<Timestamp>({ bsonType: "timestamp", ...options });
    return makeBuilder<typeof base, Timestamp>(base);
  },

  /** JavaScript code (bsonType: "javascript") */
  Javascript(options: BaseOptions = {}) {
    const base = Type.Unsafe<string>({ bsonType: "javascript", ...options });
    return makeBuilder<typeof base, string>(base);
  },

  /** BSON symbol (bsonType: "symbol") */
  Symbol() {
    const base = Type.Unsafe<symbol>({ bsonType: "symbol" });
    return makeBuilder<typeof base, symbol>(base);
  },

  /** MinKey sentinel (bsonType: "minKey") — typed as number per your prior mapping */
  MinKey() {
    const base = Type.Unsafe<number>({ bsonType: "minKey" });
    return makeBuilder<typeof base, number>(base);
  },

  /** MaxKey sentinel (bsonType: "maxKey") — typed as number per your prior mapping */
  MaxKey() {
    const base = Type.Unsafe<number>({ bsonType: "maxKey" });
    return makeBuilder<typeof base, number>(base);
  },

  /** Creates a literal schema (Zod-like).
   * For Mongo JSON Schema, we emit an `enum` with a single value.
   * - For strings/booleans we also set a `bsonType`.
   * - For numbers we keep only `enum` (Mongo numeric bsonTypes vary: int/long/double/decimal).
   */
  Literal<T extends string | number | boolean>(value: T, opts: BaseOptions = {}) {
    const kind = typeof value;
    const base =
      kind === "string"
        ? Type.Unsafe<T>({ bsonType: "string", enum: [value], ...opts })
        : kind === "boolean"
          ? Type.Unsafe<T>({ bsonType: "bool", enum: [value], ...opts })
          : // number: let enum carry the literal (bsonType would be ambiguous)
            Type.Unsafe<T>({ enum: [value], ...opts });

    return makeBuilder<typeof base, T>(base);
  },

  /** Creates an array schema (Zod-like).
   * @param item - A Schematizer builder representing the type of each element.
   * @param opts - MongoDB JSON Schema array options (`minItems`, `maxItems`, `uniqueItems`, etc.).
   * @returns A Builder whose static type is `Infer<Item>[]`.
   */
  Array<Item extends Builder<TSchema>>(item: Item, opts: ArrayOptions = {}) {
    const base = Type.Unsafe<Infer<Item>[]>({
      bsonType: "array",
      items: stripReq(item.$), // we don't care if the item itself was required/optional
      ...(opts.minItems !== undefined ? { minItems: opts.minItems } : {}),
      ...(opts.maxItems !== undefined ? { maxItems: opts.maxItems } : {}),
      ...(opts.uniqueItems !== undefined ? { uniqueItems: opts.uniqueItems } : {}),
      //   ...(opts.description ? { description: opts.description } : {}),
    });

    return makeBuilder<typeof base, Infer<Item>[]>(base);
  },

  /**
   * Creates an object schema.
   * Required/optional fields are automatically determined based on `.optional()`.
   *
   * @param fields - The object shape, where each value is a `Builder`.
   * @param opts - Additional object-level schema options.
   */
  Object<TShape extends Record<string, Builder>>(fields: TShape, opts: ObjectOptions = {}) {
    const properties: Record<string, TSchema> = {};
    const requiredList: string[] = [];

    for (const [k, v] of Object.entries(fields)) {
      const node = v.$;
      properties[k] = stripReq(node);
      const isRequired = node[RequiredSym] !== false;
      if (isRequired) requiredList.push(k);
    }

    const base = Type.Unsafe<{
      [K in keyof TShape]: Static<TShape[K]["$"]>;
    }>({
      bsonType: "object",
      properties,
      ...(requiredList.length ? { required: requiredList } : {}),
      ...(opts.additionalProperties !== undefined ? { additionalProperties: opts.additionalProperties } : {}),
      ...(opts.title ? { title: opts.title } : {}),
      //   ...(opts.description ? { description: opts.description } : {}),
    });

    type ShapeStatic = { [K in keyof TShape]: Infer<TShape[K]> };
    type StaticFromShape = Prettify<ZodifyObject<ShapeStatic>>;

    return makeBuilder<typeof base, StaticFromShape>(base);
  },

  DiscriminatedUnion<K extends string, TAlts extends readonly Builder<TSchema>[]>(
    _key: K,
    alts: [...TAlts],
    opts: { description?: string; title?: string } = {},
  ) {
    // --- Runtime (Mongo JSON Schema compatible) ---
    const anyOfSchemas = alts.map((a) => stripReq(a.$));

    // JSON Schema con discriminador simulado
    const base = Type.Unsafe({
      anyOf: anyOfSchemas,
      ...opts,
    });

    // --- Tipo estático ---
    // Inferir cada alternativa
    type AltsStatic = Infer<TAlts[number]>;
    // Resultado: unión de todas las alternativas
    type StaticFromShape = AltsStatic;

    return makeBuilder<typeof base, StaticFromShape>(base);
  },
  /** Merges two object schemas into a single object schema (like Zod's `.merge()`).
   * - Only for object builders (bsonType: "object").
   * - Merges `properties` and `required` arrays.
   * - Returns a single object schema and a single flattened inferred type.
   */
  MergeObjects<A extends Builder<TSchema>, B extends Builder<TSchema>>(a: A, b: B, opts: ObjectOptions = {}) {
    const aNode = a.$;
    const bNode = b.$;

    if (aNode.bsonType !== "object" || bNode.bsonType !== "object") {
      throw new Error("MergeObjects expects both schemas to be object builders.");
    }

    const props = { ...(aNode.properties || {}), ...(bNode.properties || {}) };

    // Merge required (skip duplicates)
    const reqA = Array.isArray(aNode.required) ? aNode.required : [];
    const reqB = Array.isArray(bNode.required) ? bNode.required : [];
    const required = Array.from(new Set([...reqA, ...reqB]));

    const base = Type.Unsafe({
      bsonType: "object",
      properties: props,
      ...(required.length ? { required } : {}),
      ...(opts.additionalProperties !== undefined ? { additionalProperties: opts.additionalProperties } : {}),
      ...(opts.title ? { title: opts.title } : {}),
    });

    // Static type: flattened object
    type SA = Infer<A>;
    type SB = Infer<B>;
    type S = SA & SB; // structurally this is OK; we'll "prettify" it for display:
    type Prettify<T> = { [K in keyof T]: T[K] } & {};
    return makeBuilder<typeof base, Prettify<S>>(base);
  },
};
