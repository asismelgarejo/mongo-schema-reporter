import { BSONType, TObject, TOr } from "../shared";

export type FieldReport = {
  path: string;
  data_type: string;
  required: boolean;

  title?: string;
  description?: string;
  default?: any;
  examples?: any;
};

type ReportProps = {
  schema: TObject | TOr;
  prefix?: string;
};

export type FieldsReport = Record<string, FieldReport>;

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

  getReport = ($schema: TObject | TOr): FieldsReport[] => {
    const report: FieldsReport[] = this.processSchema({ schema: $schema });
    return report;
  };
  private processSchema = ({ schema, prefix = "" }: ReportProps): FieldsReport[] => {
    const report: FieldsReport[] = [];
    if ("oneOf" in schema) {
      report.push(...this.processOneOf(schema, prefix));
    } else {
      const r = this.processObject(schema, prefix);
      report.push(r);
    }

    return report;
  };
  private processOneOf = ($schema: TOr, prefix = ""): FieldsReport[] => {
    const report: FieldsReport[] = [];
    $schema.oneOf.forEach((schema) => {
      const r = this.processObject(schema, prefix);
      report.push(r);
    });
    return report;
  };
  private processObject = (schema: TObject, prefix = ""): FieldsReport => {
    const report: Record<string, FieldReport> = {};

    for (const [key, value] of Object.entries(schema.properties)) {
      const isRequired = schema?.required ? schema?.required.includes(key) : false;
      const path = this.getPath(prefix, key);

      if ("oneOf" in value) {
        report[path] = {
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
          Object.assign(report, r);
        });
      } else if (value.bsonType === BSONType.Object && value.properties) {
        report[path] = {
          path,
          data_type: BSONType.Object,
          description: value?.description,
          required: isRequired,
          title: value.title,
        };

        Object.assign(report, this.processObject(value, prefix));
      } else if (value.bsonType === BSONType.Array && value.items) {
        report[path] = {
          path,
          data_type: `array<${value.items.bsonType}>`,
          description: value.items?.description,
          required: isRequired,
          title: value.title,
        };

        if (value.items.bsonType === BSONType.Object) {
          const newPath = `${path}.[0]`
          Object.assign(report, this.processObject(value.items, newPath));
        }
      } else {
        if (value.bsonType === BSONType.String && value?.enum) {
          report[path] = {
            path,
            data_type: `enum(${value.enum.map((e: string) => `'${e}'`).join(", ")})`,
            description: value.description,
            required: isRequired,
            title: value.title,
          };
        } else {
          report[path] = {
            path,
            data_type: `${value.bsonType}`,
            description: value.description,
            required: isRequired,
            title: value.title,
          };
        }
      }
    }

    return report;
  };
}

export class SchemaFields {
  reports: FieldsReport[] = [];
  private constructor(private readonly engine: Engine) {}

  static create() {
    return new SchemaFields(new Engine());
  }

  process = ($schema: TObject | TOr): SchemaFields => {
    this.reports = this.engine.getReport($schema);
    return this;
  };

  toArrays(): FieldReport[][] {
    const arrays = this.reports.map((r) => {
      return Object.values(r);
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
