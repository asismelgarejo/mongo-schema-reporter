import { BSONType, STATIC_WORDS, TAnyOf, TObject, TOneOf } from "../shared";

//#region types
export type FieldReport = {
  path: string;
  data_type: string;
  required: boolean;
  title?: string;
  description?: string;
};

export type FieldsHashMap = Record<string, FieldReport>;
export type FieldsReportHashMap = {
  title: string;
  fieldsHashMap: FieldsHashMap;
};
export type FieldsReportArray = {
  title: string;
  fields: FieldReport[];
};
type ProcessSchemaProps = {
  schema: TObject | TOneOf | TAnyOf;
  prefix?: string;
};
type ProccessIsophormicObjectsProps = {
  schemas: TObject[];
  path: string;
  isRequired: boolean;
  description?: string;
  title?: string;
};
type ProccessIsophormicArrayProps = {
  schemas: TObject[];
  path: string;
};
//#endregion

class Engine {
  private getPath = (prefix: string, key: string) => {
    return prefix ? `${prefix}.${key}` : key;
  };
  private numberToLetters = (n: number): string => {
    let result = "";
    while (n >= 0) {
      result = String.fromCharCode((n % 26) + 65) + result;
      n = Math.floor(n / 26) - 1;
    }
    return result;
  };

  getReport = ($schema: TObject | TOneOf): FieldsReportHashMap[] => {
    const report: FieldsReportHashMap[] = this.processSchema({ schema: $schema });
    return report;
  };
  private processSchema = ({ schema, prefix = "" }: ProcessSchemaProps): FieldsReportHashMap[] => {
    const report: FieldsReportHashMap[] = [];
    if ("oneOf" in schema) {
      report.push(...this.processOneOf(schema, prefix));
    } else if ("anyOf" in schema) {
      report.push(...this.processAnyOf(schema, prefix));
    } else {
      const r = this.processObject(schema, prefix);
      report.push(r);
    }

    return report;
  };
  private processOneOf = ($schema: TOneOf, prefix = ""): FieldsReportHashMap[] => {
    const report: FieldsReportHashMap[] = [];
    $schema.oneOf.forEach((schema) => {
      const r = this.processObject(schema, prefix);
      report.push(r);
    });
    return report;
  };
  private processAnyOf = ($schema: TAnyOf, prefix = ""): FieldsReportHashMap[] => {
    const report: FieldsReportHashMap[] = [];
    $schema.anyOf.forEach((schema) => {
      const r = this.processObject(schema, prefix);
      report.push(r);
    });
    return report;
  };

  private proccessIsophormicObjects = (props: ProccessIsophormicObjectsProps) => {
    const fieldsHashMap: FieldsHashMap = {};
    fieldsHashMap[props.path] = {
      path: props.path,
      data_type: BSONType.Object,
      description: props.description,
      required: props.isRequired,
      title: props.title,
    };

    props.schemas.forEach((schema, idx) => {
      const discriminator = schema.title ?? this.numberToLetters(idx);
      const pathField = `${props.path}{${discriminator}}`;
      const r = this.processObject(schema, pathField);
      Object.assign(fieldsHashMap, r.fieldsHashMap);
    });
    return fieldsHashMap;
  };
  private proccessIsophormicArrayProps = (props: ProccessIsophormicArrayProps) => {
    const fieldsHashMap: FieldsHashMap = {};
    props.schemas.forEach((schema, idx) => {
      const discriminator = schema.title ?? this.numberToLetters(idx);
      const pathField = `${props.path}[]${discriminator}`;
      const r = this.processObject(schema, pathField);
      Object.assign(fieldsHashMap, r.fieldsHashMap);
    });
    return fieldsHashMap;
  };

  private processObject = (schema: TObject, prefix = ""): FieldsReportHashMap => {
    const fieldsHashMap: FieldsHashMap = {};

    for (const [key, value] of Object.entries(schema.properties)) {
      const isRequired = schema?.required ? schema?.required.includes(key) : false;
      const path = this.getPath(prefix, key);

      if ("oneOf" in value) {
        const hashMap = this.proccessIsophormicObjects({
          description: value.description,
          isRequired,
          path,
          schemas: value.oneOf,
          title: value.title,
        });
        Object.assign(fieldsHashMap, hashMap);
      } else if ("anyOf" in value) {
        const hashMap = this.proccessIsophormicObjects({
          description: value.description,
          isRequired,
          path,
          schemas: value.anyOf,
          title: value.title,
        });
        Object.assign(fieldsHashMap, hashMap);
      } else if (value.bsonType === BSONType.Object && value.properties) {
        fieldsHashMap[path] = {
          path,
          data_type: BSONType.Object,
          description: value?.description,
          required: isRequired,
          title: value.title,
        };

        Object.assign(fieldsHashMap, this.processObject(value, prefix));
      } else if (value.bsonType === BSONType.Array && value.items) {
        fieldsHashMap[path] = {
          path,
          data_type: `${value.bsonType}<${value.items.bsonType}>`,
          description: value.description,
          required: isRequired,
          title: value.title,
        };

        if ("oneOf" in value.items) {
          const hashMap = this.proccessIsophormicArrayProps({
            path,
            schemas: value.items.oneOf,
          });
          Object.assign(fieldsHashMap, hashMap);
        } else if ("anyOf" in value.items) {
          const hashMap = this.proccessIsophormicArrayProps({
            path,
            schemas: value.items.anyOf,
          });
          Object.assign(fieldsHashMap, hashMap);
        } else if (value.items.bsonType === BSONType.Object && value.items) {
          const newPath = `${path}[]`;
          Object.assign(fieldsHashMap, this.processObject(value.items, newPath).fieldsHashMap);
        }
      } else {
        if (value.bsonType === BSONType.String && value?.enum) {
          fieldsHashMap[path] = {
            path,
            data_type: `enum(${value.enum.map((e: string) => `'${e}'`).join(", ")})`,
            description: value.description,
            required: isRequired,
            title: value.title,
          };
        } else {
          fieldsHashMap[path] = {
            path,
            data_type: `${value.bsonType}`,
            description: value.description,
            required: isRequired,
            title: value.title,
          };
        }
      }
    }
    const asdas: FieldsReportHashMap = {
      title: schema.title ?? STATIC_WORDS.UnnamedSchema,
      fieldsHashMap,
    };
    return asdas;
  };
}

export class SchemaFields {
  reports: FieldsReportHashMap[] = [];
  private constructor(private readonly engine: Engine) {}

  static create() {
    return new SchemaFields(new Engine());
  }

  process = ($schema: TObject | TOneOf): SchemaFields => {
    this.reports = this.engine.getReport($schema);
    return this;
  };

  toArrays(): FieldsReportArray[] {
    const arrays = this.reports.map((r) => {
      const obj: FieldsReportArray = {
        title: r.title,
        fields: Object.values(r.fieldsHashMap),
      };

      return obj;
    });
    this.reports = [];
    return arrays;
  }
  raw() {
    const raw = [...this.reports];
    this.reports = [];
    return raw;
  }
}
