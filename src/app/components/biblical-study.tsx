import { useState } from 'react';
import { DidaskaloPanel } from '@/app/components/didaskalos-panel';
import { Highlighter, Check, X, ChevronDown, BookOpen, User } from 'lucide-react';

interface Highlight {
  verseNum: number;
  text: string;
  color: string;
  startIndex: number;
  endIndex: number;
}

interface WordAnalysis {
  word: string;
  transliteration: string;
  meaning: string;
  semanticField: string;
  usage: string;
  occurrences: string[];
  nominalForm: string;
  etymology: string;
  lexiconRef: string;
}

interface Commentary {
  author: string;
  work: string;
  year: string;
  excerpt: string;
  page: string;
}

type PortugueseTranslation = 'ACF' | 'ARA';

const highlightColors = [
  { name: 'Yellow', value: 'bg-yellow-200/60', border: 'border-yellow-400' },
  { name: 'Green', value: 'bg-green-200/60', border: 'border-green-400' },
  { name: 'Blue', value: 'bg-blue-200/60', border: 'border-blue-400' },
  { name: 'Pink', value: 'bg-pink-200/60', border: 'border-pink-400' },
  { name: 'Purple', value: 'bg-purple-200/60', border: 'border-purple-400' },
];

// Mock Bible book data
const bibleBooks = {
  ot: [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
    '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
    'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
    'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
    'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
    'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
    'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
  ],
  nt: [
    'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
    '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
    'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
    '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
    'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
    'Jude', 'Revelation'
  ]
};

