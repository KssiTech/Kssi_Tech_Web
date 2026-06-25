import DownloadPage from "./DownloadPage";

const InstallationGuide = () => {
  return (
    <DownloadPage
      title="Installation Guide"
      description="Step-by-step installation instructions for KSSI TECH Analytix platform, including system requirements, dependencies, and configuration guides."
      icon="🔧"
      category="Software & Tools"
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
          title: "Developer Guide",
          href: "/downloads/developer-guide",
          description: "Technical documentation for developers and integration guides"
        }
      ]}
    />
  );
};

export default InstallationGuide;
