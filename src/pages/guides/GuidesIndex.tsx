import { Link } from "react-router-dom";
import { PageMeta } from "../../components/PageMeta";
import { SparkDivider } from "../../components/SparkDivider";

const guides = [
  {
    to: "/guides/heavy-equipment-cab-cleaning",
    title: "Why Heavy Equipment Cab Cleaning Matters",
    lede: "How a cleaner excavator or skid steer cab supports health, visibility, comfort, and equipment longevity.",
  },
  {
    to: "/guides/cab-detailing-tips",
    title: "Cab Detailing Tips & Tricks",
    lede: "Practical methods for vacuuming, dash and vents, floor mats, glass, odour control, and protective habits.",
  },
  {
    to: "/guides/seasonal-cab-maintenance",
    title: "Seasonal Cab Maintenance",
    lede: "How mud, dust, salt, and pollen change through the year — and simple habits that keep interiors manageable.",
  },
];

export function GuidesIndex() {
  return (
    <>
      <PageMeta
        title="Heavy Equipment Cab Cleaning Guides | OnSite Cab Detailing"
        description="Free guides on heavy equipment cab cleaning, excavator and skid steer interior care, detailing tips, and seasonal cab maintenance."
      />

      <section className="page-hero">
        <div className="container">
          <p className="section__eyebrow">Guides</p>
          <h1 className="section__title">Cab care resources</h1>
          <p className="section__lede">
            Straightforward information on keeping heavy equipment cabs clean
            inside — written for operators, owners, and fleet managers who want
            practical guidance.
          </p>
          <SparkDivider />
        </div>
      </section>

      <section className="section section--tight">
        <div className="container guide-index">
          {guides.map((guide) => (
            <article key={guide.to} className="guide-index__item">
              <h2>
                <Link to={guide.to}>{guide.title}</Link>
              </h2>
              <p>{guide.lede}</p>
              <Link className="guide-index__more" to={guide.to}>
                Read guide
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--tight">
        <div className="container guide-footer-nav">
          <p>
            Looking for mobile cab detailing in the North Okanagan?{" "}
            <Link to="/services">View services</Link> or{" "}
            <Link to="/book">book online</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