// Mock chapter data - Romans 3
const mockChapters: { [key: string]: any } = {
  'Romans-3': {
    verses: [
      { 
        num: 21, 
        translations: {
          ACF: "Mas agora se manifestou, sem a lei, a justiça de Deus, tendo o testemunho da lei e dos profetas;",
          ARA: "Mas agora, sem lei, se manifestou a justiça de Deus, testemunhada pela lei e pelos profetas;"
        },
        greek: "Νυνὶ δὲ χωρὶς νόμου δικαιοσύνη θεοῦ πεφανέρωται μαρτυρουμένη ὑπὸ τοῦ νόμου καὶ τῶν προφητῶν,",
        transliteration: "Nyni de chōris nomou dikaiosynē theou pephanerōtai martyroumenē hypo tou nomou kai tōn prophētōn,",
        words: ["Νυνὶ", "δὲ", "χωρὶς", "νόμου", "δικαιοσύνη", "θεοῦ", "πεφανέρωται", "μαρτυρουμένη", "ὑπὸ", "τοῦ", "νόμου", "καὶ", "τῶν", "προφητῶν"]
      },
      { 
        num: 22, 
        translations: {
          ACF: "Isto é, a justiça de Deus pela fé em Jesus Cristo para todos e sobre todos os que creem; porque não há diferença.",
          ARA: "Justiça de Deus mediante a fé em Jesus Cristo, para todos e sobre todos os que creem; porque não há distinção;"
        },
        greek: "δικαιοσύνη δὲ θεοῦ διὰ πίστεως Ἰησοῦ Χριστοῦ εἰς πάντας τοὺς πιστεύοντας· οὐ γάρ ἐστιν διαστολή·",
        transliteration: "dikaiosynē de theou dia pisteōs Iēsou Christou eis pantas tous pisteuontas; ou gar estin diastolē;",
        words: ["δικαιοσύνη", "δὲ", "θεοῦ", "διὰ", "πίστεως", "Ἰησοῦ", "Χριστοῦ", "εἰς", "πάντας", "τοὺς", "πιστεύοντας", "οὐ", "γάρ", "ἐστιν", "διαστολή"]
      },
      { 
        num: 23, 
        translations: {
          ACF: "Porque todos pecaram e destituídos estão da glória de Deus;",
          ARA: "Pois todos pecaram e carecem da glória de Deus;"
        },
        greek: "πάντες γὰρ ἥμαρτον καὶ ὑστεροῦνται τῆς δόξης τοῦ θεοῦ,",
        transliteration: "pantes gar hēmarton kai hysterountai tēs doxēs tou theou,",
        words: ["πάντες", "γὰρ", "ἥμαρτον", "καὶ", "ὑστεροῦνται", "τῆς", "δόξης", "τοῦ", "θεοῦ"]
      },
      { 
        num: 24, 
        translations: {
          ACF: "Sendo justificados gratuitamente pela sua graça, pela redenção que há em Cristo Jesus;",
          ARA: "Sendo justificados gratuitamente, por sua graça, mediante a redenção que há em Cristo Jesus;"
        },
        greek: "δικαιούμενοι δωρεὰν τῇ αὐτοῦ χάριτι διὰ τῆς ἀπολυτρώσεως τῆς ἐν Χριστῷ Ἰησοῦ·",
        transliteration: "dikaiomenoi dōrean tē autou chariti dia tēs apolytrōseōs tēs en Christō Iēsou;",
        words: ["δικαιούμενοι", "δωρεὰν", "τῇ", "αὐτοῦ", "χάριτι", "διὰ", "τῆς", "ἀπολυτρώσεως", "τῆς", "ἐν", "Χριστῷ", "Ἰησοῦ"]
      },
      { 
        num: 25, 
        translations: {
          ACF: "Ao qual Deus propôs para propiciação pela fé no seu sangue, para demonstrar a sua justiça pela remissão dos pecados dantes cometidos, sob a paciência de Deus;",
          ARA: "A quem Deus propôs, no seu sangue, como propiciação, mediante a fé, para manifestar a sua justiça, por ter Deus, na sua tolerância, deixado impunes os pecados anteriormente cometidos;"
        },
        greek: "ὃν προέθετο ὁ θεὸς ἱλαστήριον διὰ πίστεως ἐν τῷ αὐτοῦ αἵματι εἰς ἔνδειξιν τῆς δικαιοσύνης αὐτοῦ διὰ τὴν πάρεσιν τῶν προγεγονότων ἁμαρτημάτων",
        transliteration: "hon proetheto ho theos hilastērion dia pisteōs en tō autou haimati eis endeixin tēs dikaiosynēs autou dia tēn paresin tōn progegonotōn hamartēmatōn",
        words: ["ὃν", "προέθετο", "ὁ", "θεὸς", "ἱλαστήριον", "διὰ", "πίστεως", "ἐν", "τῷ", "αὐτοῦ", "αἵματι", "εἰς", "ἔνδειξιν", "τῆς", "δικαιοσύνης", "αὐτοῦ"]
      },
      { 
        num: 26, 
        translations: {
          ACF: "Para demonstração da sua justiça neste tempo presente, para que ele seja justo e justificador daquele que tem fé em Jesus.",
          ARA: "Tendo em vista a manifestação da sua justiça no tempo presente, para ele mesmo ser justo e o justificador daquele que tem fé em Jesus;"
        },
        greek: "ἐν τῇ ἀνοχῇ τοῦ θεοῦ, πρὸς τὴν ἔνδειξιν τῆς δικαιοσύνης αὐτοῦ ἐν τῷ νῦν καιρῷ, εἰς τὸ εἶναι αὐτὸν δίκαιον καὶ δικαιοῦντα τὸν ἐκ πίστεως Ἰησοῦ.",
        transliteration: "en tē anochē tou theou, pros tēn endeixin tēs dikaiosynēs autou en tō nyn kairō, eis to einai auton dikaion kai dikaiounta ton ek pisteōs Iēsou.",
        words: ["ἐν", "τῇ", "ἀνοχῇ", "τοῦ", "θεοῦ", "πρὸς", "τὴν", "ἔνδειξιν", "τῆς", "δικαιοσύνης", "αὐτοῦ", "ἐν", "τῷ", "νῦν", "καιρῷ"]
      }
    ]
  },
  'Genesis-1': {
    verses: [
      {
        num: 1,
        translations: {
          ACF: "No princípio criou Deus os céus e a terra.",
          ARA: "No princípio criou Deus os céus e a terra."
        },
        hebrew: "בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ",
        transliteration: "bərēʾšîṯ bārāʾ ʾĕlōhîm ʾēṯ haššāmayim wəʾēṯ hāʾāreṣ",
        words: ["בְּרֵאשִׁית", "בָּרָא", "אֱלֹהִים", "אֵת", "הַשָּׁמַיִם", "וְאֵת", "הָאָרֶץ"]
      },
      {
        num: 2,
        translations: {
          ACF: "E a terra era sem forma e vazia; e havia trevas sobre a face do abismo; e o Espírito de Deus se movia sobre a face das águas.",
          ARA: "A terra, porém, estava sem forma e vazia; havia trevas sobre a face do abismo, e o Espírito de Deus pairava por sobre as águas."
        },
        hebrew: "וְהָאָרֶץ הָיְתָה תֹהוּ וָבֹהוּ וְחֹשֶׁךְ עַל־פְּנֵי תְהוֹם וְרוּחַ אֱלֹהִים מְרַחֶפֶת עַל־פְּנֵי הַמָּיִם",
        transliteration: "wəhāʾāreṣ hāyəṯāh ṯōhû wāḇōhû wəḥōšeḵ ʿal-pənê ṯəhôm wərûaḥ ʾĕlōhîm məraḥefeṯ ʿal-pənê hammāyim",
        words: ["וְהָאָרֶץ", "הָיְתָה", "תֹהוּ", "וָבֹהוּ", "וְחֹשֶׁךְ", "עַל־פְּנֵי", "תְהוֹם", "וְרוּחַ", "אֱלֹהִים"]
      },
      {
        num: 3,
        translations: {
          ACF: "E disse Deus: Haja luz; e houve luz.",
          ARA: "Disse Deus: Haja luz; e houve luz."
        },
        hebrew: "וַיֹּאמֶר אֱלֹהִים יְהִי אוֹר וַיְהִי־אוֹר",
        transliteration: "wayyōʾmer ʾĕlōhîm yəhî ʾôr wayəhî-ʾôr",
        words: ["וַיֹּאמֶר", "אֱלֹהִים", "יְהִי", "אוֹר", "וַיְהִי־אוֹר"]
      }
    ]
  }
};

