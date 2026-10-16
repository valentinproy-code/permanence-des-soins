// Tests : node --test tests/
const test = require("node:test");
const assert = require("node:assert/strict");

globalThis.window = globalThis;
require("../assets/config.js");
require("../assets/horaires.js");
require("../assets/arbre.js");

const C = window.CABINET;
const H = window.Horaires;
const arbre = window.construireArbre(C);

test("Pâques et jours fériés", () => {
  assert.equal(H.paques(2026).toDateString(), new Date(2026, 3, 5).toDateString());
  assert.equal(H.paques(2027).toDateString(), new Date(2027, 2, 28).toDateString());
  const f = H.joursFeries(2026);
  for (const d of ["2026-04-06", "2026-05-14", "2026-05-25", "2026-11-11", "2026-12-25"]) assert.ok(f.has(d), d);
});

test("créneaux horaires", () => {
  const cas = [
    [new Date(2026, 9, 14, 10, 0), "ouvert"],  // mercredi 10h
    [new Date(2026, 9, 14, 13, 0), "ferme"],   // mercredi pause midi
    [new Date(2026, 9, 14, 19, 30), "ferme"],  // mercredi 19h30
    [new Date(2026, 9, 14, 21, 0), "pdsa"],    // mercredi soir
    [new Date(2026, 9, 15, 3, 0), "nuit"],     // jeudi 3h
    [new Date(2026, 9, 17, 10, 0), "ferme"],   // samedi matin
    [new Date(2026, 9, 17, 14, 0), "pdsa"],    // samedi après-midi
    [new Date(2026, 9, 18, 11, 0), "pdsa"],    // dimanche
    [new Date(2026, 9, 18, 2, 0), "nuit"],     // dimanche nuit
    [new Date(2026, 10, 11, 10, 0), "pdsa"]    // 11 novembre (mercredi férié)
  ];
  for (const [d, attendu] of cas) assert.equal(H.creneau(d, C), attendu, d.toString());
});

test("jours de pont et fermetures", () => {
  const conf = { ...C, joursPDSA: ["2026-11-10"], fermetures: ["2026-10-14"] };
  assert.equal(H.creneau(new Date(2026, 10, 10, 10, 0), conf), "pdsa");
  assert.equal(H.creneau(new Date(2026, 9, 14, 10, 0), conf), "ferme");
});

test("prochaine ouverture", () => {
  // samedi 17 → lundi 19 octobre 8h30
  assert.equal(H.prochaineOuverture(new Date(2026, 9, 17, 15, 0), C).getTime(), new Date(2026, 9, 19, 8, 30).getTime());
  // mardi 10 nov. au soir → jeudi 12 nov. (11 novembre férié)
  assert.equal(H.prochaineOuverture(new Date(2026, 10, 10, 21, 0), C).getTime(), new Date(2026, 10, 12, 8, 30).getTime());
});

test("arbre : toutes les cibles existent et tous les nœuds sont atteignables", () => {
  const { noeuds, depart } = arbre;
  const vus = new Set();
  const aVisiter = [depart];
  while (aVisiter.length) {
    const id = aVisiter.pop();
    assert.ok(noeuds[id], `nœud manquant : ${id}`);
    if (vus.has(id)) continue;
    vus.add(id);
    const n = noeuds[id];
    for (const o of n.options || []) aVisiter.push(o.suivant);
    if (n.type === "aiguillage") {
      for (const c of ["ouvert", "ferme", "pdsa", "nuit"]) assert.ok(n.branches[c], `${id} : branche ${c} manquante`);
      aVisiter.push(...Object.values(n.branches));
    }
  }
  const orphelins = Object.keys(noeuds).filter((id) => !vus.has(id));
  assert.deepEqual(orphelins, []);
});

test("toute réponse « danger » mène à un appel au 15", () => {
  for (const n of Object.values(arbre.noeuds)) {
    for (const o of (n.options || []).filter((o) => o.style === "danger")) {
      const cible = arbre.noeuds[o.suivant];
      assert.equal(cible.niveau, "rouge", o.libelle);
      assert.ok(cible.actions.some((a) => a.valeur === "15"), o.libelle);
    }
  }
});
