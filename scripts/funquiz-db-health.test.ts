import assert from "node:assert/strict";
import { isFunquizMigrationRequired } from "../lib/funquiz/funquiz-db-health";

assert.equal(isFunquizMigrationRequired({ message: "relation does not exist" }), false);

assert.equal(
  isFunquizMigrationRequired({
    message: 'relation "public.funquiz_rooms" does not exist',
    code: "42P01",
  }),
  true,
);

assert.equal(
  isFunquizMigrationRequired({
    message:
      "Could not find the table 'public.funquiz_rooms' in the schema cache",
    code: "PGRST205",
  }),
  true,
);

console.log("funquiz-db-health unit OK");
