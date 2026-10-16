/*
 * Moteur de l'outil d'orientation : parcourt l'arbre de décision (arbre.js)
 * en tenant compte du moment (horaires.js) et des paramètres du cabinet (config.js).
 */
(function () {
  "use strict";

  const C = window.CABINET;
  const ARBRE = window.construireArbre(C);
  const H = window.Horaires;

  const CRENEAUX = {
    auto: "Maintenant",
    ouvert: "Semaine, cabinet ouvert",
    ferme: "Semaine, cabinet fermé (avant 20 h)",
    pdsa: "Soir, samedi après-midi, dimanche, férié",
    nuit: "Nuit (minuit – 8 h)"
  };
  const LIBELLES_CRENEAU = {
    ouvert: "cabinet ouvert",
    ferme: "cabinet fermé",
    pdsa: "permanence des soins (garde)",
    nuit: "nuit profonde"
  };

  const etat = { pile: [ARBRE.depart], choix: [], creneauForce: "auto" };

  const $ = (sel) => document.querySelector(sel);
  const el = (tag, attrs = {}, ...enfants) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") n.className = v;
      else if (k === "html") n.innerHTML = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    }
    for (const e of enfants.flat(Infinity)) if (e != null) n.append(e);
    return n;
  };

  // ───────────────────────────── Moment de la demande
  function creneauCourant() {
    return etat.creneauForce === "auto" ? H.creneau(new Date(), C) : etat.creneauForce;
  }

  function texteProchaineOuverture() {
    const d = H.prochaineOuverture(new Date(), C);
    return d ? H.decrire(d) : "prochainement";
  }

  const completer = (texte) => texte.replace(/\{prochaineOuverture\}/g, texteProchaineOuverture());

  function afficherContexte() {
    const zone = $("#moment");
    const c = creneauCourant();
    const auto = etat.creneauForce === "auto";
    const select = el("select", { id: "choix-creneau", "aria-label": "Moment de la demande" },
      Object.entries(CRENEAUX).map(([v, l]) => {
        const o = el("option", { value: v }, l);
        if (v === etat.creneauForce) o.selected = true;
        return o;
      }));
    select.addEventListener("change", () => {
      etat.creneauForce = select.value;
      afficher();
    });
    zone.replaceChildren(
      el("span", { class: "moment-texte" },
        auto ? `${H.decrireMaintenant(new Date())} · ` : "Situation simulée · ",
        el("strong", {}, LIBELLES_CRENEAU[c])),
      el("label", { class: "moment-choix" }, "Pour quand ?", select)
    );
  }

  // ───────────────────────────── Navigation
  function resoudre(id) {
    let noeud = ARBRE.noeuds[id];
    while (noeud && noeud.type === "aiguillage") {
      id = noeud.branches[creneauCourant()];
      noeud = ARBRE.noeuds[id];
    }
    if (!noeud) throw new Error(`Nœud inconnu : ${id}`);
    return [id, noeud];
  }

  // L'historique du navigateur est un plus (bouton retour du téléphone) ;
  // il peut être indisponible dans certaines iframes.
  function memoriser(remplacer = false) {
    try {
      history[remplacer ? "replaceState" : "pushState"]({ pile: etat.pile.slice(), choix: etat.choix.slice() }, "");
    } catch (e) { /* navigation interne seulement */ }
  }

  function aller(id, libelleChoix) {
    etat.pile.push(id);
    etat.choix.push(libelleChoix);
    memoriser();
    afficher(true);
  }

  function retour() {
    etat.pile.pop();
    etat.choix.pop();
    memoriser(true);
    afficher(true);
  }

  function recommencer() {
    etat.pile = [ARBRE.depart];
    etat.choix = [];
    memoriser();
    afficher(true);
  }

  window.addEventListener("popstate", (e) => {
    if (e.state && e.state.pile) {
      etat.pile = e.state.pile;
      etat.choix = e.state.choix;
    } else {
      etat.pile = [ARBRE.depart];
      etat.choix = [];
    }
    afficher(true);
  });

  // ───────────────────────────── Recherche en texte libre
  // Libellé lisible d'un nœud : celui de la première réponse qui y mène, sinon son titre.
  const libelles = {};
  for (const n of Object.values(ARBRE.noeuds)) {
    for (const o of n.options || []) if (!(o.suivant in libelles)) libelles[o.suivant] = o.libelle;
  }

  const normaliser = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ");

  function rechercher(saisie) {
    const texte = ` ${normaliser(saisie)} `;
    if (texte.trim().length < 3) return [];
    const resultats = [];
    for (const [id, n] of Object.entries(ARBRE.noeuds)) {
      if (!n.motsCles) continue;
      const score = n.motsCles.filter((m) => texte.includes(normaliser(m).trim())).length;
      if (score) resultats.push({ id, n, score });
    }
    // Une urgence vitale détectée passe toujours en premier.
    return resultats.sort((a, b) =>
      (b.n.niveau === "rouge") - (a.n.niveau === "rouge") || b.score - a.score).slice(0, 3);
  }

  function blocRecherche() {
    const sortie = el("div", { class: "suggestions", "aria-live": "polite" });
    const champ = el("input", {
      type: "search", id: "recherche", autocomplete: "off",
      placeholder: "Ex. : coupure au doigt, fièvre de mon fils, ordonnance…"
    });
    champ.addEventListener("input", () => {
      const r = rechercher(champ.value);
      sortie.replaceChildren(...r.map(({ id, n }) =>
        el("button", {
          class: `suggestion ${n.niveau === "rouge" ? "suggestion-danger" : ""}`,
          onclick: () => aller(id, `Recherche : « ${champ.value.trim()} »`)
        }, `→ ${n.niveau === "rouge" ? n.titre : libelles[id] || n.titre}`)));
    });
    return el("div", { class: "recherche" },
      el("label", { for: "recherche" }, "Ou décrivez votre situation en quelques mots :"), champ, sortie);
  }

  // ───────────────────────────── Rendu
  function rendreQuestion(n, etape) {
    const bloc = el("section", { class: `question ${n.variante === "danger" ? "question-danger" : ""}` },
      el("header", { class: "rubrique-tete" },
        el("span", { class: "numero", "aria-hidden": "true" }, String(etape)),
        el("h2", { tabindex: "-1" }, n.titre)));
    if (n.texte) bloc.append(el("p", { class: "aide" }, n.texte));
    if (n.liste) bloc.append(el("ul", { class: "liste-signes" }, n.liste.map((l) => el("li", {}, l))));
    bloc.append(el("div", { class: "options" }, n.options.map((o) =>
      el("button", { class: `option ${o.style === "danger" ? "option-danger" : ""}`, onclick: () => aller(o.suivant, o.libelle) },
        el("span", { class: "option-texte" },
          el("span", { class: "option-libelle" }, o.libelle),
          o.detail ? el("span", { class: "option-detail" }, o.detail) : null),
        el("span", { class: "fleche", "aria-hidden": "true" }, "→")))));
    if (n.recherche) bloc.append(blocRecherche());
    return bloc;
  }

  function rendreAction(a) {
    if (a.type === "tel") {
      const num = a.valeur.replace(/[^\d+]/g, "");
      return el("a", { class: `action ${num === "15" || num === "112" ? "action-urgence" : ""}`, href: `${a.sms ? "sms" : "tel"}:${num}` },
        el("span", {}, a.libelle), el("span", { class: "fleche", "aria-hidden": "true" }, a.sms ? "SMS" : "☎"));
    }
    return el("a", { class: "action action-lien", href: a.valeur, target: "_blank", rel: "noopener" },
      el("span", {}, a.libelle), el("span", { class: "fleche", "aria-hidden": "true" }, "↗"));
  }

  function rendreResultat(n) {
    const bloc = el("section", { class: `resultat niveau-${n.niveau}` },
      el("p", { class: "resultat-etiquette" }, {
        rouge: "Urgence", orange: "À voir rapidement", vert: "Consultation programmée", bleu: "Information"
      }[n.niveau]),
      el("h2", { tabindex: "-1" }, n.titre),
      el("p", { class: "resultat-texte", html: completer(n.texte) }));
    if (n.actions && n.actions.length) bloc.append(el("div", { class: "actions" }, n.actions.map(rendreAction)));
    const infos = (n.infos || []).filter(([, v]) => v);
    if (infos.length) bloc.append(el("dl", { class: "infos" }, infos.map(([k, v]) => [el("dt", {}, k), el("dd", {}, v)])));
    if (n.conseils) {
      bloc.append(el("h3", {}, "Conseils"),
        el("ul", { class: "conseils" }, n.conseils.map((c) => el("li", { html: completer(c) }))));
    }
    bloc.append(el("div", { class: "pied-resultat" },
      el("button", { class: "bouton-lien", onclick: recommencer }, "Nouvelle recherche"),
      el("button", { class: "bouton-lien bouton-imprimer", onclick: () => window.print() }, "Imprimer cette conduite à tenir")));
    return bloc;
  }

  function rendreFilAriane() {
    if (!etat.choix.length) return null;
    return el("ol", { class: "fil", "aria-label": "Vos réponses" }, etat.choix.map((c) => el("li", {}, c)));
  }

  function afficher(focus = false) {
    afficherContexte();
    const [, noeud] = resoudre(etat.pile[etat.pile.length - 1]);
    const zone = $("#etape");
    const nav = el("div", { class: "navigation" },
      etat.pile.length > 1 ? el("button", { class: "bouton-lien", onclick: retour }, "← Question précédente") : null,
      etat.pile.length > 1 ? el("button", { class: "bouton-lien", onclick: recommencer }, "Recommencer") : null);
    zone.replaceChildren(...[nav, rendreFilAriane(),
      noeud.type === "resultat" ? rendreResultat(noeud) : rendreQuestion(noeud, etat.pile.length)].filter(Boolean));
    if (focus) {
      const titre = zone.querySelector("h2");
      if (titre) titre.focus();
      if (zone.getBoundingClientRect().top < 0) zone.scrollIntoView({ block: "start" });
    }
  }

  // ───────────────────────────── Démarrage
  document.querySelectorAll("[data-cabinet]").forEach((n) => { n.textContent = C[n.dataset.cabinet]; });
  document.querySelectorAll("[data-cabinet-tel]").forEach((n) => { n.href = `tel:${C.telephone.replace(/[^\d+]/g, "")}`; });
  document.querySelectorAll("[data-cabinet-href]").forEach((n) => { n.href = C[n.dataset.cabinetHref]; });
  memoriser(true);
  afficher();
  setInterval(afficherContexte, 60 * 1000);
})();
