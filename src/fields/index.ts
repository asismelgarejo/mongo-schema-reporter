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
  isArray?: boolean;
};

export type FieldsReport = Record<string, FieldReport>;

export class SchemaFields {
  private getPath = (isArray: boolean, prefix: string, key: string) => {
    if (isArray) return prefix ? `${prefix}.[0].${key}` : key;
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
  private processSchema = ({ schema, prefix = "", isArray = false }: ReportProps): FieldsReport[] => {
    const report: FieldsReport[] = [];
    if ("oneOf" in schema) {
      report.push(...this.processOneOf(schema, prefix, isArray));
    } else {
      const r = this.processObject(schema, prefix, isArray);
      report.push(r);
    }

    return report;
  };
  private processOneOf = ($schema: TOr, prefix = "", isArray = false): FieldsReport[] => {
    const report: FieldsReport[] = [];
    $schema.oneOf.forEach((schema) => {
      const r = this.processObject(schema, prefix, isArray);
      report.push(r);
    });
    return report;
  };
  private processObject = (schema: TObject, prefix = "", isArray = false): FieldsReport => {
    const report: Record<string, FieldReport> = {};

    for (const [key, value] of Object.entries(schema.properties)) {
      const isRequired = schema?.required ? schema?.required.includes(key) : false;
      const path = this.getPath(isArray, prefix, key);

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
          const discriminator = schema.title ?? this.numberToLetters(idx)
          const pathField = `${path}.[${discriminator}]`;
          const r = this.processObject(schema, pathField, false);
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

        Object.assign(report, this.processObject(value, prefix, isArray));
      } else if (value.bsonType === BSONType.Array && value.items) {
        report[path] = {
          path,
          data_type: `array<${value.items.bsonType}>`,
          description: value.items?.description,
          required: isRequired,
          title: value.title,
        };

        if (value.items.bsonType === BSONType.Object) {
          Object.assign(report, this.processObject(value.items, path, true));
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
