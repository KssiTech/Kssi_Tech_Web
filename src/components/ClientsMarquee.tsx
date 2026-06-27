import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const ROW_1 = [
  { name: "RADEES",                          initials: "RA",    logo: "radees.svg",                          bg: "from-khwarizmia-navy to-stone-800",     text: "text-khwarizmia-paper" },
  { name: "École Sup. Tech. Safi",           initials: "EST",   logo: "ecole-sup-tech-safi.svg",            bg: "from-khwarizmia-teal to-khwarizmia-bronze", text: "text-white" },
  { name: "ENSA Safi",                       initials: "ENSA",  logo: "ensa-safi.svg",                      bg: "from-stone-600 to-khwarizmia-navy",     text: "text-khwarizmia-paper" },
  { name: "FP Safi",                         initials: "FPS",   logo: "fp-safi.svg",                        bg: "from-khwarizmia-bronze to-stone-700",   text: "text-white" },
  { name: "Université Cadi Ayyad",           initials: "UCA",   logo: "universite-cadi-ayyad.svg",          bg: "from-khwarizmia-navy to-stone-800",     text: "text-khwarizmia-paper" },
  { name: "Université Chouaib Doukkali",     initials: "UCD",   logo: "universite-chouaib-doukkali.svg",    bg: "from-khwarizmia-teal to-stone-700",     text: "text-white" },
  { name: "OFPPT",                           initials: "OFP",   logo: "ofppt.svg",                          bg: "from-stone-700 to-khwarizmia-bronze",   text: "text-white" },
  { name: "Haut Comm. Eaux & Forêts",        initials: "HCF",   logo: "haut-comm-eaux-forets.svg",          bg: "from-khwarizmia-navy to-khwarizmia-teal", text: "text-khwarizmia-paper" },
  { name: "Ministère des Habous",            initials: "MHA",   logo: "ministere-habous.svg",              bg: "from-khwarizmia-bronze to-stone-800",   text: "text-white" },
  { name: "Maroc Telecom",                   initials: "MT",    logo: "maroc-telecom.svg",                  bg: "from-khwarizmia-navy to-stone-700",     text: "text-khwarizmia-paper" },
  { name: "Caprel",                          initials: "CAP",   logo: "caprel.svg",                         bg: "from-khwarizmia-teal to-stone-700",     text: "text-white" },
  { name: "Lafarge Placo Maroc",             initials: "LPM",   logo: "lafarge-placo-maroc.svg",            bg: "from-stone-600 to-khwarizmia-navy",     text: "text-khwarizmia-paper" },
];

const ROW_2 = [
  { name: "Carlifer",                        initials: "CAR",   logo: "carlifer.svg",                      bg: "from-khwarizmia-bronze to-khwarizmia-navy", text: "text-white" },
  { name: "Vinaigrerie Moutarderie Maroc",   initials: "VMM",   logo: "vinaigrerie-moutarderie-maroc.svg",  bg: "from-khwarizmia-navy to-stone-700",     text: "text-khwarizmia-paper" },
  { name: "DOHA",                            initials: "DOH",   logo: "doha.svg",                           bg: "from-stone-700 to-khwarizmia-teal",     text: "text-white" },
  { name: "Centrale GYPSE",                 initials: "CG",    logo: "centrale-gypse.svg",                 bg: "from-khwarizmia-teal to-stone-800",     text: "text-white" },
  { name: "Crespo",                          initials: "CRE",   logo: "crespo.svg",                         bg: "from-khwarizmia-navy to-khwarizmia-bronze", text: "text-khwarizmia-paper" },
  { name: "Conserves Oualili",               initials: "CO",    logo: "conserves-oualili.svg",              bg: "from-stone-600 to-khwarizmia-bronze",   text: "text-white" },
  { name: "Azura",                           initials: "AZU",   logo: "azura.svg",                          bg: "from-khwarizmia-teal to-khwarizmia-navy", text: "text-white" },
  { name: "Nora",                            initials: "NOR",   logo: "nora.svg",                           bg: "from-khwarizmia-bronze to-stone-700",   text: "text-white" },
  { name: "MayMouna",                        initials: "MAY",   logo: "maymouna.svg",                       bg: "from-khwarizmia-navy to-stone-600",     text: "text-khwarizmia-paper" },
  { name: "Centrelec",                       initials: "CTL",   logo: "centrelec.svg",                      bg: "from-khwarizmia-teal to-stone-700",     text: "text-white" },
  { name: "Verne Telecom",                   initials: "VT",    logo: "verne-telecom.svg",                  bg: "from-stone-700 to-khwarizmia-navy",     text: "text-khwarizmia-paper" },
];

function ClientCard({
  name,
  initials,
  logo,
  bg,
  text,
  isDark,
}: {
  name: string;
  initials: string;
  logo?: string;
  bg: string;
  text: string;
  isDark: boolean;
}) {
  const [hasLogoError, setHasLogoError] = useState(false);

  return (
    <div
      className={`
        flex shrink-0 items-center gap-3 px-1
        transition-all duration-300 cursor-default select-none
      `}
    >
      {logo && !hasLogoError ? (
        <img
          src={`/client-logos/${logo}`}
          alt={`${name} logo`}
          className="h-8 w-8 shrink-0 rounded-full object-contain"
          onError={() => setHasLogoError(true)}
        />
      ) : (
        <div
          className={`
            h-8 w-8 shrink-0 rounded-full bg-gradient-to-br ${bg}
            flex items-center justify-center
            text-[0.55rem] font-black tracking-wide ${text}
          `}
        >
          {initials}
        </div>
      )}

      {/* Name */}
      <span
        className={`
          whitespace-nowrap text-sm font-semibold tracking-tight
          ${isDark ? "text-stone-300" : "text-khwarizmia-navy"}
        `}
      >
        {name}
      </span>
    </div>
  );
}

const ClientsMarquee = () => {
  const { isDark } = useTheme();

  const maskImage =
    "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)";
  const scrollingClients = [...ROW_1, ...ROW_2];

  return (
    <div className="w-full pt-10 pb-2">
      {/* Label */}
      <p
        className={`
          mb-5 text-center text-[0.65rem] font-bold uppercase tracking-[0.22em]
          ${isDark ? "text-stone-500" : "text-stone-400"}
        `}
      >
        Ils nous font confiance
      </p>

      <div
        className="relative overflow-hidden"
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        <div className="flex w-max gap-3 animate-clients-ltr">
          {[...scrollingClients, ...scrollingClients].map((c, i) => (
            <ClientCard key={`client-${i}`} {...c} isDark={isDark} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes clients-ltr {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .animate-clients-ltr {
          animation: clients-ltr 40s linear infinite;
        }
        .animate-clients-ltr:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default ClientsMarquee;