// Lexicon data
const lexiconData: { [key: string]: WordAnalysis } = {
  'δικαιοσύνη': {
    word: 'δικαιοσύνη',
    transliteration: 'dikaiosynē',
    meaning: 'Righteousness, justice; the quality of being right or just, conformity to the will of God',
    semanticField: '88.12 Just, Righteous (Louw & Nida)',
    usage: 'In Romans, often refers to God\'s covenant faithfulness and saving righteousness',
    occurrences: ['Romans 1:17', 'Romans 3:21', 'Romans 3:22', 'Romans 10:3', 'Matthew 5:6'],
    nominalForm: 'Noun - Nominative Singular Feminine',
    etymology: 'From δίκαιος (dikaios, "righteous") + -σύνη (-synē, noun suffix)',
    lexiconRef: 'BDAG p. 247-249; Thayer p. 149; LSJ p. 429'
  },
  'πίστεως': {
    word: 'πίστις',
    transliteration: 'pistis (genitive: pisteōs)',
    meaning: 'Faith, trust, belief; firm conviction and confidence in God and Christ',
    semanticField: '31.85 Faith, Trust (Louw & Nida)',
    usage: 'Central Pauline concept; both human faith and Christ\'s faithfulness',
    occurrences: ['Romans 1:17', 'Romans 3:22', 'Romans 3:25', 'Galatians 2:16', 'Ephesians 2:8'],
    nominalForm: 'Noun - Genitive Singular Feminine',
    etymology: 'From πείθω (peithō, "to persuade")',
    lexiconRef: 'BDAG p. 818-820; Thayer p. 513; LSJ p. 1408'
  },
  'בְּרֵאשִׁית': {
    word: 'בְּרֵאשִׁית',
    transliteration: 'bərēʾšîṯ',
    meaning: 'In the beginning; temporal phrase marking the start of creation',
    semanticField: 'Time - Beginning (HALOT)',
    usage: 'Construct form with preposition, indicating temporal priority',
    occurrences: ['Genesis 1:1', 'Proverbs 8:23', 'Isaiah 46:10'],
    nominalForm: 'Noun - Feminine Singular Construct with preposition בְּ',
    etymology: 'From רֹאשׁ (rōʾš, "head/beginning") with construct ending',
    lexiconRef: 'HALOT p. 1168; BDB p. 912; DCH Vol. 7 p. 353'
  }
};

