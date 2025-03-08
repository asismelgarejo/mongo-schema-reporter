import { SchemaFields } from "../src/fields";
import { BSONType, TObject } from "../src/shared";

// const obj: TOr = {
//   bsonType: BSONType.Object,
//   oneOf: [
//     {
//       bsonType: BSONType.Object,
//       properties: {
//         _id: {
//           bsonType: BSONType.ObjectId,
//         },
//         name: {
//           bsonType: BSONType.String,
//         },
//         currency: {
//           bsonType: BSONType.String,
//           enum: ["USD", "PEN"],
//         },
//         policy: {
//           bsonType: BSONType.String,
//         },
//         roi_interest: {
//           bsonType: BSONType.String,
//         },
//         investors: {
//           bsonType: BSONType.Array,
//           items: {
//             bsonType: BSONType.Object,
//             properties: {
//               _id: {
//                 bsonType: BSONType.ObjectId,
//               },
//               names: {
//                 bsonType: BSONType.String,
//               },
//               lastname_1: {
//                 bsonType: BSONType.String,
//               },
//               lastname_2: {
//                 bsonType: BSONType.String,
//               },
//             },
//             required: ["_id", "names", "lastname_1", "lastname_2"],
//           },
//         },
//         visible: {
//           bsonType: BSONType.Bool,
//         },
//         investment_amount_min: {
//           bsonType: BSONType.Decimal,
//         },
//         holding_period_min: {
//           bsonType: BSONType.String,
//         },
//         creation_at: {
//           bsonType: BSONType.Date,
//         },
//         updated_at: {
//           bsonType: BSONType.Date,
//         },
//         type: {
//           bsonType: BSONType.String,
//           enum: ["variable"],
//         },
//         roi_type: {
//           bsonType: BSONType.String,
//           enum: ["variable"],
//         },
//         regulations: {
//           bsonType: BSONType.String,
//         },
//         brochure: {
//           bsonType: BSONType.String,
//         },
//       },
//       required: [
//         "_id",
//         "name",
//         "currency",
//         "policy",
//         "roi_interest",
//         "investors",
//         "visible",
//         "investment_amount_min",
//         "holding_period_min",
//         "creation_at",
//         "updated_at",
//         "type",
//         "roi_type",
//         "regulations",
//       ],
//     },
//     {
//       bsonType: BSONType.Object,
//       properties: {
//         _id: {
//           bsonType: BSONType.ObjectId,
//         },
//         name: {
//           bsonType: BSONType.String,
//         },
//         currency: {
//           bsonType: BSONType.String,
//           enum: ["USD", "PEN"],
//         },
//         policy: {
//           bsonType: BSONType.String,
//         },
//         roi_interest: {
//           bsonType: BSONType.String,
//         },
//         investors: {
//           bsonType: BSONType.Array,
//           items: {
//             bsonType: BSONType.Object,
//             properties: {
//               _id: {
//                 bsonType: BSONType.ObjectId,
//               },
//               names: {
//                 bsonType: BSONType.String,
//               },
//               lastname_1: {
//                 bsonType: BSONType.String,
//               },
//               lastname_2: {
//                 bsonType: BSONType.String,
//               },
//             },
//             required: ["_id", "names", "lastname_1", "lastname_2"],
//           },
//         },
//         visible: {
//           bsonType: BSONType.Bool,
//         },
//         investment_amount_min: {
//           bsonType: BSONType.Decimal,
//         },
//         holding_period_min: {
//           bsonType: BSONType.String,
//         },
//         creation_at: {
//           bsonType: BSONType.Date,
//         },
//         updated_at: {
//           bsonType: BSONType.Date,
//         },
//         type: {
//           bsonType: BSONType.String,
//           enum: ["icp"],
//         },
//         roi_type: {
//           bsonType: BSONType.String,
//           enum: ["fixed"],
//         },
//       },
//       required: [
//         "_id",
//         "name",
//         "currency",
//         "policy",
//         "roi_interest",
//         "investors",
//         "visible",
//         "investment_amount_min",
//         "holding_period_min",
//         "creation_at",
//         "updated_at",
//         "type",
//         "roi_type",
//       ],
//     },
//   ],
// };

const obj: TObject = {
  bsonType: BSONType.Object,
  properties: {
    investors: {
      bsonType: BSONType.Array,
      items: {
        bsonType: BSONType.Object,
        properties: {
          _id: {
            bsonType: BSONType.ObjectId,
          },
          account: {
            bsonType: BSONType.Object,
            oneOf: [
              {
                bsonType: BSONType.Object,
                title: "AccountOpened",
                properties: {
                  _id: {
                    bsonType: BSONType.ObjectId,
                    description: "Campo de identificación"
                  },
                  status: {
                    bsonType: BSONType.String,
                    enum: ["opened"]
                  },
                },
              },
              {
                bsonType: BSONType.Object,
                title: "AccountClosed",
                properties: {
                  _id: {
                    bsonType: BSONType.ObjectId,
                  },
                  status: {
                    bsonType: BSONType.String,
                    enum: ["closed"]
                  },
                },
              },
            ],
          },
        },
        required: ["_id", "names", "lastname_1", "lastname_2"],
      },
    },
  },
};
const schemaFields = SchemaFields.create();
const got = schemaFields.process(obj).toArrays();

console.log(got);
