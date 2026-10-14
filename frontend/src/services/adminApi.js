import { API_URL } from "./api";

const token = () => localStorage.getItem("nagarik_admin_token") || "";

async function send(path, method = "GET", body = null) {
  const headers = {};
  if (body && !(body instanceof FormData)) headers["Content-Type"] = "application/json";
  const t = token();
  if (t) headers["Authorization"] = `Bearer ${t}`;
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = new Error(data.message || "अनुरोध असफल भयो");
    e.data = data;
    e.status = res.status;
    throw e;
  }
  return data;
}

export const adminApi = {
  login: (email, password) => send("/auth/login", "POST", { email, password }),
  me: () => send("/auth/me"),
  changePassword: (currentPassword, newPassword, masterPassword) =>
    send("/auth/change-password", "POST", { currentPassword, newPassword, masterPassword }),
  updateProfile: (name) => send("/auth/profile", "PUT", { name }),

  // एडमिन खाता व्यवस्थापन
  listAdmins: () => send("/admins"),
  createAdmin: (data) => send("/admins", "POST", data),
  updateAdmin: (id, data) => send(`/admins/${id}`, "PUT", data),
  resetAdminPassword: (id, password) => send(`/admins/${id}/password`, "PATCH", { password }),
  deleteAdmin: (id) => send(`/admins/${id}`, "DELETE"),

  // तथ्याङ्क
  dashboard: (range = "week") => send(`/stats/dashboard?range=${range}`),
  visitorStats: (range = "week") => send(`/stats/visitors?range=${range}`),
  activityLogs: () => send("/stats/logs"),

  // पात्रो व्यवस्थापन
  patroSettings: () => send("/patro/settings"),
  updatePatroSettings: (data) => send("/patro/settings", "PUT", data),
  patroHolidays: () => send("/patro/holidays"),
  createPatroHoliday: (data) => send("/patro/holidays", "POST", data),
  updatePatroHoliday: (id, data) => send(`/patro/holidays/${id}`, "PUT", data),
  deletePatroHoliday: (id) => send(`/patro/holidays/${id}`, "DELETE"),
  syncPatro: (year, month, count = 12) =>
    send("/patro/sync", "POST", { year, month, count }),

  // watermark
  getWatermark: () => send("/watermark"),
  updateWatermark: (data) => send("/watermark", "PUT", data),

  listNews: () => send("/news"),
  // एडमिन प्यानल : पेज-वाइज़ पागिनेसन + खोज + श्रेणी गणना
  manageNews: ({ page = 1, limit = 20, q = "", category = "" } = {}) =>
    send(`/manage/news?page=${page}&limit=${limit}&q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}`),
  createNews: (fd) => send("/news", "POST", fd),
  updateNews: (id, fd) => send(`/news/${id}`, "PUT", fd),
  deleteNews: (id) => send(`/news/${id}`, "DELETE"),
  listAds: () => send("/ads"),
  createAd: (fd) => send("/ads", "POST", fd),
  updateAd: (id, fd) => send(`/ads/${id}`, "PUT", fd),
  deleteAd: (id) => send(`/ads/${id}`, "DELETE"),
  getFooter: () => send("/footer"),
  updateFooter: (data) => send("/footer", "PUT", data),
  upload: (fd) => send("/upload", "POST", fd),
  listSubscribers: () => send("/subscribers"),
  deleteSubscriber: (id) => send(`/subscribers/${id}`, "DELETE"),
  listComments: () => send("/comments"),
  deleteComment: (id) => send(`/comments/${id}`, "DELETE"),
  listReels: () => send("/reels"),
  createReel: (fd) => send("/reels", "POST", fd),
  updateReel: (id, fd) => send(`/reels/${id}`, "PUT", fd),
  deleteReel: (id) => send(`/reels/${id}`, "DELETE"),
  getHeaderPhoto: () => send("/header-photo"),
  updateHeaderPhoto: (fd) => send("/header-photo", "PUT", fd),
  listTeam: () => send("/team"),
  createTeam: (fd) => send("/team", "POST", fd),
  updateTeam: (id, fd) => send(`/team/${id}`, "PUT", fd),
  deleteTeam: (id) => send(`/team/${id}`, "DELETE"),
  listContacts: () => send("/contacts"),
  deleteContact: (id) => send(`/contacts/${id}`, "DELETE")
};

