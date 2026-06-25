import React from "react";

const Footer: React.FC = () => (
  <footer className="py-16 bg-gradient-to-br from-khwarizmia-navy via-stone-900 to-black text-khwarizmia-paper">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">

        {/* Services */}
        <div>
          <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-wider">Services</h4>
          <ul className="space-y-2">
            {[
              { label: "Électricité BT / MT", slug: "electricite" },
              { label: "Automatisation", slug: "automatisation" },
              { label: "Énergie renouvelable", slug: "energie" },
              { label: "Réseaux informatiques", slug: "reseaux" },
              { label: "Vidéo surveillance", slug: "surveillance" },
              { label: "Maintenance industrielle", slug: "maintenance" },
            ].map((s) => (
              <li key={s.slug}>
                <a href={`/secteurs/${s.slug}`} className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">{s.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-wider">Ressources</h4>
          <ul className="space-y-2">
            <li><a href="/resources" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">Guides techniques</a></li>
            <li><a href="/resources/installation-guide" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">Guide d'installation</a></li>
            <li><a href="/downloads/user-manual" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">Manuel utilisateur</a></li>
          </ul>
        </div>

        {/* À propos */}
        <div>
          <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-wider">À propos</h4>
          <ul className="space-y-2">
            <li><a href="/about-us" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">Qui sommes-nous</a></li>
            <li><a href="/company/partner-program" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">Devenir partenaire</a></li>
            <li><a href="/company/news" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">Actualités</a></li>
          </ul>
        </div>

        {/* News */}
        <div>
          <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-wider">News</h4>
          <ul className="space-y-2">
            <li><a href="/blog" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">Blog</a></li>
            <li><a href="/press-releases" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">Communiqués</a></li>
            <li><a href="/news/newsletter" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">Newsletter</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-wider">Contact</h4>
          <ul className="space-y-2">
            <li><a href="/contact-support" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">Nous contacter</a></li>
            <li><a href="/request-demo" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">Demander un devis</a></li>
            <li><a href="/pricing" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">Tarifs</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom info */}
      <div className="border-t border-white/20 pt-12">
        <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h4 className="text-lg font-semibold mb-3 text-white">Contact</h4>
            <div className="space-y-1.5 text-gray-300 text-sm">
              <p><a href="mailto:kssitech@gmail.com" className="hover:text-khwarizmia-gold transition-colors">kssitech@gmail.com</a></p>
              <p><a href="tel:+212524622240" className="hover:text-khwarizmia-gold transition-colors">+212 524 622 240</a></p>
              <p><a href="tel:+212661979129" className="hover:text-khwarizmia-gold transition-colors">+212 661 979 129</a></p>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-3 text-white">Siège social</h4>
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
        <p>&copy; {new Date().getFullYear()} KSSI TECH. Tous droits réservés.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
