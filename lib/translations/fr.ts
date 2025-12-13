// Traductions françaises (langue par défaut)
export const fr = {
  // Authentification
  auth: {
    loginTitle: "Connexion",
    loginDescription: "Connectez-vous à votre compte pour accéder à la plateforme",
    loginButton: "Se connecter",
    registerLink: "Créer un compte",
    noAccount: "Pas encore de compte ?",
    demoAccounts: "Comptes de démonstration",
    demoDescription: "Cliquez sur un compte pour vous connecter automatiquement",
    investigatorLogin: "Connexion Enquêteur (Biométrie)"
  },

  // Comment ça marche
  howItWorks: {
    title: "Comment ça marche ?",
    subtitle: "Un processus simple et sécurisé en 3 étapes pour vous accompagner",
    step1: {
      title: "1. Déposez votre plainte",
      description: "Remplissez le formulaire de manière anonyme ou identifiée. Vos données sont cryptées et sécurisées."
    },
    step2: {
      title: "2. Recevez de l'assistance",
      description: "Notre chatbot IA vous guide 24h/24 vers les ressources médicales, juridiques et psychologiques."
    },
    step3: {
      title: "3. Suivez votre dossier",
      description: "Consultez l'évolution de votre plainte en temps réel avec votre code unique et confidentiel."
    }
  },

  // Cartes à propos
  aboutCards: {
    title: "Comment nous vous aidons",
    subtitle: "Une plateforme complète pour signaler, obtenir de l'aide et suivre votre dossier en toute sécurité.",
    feature1: {
      title: "Dépôt de plainte anonyme",
      description: "Signalez en toute confidentialité sans révéler votre identité. Votre sécurité est notre priorité."
    },
    feature2: {
      title: "Assistance via chatbot IA",
      description: "Un assistant virtuel disponible 24h/24 pour répondre à vos questions et vous guider."
    },
    feature3: {
      title: "Orientation vers les services",
      description: "Accédez rapidement aux centres de santé, services juridiques et ONG près de chez vous."
    },
    feature4: {
      title: "Suivi confidentiel",
      description: "Suivez l'évolution de votre dossier en temps réel avec un code sécurisé unique."
    },
    feature5: {
      title: "Engagement du gouvernement",
      description: "Une initiative nationale soutenue par le gouvernement RDC, FONAREV et les Nations Unies."
    }
  },

  // Chatbot
  chatbot: {
    title: "Assistant virtuel IA",
    subtitle: "Disponible 24h/24 pour répondre à vos questions et vous orienter vers les services appropriés."
  },

  // Plaintes
  complaint: {
    step1: {
      title: "Choix d'anonymat",
      description: "Choisissez si vous souhaitez rester anonyme ou être contacté par nos services.",
      anonymous: "Je veux rester anonyme",
      anonymousDescription: "Votre identité ne sera pas révélée. Vous recevrez un code confidentiel pour suivre votre dossier.",
      contact: "Je veux être contacté(e)",
      contactDescription: "Nos services pourront vous contacter pour vous apporter une assistance personnalisée.",
      fullName: "Nom complet (facultatif)",
      namePlaceholder: "Votre nom",
      phone: "Numéro de téléphone (facultatif)",
      email: "Adresse e-mail (facultatif)"
    }
  },

  // Hero Section
  hero: {
    subtitle: "Plateforme de signalement et de documentation des cas de violences sexuelles liées aux conflits et autres crimes graves. Anonyme, sécurisée et disponible 24h/24.",
    depositComplaint: "Signaler un cas",
    talkToAssistant: "Parler à l'assistant virtuel",
    trackComplaint: "Consulter un cas"
  },

  // Navigation
  nav: {
    home: "Accueil",
    complaint: "Signaler un cas",
    chatbot: "Chatbot IA",
    tracking: "Consulter un cas",
    about: "À propos",
    contact: "Contact",
    login: "Connexion",
    logout: "Déconnexion",
    profile: "Mon profil",
    adminUsers: "Gestion utilisateurs",
    adminDashboard: "Tableau de bord admin",
    investigatorForm: "Formulaire enquêteur",
    investigatorDashboard: "Tableau de bord enquêteur",
    ngoDashboard: "Tableau de bord ONG",
    assuranceDashboard: "Tableau de bord Assurance"
  },

  // Authentification
  auth: {
    login: "Connexion",
    investigatorLogin: "Connexion Enquêteur",
    email: "Email",
    password: "Mot de passe",
    showPassword: "Afficher le mot de passe",
    hidePassword: "Masquer le mot de passe",
    loginButton: "Se connecter",
    biometricAuth: "Authentification biométrique",
    biometricSupported: "Authentification biométrique non supportée sur cet appareil",
    biometricFailed: "Échec de l'authentification biométrique",
    biometricSuccess: "Vérification biométrique réussie",
    noAccount: "Pas encore de compte enquêteur ?",
    requestAccess: "Demander un accès enquêteur",
    backToStandard: "← Retour à la connexion standard",
    loginError: "Erreur de connexion",
    invalidCredentials: "Identifiants invalides",
    accountInactive: "Votre compte n'est pas actif. Veuillez contacter l'administrateur.",
    biometricRequired: "Enregistrement biométrique requis pour cet enquêteur",
    biometricVerificationFailed: "Vérification biométrique échouée ou manquante"
  },

  // Formulaire enquêteur
  investigatorForm: {
    title: "Formulaire Enquêteur",
    subtitle: "Gestion de vos enquêtes et investigations",
    online: "En ligne",
    offline: "Hors ligne",
    save: "Sauvegarder",
    syncPending: "Synchronisation en attente",
    submit: "Soumettre l'enquête",
    submitting: "Soumission...",
    
    // Étapes
    steps: {
      beneficiary: "Identité du bénéficiaire",
      incident: "Informations de l'incident",
      evidence: "Documentation des évidences",
      comment: "Commentaire enquêteur",
      validation: "Validation finale"
    },

    // Identité du bénéficiaire
    beneficiary: {
      title: "Identité du bénéficiaire",
      subtitle: "Informations personnelles de la victime",
      fullName: "Nom complet",
      sex: "Sexe",
      female: "Féminin",
      male: "Masculin",
      age: "Âge",
      territory: "Territoire",
      groupement: "Groupement",
      village: "Village",
      householdSize: "Taille du ménage",
      currentAddress: "Adresse actuelle",
      status: "Statut",
      single: "Célibataire",
      married: "Marié(e)",
      divorced: "Divorcé(e)",
      widowed: "Veuf/Veuve",
      commonLaw: "En union libre",
      natureOfFacts: "Nature des faits"
    },

    // Informations de l'incident
    incident: {
      title: "Informations de l'incident",
      subtitle: "Détails sur l'incident signalé",
      type: "Type d'incident",
      date: "Date de l'incident",
      time: "Heure de l'incident",
      address: "Lieu de l'incident",
      description: "Description de l'incident",
      types: {
        sexualViolence: "Violence sexuelle",
        domesticViolence: "Violence domestique",
        physicalViolence: "Violence physique",
        psychologicalViolence: "Violence psychologique",
        sexualExploitation: "Exploitation sexuelle",
        humanTrafficking: "Traite des personnes",
        forcedMarriage: "Mariage forcé",
        femaleGenitalMutilation: "Mutilation génitale",
        other: "Autre"
      }
    },

    // Documentation des évidences
    evidence: {
      title: "Documentation des évidences",
      subtitle: "Collecte des preuves et documents",
      identityDocuments: "Documents d'identité",
      documentType: "Type de document",
      documentNumber: "Numéro du document",
      beneficiaryPhoto: "Photo du bénéficiaire",
      photoRequired: "Photo obligatoire du bénéficiaire",
      takePhoto: "Prendre une photo",
      audioTestimony: "Témoignage audio",
      audioDescription: "Enregistrement audio du témoignage (max 35s)",
      record: "Enregistrer",
      stop: "Arrêter",
      videoTestimony: "Témoignage vidéo",
      videoDescription: "Enregistrement vidéo du témoignage (max 35s)",
      biometricData: "Données biométriques",
      fingerprint: "Empreinte digitale",
      faceRecognition: "Reconnaissance faciale",
      capture: "Capturer",
      scan: "Scanner",
      documentTypes: {
        idCard: "Carte d'identité",
        passport: "Passeport",
        drivingLicense: "Permis de conduire",
        studentCard: "Carte d'étudiant",
        other: "Autre"
      }
    },

    // Commentaire enquêteur
    comment: {
      title: "Commentaire de l'enquêteur",
      subtitle: "Résumé et observations de l'enquêteur",
      investigationSummary: "Résumé de l'enquête",
      placeholder: "Résumé détaillé de l'enquête, observations, recommandations..."
    },

    // Validation finale
    validation: {
      title: "Validation finale",
      subtitle: "Vérification biométrique et soumission",
      biometricRequired: "Vérification biométrique requise",
      biometricDescription: "Veuillez effectuer la vérification biométrique pour soumettre le formulaire",
      verifyIdentity: "Vérifier l'identité",
      biometricSuccess: "Vérification biométrique réussie",
      biometricSuccessDescription: "Vous pouvez maintenant soumettre le formulaire",
      formSummary: "Résumé du formulaire",
      beneficiary: "Bénéficiaire:",
      incidentType: "Type d'incident:",
      date: "Date:",
      evidenceCollected: "Preuves collectées:",
      status: "Statut:",
      notProvided: "Non renseigné",
      fileCount: "fichier(s)",
      submitInvestigation: "Soumettre l'enquête",
      investigationSubmitted: "Enquête soumise",
      investigationSubmittedDescription: "Votre enquête a été enregistrée avec succès",
      offlineSubmission: "Soumission hors ligne",
      offlineSubmissionDescription: "Formulaire sauvegardé pour synchronisation ultérieure"
    },

    // Actions
    actions: {
      next: "Suivant",
      previous: "Précédent",
      nextStep: "Suivant",
      previousStep: "Précédent"
    },

    // Géolocalisation
    geolocation: {
      title: "Géolocalisation",
      description: "Impossible d'obtenir votre position. Veuillez l'ajouter manuellement.",
      latitude: "Latitude",
      longitude: "Longitude",
      accuracy: "Précision"
    },

    // Enregistrement
    recording: {
      start: "Commencer l'enregistrement",
      stop: "Arrêter l'enregistrement",
      recording: "Enregistrement en cours",
      maxDuration: "Durée maximale: 35 secondes",
      timeRemaining: "Temps restant",
      error: "Erreur d'enregistrement",
      errorDescription: "Impossible d'accéder au microphone/caméra"
    },

    // Fichiers
    files: {
      upload: "Télécharger",
      remove: "Supprimer",
      download: "Télécharger",
      view: "Voir",
      fileSize: "Taille du fichier",
      supportedFormats: "Formats supportés",
      maxSize: "Taille maximale"
    }
  },

  // Administration
  admin: {
    title: "Gestion des utilisateurs",
    subtitle: "Administration des comptes utilisateurs et permissions",
    newUser: "Nouvel utilisateur",
    createUser: "Créer un nouvel utilisateur",
    userDetails: "Détails utilisateur",
    role: "Rôle",
    status: "Statut",
    aiAccessLevel: "Niveau d'accès IA",
    active: "Actif",
    inactive: "Inactif",
    pending: "En attente",
    global: "Global",
    regional: "Régional",
    none: "Aucun",
    roles: {
      admin: "Admin",
      investigator: "Enquêteur",
      ngo: "ONG",
      assurance: "Assurance"
    },
    investigatorDetails: "Informations enquêteur",
    ngoDetails: "Informations ONG",
    assuranceDetails: "Informations Assurance",
    fullName: "Nom complet",
    badgeNumber: "Numéro de badge",
    department: "Département",
    province: "Province",
    zone: "Zone",
    organizationName: "Nom de l'organisation",
    registrationNumber: "Numéro d'enregistrement",
    contactPerson: "Personne de contact",
    insuranceName: "Nom de l'assurance",
    searchPlaceholder: "Rechercher par email, nom...",
    allRoles: "Tous les rôles",
    allStatuses: "Tous les statuts",
    lastLogin: "Dernière connexion",
    neverConnected: "Jamais connecté",
    actions: "Actions",
    edit: "Modifier",
    activate: "Activer",
    deactivate: "Désactiver",
    delete: "Supprimer",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer cet utilisateur ?",
    userCreated: "Utilisateur créé avec succès",
    userUpdated: "Statut utilisateur mis à jour",
    userDeleted: "Utilisateur supprimé avec succès",
    validationError: "Erreur de validation",
    fillRequiredFields: "Veuillez remplir tous les champs requis",
    errorCreating: "Impossible de créer l'utilisateur",
    errorUpdating: "Impossible de mettre à jour le statut",
    errorDeleting: "Impossible de supprimer l'utilisateur",
    biometricRegistered: "Enregistrée",
    biometricNotRegistered: "Non enregistrée"
  },

  // ONG Dashboard
  ngo: {
    title: "Tableau de bord ONG",
    subtitle: "Gestion des plaintes et services d'accompagnement",
    totalComplaints: "Total plaintes",
    pending: "En attente",
    inProgress: "En cours",
    urgent: "Urgentes",
    complaints: "Plaintes",
    services: "Services",
    searchPlaceholder: "Rechercher par code, nom, type d'incident...",
    allStatuses: "Tous les statuts",
    allPriorities: "Toutes les priorités",
    low: "Faible",
    medium: "Moyen",
    high: "Élevé",
    urgent: "Urgent",
    code: "Code",
    beneficiary: "Bénéficiaire",
    incidentType: "Type d'incident",
    priority: "Priorité",
    status: "Statut",
    location: "Localisation",
    date: "Date",
    actions: "Actions",
    viewDetails: "Voir les détails",
    addService: "Ajouter un service",
    markInProgress: "Marquer en cours",
    markCompleted: "Marquer terminé",
    closed: "Fermé",
    completed: "Terminé",
    viaInvestigator: "Via enquêteur",
    directVictim: "Victime directe",
    accompanimentServices: "Services d'accompagnement",
    serviceType: "Type de service",
    notes: "Notes",
    markProvided: "Marquer fourni",
    close: "Fermer",
    addAccompanimentService: "Ajouter un service d'accompagnement",
    proposeService: "Proposer un service d'accompagnement pour cette plainte",
    medical: "Médical",
    psychological: "Psychologique",
    legal: "Juridique",
    protection: "Protection",
    shelter: "Hébergement",
    socioEconomic: "Socio-économique",
    other: "Autre",
    serviceAdded: "Service ajouté avec succès",
    serviceUpdated: "Statut du service mis à jour",
    errorAddingService: "Impossible d'ajouter le service",
    errorUpdatingService: "Impossible de mettre à jour le statut du service",
    complaintDetails: "Détails de la plainte",
    completeInformation: "Informations complètes sur la plainte sélectionnée",
    generalInfo: "Informations générales",
    trackingCode: "Code de suivi",
    type: "Type",
    beneficiaryInfo: "Bénéficiaire",
    name: "Nom",
    sex: "Sexe",
    age: "Âge",
    years: "ans",
    incident: "Incident",
    place: "Lieu",
    description: "Description",
    investigator: "Enquêteur",
    badge: "Badge",
    comment: "Commentaire",
    collectedEvidence: "Preuves collectées",
    accompanimentServices: "Services d'accompagnement",
    download: "Télécharger",
    cancel: "Annuler",
    addService: "Ajouter le service"
  },

  // Assurance Dashboard
  assurance: {
    title: "Tableau de bord Assurance",
    subtitle: "Analyse globale des données avec intelligence artificielle",
    askAI: "Poser une question à l'IA",
    totalComplaints: "Total plaintes",
    assistedInvestigations: "Enquêtes assistées",
    urgentCases: "Cas urgents",
    completedCases: "Cas terminés",
    averageTime: "Temps moyen",
    aiQuestions: "Questions IA",
    overview: "Vue d'ensemble",
    aiAnalysis: "Analyse IA",
    allComplaints: "Toutes les plaintes",
    incidentTypes: "Types d'incidents",
    temporalTrends: "Tendances temporelles",
    geographicDistribution: "Répartition géographique",
    aiRecommendations: "Recommandations IA",
    aiAssistant: "Assistant IA pour l'analyse",
    askQuestions: "Posez des questions sur les données pour obtenir des analyses approfondies",
    yourQuestion: "Votre question",
    questionPlaceholder: "Ex: Quelle est la répartition des types de violences par province ?",
    responseType: "Type de réponse",
    text: "Texte",
    chart: "Graphique",
    excel: "Fichier Excel",
    pdf: "Rapport PDF",
    recommendations: "Recommandations",
    analyze: "Analyser",
    analyzing: "Analyse...",
    suggestedQuestions: "Questions suggérées",
    clickToUse: "Cliquez sur une question pour l'utiliser",
    aiAnalysisHistory: "Historique des analyses IA",
    performanceOptimization: "Optimisation des ressources",
    increaseInvestigators: "Augmenter le nombre d'enquêteurs dans les provinces à forte demande",
    improveDelays: "Amélioration des délais",
    automaticPrioritization: "Mettre en place un système de priorisation automatique",
    continuousTraining: "Formation continue",
    trainingSessions: "Organiser des sessions de formation sur les nouvelles technologies",
    analysisComplete: "Analyse terminée",
    aiProcessedSuccessfully: "L'IA a traité votre demande avec succès",
    errorProcessing: "Impossible de traiter la demande IA",
    enterQuestion: "Veuillez saisir une question",
    aiResponse: "Réponse de l'IA",
    aiGeneratedAnalysis: "Analyse générée par l'intelligence artificielle",
    analysis: "Analyse",
    visualizations: "Visualisations",
    recommendations: "Recommandations",
    processingTime: "Temps de traitement",
    type: "Type",
    download: "Télécharger",
    share: "Partager",
    allComplaintsCount: "Toutes les plaintes",
    directVictim: "Victime directe",
    viaInvestigator: "Via enquêteur",
    location: "Localisation",
    evidence: "Preuves",
    evidenceCount: "fichier(s)"
  },

  // Enquêteur Dashboard
  investigator: {
    title: "Tableau de bord Enquêteur",
    subtitle: "Gestion de vos enquêtes et investigations",
    biometricAuth: "Authentification biométrique",
    registeredActive: "Enregistrée et active",
    notRegistered: "Non enregistrée",
    active: "Actif",
    inactive: "Inactif",
    newInvestigation: "Nouvelle enquête",
    totalInvestigations: "Total enquêtes",
    pending: "En attente",
    inProgress: "En cours",
    completed: "Terminées",
    urgent: "Urgentes",
    monthlyPerformance: "Performance mensuelle",
    completedPerMonth: "Enquêtes terminées par mois",
    incidentTrends: "Tendances des types d'incidents",
    mostFrequentIncidents: "Types d'incidents les plus fréquents",
    myInvestigations: "Mes enquêtes",
    code: "Code",
    beneficiary: "Bénéficiaire",
    incidentType: "Type d'incident",
    priority: "Priorité",
    status: "Statut",
    location: "Localisation",
    date: "Date",
    evidence: "Preuves",
    actions: "Actions",
    anonymous: "Anonyme",
    years: "ans",
    files: "fichier(s)",
    view: "Voir",
    download: "Télécharger",
    more: "Plus"
  },

  // Messages généraux
  common: {
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
    warning: "Attention",
    info: "Information",
    confirm: "Confirmer",
    cancel: "Annuler",
    save: "Sauvegarder",
    delete: "Supprimer",
    edit: "Modifier",
    view: "Voir",
    download: "Télécharger",
    upload: "Télécharger",
    search: "Rechercher",
    filter: "Filtrer",
    sort: "Trier",
    export: "Exporter",
    import: "Importer",
    refresh: "Actualiser",
    close: "Fermer",
    open: "Ouvrir",
    next: "Suivant",
    previous: "Précédent",
    submit: "Soumettre",
    reset: "Réinitialiser",
    clear: "Effacer",
    select: "Sélectionner",
    choose: "Choisir",
    required: "Requis",
    optional: "Optionnel",
    yes: "Oui",
    no: "Non",
    male: "Masculin",
    female: "Féminin",
    unknown: "Inconnu",
    notSpecified: "Non spécifié",
    none: "Aucun",
    all: "Tous",
    today: "Aujourd'hui",
    yesterday: "Hier",
    tomorrow: "Demain",
    thisWeek: "Cette semaine",
    thisMonth: "Ce mois",
    thisYear: "Cette année",
    lastWeek: "Semaine dernière",
    lastMonth: "Mois dernier",
    lastYear: "Année dernière",
    nextWeek: "Semaine prochaine",
    nextMonth: "Mois prochain",
    nextYear: "Année prochaine"
  },

  // Provinces RDC
  provinces: {
    kinshasa: "Kinshasa",
    kongoCentral: "Kongo-Central",
    kwango: "Kwango",
    kwilu: "Kwilu",
    maiNdombe: "Mai-Ndombe",
    equateur: "Équateur",
    mongala: "Mongala",
    nordUbangi: "Nord-Ubangi",
    sudUbangi: "Sud-Ubangi",
    tshuapa: "Tshuapa",
    ituri: "Ituri",
    hautUele: "Haut-Uele",
    basUele: "Bas-Uele",
    tshopo: "Tshopo",
    nordKivu: "Nord-Kivu",
    sudKivu: "Sud-Kivu",
    maniema: "Maniema",
    tanganyika: "Tanganyika",
    hautLomami: "Haut-Lomami",
    lualaba: "Lualaba",
    hautKatanga: "Haut-Katanga",
    kasai: "Kasaï",
    kasaiCentral: "Kasaï-Central",
    kasaiOriental: "Kasaï-Oriental",
    lomami: "Lomami",
    sankuru: "Sankuru"
  }
}
