#target indesign

// Test simple - Script ExtendScript pour automatisation magazine
// Usage: Ouvrir InDesign et exécuter ce script

function testSimple() {
    try {
        // Chemins absolus vers vos fichiers
        var templatePath = "/Users/alexandreerrasti/Library/Mobile Documents/com~apple~CloudDocs/n8n automatisation Windsurf/Template Test.indd";
        var xmlPath = "/Users/alexandreerrasti/Library/Mobile Documents/com~apple~CloudDocs/n8n automatisation Windsurf/magazine-content-example.xml";
        var outputPath = "/Users/alexandreerrasti/Library/Mobile Documents/com~apple~CloudDocs/n8n automatisation Windsurf/test-output.pdf";
        
        // Vérifier qu'InDesign est ouvert
        if (app.documents.length > 0) {
            alert("Veuillez fermer tous les documents InDesign avant d'exécuter ce script.");
            return;
        }
        
        // Désactiver les interactions utilisateur
        app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
        
        // Ouvrir le template
        var templateFile = File(templatePath);
        if (!templateFile.exists) {
            alert("Template non trouvé : " + templatePath);
            return;
        }
        
        var doc = app.open(templateFile);
        alert("Template ouvert avec succès !");
        
        // Vérifier le fichier XML
        var xmlFile = File(xmlPath);
        if (!xmlFile.exists) {
            alert("Fichier XML non trouvé : " + xmlPath);
            doc.close(SaveOptions.NO);
            return;
        }
        
        // Tentative d'import XML (peut échouer si le template n'est pas préparé)
        try {
            doc.importXML(xmlFile);
            alert("XML importé avec succès !");
        } catch (xmlError) {
            alert("Erreur import XML (normal si template pas préparé) : " + xmlError.message);
        }
        
        // Export PDF simple
        try {
            var outputFile = File(outputPath);
            doc.exportFile(ExportFormat.PDF_TYPE, outputFile, false);
            alert("PDF exporté avec succès vers : " + outputPath);
        } catch (exportError) {
            alert("Erreur export PDF : " + exportError.message);
        }
        
        // Fermer le document
        doc.close(SaveOptions.NO);
        alert("Test terminé avec succès !");
        
    } catch (error) {
        alert("Erreur générale : " + error.message);
    }
}

// Exécuter le test
testSimple();
