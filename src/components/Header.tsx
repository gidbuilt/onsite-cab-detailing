import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { Link, NavLink } from "react-router-dom";

const PHONE_TEL = "tel:+12509387938";
const PHONE_DISPLAY = "250-938-7938";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/services", label: "Services", end: false },
  { to: "/book", label: "Book Now", end: false },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [calling, setCalling] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!calling) return;
    const timer = window.setTimeout(() => setCalling(false), 2500);
    return () => window.clearTimeout(timer);
  }, [calling]);

  function handleCallClick(event: MouseEvent<HTMLAnchorElement>) {
    setOpen(false);
    setCalling(true);
    // Force dialer open — more reliable than relying only on href in some previews.
    event.preventDefault();
    window.setTimeout(() => {
      window.location.href = PHONE_TEL;
    }, 0);
  }

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <Link to="/" className="brand" onClick={() => setOpen(false)}>
            <img
              className="brand__logo"
              src={`${import.meta.env.BASE_URL}logo.png?v=18`}
              alt="OnSite Cab Detailing"
            />
          </Link>

          <nav className="nav" aria-label="Primary">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <a
              className="btn btn--primary header-cta"
              href={PHONE_TEL}
              onClick={handleCallClick}
              aria-label={`Call OnSite Cab Detailing at ${PHONE_DISPLAY}`}
            >
              <span className="header-cta__label">{PHONE_DISPLAY}</span>
              <span className="header-cta__short">Call</span>
            </a>

            <button
              className="menu-toggle"
              type="button"
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {calling ? (
        <div className="call-toast" role="status" aria-live="polite">
          Opening call to {PHONE_DISPLAY}…
        </div>
      ) : null}

      <nav
        className={`mobile-nav${open ? " is-open" : ""}`}
        aria-label="Mobile"
      >
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}
        <a
          className="btn btn--primary"
          href={PHONE_TEL}
          onClick={handleCallClick}
          aria-label={`Call OnSite Cab Detailing at ${PHONE_DISPLAY}`}
        >
          Call {PHONE_DISPLAY}
        </a>
      </nav>
    </>
  );
}
