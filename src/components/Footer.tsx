import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div>
          <p className="site-footer__name">OnSite Cab Detailing</p>
          <p>
            Mobile heavy equipment cab detailing across the North Okanagan.
          </p>
        </div>
        <div className="site-footer__meta">
          <a href="tel:+12509387938">250-938-7938</a>
          <a href="https://onsitecabdetailing.ca">onsitecabdetailing.ca</a>
          <Link to="/services">Services</Link>
          <Link to="/book">Book Now</Link>
        </div>
      </div>
      <div className="container site-footer__bottom">
        © {new Date().getFullYear()} OnSite Cab Detailing. Cleaner cab. Better
        day.
      </div>
    </footer>
  );
}
