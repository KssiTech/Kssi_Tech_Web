import DownloadPage from "../downloads/DownloadPage";

const Awards = () => {
  return (
    <DownloadPage
      title="Awards & Recognition"
      description="KSSI TECH's awards and industry recognition for excellence in solutions industrielles et tertiaires and innovation—solutions that are transforming the financial industry."
      icon="🏆"
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
          title: "Media Coverage",
          href: "/news/media-coverage",
          description: "KSSI TECH's appearances in leading financial publications"
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

export default Awards;
