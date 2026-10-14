import React from "react";
import { Link } from "react-router-dom";
import { absoluteUrl } from "../../services/api";
import { useSite } from "../../context/SiteContext";

export default function Brand({ to = "/", large = false }) {
  const { site, loaded } = useSite();
  const hasLogo = loaded && !!site.logo;
  return (
    <Link to={to} className={`brand-lockup${large ? " brand-lockup-lg" : ""}`} aria-label="नागरिक NEWS">
      {hasLogo ? (
        <span className="brand-logo-img"><img src={absoluteUrl(site.logo)} alt="नागरिक NEWS" /></span>
      ) : (
        <>
          <span className="brand-mark">न</span>
          <span><strong>नागरिक</strong><small>NEWS</small></span>
        </>
      )}
    </Link>
  );
}