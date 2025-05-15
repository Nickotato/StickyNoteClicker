export const defaultVisuals = {
  clearNote: {
    id: "clearNote",
    name: "A Clean Note",
    cost: 0,
    image: undefined,
    owned: true,
    selected: true,
    type: "note",
  },
  smile: {
    id: "smile",
    name: "Smiley Face",
    cost: 100,
    image: require("url:./images/visual/note/happy.webp"),
    owned: false,
    selected: false,
    type: "note",
  },
  schroeder: {
    id: "schroeder",
    name: "Schroeder",
    cost: 10,
    image: require("url:./images/visual/note/SchroederShadow.png"),
    owned: false,
    selected: false,
    type: "note",
  },
};
