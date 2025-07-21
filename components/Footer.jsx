import Link from "next/link";

const footerSections = [
  {
    title: "Quick Links",
    links: [
      { name: "Browse Courses", link: "/courses" },
      { name: "Pricing", link: "/pricing" },
      { name: "Instructors", link: "/instructors" },
      { name: "FAQs", link: "/faq" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Contact Support", link: "/support" },
      { name: "Report a Problem", link: "/report" },
      { name: "Help Center", link: "/help-center" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", link: "/privacy-policy" },
      { name: "Terms & Conditions", link: "/terms" },
      { name: "License", link: "/license" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="bg-zinc-900 py-8 mt-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Logo & Description */}
        <div>
          <h2 className="text-xl font-bold mb-2">LMS Platform</h2>
          <p className="text-gray-400 text-sm">
            Empowering learning through a modern and accessible platform. Join thousands of learners.
          </p>
        </div>

        {/* Dynamic Footer Sections */}
        {footerSections.map((section, index) => (
          <div key={index}>
            <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
            <ul className="space-y-1 text-sm text-gray-400">
              {section.links.map((link, idx) => (
                <li key={idx}>
                  <Link href={link.link} className="hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-gray-700 pt-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} LMS Platform. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
