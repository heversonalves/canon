import { useState } from 'react';
import { DidaskaloPanel } from '@/app/components/didaskalos-panel';
import { 
  Calendar, BookOpen, FileText, Scroll, Church, Cross, 
  BookMarked, Scale, AlertTriangle, ChevronRight, ExternalLink 
} from 'lucide-react';

type Section = 'panorama' | 'bible-history' | 'catholicism' | 'councils' | 'heresies';

interface Era {
  id: string;
  title: string;
  period: string;
  description: string;
  icon: React.ReactNode;
  articleCount: number;
}

interface Subsection {
  id: string;
  title: string;
  description: string;
  articleCount: number;
}

interface Council {
  id: string;
  name: string;
  year: string;
  location: string;
  decisions: string[];
  biblicalImpact: string;
  tradition: string;
}

interface Heresy {
  id: string;
  name: string;
  period: string;
  category: 'ancient' | 'medieval' | 'post-reformation' | 'contemporary';
  description: string;
  keyFigures: string[];
  refutedBy: string[];
}

// Biblical-Historical Panorama Data
const biblicalEras: Era[] = [
  {
    id: 'creation',
    title: 'Criação e Patriarcas',
    period: 'c. 4000-1800 BCE',
    description: 'From creation to the patriarchal narratives: Genesis 1-50, the covenant with Abraham, and the foundations of redemptive history.',
    icon: <Scroll size={32} strokeWidth={1} />,
    articleCount: 24
  },
  {
    id: 'ancient-israel',
    title: 'Israel Antigo e o Período Monárquico',
    period: 'c. 1800-586 BCE',
    description: 'Exodus, conquest, judges, united and divided kingdoms. The development of the Mosaic covenant and Davidic dynasty.',
    icon: <Church size={32} strokeWidth={1} />,
    articleCount: 31
  },
  {
    id: 'exile',
    title: 'Exílio, Pós-Exílio e Judaísmo do Segundo Templo',
    period: '586 BCE - 70 CE',
    description: 'Babylonian exile, return, temple reconstruction, and the intertestamental period. Development of synagogue and rabbinic tradition.',
    icon: <BookMarked size={32} strokeWidth={1} />,
    articleCount: 18
  },
  {
    id: 'nt-context',
    title: 'Contexto do Novo Testamento',
    period: 'c. 5 BCE - 100 CE',
    description: 'The life of Christ, apostolic mission, and the writing of the New Testament documents within the Greco-Roman world.',
    icon: <Cross size={32} strokeWidth={1} />,
    articleCount: 42
  },
  {
    id: 'early-church',
    title: 'Igreja Primitiva',
    period: '100-600 CE',
    description: 'Patristic period, ecumenical councils, canonization, and the theological formulation of Trinitarian and Christological orthodoxy.',
    icon: <BookOpen size={32} strokeWidth={1} />,
    articleCount: 36
  },
  {
    id: 'medieval',
    title: 'Idade Média',
    period: '600-1500 CE',
    description: 'Medieval scholasticism, monastic tradition, cathedral schools, and the preservation of biblical manuscripts through the Middle Ages.',
    icon: <Church size={32} strokeWidth={1} />,
    articleCount: 27
  },
  {
    id: 'reformation',
    title: 'Reforma Protestante',
    period: '1517-1648',
    description: 'Luther, Calvin, Zwingli, and the recovery of sola Scriptura. Translation projects, confessional development, and theological reformation.',
    icon: <BookMarked size={32} strokeWidth={1} />,
    articleCount: 51
  },
  {
    id: 'post-reformation',
    title: 'Pós-Reforma e Era Moderna',
    period: '1648-1900',
    description: 'Protestant orthodoxy, Puritanism, Pietism, Great Awakenings, and the missionary expansion of evangelical Christianity.',
    icon: <Scroll size={32} strokeWidth={1} />,
    articleCount: 29
  },
  {
    id: 'contemporary',
    title: 'Cristianismo Contemporâneo',
    period: '1900-Present',
    description: 'Modern biblical criticism, evangelical scholarship, textual criticism advances, and global Christianity in the 20th-21st centuries.',
    icon: <BookOpen size={32} strokeWidth={1} />,
    articleCount: 38
  }
];

