import { Link } from "react-router-dom";
import { SparkDivider } from "../components/SparkDivider";

export function Home() {
  return (
    <>
      <section className="hero" aria-label="OnSite Cab Detailing">
        <div className="hero__media" aria-hidden="true">
          <img
            src={`${import.meta.env.BASE_URL}hero-cab.jpg`}
            alt="OnSite Cab Detailing cleaning a CAT excavator cab on site"
            fetchPriority="high"
          />
          <div className="hero__shade" />
        </div>

        <div className="hero__content">
          <h1 className="hero__title">
            Cleaner Cab.
            <br />
            <em>Better Day.</em>
          </h1>
          <p className="hero__lede">
            Mobile equipment cab detailing serving the North Okanagan — we come
            to your jobsite, yard, or farm.
          </p>
          <div className="hero__actions">
            <Link className="btn btn--primary" to="/services">
              View Services
            </Link>
            <Link className="btn btn--ghost" to="/book">
              Book Now
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="section__eyebrow">Why OnSite</p>
            <h2 className="section__title">A cleaner workspace, on your site</h2>
            <p className="section__lede">
              Built for contractors, municipalities, farms, and equipment fleets
              that need a professional cab refresh without hauling machines off
              site.
            </p>
            <SparkDivider />
          </div>

          <div className="feature-strip">
            <article className="feature">
              <h3>Fully Mobile</h3>
              <p>
                We detail at your jobsite, yard, farm, or equipment storage
                location across the North Okanagan.
              </p>
            </article>
            <article className="feature">
              <h3>Heavy Equipment Focus</h3>
              <p>
                Specialized cab interiors — from regular refresh details to full
                restorations for neglected machines.
              </p>
            </article>
            <article className="feature">
              <h3>Fleet Ready</h3>
              <p>
                Discounted pricing for multiple machines. Request a custom quote
                for contractors and municipalities.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <div className="section-head">
            <p className="section__eyebrow">Packages</p>
            <h2 className="section__title">Starting at $199</h2>
            <p className="section__lede">
              Choose a Refresh Detail, Full Interior Detail, or Cab Restoration —
              plus add-ons when you need them.
            </p>
          </div>
          <Link className="btn btn--outline" to="/services">
            See All Services
          </Link>
        </div>
      </section>

      <section className="section cta-band" id="book">
        <div className="container cta-band__inner">
          <div>
            <h2>Ready for a cleaner cab?</h2>
            <p>
              Call now to book, or browse packages and request fleet pricing
              online.
            </p>
            <p style={{ marginTop: "1.25rem" }}>
              <a className="phone-link" href="tel:+12509387938">
                250-938-7938
              </a>
            </p>
          </div>
          <div className="cta-band__actions">
            <a className="btn btn--light" href="tel:+12509387938">
              Call Now
            </a>
            <Link className="btn btn--ghost" to="/book">
              Book Online
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
