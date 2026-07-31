import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { SparkDivider } from "../components/SparkDivider";

const packages = [
  { id: "refresh", name: "Refresh Detail", price: "From $199", duration: "1.5–2 hours" },
  { id: "full", name: "Full Interior Detail", price: "From $299", duration: "3–4.5 hours" },
  { id: "restoration", name: "Cab Restoration", price: "From $399", duration: "Custom" },
] as const;

const morningSlots = [
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
];

const afternoonSlots = [
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
];

/** Mon–Thu evenings only — available from 5:30 PM. */
const weekdayEveningSlots = [
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
  "8:00 PM",
];

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function dayOfWeek(value: string) {
  return parseLocalDate(value).getDay();
}

/** Sun: no mornings. Wed: closed. Mon–Thu: evenings from 5:30. Fri–Sat: day slots. */
function slotsForDate(value: string) {
  const dow = dayOfWeek(value);
  if (dow === 3) return []; // Wednesday
  if (dow === 0) return [...afternoonSlots]; // Sunday — no mornings
  if (dow >= 1 && dow <= 4) return [...weekdayEveningSlots];
  return [...morningSlots, ...afternoonSlots];
}

function nextBookableDays(count: number) {
  const days: { value: string; label: string }[] = [];
  const formatter = new Intl.DateTimeFormat("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  for (let i = 1; days.length < count; i += 1) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + i);
    if (date.getDay() === 3) continue; // Wednesday closed
    const value = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
    days.push({ value, label: formatter.format(date) });
  }

  return days;
}

export function Book() {
  const days = useMemo(() => nextBookableDays(14), []);
  const [service, setService] = useState<(typeof packages)[number]["id"]>("full");
  const [date, setDate] = useState(days[0]?.value ?? "");
  const [slot, setSlot] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const availableSlots = useMemo(
    () => (date ? slotsForDate(date) : []),
    [date],
  );
  const selectedPackage = packages.find((item) => item.id === service);

  function selectDate(nextDate: string) {
    setDate(nextDate);
    const nextSlots = slotsForDate(nextDate);
    if (slot && !nextSlots.includes(slot)) setSlot("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!date || !slot || !name.trim() || !phone.trim()) return;
    setSubmitted(true);
  }

  return (
    <section className="page-hero book-page">
      <div className="container">
        <p className="section__eyebrow">Book Online</p>
        <h1 className="section__title">Choose your time slot</h1>
        <p className="section__lede">
          Pick a service, date, and arrival window. We’ll confirm your booking
          by phone before coming on site.
        </p>
        <SparkDivider />

        {submitted ? (
          <div className="book-confirm">
            <h2>Time slot selected</h2>
            <p>
              <strong>
                {selectedPackage?.name} · {date} · {slot}
              </strong>
            </p>
            <p>
              Call <a href="tel:2509387938">250-938-7938</a> to confirm this
              booking for {name.trim()}. We’ll verify the time before coming on
              site.
            </p>
            <div className="book-confirm__actions">
              <a className="btn btn--primary" href="tel:2509387938">
                Call to confirm
              </a>
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => setSubmitted(false)}
              >
                Change time slot
              </button>
            </div>
          </div>
        ) : (
          <form className="book-form" onSubmit={handleSubmit}>
            <fieldset className="book-fieldset">
              <legend>1. Service</legend>
              <div className="book-options book-options--services">
                {packages.map((item) => (
                  <label
                    key={item.id}
                    className={`book-option${service === item.id ? " is-selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="service"
                      value={item.id}
                      checked={service === item.id}
                      onChange={() => setService(item.id)}
                    />
                    <span className="book-option__title">{item.name}</span>
                    <span className="book-option__meta">
                      {item.price} · {item.duration}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="book-fieldset">
              <legend>2. Date</legend>
              <div className="book-options book-options--dates">
                {days.map((day) => (
                  <label
                    key={day.value}
                    className={`book-option book-option--compact${date === day.value ? " is-selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="date"
                      value={day.value}
                      checked={date === day.value}
                      onChange={() => selectDate(day.value)}
                    />
                    <span className="book-option__title">{day.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="book-fieldset">
              <legend>3. Time slot</legend>
              <div className="book-options book-options--slots">
                {availableSlots.map((time) => (
                  <label
                    key={time}
                    className={`book-option book-option--compact${slot === time ? " is-selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="slot"
                      value={time}
                      checked={slot === time}
                      onChange={() => setSlot(time)}
                      required
                    />
                    <span className="book-option__title">{time}</span>
                  </label>
                ))}
              </div>
              {dayOfWeek(date) === 0 ? (
                <p className="book-note">Sunday mornings unavailable — afternoon slots only.</p>
              ) : null}
              {dayOfWeek(date) >= 1 && dayOfWeek(date) <= 4 ? (
                <p className="book-note">
                  Monday–Thursday evening appointments only — from 5:30 PM.
                </p>
              ) : null}
            </fieldset>

            <fieldset className="book-fieldset">
              <legend>4. Your details</legend>
              <div className="book-fields">
                <label>
                  Name
                  <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    autoComplete="name"
                  />
                </label>
                <label>
                  Phone
                  <input
                    type="tel"
                    name="phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    required
                    autoComplete="tel"
                    placeholder="250-938-7938"
                  />
                </label>
                <label className="book-fields__full">
                  Jobsite / yard location
                  <input
                    type="text"
                    name="location"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    autoComplete="street-address"
                    placeholder="Address or meeting point in the North Okanagan"
                  />
                </label>
                <label className="book-fields__full">
                  Notes
                  <textarea
                    name="notes"
                    rows={3}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Machine type, access notes, add-ons, etc."
                  />
                </label>
              </div>
            </fieldset>

            <div className="book-submit">
              <p className="book-summary">
                {selectedPackage?.name}
                {date ? ` · ${date}` : ""}
                {slot ? ` · ${slot}` : " · select a time slot"}
              </p>
              <button className="btn btn--primary" type="submit" disabled={!slot}>
                Request this time slot
              </button>
              <p className="book-note">
                Prefer to call?{" "}
                <a href="tel:2509387938">250-938-7938</a>
              </p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
