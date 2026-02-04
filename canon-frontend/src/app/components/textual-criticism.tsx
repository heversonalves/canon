import { useState } from 'react';
import { DidaskaloPanel } from '@/app/components/didaskalos-panel';
import { ChevronDown, Highlighter, Check, X, AlertCircle, BookOpen, User, FileText, TrendingUp } from 'lucide-react';

interface Manuscript {
  id: string;
  name: string;
  abbreviation: string;
  date: string;
  tradition: string;
}

interface Verse {
  num: number;
  manuscripts: {
    [manuscriptId: string]: {
      text: string;
      transliteration: string;
      words: string[];
      transliteratedWords: string[];
    }
  }
}

interface WordCrossReference {
  word: string;
  transliteration: string;
  meaning: string;
  manuscripts: {
    [manuscriptId: string]: {
      present: boolean;
      variant?: string;
      variantTransliteration?: string;
      occurrences: number[];
      notes?: string;
    }
  }
}

interface Variant {
  type: 'orthographic' | 'morphological' | 'lexical' | 'structural';
  description: string;
  significance: string;
  alignment?: string;
}

interface ScholarlyInsight {
  author: string;
  work: string;
  year: string;
  excerpt: string;
  source: string;
  page?: string;
}

interface AnalyticalData {
  totalVariants: number;
  significantVariants: number;
  manuscriptAgreement: number;
  variantTypes: {
    orthographic: number;
    morphological: number;
    lexical: number;
    structural: number;
  }
}

const highlightColors = [
  { name: 'Yellow', value: 'bg-yellow-200/60', border: 'border-yellow-400' },
  { name: 'Green', value: 'bg-green-200/60', border: 'border-green-400' },
  { name: 'Blue', value: 'bg-blue-200/60', border: 'border-blue-400' },
  { name: 'Pink', value: 'bg-pink-200/60', border: 'border-pink-400' },
  { name: 'Purple', value: 'bg-purple-200/60', border: 'border-purple-400' },
];

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

const torahBooks = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'];

// NT Manuscripts
const ntManuscriptsList = [
  { id: 'na28', name: 'Nestle-Aland 28', abbreviation: 'NA28', date: '2012', tradition: 'Critical Text' },
  { id: 'p66', name: 'Papyrus 66', abbreviation: '𝔓⁶⁶', date: 'c. 200 CE', tradition: 'Alexandrian' },
  { id: 'p75', name: 'Papyrus 75', abbreviation: '𝔓⁷⁵', date: 'c. 175-225 CE', tradition: 'Alexandrian' },
  { id: 'sinaiticus', name: 'Codex Sinaiticus', abbreviation: 'א', date: 'c. 330-360 CE', tradition: 'Alexandrian' },
  { id: 'vaticanus', name: 'Codex Vaticanus', abbreviation: 'B', date: 'c. 300-325 CE', tradition: 'Alexandrian' },
  { id: 'alexandrinus', name: 'Codex Alexandrinus', abbreviation: 'A', date: 'c. 400-440 CE', tradition: 'Byzantine' }
];

// OT Manuscripts
const otManuscriptsList = [
  { id: 'leningrad', name: 'Codex Leningradensis', abbreviation: 'L', date: '1008 CE', tradition: 'Masoretic' },
  { id: 'aleppo', name: 'Codex Aleppo', abbreviation: 'A', date: 'c. 920 CE', tradition: 'Masoretic' },
  { id: '1qisaa', name: 'Great Isaiah Scroll', abbreviation: '1QIsaᵃ', date: 'c. 125 BCE', tradition: 'Pre-Masoretic (Qumran)' },
  { id: 'lxx', name: 'Septuagint', abbreviation: 'LXX', date: 'c. 2nd cent. BCE', tradition: 'Greek Translation' }
];

