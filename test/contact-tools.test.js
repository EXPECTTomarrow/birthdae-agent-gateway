const test = require("node:test");
const assert = require("node:assert/strict");
const { executeContactTool } = require("../src/contact-tools");

test("contact search scopes the database query by actor and filters matching names locally", async () => {
  let query;
  const database = {
    collection(name) {
      assert.equal(name, "contacts");
      return {
        where(condition) {
          query = condition;
          return {
            limit(limit) {
              assert.equal(limit, 500);
              return {
                async get() {
                  return { data: [
                    { _id: "contact-1", name: "王芳", openid: "user-1", birthday_month: 5, birthday_day: 20 },
                    { _id: "contact-2", name: "张三", openid: "user-1" },
                    { _id: "contact-3", name: "王芳的妈妈", openid: "user-1" },
                  ] };
                },
              };
            },
          };
        },
      };
    },
  };

  const result = await executeContactTool(database, { scope: "personal", openid: "user-1" }, "contact.search", { name: "王芳" });

  assert.deepEqual(query, { openid: "user-1" });
  assert.equal(result.status, "ok");
  assert.deepEqual(result.contacts.map((contact) => contact.name), ["王芳"]);
});
