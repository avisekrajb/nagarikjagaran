require("dotenv").config();
const app = require("./src/app");
const { initDB, pool } = require("./src/config/db");

const PORT = Number(process.env.PORT || 5000);

/* nodemon बदल्दा पुरानो प्रोसेसले port छोडे पछि नयाँ सुरु होस् भन्ने —
   EADDRINUSE हटाउन केही पर्खनेर दोस्रो प्रयास गर्छौं। */
const RETRIES = 6;
const RETRY_MS = 700;

let server = null;
let shuttingDown = false;

const start = (attempt = 1) => {
  server = app.listen(PORT);

  server.once("listening", () => {
    console.log(`Nagarik API running on http://localhost:${PORT}`);
  });

  server.once("error", (err) => {
    if (err.code === "EADDRINUSE" && attempt < RETRIES) {
      console.warn(
        `port ${PORT} अझै छुटेन (प्रयास ${attempt}/${RETRIES}) — ${RETRY_MS}ms पर्खेर पुनः प्रयास…`
      );
      setTimeout(() => start(attempt + 1), RETRY_MS);
      return;
    }

    if (err.code === "EADDRINUSE") {
      /* अर्को नोड प्रोसेसले port ओगटेको छ — थप कडा stack नदेखाई सक्छौं। */
      console.error(
        `\n✖ port ${PORT} अझै प्रयोगमा छ।\n` +
        `  अर्को Nagarik API चलिरहेको छ जस्तो देखिन्छ।\n` +
        `  समाधान : पुरानो प्रोसेस रोक्नुहोस्, वा .env मा PORT बदल्नुहोस्।\n`
      );
      shutdown(1);
      return;
    }

    console.error("Server error:", err.message);
    shutdown(1);
  });
};

/** नमस्ते — port र DB दुवै सफा गरी बाहिरिन्छ। */
function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  const finish = () => {
    Promise.resolve(pool && pool.end && pool.end())
      .catch(() => {})
      .then(() => process.exit(code));
  };

  if (server && server.listening) {
    server.close(() => finish());
    /* खुल्ला connection (जस्तै keep-alive) ले झुक्न नदिने ठूलो timeout */
    setTimeout(finish, 3000).unref();
  } else {
    finish();
  }
}

process.on("SIGTERM", () => shutdown(0));   // nodemon/Ctrl+C
process.on("SIGINT", () => shutdown(0));

initDB()
  .then(() => console.log("Database ready:", process.env.DB_NAME))
  .catch((e) => console.warn("DB init failed (fallback mode):", e.message))
  .then(() => start());
