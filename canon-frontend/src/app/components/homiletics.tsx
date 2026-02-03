import { useState } from 'react';
import { DidaskaloPanel } from '@/app/components/didaskalos-panel';
import { Edit2, Plus } from 'lucide-react';

export function Homiletics() {
  const [editingSection, setEditingSection] = useState<string | null>(null);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Content - Two Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Biblical Text (Fixed) */}
        <div className="w-1/2 bg-white border-r border-[var(--divider)] overflow-y-auto">
          <div className="px-10 py-8">
            {/* Header */}
            <div className="mb-6 pb-4 border-b border-[var(--divider)]">
              <h2 className="text-xs small-caps tracking-[0.12em] text-[var(--muted-foreground)] mb-3">
                Biblical Text
              </h2>
              <h1 className="text-xl tracking-tight text-[var(--graphite)] mb-1">
                Romans 3:21-26
              </h1>
              <p className="text-xs text-[var(--muted-foreground)]">
                The Epistle to the Romans
              </p>
            </div>

            {/* Biblical Text */}
            <div className="space-y-4 font-serif-reading">
              <p className="leading-relaxed text-[var(--foreground)]">
                <span className="text-[var(--muted-foreground)] text-sm font-sans mr-2">21</span>
                Mas agora se manifestou, sem a lei, a justiça de Deus, tendo o testemunho da lei e dos profetas;
              </p>
              <p className="leading-relaxed text-[var(--foreground)]">
                <span className="text-[var(--muted-foreground)] text-sm font-sans mr-2">22</span>
                Isto é, a justiça de Deus pela fé em Jesus Cristo para todos e sobre todos os que creem; porque não há diferença.
              </p>
              <p className="leading-relaxed text-[var(--foreground)]">
                <span className="text-[var(--muted-foreground)] text-sm font-sans mr-2">23</span>
                Porque todos pecaram e destituídos estão da glória de Deus;
              </p>
              <p className="leading-relaxed text-[var(--foreground)]">
                <span className="text-[var(--muted-foreground)] text-sm font-sans mr-2">24</span>
                Sendo justificados gratuitamente pela sua graça, pela redenção que há em Cristo Jesus;
              </p>
              <p className="leading-relaxed text-[var(--foreground)]">
                <span className="text-[var(--muted-foreground)] text-sm font-sans mr-2">25</span>
                Ao qual Deus propôs para propiciação pela fé no seu sangue, para demonstrar a sua justiça pela remissão dos pecados dantes cometidos, sob a paciência de Deus;
              </p>
              <p className="leading-relaxed text-[var(--foreground)]">
                <span className="text-[var(--muted-foreground)] text-sm font-sans mr-2">26</span>
                Para demonstração da sua justiça neste tempo presente, para que ele seja justo e justificador daquele que tem fé em Jesus.
              </p>
            </div>

            {/* Key Observations */}
            <div className="mt-8 p-5 rounded-md bg-[var(--light-gray)]/50 border border-[var(--divider)]">
              <h3 className="text-[10px] small-caps tracking-[0.12em] text-[var(--muted-foreground)] mb-3">
                Key Theological Themes
              </h3>
              <ul className="space-y-2 text-xs text-[var(--foreground)]">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--muted-bronze)]">•</span>
                  <span>God's righteousness revealed apart from law</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--muted-bronze)]">•</span>
                  <span>Universal sinfulness and need</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--muted-bronze)]">•</span>
                  <span>Justification by grace through faith</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--muted-bronze)]">•</span>
                  <span>Christ as propitiation and demonstration of justice</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Side - Sermon Structure */}
        <div className="w-1/2 bg-[var(--ivory)] overflow-y-auto">
          <div className="px-10 py-8">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xs small-caps tracking-[0.12em] text-[var(--muted-foreground)] mb-3">
                Expository Sermon Structure
              </h2>
              <h1 className="text-xl tracking-tight text-[var(--deep-navy)]">
                The Gospel of God's Righteousness
              </h1>
            </div>

            {/* Central Idea of the Text */}
            <div className="mb-8 p-6 rounded-lg bg-white border-2 border-[var(--deep-navy)]/20 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] small-caps tracking-[0.12em] text-[var(--deep-navy)]">
                  Central Idea of the Text
                </h3>
                <button
                  onClick={() => setEditingSection('central')}
                  className="p-1.5 rounded hover:bg-[var(--light-gray)] transition-colors"
                >
                  <Edit2 size={14} className="text-[var(--muted-foreground)]" strokeWidth={1.5} />
                </button>
              </div>
              <p className="text-sm leading-relaxed text-[var(--foreground)]">
                God demonstrates His righteousness by justifying sinners through faith in Christ's propitiatory sacrifice, 
                revealing that salvation comes not by law but by grace alone.
              </p>
            </div>

            {/* Expository Divisions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] small-caps tracking-[0.12em] text-[var(--muted-foreground)]">
                  Expository Divisions
                </h3>
                <button className="flex items-center gap-1 px-2 py-1 text-[10px] text-[var(--deep-navy)] hover:bg-white/50 rounded transition-colors">
                  <Plus size={12} strokeWidth={1.5} />
                  <span>Add Point</span>
                </button>
              </div>

              {/* Division I */}
              <div className="p-5 rounded-md bg-white border border-[var(--divider)]">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2">
                    <span className="text-[var(--deep-navy)] font-medium text-sm">I.</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-[var(--foreground)] mb-2">
                        God's Righteousness Revealed (v. 21-22)
                      </h4>
                      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                        The righteousness of God is revealed apart from the law, witnessed by Scripture, 
                        and received through faith in Jesus Christ.
                      </p>
                    </div>
                  </div>
                  <button className="p-1 rounded hover:bg-[var(--light-gray)] transition-colors">
                    <Edit2 size={12} className="text-[var(--muted-foreground)]" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Division II */}
              <div className="p-5 rounded-md bg-white border border-[var(--divider)]">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2">
                    <span className="text-[var(--deep-navy)] font-medium text-sm">II.</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-[var(--foreground)] mb-2">
                        Humanity's Universal Need (v. 22-23)
                      </h4>
                      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                        All humanity stands equal in sinfulness and need, having fallen short of God's glory, 
                        requiring divine intervention.
                      </p>
                    </div>
                  </div>
                  <button className="p-1 rounded hover:bg-[var(--light-gray)] transition-colors">
                    <Edit2 size={12} className="text-[var(--muted-foreground)]" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Division III */}
              <div className="p-5 rounded-md bg-white border border-[var(--divider)]">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2">
                    <span className="text-[var(--deep-navy)] font-medium text-sm">III.</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-[var(--foreground)] mb-2">
                        Christ's Propitiatory Work (v. 24-26)
                      </h4>
                      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                        God provided Christ as propitiation, demonstrating both His justice and His justification 
                        of those who believe, reconciling mercy and righteousness.
                      </p>
                    </div>
                  </div>
                  <button className="p-1 rounded hover:bg-[var(--light-gray)] transition-colors">
                    <Edit2 size={12} className="text-[var(--muted-foreground)]" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>

            {/* Faithful Applications */}
            <div className="mt-8">
              <h3 className="text-[10px] small-caps tracking-[0.12em] text-[var(--muted-foreground)] mb-3">
                Faithful Applications
              </h3>
              <div className="space-y-3">
                <div className="p-4 rounded-md bg-white border border-[var(--divider)]">
                  <h4 className="text-xs font-medium text-[var(--deep-navy)] mb-2">
                    Doctrinal Application
                  </h4>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    Understand that salvation is entirely of grace, not of works, eliminating all human boasting 
                    and establishing God's glory as the foundation of redemption.
                  </p>
                </div>
                <div className="p-4 rounded-md bg-white border border-[var(--divider)]">
                  <h4 className="text-xs font-medium text-[var(--deep-navy)] mb-2">
                    Pastoral Application
                  </h4>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    Rest in the sufficiency of Christ's work, finding assurance not in personal merit but in 
                    the finished work of propitiation accomplished on your behalf.
                  </p>
                </div>
                <div className="p-4 rounded-md bg-white border border-[var(--divider)]">
                  <h4 className="text-xs font-medium text-[var(--deep-navy)] mb-2">
                    Evangelistic Application
                  </h4>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    Proclaim that God offers justification freely to all who believe, without distinction, 
                    calling sinners to faith in Christ alone for salvation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Didaskalos Panel */}
      <DidaskaloPanel
        context="Preparing expository sermon on Romans 3:21-26 — Developing faithful application from the text"
        suggestions={[
          "Ensure applications flow from the text's meaning",
          "Consider historical-cultural context for clarity",
          "Review commentaries on propitiation terminology",
          "Examine parallel passages on justification"
        ]}
      />
    </div>
  );
}
