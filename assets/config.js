/*
 * ⚙️ PARAMÈTRES DU CABINET
 * ------------------------------------------------------------------
 * C'est le SEUL fichier à modifier pour adapter l'outil au cabinet :
 * coordonnées, horaires, liens, congés…
 * Toutes les valeurs marquées « À COMPLÉTER » doivent être renseignées
 * avant la mise en ligne.
 */
window.CABINET = {
  nom: "Cabinet médical (À COMPLÉTER)",
  ville: "Sarzeau",

  // Secrétariat : numéro affiché et composé en un clic (format libre).
  telephone: "02 00 00 00 00", // À COMPLÉTER

  // Lien de prise de rendez-vous Doctolib du cabinet.
  doctolib: "https://www.doctolib.fr/", // À COMPLÉTER (lien direct vers la page du cabinet)

  // Horaires d'ouverture du cabinet / secrétariat, par jour de la semaine.
  // 0 = dimanche, 1 = lundi … 6 = samedi. Plages au format "HH:MM".
  horaires: {
    1: [["08:30", "12:30"], ["14:00", "19:00"]],
    2: [["08:30", "12:30"], ["14:00", "19:00"]],
    3: [["08:30", "12:30"], ["14:00", "19:00"]],
    4: [["08:30", "12:30"], ["14:00", "19:00"]],
    5: [["08:30", "12:30"], ["14:00", "19:00"]],
    6: [], // ex. [["08:30", "12:00"]] si le cabinet ouvre le samedi matin
    0: []
  },

  // Fermetures exceptionnelles du cabinet (congés, formation…) : "AAAA-MM-JJ".
  fermetures: [],

  // Jours de « pont » couverts par la permanence des soins (décision ARS) : "AAAA-MM-JJ".
  joursPDSA: [],

  // Maison Médicale de Garde
  mmg: {
    nom: "Maison Médicale de Garde de Sarzeau",
    adresse: "Adresse à compléter, 56370 Sarzeau", // À COMPLÉTER
    horairesTexte: "Soirs de semaine, samedi après-midi, dimanches et jours fériés (horaires à compléter)", // À COMPLÉTER
    carte: "" // facultatif : lien Google Maps / OpenStreetMap
  },

  // Urgences de la main (plaie, section de tendon, doigt écrasé…)
  sosMain: {
    nom: "Centre SOS Main le plus proche (À COMPLÉTER)",
    telephone: "", // À COMPLÉTER
    adresse: "" // À COMPLÉTER
  },

  // Garde dentaire (dimanches et jours fériés)
  gardeDentaire: {
    texte: "Les dimanches et jours fériés, un chirurgien-dentiste de garde est joignable via la régulation.", // À VÉRIFIER
    telephone: "15"
  },

  // Centre antipoison compétent pour la Bretagne
  antipoison: { nom: "Centre antipoison d'Angers", telephone: "02 41 48 21 21" }
};
