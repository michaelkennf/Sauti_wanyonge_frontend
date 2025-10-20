# Sauti ya Wayonge - Interface Enquêteurs

## 🎯 Vue d'ensemble

Cette application est une interface spécialisée pour les enquêteurs de la plateforme Sauti ya Wayonge, permettant la collecte d'enquêtes avec authentification biométrique et fonctionnement hors ligne.

## ✨ Fonctionnalités principales

### 🔐 Authentification double
- **Connexion classique** : Email + mot de passe
- **Authentification biométrique** : Empreinte digitale ou reconnaissance faciale via WebAuthn
- **Revalidation obligatoire** avant soumission des enquêtes

### 📱 Mode hors ligne (Offline-First)
- **Service Worker** pour le cache des ressources
- **IndexedDB** pour le stockage local des données
- **Synchronisation automatique** dès le retour en ligne
- **Interface adaptative** selon l'état de connexion

### 🎤 Capture multimédia
- **Enregistrement audio** : Maximum 35 secondes
- **Enregistrement vidéo** : Maximum 35 secondes  
- **Upload d'images** : JPG, PNG, GIF
- **Upload de documents** : PDF, DOC, DOCX

### 📍 Géolocalisation automatique
- **Détection automatique** de la position
- **Informations détaillées** : Pays, province, zone
- **Précision** et adresse complète

### 👥 Gestion des comptes
- **Interface admin** pour créer/gérer les enquêteurs
- **Gestion des ONG** et leurs zones d'intervention
- **Enregistrement biométrique** des enquêteurs

## 🚀 Installation et configuration

### Prérequis
- Node.js 18+ 
- npm ou pnpm
- Navigateur moderne avec support WebAuthn

### Installation
```bash
# Installer les dépendances
pnpm install

# Démarrer en mode développement
pnpm dev

# Build pour production
pnpm build
pnpm start
```

### Configuration PWA
L'application est configurée comme PWA avec :
- **Service Worker** automatique
- **Cache stratégique** des ressources
- **Installation** sur appareils mobiles
- **Mode hors ligne** complet

## 📋 Structure du formulaire d'enquête

### Étape 1 : Identité du bénéficiaire
- Choix anonyme ou identifié
- Informations de contact (si non anonyme)
- Données démographiques

### Étape 2 : Informations de l'incident
- Type d'incident (viol, harcèlement, etc.)
- Date et heure
- Lieu précis
- Description détaillée
- Témoins et auteurs présumés

### Étape 3 : Preuves et documentation
- Enregistrement audio/vidéo direct
- Upload de fichiers multimédias
- Gestion des preuves par catégorie

### Étape 4 : Services d'accompagnement
- Besoins identifiés de la victime
- Services requis (médical, juridique, etc.)

### Étape 5 : Récapitulatif et soumission
- Vérification des informations
- Commentaire obligatoire de l'enquêteur
- Soumission avec authentification biométrique

## 🔧 Hooks personnalisés

### `useBiometricAuth`
```typescript
const { 
  isAuthenticated, 
  isLoading, 
  error,
  checkBiometricSupport,
  registerBiometric,
  authenticateBiometric 
} = useBiometricAuth()
```

### `useOfflineSync`
```typescript
const { 
  isOnline, 
  isSyncing, 
  pendingItems,
  saveComplaintOffline,
  syncPendingItems 
} = useOfflineSync()
```

### `useMediaRecorder`
```typescript
const audioRecorder = useMediaRecorder({ 
  maxDuration: 35, 
  audioOnly: true 
})
```

### `useGeolocation`
```typescript
const { 
  getCurrentLocation, 
  isLoading, 
  error 
} = useGeolocation()
```

## 🌐 API Endpoints

### Authentification
- `POST /api/auth/investigator-login` - Connexion enquêteur
- `POST /api/auth/webauthn/assertion` - Vérification biométrique