// Commentary data
const commentaryData: { [key: string]: Commentary[] } = {
  'Romans-3': [
    {
      author: 'Douglas J. Moo',
      work: 'The Epistle to the Romans (NICNT)',
      year: '1996',
      excerpt: 'The revelation of God\'s righteousness "apart from law" (v. 21) marks a decisive shift in salvation history. Paul emphasizes that this righteousness, while new in its manifestation through Christ, is attested by the OT Scriptures themselves. The phrase "righteousness of God" (dikaiosynē theou) is forensic, denoting God\'s saving activity that puts people right with himself.',
      page: 'p. 219-224'
    },
    {
      author: 'Thomas R. Schreiner',
      work: 'Romans (Baker Exegetical Commentary)',
      year: '1998',
      excerpt: 'Paul\'s argument in 3:21-26 represents the heart of his theology. The righteousness of God is both a gift and God\'s own character. It comes "through faith in Jesus Christ" (dia pisteōs Iēsou Christou), which may be understood as faith in Christ or Christ\'s own faithfulness—likely both dimensions are present.',
      page: 'p. 181-194'
    },
    {
      author: 'N. T. Wright',
      work: 'The Letter to the Romans (NIB)',
      year: '2002',
      excerpt: 'The "righteousness of God" in Romans is God\'s covenant faithfulness, his determination to put the world right and to be true to his promises to Abraham. When Paul speaks of this righteousness being "revealed" (pephanerōtai), he refers to the eschatological unveiling of what God always intended.',
      page: 'p. 470-476'
    }
  ],
  'Genesis-1': [
    {
      author: 'Gordon J. Wenham',
      work: 'Genesis 1-15 (Word Biblical Commentary)',
      year: '1987',
      excerpt: 'The opening word bərēʾšîṯ ("in the beginning") sets the temporal framework for all that follows. The construct state suggests this is not an absolute beginning, but the beginning of God\'s creative work. The verb bārāʾ is used exclusively of divine activity in the OT.',
      page: 'p. 11-12'
    },
    {
      author: 'Victor P. Hamilton',
      work: 'The Book of Genesis: Chapters 1-17 (NICOT)',
      year: '1990',
      excerpt: 'The plural form ʾĕlōhîm with singular verb has generated considerable discussion. While some see here an allusion to the Trinity, it is more likely a plural of majesty or intensive plural, emphasizing God\'s transcendence and fullness of power.',
      page: 'p. 106-107'
    }
  ]
};