// Mock NT Chapter Data - John 1
const ntChapterData: { [key: string]: Verse[] } = {
  'John-1': [
    {
      num: 1,
      manuscripts: {
        na28: {
          text: 'Ἐν ἀρχῇ ἦν ὁ λόγος, καὶ ὁ λόγος ἦν πρὸς τὸν θεόν, καὶ θεὸς ἦν ὁ λόγος.',
          transliteration: 'En archē ēn ho logos, kai ho logos ēn pros ton theon, kai theos ēn ho logos.',
          words: ['Ἐν', 'ἀρχῇ', 'ἦν', 'ὁ', 'λόγος', 'καὶ', 'ὁ', 'λόγος', 'ἦν', 'πρὸς', 'τὸν', 'θεόν', 'καὶ', 'θεὸς', 'ἦν', 'ὁ', 'λόγος'],
          transliteratedWords: ['En', 'archē', 'ēn', 'ho', 'logos', 'kai', 'ho', 'logos', 'ēn', 'pros', 'ton', 'theon', 'kai', 'theos', 'ēn', 'ho', 'logos']
        },
        p66: {
          text: 'Ἐν ἀρχῇ ἦν ὁ λόγος, καὶ ὁ λόγος ἦν πρὸς τὸν θεόν, καὶ θεὸς ἦν ὁ λόγος.',
          transliteration: 'En archē ēn ho logos, kai ho logos ēn pros ton theon, kai theos ēn ho logos.',
          words: ['Ἐν', 'ἀρχῇ', 'ἦν', 'ὁ', 'λόγος', 'καὶ', 'ὁ', 'λόγος', 'ἦν', 'πρὸς', 'τὸν', 'θεόν', 'καὶ', 'θεὸς', 'ἦν', 'ὁ', 'λόγος'],
          transliteratedWords: ['En', 'archē', 'ēn', 'ho', 'logos', 'kai', 'ho', 'logos', 'ēn', 'pros', 'ton', 'theon', 'kai', 'theos', 'ēn', 'ho', 'logos']
        },
        sinaiticus: {
          text: 'Ἐν ἀρχῇ ἦν ὁ λόγος, καὶ ὁ λόγος ἦν πρὸς τὸν θεόν, καὶ θεὸς ἦν ὁ λόγος.',
          transliteration: 'En archē ēn ho logos, kai ho logos ēn pros ton theon, kai theos ēn ho logos.',
          words: ['Ἐν', 'ἀρχῇ', 'ἦν', 'ὁ', 'λόγος', 'καὶ', 'ὁ', 'λόγος', 'ἦν', 'πρὸς', 'τὸν', 'θεόν', 'καὶ', 'θεὸς', 'ἦν', 'ὁ', 'λόγος'],
          transliteratedWords: ['En', 'archē', 'ēn', 'ho', 'logos', 'kai', 'ho', 'logos', 'ēn', 'pros', 'ton', 'theon', 'kai', 'theos', 'ēn', 'ho', 'logos']
        },
        vaticanus: {
          text: 'Ἐν ἀρχῇ ἦν ὁ λόγος, καὶ ὁ λόγος ἦν πρὸς τὸν θεόν, καὶ θεὸς ἦν ὁ λόγος.',
          transliteration: 'En archē ēn ho logos, kai ho logos ēn pros ton theon, kai theos ēn ho logos.',
          words: ['Ἐν', 'ἀρχῇ', 'ἦν', 'ὁ', 'λόγος', 'καὶ', 'ὁ', 'λόγος', 'ἦν', 'πρὸς', 'τὸν', 'θεόν', 'καὶ', 'θεὸς', 'ἦν', 'ὁ', 'λόγος'],
          transliteratedWords: ['En', 'archē', 'ēn', 'ho', 'logos', 'kai', 'ho', 'logos', 'ēn', 'pros', 'ton', 'theon', 'kai', 'theos', 'ēn', 'ho', 'logos']
        }
      }
    },
    {
      num: 18,
      manuscripts: {
        na28: {
          text: 'θεὸν οὐδεὶς ἑώρακεν πώποτε· μονογενὴς θεὸς ὁ ὢν εἰς τὸν κόλπον τοῦ πατρὸς ἐκεῖνος ἐξηγήσατο.',
          transliteration: 'theon oudeis heōraken pōpote; monogenēs theos ho ōn eis ton kolpon tou patros ekeinos exēgēsato.',
          words: ['θεὸν', 'οὐδεὶς', 'ἑώρακεν', 'πώποτε', 'μονογενὴς', 'θεὸς', 'ὁ', 'ὢν', 'εἰς', 'τὸν', 'κόλπον', 'τοῦ', 'πατρὸς', 'ἐκεῖνος', 'ἐξηγήσατο'],
          transliteratedWords: ['theon', 'oudeis', 'heōraken', 'pōpote', 'monogenēs', 'theos', 'ho', 'ōn', 'eis', 'ton', 'kolpon', 'tou', 'patros', 'ekeinos', 'exēgēsato']
        },
        p66: {
          text: 'θεὸν οὐδεὶς ἑώρακεν πώποτε· μονογενὴς θεὸς ὁ ὢν εἰς τὸν κόλπον τοῦ πατρὸς ἐκεῖνος ἐξηγήσατο.',
          transliteration: 'theon oudeis heōraken pōpote; monogenēs theos ho ōn eis ton kolpon tou patros ekeinos exēgēsato.',
          words: ['θεὸν', 'οὐδεὶς', 'ἑώρακεν', 'πώποτε', 'μονογενὴς', 'θεὸς', 'ὁ', 'ὢν', 'εἰς', 'τὸν', 'κόλπον', 'τοῦ', 'πατρὸς', 'ἐκεῖνος', 'ἐξηγήσατο'],
          transliteratedWords: ['theon', 'oudeis', 'heōraken', 'pōpote', 'monogenēs', 'theos', 'ho', 'ōn', 'eis', 'ton', 'kolpon', 'tou', 'patros', 'ekeinos', 'exēgēsato']
        },
        sinaiticus: {
          text: 'θεὸν οὐδεὶς ἑώρακεν πώποτε· μονογενὴς θεὸς ὁ ὢν εἰς τὸν κόλπον τοῦ πατρὸς ἐκεῖνος ἐξηγήσατο.',
          transliteration: 'theon oudeis heōraken pōpote; monogenēs theos ho ōn eis ton kolpon tou patros ekeinos exēgēsato.',
          words: ['θεὸν', 'οὐδεὶς', 'ἑώρακεν', 'πώποτε', 'μονογενὴς', 'θεὸς', 'ὁ', 'ὢν', 'εἰς', 'τὸν', 'κόλπον', 'τοῦ', 'πατρὸς', 'ἐκεῖνος', 'ἐξηγήσατο'],
          transliteratedWords: ['theon', 'oudeis', 'heōraken', 'pōpote', 'monogenēs', 'theos', 'ho', 'ōn', 'eis', 'ton', 'kolpon', 'tou', 'patros', 'ekeinos', 'exēgēsato']
        },
        vaticanus: {
          text: 'θεὸν οὐδεὶς ἑώρακεν πώποτε· μονογενὴς θεὸς ὁ ὢν εἰς τὸν κόλπον τοῦ πατρὸς ἐκεῖνος ἐξηγήσατο.',
          transliteration: 'theon oudeis heōraken pōpote; monogenēs theos ho ōn eis ton kolpon tou patros ekeinos exēgēsato.',
          words: ['θεὸν', 'οὐδεὶς', 'ἑώρακεν', 'πώποτε', 'μονογενὴς', 'θεὸς', 'ὁ', 'ὢν', 'εἰς', 'τὸν', 'κόλπον', 'τοῦ', 'πατρὸς', 'ἐκεῖνος', 'ἐξηγήσατο'],
          transliteratedWords: ['theon', 'oudeis', 'heōraken', 'pōpote', 'monogenēs', 'theos', 'ho', 'ōn', 'eis', 'ton', 'kolpon', 'tou', 'patros', 'ekeinos', 'exēgēsato']
        },
        alexandrinus: {
          text: 'θεὸν οὐδεὶς ἑώρακεν πώποτε· μονογενὴς υἱὸς ὁ ὢν εἰς τὸν κόλπον τοῦ πατρὸς ἐκεῖνος ἐξηγήσατο.',
          transliteration: 'theon oudeis heōraken pōpote; monogenēs huios ho ōn eis ton kolpon tou patros ekeinos exēgēsato.',
          words: ['θεὸν', 'οὐδεὶς', 'ἑώρακεν', 'πώποτε', 'μονογενὴς', 'υἱὸς', 'ὁ', 'ὢν', 'εἰς', 'τὸν', 'κόλπον', 'τοῦ', 'πατρὸς', 'ἐκεῖνος', 'ἐξηγήσατο'],
          transliteratedWords: ['theon', 'oudeis', 'heōraken', 'pōpote', 'monogenēs', 'huios', 'ho', 'ōn', 'eis', 'ton', 'kolpon', 'tou', 'patros', 'ekeinos', 'exēgēsato']
        }
      }
    }
  ]
};

