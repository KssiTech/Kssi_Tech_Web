import DownloadPage from "../downloads/DownloadPage";

const IndustryInsights = () => {
  return (
    <DownloadPage
      title="Industry Insights"
      description="Expert analysis and insights on solutions industrielles et tertiaires trends, market developments, and KSSI TECH in practice—from KSSI TECH's thought leaders."
      icon="📊"
      category="Industry Analysis"
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
          title: "Newsletter",
          href: "/news/newsletter",
          description: "Subscribe to our industry newsletter and updates"
        },
        {
          title: "Research Publications",
          href: "/downloads/publications",
          description: "Academic research publications and peer-reviewed papers"
        }
      ]}
    />
  );
};

export default IndustryInsights;
