import { FieldsReport, SchemaFields } from "../src/fields";
import { BSONType, TObject, TOr } from "../src/shared";

describe("Schema Fields", () => {
  type Test = {
    name: string;
    input: TObject | TOr;
    expected: FieldsReport[];
  };

  const tests: Test[] = [
    // {
    //   name: "Simple Schema",
    //   input: {
    //     bsonType: BSONType.Object,
    //     properties: {
    //       name: { bsonType: BSONType.String },
    //       age: { bsonType: BSONType.Int },
    //     },
    //     required: ["name"],
    //   },
    //   expected: [
    //     {
    //       name: {
    //         data_type: "string",
    //         path: "name",
    //         required: true,
    //         description: undefined,
    //       },
    //       age: {
    //         data_type: "int",
    //         path: "age",
    //         required: false,
    //         description: undefined,
    //       },
    //     },
    //   ],
    // },
    // {
    //   name: "oneOf Simple Schema",
    //   input: {
    //     bsonType: BSONType.Object,
    //     oneOf: [
    //       {
    //         title: "fund-variable",
    //         bsonType: BSONType.Object,
    //         properties: {
    //           _id: {
    //             bsonType: BSONType.ObjectId,
    //           },
    //           type: {
    //             bsonType: BSONType.String,
    //             enum: ["variable"],
    //           },
    //         },
    //         required: ["_id"],
    //       },
    //       {
    //         title: "fund-fixed",
    //         bsonType: BSONType.Object,
    //         properties: {
    //           _id: {
    //             bsonType: BSONType.ObjectId,
    //           },
    //           type: {
    //             bsonType: BSONType.String,
    //             enum: ["fixed"],
    //           },
    //         },
    //         required: ["_id"],
    //       },
    //     ],
    //   },
    //   expected: [
    //     {
    //       _id: {
    //         data_type: "objectId",
    //         path: "_id",
    //         required: true,
    //         description: undefined,
    //       },
    //       type: {
    //         data_type: "enum('variable')",
    //         path: "type",
    //         required: false,
    //         description: undefined,
    //       },
    //     },
    //     {
    //       _id: {
    //         data_type: "objectId",
    //         path: "_id",
    //         required: true,
    //         description: undefined,
    //       },
    //       type: {
    //         data_type: "enum('fixed')",
    //         path: "type",
    //         required: false,
    //         description: undefined,
    //       },
    //     },
    //   ],
    // },
    {
      name: "oneOf Simple Schema",
      input: {
        bsonType: BSONType.Object,
        oneOf: [
          {
            bsonType: BSONType.Object,
            properties: {
              _id: {
                bsonType: BSONType.ObjectId,
              },
              name: {
                bsonType: BSONType.String,
              },
              currency: {
                bsonType: BSONType.String,
                enum: ["USD", "PEN"],
              },
              policy: {
                bsonType: BSONType.String,
              },
              roi_interest: {
                bsonType: BSONType.String,
              },
              investors: {
                bsonType: BSONType.Array,
                items: {
                  bsonType: BSONType.Object,
                  properties: {
                    _id: {
                      bsonType: BSONType.ObjectId,
                    },
                    names: {
                      bsonType: BSONType.String,
                    },
                    lastname_1: {
                      bsonType: BSONType.String,
                    },
                    lastname_2: {
                      bsonType: BSONType.String,
                    },
                  },
                  required: ["_id", "names", "lastname_1", "lastname_2"],
                },
              },
              visible: {
                bsonType: BSONType.Bool,
              },
              investment_amount_min: {
                bsonType: BSONType.Decimal,
              },
              holding_period_min: {
                bsonType: BSONType.String,
              },
              creation_at: {
                bsonType: BSONType.Date,
              },
              updated_at: {
                bsonType: BSONType.Date,
              },
              type: {
                bsonType: BSONType.String,
                enum: ["variable"],
              },
              roi_type: {
                bsonType: BSONType.String,
                enum: ["variable"],
              },
              regulations: {
                bsonType: BSONType.String,
              },
              brochure: {
                bsonType: BSONType.String,
              },
            },
            required: [
              "_id",
              "name",
              "currency",
              "policy",
              "roi_interest",
              "investors",
              "visible",
              "investment_amount_min",
              "holding_period_min",
              "creation_at",
              "updated_at",
              "type",
              "roi_type",
              "regulations",
            ],
          },
          {
            bsonType: BSONType.Object,
            properties: {
              _id: {
                bsonType: BSONType.ObjectId,
              },
              name: {
                bsonType: BSONType.String,
              },
              currency: {
                bsonType: BSONType.String,
                enum: ["USD", "PEN"],
              },
              policy: {
                bsonType: BSONType.String,
              },
              roi_interest: {
                bsonType: BSONType.String,
              },
              investors: {
                bsonType: BSONType.Array,
                items: {
                  bsonType: BSONType.Object,
                  properties: {
                    _id: {
                      bsonType: BSONType.ObjectId,
                    },
                    names: {
                      bsonType: BSONType.String,
                    },
                    lastname_1: {
                      bsonType: BSONType.String,
                    },
                    lastname_2: {
                      bsonType: BSONType.String,
                    },
                  },
                  required: ["_id", "names", "lastname_1", "lastname_2"],
                },
              },
              visible: {
                bsonType: BSONType.Bool,
              },
              investment_amount_min: {
                bsonType: BSONType.Decimal,
              },
              holding_period_min: {
                bsonType: BSONType.String,
              },
              creation_at: {
                bsonType: BSONType.Date,
              },
              updated_at: {
                bsonType: BSONType.Date,
              },
              type: {
                bsonType: BSONType.String,
                enum: ["icp"],
              },
              roi_type: {
                bsonType: BSONType.String,
                enum: ["fixed"],
              },
            },
            required: [
              "_id",
              "name",
              "currency",
              "policy",
              "roi_interest",
              "investors",
              "visible",
              "investment_amount_min",
              "holding_period_min",
              "creation_at",
              "updated_at",
              "type",
              "roi_type",
            ],
          },
        ],
      },
      expected: [
        {
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
        {
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
      ],
    },
  ];

  const schemaFields = new SchemaFields();
  tests.forEach((t) => {
    test(t.name, () => {
      const got = schemaFields.getReport(t.input);
      expect(got).toEqual(t.expected);
    });
  });
});