// Bible History Subsections
const bibleHistorySubsections: Subsection[] = [
  {
    id: 'transmission',
    title: 'Transmissão do Texto Bíblico',
    description: 'The history of how the biblical text was preserved, copied, and transmitted across centuries and languages.',
    articleCount: 16
  },
  {
    id: 'manuscripts',
    title: 'Manuscritos Hebraicos e Gregos',
    description: 'Study of key manuscript witnesses: Dead Sea Scrolls, Masoretic codices, Greek papyri, and uncial manuscripts.',
    articleCount: 22
  },
  {
    id: 'preservation',
    title: 'Períodos Críticos da Preservação Bíblica',
    description: 'Examination of historical periods where biblical preservation was threatened or challenged.',
    articleCount: 11
  },
  {
    id: 'persecution',
    title: 'Perseguições e Supressões do Texto',
    description: 'Historical analysis of attempts to suppress or destroy biblical manuscripts and translations.',
    articleCount: 9
  },
  {
    id: 'ancient-translations',
    title: 'Traduções Antigas (LXX, Vulgata, Peshitta)',
    description: 'Study of the major ancient translations and their significance for textual criticism and church history.',
    articleCount: 14
  },
  {
    id: 'reformation-bible',
    title: 'A Bíblia e a Reforma Protestante',
    description: 'The role of biblical translation and accessibility in the Protestant Reformation.',
    articleCount: 19
  },
  {
    id: 'post-reformation-translations',
    title: 'Traduções Pós-Reforma',
    description: 'English, German, French, and other vernacular translations from the Reformation onward.',
    articleCount: 13
  },
  {
    id: 'modern-bible',
    title: 'A Bíblia no Mundo Moderno',
    description: 'Modern translation philosophy, distribution, and the Bible\'s influence on global culture.',
    articleCount: 17
  }
];

// Catholicism Subsections
const catholicismSubsections: Subsection[] = [
  {
    id: 'papacy',
    title: 'Formação do Papado',
    description: 'Historical development of papal authority from early church through medieval period.',
    articleCount: 12
  },
  {
    id: 'dogmas',
    title: 'Desenvolvimento de Dogmas',
    description: 'Critical examination of Roman Catholic dogmatic developments not found in Scripture.',
    articleCount: 15
  },
  {
    id: 'tradition-scripture',
    title: 'Tradição vs Escritura',
    description: 'Analysis of the Roman Catholic elevation of tradition to equal authority with Scripture.',
    articleCount: 18
  },
  {
    id: 'roman-councils',
    title: 'Concílios Romanos',
    description: 'Study of Trent, Vatican I, Vatican II, and their theological pronouncements.',
    articleCount: 11
  },
  {
    id: 'inquisition',
    title: 'Inquisição e Perseguições',
    description: 'Historical documentation of persecution of biblical Christians under Roman Catholic authority.',
    articleCount: 14
  },
  {
    id: 'biblical-control',
    title: 'Controle do Texto Bíblico',
    description: 'How Rome restricted access to Scripture in vernacular languages.',
    articleCount: 10
  },
  {
    id: 'reformation-rupture',
    title: 'Reforma como Ruptura Histórica',
    description: 'The Protestant Reformation as a necessary return to biblical authority.',
    articleCount: 16
  },
  {
    id: 'protestant-responses',
    title: 'Respostas Protestantes',
    description: 'Confessional and theological responses to Roman Catholic errors.',
    articleCount: 13
  }
];