// OT Chapter Data - Isaiah 53
const otChapterData: { [key: string]: Verse[] } = {
  'Isaiah-53': [
    {
      num: 5,
      manuscripts: {
        leningrad: {
          text: 'וְהוּא מְחֹלָל מִפְּשָׁעֵנוּ מְדֻכָּא מֵעֲוֺנֹתֵינוּ מוּסַר שְׁלוֹמֵנוּ עָלָיו וּבַחֲבֻרָתוֹ נִרְפָּא־לָנוּ',
          transliteration: 'wəhûʾ məḥōlāl mippəšāʿēnû məḏukkāʾ mēʿăwōnōṯênû mûsar šəlômēnû ʿālāyw ûḇaḥăḇurāṯô nirpāʾ-lānû',
          words: ['וְהוּא', 'מְחֹלָל', 'מִפְּשָׁעֵנוּ', 'מְדֻכָּא', 'מֵעֲוֺנֹתֵינוּ', 'מוּסַר', 'שְׁלוֹמֵנוּ', 'עָלָיו', 'וּבַחֲבֻרָתוֹ', 'נִרְפָּא־לָנוּ'],
          transliteratedWords: ['wəhûʾ', 'məḥōlāl', 'mippəšāʿēnû', 'məḏukkāʾ', 'mēʿăwōnōṯênû', 'mûsar', 'šəlômēnû', 'ʿālāyw', 'ûḇaḥăḇurāṯô', 'nirpāʾ-lānû']
        },
        aleppo: {
          text: 'וְהוּא מְחֹלָל מִפְּשָׁעֵנוּ מְדֻכָּא מֵעֲוֺנֹתֵינוּ מוּסַר שְׁלוֹמֵנוּ עָלָיו וּבַחֲבֻרָתוֹ נִרְפָּא־לָנוּ',
          transliteration: 'wəhûʾ məḥōlāl mippəšāʿēnû məḏukkāʾ mēʿăwōnōṯênû mûsar šəlômēnû ʿālāyw ûḇaḥăḇurāṯô nirpāʾ-lānû',
          words: ['וְהוּא', 'מְחֹלָל', 'מִפְּשָׁעֵנוּ', 'מְדֻכָּא', 'מֵעֲוֺנֹתֵינוּ', 'מוּסַר', 'שְׁלוֹמֵנוּ', 'עָלָיו', 'וּבַחֲבֻרָתוֹ', 'נִרְפָּא־לָנוּ'],
          transliteratedWords: ['wəhûʾ', 'məḥōlāl', 'mippəšāʿēnû', 'məḏukkāʾ', 'mēʿăwōnōṯênû', 'mûsar', 'šəlômēnû', 'ʿālāyw', 'ûḇaḥăḇurāṯô', 'nirpāʾ-lānû']
        },
        '1qisaa': {
          text: 'והוא מחולל מפשענו מדוכא מעונתינו מוסר שלומנו עליו ובחברתו נרפא לנו',
          transliteration: 'wəhûʾ məḥôlāl mippəšāʿēnû məḏôkkāʾ mēʿăwōnōṯênû mûsar šəlômēnû ʿālāyw ûḇaḥăḇurāṯô nirpāʾ lānû',
          words: ['והוא', 'מחולל', 'מפשענו', 'מדוכא', 'מעונתינו', 'מוסר', 'שלומנו', 'עליו', 'ובחברתו', 'נרפא', 'לנו'],
          transliteratedWords: ['wəhûʾ', 'məḥôlāl', 'mippəšāʿēnû', 'məḏôkkāʾ', 'mēʿăwōnōṯênû', 'mûsar', 'šəlômēnû', 'ʿālāyw', 'ûḇaḥăḇurāṯô', 'nirpāʾ', 'lānû']
        },
        lxx: {
          text: 'αὐτὸς δὲ ἐτραυματίσθη διὰ τὰς ἁμαρτίας ἡμῶν καὶ μεμαλάκισται διὰ τὰς ἀνομίας ἡμῶν· παιδεία εἰρήνης ἡμῶν ἐπ᾽ αὐτόν, τῷ μώλωπι αὐτοῦ ἡμεῖς ἰάθημεν.',
          transliteration: 'autos de etraumatisthē dia tas hamartias hēmōn kai memamalakistai dia tas anomias hēmōn; paideia eirēnēs hēmōn ep\' auton, tō mōlōpi autou hēmeis iathēmen.',
          words: ['αὐτὸ��', 'δὲ', 'ἐτραυματίσθη', 'διὰ', 'τὰς', 'ἁμαρτίας', 'ἡμῶν', 'καὶ', 'μεμαλάκισται', 'διὰ', 'τὰς', 'ἀνομίας', 'ἡμῶν', 'παιδεία', 'εἰρήνης', 'ἡμῶν', 'ἐπ᾽', 'αὐτόν', 'τῷ', 'μώλωπι', 'αὐτοῦ', 'ἡμεῖς', 'ἰάθημεν'],
          transliteratedWords: ['autos', 'de', 'etraumatisthē', 'dia', 'tas', 'hamartias', 'hēmōn', 'kai', 'memamalakistai', 'dia', 'tas', 'anomias', 'hēmōn', 'paideia', 'eirēnēs', 'hēmōn', 'ep\'', 'auton', 'tō', 'mōlōpi', 'autou', 'hēmeis', 'iathēmen']
        }
      }
    }
  ]
};

