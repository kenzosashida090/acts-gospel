import type { Campaign } from "../../../types/index.d.ts";
import { paulBlurbs } from "./paulBlurbs.ts";
const regions = {
  jerusalem: { name: "Jerusalem", x: 660, y: 372, pop: 3, open: 60, pers: 40, start: true },
  damascus: { name: "Damascus", x: 725, y: 300, pop: 2, open: 40, pers: 50 },
  antioch: { name: "Antioch", x: 650, y: 250, pop: 4, open: 55, pers: 25 },
  cyprus: { name: "Cyprus", x: 585, y: 305, pop: 1, open: 60, pers: 15 },
  galatia: { name: "Galatia", x: 590, y: 185, pop: 2, open: 50, pers: 30 },
  ephesus: { name: "Ephesus", x: 500, y: 235, pop: 4, open: 45, pers: 40 },
  philippi: { name: "Philippi", x: 415, y: 150, pop: 2, open: 50, pers: 30 },
  corinth: { name: "Corinth", x: 395, y: 270, pop: 3, open: 45, pers: 35 },
  alexandria: { name: "Alexandria", x: 520, y: 400, pop: 4, open: 35, pers: 30 },
  rome: { name: "Rome", x: 225, y: 175, pop: 5, open: 30, pers: 60 },
  spain: { name: "Spain", x: 70, y: 255, pop: 3, open: 35, pers: 20 }
}

export const paul: Campaign = {
  id: "paul",
  title: "Paul's World",
  maxTurns: 40,
  regions: Object.fromEntries(
    Object.entries(regions).map(([id, d]) => [id, { ...d, blurb: paulBlurbs[id] }])
  ),
  links: [["jerusalem", "damascus"], ["jerusalem", "antioch"], ["jerusalem", "alexandria"], ["damascus", "antioch"], ["antioch", "cyprus"], ["antioch", "galatia"], ["galatia", "ephesus"], ["cyprus", "ephesus"], ["ephesus", "philippi"], ["ephesus", "corinth"], ["philippi", "corinth"], ["corinth", "rome"], ["philippi", "rome"], ["rome", "spain"], ["alexandria", "cyprus"], ["alexandria", "corinth"]],
  events: [
    {
      id: "open-door",
      text: "A door opens for the message.",
      verse: "Colossians 4:3",
      effects: [{ kind: "region", stat: "open", delta: 15 }],
    },
    {
      id: "persecution",
      text: "Persecution scatters the believers.",
      verse: "Acts 8:4",
      effects: [
        { kind: "region", stat: "pers", delta: 15 },
        { kind: "region", stat: "bel", delta: -8 }
      ],
    },
    {
      id: "generosity",
      text: "A generous church sends support.",
      verse: "2 Corinthians 9:7",
      effects: [
        {
          kind: "funds",
          delta: 25
        }
      ]
    },
    {
      id: "storm",
      text: "A storm wrecks supplies at sea.",
      verse: "Acts 27:41",
      effects: [{ kind: "funds", delta: -15 }],
    },
    {
      id: "weary",
      text: "A worker is weary and needs rest.",
      verse: "Mark 6:31",
      effects: [{ kind: "prayer", delta: -1 }]
    }
  ]
}
