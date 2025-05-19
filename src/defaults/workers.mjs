import { WorkerClass } from "./classes/Worker.mjs";

export const defaultWorkers = {
  worker1: new WorkerClass({
    id: "worker1",
    name: "Loose Change",
    description: "Collect coins from couch cushions to buy more notes.",
    _cost: 10,
    produce: 1,
  }),
  worker2: new WorkerClass({
    id: "worker2",
    name: `Buy "Friend"`,
    description: "Buy a real friend to buy you notes.",
    _cost: 100,
    produce: 2,
  }),
  worker3: new WorkerClass({
    id: "worker3",
    name: "Pen",
    description: 'Make "important" notes.',
    _cost: 1000,
    produce: 5,
  }),
  worker4: new WorkerClass({
    id: "worker4",
    name: "Part Time Job",
    description: "I can't wait to start working.",
    _cost: 15000,
    produce: 15,
  }),
  worker5: new WorkerClass({
    id: "worker5",
    name: "Robbery",
    description: "I hate working.",
    _cost: 50000,
    produce: 30,
  }),
  worker6: new WorkerClass({
    id: "worker6",
    name: "Numismatics",
    description: "Collects coins. Doesn’t spend them. Slight issue.",
    _cost: 200000,
    produce: 50,
  }),
  worker7: new WorkerClass({
    id: "worker7",
    name: "Coin Hoarder",
    description: "An obsession with coin collections leads to note production.",
    _cost: 1000000,
    produce: 100,
  }),
  onlineShopping: new WorkerClass({
    id: "onlineShopping",
    name: "Online Shopping",
    description: "You only get scammed, sometimes.",
    _cost: 2200000,
    produce: 170,
  }),
  coffeeIntern: new WorkerClass({
    id: "coffeeIntern",
    name: "Coffee Intern",
    description: "Energizes the office and occasionally makes a decent latte.",
    _cost: 3000000,
    produce: 250,
  }),
  printerGoblin: new WorkerClass({
    id: "printerGoblin",
    name: "Printer Goblin",
    description:
      "Lurks near the copier and prints sticky notes at lightning speed.",
    _cost: 5000000,
    produce: 300,
  }),
  basementInterns: new WorkerClass({
    id: "basementInterns",
    name: "Basement Interns",
    description:
      "Unpaid and overworked, they generate notes in exchange for 'experience'.",
    _cost: 11000000,
    produce: 380,
  }),
  mandatoryVolunteer: new WorkerClass({
    id: "mandatoryVolunteer",
    name: "Mandatory Volunteer",
    description: "They want to be here :).",
    _cost: 17000000,
    produce: 560,
  }),
  hundredHumans: new WorkerClass({
    id: "hundredHumans",
    name: "100 Humans",
    description: "The only thing that can beat a silverback gorilla.",
    _cost: 3.0e7,
    produce: 800,
  }),
  internetAdBot: new WorkerClass({
    id: "internetAdBot",
    name: "Internet Ad Bot",
    description: "Runs ads for sticky notes you didn’t know you needed.",
    _cost: 5.0e7,
    produce: 1300,
  }),
  automationScript: new WorkerClass({
    id: "automationScript",
    name: "Automation Script",
    description: "A single script replaces 10 interns. No coffee needed.",
    _cost: 1.0e8,
    produce: 2000,
  }),
  noteFactory: new WorkerClass({
    id: "noteFactory",
    name: "Note Factory",
    description: "Industrial-grade note vomit. Glorious.",
    _cost: 3.0e8,
    produce: 2800,
  }),
  paperPusherPro: new WorkerClass({
    id: "paperPusherPro",
    name: "Paper Pusher Pro",
    description: "Elevated from intern to professional note stacker.",
    _cost: 5e8,
    produce: 3700,
  }),
  humanResources: new WorkerClass({
    id: "humanResources",
    name: "Human Resources",
    description: "Perhaps allowing hats on Friday will cure their depression?",
    _cost: 7e8,
    produce: 4700,
  }),
  corporateDroneSwarm: new WorkerClass({
    id: "corporateDroneSwarm",
    name: "Corporate Drone Swarm",
    description:
      "A legion of highly caffeinated office workers producing notes in unison.",
    _cost: 1e9,
    produce: 5800,
  }),
  ceoOverlord: new WorkerClass({
    id: "ceoOverlord",
    name: "CEO Overlord",
    description:
      "Does nothing, yet everything gets done. Yells 'synergy' a lot.",
    _cost: 2.8e9,
    produce: 7000,
  }),
  aiNoteGenerator: new WorkerClass({
    id: "aiNoteGenerator",
    name: "AI Note Generator",
    description:
      "Hallucinates helpful notes after reading the internet for 3 minutes.",
    _cost: 7.5e9,
    produce: 9000,
  }),
  thirdWorldCountry: new WorkerClass({
    id: "thirdWorldCountry",
    name: "Third World Country",
    description: "I wouldn't say free, more like, under new management.",
    _cost: 2.1e10,
    produce: 12000,
  }),
  warCrimes: new WorkerClass({
    id: "warCrimes",
    name: "War Crimes",
    description:
      'Commit terrible acts, like calling sticky notes "post-it notes".',
    _cost: 5.8e10,
    produce: 15000,
  }),
  lunarNoteMiners: new WorkerClass({
    id: "lunarNoteMiners",
    name: "Lunar Note Miners",
    description: "Specialized team mining for rare note isotopes on the Moon.",
    _cost: 1.6e11,
    produce: 18000,
  }),
  quantumTaskScheduler: new WorkerClass({
    id: "quantumTaskScheduler",
    name: "Quantum Task Scheduler",
    description:
      "Performs tasks before you even think of them. Terrifyingly efficient.",
    _cost: 4.5e11,
    produce: 22000,
  }),
  martianColonyScribes: new WorkerClass({
    id: "martianColonyScribes",
    name: "Martian Colony Scribes",
    description:
      "The first Martian settlers are surprisingly adept at note creation.",
    _cost: 1.2e12,
    produce: 30000,
  }),
  quantumStickyLab: new WorkerClass({
    id: "quantumStickyLab",
    name: "Quantum Sticky Lab",
    description:
      "Harvests sticky notes from infinite timelines. Some are cursed.",
    _cost: 3.3e12,
    produce: 40000,
  }),
  asteroidBeltPaperRoute: new WorkerClass({
    id: "asteroidBeltPaperRoute",
    name: "Asteroid Belt Paper Route",
    description:
      "Delivering bulk sticky notes to various asteroid outposts. High risk, high reward.",
    _cost: 9.1e12,
    produce: 60000,
  }),
  interstellarNoteTraders: new WorkerClass({
    id: "interstellarNoteTraders",
    name: "Interstellar Note Traders",
    description:
      "Galactic merchants specializing in the exotic note markets of distant star systems.",
    _cost: 2.5e13,
    produce: 75000,
  }),
  multiverseMerger: new WorkerClass({
    id: "multiverseMerger",
    name: "Multiverse Merger",
    description:
      "Absorbs entire companies across realities. Legally questionable.",
    _cost: 6.8e13,
    produce: 95000,
  }),
  parallelWorldEmpire: new WorkerClass({
    id: "parallelWorldEmpire",
    name: "Parallel World Empire",
    description: "Gathers sticky notes from countless universes.",
    _cost: 1.8e14,
    produce: 140000,
  }),
  galacticNoteForge: new WorkerClass({
    id: "galacticNoteForge",
    name: "Galactic Note Forge",
    description:
      "A Dyson sphere powered factory dedicated to forging notes from raw stellar material.",
    _cost: 5e14,
    produce: 250000,
  }),
  stickyNote: new WorkerClass({
    id: "stickynote",
    name: "The Sticky Note",
    description: "The One and Only",
    _cost: 1e16,
    produce: 100000000,
  }),
};
