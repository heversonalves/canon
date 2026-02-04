import { useEffect, useState } from 'react';
import { DidaskaloPanel } from '@/app/components/didaskalos-panel';
import { Edit2, Plus, Check, X } from 'lucide-react';
import { api } from '@/app/lib/api';

interface SermonDivision {
  id: string;
  title: string;
  summary: string;
}

interface SermonApplication {
  id: string;
  title: string;
  body: string;
}

interface HomileticsPayload {
  id: string;
  central_idea: string;
  divisions: SermonDivision[];
  applications: SermonApplication[];
}

export function Homiletics() {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [centralIdea, setCentralIdea] = useState(
    "God demonstrates His righteousness by justifying sinners through faith in Christ's propitiatory sacrifice, revealing that salvation comes not by law but by grace alone."
  );
  const [draftCentralIdea, setDraftCentralIdea] = useState(centralIdea);
  const [divisions, setDivisions] = useState<SermonDivision[]>([
    {
      id: 'division-1',
      title: "God's Righteousness Revealed (v. 21-22)",
      summary:
        'The righteousness of God is revealed apart from the law, witnessed by Scripture, and received through faith in Jesus Christ.'
    },
    {
      id: 'division-2',
      title: "Humanity's Universal Need (v. 22-23)",
      summary:
        "All humanity stands equal in sinfulness and need, having fallen short of God's glory, requiring divine intervention."
    },
    {
      id: 'division-3',
      title: "Christ's Propitiatory Work (v. 24-26)",
      summary:
        'God provided Christ as propitiation, demonstrating both His justice and His justification of those who believe, reconciling mercy and righteousness.'
    }
  ]);
  const [editingDivisionId, setEditingDivisionId] = useState<string | null>(null);
  const [divisionDraft, setDivisionDraft] = useState({ title: '', summary: '' });
  const [applications, setApplications] = useState<SermonApplication[]>([
    {
      id: 'application-1',
      title: 'Doctrinal Application',
      body:
        "Understand that salvation is entirely of grace, not of works, eliminating all human boasting and establishing God's glory as the foundation of redemption."
    },
    {
      id: 'application-2',
      title: 'Pastoral Application',
      body:
        "Rest in the sufficiency of Christ's work, finding assurance not in personal merit but in the finished work of propitiation accomplished on your behalf."
    },
    {
      id: 'application-3',
      title: 'Evangelistic Application',
      body:
        'Proclaim that God offers justification freely to all who believe, without distinction, calling sinners to faith in Christ alone for salvation.'
    }
  ]);
  const [editingApplicationId, setEditingApplicationId] = useState<string | null>(null);
  const [applicationDraft, setApplicationDraft] = useState({ title: '', body: '' });

  useEffect(() => {
    const loadHomiletics = async () => {
      try {
        const data = await api.get<HomileticsPayload>('/api/homiletics');
        setCentralIdea(data.central_idea);
        setDraftCentralIdea(data.central_idea);
        setDivisions(data.divisions as SermonDivision[]);
        setApplications(data.applications as SermonApplication[]);
      } catch {
        // fallback to local defaults
      }
    };
    loadHomiletics();
  }, []);

  const persistHomiletics = (nextCentralIdea = centralIdea, nextDivisions = divisions, nextApplications = applications) => {
    api.put('/api/homiletics', {
      id: 'default',
      central_idea: nextCentralIdea,
      divisions: nextDivisions,
      applications: nextApplications
    }).catch(() => undefined);
  };

  const startCentralEdit = () => {
    setDraftCentralIdea(centralIdea);
    setEditingSection('central');
  };

  const saveCentralIdea = () => {
    const nextIdea = draftCentralIdea.trim() || centralIdea;
    setCentralIdea(nextIdea);
    persistHomiletics(nextIdea);
    setEditingSection(null);
  };

  const startDivisionEdit = (division: SermonDivision) => {
    setEditingDivisionId(division.id);
    setDivisionDraft({ title: division.title, summary: division.summary });
  };

  const saveDivision = () => {
    if (!editingDivisionId) return;
    const nextDivisions = divisions.map((division) =>
      division.id === editingDivisionId
        ? { ...division, title: divisionDraft.title, summary: divisionDraft.summary }
        : division
    );
    setDivisions(nextDivisions);
    persistHomiletics(centralIdea, nextDivisions);
    setEditingDivisionId(null);
  };

  const addDivision = () => {
    const newDivision: SermonDivision = {
      id: `division-${Date.now()}`,
      title: 'New Division',
      summary: 'Summarize the exposition for this point.'
    };
    const nextDivisions = [newDivision, ...divisions];
    setDivisions(nextDivisions);
    persistHomiletics(centralIdea, nextDivisions);
    startDivisionEdit(newDivision);
  };

  const startApplicationEdit = (application: SermonApplication) => {
    setEditingApplicationId(application.id);
    setApplicationDraft({ title: application.title, body: application.body });
  };

  const saveApplication = () => {
    if (!editingApplicationId) return;
    const nextApplications = applications.map((application) =>
      application.id === editingApplicationId
        ? { ...application, title: applicationDraft.title, body: applicationDraft.body }
        : application
    );
    setApplications(nextApplications);
    persistHomiletics(centralIdea, divisions, nextApplications);
    setEditingApplicationId(null);
  };

  const addApplication = () => {
    const newApplication: SermonApplication = {
      id: `application-${Date.now()}`,
      title: 'New Application',
      body: 'Write the application derived from the text.'
    };
    const nextApplications = [newApplication, ...applications];
    setApplications(nextApplications);
    persistHomiletics(centralIdea, divisions, nextApplications);
    startApplicationEdit(newApplication);
  };

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
                {editingSection === 'central' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={saveCentralIdea}
                      className="p-1.5 rounded hover:bg-[var(--light-gray)] transition-colors"
                    >
                      <Check size={14} className="text-[var(--deep-navy)]" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => setEditingSection(null)}
                      className="p-1.5 rounded hover:bg-[var(--light-gray)] transition-colors"
                    >
                      <X size={14} className="text-[var(--muted-foreground)]" strokeWidth={1.5} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={startCentralEdit}
                    className="p-1.5 rounded hover:bg-[var(--light-gray)] transition-colors"
                  >
                    <Edit2 size={14} className="text-[var(--muted-foreground)]" strokeWidth={1.5} />
                  </button>
                )}
              </div>
              {editingSection === 'central' ? (
                <textarea
                  value={draftCentralIdea}
                  onChange={(event) => setDraftCentralIdea(event.target.value)}
                  className="w-full text-sm leading-relaxed text-[var(--foreground)] border border-[var(--divider)] rounded-md p-3 resize-none focus:outline-none focus:border-[var(--deep-navy)]/40"
                  rows={4}
                />
              ) : (
                <p className="text-sm leading-relaxed text-[var(--foreground)]">{centralIdea}</p>
              )}
            </div>

            {/* Expository Divisions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] small-caps tracking-[0.12em] text-[var(--muted-foreground)]">
                  Expository Divisions
                </h3>
                <button
                  onClick={addDivision}
                  className="flex items-center gap-1 px-2 py-1 text-[10px] text-[var(--deep-navy)] hover:bg-white/50 rounded transition-colors"
                >
                  <Plus size={12} strokeWidth={1.5} />
                  <span>Add Point</span>
                </button>
              </div>

              {divisions.map((division, index) => (
                <div key={division.id} className="p-5 rounded-md bg-white border border-[var(--divider)]">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-2">
                      <span className="text-[var(--deep-navy)] font-medium text-sm">
                        {index + 1}.
                      </span>
                      <div className="flex-1">
                        {editingDivisionId === division.id ? (
                          <div className="space-y-2">
                            <input
                              value={divisionDraft.title}
                              onChange={(event) => setDivisionDraft({ ...divisionDraft, title: event.target.value })}
                              className="w-full border border-[var(--divider)] rounded-md px-3 py-2 text-sm"
                            />
                            <textarea
                              value={divisionDraft.summary}
                              onChange={(event) => setDivisionDraft({ ...divisionDraft, summary: event.target.value })}
                              className="w-full border border-[var(--divider)] rounded-md px-3 py-2 text-xs resize-none"
                              rows={3}
                            />
                          </div>
                        ) : (
                          <>
                            <h4 className="font-medium text-sm text-[var(--foreground)] mb-2">
                              {division.title}
                            </h4>
                            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                              {division.summary}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    {editingDivisionId === division.id ? (
                      <button
                        onClick={saveDivision}
                        className="p-1 rounded hover:bg-[var(--light-gray)] transition-colors"
                      >
                        <Check size={12} className="text-[var(--deep-navy)]" strokeWidth={1.5} />
                      </button>
                    ) : (
                      <button
                        onClick={() => startDivisionEdit(division)}
                        className="p-1 rounded hover:bg-[var(--light-gray)] transition-colors"
                      >
                        <Edit2 size={12} className="text-[var(--muted-foreground)]" strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Faithful Applications */}
            <div className="mt-8">
              <h3 className="text-[10px] small-caps tracking-[0.12em] text-[var(--muted-foreground)] mb-3">
                Faithful Applications
              </h3>
              <div className="space-y-3">
                <button
                  onClick={addApplication}
                  className="flex items-center gap-1 px-2 py-1 text-[10px] text-[var(--deep-navy)] hover:bg-white/50 rounded transition-colors"
                >
                  <Plus size={12} strokeWidth={1.5} />
                  <span>Add Application</span>
                </button>
                {applications.map((application) => (
                  <div key={application.id} className="p-4 rounded-md bg-white border border-[var(--divider)]">
                    {editingApplicationId === application.id ? (
                      <div className="space-y-2">
                        <input
                          value={applicationDraft.title}
                          onChange={(event) => setApplicationDraft({ ...applicationDraft, title: event.target.value })}
                          className="w-full border border-[var(--divider)] rounded-md px-3 py-2 text-xs"
                        />
                        <textarea
                          value={applicationDraft.body}
                          onChange={(event) => setApplicationDraft({ ...applicationDraft, body: event.target.value })}
                          className="w-full border border-[var(--divider)] rounded-md px-3 py-2 text-xs resize-none"
                          rows={3}
                        />
                        <button
                          onClick={saveApplication}
                          className="flex items-center gap-1 px-2 py-1 text-[10px] text-[var(--deep-navy)] hover:bg-[var(--light-gray)] rounded transition-colors"
                        >
                          <Check size={12} strokeWidth={1.5} />
                          <span>Save</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-medium text-[var(--deep-navy)]">
                            {application.title}
                          </h4>
                          <button
                            onClick={() => startApplicationEdit(application)}
                            className="p-1 rounded hover:bg-[var(--light-gray)] transition-colors"
                          >
                            <Edit2 size={12} className="text-[var(--muted-foreground)]" strokeWidth={1.5} />
                          </button>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                          {application.body}
                        </p>
                      </>
                    )}
                  </div>
                ))}
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
