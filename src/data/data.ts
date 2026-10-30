export const DATA = {
  regions: {
    jerusalem: { n: "Jerusalem", x: 660, y: 372, pop: 3, open: 60, pers: 40, start: 1 },
    damascus: { n: "Damascus", x: 725, y: 300, pop: 2, open: 40, pers: 50 },
    antioch: { n: "Antioch", x: 650, y: 250, pop: 4, open: 55, pers: 25 },
    cyprus: { n: "Cyprus", x: 585, y: 305, pop: 1, open: 60, pers: 15 },
    galatia: { n: "Galatia", x: 590, y: 185, pop: 2, open: 50, pers: 30 },
    ephesus: { n: "Ephesus", x: 500, y: 235, pop: 4, open: 45, pers: 40 },
    philippi: { n: "Philippi", x: 415, y: 150, pop: 2, open: 50, pers: 30 },
    corinth: { n: "Corinth", x: 395, y: 270, pop: 3, open: 45, pers: 35 },
    alexandria: { n: "Alexandria", x: 520, y: 400, pop: 4, open: 35, pers: 30 },
    rome: { n: "Rome", x: 225, y: 175, pop: 5, open: 30, pers: 60 },
    spain: { n: "Spain", x: 70, y: 255, pop: 3, open: 35, pers: 20 }
  },
  links: [["jerusalem", "damascus"], ["jerusalem", "antioch"], ["jerusalem", "alexandria"], ["damascus", "antioch"], ["antioch", "cyprus"], ["antioch", "galatia"], ["galatia", "ephesus"], ["cyprus", "ephesus"], ["ephesus", "philippi"], ["ephesus", "corinth"], ["philippi", "corinth"], ["corinth", "rome"], ["philippi", "rome"], ["rome", "spain"], ["alexandria", "cyprus"], ["alexandria", "corinth"]],
  events: [
    { t: "A door opens for the message.", v: "Colossians 4:3", fx: s => { const r = pick(s); r.open = Math.min(100, r.open + 15); return r.n + " is more open." } },
    { t: "Persecution scatters the believers.", v: "Acts 8:4", fx: s => { const r = pick(s); r.pers = Math.min(100, r.pers + 15); r.bel = Math.max(0, r.bel - 8); return r.n + ": believers scattered, but they keep telling others." } },
    { t: "A generous church sends support.", v: "2 Corinthians 9:7", fx: () => { G.funds += 25; return "+25 funds." } },
    { t: "A storm wrecks supplies at sea.", v: "Acts 27:41", fx: () => { G.funds = Math.max(0, G.funds - 15); return "-15 funds." } },
    { t: "A worker is weary and needs rest.", v: "Mark 6:31", fx: () => { G.prayer = Math.max(0, G.prayer - 1); return "-1 prayer." } }
  ]
};
