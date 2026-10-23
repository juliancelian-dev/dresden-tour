// Game content. Every fact needs two matching sources, listed in fakten.md.
// Teaser facts (Striezelmarkt 1434, Pfunds, Blaues Wunder, UNESCO, Yenidze,
// Kunsthofpassage, Dampfer, Landskron) are burned and must not show up here.

export type TaskBase = {
  id: string
  title: string
  prompt: string
  /** Shown after the reveal */
  explain: string
  /** Bought with coins before answering */
  hint?: string
}

/** Closest guess wins. */
export type EstimateTask = TaskBase & { type: 'estimate'; answer: number; unit?: string }
/** Guess first, then the group counts on site and enters the real number. */
export type CountTask = TaskBase & { type: 'count'; unit?: string }
export type QuizTask = TaskBase & { type: 'quiz'; options: string[]; correct: number }
/** One person enters who found it first (group confirms out loud). */
export type FirstTask = TaskBase & { type: 'first' }
/** A passer-by picks the winner, one person enters the verdict. */
export type PassantTask = TaskBase & { type: 'passant' }
/** Everyone votes for someone else. */
export type VoteTask = TaskBase & { type: 'vote' }

export type Task = EstimateTask | CountTask | QuizTask | FirstTask | PassantTask | VoteTask

export type Station = {
  id: string
  name: string
  place: string
  lat: number
  lng: number
  /** August pose shown in the niche */
  pose: 'august' | 'august-zeigt' | 'august-denkt' | 'august-jubel' | 'august-traurig'
  intro: string
  facts: string[]
  tasks: [Task, Task]
  /** Replaces a task when all four vote to skip it */
  alt: Task
  /** Only the players tied for last answer this */
  tiebreak: EstimateTask
}

export const START = { name: 'Jugendherberge', lat: 51.048867, lng: 13.724741 }
export const FINISH = {
  watzke: { name: 'Watzke am Goldenen Reiter', lat: 51.058588, lng: 13.741204 },
  rooster: { name: 'Red Rooster', lat: 51.059484, lng: 13.740943 },
}

