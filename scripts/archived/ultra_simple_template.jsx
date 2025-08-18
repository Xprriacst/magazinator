// Script ultra simple pour votre template
#target indesign

try {
    // Récupérer le chemin de config
    var configPath = "";
    if (typeof arguments !== 'undefined' && arguments.length > 0) {
        configPath = arguments[0];
    } else if (typeof $.arguments !== 'undefined' && $.arguments.length > 0) {
        configPath = $.arguments[0];
    }
    
    if (!configPath) {
        alert("❌ Pas de config fournie");
        throw new Error("Pas de config");
    }
    
    // Lire la config
    var configFile = new File(configPath);
    if (!configFile.exists) {
        alert("❌ Config non trouvée: " + configPath);
        throw new Error("Config non trouvée");
    }
    
    configFile.open("r");
    var configData = configFile.read();
    configFile.close();
    var config = JSON.parse(configData);
    
    // Chercher le template
    var templatePath = configFile.parent.parent + "/indesign_templates/template-mag-simple-1808.indt";
    var templateFile = new File(templatePath);
    
    if (!templateFile.exists) {
        alert("❌ Template non trouvé: " + templatePath);
        throw new Error("Template non trouvé");
    }
    
    // Ouvrir le template
    var doc = app.open(templateFile);
    
    // Remplacer "TEXTE" par notre contenu
    app.changeTextPreferences.findWhat = "TEXTE";
    app.changeTextPreferences.changeTo = config.prompt || "Nouveau texte";
    doc.changeText();
    
    // Réinitialiser les préférences
    app.changeTextPreferences = NothingEnum.nothing;
    
    // Créer le dossier output
    var outputFolder = new Folder(configFile.parent.parent + "/output");
    if (!outputFolder.exists) {
        outputFolder.create();
    }
    
    // Sauvegarder
    var outputFile = new File(outputFolder + "/" + config.project_id + ".indd");
    doc.save(outputFile);
    doc.close();
    
    alert("✅ SUCCÈS! " + config.project_id);
    
} catch (error) {
    alert("❌ ERREUR: " + error.toString());
}