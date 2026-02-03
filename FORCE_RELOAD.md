# Instructions pour forcer le rechargement des modifications

Si les modifications ne s'appliquent pas, suivez ces étapes :

## 1. Arrêter le serveur de développement
Appuyez sur `Ctrl+C` dans le terminal où le serveur Next.js tourne.

## 2. Nettoyer le cache
```bash
cd Sauti_wanyonge_frontend
npm run clean:win
```

Ou manuellement :
```powershell
# Supprimer le cache Next.js
if (Test-Path .next) { Remove-Item -Recurse -Force .next }

# Supprimer le cache node_modules
if (Test-Path node_modules\.cache) { Remove-Item -Recurse -Force node_modules\.cache }
```

## 3. Redémarrer le serveur
```bash
npm run dev
```

## 4. Vider le cache du navigateur
- Appuyez sur `Ctrl+Shift+R` (Windows/Linux) ou `Cmd+Shift+R` (Mac) pour forcer le rechargement
- Ou ouvrez les outils de développement (F12) > Onglet Network > Cochez "Disable cache"

## 5. Vérifier les modifications
Les modifications suivantes doivent être visibles :

### ✅ Chrono au format MM:SS / MM:SS
- Sur les boutons : "Enregistrer audio (max 01:00)" et "Enregistrer vidéo (max 00:35)"
- Pendant l'enregistrement : "Arrêter (00:15 / 01:00)" pour audio, "Arrêter (00:10 / 00:35)" pour vidéo

### ✅ Affichage automatique des enregistrements
- Dès que l'utilisateur arrête l'enregistrement (même avant la fin), l'enregistrement apparaît automatiquement en bas
- Plus besoin de cliquer sur une icône

### ✅ Design audio moderne
- Fond avec dégradé bleu/indigo/violet
- Waveform animé en arrière-plan
- Icône microphone dans un cercle avec dégradé
- Lecteur audio dans un conteneur avec backdrop blur
- Indicateur "Enregistrement prêt" avec point animé

## Si les modifications ne s'appliquent toujours pas

1. Vérifiez que le fichier `step-2.tsx` contient bien les modifications
2. Vérifiez la console du navigateur (F12) pour des erreurs
3. Vérifiez les logs du serveur Next.js pour des erreurs de compilation
4. Essayez de redémarrer complètement l'ordinateur (parfois nécessaire pour Windows)