### Plaintes
- `POST /api/plaintes` - Soumission en ligne
- `POST /api/plaintes/offline-sync` - Synchronisation hors ligne

### Upload
- `POST /api/uploads/presign` - URL de téléchargement
- `POST /api/uploads/complete` - Finalisation upload

## 📱 Pages principales

### `/auth/investigator-login`
Page de connexion avec authentification biométrique

### `/enqueteur/formulaire`
Formulaire d'enquête principal (5 étapes)

### `/admin/investigators`
Gestion des comptes enquêteurs et ONG

### `/ong/plaintes`
Interface ONG pour le suivi des plaintes

### `/test-offline`
Page de test des fonctionnalités hors ligne

## 🔒 Sécurité

### Chiffrement local
- **Données sensibles** chiffrées avec AES-GCM
- **Clés locales** générées par le navigateur
- **Aucune donnée** stockée en clair

### Authentification biométrique
- **WebAuthn** pour la sécurité maximale
- **Fallback OTP** si biométrie indisponible
- **Revalidation** obligatoire avant soumission

### Conformité
- **Consentement** requis pour capture biométrique
- **Logs d'audit** locaux et serveur
- **Protection** contre soumission multiple

## 🧪 Tests

### Test de compatibilité
```bash
# Accéder à la page de test
http://localhost:3000/test-offline
```

### Test hors ligne
1. Ouvrir les outils de développement (F12)
2. Aller dans l'onglet "Application" > "Service Workers"
3. Cocher "Offline" pour simuler le mode hors ligne
4. Tester la création d'une enquête
5. Décocher "Offline" pour tester la synchronisation

## 📊 Monitoring

### Service Worker
- **Logs** dans la console du navigateur
- **État du cache** visible dans DevTools
- **Synchronisation** en arrière-plan

### IndexedDB
- **Données stockées** : Plaintes, fichiers média, identifiants
- **Taille** : Surveillée automatiquement
- **Nettoyage** : Données synchronisées supprimées

## 🚨 Dépannage

### Problèmes courants

#### Authentification biométrique échoue
- Vérifier que le navigateur supporte WebAuthn
- S'assurer que l'appareil a un capteur biométrique
- Tester avec un autre navigateur

#### Synchronisation ne fonctionne pas
- Vérifier la connexion internet
- Vider le cache du navigateur
- Redémarrer le Service Worker

#### Enregistrement audio/vidéo échoue
- Vérifier les permissions microphone/caméra
- Tester avec un autre navigateur
- Vérifier que MediaRecorder est supporté

### Logs utiles
```javascript
// Dans la console du navigateur
console.log('Service Worker:', navigator.serviceWorker)
console.log('IndexedDB:', window.indexedDB)
console.log('WebAuthn:', window.PublicKeyCredential)
console.log('MediaRecorder:', window.MediaRecorder)
```

## 📈 Performance

### Optimisations
- **Lazy loading** des composants
- **Code splitting** par route
- **Cache intelligent** des ressources
- **Compression** des données

### Métriques
- **Temps de chargement** : < 3s
- **Taille du cache** : ~50MB
- **Synchronisation** : < 30s pour 100 plaintes

## 🔄 Mise à jour

### Service Worker
- **Mise à jour automatique** en arrière-plan
- **Notification** de nouvelle version
- **Installation** sans interruption

### Données
- **Migration automatique** des données locales
- **Rétrocompatibilité** assurée
- **Sauvegarde** avant mise à jour

## 📞 Support

### Documentation technique
- **Code source** : Commenté en français
- **Types TypeScript** : Définitions complètes
- **Tests** : Couverture des cas critiques

### Contact
- **Développement** : Équipe technique Sauti ya Wayonge
- **Support** : support@sautiyawayonge.cd
- **Urgences** : +243 XXX XXX XXX

---

## 📄 Licence

© 2024 Sauti ya Wayonge - Tous droits réservés
Application développée pour la République Démocratique du Congo
