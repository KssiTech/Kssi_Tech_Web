import DownloadPage from "../downloads/DownloadPage";

const PartnerProgram = () => {
  return (
    <DownloadPage
      title="Become a Partner"
      description="Partner with KSSI TECH to bring our solutions industrielles et tertiaires software and practitioner-built models to banks, vendors, and integrators—from co-selling and referrals to deep technical collaboration."
      icon="🤝"
      category="Partners"
      comingSoon={true}
      relatedLinks={[
        { title: "About KSSI TECH", href: "/about-us", description: "Learn about our mission and values" },
        { title: "Leadership Team", href: "/company/leadership", description: "Meet our solutions industrielles et tertiaires experts" },
        { title: "Technology Partners", href: "/company/partners", description: "Our strategic partnerships" },
        { title: "Contact Us", href: "/contact", description: "Get in touch with our team" }
      ]}
    />
  );
};

export default PartnerProgram;