/* ==========================================================
   v2 · सुपर एडमिनका API (सबैमा backend ले requireSuper जाँच्छ)
   ========================================================== */
export const superApi = {
  getSettings: () => send("/superadmin/settings"),
  saveSettings: (data) => send("/superadmin/settings", "PUT", data),

  getNav: () => send("/superadmin/nav"),
  saveNav: (items) => send("/superadmin/nav", "PUT", { items }),

  listAdmins: () => send("/superadmin/admins"),
  setRole: (id, role) => send(`/superadmin/admins/${id}/role`, "PUT", { role }),
  setLocked: (id, locked) => send(`/superadmin/admins/${id}/lock`, "PUT", { locked }),

  listPolls: () => send("/superadmin/polls"),
  createPoll: (data) => send("/superadmin/polls", "POST", data),
  deletePoll: (id) => send(`/superadmin/polls/${id}`, "DELETE"),
  togglePoll: (id, active) => send(`/superadmin/polls/${id}/active`, "PUT", { active }),

  listScores: () => send("/superadmin/scores"),
  createScore: (data) => send("/superadmin/scores", "POST", data),
  updateScore: (id, data) => send(`/superadmin/scores/${id}`, "PUT", data),
  deleteScore: (id) => send(`/superadmin/scores/${id}`, "DELETE"),

  listAdPositions: () => send("/superadmin/ad-positions"),
  createAdPosition: (data) => send("/superadmin/ad-positions", "POST", data),
  updateAdPosition: (id, data) => send(`/superadmin/ad-positions/${id}`, "PUT", data),
  deleteAdPosition: (id) => send(`/superadmin/ad-positions/${id}`, "DELETE"),

  /* मालिकको अनुमति बाटोका परिवर्तन अनुरोध */
  listChanges: (status) => send(`/superadmin/changes${status ? `?status=${status}` : ""}`),
  cancelChange: (id) => send(`/superadmin/changes/${id}`, "DELETE"),

  testAlert: () => send("/superadmin/alert-test")
};

/* ---- सार्वजनिक (लगइन चाहिँदैन) ---- */
export const publicApi = {
  config: () => send("/v2/public/config"),
  polls: () => send("/v2/public/polls"),
  vote: (pollId, optionId, voterKey) =>
    send(`/v2/public/polls/${pollId}/vote`, "POST", { option_id: optionId, voter_key: voterKey }),
  scores: () => send("/v2/public/scores"),

  /* इमेलको लिंक → ४ अङ्कको OTP */
  changeRequest: (key) => send(`/v2/public/change/${key}`),
  verifyOtp: (key, otp) => send(`/v2/public/change/${key}/verify`, "POST", { otp }),

  /* बिर्सनुभएको पासवर्ड — ४ अङ्कको OTP बाट */
  forgotSend: (email) => send("/v2/public/forgot/send", "POST", { email }),
  forgotReset: (email, otp, password) =>
    send("/v2/public/forgot/reset", "POST", { email, otp, password })
};

/* ==========================================================
   सुपर-सुपर एडमिन — हेर्न सक्छ, पासवर्ड मात्र बदल्छ
   ========================================================== */
export const superSuperApi = {
  listAdmins: () => send("/supersuper/admins"),
  listChanges: (status) => send(`/supersuper/changes${status ? `?status=${status}` : ""}`),
  /* अघिल्लो पासवर्ड अनिवार्य + मालिकको OTP */
  changePassword: (id, previousPassword, newPassword) =>
    send(`/supersuper/admins/${id}/password`, "POST", { previousPassword, newPassword })
};