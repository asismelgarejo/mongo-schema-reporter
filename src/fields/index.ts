import { BSONType, STATIC_WORDS, TObject, TOr } from "../shared";

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
  schema: TObject | TOr;
  prefix?: string;
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

  getReport = ($schema: TObject | TOr): FieldsReportHashMap[] => {
    const report: FieldsReportHashMap[] = this.processSchema({ schema: $schema });
    return report;
  };
  private processSchema = ({ schema, prefix = "" }: ProcessSchemaProps): FieldsReportHashMap[] => {
    const report: FieldsReportHashMap[] = [];
    if ("oneOf" in schema) {
      report.push(...this.processOneOf(schema, prefix));
    } else {
      const r = this.processObject(schema, prefix);
      report.push(r);
    }

    return report;
  };
  private processOneOf = ($schema: TOr, prefix = ""): FieldsReportHashMap[] => {
    const report: FieldsReportHashMap[] = [];
    $schema.oneOf.forEach((schema) => {
      const r = this.processObject(schema, prefix);
      report.push(r);
    });
    return report;
  };
  private processObject = (schema: TObject, prefix = ""): FieldsReportHashMap => {
    const fieldsHashMap: FieldsHashMap = {};

    for (const [key, value] of Object.entries(schema.properties)) {
      const isRequired = schema?.required ? schema?.required.includes(key) : false;
      const path = this.getPath(prefix, key);

      if ("oneOf" in value) {
        fieldsHashMap[path] = {
          path,
          data_type: BSONType.Object,
          description: value.description,
          required: isRequired,
          title: value.title,
        };

        //TODO: Refactor
        value.oneOf.forEach((schema, idx) => {
          const discriminator = schema.title ?? this.numberToLetters(idx);
          const pathField = `${path}.[${discriminator}]`;
          const r = this.processObject(schema, pathField);
          Object.assign(fieldsHashMap, r.fieldsHashMap);
        });
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
          data_type: `array<${value.items.bsonType}>`,
          description: value.items?.description,
          required: isRequired,
          title: value.title,
        };

        if (value.items.bsonType === BSONType.Object) {
          const newPath = `${path}.[0]`;
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

  process = ($schema: TObject | TOr): SchemaFields => {
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