// Councils Data
const councils: Council[] = [
  {
    id: 'jamnia',
    name: 'Council of Jamnia',
    year: 'c. 90 CE',
    location: 'Jamnia (Yavneh)',
    decisions: ['Finalization of Hebrew canon', 'Exclusion of deuterocanonical books', 'Definition of scriptural boundaries'],
    biblicalImpact: 'Established the 39-book Hebrew Bible canon that Protestants affirm as the Old Testament.',
    tradition: 'Jewish'
  },
  {
    id: 'nicaea',
    name: 'First Council of Nicaea',
    year: '325 CE',
    location: 'Nicaea',
    decisions: ['Affirmation of Christ\'s deity', 'Condemnation of Arianism', 'Nicene Creed formulation'],
    biblicalImpact: 'Defended biblical Christology against subordinationist heresies.',
    tradition: 'Ecumenical'
  },
  {
    id: 'constantinople',
    name: 'First Council of Constantinople',
    year: '381 CE',
    location: 'Constantinople',
    decisions: ['Affirmation of Spirit\'s deity', 'Expansion of Nicene Creed', 'Condemnation of Apollinarianism'],
    biblicalImpact: 'Established biblical doctrine of the Trinity and deity of the Holy Spirit.',
    tradition: 'Ecumenical'
  },
  {
    id: 'chalcedon',
    name: 'Council of Chalcedon',
    year: '451 CE',
    location: 'Chalcedon',
    decisions: ['Two natures of Christ', 'Hypostatic union', 'Condemnation of Eutychianism and Nestorianism'],
    biblicalImpact: 'Defined orthodox Christology: fully God and fully man in one person.',
    tradition: 'Ecumenical'
  },
  {
    id: 'trent',
    name: 'Council of Trent',
    year: '1545-1563',
    location: 'Trent',
    decisions: ['Tradition equal to Scripture', 'Justification through faith plus works', 'Seven sacraments', 'Transubstantiation'],
    biblicalImpact: 'Roman Catholic counter-Reformation; rejected Protestant biblical doctrines.',
    tradition: 'Roman Catholic'
  },
  {
    id: 'vatican-i',
    name: 'First Vatican Council',
    year: '1869-1870',
    location: 'Vatican City',
    decisions: ['Papal infallibility', 'Papal primacy', 'Church authority over Scripture interpretation'],
    biblicalImpact: 'Further departure from sola Scriptura; elevation of papal authority.',
    tradition: 'Roman Catholic'
  }
];

// Heresies Data
const heresies: Heresy[] = [
  {
    id: 'gnosticism',
    name: 'Gnosticism',
    period: '1st-3rd centuries',
    category: 'ancient',
    description: 'Dualistic belief system denying the goodness of creation and the true incarnation of Christ.',
    keyFigures: ['Valentinus', 'Marcion', 'Basilides'],
    refutedBy: ['Irenaeus', 'Tertullian', 'Hippolytus']
  },
  {
    id: 'arianism',
    name: 'Arianism',
    period: '4th century',
    category: 'ancient',
    description: 'Denial of the full deity of Christ, teaching that the Son was a created being.',
    keyFigures: ['Arius', 'Eusebius of Nicomedia'],
    refutedBy: ['Athanasius', 'Hilary of Poitiers', 'Council of Nicaea']
  },
  {
    id: 'pelagianism',
    name: 'Pelagianism',
    period: '5th century',
    category: 'ancient',
    description: 'Denial of original sin and affirmation of human ability to achieve righteousness apart from grace.',
    keyFigures: ['Pelagius', 'Celestius', 'Julian of Eclanum'],
    refutedBy: ['Augustine', 'Council of Carthage', 'Council of Ephesus']
  },
  {
    id: 'roman-catholicism',
    name: 'Roman Catholic Errors',
    period: 'Medieval to present',
    category: 'medieval',
    description: 'Departure from biblical authority through elevation of tradition, works righteousness, and papal authority.',
    keyFigures: ['Various popes', 'Council of Trent'],
    refutedBy: ['Luther', 'Calvin', 'Zwingli', 'Reformed Confessions']
  },
  {
    id: 'socinianism',
    name: 'Socinianism',
    period: '16th-17th centuries',
    category: 'post-reformation',
    description: 'Denial of the Trinity, deity of Christ, and substitutionary atonement.',
    keyFigures: ['Faustus Socinus', 'Laelius Socinus'],
    refutedBy: ['Reformed orthodox theologians', 'Puritan writers']
  },
  {
    id: 'liberalism',
    name: 'Theological Liberalism',
    period: '19th-20th centuries',
    category: 'contemporary',
    description: 'Denial of biblical inerrancy, miracles, and supernatural elements of Christianity.',
    keyFigures: ['Friedrich Schleiermacher', 'Rudolf Bultmann', 'Paul Tillich'],
    refutedBy: ['J. Gresham Machen', 'Carl F.H. Henry', 'Francis Schaeffer']
  },
  {
    id: 'prosperity',
    name: 'Prosperity Gospel',
    period: '20th-21st centuries',
    category: 'contemporary',
    description: 'False teaching that faith guarantees material wealth and physical health.',
    keyFigures: ['Kenneth Hagin', 'Kenneth Copeland', 'Joel Osteen'],
    refutedBy: ['John MacArthur', 'R.C. Sproul', 'Paul Washer']
  }
];

