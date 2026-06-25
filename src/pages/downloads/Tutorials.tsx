import DownloadPage from "./DownloadPage";

const Tutorials = () => {
  return (
    <DownloadPage
      title="Tutorial Videos"
      description="Video tutorials and interactive guides to help you get started with KSSI TECH Analytix and master advanced features."
      icon="🎥"
      category="Documentation & Guides"
      comingSoon={true}
      relatedLinks={[
        {
          title: "User Manual",
          href: "/downloads/user-manual",
          description: "Comprehensive user manual covering all aspects of KSSI TECH platform"
        },
        {
          title: "Developer Guide",
          href: "/downloads/developer-guide",
          description: "Technical documentation for developers and integration guides"
        },
        {
          title: "API Documentation",
          href: "/sphinx-doc/kssi-tech-1.1-3/index.html",
          description: "Comprehensive API documentation and technical reference",
          external: true
        }
      ]}
    />
  );
};

export default Tutorials;
