import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Shield,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: "About Us", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Press", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Contact Us", href: "#" },
    ],
    support: [
      { name: "Help Center", href: "#" },
      { name: "Safety Center", href: "#" },
      { name: "Cancellation Options", href: "#" },
      { name: "Accessibility", href: "#" },
    ],
    legal: [
      { name: "Terms & Conditions", href: "#" },
      { name: "Privacy Policy", href: "#" },
      { name: "Cookie Policy", href: "#" },
      { name: "Refund Policy", href: "#" },
    ],
  };

  const socialLinks = [
    { name: "Facebook", icon: <Facebook size={18} />, href: "#" },
    { name: "Twitter", icon: <Twitter size={18} />, href: "#" },
    { name: "Instagram", icon: <Instagram size={18} />, href: "#" },
    { name: "LinkedIn", icon: <Linkedin size={18} />, href: "#" },
  ];

  return (
    <footer className="bg-indigo-600 text-white " role="contentinfo">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-md bg-white flex items-center justify-center mr-2">
                <span className="font-bold text-indigo-600">BB</span>
              </div>
              <span className="text-lg font-bold">BusBooker</span>
            </div>
            <p className="text-indigo-200 text-sm mb-4">
              Making bus travel easy, comfortable, and affordable. Book your
              next journey with confidence.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-indigo-200">
                <Phone size={16} className="mr-2" />
                <span>+91 63xxxxxxxx</span>
              </div>
              <div className="flex items-center text-sm text-indigo-200">
                <Mail size={16} className="mr-2" />
                <span>support@busbooker.com</span>
              </div>
              <div className="flex items-center text-sm text-indigo-200">
                <MapPin size={16} className="mr-2" />
                <span>1st street, Coimbatore</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index} role="li">
                  <a
                    href={link.href}
                    className="text-indigo-200 hover:text-white text-sm transition duration-150 ease-in-out"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a
                    role="link"
                    href={link.href}
                    className="text-indigo-200 hover:text-white text-sm transition duration-150 ease-in-out"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a
                    role="link"
                    href={link.href}
                    className="text-indigo-200 hover:text-white text-sm transition duration-150 ease-in-out"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  role="link"
                  key={index}
                  href={social.href}
                  className="bg-indigo-500 hover:bg-indigo-400 h-8 w-8 rounded-full flex items-center justify-center transition duration-150 ease-in-out"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-indigo-700 py-4">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-indigo-200 mb-2 md:mb-0">
            &copy; {currentYear} BusBooker. All rights reserved.
          </div>
          <div className="flex items-center">
            <Shield size={16} className="mr-2 text-indigo-300" />
            <span className="text-xs text-indigo-200">
              Secured by SSL. 100% Safe & Secure Online Booking
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
