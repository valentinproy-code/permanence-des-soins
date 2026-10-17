# Où consulter ? — Outil d'orientation des patients

Outil du cabinet médical d'Arzon (Dr Valentin PROY), aux couleurs de [valentinproy.fr](https://valentinproy.fr/).

Outil web interactif qui guide le patient, par une suite de questions simples, vers **la bonne
réponse au bon moment** : appel au 15, créneau d'urgence au cabinet, Maison Médicale de Garde
de Sarzeau, SOS Main, prise de rendez-vous Doctolib…

- **Sécurité d'abord** : la première question repère systématiquement les signes d'urgence vitale → **15**.
  Un bandeau « Appelez le 15 » reste visible en permanence.
- **Tient compte du moment** : jour, heure, dimanches, **jours fériés** (calculés automatiquement, Pâques
  compris), ponts, congés du cabinet. Le patient peut aussi simuler un autre moment (« Pour quand ? »).
- **Recherche en texte libre** : « coupure au doigt », « fièvre de mon fils »… propose directement le bon parcours.
- **Boutons d'action** : appel en un clic (`tel:`), SMS au 114, lien Doctolib, impression de la conduite à tenir.
- **Organigramme** généré automatiquement (`organigramme.html`) à partir des mêmes données : idéal pour
  l'équipe et le secrétariat, et toujours à jour.
- 100 % statique (HTML/CSS/JS), sans dépendance, sans cookie, **aucune donnée patient collectée**.
  Mobile, mode sombre, accessible au clavier et aux lecteurs d'écran.

## Logique d'orientation

| Situation | Moment | Orientation |
|---|---|---|
| Signe d'urgence vitale | à tout moment | **15** immédiatement (112, 114 par SMS) |
| Malade, doit être vu aujourd'hui | cabinet ouvert | Secrétariat → créneaux d'urgence |
| | semaine, cabinet fermé (avant 20 h) | Réouverture calculée ; si ça ne peut pas attendre → 15 |
| | soir 20 h–24 h, samedi après-midi, dimanche, férié, pont | **15** → régulation → MMG de Sarzeau |
| | nuit 0 h–8 h | **15** |
| Malade, peut attendre / renouvellement / résultats / papiers | — | Doctolib ou téléphone |
| Plaie de la main | — | SOS Main (15 si amputation ou hémorragie) |
| Dentaire, psychologique (3114), intoxication (centre antipoison), pharmacie de garde (3237) | — | parcours dédiés |

## ✏️ Personnaliser

1. **`assets/config.js`** — coordonnées et horaires du cabinet (déjà renseignés pour Arzon). Restent « À COMPLÉTER » :
   horaires de la MMG de Sarzeau, numéro direct de SOS Main (facultatif) ; à tenir à jour : congés et ponts.
2. **`assets/arbre.js`** — l'arbre de décision (questions, réponses, conduites à tenir). Chaque nœud est
   documenté en tête de fichier. Après modification, lancer les tests : ils vérifient qu'aucune réponse
   ne mène dans le vide et que chaque réponse « danger » aboutit bien au 15.

```bash
npm test
```

## 🚀 Mettre en ligne

**GitHub Pages** : *Settings → Pages → Deploy from a branch* → branche `main`, dossier `/ (root)`.
L'outil sera disponible sur `https://<utilisateur>.github.io/permanence-des-soins/`.

**Intégration dans le site du cabinet** (WordPress, Wix, etc.) avec un bloc HTML :

```html
<iframe src="https://<utilisateur>.github.io/permanence-des-soins/"
        style="width:100%;height:900px;border:0" title="Où consulter ?"></iframe>
```

Pour tester en local : ouvrir `index.html` dans un navigateur.

## ⚠️ Avertissement

Cet outil aide à l'orientation et ne remplace pas un avis médical. Les contenus médicaux doivent être
relus et validés par les médecins du cabinet avant publication.

## Pistes d'évolution

- Parcours supplémentaires : grossesse, personne âgée/chute à domicile, demande de visite à domicile, certificat de décès.
- Version multilingue (anglais pour les touristes de la presqu'île en été).
- Statistiques anonymes d'usage (sans cookie) pour adapter l'offre de créneaux.

## Crédits

Police Caveat (SIL Open Font License 1.1), hébergée localement dans `assets/fonts/` : aucune requête vers un service tiers.
