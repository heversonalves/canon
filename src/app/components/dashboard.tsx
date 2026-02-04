import { useState } from 'react';
import { BookOpen, FileText, BookMarked, Calendar, ExternalLink, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

type MaterialType = 'article' | 'dissertation' | 'paper' | 'chapter';
type TheologicalTradition = 'Reformed' | 'Baptist' | 'Pentecostal' | 'Patristic' | 'Textual Criticism' | 'Church History';

interface AcademicCard {
  id: string;
  title: string;
  author: string;
  institution: string;
  tags: TheologicalTradition[];
  type: MaterialType;
  abstract: string;
  date: string;
}

const todaysCuratedContent: AcademicCard[] = [
  {
    id: '1',
    title: 'The Doctrine of Justification in the Westminster Confession',
    author: 'Dr. Richard B. Gaffin Jr.',
    institution: 'Westminster Theological Seminary',
    tags: ['Reformed', 'Textual Criticism'],
    type: 'article',
    abstract: 'Examination of the Reformed understanding of forensic justification as articulated in WCF Chapter XI, with particular attention to the biblical-theological grounds.',
    date: '2026-01-14'
  },
  {
    id: '2',
    title: 'Manuscript Transmission and Scribal Practices in Early Christianity',
    author: 'Prof. Larry Hurtado',
    institution: 'University of Edinburgh',
    tags: ['Textual Criticism', 'Patristic'],
    type: 'dissertation',
    abstract: 'Analysis of paleographical evidence for the transmission of New Testament texts in the second and third centuries, with focus on P75 and P66.',
    date: '2026-01-14'
  },
  {
    id: '3',
    title: 'Baptist Covenant Theology: A Historical Survey',
    author: 'Dr. James Renihan',
    institution: 'Institute of Reformed Baptist Studies',
    tags: ['Baptist', 'Church History'],
    type: 'chapter',
    abstract: 'Exploration of covenant theology within the particular Baptist tradition, tracing its development from the 17th century London Confession to contemporary expressions.',
    date: '2026-01-14'
  },
  {
    id: '4',
    title: 'Pneumatology in Pentecostal-Charismatic Theology',
    author: 'Dr. Amos Yong',
    institution: 'Fuller Theological Seminary',
    tags: ['Pentecostal', 'Church History'],
    type: 'paper',
    abstract: 'Constructive engagement with the doctrine of the Holy Spirit in contemporary Pentecostal theology, examining its biblical foundations and systematic implications.',
    date: '2026-01-14'
  },
  {
    id: '5',
    title: 'Athanasius and the Nicene Defense of Homoousios',
    author: 'Dr. Khaled Anatolios',
    institution: 'Catholic University of America',
    tags: ['Patristic', 'Church History'],
    type: 'article',
    abstract: 'Historical-theological analysis of Athanasius\' defense of Nicene orthodoxy, with attention to his exegetical arguments from Scripture.',
    date: '2026-01-14'
  },
  {
    id: '6',
    title: 'Textual Variants in Romans 3:21-26: Theological Implications',
    author: 'Dr. Daniel B. Wallace',
    institution: 'Dallas Theological Seminary',
    tags: ['Textual Criticism', 'Reformed'],
    type: 'paper',
    abstract: 'Detailed examination of variant readings in Paul\'s exposition on justification, with assessment of their impact on Pauline theology.',
    date: '2026-01-14'
  }
];

const materialTypeIcons: Record<MaterialType, React.ReactNode> = {
  article: <FileText size={14} strokeWidth={1.5} />,
  dissertation: <BookMarked size={14} strokeWidth={1.5} />,
  paper: <FileText size={14} strokeWidth={1.5} />,
  chapter: <BookOpen size={14} strokeWidth={1.5} />
};

const materialTypeLabels: Record<MaterialType, string> = {
  article: 'Article',
  dissertation: 'Dissertation',
  paper: 'Paper',
  chapter: 'Book Chapter'
};

const tagColors: Record<TheologicalTradition, string> = {
  'Reformed': 'bg-[var(--deep-navy)]/10 text-[var(--deep-navy)] border-[var(--deep-navy)]/20',
  'Baptist': 'bg-[var(--muted-bronze)]/10 text-[var(--muted-bronze)] border-[var(--muted-bronze)]/20',
  'Pentecostal': 'bg-red-900/10 text-red-900 border-red-900/20',
  'Patristic': 'bg-amber-900/10 text-amber-900 border-amber-900/20',
  'Textual Criticism': 'bg-[var(--dark-olive)]/10 text-[var(--dark-olive)] border-[var(--dark-olive)]/20',
  'Church History': 'bg-purple-900/10 text-purple-900 border-purple-900/20'
};

export function Dashboard() {
  const [activeView, setActiveView] = useState<'today' | 'archive'>('today');

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-12 py-8 border-b border-[var(--divider)] bg-white">
        <h1 className="text-3xl tracking-tight text-[var(--graphite)] mb-2">CANON</h1>
        <p className="text-sm text-[var(--muted-foreground)] tracking-wide">
          Biblical and Theological Study Environment
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Academic Curated Content Section */}
        <div className="px-12 py-10 border-b border-[var(--divider)] bg-[var(--ivory)]/20">
          <div className="max-w-7xl">
            {/* Section Header */}
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl tracking-tight text-[var(--graphite)] mb-2">
                  Academic Curated Content — Today
                </h2>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed max-w-3xl">
                  Carefully curated theological, historical, and biblical studies from trusted academic institutions.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                <Calendar size={14} strokeWidth={1.5} />
                <span>Wednesday, January 14, 2026</span>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setActiveView('today')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeView === 'today'
                    ? 'bg-[var(--deep-navy)] text-white'
                    : 'bg-white text-[var(--foreground)] border border-[var(--divider)] hover:border-[var(--deep-navy)]/30'
                }`}
              >
                Today's Materials
              </button>
              <button
                onClick={() => setActiveView('archive')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeView === 'archive'
                    ? 'bg-[var(--deep-navy)] text-white'
                    : 'bg-white text-[var(--foreground)] border border-[var(--divider)] hover:border-[var(--deep-navy)]/30'
                }`}
              >
                Catalogued Archive
              </button>
            </div>

            {/* Academic Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {todaysCuratedContent.map((card) => (
                <div
                  key={card.id}
                  className="group bg-white rounded-lg p-5 border border-[var(--divider)] hover:border-[var(--deep-navy)]/30 hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  {/* Type & Date */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
                      {materialTypeIcons[card.type]}
                      <span className="text-[10px] small-caps tracking-wide">
                        {materialTypeLabels[card.type]}
                      </span>
                    </div>
                    <span className="text-[9px] text-[var(--muted-foreground)]">
                      {new Date(card.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-medium text-[var(--foreground)] mb-2 leading-snug line-clamp-2 group-hover:text-[var(--deep-navy)] transition-colors">
                    {card.title}
                  </h3>

                  {/* Author & Institution */}
                  <div className="mb-3">
                    <p className="text-xs font-medium text-[var(--foreground)]">{card.author}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">{card.institution}</p>
                  </div>

                  {/* Abstract */}
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-4 line-clamp-3">
                    {card.abstract}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[var(--divider)]">
                    {card.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-0.5 rounded text-[9px] font-medium border ${tagColors[tag]}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* View All Link */}
            <div className="mt-6 text-center">
              <Link to="/curadoria">
                <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium text-[var(--deep-navy)] bg-white border border-[var(--divider)] hover:border-[var(--deep-navy)]/30 hover:shadow-sm transition-all">
                  <span>Explore Full Curation</span>
                  <ExternalLink size={14} strokeWidth={1.5} />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Continue Your Study */}
        <div className="px-12 py-8">
          <div className="max-w-7xl space-y-8">
            <div>
              <h2 className="text-xs tracking-[0.1em] small-caps text-[var(--muted-foreground)] mb-4">
                Continue Your Study
              </h2>
              <Link to="/biblical-study">
                <div className="group bg-white rounded-lg p-6 border border-[var(--divider)] hover:border-[var(--deep-navy)]/30 hover:shadow-sm transition-all duration-300 cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-[var(--deep-navy)]/5 flex items-center justify-center">
                        <BookOpen size={18} className="text-[var(--deep-navy)]" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="font-medium text-[var(--foreground)] mb-1">Romans 3:21-26</h3>
                        <p className="text-xs text-[var(--muted-foreground)]">The Epistle to the Romans</p>
                      </div>
                    </div>
                    <span className="text-[10px] tracking-wide text-[var(--muted-foreground)] small-caps">
                      In Progress
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--muted-foreground)] mb-3">
                    Examining Paul's exposition on justification through faith and the demonstration of God's righteousness
                  </p>
                  <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
                    <div className="flex items-center gap-1">
                      <Clock size={12} strokeWidth={1.5} />
                      <span>Last session: 2 hours ago</span>
                    </div>
                    <div>•</div>
                    <div>12 notes</div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Quick Access */}
            <div>
              <h2 className="text-xs tracking-[0.1em] small-caps text-[var(--muted-foreground)] mb-4">
                Quick Access
              </h2>
              <div className="grid grid-cols-4 gap-4">
                <Link to="/biblical-study">
                  <div className="bg-white rounded-lg p-5 border border-[var(--divider)] hover:border-[var(--deep-navy)]/30 transition-all duration-200 cursor-pointer">
                    <h3 className="text-sm font-medium text-[var(--foreground)] mb-1">Biblical Study</h3>
                    <p className="text-xs text-[var(--muted-foreground)]">Exegetical analysis</p>
                  </div>
                </Link>
                <Link to="/textual-criticism">
                  <div className="bg-white rounded-lg p-5 border border-[var(--divider)] hover:border-[var(--deep-navy)]/30 transition-all duration-200 cursor-pointer">
                    <h3 className="text-sm font-medium text-[var(--foreground)] mb-1">Textual Criticism</h3>
                    <p className="text-xs text-[var(--muted-foreground)]">Manuscript comparison</p>
                  </div>
                </Link>
                <Link to="/homiletics">
                  <div className="bg-white rounded-lg p-5 border border-[var(--divider)] hover:border-[var(--deep-navy)]/30 transition-all duration-200 cursor-pointer">
                    <h3 className="text-sm font-medium text-[var(--foreground)] mb-1">Homiletics</h3>
                    <p className="text-xs text-[var(--muted-foreground)]">Sermon preparation</p>
                  </div>
                </Link>
                <Link to="/curadoria">
                  <div className="bg-white rounded-lg p-5 border border-[var(--divider)] hover:border-[var(--deep-navy)]/30 transition-all duration-200 cursor-pointer">
                    <h3 className="text-sm font-medium text-[var(--foreground)] mb-1">Curadoria</h3>
                    <p className="text-xs text-[var(--muted-foreground)]">Academic research</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
