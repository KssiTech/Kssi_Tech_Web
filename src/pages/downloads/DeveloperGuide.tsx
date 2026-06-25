import DownloadPage from "./DownloadPage";

const DeveloperGuide = () => {
  return (
    <DownloadPage
      title="Developer Guide"
      description="Technical documentation for developers, including API integration guides, code examples, and best practices for building with KSSI TECH."
      icon="👨‍💻"
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
          title: "GitHub Repository",
          href: "/downloads/github-repository",
          description: "Access KSSI TECH's open-source code repositories and examples"
        },
        {
          title: "Installation Guide",
          href: "/downloads/installation-guide",
          description: "Step-by-step installation instructions and system requirements"
        }
      ]}
    />
  );
};

export default DeveloperGuide;
