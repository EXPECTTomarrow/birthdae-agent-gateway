function contactDetail(row) {
  return {
    ref: { id: row._id, scope: "personal" }, name: row.name || "", gender: row.gender || "", relation: row.relation_type || "",
    birthdayType: row.birthday_type || "公历", birthdayYear: row.birthday_known_year === false ? null : row.birthday_year || null,
    birthdayMonth: row.birthday_month || null, birthdayDay: row.birthday_day || null, phone: row.phone || "", address: row.address || "",
    company: row.company_name || "", interests: row.hobbies || "", skills: row.skills || "", dislikes: row.dislikes || "",
    education: row.education || "", relationNote: row.relation_note || "", giftNote: row.gift_note || "", note: row.remark || "",
  };
}

async function executeContactTool(database, actor, tool, args = {}) {
  if (actor.scope !== "personal") throw new Error("AGENT_SCOPE_NOT_SUPPORTED");
  const contacts = database.collection("contacts");
  if (tool === "contact.search") {
    const name = typeof args.name === "string" ? args.name.trim().slice(0, 50) : "";
    if (!name) throw new Error("CONTACT_NAME_REQUIRED");
    const result = await contacts.where({ openid: actor.openid, name: database.RegExp({ regexp: name, options: "i" }) }).limit(10).get();
    const rows = result.data || [];
    console.info(JSON.stringify({ event: "contact.search", actor: String(actor.openid).slice(-8), name, matches: rows.length }));
    return { tool, status: rows.length === 1 ? "ok" : rows.length ? "ambiguous" : "not_found", contacts: rows.map((row) => {
      const contact = contactDetail(row);
      return { ref: contact.ref, name: contact.name, relation: contact.relation, birthdayMonth: contact.birthdayMonth, birthdayDay: contact.birthdayDay };
    }) };
  }
  if (tool === "contact.details") {
    const id = typeof args.contactId === "string" ? args.contactId.trim().slice(0, 100) : "";
    if (!id) throw new Error("CONTACT_ID_REQUIRED");
    const result = await contacts.where({ _id: id, openid: actor.openid }).limit(1).get();
    return result.data[0] ? { tool, status: "ok", contact: contactDetail(result.data[0]) } : { tool, status: "not_found" };
  }
  throw new Error("AGENT_TOOL_NOT_ALLOWED");
}

module.exports = { executeContactTool };