// Word cross-reference data
const wordCrossReferences: { [key: string]: WordCrossReference } = {
  'θεὸς': {
    word: 'θεὸς',
    transliteration: 'theos',
    meaning: 'God, deity',
    manuscripts: {
      na28: { present: true, occurrences: [1, 18] },
      p66: { present: true, occurrences: [1, 18] },
      p75: { present: true, occurrences: [1, 18] },
      sinaiticus: { present: true, occurrences: [1, 18] },
      vaticanus: { present: true, occurrences: [1, 18] },
      alexandrinus: { 
        present: true, 
        variant: 'υἱὸς',
        variantTransliteration: 'huios',
        occurrences: [1, 18],
        notes: 'In v. 18, reads υἱὸς (son) instead of θεὸς (God)' 
      }
    }
  },
  'λόγος': {
    word: 'λόγος',
    transliteration: 'logos',
    meaning: 'Word, message, reason',
    manuscripts: {
      na28: { present: true, occurrences: [1, 14] },
      p66: { present: true, occurrences: [1, 14] },
      p75: { present: true, occurrences: [1, 14] },
      sinaiticus: { present: true, occurrences: [1, 14] },
      vaticanus: { present: true, occurrences: [1, 14] },
      alexandrinus: { present: true, occurrences: [1, 14] }
    }
  },
  'מְחֹלָל': {
    word: 'מְחֹלָל',
    transliteration: 'məḥōlāl',
    meaning: 'Pierced, wounded, defiled',
    manuscripts: {
      leningrad: { present: true, occurrences: [5] },
      aleppo: { present: true, occurrences: [5] },
      '1qisaa': { 
        present: true, 
        variant: 'מחולל',
        variantTransliteration: 'məḥôlāl',
        occurrences: [5],
        notes: 'Plene spelling (fuller orthography)' 
      },
      lxx: { 
        present: true, 
        variant: 'ἐτραυματίσθη',
        variantTransliteration: 'etraumatisthē',
        occurrences: [5],
        notes: 'Greek translation: "was wounded"' 
      }
    }
  }
};

