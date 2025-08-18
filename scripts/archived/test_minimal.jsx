// Test minimal - juste ouvrir votre template
#target indesign

try {
    // Chemin fixe pour test
    var templatePath = "/Users/alexandreerrasti/Library/Mobile Documents/com~apple~CloudDocs/Indesign automation/indesign_templates/template-mag-simple-1808.indt";
    var templateFile = new File(templatePath);
    
    if (!templateFile.exists) {
        alert("❌ Template non trouvé: " + templatePath);
    } else {
        alert("✅ Template trouvé, ouverture...");
        
        // Ouvrir le template
        var doc = app.open(templateFile);
        
        // Remplacer TEXTE
        app.changeTextPreferences.findWhat = "TEXTE";
        app.changeTextPreferences.changeTo = "CECI MARCHE !";
        doc.changeText();
        app.changeTextPreferences = NothingEnum.nothing;
        
        // Sauver avec un nom fixe
        var outputPath = "/Users/alexandreerrasti/Library/Mobile Documents/com~apple~CloudDocs/Indesign automation/output/test-minimal.indd";
        var outputFile = new File(outputPath);
        doc.save(outputFile);
        doc.close();
        
        alert("✅ SUCCÈS! Fichier créé: test-minimal.indd");
    }
    
} catch (error) {
    alert("❌ ERREUR: " + error.toString());
}