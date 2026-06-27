import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer: React.FC = () => {
  const { t, ta } = useLanguage();
  const serviceLinks: { label: string; slug: string }[] = ta("footer.serviceLinks") || [];

  return (
    <footer className="py-16 bg-gradient-to-br from-khwarizmia-navy via-stone-900 to-black text-khwarizmia-paper">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">

          {/* Services */}
          <div>
            <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-wider">{t("footer.services")}</h4>
            <ul className="space-y-2">
              {serviceLinks.map((s) => (
                <li key={s.slug}>
                  <a href={`/secteurs/${s.slug}`} className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">{s.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-wider">{t("footer.resources")}</h4>
            <ul className="space-y-2">
              <li><a href="/resources" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">{t("footer.technicalGuides")}</a></li>
              <li><a href="/resources/installation-guide" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">{t("footer.installGuide")}</a></li>
              <li><a href="/downloads/user-manual" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">{t("footer.userManual")}</a></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-wider">{t("footer.about")}</h4>
            <ul className="space-y-2">
              <li><a href="/about-us" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">{t("footer.whoWeAre")}</a></li>
              <li><a href="/company/partner-program" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">{t("footer.partner")}</a></li>
              <li><a href="/company/news" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">{t("footer.companyNews")}</a></li>
            </ul>
          </div>

          {/* News */}
          <div>
            <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-wider">{t("footer.news")}</h4>
            <ul className="space-y-2">
              <li><a href="/blog" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">{t("footer.blog")}</a></li>
              <li><a href="/press-releases" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">{t("footer.pressReleases")}</a></li>
              <li><a href="/news/newsletter" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">{t("footer.newsletter")}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-wider">{t("footer.contact")}</h4>
            <ul className="space-y-2">
              <li><a href="/contact-support" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">{t("footer.contactUs")}</a></li>
              <li><a href="/request-demo" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">{t("footer.requestQuote")}</a></li>
              <li><a href="/pricing" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">{t("footer.pricing")}</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom info */}
        <div className="border-t border-white/20 pt-12">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h4 className="text-lg font-semibold mb-3 text-white">{t("footer.contact")}</h4>
              <div className="space-y-1.5 text-gray-300 text-sm">
                <p><a href="mailto:kssitech@gmail.com" className="hover:text-khwarizmia-gold transition-colors">kssitech@gmail.com</a></p>
                <p><a href="tel:+212524622240" className="hover:text-khwarizmia-gold transition-colors">+212 524 622 240</a></p>
                <p><a href="tel:+212661979129" className="hover:text-khwarizmia-gold transition-colors">+212 661 979 129</a></p>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3 text-white">{t("footer.headquartersTitle")}</h4>
              <p className="text-gray-300 text-sm">59, rue 5, Qu. Lalla Asmae</p>
              <p className="text-gray-300 text-sm">Bd Hassan II — Safi, Maroc</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3 text-white">KSSI TECH</h4>
              <p className="text-gray-300 text-sm italic">Leading Technical Future World</p>
              <p className="text-gray-400 text-xs mt-2">S.A.R.L — ICE : 000074736000019</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} KSSI TECH. {t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
