import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Send, Check, AlertCircle } from "lucide-react";
import { categories } from "../../services/newsService";
import { subscribeEmail } from "../../services/newsService";

export default function FooterLinks({ data = {} }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setError("");
    try {
      await subscribeEmail(email.trim());
      setDone(true);
      setEmail("");
      setTimeout(() => setDone(false), 3200);
    } catch (err) {
      setError(err.message || "सब्सक्राइब गर्न सकिएन");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="footer-cards">
      <div className="footer-card fc-1">
        <h3>{data.motto || "निष्पक्ष र विश्वसनीय पत्रकारिता"}</h3>
        <div className="link-col">
          <p>{data.editor || "सम्पादक: कृष्णप्रसाद मरासिनी / ९८४१३७२४६०"}</p>
          <p>{data.registration || "दर्ता प्रमाणपत्र नं.: ३१३१-२०७८/७९"}</p>
          <p>{data.press_council || "प्रेस काउन्सिल नं.: ३१४७-२०७८/७९"}</p>
          <p>{data.company_reg || "कम्पनी रजिस्टरको कार्यालय.: २७०१६९/०७८/०७९"}</p>
        </div>
      </div>
      <div className="footer-card fc-2">
        <h3>महत्वपूर्ण लिंक</h3>
        <div className="link-col">
          <Link to="/">गृहपृष्ठ</Link>
          <Link to="/search">समाचार खोज्नुहोस्</Link>
          <a href="#about">हाम्रो बारेमा</a>
          <a href="#contact">सम्पर्क</a>
        </div>
      </div>
      <div className="footer-card fc-3">
        <h3>श्रेणी</h3>
        <div className="link-col footer-cat-grid">
          {categories.map((c) => <Link key={c.path} to={c.path}>{c.label || c.name}</Link>)}
        </div>
      </div>
      <div className="footer-card fc-4">
        <h3>SUBSCRIBE</h3>
        <div className="link-col">
          <p>हाम्रा नयाँ समाचार सीधै तपाईंको इमेलमा पाउनुहोस्।</p>
          <form onSubmit={subscribe} className="subscribe-form">
            <div className="subscribe-input-wrap">
              <Mail size={15} className="subscribe-mail-icon" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="इमेल ठेगाना लेख्नुहोस्..."
                aria-label="इमेल ठेगाना"
              />
            </div>
            <button type="submit" disabled={done || busy} className="subscribe-btn">
              {done ? <Check size={16} /> : <Send size={16} />}
              {done ? "SUBSCRIBED!" : busy ? "..." : "SUBSCRIBE"}
            </button>
            {error && <p className="flex items-center gap-1.5 text-xs font-bold text-red-600"><AlertCircle size={13} /> {error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}