/*
 * Calcul du créneau horaire courant au regard de la permanence des soins.
 *
 * Créneaux renvoyés par creneau() :
 *   "ouvert" : le cabinet est ouvert
 *   "ferme"  : journée de semaine, cabinet fermé (pause, congés…), hors PDSA
 *   "pdsa"   : permanence des soins ambulatoires (soirs 20h-24h, samedi 12h-24h,
 *              dimanches, jours fériés et ponts 8h-24h)
 *   "nuit"   : nuit profonde (0h-8h)
 */
(function (global) {
  "use strict";

  const JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
    "août", "septembre", "octobre", "novembre", "décembre"];

  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const enMinutes = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };

  // Dimanche de Pâques (algorithme de Meeus / Jones / Butcher)
  function paques(annee) {
    const a = annee % 19, b = Math.floor(annee / 100), c = annee % 100;
    const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mois = Math.floor((h + l - 7 * m + 114) / 31);
    const jour = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(annee, mois - 1, jour);
  }

  function joursFeries(annee) {
    const p = paques(annee);
    const plus = (n) => iso(new Date(p.getFullYear(), p.getMonth(), p.getDate() + n));
    return new Set([
      `${annee}-01-01`, plus(1), `${annee}-05-01`, `${annee}-05-08`, plus(39), plus(50),
      `${annee}-07-14`, `${annee}-08-15`, `${annee}-11-01`, `${annee}-11-11`, `${annee}-12-25`
    ]);
  }

  const estFerie = (d) => joursFeries(d.getFullYear()).has(iso(d));
  const estJourPDSA = (d, config) =>
    d.getDay() === 0 || estFerie(d) || (config.joursPDSA || []).includes(iso(d));
  const estFermeExceptionnellement = (d, config) =>
    estJourPDSA(d, config) || (config.fermetures || []).includes(iso(d));

  function cabinetOuvert(d, config) {
    if (estFermeExceptionnellement(d, config)) return false;
    const m = d.getHours() * 60 + d.getMinutes();
    return (config.horaires[d.getDay()] || []).some(([a, b]) => m >= enMinutes(a) && m < enMinutes(b));
  }

  function creneau(d, config) {
    const m = d.getHours() * 60 + d.getMinutes();
    if (m < 8 * 60) return "nuit";
    if (estJourPDSA(d, config)) return "pdsa";
    if (cabinetOuvert(d, config)) return "ouvert";
    if (d.getDay() === 6 && m >= 12 * 60) return "pdsa";
    if (m >= 20 * 60) return "pdsa";
    return "ferme";
  }

  // Prochaine ouverture du cabinet (dans les 21 jours), ou null.
  function prochaineOuverture(d, config) {
    for (let i = 0; i < 21; i++) {
      const jour = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
      if (estFermeExceptionnellement(jour, config)) continue;
      for (const [debut] of config.horaires[jour.getDay()] || []) {
        const [h, m] = debut.split(":").map(Number);
        const ouverture = new Date(jour.getFullYear(), jour.getMonth(), jour.getDate(), h, m);
        if (ouverture > d) return ouverture;
      }
    }
    return null;
  }

  const heure = (d) => `${d.getHours()}h${pad(d.getMinutes())}`;

  function decrire(d) {
    const maintenant = new Date();
    const demain = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate() + 1);
    if (iso(d) === iso(maintenant)) return `aujourd'hui à ${heure(d)}`;
    if (iso(d) === iso(demain)) return `demain (${JOURS[d.getDay()]}) à ${heure(d)}`;
    return `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]} à ${heure(d)}`;
  }

  const decrireMaintenant = (d) =>
    `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}, ${heure(d)}`;

  global.Horaires = {
    paques, joursFeries, estFerie, estJourPDSA, cabinetOuvert, creneau,
    prochaineOuverture, decrire, decrireMaintenant
  };
})(typeof window !== "undefined" ? window : globalThis);
