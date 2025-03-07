import { BSONType } from "./enums";

export interface SchemaOptions {
  $schema?: string;
  /** Id for this schema */
  $id?: string;
  /** Title of this schema */
  title?: string;
  /** Description of this schema */
  description?: string;
  /** Default value for this schema */
  default?: any;
  /** Example values matching this schema */
  examples?: any;
  /** Optional annotation for readOnly */
  readOnly?: boolean;
  /** Optional annotation for writeOnly */
  writeOnly?: boolean;
}
export type TPropertyKey = string | number;

//#region types
type TString = SchemaOptions & {
  bsonType: BSONType.String;
  enum?: string[];
};
type TObjectId = SchemaOptions & {
  bsonType: BSONType.ObjectId;
};
type TInt = SchemaOptions & {
  bsonType: BSONType.Int;
};
export type TObject = SchemaOptions & {
  additionalProperties?: TAdditionalProperties;
  bsonType: BSONType.Object;
  properties: TSchema;
  required?: string[];
};
export type TOr = SchemaOptions & {
  additionalProperties?: TAdditionalProperties;
  bsonType: BSONType.Object;
  oneOf: TObject[];
};
export type TArray = SchemaOptions & {
  additionalProperties?: TAdditionalProperties;
  bsonType: BSONType.Array;
  items: TSchemaTypes;
  required?: string[];
};
//#endregion

export type TSchemaTypes = TString | TObject | TArray | TInt | TObjectId;
export type TSchema = Record<TPropertyKey, TSchemaTypes>;
export type TAdditionalProperties = undefined | TSchema | boolean;
