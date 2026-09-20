import { Link } from "react-router-dom";
import { SparkDivider } from "../components/SparkDivider";
import { formatMoney } from "../lib/store";
import { useAppData } from "../lib/useAppData";

export function Services() {
  const { data } = useAppData();
  const packages = data.packages;
  const addOns = data.addOns;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="section__eyebrow">Services</p>
          <h1 className="section__title">Mobile Heavy Equipment Cab Detailing</h1>
          <p className="section__lede">
            Professional cab detailing that comes to you — packages for routine
            refresh work through full restoration.
          </p>
          <SparkDivider />
        </div>
      </section>

      <section className="section section--tight">
        <div className="container service-stack">
          {packages.map((tier) => (
            <article
              key={tier.id}
              className={`service-tier${tier.featured ? " service-tier--featured" : ""}`}
            >
              {tier.featured ? (
                <div className="service-tier__badge">
                  <span className="spark" aria-hidden="true" />
                  Most Popular
                </div>
              ) : null}

              <div className="service-tier__copy">
                <h2>{tier.name}</h2>
                <p className="service-tier__price">
                  <span>Starting at</span>
                  <s className="service-tier__original">
                    {formatMoney(tier.originalPrice)}
                  </s>
                  <span className="service-tier__sale">
                    {formatMoney(tier.price)}
                  </span>
                </p>
                <p className="service-tier__desc">{tier.description}</p>
              </div>

              <div className="service-tier__body">
                <ul className="checklist">
                  {tier.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {tier.note ? (
                  <p className="note" style={{ marginTop: "1rem" }}>
                    {tier.note}
                  </p>
                ) : null}
              </div>

              <div className="service-tier__meta">
                {tier.time ? (
                  <p className="service-tier__time">
                    Estimated Time: <strong>{tier.time}</strong>
                  </p>
                ) : (
                  <p className="service-tier__time">
                    Custom timing based on condition
                  </p>
                )}
                <Link className="btn btn--primary" to="/book">
                  Book Now
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container info-grid">
          <div className="info-panel">
            <h3>Add-On Services</h3>
            <ul className="addon-list">
              {addOns.map((item) => (
                <li key={item.id}>
                  <span>{item.name}</span>
                  <strong>
                    {item.price == null
                      ? item.priceLabel || "Quoted"
                      : formatMoney(item.price)}
                  </strong>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="info-panel">
              <h3>Fleet Pricing</h3>
              <p>Have multiple machines?</p>
              <p>
                We offer discounted pricing for contractors, municipalities,
                farms, and equipment fleets.
              </p>
              <p style={{ marginTop: "1.25rem" }}>
                <a className="btn btn--outline" href="tel:+12509387938">
                  Request a Custom Fleet Quote
                </a>
              </p>
            </div>

            <div className="info-panel" style={{ marginTop: "2rem" }}>
              <h3>Service Area</h3>
              <p>
                Proudly providing mobile heavy equipment cab detailing throughout
                the North Okanagan.
              </p>
              <p>
                We come to your jobsite, yard, farm, or equipment storage
                location.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="closing" id="book">
        <div className="container">
          <p className="section__eyebrow">Get Started</p>
          <h2 className="section__title">Ready for a Cleaner Cab?</h2>
          <SparkDivider />
          <p className="section__lede" style={{ marginInline: "auto" }}>
            Call now!
          </p>
          <div className="closing__actions">
            <a className="btn btn--primary" href="tel:+12509387938">
              250-938-7938
            </a>
          </div>
          <p className="closing__or">Or</p>
          <div className="closing__actions">
            <Link className="btn btn--outline" to="/book">
              Book Online
            </Link>
          </div>
          <p className="closing__tagline">Cleaner cab. Better day.</p>
        </div>
      </section>
    </>
  );
}