export const STATIONS: Station[] = [
  {
    id: 'zwinger',
    name: 'Zwinger',
    place: 'Kronentor, Ostra-Allee',
    lat: 51.052697,
    lng: 13.733004,
    pose: 'august-zeigt',
    intro: 'Mein Partyhof. Hier wurde gefeiert, als gäbe es kein Morgen. Für die Bauern gab es auch keins.',
    facts: [
      'Der Name kommt aus dem Mittelalter. Zwinger hieß der Streifen zwischen äußerer und innerer Festungsmauer. Verteidigt wurde hier trotzdem nie etwas.',
      'Die Figuren am Nymphenbad stammen vom Bildhauer Balthasar Permoser. Der Brunnen gilt als einer der schönsten Barockbrunnen Deutschlands.',
    ],
    tasks: [
      {
        id: 'z1',
        type: 'quiz',
        title: 'Wessen Krone?',
        prompt: 'Oben auf dem Kronentor tragen vier Adler eine Krone. Welche?',
        options: ['Die polnische Königskrone', 'Die sächsische Kurfürstenkrone', 'Die Krone des Heiligen Römischen Reiches', 'Die österreichische Kaiserkrone'],
        correct: 0,
        hint: 'August war nicht nur Kurfürst von Sachsen. Er hatte noch einen zweiten Job im Osten.',
        explain: 'Die polnische Königskrone. Ein Gruß an Augusts zweiten Job als König von Polen.',
      },
      {
        id: 'z2',
        type: 'passant',
        title: 'Steinerne Schwerarbeiter',
        prompt:
          'Am Wallpavillon schuften steinerne Kerle und tragen das Gebäude auf den Schultern. Stellt einen davon nach. Fragt einen Passanten, wer am meisten leidet.',
        explain: 'Die Figuren tragen den Pavillon seit rund 300 Jahren ohne Pause. Eure Rücken halten keine 30 Sekunden.',
      },
    ],
    alt: {
      id: 'z3',
      type: 'first',
      title: 'Porzellan-Bimmel',
      prompt: 'Im Zwinger hängt ein Glockenspiel aus Meißner Porzellan. Wer es zuerst findet und darauf zeigt, gewinnt.',
      explain: 'Es hängt am Glockenspielpavillon. Die Glocken sind aus Porzellan, also bitte nicht mit Steinen werfen.',
    },
    tiebreak: {
      id: 'z-tb',
      type: 'estimate',
      title: 'Stechen',
      prompt: 'In welchem Jahr wurde der Zwinger fertig gebaut?',
      answer: 1728,
      explain: '1728. Angefangen wurde 1710, also 18 Jahre Party-Baustelle.',
    },
  },
  {
    id: 'semperoper',
    name: 'Semperoper',
    place: 'Theaterplatz',
    lat: 51.05454,
    lng: 13.735227,
    pose: 'august-jubel',
    intro: 'Kultur. Keine Sorge, ihr müsst nicht rein.',
    facts: [
      'Die Semperoper ist schon die dritte an dieser Stelle. Der erste Bau brannte 1869 ab, der zweite wurde 1945 zerbombt.',
      'In der Mitte des Platzes reitet König Johann. Das Denkmal stammt vom Bildhauer Johannes Schilling.',
    ],
    tasks: [
      {
        id: 's1',
        type: 'quiz',
        title: 'Bier oder Oper?',
        prompt: 'Welche Biermarke hat die Semperoper jahrzehntelang in ihrer Werbung gezeigt?',
        options: ['Radeberger', 'Wernesgrüner', 'Feldschlößchen', 'Landskron'],
        correct: 0,
        hint: 'Die Brauerei sitzt in einer Kleinstadt gleich vor Dresden.',
        explain: 'Radeberger. Ab 1992 stand die Semperoper rund 25 Jahre lang im Mittelpunkt der Werbung. Ihr kennt das Haus also wahrscheinlich auch eher aus dem Fernsehen.',
      },
      {
        id: 's2',
        type: 'estimate',
        title: 'Wiederauferstehung',
        prompt: 'In welchem Jahr wurde die heutige, wiederaufgebaute Semperoper eröffnet?',
        answer: 1985,
        hint: 'Es war noch zu DDR-Zeiten, in den 1980ern.',
        explain: 'Am 13. Februar 1985, genau 40 Jahre nach der Bombennacht. Gespielt wurde der Freischütz.',
      },
    ],
    alt: {
      id: 's3',
      type: 'quiz',
      title: 'Wer zieht hier?',
      prompt: 'Über dem Portal fährt Dionysos mit Ariadne in einem Wagen. Wer zieht den Wagen?',
      options: ['Vier Panther', 'Vier Löwen', 'Vier Pferde', 'Zwei Bären'],
      correct: 0,
      hint: 'Große Katzen, aber keine Löwen.',
      explain: 'Vier Panther. Pferde wären für einen Weingott zu langweilig gewesen.',
    },
    tiebreak: {
      id: 's-tb',
      type: 'estimate',
      title: 'Stechen',
      prompt: 'In welchem Jahr wurde die zweite Semperoper eröffnet?',
      answer: 1878,
      explain: '1878. Neun Jahre nach dem Brand des ersten Baus.',
    },
  },
  {
    id: 'hofkirche',
    name: 'Hofkirche',
    place: 'Schloßplatz',
    lat: 51.0535,
    lng: 13.73735,
    pose: 'august-denkt',
    intro: 'Hier liegt ein Teil von mir. Welcher, findet ihr gleich raus.',
    facts: [
      'Gebaut hat die Hofkirche der italienische Architekt Gaetano Chiaveri. Heute ist sie die Kathedrale des Bistums Dresden-Meißen.',
      'Daneben steht das Residenzschloss. Hier wohnten die sächsischen Herrscher, auch August.',
    ],
    tasks: [
      {
        id: 'h1',
        type: 'quiz',
        title: 'Getrennt bestattet',
        prompt: 'Augusts Herz liegt hier in der Gruft der Hofkirche. Wo liegt der Rest von ihm?',
        options: ['In Krakau', 'In Warschau', 'Im Zwinger', 'In Moritzburg'],
        correct: 0,
        hint: 'Dort wurden die polnischen Könige beigesetzt.',
        explain:
          'In der Wawel-Kathedrale in Krakau. Das Herz kam nach Dresden. Angeblich schlägt es, wenn eine schöne Frau vorbeigeht. Bei euch bleibt es also ruhig.',
      },
      {
        id: 'h2',
        type: 'estimate',
        title: 'Heilige Versammlung',
        prompt: 'Wie viele steinerne Heiligenfiguren stehen auf und an der Hofkirche? Nicht zählen, schätzen.',
        answer: 78,
        hint: 'Mehr als 70.',
        explain: '78 Figuren, die meisten von Lorenzo Mattielli. Viele wurden 1945 zerstört und bis 2002 ersetzt.',
      },
    ],
    alt: {
      id: 'h3',
      type: 'estimate',
      title: 'Hoch hinaus',
      prompt: 'Wie hoch ist der Hausmannsturm, der Turm des Residenzschlosses?',
      answer: 100,
      unit: 'm',
      hint: 'Eine schöne runde Zahl.',
      explain: 'Rund 100 Meter, genau 100,27.',
    },
    tiebreak: {
      id: 'h-tb',
      type: 'estimate',
      title: 'Stechen',
      prompt: 'In der Hofkirche steht die letzte Orgel von Gottfried Silbermann. In welchem Jahr ist er gestorben, bevor sie fertig war?',
      answer: 1753,
      explain: '1753. Sein Mitarbeiter Zacharias Hildebrandt hat die Orgel zu Ende gebaut.',
    },
  },
  {
    id: 'fuerstenzug',
    name: 'Fürstenzug',
    place: 'Augustusstraße',
    lat: 51.052757,
    lng: 13.738973,
    pose: 'august-zeigt',
    intro: 'Meine Familie. Ich bin natürlich auch drauf. Sucht mich ruhig, ich sehe gut aus.',
    facts: [
      'Gezeigt werden die 35 Markgrafen, Kurfürsten, Herzöge und Könige aus dem Haus Wettin, dazu Gelehrte, Künstler, Handwerker und Bauern.',
      'Zuerst war das Bild in den Putz gekratzt. Weil es verwitterte, wurde es 1904 bis 1907 auf Kacheln aus Meißner Porzellan übertragen.',
    ],
    tasks: [
      {
        id: 'f1',
        type: 'estimate',
        title: 'Fliesenleger',
        prompt: 'Aus wie vielen Porzellankacheln besteht der Fürstenzug?',
        answer: 23000,
        unit: 'Kacheln',
        hint: 'Fünfstellig.',
        explain: 'Rund 23.000 Kacheln auf über 100 Metern. Ein Fliesenleger würde heute dafür einen Kredit aufnehmen.',
      },
      {
        id: 'f2',
        type: 'first',
        title: 'Der Maler im Bild',
        prompt:
          'Der Maler Wilhelm Walther hat sich selbst in den Zug geschmuggelt, ganz hinten. Wer ihn zuerst findet und darauf zeigt, gewinnt.',
        explain: 'Walther steht am Ende des Zuges. Eitelkeit ist keine Erfindung von Instagram.',
      },
    ],
    alt: {
      id: 'f3',
      type: 'estimate',
      title: 'Lange Wand',
      prompt: 'Wie lang ist der Fürstenzug?',
      answer: 102,
      unit: 'm',
      hint: 'Etwas mehr als ein Fußballplatz.',
      explain: 'Rund 102 Meter.',
    },
    tiebreak: {
      id: 'f-tb',
      type: 'estimate',
      title: 'Stechen',
      prompt: 'In welchem Jahr wurde das Reiterdenkmal von König Johann auf dem Theaterplatz enthüllt?',
      answer: 1889,
      explain: '1889. Gemacht hat es Johannes Schilling.',
    },
  },
  {
    id: 'frauenkirche',
    name: 'Frauenkirche',
    place: 'Neumarkt',
    lat: 51.051957,
    lng: 13.74162,
    pose: 'august-denkt',
    intro: 'Hier ist Mittagspause. Esst was. Bier zählt nicht als Mahlzeit, egal was Keanu sagt.',
    facts: [
      'Die dunklen Steine in der Fassade sind Originale aus den Trümmern, die hellen sind neu. Die Flecken sind also Narben, kein Dreck.',
      'Vor der Kirche steht Martin Luther als Denkmal, nach einem Entwurf von Ernst Rietschel.',
    ],
    tasks: [
      {
        id: 'fr1',
        type: 'quiz',
        title: 'Das goldene Kreuz',
        prompt: 'Das goldene Kreuz auf der Kuppel hat der Brite Alan Smith geschmiedet. Was hatte sein Vater mit Dresden zu tun?',
        options: [
          'Er flog im Februar 1945 die Bombenangriffe auf Dresden mit',
          'Er war Pfarrer an der Frauenkirche',
          'Er war Kriegsgefangener in Dresden',
          'Er hat die Ruine 1945 fotografiert',
        ],
        correct: 0,
        hint: 'Es geht um den Februar 1945.',
        explain:
          'Frank Smith war Pilot bei den Angriffen auf Dresden. Sein Sohn schmiedete das Kreuz als Zeichen der Versöhnung, übergeben im Jahr 2000.',
      },
      {
        id: 'fr2',
        type: 'estimate',
        title: 'Auferstanden',
        prompt: 'In welchem Jahr wurde die wiederaufgebaute Frauenkirche geweiht?',
        answer: 2005,
        hint: 'In diesem Jahrtausend.',
        explain: 'Am 30. Oktober 2005. Verbaut wurden auch Originalsteine aus den Trümmern, das sind die dunklen.',
      },
    ],
    alt: {
      id: 'fr3',
      type: 'vote',
      title: 'Luther für Arme',
      prompt: 'Stellt nacheinander das Luther-Denkmal vor der Kirche nach. Danach stimmt jeder für den besten Luther, außer für sich selbst.',
      explain: 'Luther hätte euch alle exkommuniziert.',
    },
    tiebreak: {
      id: 'fr-tb',
      type: 'estimate',
      title: 'Stechen',
      prompt: 'Wie hoch ist die Frauenkirche bis zur Spitze des Turmkreuzes?',
      answer: 91,
      unit: 'm',
      explain: 'Rund 91 Meter.',
    },
  },
  {
    id: 'striezelmarkt',
    name: 'Striezelmarkt',
    place: 'Altmarkt',
    lat: 51.049627,
    lng: 13.73788,
    pose: 'august-jubel',
    intro: 'Glühwein, Stollen, Gedränge. Bonusstation, aber die Punkte zählen voll.',
    facts: [],
    tasks: [
      {
        id: 'st1',
        type: 'estimate',
        title: 'Turmbau',
        prompt: 'Auf dem Markt dreht sich eine riesige erzgebirgische Stufenpyramide. Wie hoch ist sie?',
        answer: 14.61,
        unit: 'm',
        hint: 'Zwischen 10 und 20 Metern.',
        explain: 'Rund 14,6 Meter. Sie gilt als größte erzgebirgische Stufenpyramide der Welt.',
      },
      {
        id: 'st2',
        type: 'quiz',
        title: 'Der Pflaumentoffel',
        prompt: 'Der Pflaumentoffel ist ein kleiner Glücksbringer vom Striezelmarkt. Woraus ist er gemacht?',
        options: ['Aus getrockneten Pflaumen', 'Aus Lebkuchen', 'Aus Marzipan', 'Aus Holz'],
        correct: 0,
        hint: 'Der Name verrät mehr, als man denkt.',
        explain: 'Aus Backpflaumen. Essbar, aber danach sieht man aus wie er.',
      },
    ],
    alt: {
      id: 'st3',
      type: 'passant',
      title: 'Glühweingesicht',
      prompt: 'Jeder nimmt einen großen Schluck Glühwein und zieht dabei sein ehrlichstes Gesicht. Ein Passant oder die Person am Stand kürt den Sieger.',
      explain: 'Glühwein ist Wein, der aufgegeben hat. Ihr wisst jetzt, wie sich das anfühlt.',
    },
    tiebreak: {
      id: 'st-tb',
      type: 'estimate',
      title: 'Stechen',
      prompt: 'Seit welchem Jahr steht die Stufenpyramide auf dem Striezelmarkt?',
      answer: 1997,
      explain: 'Seit 1997.',
    },
  },
  {
    id: 'bruehl',
    name: 'Brühlsche Terrasse',
    place: 'Über der Elbe',
    lat: 51.0537,
    lng: 13.7412,
    pose: 'august-zeigt',
    intro: 'Bester Blick der Stadt. Wer hier oben jammert, zahlt doppelt. Nicht wirklich. Aber fast.',
    facts: [
      'An der großen Freitreppe zum Schloßplatz stehen vier Figurengruppen von Johannes Schilling. Sie zeigen Morgen, Tag, Abend und Nacht.',
    ],
    tasks: [
      {
        id: 'b1',
        type: 'quiz',
        title: 'Spitzname',
        prompt: 'Welchen Spitznamen hat die Brühlsche Terrasse?',
        options: ['Balkon Europas', 'Dach Sachsens', 'Loge der Könige', 'Elbpromenade des Kaisers'],
        correct: 0,
        hint: 'Ganz Europa schaut von hier aus zu. Angeblich.',
        explain: 'Balkon Europas. Bescheidenheit war in Dresden noch nie ein Ding.',
      },
      {
        id: 'b2',
        type: 'first',
        title: 'Augusts Daumen',
        prompt:
          'Irgendwo im Geländer der Terrasse soll ein Daumenabdruck von August stecken. Reine Legende, aber wer ihn zuerst findet und seinen Daumen reinlegt, gewinnt.',
        hint: 'Lauft am Geländer entlang Richtung Osten, zum Moritzdenkmal.',
        explain: 'Ob August wirklich ins Eisen gedrückt hat, weiß keiner. Er soll ja auch Hufeisen mit bloßen Händen zerbrochen haben.',
      },
    ],
    alt: {
      id: 'b3',
      type: 'count',
      title: 'Treppensteiger',
      prompt: 'Schätzt, wie viele Stufen die große Freitreppe vom Schloßplatz hoch zur Terrasse hat. Danach zählt ihr gemeinsam und tragt die echte Zahl ein.',
      unit: 'Stufen',
      explain: 'Gezählt ist gezählt. Wer sich verzählt hat, war schon beim Glühwein.',
    },
    tiebreak: {
      id: 'b-tb',
      type: 'estimate',
      title: 'Stechen',
      prompt: 'Wie lang ist die Elbe insgesamt?',
      answer: 1094,
      unit: 'km',
      explain: 'Rund 1094 Kilometer, vom Riesengebirge bis in die Nordsee bei Cuxhaven.',
    },
  },
  {
    id: 'augustusbruecke',
    name: 'Augustusbrücke',
    place: 'Zwischen Alt- und Neustadt',
    lat: 51.055551,
    lng: 13.73975,
    pose: 'august-jubel',
    intro: 'Meine Brücke. Heißt ja auch so.',
    facts: [
      'Von der Neustädter Seite, unterhalb der Brücke, malte Bernardo Bellotto, genannt Canaletto, im Jahr 1748 die Altstadt. Der Blick heißt bis heute Canaletto-Blick.',
    ],
    tasks: [
      {
        id: 'a1',
        type: 'estimate',
        title: 'Bogenschützen',
        prompt: 'Wie viele Bögen hat die Augustusbrücke? Schnell schätzen, nicht runterschauen.',
        answer: 9,
        unit: 'Bögen',
        hint: 'Einstellig.',
        explain: 'Neun Bögen. Zählt ruhig nach, wenn ihr unten am Ufer seid.',
      },
      {
        id: 'a2',
        type: 'vote',
        title: 'Canaletto für Arme',
        prompt: 'Geht ans Neustädter Ufer unterhalb der Brücke. Jeder macht sein bestes Foto von der Altstadt. Zeigt sie rum und stimmt ab, außer für euch selbst.',
        explain: 'Canaletto hatte Leinwand, Pinsel und keine Eile. Ihr hattet zwei Minuten und kalte Finger.',
      },
    ],
    alt: {
      id: 'a3',
      type: 'count',
      title: 'Schrittzähler',
      prompt: 'Schätzt, wie viele Schritte die Brücke lang ist. Einer zählt beim Rübergehen und trägt die echte Zahl ein.',
      unit: 'Schritte',
      explain: 'Wer zählt, bestimmt die Wahrheit. Wie im echten Leben.',
    },
    tiebreak: {
      id: 'a-tb',
      type: 'estimate',
      title: 'Stechen',
      prompt: 'Seit welchem Jahr ist die Hofkirche die Kathedrale des Bistums Dresden-Meißen?',
      answer: 1980,
      explain: 'Seit 1980.',
    },
  },
  {
    id: 'reiter',
    name: 'Goldener Reiter',
    place: 'Neustädter Markt',
    lat: 51.058112,
    lng: 13.741308,
    pose: 'august',
    intro: 'Das bin ich. In Gold. Größer als im echten Leben und schöner als ihr. Letzte Station, danach wird abgerechnet.',
    facts: [
      'August reitet hier als römischer Kaiser. Die Figur ist aus Kupfer getrieben und feuervergoldet.',
      'Aufgestellt wurde er in den 1730er Jahren, kurz nach Augusts Tod.',
    ],
    tasks: [
      {
        id: 'g1',
        type: 'quiz',
        title: 'Blickrichtung',
        prompt: 'Wohin schaut der Goldene Reiter?',
        options: ['Nach Nordosten, Richtung Polen', 'Nach Süden, Richtung Prag', 'Zur Frauenkirche', 'Zum nächsten Biergarten'],
        correct: 0,
        hint: 'Er hatte da noch ein zweites Königreich.',
        explain: 'Richtung Polen. 1697 hatte sich August dort die Krone gesichert.',
      },
      {
        id: 'g2',
        type: 'quiz',
        title: 'Familienplanung',
        prompt: 'Wie viele Kinder hatte August nachweislich?',
        options: ['9', '354', '1', '27'],
        correct: 0,
        hint: 'Die Legende übertreibt maßlos.',
        explain: 'Neun sind nachgewiesen. Die Legende spricht von 354. Das wäre selbst für einen Barockfürsten sportlich.',
      },
    ],
    alt: {
      id: 'g3',
      type: 'passant',
      title: 'Der König bin ich',
      prompt: 'Jeder stellt August auf dem Pferd nach. Fragt einen Passanten, wer der wahre König ist.',
      explain: 'Es kann nur einen geben. Und der ist aus Gold.',
    },
    tiebreak: {
      id: 'g-tb',
      type: 'estimate',
      title: 'Stechen',
      prompt: 'Wie alt ist August der Starke geworden?',
      answer: 62,
      unit: 'Jahre',
      explain: '62. Geboren 1670 in Dresden, gestorben 1733 in Warschau.',
    },
  },
]
