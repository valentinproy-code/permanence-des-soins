/*
 * 🌳 ARBRE DE DÉCISION
 * ------------------------------------------------------------------
 * Chaque étape (« nœud ») a un identifiant unique et un type :
 *
 *   question   : une question et des réponses (options) menant à d'autres nœuds
 *   aiguillage : choix automatique selon le moment (cabinet ouvert, fermé,
 *                permanence des soins, nuit) — pas d'écran affiché
 *   resultat   : la conduite à tenir finale
 *
 * Niveaux de résultat : "rouge" (urgence, 15), "orange" (à voir aujourd'hui),
 * "vert" (rendez-vous programmé), "bleu" (information).
 *
 * Dans les textes, {prochaineOuverture} est remplacé par la date de
 * réouverture du cabinet calculée automatiquement.
 *
 * « motsCles » alimente la recherche en texte libre de l'écran d'accueil.
 */
window.construireArbre = function (C) {
  "use strict";

  const appel15 = { type: "tel", valeur: "15", libelle: "Appeler le 15" };
  const appelCabinet = { type: "tel", valeur: C.telephone, libelle: `Appeler le secrétariat — ${C.telephone}` };
  const doctolib = { type: "lien", valeur: C.doctolib, libelle: "Prendre rendez-vous sur Doctolib" };

  return {
    depart: "signes_gravite",

    noeuds: {
      // ───────────────────────────── 1. Tri des urgences vitales
      signes_gravite: {
        type: "question",
        variante: "danger",
        titre: "Avez-vous (ou la personne concernée) l'un de ces signes ?",
        liste: [
          "Douleur ou oppression dans la poitrine",
          "Difficulté importante à respirer, lèvres bleues, impossible de finir une phrase",
          "Visage qui se paralyse, faiblesse d'un bras ou d'une jambe, difficulté à parler — même si cela a disparu",
          "Perte de connaissance, malaise grave, confusion ou somnolence inhabituelle",
          "Convulsions",
          "Saignement abondant qui ne s'arrête pas",
          "Gonflement du visage ou de la gorge, gêne pour respirer ou avaler (allergie grave)",
          "Fièvre avec taches rouges ou violacées qui ne s'effacent pas à la pression",
          "Accident grave, chute de hauteur, choc à la tête avec vomissements ou perte de connaissance",
          "Douleur brutale et très intense (tête, ventre, dos)",
          "Nourrisson de moins de 3 mois avec de la fièvre (≥ 38 °C)",
          "Idées de mettre fin à ses jours avec un risque de passage à l'acte"
        ],
        options: [
          { libelle: "Oui, au moins un de ces signes", icone: "🚨", suivant: "r_urgence_vitale", style: "danger" },
          { libelle: "Non, aucun de ces signes", icone: "✅", suivant: "motif" }
        ]
      },

      // ───────────────────────────── 2. Motif
      motif: {
        type: "question",
        titre: "Quelle est la raison de votre demande ?",
        recherche: true,
        options: [
          { libelle: "Je suis malade", detail: "fièvre, douleur, nouveau symptôme…", icone: "🤒", suivant: "malade" },
          { libelle: "Mon enfant est malade", icone: "🧸", suivant: "enfant" },
          { libelle: "Plaie, brûlure, chute, entorse", icone: "🩹", suivant: "traumatisme" },
          { libelle: "Blessure de la main ou du poignet", icone: "✋", suivant: "main" },
          { libelle: "Renouvellement d'ordonnance", icone: "💊", suivant: "r_renouvellement" },
          { libelle: "Résultats d'examens", icone: "🧪", suivant: "resultats" },
          { libelle: "Suivi, certificat, papiers, vaccin", icone: "📋", suivant: "r_rdv" },
          { libelle: "Problème dentaire", icone: "🦷", suivant: "dentaire" },
          { libelle: "Souffrance psychologique", icone: "🫂", suivant: "psy" },
          { libelle: "Intoxication, produit avalé", icone: "☠️", suivant: "r_antipoison" },
          { libelle: "Trouver une pharmacie de garde", icone: "🏥", suivant: "r_pharmacie" }
        ]
      },

      // ───────────────────────────── Malade
      malade: {
        type: "question",
        titre: "Votre état nécessite-t-il d'être vu rapidement ?",
        texte: "En cas de doute, choisissez « Aujourd'hui ».",
        motsCles: ["malade", "fievre", "toux", "grippe", "covid", "angine", "otite", "gastro", "diarrhee", "vomissement",
          "mal", "douleur", "infection", "cystite", "brulure urinaire", "eruption", "bouton", "eczema", "zona", "rhume", "sinusite"],
        options: [
          {
            libelle: "Aujourd'hui", icone: "⏱️", suivant: "soins_non_programmes",
            detail: "fièvre mal supportée, douleur importante, aggravation, symptôme inquiétant"
          },
          {
            libelle: "Cela peut attendre quelques jours", icone: "📅", suivant: "r_rdv",
            detail: "symptôme ancien, stable, bien supporté"
          }
        ]
      },

      enfant: {
        type: "question",
        variante: "danger",
        titre: "Votre enfant présente-t-il l'un de ces signes ?",
        motsCles: ["enfant", "bebe", "nourrisson", "fils", "fille", "bronchiolite"],
        liste: [
          "Moins de 3 mois avec de la fièvre (≥ 38 °C)",
          "Mou, geignard, difficile à réveiller, inhabituellement calme",
          "Teint gris, pâle ou marbré, mains et pieds froids",
          "Respire vite ou avec difficulté, creuse son ventre ou le dessous des côtes",
          "Refuse de boire, ne mouille plus ses couches, vomit tout",
          "Taches rouges ou violacées qui ne s'effacent pas à la pression",
          "Convulsions"
        ],
        options: [
          { libelle: "Oui, au moins un de ces signes", icone: "🚨", suivant: "r_urgence_vitale", style: "danger" },
          { libelle: "Non", icone: "✅", suivant: "malade" }
        ]
      },

      // ───────────────────────────── Traumatologie
      traumatisme: {
        type: "question",
        titre: "De quel type de blessure s'agit-il ?",
        motsCles: ["plaie", "coupure", "blessure", "chute", "entorse", "cheville", "brulure", "fracture", "point de suture", "morsure", "chien"],
        options: [
          {
            libelle: "Accident grave ou choc à la tête inquiétant", icone: "🚑", suivant: "r_urgence_vitale", style: "danger",
            detail: "perte de connaissance, vomissements, chute de hauteur, accident de la route"
          },
          { libelle: "Blessure de la main ou du poignet", icone: "✋", suivant: "main" },
          {
            libelle: "Brûlure étendue ou à risque", icone: "🔥", suivant: "r_urgence_vitale", style: "danger",
            detail: "plus grande que la paume de la main, visage, mains, parties intimes, brûlure électrique ou chimique"
          },
          { libelle: "Œil : blessure, projection, baisse brutale de la vision", icone: "👁️", suivant: "r_appel15" },
          {
            libelle: "Plaie, petite brûlure, entorse, chute sans gravité", icone: "🩹", suivant: "soins_non_programmes",
            detail: "une plaie qui doit être suturée doit l'être idéalement dans les 6 heures"
          }
        ]
      },

      main: {
        type: "question",
        titre: "Blessure de la main : quelle est la situation ?",
        texte: "Une plaie de la main, même petite, peut toucher un tendon ou un nerf. Elle doit être examinée par un spécialiste.",
        motsCles: ["main", "doigt", "pouce", "poignet", "tendon", "ongle", "ecrasement", "sectionne", "coupe le doigt"],
        options: [
          {
            libelle: "Doigt ou partie de la main sectionné(e), saignement qui ne s'arrête pas", icone: "🚨",
            suivant: "r_main_amputation", style: "danger"
          },
          {
            libelle: "Coupure, morsure, écrasement, doigt qui ne bouge plus normalement", icone: "✋",
            suivant: "r_sos_main"
          }
        ]
      },

      // ───────────────────────────── Résultats d'examens
      resultats: {
        type: "question",
        titre: "Concernant vos résultats d'examens :",
        motsCles: ["resultat", "prise de sang", "analyse", "bilan", "radio", "scanner", "irm", "echographie", "laboratoire"],
        options: [
          {
            libelle: "Le laboratoire ou le radiologue m'a demandé de consulter en urgence", icone: "⚠️",
            suivant: "soins_non_programmes"
          },
          { libelle: "Je souhaite faire le point avec mon médecin", icone: "📅", suivant: "r_rdv" }
        ]
      },

      // ───────────────────────────── Dentaire
      dentaire: {
        type: "question",
        titre: "Avez-vous l'un de ces signes ?",
        motsCles: ["dent", "dentaire", "rage de dent", "abces", "gencive", "dentiste"],
        liste: [
          "Gonflement important du visage ou du cou",
          "Fièvre avec difficulté à ouvrir la bouche ou à avaler",
          "Traumatisme dentaire important (dent cassée ou expulsée après un choc)"
        ],
        options: [
          { libelle: "Oui", icone: "🚨", suivant: "r_appel15", style: "danger" },
          { libelle: "Non, c'est une douleur dentaire", icone: "🦷", suivant: "dentaire_horaire" }
        ]
      },

      dentaire_horaire: {
        type: "aiguillage",
        titre: "Selon le moment",
        branches: { ouvert: "r_dentiste", ferme: "r_dentiste", pdsa: "r_garde_dentaire", nuit: "r_dentaire_nuit" }
      },

      // ───────────────────────────── Psychologique
      psy: {
        type: "question",
        titre: "Comment décririez-vous la situation ?",
        motsCles: ["suicide", "idees noires", "deprime", "depression", "angoisse", "anxiete", "crise", "stress", "burn out", "panique", "mourir"],
        options: [
          { libelle: "Danger immédiat, risque de passage à l'acte", icone: "🚨", suivant: "r_appel15", style: "danger" },
          { libelle: "Idées suicidaires, besoin d'en parler maintenant", icone: "📞", suivant: "r_3114" },
          { libelle: "Souffrance, anxiété, épuisement, sans danger immédiat", icone: "🫂", suivant: "soins_psy" }
        ]
      },

      soins_psy: {
        type: "question",
        titre: "Souhaitez-vous être vu(e) rapidement ?",
        options: [
          { libelle: "Oui, aujourd'hui", icone: "⏱️", suivant: "soins_non_programmes" },
          { libelle: "Dans les prochains jours", icone: "📅", suivant: "r_rdv" }
        ]
      },

      // ───────────────────────────── Aiguillage horaire principal
      soins_non_programmes: {
        type: "aiguillage",
        titre: "Selon le moment",
        branches: { ouvert: "r_secretariat", ferme: "r_cabinet_ferme", pdsa: "r_mmg", nuit: "r_nuit" }
      },

      // ═════════════════════════════ RÉSULTATS
      r_urgence_vitale: {
        type: "resultat",
        niveau: "rouge",
        titre: "Appelez le 15 immédiatement",
        texte: "Ces signes peuvent traduire une urgence vitale. Le SAMU doit être prévenu <strong>sans attendre</strong>. Ne vous rendez pas au cabinet et ne prenez pas le volant.",
        motsCles: ["infarctus", "avc", "inconscient", "respire plus", "etouffe", "poitrine", "thorax", "paralysie", "convulsion", "hemorragie", "anaphylaxie", "oedeme de quincke", "purpura"],
        actions: [
          appel15,
          { type: "tel", valeur: "112", libelle: "112 — numéro d'urgence européen" },
          { type: "tel", valeur: "114", libelle: "114 — par SMS (personnes sourdes, malentendantes ou ne pouvant pas parler)", sms: true }
        ],
        conseils: [
          "Restez auprès de la personne et suivez les consignes du médecin régulateur.",
          "Ne donnez rien à boire ni à manger.",
          "Préparez les ordonnances, la carte Vitale et la liste des traitements.",
          "Facilitez l'accès des secours : ouvrez la porte, allumez l'extérieur, attachez les animaux."
        ]
      },

      r_appel15: {
        type: "resultat",
        niveau: "rouge",
        titre: "Appelez le 15",
        texte: "Cette situation nécessite un avis médical urgent. Le médecin régulateur du 15 vous orientera vers la structure adaptée.",
        actions: [appel15, { type: "tel", valeur: "114", libelle: "114 — par SMS", sms: true }]
      },

      r_secretariat: {
        type: "resultat",
        niveau: "orange",
        titre: "Appelez le secrétariat du cabinet",
        texte: "Le cabinet est ouvert. Des <strong>créneaux d'urgence</strong> sont réservés chaque jour pour les patients qui doivent être vus rapidement : appelez-nous plutôt que de réserver en ligne.",
        actions: [appelCabinet],
        conseils: [
          "Indiquez au secrétariat qu'il s'agit d'une demande pour le jour même.",
          "Si votre état s'aggrave avant la consultation, appelez le 15."
        ]
      },

      r_cabinet_ferme: {
        type: "resultat",
        niveau: "orange",
        titre: "Le cabinet est fermé pour le moment",
        texte: "Réouverture prévue : <strong>{prochaineOuverture}</strong>. Vous pourrez alors appeler le secrétariat pour un créneau d'urgence.<br><br>Si votre état <strong>ne peut pas attendre</strong>, appelez le 15 : un médecin évaluera votre situation.",
        actions: [appel15, appelCabinet]
      },

      r_mmg: {
        type: "resultat",
        niveau: "orange",
        titre: "Permanence des soins : appelez le 15",
        texte: `Le cabinet est fermé, mais un médecin de garde peut vous recevoir à la <strong>${C.mmg.nom}</strong>.<br><br>L'accès se fait <strong>uniquement après appel au 15</strong> : le médecin régulateur évalue votre situation et vous donne, si besoin, un rendez-vous à la maison médicale de garde.`,
        actions: [appel15].concat(C.mmg.carte ? [{ type: "lien", valeur: C.mmg.carte, libelle: "Itinéraire vers la MMG" }] : []),
        infos: [
          ["Adresse", C.mmg.adresse],
          ["Horaires", C.mmg.horairesTexte]
        ],
        conseils: [
          "Ne vous présentez pas à la maison médicale de garde sans appel préalable au 15.",
          "Munissez-vous de votre carte Vitale, de vos ordonnances et de votre carnet de santé.",
          "Les urgences hospitalières sont réservées aux situations graves."
        ]
      },

      r_nuit: {
        type: "resultat",
        niveau: "orange",
        titre: "La nuit : appelez le 15",
        texte: "Entre minuit et 8 h, il n'y a pas de consultation de médecine générale de garde. Le médecin régulateur du 15 évaluera votre situation et décidera de la meilleure prise en charge (conseil, attente du matin, envoi de secours…).",
        actions: [appel15],
        conseils: [
          "Si votre état peut attendre, le cabinet rouvre {prochaineOuverture}."
        ]
      },

      r_rdv: {
        type: "resultat",
        niveau: "vert",
        titre: "Prenez rendez-vous",
        texte: "Votre demande relève d'une consultation programmée. Réservez directement en ligne, ou appelez le secrétariat pendant les heures d'ouverture.",
        motsCles: ["rendez-vous", "rdv", "consultation", "certificat", "sport", "vaccin", "suivi", "bilan", "arret de travail", "papier", "dossier"],
        actions: [doctolib, appelCabinet]
      },

      r_renouvellement: {
        type: "resultat",
        niveau: "vert",
        titre: "Renouvellement d'ordonnance",
        texte: "Prenez rendez-vous <strong>avant la fin de votre traitement</strong>, sur Doctolib ou par téléphone.",
        motsCles: ["renouvellement", "ordonnance", "traitement", "medicament", "pilule"],
        actions: [doctolib, appelCabinet],
        conseils: [
          "Pensez à anticiper : prenez rendez-vous environ 2 semaines avant la fin de votre ordonnance.",
          "Si vous allez manquer d'un traitement chronique, votre pharmacien peut, dans certains cas, vous délivrer une boîte de dépannage."
        ]
      },

      r_main_amputation: {
        type: "resultat",
        niveau: "rouge",
        titre: "Appelez le 15 immédiatement",
        texte: "Comprimez fortement la plaie avec un linge propre pour arrêter le saignement.",
        actions: [appel15],
        conseils: [
          "Conservez le fragment sectionné : enveloppez-le dans une compresse ou un linge propre, placez-le dans un sachet plastique fermé, puis posez ce sachet sur de la glace.",
          "Ne mettez jamais le fragment directement au contact de la glace ou dans l'eau.",
          "Ne mangez pas, ne buvez pas, ne fumez pas (une chirurgie est possible).",
          "Retirez bagues, bracelets et montre."
        ]
      },

      r_sos_main: {
        type: "resultat",
        niveau: "orange",
        titre: `Urgence de la main : ${C.sosMain.nom || "consultez un centre SOS Main"}`,
        texte: `Les plaies de la main doivent être explorées par un chirurgien spécialisé, idéalement <strong>dans les 6 heures</strong>. ${C.sosMain.telephone ? "Appelez le centre avant de vous déplacer. En cas de doute ou si vous ne pouvez pas le joindre, appelez le 15." : "Rendez-vous au centre SOS Main ; en cas de doute, ou la nuit, appelez d'abord le 15."}`,
        actions: (C.sosMain.telephone ? [{ type: "tel", valeur: C.sosMain.telephone, libelle: `Appeler ${C.sosMain.nom}` }] : []).concat([appel15]),
        infos: [
          ["Centre", C.sosMain.nom],
          ["Adresse", C.sosMain.adresse]
        ],
        conseils: [
          "Ne mangez pas, ne buvez pas, ne fumez pas avant d'avoir vu le chirurgien.",
          "Retirez bagues et bracelets avant que la main ne gonfle.",
          "Couvrez la plaie avec un pansement propre et surélevez la main.",
          "Morsure (chien, chat…) : consultez le jour même, même pour une petite plaie."
        ]
      },

      r_dentiste: {
        type: "resultat",
        niveau: "vert",
        titre: "Contactez votre chirurgien-dentiste",
        texte: "Les urgences dentaires sont prises en charge par votre dentiste. S'il est indisponible, son répondeur indique généralement la conduite à tenir.",
        actions: [],
        conseils: ["Un antalgique simple (paracétamol) peut soulager en attendant, en respectant les doses."]
      },

      r_garde_dentaire: {
        type: "resultat",
        niveau: "orange",
        titre: "Garde dentaire",
        texte: C.gardeDentaire.texte,
        actions: [{ type: "tel", valeur: C.gardeDentaire.telephone, libelle: `Appeler le ${C.gardeDentaire.telephone}` }],
        conseils: ["Un antalgique simple (paracétamol) peut soulager en attendant, en respectant les doses."]
      },

      r_dentaire_nuit: {
        type: "resultat",
        niveau: "bleu",
        titre: "Douleur dentaire la nuit",
        texte: "Il n'y a pas de garde dentaire la nuit. Prenez un antalgique simple et contactez votre dentiste dès son ouverture. Si la douleur est insupportable ou si un gonflement apparaît, appelez le 15.",
        actions: [appel15]
      },

      r_3114: {
        type: "resultat",
        niveau: "rouge",
        titre: "Appelez le 3114",
        texte: "Le <strong>3114</strong> est le numéro national de prévention du suicide : gratuit, confidentiel, 24 h/24 et 7 j/7. Des professionnels formés vous écoutent et vous aident. En cas de danger immédiat, appelez le 15.",
        actions: [{ type: "tel", valeur: "3114", libelle: "Appeler le 3114" }, appel15],
        conseils: ["Ne restez pas seul(e) : appelez un proche de confiance.", "Éloignez les médicaments et objets dangereux."]
      },

      r_antipoison: {
        type: "resultat",
        niveau: "rouge",
        titre: "Intoxication",
        texte: `Si la personne présente des <strong>symptômes</strong> (malaise, somnolence, gêne respiratoire, convulsions…), appelez le <strong>15</strong>.<br><br>Sans symptôme, demandez conseil au <strong>${C.antipoison.nom}</strong> (24 h/24).`,
        motsCles: ["intoxication", "avale", "ingestion", "produit menager", "javel", "champignon", "surdosage", "monoxyde"],
        actions: [appel15, { type: "tel", valeur: C.antipoison.telephone, libelle: `${C.antipoison.nom} — ${C.antipoison.telephone}` }],
        conseils: [
          "Ne faites pas vomir et ne donnez ni lait ni eau.",
          "Gardez l'emballage du produit pour le décrire.",
          "Suspicion de monoxyde de carbone (maux de tête de plusieurs personnes, chauffage) : aérez, sortez et appelez le 15 ou le 18."
        ]
      },

      r_pharmacie: {
        type: "resultat",
        niveau: "bleu",
        titre: "Pharmacie de garde",
        texte: "Pour connaître la pharmacie de garde la plus proche, appelez le <strong>3237</strong> (service payant) ou consultez le site.",
        motsCles: ["pharmacie", "pharmacien", "garde pharmacie"],
        actions: [
          { type: "tel", valeur: "3237", libelle: "Appeler le 3237" },
          { type: "lien", valeur: "https://www.3237.fr/", libelle: "Consulter 3237.fr" }
        ],
        conseils: ["La nuit, les modalités d'accès à la pharmacie de garde peuvent varier : renseignez-vous auprès du 3237.", "Munissez-vous de votre ordonnance et de votre carte Vitale."]
      }
    }
  };
};