// Scholarly insights
const scholarlyInsights: { [key: string]: ScholarlyInsight[] } = {
  'John-1': [
    {
      author: 'Bruce M. Metzger',
      work: 'A Textual Commentary on the Greek New Testament',
      year: '1994',
      excerpt: 'The reading μονογενὴς θεὸς in John 1:18 is strongly supported by the earliest and best witnesses (𝔓⁶⁶, 𝔓⁷⁵, א, B). The variant υἱὸς appears in later Byzantine manuscripts and likely represents a theological smoothing of the more difficult original reading.',
      source: 'United Bible Societies',
      page: 'p. 169-170'
    },
    {
      author: 'Daniel B. Wallace',
      work: 'Greek Grammar Beyond the Basics',
      year: '1996',
      excerpt: 'The external evidence overwhelmingly favors θεὸς as the original reading. This is a clear example of lectio difficilior (the more difficult reading) being preferred, as scribes would more likely change "God" to "Son" than vice versa.',
      source: 'Zondervan Academic',
      page: 'p. 269'
    }
  ],
  'Isaiah-53': [
    {
      author: 'Emanuel Tov',
      work: 'Textual Criticism of the Hebrew Bible',
      year: '2012',
      excerpt: 'The Great Isaiah Scroll (1QIsaᵃ) demonstrates remarkable fidelity to the later Masoretic tradition, with differences being primarily orthographic rather than substantive. This confirms the careful transmission of the Hebrew text over centuries.',
      source: 'Fortress Press',
      page: 'p. 112-115'
    },
    {
      author: 'Peter Gentry & Stephen Wellum',
      work: 'Kingdom through Covenant',
      year: '2018',
      excerpt: 'Isaiah 53:5 shows minimal variation across all textual witnesses. The Qumran manuscripts use fuller spelling (matres lectionis), but the consonantal text remains essentially identical to the MT, demonstrating textual stability.',
      source: 'Crossway',
      page: 'p. 456'
    }
  ]
};

// Analytical data
const analyticalData: { [key: string]: AnalyticalData } = {
  'John-1': {
    totalVariants: 8,
    significantVariants: 1,
    manuscriptAgreement: 87.5,
    variantTypes: {
      orthographic: 3,
      morphological: 2,
      lexical: 1,
      structural: 2
    }
  },
  'Isaiah-53': {
    totalVariants: 12,
    significantVariants: 0,
    manuscriptAgreement: 95.2,
    variantTypes: {
      orthographic: 9,
      morphological: 2,
      lexical: 0,
      structural: 1
    }
  }
};

