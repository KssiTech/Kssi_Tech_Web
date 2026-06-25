import DownloadPage from "../downloads/DownloadPage";

const News = () => {
  return (
    <DownloadPage
      title="Company News"
      description="Stay updated with the latest KSSI TECH company announcements, corporate developments, and product milestones from our leadership team and business operations."
      icon="📰"
      category="Corporate Communications"
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
          title: "About KSSI TECH",
          href: "/company/about",
          description: "Learn about our mission, values, and company background"
        },
        {
          title: "Leadership Team",
          href: "/company/leadership",
          description: "Meet our solutions industrielles et tertiaires experts and leadership"
        }
      ]}
    />
  );
};

export default News;
