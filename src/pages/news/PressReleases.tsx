import DownloadPage from "../downloads/DownloadPage";

const PressReleases = () => {
  return (
    <DownloadPage
      title="Press Releases"
      description="Official press releases and corporate announcements from KSSI TECH. Stay updated on our latest developments in solutions industrielles et tertiaires and the KSSI TECH platform."
      icon="📰"
      category="News & Media"
      comingSoon={true}
      relatedLinks={[
        {
          title: "Blog",
          href: "/blog",
          description: "Read our latest insights and technical articles"
        },
        {
          title: "Media Coverage",
          href: "/news/media-coverage",
          description: "KSSI TECH's appearances in leading financial publications"
        },
        {
          title: "Awards & Recognition",
          href: "/news/awards",
          description: "Industry awards and recognition for KSSI TECH"
        },
        {
          title: "Contact Us",
          href: "/contact",
          description: "Get in touch with our media relations team"
        }
      ]}
    />
  );
};

export default PressReleases;