export function TextualCriticism() {
  const [testament, setTestament] = useState<'ot' | 'nt'>('nt');
  const [selectedBook, setSelectedBook] = useState<string>('John');
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [activeManuscripts, setActiveManuscripts] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<WordCrossReference | null>(null);
  const [highlightDifferences, setHighlightDifferences] = useState(false);
  const [activePanelTab, setActivePanelTab] = useState<'analytics' | 'insights' | 'articles'>('analytics');
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);

  const chapterKey = `${selectedBook}-${selectedChapter}`;
  const isOT = testament === 'ot';
  const manuscriptsList = isOT ? otManuscriptsList : ntManuscriptsList;
  const chapterData = isOT ? (otChapterData[chapterKey] || otChapterData['Isaiah-53']) : (ntChapterData[chapterKey] || ntChapterData['John-1']);
  const insights = scholarlyInsights[chapterKey] || [];
  const analytics = analyticalData[chapterKey] || analyticalData['John-1'];

  const toggleManuscript = (id: string) => {
    if (activeManuscripts.includes(id)) {
      setActiveManuscripts(activeManuscripts.filter(m => m !== id));
    } else {
      setActiveManuscripts([...activeManuscripts, id]);
    }
  };

  const handleWordClick = (word: string) => {
    const crossRef = wordCrossReferences[word];
    if (crossRef) {
      setSelectedWord(crossRef);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Header */}
        <div className="px-10 py-6 border-b border-[var(--divider)]">
          <h1 className="text-2xl tracking-tight text-[var(--graphite)] mb-2">
            Textual Criticism — {isOT ? 'Old Testament' : 'New Testament'}
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] small-caps tracking-wide">
            {isOT ? 'Comparative Hebrew Textual Analysis' : 'Comparative Greek Textual Analysis'}
          </p>
        </div>

        {/* Passage Selector */}
        <div className="px-10 py-5 border-b border-[var(--divider)] bg-[var(--ivory)]/30">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setTestament('ot');
                  setSelectedBook('Isaiah');
                  setSelectedChapter(53);
                  setActiveManuscripts([]);
                  setSelectedWord(null);
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
                  setSelectedBook('John');
                  setSelectedChapter(1);
                  setActiveManuscripts([]);
                  setSelectedWord(null);
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
          </div>
        </div>

        {/* Manuscript Selector Bar */}
        <div className="px-10 py-4 border-b border-[var(--divider)] bg-[var(--light-gray)]/30">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs small-caps tracking-[0.12em] text-[var(--muted-foreground)] mr-2">
              Select Witnesses:
            </span>
            {manuscriptsList.map((manuscript) => (
              <button
                key={manuscript.id}
                onClick={() => toggleManuscript(manuscript.id)}
                className={`px-3 py-2 rounded-md text-xs transition-all ${
                  activeManuscripts.includes(manuscript.id)
                    ? 'bg-[var(--deep-navy)] text-white border border-[var(--deep-navy)]'
                    : 'bg-white text-[var(--foreground)] border border-[var(--divider)] hover:border-[var(--deep-navy)]/30'
                }`}
              >
                <div className="font-medium">{manuscript.abbreviation}</div>
                <div className="text-[9px] opacity-70">{manuscript.date}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Text Comparison Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="px-10 py-8">
            {activeManuscripts.length > 0 ? (
              <div className="space-y-12">
                {/* Chapter verses */}
                {chapterData.map((verse) => (
                  <div key={verse.num} className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-sm font-medium text-[var(--deep-navy)] bg-[var(--ivory)] px-3 py-1.5 rounded-md border border-[var(--divider)]">
                        Verse {verse.num}
                      </span>
                      <div className="flex-1 h-px bg-[var(--divider)]" />
                    </div>

                    <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(activeManuscripts.length, 3)}, 1fr)` }}>
                      {activeManuscripts.map((msId) => {
                        const manuscript = manuscriptsList.find(m => m.id === msId);
                        const verseData = verse.manuscripts[msId];
                        if (!manuscript || !verseData) return null;

                        const isRTL = isOT && msId !== 'lxx';

                        return (
                          <div key={msId} className="border border-[var(--divider)] rounded-lg bg-[var(--ivory)]/30 overflow-hidden">
                            <div className="px-5 py-3 bg-white border-b border-[var(--divider)]">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-[var(--deep-navy)]">
                                  {manuscript.abbreviation}
                                </h4>
                                <span className="text-[9px] px-2 py-0.5 rounded bg-[var(--muted-bronze)]/10 text-[var(--muted-bronze)] font-medium">
                                  {manuscript.tradition}
                                </span>
                              </div>
                            </div>

                            <div className="p-5 space-y-4">
                              {/* Original text */}
                              <div className={isRTL ? 'text-right' : ''} style={isRTL ? { direction: 'rtl' } : {}}>
                                <p className="font-serif-reading text-lg leading-loose text-[var(--foreground)]">
                                  {verseData.words.map((word, idx) => (
                                    <span key={idx}>
                                      <button
                                        onClick={() => handleWordClick(word)}
                                        className="hover:bg-[var(--subtle-gold)]/30 px-1 py-0.5 rounded transition-all cursor-pointer border-b-2 border-transparent hover:border-[var(--deep-navy)]/40"
                                      >
                                        {word}
                                      </button>
                                      {idx < verseData.words.length - 1 && ' '}
                                    </span>
                                  ))}
                                </p>
                              </div>

                              {/* Transliteration */}
                              <div className="pt-4 border-t border-[var(--divider)]">
                                <p className="text-[10px] small-caps tracking-[0.12em] text-[var(--muted-foreground)] mb-2">
                                  Transliteration
                                </p>
                                <p className="font-serif-reading text-sm text-[var(--muted-foreground)] italic leading-relaxed">
                                  {verseData.transliteration}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Scholarly Insights & Analytics Section */}
                <div className="mt-12 space-y-6">
                  {/* Analytics Overview */}
                  <div className="border border-[var(--divider)] rounded-lg bg-[var(--light-gray)]/30 overflow-hidden">
                    <div className="px-8 py-5 bg-white border-b border-[var(--divider)]">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={18} className="text-[var(--deep-navy)]" strokeWidth={1.5} />
                        <h2 className="text-lg font-medium text-[var(--deep-navy)]">
                          Analytical Data
                        </h2>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">
                        Statistical overview of {selectedBook} {selectedChapter}
                      </p>
                    </div>

                    <div className="p-8">
                      <div className="grid grid-cols-4 gap-6">
                        <div className="p-4 rounded-lg bg-white border border-[var(--divider)]">
                          <p className="text-xs small-caps tracking-[0.12em] text-[var(--muted-foreground)] mb-2">
                            Total Variants
                          </p>
                          <p className="text-3xl font-medium text-[var(--deep-navy)]">
                            {analytics.totalVariants}
                          </p>
                        </div>

                        <div className="p-4 rounded-lg bg-white border border-[var(--divider)]">
                          <p className="text-xs small-caps tracking-[0.12em] text-[var(--muted-foreground)] mb-2">
                            Significant Variants
                          </p>
                          <p className="text-3xl font-medium text-[var(--deep-navy)]">
                            {analytics.significantVariants}
                          </p>
                        </div>

                        <div className="p-4 rounded-lg bg-white border border-[var(--divider)]">
                          <p className="text-xs small-caps tracking-[0.12em] text-[var(--muted-foreground)] mb-2">
                            Agreement Rate
                          </p>
                          <p className="text-3xl font-medium text-[var(--deep-navy)]">
                            {analytics.manuscriptAgreement}%
                          </p>
                        </div>

                        <div className="p-4 rounded-lg bg-white border border-[var(--divider)]">
                          <p className="text-xs small-caps tracking-[0.12em] text-[var(--muted-foreground)] mb-2">
                            Variant Types
                          </p>
                          <div className="space-y-1 mt-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-[var(--muted-foreground)]">Orthographic</span>
                              <span className="font-medium text-[var(--foreground)]">{analytics.variantTypes.orthographic}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-[var(--muted-foreground)]">Morphological</span>
                              <span className="font-medium text-[var(--foreground)]">{analytics.variantTypes.morphological}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-[var(--muted-foreground)]">Lexical</span>
                              <span className="font-medium text-[var(--foreground)]">{analytics.variantTypes.lexical}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scholarly Insights */}
                  <div className="border border-[var(--divider)] rounded-lg bg-[var(--ivory)]/50 overflow-hidden">
                    <div className="px-8 py-5 bg-white border-b border-[var(--divider)]">
                      <div className="flex items-center gap-2">
                        <BookOpen size={18} className="text-[var(--deep-navy)]" strokeWidth={1.5} />
                        <h2 className="text-lg font-medium text-[var(--deep-navy)]">
                          Scholarly Insights & Articles
                        </h2>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">
                        Academic perspectives on textual variants and transmission
                      </p>
                    </div>

                    <div className="p-6 space-y-4">
                      {insights.map((insight, idx) => (
                        <div
                          key={idx}
                          className="p-5 rounded-lg bg-white border border-[var(--divider)] hover:border-[var(--deep-navy)]/20 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-md bg-[var(--light-gray)]">
                                <User size={16} className="text-[var(--deep-navy)]" strokeWidth={1.5} />
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-[var(--deep-navy)]">
                                  {insight.author}
                                </h3>
                                <p className="text-xs text-[var(--muted-foreground)] italic mt-0.5">
                                  {insight.work}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--muted-bronze)]/10 text-[var(--muted-bronze)] font-medium">
                                {insight.year}
                              </span>
                              {insight.page && (
                                <span className="text-[10px] text-[var(--muted-foreground)]">
                                  {insight.page}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="pl-11">
                            <p className="text-sm text-[var(--foreground)] leading-relaxed mb-3">
                              "{insight.excerpt}"
                            </p>
                            <div className="flex items-center gap-2 pt-3 border-t border-[var(--divider)]">
                              <FileText size={12} className="text-[var(--muted-foreground)]" strokeWidth={1.5} />
                              <span className="text-xs text-[var(--muted-foreground)]">
                                Source: {insight.source}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {insights.length === 0 && (
                        <div className="p-8 text-center">
                          <BookOpen size={32} className="text-[var(--muted-foreground)] mx-auto mb-3" strokeWidth={1} />
                          <p className="text-sm text-[var(--muted-foreground)] mb-2">
                            No scholarly insights available for this chapter
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Configure sources in Settings to load academic articles and PDF materials
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--light-gray)] flex items-center justify-center mb-4">
                  <AlertCircle size={28} className="text-[var(--muted-foreground)]" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-medium text-[var(--foreground)] mb-2">
                  No Witnesses Selected
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] max-w-md">
                  Select manuscript witnesses from the bar above to begin textual comparison
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Word Cross-Reference Panel */}
      <div className="w-96 border-l border-[var(--divider)] bg-[var(--light-gray)]/20 flex flex-col overflow-hidden">
        <div className="px-6 py-5 border-b border-[var(--divider)] bg-white">
          <h2 className="text-base font-medium text-[var(--deep-navy)] mb-1">
            Word Analysis
          </h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            Manuscript cross-reference
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
          {selectedWord ? (
            <div className="space-y-6">
              {/* Word Header */}
              <div className="p-5 rounded-lg bg-white border border-[var(--divider)]">
                <h3 className="text-2xl font-serif-reading text-[var(--deep-navy)] mb-2">
                  {selectedWord.word}
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] italic mb-3">
                  {selectedWord.transliteration}
                </p>
                <p className="text-sm text-[var(--foreground)] leading-relaxed">
                  {selectedWord.meaning}
                </p>
              </div>

              {/* Manuscript Occurrences */}
              <div>
                <h4 className="text-xs small-caps tracking-[0.12em] text-[var(--muted-foreground)] mb-3">
                  Manuscript Cross-Reference
                </h4>
                <div className="space-y-3">
                  {Object.entries(selectedWord.manuscripts).map(([msId, data]) => {
                    const manuscript = [...ntManuscriptsList, ...otManuscriptsList].find(m => m.id === msId);
                    if (!manuscript) return null;

                    return (
                      <div key={msId} className="p-4 rounded-lg bg-white border border-[var(--divider)]">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h5 className="text-sm font-medium text-[var(--deep-navy)]">
                              {manuscript.abbreviation}
                            </h5>
                            <p className="text-xs text-[var(--muted-foreground)]">
                              {manuscript.name}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            data.present 
                              ? 'bg-green-50 text-green-700 border border-green-200' 
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {data.present ? 'Present' : 'Absent'}
                          </span>
                        </div>

                        {data.variant && (
                          <div className="mt-3 pt-3 border-t border-[var(--divider)]">
                            <p className="text-xs text-[var(--muted-foreground)] mb-1">
                              Variant Reading:
                            </p>
                            <p className="text-sm font-serif-reading text-[var(--deep-navy)] mb-1">
                              {data.variant}
                            </p>
                            <p className="text-xs text-[var(--muted-foreground)] italic">
                              {data.variantTransliteration}
                            </p>
                          </div>
                        )}

                        {data.occurrences && data.occurrences.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-[var(--divider)]">
                            <p className="text-xs text-[var(--muted-foreground)] mb-2">
                              Occurs in verses:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {data.occurrences.map((v, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 rounded bg-[var(--light-gray)] text-xs text-[var(--foreground)]"
                                >
                                  v. {v}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {data.notes && (
                          <div className="mt-3 pt-3 border-t border-[var(--divider)]">
                            <div className="flex items-start gap-2">
                              <AlertCircle size={12} className="text-[var(--muted-bronze)] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                                {data.notes}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-12 h-12 rounded-full bg-[var(--light-gray)] flex items-center justify-center mb-3">
                <AlertCircle size={20} className="text-[var(--muted-foreground)]" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-medium text-[var(--foreground)] mb-2">
                No Word Selected
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Click on any word in the text to see its cross-reference across manuscripts
              </p>
            </div>
          )}
        </div>

        {/* Tools */}
        <div className="px-6 py-4 border-t border-[var(--divider)] bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--foreground)]">Highlight Differences</span>
            <button
              onClick={() => setHighlightDifferences(!highlightDifferences)}
              className={`w-11 h-6 rounded-full transition-all ${
                highlightDifferences ? 'bg-[var(--deep-navy)]' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                highlightDifferences ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Didaskalos Panel */}
      <DidaskaloPanel
        context={`Analyzing textual witnesses for ${selectedBook} ${selectedChapter}`}
        currentSource="textual-criticism"
        suggestions={[
          'Compare manuscript traditions',
          'Examine variant readings',
          'Study transmission history',
          'Review scholarly consensus'
        ]}
      />
    </div>
  );
}