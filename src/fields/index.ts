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

  getReport = ({ schema: sch, prefix = "", isArray = false }: ReportProps): FieldsReport[] => {
    const report: FieldsReport[] = [];

    if ((sch as unknown as TOr).oneOf) {
      const sche = sch as unknown as TOr;
      sche.oneOf.forEach((schema) => {
        const r = this.getReportItem({ schema, prefix, isArray });
        report.push(r);
      });
    } else {
      const r = this.getReportItem({ schema: sch, prefix, isArray });
      report.push(r);
    }

    return report;
  };
  private getReportItem = ({ schema: sch, prefix = "", isArray = false }: ReportProps): FieldsReport => {
    const report: Record<string, FieldReport> = {};

    const schema = sch as unknown as TObject;
    for (const [key, value] of Object.entries(schema.properties)) {
      const isRequired = schema?.required ? schema?.required.includes(key) : false;
      const path = this.getPath(isArray, prefix, key);
      if (value.bsonType === BSONType.Object && value.properties) {
        report[path] = {
          path,
          data_type: BSONType.Object,
          description: value?.description,
          required: isRequired,
          title: value.title,
        };

        Object.assign(
          report,
          this.getReport({
            isArray: false,
            schema: value,
            prefix: path,
          }),
        );
      } else if (value.bsonType === BSONType.Array && value.items) {
        report[path] = {
          path,
          data_type: `array<${value.items.bsonType}>`,
          description: value.items?.description,
          required: isRequired,
          title: value.title,
        };

        if (value.items.bsonType === BSONType.Object) {
          Object.assign(
            report,
            this.getReport({
              isArray: true,
              schema: value.items,
              prefix: path,
            }),
          );
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
