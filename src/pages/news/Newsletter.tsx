import DownloadPage from "../downloads/DownloadPage";

const Newsletter = () => {
  return (
    <DownloadPage
      title="Newsletter"
      description="Stay informed with KSSI TECH's quarterly newsletter featuring product and company updates, industry insights, client stories, and the latest developments in solutions industrielles et tertiaires."
      icon="📧"
      category="Communications"
      comingSoon={true}
      relatedLinks={[
        {
          title: "Blog",
          href: "/blog",
          description: "Read our latest insights and technical articles"
        },
        {
          title: "Industry Insights",
          href: "/news/industry-insights",
          description: "Expert analysis on solutions industrielles et tertiaires trends and developments"
        },
        {
          title: "Press Releases",
          href: "/news/press-releases",
          description: "Official press releases and corporate announcements"
        },
        {
          title: "Contact Us",
          href: "/contact",
          description: "Get in touch to subscribe or request information"
        }
      ]}
    />
  );
};

export default Newsletter;
