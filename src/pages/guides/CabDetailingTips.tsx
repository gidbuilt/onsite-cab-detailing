import { Link } from "react-router-dom";
import { PageMeta } from "../../components/PageMeta";
import { SparkDivider } from "../../components/SparkDivider";

export function CabDetailingTips() {
  return (
    <>
      <PageMeta
        title="Cab Detailing Tips for Heavy Equipment Interiors"
        description="Practical skid steer and excavator cab detailing tips: vacuum technique, dash and vents, floor mats, glass, odour control, and habits that keep cabs cleaner longer."
      />

      <article className="guide-article">
        <header className="page-hero">
          <div className="container">
            <p className="section__eyebrow">
              <Link to="/guides">Guides</Link>
            </p>
            <h1 className="section__title">Cab detailing tips &amp; tricks</h1>
            <p className="section__lede">
              Straightforward methods for cleaning heavy equipment cab
              interiors — useful whether you maintain machines yourself or want
              to understand what a thorough interior detail involves.
            </p>
            <SparkDivider />
          </div>
        </header>

        <div className="container guide-prose">
          <section>
            <h2>Start with debris removal</h2>
            <p>
              Before wiping anything wet, get the loose material out. Shake or
              knock floor mats outside the machine, then vacuum seats, floors,
              and crevices. Work from the top of the cab downward so dust falls
              onto surfaces you have not cleaned yet.
            </p>
            <p>
              Use a crevice tool along seat rails, under pedals, and beside the
              console. On excavator and skid steer cab detailing jobs, those
              edges hold the most grit. A soft brush attachment helps lift dust
              from fabric without grinding it deeper into the weave.
            </p>
          </section>

          <section>
            <h2>Vacuum technique that actually works</h2>
            <p>
              Slow passes beat quick once-overs. Overlap each stroke and linger
              on high-traffic zones: the seat bolster, heel area of the floor,
              and the entry step threshold. If the vacuum has variable suction,
              start moderate on fabric so you do not pull stitching or foam.
            </p>
            <p>
              Empty the vacuum canister or bag before it packs full of fine
              jobsite dust — clogged filters cut suction and leave a haze behind.
              For stubborn mud cakes, let them dry fully, then break them up and
              vacuum rather than smearing wet clay across the floor.
            </p>
          </section>

          <section>
            <h2>Dash, plastics, and vents</h2>
            <p>
              Wipe hard plastics with a damp microfibre cloth and a mild
              interior cleaner safe for vinyl and ABS. Avoid heavy silicone
              dressings that leave a glossy, slippery film on the steering
              wheel or grab handles — operators need grip, not shine.
            </p>
            <p>
              Vents collect dust that the HVAC then redistributes. Use a soft
              brush or compressed air (carefully, at a distance) to loosen
              debris, then wipe the surrounding panel. Clean the area around
              joysticks and switches last so fingerprints do not reappear while
              you work elsewhere.
            </p>
          </section>

          <section>
            <h2>Floor mats and cab floors</h2>
            <p>
              Removable mats should come out of the cab whenever possible. Hose
              or scrub them away from the machine, then dry completely before
              reinstalling. Trapped moisture under a mat is a common source of
              odour and floor corrosion.
            </p>
            <p>
              Vacuum and wipe the bare floor, including corners near the door
              seal. If rubber wear strips or pedals are greasy, degrease lightly
              and dry — oily residue tracks onto boots and then onto every other
              surface.
            </p>
          </section>

          <section>
            <h2>Interior glass and mirrors</h2>
            <p>
              Use a dedicated glass cleaner and a clean microfibre cloth. Wipe
              in a consistent pattern (vertical outside / horizontal inside, or
              similar) so leftover streaks are easier to spot. Clean the top
              edge of the windshield where dust settles out of the airflow.
            </p>
            <p>
              Do not spray cleaner directly onto switches or electronics near
              the glass. Spray the cloth instead, then wipe. Clear side windows
              and any interior mirror glass the same way for full visibility.
            </p>
          </section>

          <section>
            <h2>Odour control without overmasking</h2>
            <p>
              Odours usually come from organic debris, damp mats, or spilled
              drinks — not from a lack of fragrance. Remove the source first:
              vacuum thoroughly, dry wet areas, and clean sticky spills. Baking
              soda on dry fabric (left briefly, then vacuumed) can help with
              mild smells.
            </p>
            <p>
              Strong air fresheners can irritate operators in a closed cab and
              do not fix mildew. If musty smell persists after drying and
              cleaning, inspect under mats and seat bases for trapped moisture
              before adding any scent product.
            </p>
          </section>

          <section>
            <h2>Protective habits between deep cleans</h2>
            <p>
              Knock boots at the door, keep a small trash bag in the cab, and
              wipe glass when film first appears instead of waiting weeks. Cover
              seats when welding or grinding nearby if sparks or dust can enter
              an open door. Small habits stretch the time between full detailing
              sessions.
            </p>
            <p>
              Learn why cleanliness matters in{" "}
              <Link to="/guides/heavy-equipment-cab-cleaning">
                why heavy equipment cab cleaning matters
              </Link>
              , and plan around weather with{" "}
              <Link to="/guides/seasonal-cab-maintenance">
                seasonal cab maintenance
              </Link>
              . More articles live on the{" "}
              <Link to="/guides">guides index</Link>. For North Okanagan mobile
              detailing, see <Link to="/services">services</Link> or{" "}
              <Link to="/book">book</Link>.
            </p>
          </section>
        </div>
      </article>
    </>
  );
}