export function CuradoriaAcademica() {
  const [activeSection, setActiveSection] = useState<Section>('panorama');
  const [expandedEra, setExpandedEra] = useState<string | null>(null);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      ancient: 'Antigas',
      medieval: 'Medievais',
      'post-reformation': 'Pós-Reforma',
      contemporary: 'Contemporâneas'
    };
    return labels[category] || category;
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Header */}
        <div className="px-12 py-8 border-b border-[var(--divider)]">
          <h1 className="text-3xl tracking-tight text-[var(--graphite)] mb-2">
            Curadoria Acadêmica
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed max-w-4xl">
            A comprehensive academic repository of biblical, historical, and theological research from trusted Reformed and evangelical institutions.
          </p>
        </div>

        {/* Section Navigation */}
        <div className="px-12 py-5 border-b border-[var(--divider)] bg-[var(--ivory)]/30">
          <div className="flex items-center gap-3 overflow-x-auto">
            <button
              onClick={() => setActiveSection('panorama')}
              className={`px-4 py-2.5 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
                activeSection === 'panorama'
                  ? 'bg-[var(--deep-navy)] text-white'
                  : 'bg-white text-[var(--foreground)] border border-[var(--divider)] hover:border-[var(--deep-navy)]/30'
              }`}
            >
              Panorama Bíblico-Histórico
            </button>
            <button
              onClick={() => setActiveSection('bible-history')}
              className={`px-4 py-2.5 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
                activeSection === 'bible-history'
                  ? 'bg-[var(--deep-navy)] text-white'
                  : 'bg-white text-[var(--foreground)] border border-[var(--divider)] hover:border-[var(--deep-navy)]/30'
              }`}
            >
              História da Bíblia
            </button>
            <button
              onClick={() => setActiveSection('catholicism')}
              className={`px-4 py-2.5 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
                activeSection === 'catholicism'
                  ? 'bg-[var(--deep-navy)] text-white'
                  : 'bg-white text-[var(--foreground)] border border-[var(--divider)] hover:border-[var(--deep-navy)]/30'
              }`}
            >
              Bíblia e Catolicismo Romano
            </button>
            <button
              onClick={() => setActiveSection('councils')}
              className={`px-4 py-2.5 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
                activeSection === 'councils'
                  ? 'bg-[var(--deep-navy)] text-white'
                  : 'bg-white text-[var(--foreground)] border border-[var(--divider)] hover:border-[var(--deep-navy)]/30'
              }`}
            >
              Concílios
            </button>
            <button
              onClick={() => setActiveSection('heresies')}
              className={`px-4 py-2.5 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
                activeSection === 'heresies'
                  ? 'bg-[var(--deep-navy)] text-white'
                  : 'bg-white text-[var(--foreground)] border border-[var(--divider)] hover:border-[var(--deep-navy)]/30'
              }`}
            >
              Seitas e Heresias
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-12 py-8 scrollbar-hide">
          {/* PANORAMA SECTION */}
          {activeSection === 'panorama' && (
            <div className="max-w-7xl space-y-8">
              <div className="mb-8">
                <h2 className="text-2xl tracking-tight text-[var(--graphite)] mb-3">
                  Panorama da História Bíblica
                </h2>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed max-w-4xl">
                  Da criação à contemporaneidade: o desenvolvimento da revelação, do texto e do povo de Deus.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {biblicalEras.map((era) => (
                  <div
                    key={era.id}
                    className="group bg-white rounded-lg p-6 border border-[var(--divider)] hover:border-[var(--deep-navy)]/30 hover:shadow-md transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 rounded-md bg-[var(--ivory)] text-[var(--deep-navy)]">
                        {era.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-medium text-[var(--foreground)] mb-1 group-hover:text-[var(--deep-navy)] transition-colors">
                          {era.title}
                        </h3>
                        <p className="text-xs text-[var(--muted-foreground)]">{era.period}</p>
                      </div>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-4">
                      {era.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-[var(--divider)]">
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {era.articleCount} estudos
                      </span>
                      <button className="flex items-center gap-1 text-xs font-medium text-[var(--deep-navy)] hover:text-[var(--muted-bronze)] transition-colors">
                        <span>Ver estudos</span>
                        <ChevronRight size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BIBLE HISTORY SECTION */}
          {activeSection === 'bible-history' && (
            <div className="max-w-6xl space-y-8">
              <div className="mb-8">
                <h2 className="text-2xl tracking-tight text-[var(--graphite)] mb-3">
                  A História da Bíblia
                </h2>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed max-w-4xl">
                  História textual e institucional: transmissão, preservação, tradução e disseminação das Escrituras Sagradas.
                </p>
              </div>

              <div className="space-y-4">
                {bibleHistorySubsections.map((subsection) => (
                  <div
                    key={subsection.id}
                    className="group bg-white rounded-lg p-6 border border-[var(--divider)] hover:border-[var(--deep-navy)]/30 hover:shadow-sm transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <BookOpen size={20} className="text-[var(--deep-navy)]" strokeWidth={1.5} />
                          <h3 className="text-base font-medium text-[var(--foreground)] group-hover:text-[var(--deep-navy)] transition-colors">
                            {subsection.title}
                          </h3>
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-3">
                          {subsection.description}
                        </p>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {subsection.articleCount} articles
                          </span>
                          <button className="flex items-center gap-1 text-xs font-medium text-[var(--deep-navy)] hover:text-[var(--muted-bronze)] transition-colors">
                            <span>Explore</span>
                            <ExternalLink size={12} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CATHOLICISM SECTION */}
          {activeSection === 'catholicism' && (
            <div className="max-w-6xl space-y-8">
              <div className="mb-8 p-6 rounded-lg bg-[var(--graphite)]/5 border border-[var(--divider)]">
                <h2 className="text-2xl tracking-tight text-[var(--graphite)] mb-3">
                  A Bíblia e a Igreja Católica Romana
                </h2>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed max-w-4xl">
                  Academic examination of the historical development of Roman Catholic doctrine, its departure from biblical authority, and the Protestant response.
                </p>
              </div>

              <div className="space-y-4">
                {catholicismSubsections.map((subsection) => (
                  <div
                    key={subsection.id}
                    className="group bg-white rounded-lg p-6 border border-[var(--divider)] hover:border-[var(--graphite)]/40 hover:shadow-sm transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Scale size={20} className="text-[var(--graphite)]" strokeWidth={1.5} />
                          <h3 className="text-base font-medium text-[var(--foreground)] group-hover:text-[var(--graphite)] transition-colors">
                            {subsection.title}
                          </h3>
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-3">
                          {subsection.description}
                        </p>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {subsection.articleCount} studies
                          </span>
                          <button className="flex items-center gap-1 text-xs font-medium text-[var(--graphite)] hover:text-[var(--deep-navy)] transition-colors">
                            <span>Read analysis</span>
                            <ExternalLink size={12} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COUNCILS SECTION */}
          {activeSection === 'councils' && (
            <div className="max-w-7xl space-y-8">
              <div className="mb-8">
                <h2 className="text-2xl tracking-tight text-[var(--graphite)] mb-3">
                  Concílios e Decisões Doutrinárias
                </h2>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed max-w-4xl">
                  Historical timeline of ecclesiastical councils and their doctrinal pronouncements, evaluated by biblical standards.
                </p>
              </div>

              <div className="space-y-5">
                {councils.map((council) => (
                  <div
                    key={council.id}
                    className="group bg-white rounded-lg p-6 border border-[var(--divider)] hover:border-[var(--deep-navy)]/30 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-[var(--foreground)] mb-1 group-hover:text-[var(--deep-navy)] transition-colors">
                          {council.name}
                        </h3>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {council.year} • {council.location}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded text-xs font-medium ${
                        council.tradition === 'Ecumenical' 
                          ? 'bg-[var(--deep-navy)]/10 text-[var(--deep-navy)]'
                          : council.tradition === 'Roman Catholic'
                          ? 'bg-red-900/10 text-red-900'
                          : 'bg-amber-900/10 text-amber-900'
                      }`}>
                        {council.tradition}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs small-caps tracking-[0.12em] text-[var(--muted-foreground)] mb-2">
                          Main Decisions
                        </h4>
                        <ul className="space-y-1">
                          {council.decisions.map((decision, idx) => (
                            <li key={idx} className="text-sm text-[var(--foreground)] flex items-start gap-2">
                              <span className="text-[var(--muted-foreground)] mt-1">•</span>
                              <span>{decision}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-4 border-t border-[var(--divider)]">
                        <h4 className="text-xs small-caps tracking-[0.12em] text-[var(--muted-foreground)] mb-2">
                          Biblical Impact
                        </h4>
                        <p className="text-sm text-[var(--foreground)] leading-relaxed">
                          {council.biblicalImpact}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HERESIES SECTION */}
          {activeSection === 'heresies' && (
            <div className="max-w-7xl space-y-8">
              <div className="mb-8">
                <h2 className="text-2xl tracking-tight text-[var(--graphite)] mb-3">
                  Seitas, Heresias e Desvios Doutrinários
                </h2>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed max-w-4xl">
                  Comprehensive catalog of theological errors throughout church history, with biblical refutations and Reformed responses.
                </p>
              </div>

              {/* Categorized by period */}
              {['ancient', 'medieval', 'post-reformation', 'contemporary'].map((category) => (
                <div key={category}>
                  <h3 className="text-base font-medium text-[var(--foreground)] mb-4 pb-2 border-b border-[var(--divider)]">
                    {getCategoryLabel(category)}
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {heresies
                      .filter((h) => h.category === category)
                      .map((heresy) => (
                        <div
                          key={heresy.id}
                          className="group bg-white rounded-lg p-5 border border-[var(--divider)] hover:border-red-900/30 hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className="p-2 rounded-md bg-red-50">
                              <AlertTriangle size={18} className="text-red-700" strokeWidth={1.5} />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-base font-medium text-[var(--foreground)] mb-1 group-hover:text-red-900 transition-colors">
                                {heresy.name}
                              </h4>
                              <p className="text-xs text-[var(--muted-foreground)]">{heresy.period}</p>
                            </div>
                          </div>

                          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-4">
                            {heresy.description}
                          </p>

                          <div className="space-y-3 pt-3 border-t border-[var(--divider)]">
                            <div>
                              <h5 className="text-[10px] small-caps tracking-[0.12em] text-[var(--muted-foreground)] mb-1">
                                Key Figures
                              </h5>
                              <p className="text-xs text-[var(--foreground)]">
                                {heresy.keyFigures.join(', ')}
                              </p>
                            </div>
                            <div>
                              <h5 className="text-[10px] small-caps tracking-[0.12em] text-[var(--muted-foreground)] mb-1">
                                Refuted By
                              </h5>
                              <p className="text-xs text-[var(--foreground)]">
                                {heresy.refutedBy.join(', ')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Didaskalos Panel */}
      <DidaskaloPanel
        context={
          activeSection === 'panorama'
            ? 'Exploring biblical-historical panorama — Redemptive history from creation to contemporary Christianity'
            : activeSection === 'bible-history'
            ? 'Studying Bible history — Transmission, preservation, and translation of Scripture'
            : activeSection === 'catholicism'
            ? 'Examining Roman Catholic doctrine — Critical analysis from Reformed perspective'
            : activeSection === 'councils'
            ? 'Reviewing ecclesiastical councils — Doctrinal decisions throughout church history'
            : 'Studying heresies and doctrinal deviations — Biblical refutations and Reformed responses'
        }
        currentSource="curadoria"
        suggestions={[
          'Compare early church councils',
          'Study Reformation responses',
          'Examine manuscript transmission',
          'Review biblical authority debates'
        ]}
      />
    </div>
  );
}
