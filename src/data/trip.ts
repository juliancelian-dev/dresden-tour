// Departure from Hannover, Saturday 12 December 2026 (calendar entry "Dresden Orlaub", 12.-13.12.)
export const TRIP_START = new Date('2026-12-12T08:00:00+01:00')

export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`

export type CrewMember = {
  id: 'julian' | 'joop' | 'keanu' | 'ben'
  name: string
  nickname?: string
  /** One-liner under the avatar in the teaser */
  tag: string
}

export type PlayerId = CrewMember['id']

export const PLAYER_IDS: PlayerId[] = ['julian', 'joop', 'keanu', 'ben']

export const CREW: CrewMember[] = [
  { id: 'julian', name: 'Julian', tag: 'ist zu hyped' },
  { id: 'joop', name: 'Joop', nickname: 'Joost', tag: 'alias Joost' },
  { id: 'keanu', name: 'Keanu', nickname: 'K', tag: 'popelt gerne' },
  { id: 'ben', name: 'Ben', nickname: 'Ben Cruz', tag: 'wiederholt gerne Memes' },
]

export const crewById = (id: PlayerId) => CREW.find((m) => m.id === id)!

export type Fact = { title: string; body: string }

// Teaser facts. Sources in ../../fakten.md. These facts are never reused in a task.
export const FACTS: Fact[] = [
  {
    title: 'Älter als Kolumbus',
    body: 'Der Striezelmarkt wurde 1434 zum ersten Mal urkundlich erwähnt, 58 Jahre bevor Kolumbus in Amerika ankam. Er gilt als ältester belegter Weihnachtsmarkt Deutschlands. Bautzen sieht das anders.',
  },
  {
    title: 'Welterbe? War mal.',
    body: 'Die UNESCO hat dem Dresdner Elbtal 2009 den Welterbetitel wieder weggenommen. Grund war eine neue Brücke. Das ist weltweit nur sehr wenigen Orten passiert.',
  },
  {
    title: 'Fabrik im Kostüm',
    body: 'Die Yenidze sieht aus wie eine Moschee, war aber eine Zigarettenfabrik. Der Schornstein ist als Minarett verkleidet.',
  },
  {
    title: 'Milch mit Rekord',
    body: 'Laut Guinness-Buch steht in Dresden der schönste Milchladen der Welt. Rund 3.500 handbemalte Fliesen. Für Milch.',
  },
  {
    title: 'Ein blaues Wunder',
    body: 'Das Blaue Wunder wurde 1893 eröffnet und überspannt die Elbe ohne einen einzigen Pfeiler im Fluss. Damals galt das als technisches Wunder.',
  },
  {
    title: 'Die Wand, die bei Regen spielt',
    body: 'In der Kunsthofpassage hängt eine Fassade voller Rinnen und Trichter. Wenn es regnet, macht sie Musik.',
  },
  {
    title: 'Volle Dampfkraft',
    body: 'Auf der Elbe fahren neun historische Raddampfer. Der Betreiber nennt das die älteste und größte Raddampferflotte der Welt.',
  },
  {
    title: 'Landskron ist kein Dresdner',
    body: 'Euer Bier wird in Görlitz gebraut, direkt an der polnischen Grenze, seit 1869. Im Red Rooster steht es trotzdem auf der Karte.',
  },
]
