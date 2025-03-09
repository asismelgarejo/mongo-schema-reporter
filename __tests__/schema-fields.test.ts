import { FieldsReportHashMap, SchemaFields } from "../src/fields";
import { BSONType, STATIC_WORDS, TObject, TOr } from "../src/shared";

describe("Schema Fields", () => {
  type Test = {
    name: string;
    input: TObject | TOr;
    expected: FieldsReportHashMap[];
  };

  const tests: Test[] = [
    {
      name: "Simple Schema",
      input: {
        bsonType: BSONType.Object,
        properties: {
          name: { bsonType: BSONType.String },
          age: { bsonType: BSONType.Int },
        },
        required: ["name"],
      },
      expected: [
        {
          title: STATIC_WORDS.UnnamedSchema,
          fieldsHashMap: {
            name: {
              data_type: "string",
              path: "name",
              required: true,
              description: undefined,
            },
            age: {
              data_type: "int",
              path: "age",
              required: false,
              description: undefined,
            },
          },
        },
      ],
    },
    {
      name: "oneOf Simple Schema",
      input: {
        bsonType: BSONType.Object,
        oneOf: [
          {
            title: "fund-variable",
            bsonType: BSONType.Object,
            properties: {
              _id: {
                bsonType: BSONType.ObjectId,
              },
              type: {
                bsonType: BSONType.String,
                enum: ["variable"],
              },
            },
            required: ["_id"],
          },
          {
            title: "fund-fixed",
            bsonType: BSONType.Object,
            properties: {
              _id: {
                bsonType: BSONType.ObjectId,
              },
              type: {
                bsonType: BSONType.String,
                enum: ["fixed"],
              },
            },
            required: ["_id"],
          },
        ],
      },
      expected: [
        {
          title: "fund-variable",
          fieldsHashMap: {
            _id: {
              data_type: "objectId",
              path: "_id",
              required: true,
              description: undefined,
            },
            type: {
              data_type: "enum('variable')",
              path: "type",
              required: false,
              description: undefined,
            },
          },
        },
        {
          title: "fund-fixed",
          fieldsHashMap: {
            _id: {
              data_type: "objectId",
              path: "_id",
              required: true,
              description: undefined,
            },
            type: {
              data_type: "enum('fixed')",
              path: "type",
              required: false,
              description: undefined,
            },
          },
        },
      ],
    },
  ];

  const schemaFields = SchemaFields.create();
  tests.forEach((t) => {
    test(t.name, () => {
      const got = schemaFields.process(t.input).raw();
      expect(got).toEqual(t.expected);
    });
  });
});
