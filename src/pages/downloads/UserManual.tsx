import DownloadPage from "./DownloadPage";

const UserManual = () => {
  return (
    <DownloadPage
      title="User Manual"
      description="Comprehensive user manual covering all aspects of the KSSI TECH Analytix platform, from basic usage to advanced features."
      icon="📖"
      category="Documentation & Guides"
      comingSoon={true}
      relatedLinks={[
        {
          title: "API Documentation",
          href: "/sphinx-doc/kssi-tech-1.1-3/index.html",
          description: "Comprehensive API documentation and technical reference",
          external: true
        },
        {
          title: "Developer Guide",
          href: "/downloads/developer-guide",
          description: "Technical documentation for developers and integration guides"
        },
        {
          title: "Tutorial Videos",
          href: "/downloads/tutorials",
          description: "Video tutorials and interactive guides for KSSI TECH platform"
        }
      ]}
    />
  );
};

export default UserManual;