export function BiblicalStudy() {
  const [testament, setTestament] = useState<'ot' | 'nt'>('nt');
  const [selectedBook, setSelectedBook] = useState<string>('Romans');
  const [selectedChapter, setSelectedChapter] = useState<number>(3);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [translation, setTranslation] = useState<PortugueseTranslation>('ACF');
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [highlightMenuPosition, setHighlightMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState<{ text: string; verseNum: number }>({ text: '', verseNum: 0 });
  const [isHighlightMode, setIsHighlightMode] = useState(false);
  const [selectedWord, setSelectedWord] = useState<WordAnalysis | null>(null);

  const chapterKey = `${selectedBook}-${selectedChapter}`;
  const currentChapter = mockChapters[chapterKey] || mockChapters['Romans-3'];
  const isGreek = testament === 'nt';
  const commentaries = commentaryData[chapterKey] || [];

  const handleTextSelection = (verseNum: number, e: React.MouseEvent) => {
    if (!isHighlightMode) return;

    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setSelectedText({
        text: selection.toString(),
        verseNum: verseNum
      });
      
      setHighlightMenuPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
      
      setShowHighlightMenu(true);
    }
  };

  const applyHighlight = (color: string) => {
    if (selectedText.text && selectedText.verseNum) {
      const verse = currentChapter.verses.find((v: any) => v.num === selectedText.verseNum);
      if (verse) {
        const verseText = verse.translations?.[translation] ?? verse.translation;
        const startIndex = verseText.indexOf(selectedText.text);
        if (startIndex !== -1) {
          const newHighlight: Highlight = {
            verseNum: selectedText.verseNum,
            text: selectedText.text,
            color: color,
            startIndex: startIndex,
            endIndex: startIndex + selectedText.text.length
          };
          setHighlights([...highlights, newHighlight]);
        }
      }
    }
    setShowHighlightMenu(false);
    window.getSelection()?.removeAllRanges();
  };

  const renderHighlightedText = (verse: any) => {
    const verseHighlights = highlights.filter(h => h.verseNum === verse.num);
    const verseText = verse.translations?.[translation] ?? verse.translation;
    if (verseHighlights.length === 0) {
      return verseText;
    }

    const sortedHighlights = [...verseHighlights].sort((a, b) => a.startIndex - b.startIndex);
    
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    sortedHighlights.forEach((highlight, idx) => {
      if (highlight.startIndex > lastIndex) {
        parts.push(
          <span key={`text-${idx}`}>{verseText.substring(lastIndex, highlight.startIndex)}</span>
        );
      }
      
      parts.push(
        <mark
          key={`highlight-${idx}`}
          className={`${highlight.color} px-0.5 rounded`}
        >
          {highlight.text}
        </mark>
      );
      
      lastIndex = highlight.endIndex;
    });

    if (lastIndex < verseText.length) {
      parts.push(
        <span key="text-end">{verseText.substring(lastIndex)}</span>
      );
    }

    return <>{parts}</>;
  };

  const handleWordClick = (word: string) => {
    const analysis = lexiconData[word];
    if (analysis) {
      setSelectedWord(analysis);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Header */}
        <div className="px-10 py-6 border-b border-[var(--divider)]">
          <h1 className="text-2xl tracking-tight text-[var(--graphite)] mb-2">
            Biblical Study & Exegesis
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] small-caps tracking-wide">
            Original Languages, Translation & Commentary
          </p>
        </div>

        {/* Scripture Selector */}
        <div className="px-10 py-5 border-b border-[var(--divider)] bg-[var(--ivory)]/30">
          <div className="flex items-center gap-4">
            {/* Testament Selector */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setTestament('ot');
                  setSelectedBook('Genesis');
                  setSelectedChapter(1);
                  setSelectedVerse(null);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  testament === 'ot'
                    ? 'bg-[var(--muted-bronze)] text-white'
                    : 'bg-white text-[var(--foreground)] border border-[var(--divider)] hover:border-[var(--muted-bronze)]/30'
                }`}
              >
                Old Testament
              </button>
              <button
                onClick={() => {
                  setTestament('nt');
                  setSelectedBook('Romans');
                  setSelectedChapter(3);
                  setSelectedVerse(null);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  testament === 'nt'
                    ? 'bg-[var(--deep-navy)] text-white'
                    : 'bg-white text-[var(--foreground)] border border-[var(--divider)] hover:border-[var(--deep-navy)]/30'
                }`}
              >
                New Testament
              </button>
            </div>

            {/* Translation Selector */}
            <div className="flex items-center gap-2">
              {(['ACF', 'ARA'] as PortugueseTranslation[]).map((option) => (
                <button
                  key={option}
                  onClick={() => setTranslation(option)}
                  className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    translation === option
                      ? 'bg-[var(--deep-navy)] text-white'
                      : 'bg-white text-[var(--foreground)] border border-[var(--divider)] hover:border-[var(--deep-navy)]/30'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Book Selector */}
            <div className="relative flex-1">
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                className="appearance-none w-full px-4 py-2 pr-10 rounded-md border border-[var(--divider)] bg-white text-sm font-medium text-[var(--foreground)] cursor-pointer hover:border-[var(--deep-navy)]/30 transition-all"
              >
                {bibleBooks[testament].map((book) => (
                  <option key={book} value={book}>{book}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" strokeWidth={1.5} />
            </div>

            {/* Chapter Selector */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-[var(--muted-foreground)] small-caps">Chapter</label>
              <input
                type="number"
                min="1"
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(Number(e.target.value))}
                className="w-20 px-3 py-2 rounded-md border border-[var(--divider)] bg-white text-sm text-center"
              />
            </div>

            {/* Highlight Mode Toggle */}
            <button
              onClick={() => setIsHighlightMode(!isHighlightMode)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                isHighlightMode
                  ? 'bg-[var(--subtle-gold)]/20 text-[var(--deep-navy)] border-2 border-[var(--subtle-gold)]'
                  : 'bg-white text-[var(--foreground)] border-2 border-[var(--divider)] hover:border-[var(--subtle-gold)]/30'
              }`}
            >
              <Highlighter size={14} strokeWidth={1.5} />
              <span>{isHighlightMode ? 'Highlighting' : 'Highlight'}</span>
              {isHighlightMode && <Check size={14} strokeWidth={2} />}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-10 py-8 scrollbar-hide">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Two Column Layout - Portuguese | Original Text */}
            <div className="grid grid-cols-2 gap-8">
              {/* Left Column - Portuguese Translation */}
              <div className="space-y-4">
                <div className="sticky top-0 bg-white pb-3 border-b border-[var(--divider)] mb-4">
                  <h2 className="text-sm font-medium text-[var(--deep-navy)] small-caps tracking-[0.12em]">
                    Portuguese Translation ({translation})
                  </h2>
                </div>
                {currentChapter.verses.map((verse: any) => (
                  <div 
                    key={`pt-${verse.num}`}
                    className={`p-5 rounded-lg border transition-all ${
                      selectedVerse === verse.num
                        ? 'bg-[var(--subtle-gold)]/10 border-[var(--deep-navy)]/30 shadow-sm'
                        : 'bg-[var(--ivory)] border-[var(--divider)] hover:border-[var(--deep-navy)]/20'
                    }`}
                  >
                    <div className="flex gap-3">
                      <span className="text-sm font-medium text-[var(--deep-navy)] bg-white px-2.5 py-1 rounded border border-[var(--divider)] h-fit">
                        {verse.num}
                      </span>
                      <p 
                        className={`font-serif-reading text-[15px] leading-relaxed text-[var(--foreground)] flex-1 ${isHighlightMode ? 'select-text cursor-text' : ''}`}
                        onMouseUp={(e) => handleTextSelection(verse.num, e)}
                      >
                        {renderHighlightedText(verse)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column - Original Text (Greek/Hebrew) */}
              <div className="space-y-4">
                <div className="sticky top-0 bg-white pb-3 border-b border-[var(--divider)] mb-4">
                  <h2 className="text-sm font-medium text-[var(--deep-navy)] small-caps tracking-[0.12em]">
                    {isGreek ? 'Greek Text & Transliteration' : 'Hebrew Text & Transliteration'}
                  </h2>
                </div>
                {currentChapter.verses.map((verse: any) => (
                  <div 
                    key={`orig-${verse.num}`}
                    className={`p-5 rounded-lg border transition-all ${
                      selectedVerse === verse.num
                        ? 'bg-[var(--subtle-gold)]/10 border-[var(--deep-navy)]/30 shadow-sm'
                        : 'bg-white border-[var(--divider)] hover:border-[var(--deep-navy)]/20'
                    }`}
                  >
                    <div className="flex gap-3 mb-4">
                      <span className="text-sm font-medium text-[var(--deep-navy)] bg-[var(--ivory)] px-2.5 py-1 rounded border border-[var(--divider)] h-fit">
                        {verse.num}
                      </span>
                      <div className="flex-1">
                        {/* Original Language */}
                        <p className="font-serif-reading text-xl leading-loose text-[var(--foreground)] mb-3">
                          {verse.words.map((word: string, idx: number) => (
                            <span key={idx}>
                              <button
                                onClick={() => handleWordClick(word)}
                                className="hover:bg-[var(--subtle-gold)]/30 px-1 py-0.5 rounded transition-all cursor-pointer border-b-2 border-transparent hover:border-[var(--deep-navy)]/40"
                              >
                                {word}
                              </button>
                              {idx < verse.words.length - 1 && ' '}
                            </span>
                          ))}
                        </p>
                        
                        {/* Transliteration */}
                        <div className="pt-3 border-t border-[var(--divider)]">
                          <p className="font-serif-reading text-sm text-[var(--muted-foreground)] italic leading-relaxed">
                            {verse.transliteration}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Word Analysis Card (appears when word is selected) */}
            {selectedWord && (
              <div className="border border-[var(--deep-navy)]/30 rounded-lg bg-white shadow-lg">
                {/* Header */}
                <div className="px-8 py-5 border-b border-[var(--divider)] bg-[var(--light-gray)] flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-serif-reading text-[var(--deep-navy)] mb-1">
                      {selectedWord.word}
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)] italic">
                      {selectedWord.transliteration}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedWord(null)}
                    className="p-2 rounded-md hover:bg-white/50 transition-colors"
                  >
                    <X size={20} className="text-[var(--muted-foreground)]" strokeWidth={1.5} />
                  </button>
                </div>

                {/* Content Grid */}
                <div className="p-8 grid grid-cols-2 gap-6">
                  {/* Meaning */}
                  <div className="col-span-2">
                    <h4 className="text-[10px] small-caps tracking-[0.12em] text-[var(--muted-foreground)] mb-2">
                      Meaning
                    </h4>
                    <p className="text-sm text-[var(--foreground)] leading-relaxed">
                      {selectedWord.meaning}
                    </p>
                  </div>

                  {/* Semantic Field */}
                  <div>
                    <h4 className="text-[10px] small-caps tracking-[0.12em] text-[var(--muted-foreground)] mb-2">
                      Semantic Field
                    </h4>
                    <p className="text-sm text-[var(--foreground)] leading-relaxed">
                      {selectedWord.semanticField}
                    </p>
                  </div>

                  {/* Nominal Form */}
                  <div>
                    <h4 className="text-[10px] small-caps tracking-[0.12em] text-[var(--muted-foreground)] mb-2">
                      Morphology
                    </h4>
                    <p className="text-sm text-[var(--foreground)] leading-relaxed">
                      {selectedWord.nominalForm}
                    </p>
                  </div>

                  {/* Usage */}
                  <div className="col-span-2">
                    <h4 className="text-[10px] small-caps tracking-[0.12em] text-[var(--muted-foreground)] mb-2">
                      Usage Notes
                    </h4>
                    <p className="text-sm text-[var(--foreground)] leading-relaxed">
                      {selectedWord.usage}
                    </p>
                  </div>

                  {/* Etymology */}
                  <div className="col-span-2">
                    <h4 className="text-[10px] small-caps tracking-[0.12em] text-[var(--muted-foreground)] mb-2">
                      Etymology
                    </h4>
                    <p className="text-sm text-[var(--foreground)] leading-relaxed">
                      {selectedWord.etymology}
                    </p>
                  </div>

                  {/* Occurrences */}
                  <div className="col-span-2">
                    <h4 className="text-[10px] small-caps tracking-[0.12em] text-[var(--muted-foreground)] mb-3">
                      Key Occurrences ({selectedWord.occurrences.length} total)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedWord.occurrences.map((ref, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-md bg-[var(--light-gray)] text-xs text-[var(--foreground)] hover:bg-[var(--deep-navy)]/10 cursor-pointer transition-colors"
                        >
                          {ref}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Lexicon Reference */}
                  <div className="col-span-2 pt-4 border-t border-[var(--divider)]">
                    <h4 className="text-[10px] small-caps tracking-[0.12em] text-[var(--muted-foreground)] mb-2">
                      Lexicon References
                    </h4>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {selectedWord.lexiconRef}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Biblical Commentaries Section */}
            <div className="border border-[var(--divider)] rounded-lg bg-[var(--ivory)]/50 overflow-hidden">
              {/* Header */}
              <div className="px-8 py-5 border-b border-[var(--divider)] bg-white">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen size={18} className="text-[var(--deep-navy)]" strokeWidth={1.5} />
                  <h2 className="text-lg font-medium text-[var(--deep-navy)]">
                    Biblical Commentaries
                  </h2>
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Insights from scholars on {selectedBook} {selectedChapter}
                </p>
              </div>

              {/* Commentaries List */}
              <div className="p-6 space-y-4">
                {commentaries.length > 0 ? (
                  commentaries.map((commentary, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-lg bg-white border border-[var(--divider)] hover:border-[var(--deep-navy)]/20 hover:shadow-sm transition-all"
                    >
                      {/* Author and Work */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-md bg-[var(--light-gray)]">
                            <User size={16} className="text-[var(--deep-navy)]" strokeWidth={1.5} />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-[var(--deep-navy)]">
                              {commentary.author}
                            </h3>
                            <p className="text-xs text-[var(--muted-foreground)] italic mt-0.5">
                              {commentary.work}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--muted-bronze)]/10 text-[var(--muted-bronze)] font-medium">
                            {commentary.year}
                          </span>
                          <span className="text-[10px] text-[var(--muted-foreground)]">
                            {commentary.page}
                          </span>
                        </div>
                      </div>

                      {/* Excerpt */}
                      <div className="pl-11">
                        <p className="text-sm text-[var(--foreground)] leading-relaxed">
                          "{commentary.excerpt}"
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <BookOpen size={32} className="text-[var(--muted-foreground)] mx-auto mb-3" strokeWidth={1} />
                    <p className="text-sm text-[var(--muted-foreground)] mb-2">
                      No commentaries found for this chapter
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Upload biblical commentaries in Settings to see insights here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Highlight Color Menu */}
      {showHighlightMenu && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowHighlightMenu(false)}
          />
          <div
            className="fixed z-50 bg-white rounded-lg shadow-xl border border-[var(--divider)] p-2"
            style={{
              left: `${highlightMenuPosition.x}px`,
              top: `${highlightMenuPosition.y}px`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="flex gap-2 items-center">
              {highlightColors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => applyHighlight(color.value)}
                  className={`w-8 h-8 rounded ${color.value} border-2 ${color.border} hover:scale-110 transition-transform`}
                  title={color.name}
                />
              ))}
              <div className="w-px h-8 bg-[var(--divider)] mx-1" />
              <button
                onClick={() => {
                  if (selectedText.text && selectedText.verseNum) {
                    const verse = currentChapter.verses.find((v: any) => v.num === selectedText.verseNum);
                    if (verse) {
                      const verseText = verse.translations?.[translation] ?? verse.translation;
                      const startIndex = verseText.indexOf(selectedText.text);
                      if (startIndex !== -1) {
                        setHighlights(highlights.filter(h => 
                          !(h.verseNum === selectedText.verseNum && 
                            h.startIndex === startIndex && 
                            h.text === selectedText.text)
                        ));
                      }
                    }
                  }
                  setShowHighlightMenu(false);
                  window.getSelection()?.removeAllRanges();
                }}
                className="w-8 h-8 rounded bg-white border-2 border-red-400 hover:bg-red-50 hover:scale-110 transition-all flex items-center justify-center"
                title="Remove highlight"
              >
                <X size={16} className="text-red-600" strokeWidth={2} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Didaskalos Panel */}
      <DidaskaloPanel
        context={`Studying ${selectedBook} ${selectedChapter} — Examining original text with translation and commentary`}
        currentSource="biblical-study"
        suggestions={[
          'Compare with parallel passages',
          'Analyze the Greek/Hebrew terms',
          'Examine Old Testament references',
          'Study the rhetorical structure'
        ]}
      />
    </div>
  );
}
