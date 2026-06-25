import DownloadPage from "../downloads/DownloadPage";

const MediaCoverage = () => {
  return (
    <DownloadPage
      title="Media Coverage"
      description="KSSI TECH in the news—media coverage, interviews, and industry recognition from leading financial and technology publications showcasing our solutions industrielles et tertiaires work."
      icon="📺"
      category="News & Media"
      comingSoon={true}
      relatedLinks={[
        {
          title: "Blog",
          href: "/blog",
          description: "Read our latest insights and technical articles"
        },
        {
          title: "Press Releases",
          href: "/news/press-releases",
          description: "Official press releases and corporate announcements"
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

export default MediaCoverage;
