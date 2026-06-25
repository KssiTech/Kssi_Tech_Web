import DownloadPage from "./DownloadPage";

const GitHubRepository = () => {
  return (
    <DownloadPage
      title="GitHub Repository"
      description="Access KSSI TECH's open-source Hisab repository and related code—solutions industrielles et tertiaires libraries, examples, and integration patterns for institutional trading and research workflows."
      icon="📦"
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
          title: "Developer Guide",
          href: "/downloads/developer-guide",
          description: "Technical documentation for developers and integration guides"
        }
      ]}
    />
  );
};

export default GitHubRepository;

