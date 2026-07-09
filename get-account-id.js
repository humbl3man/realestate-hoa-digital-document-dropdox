const Database = require("better-sqlite3");
const db = new Database("sqlite.db");
const user = db.prepare("SELECT stripe_account_id FROM user WHERE stripe_account_id IS NOT NULL LIMIT 1").get();
console.log(user ? user.stripe_account_id : "No connected account found");
