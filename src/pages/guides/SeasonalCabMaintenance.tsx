import { Link } from "react-router-dom";
import { PageMeta } from "../../components/PageMeta";
import { SparkDivider } from "../../components/SparkDivider";

export function SeasonalCabMaintenance() {
  return (
    <>
      <PageMeta
        title="Seasonal Heavy Equipment Cab Maintenance Guide"
        description="Seasonal cab maintenance for mud, dust, road salt, and pollen — habits that keep excavator and skid steer interiors cleaner year-round."
      />

      <article className="guide-article">
        <header className="page-hero">
          <div className="container">
            <p className="section__eyebrow">
              <Link to="/guides">Guides</Link>
            </p>
            <h1 className="section__title">
              Seasonal cab maintenance for heavy equipment
            </h1>
            <p className="section__lede">
              Jobsite dirt changes with the calendar. Matching your cab care
              habits to mud season, dry dust, winter salt, and spring pollen
              keeps interiors easier to manage all year.
            </p>
            <SparkDivider />
          </div>
        </header>

        <div className="container guide-prose">
          <section>
            <h2>Spring: mud and meltwater</h2>
            <p>
              Thaw and rain turn yards into mud baths. Operators track wet clay
              onto mats and thresholds, where it dries into hard crusts that
              grind into floor coverings. Scrape or knock boots before entry
              whenever possible, and empty mats more often during prolonged wet
              spells.
            </p>
            <p>
              Moisture is the hidden spring problem. Wet mats left overnight in
              a closed cab encourage mildew and odour. After muddy shifts, lift
              mats to dry, wipe standing water from the floor, and crack a
              window briefly if the machine is parked securely and weather
              allows.
            </p>
            <p>
              Spring is also a good time for a deeper heavy equipment cab
              cleaning after winter. Clear salt residue, vacuum winter grit from
              seat rails, and check that door seals are free of packed debris so
              they close cleanly.
            </p>
          </section>

          <section>
            <h2>Summer: dust and heat</h2>
            <p>
              Dry roads and excavation work fill the air with fine dust that
              settles on every horizontal surface. HVAC systems pull some of
              that dust into vents and recirculate it. Wipe dash plastics and
              vacuum fabric more frequently in peak dust months, even if the cab
              does not look “muddy.”
            </p>
            <p>
              Heat softens spilled drinks and makes plasticizers in vinyl feel
              tackier, so fingerprints and film show sooner. Keep a microfibre
              cloth handy for glass — summer glare makes haze more noticeable
              and more distracting for the operator.
            </p>
            <p>
              If the cab sits in direct sun with windows closed, interior
              surfaces get hot. Avoid leaving aerosol cleaners or solvent-based
              products in the cab where cans can overheat. Store supplies in a
              toolbox or service truck instead.
            </p>
          </section>

          <section>
            <h2>Fall: pollen, leaves, and prep for wet weather</h2>
            <p>
              Pollen coats glass and intake areas, leaving a yellow film that
              smears when wiped with a dry cloth. Use a slightly damp cleaner
              on glass and wipe vents so pollen does not keep circulating.
              Operators with allergies often notice cab air quality most in this
              season.
            </p>
            <p>
              Leaves and organic debris blow into open doors and collect in
              floor corners. Remove them before they trap moisture against the
              floor. Fall is also the moment to confirm mats drain well and that
              any tears are patched or replaced before winter mud returns.
            </p>
          </section>

          <section>
            <h2>Winter: salt, sand, and condensation</h2>
            <p>
              Road salt and sand hitch a ride on boots and then grind into mats.
              Salt residue is corrosive when combined with moisture, so rinse or
              scrub mats regularly and wipe metal thresholds. Do not let salty
              sludge sit under a mat for weeks.
            </p>
            <p>
              Cold weather increases condensation on glass when warm operators
              climb into a cold cab. Keep a clean cloth available and clear
              interior fog promptly. Persistent fog that smells musty can signal
              damp flooring or a cabin filter that needs attention as part of
              wider machine maintenance.
            </p>
            <p>
              Ice scrapers and tools tossed on the dash can scratch plastic and
              glass. Give them a dedicated pocket or bag so seasonal gear does
              not become cab clutter.
            </p>
          </section>

          <section>
            <h2>Year-round habits that scale with the season</h2>
            <p>
              Adjust frequency, not the fundamentals: remove loose debris,
              dry wet areas, wipe glass, and vacuum fabric. In muddy or salty
              months, emphasize mats and floors. In dusty or pollen-heavy
              months, emphasize surfaces, vents, and glass.
            </p>
            <p>
              For background on why this work pays off, read{" "}
              <Link to="/guides/heavy-equipment-cab-cleaning">
                why heavy equipment cab cleaning matters
              </Link>
              . For step-by-step methods, see{" "}
              <Link to="/guides/cab-detailing-tips">cab detailing tips</Link>.
              All articles are listed on the{" "}
              <Link to="/guides">guides index</Link>. Explore{" "}
              <Link to="/services">services</Link> or{" "}
              <Link to="/book">book</Link> if you need a mobile detail in the
              North Okanagan.
            </p>
          </section>
        </div>
      </article>
    </>
  );
}
