// Script InDesign sans arguments - utilise le dernier projet créé
#target indesign

function main() {
    try {
        // Chemin de base
        var basePath = "/Users/alexandreerrasti/Library/Mobile Documents/com~apple~CloudDocs/Indesign automation";
        
        // Trouver le dernier projet créé
        var uploadsFolder = new Folder(basePath + "/uploads");
        if (!uploadsFolder.exists) {
            alert("❌ Dossier uploads non trouvé");
            return false;
        }
        
        // Lister les dossiers de projets
        var projectFolders = uploadsFolder.getFiles();
        var latestProject = null;
        var latestTime = 0;
        
        for (var i = 0; i < projectFolders.length; i++) {
            if (projectFolders[i] instanceof Folder) {
                var configFile = new File(projectFolders[i] + "/config.json");
                if (configFile.exists) {
                    var modTime = configFile.modified.getTime();
                    if (modTime > latestTime) {
                        latestTime = modTime;
                        latestProject = projectFolders[i];
                    }
                }
            }
        }
        
        if (!latestProject) {
            alert("❌ Aucun projet trouvé");
            return false;
        }
        
        // Lire la configuration du dernier projet
        var configFile = new File(latestProject + "/config.json");
        configFile.open("r");
        var configData = configFile.read();
        configFile.close();
        
        var config = JSON.parse(configData);
        
        alert("✅ Configuration trouvée: " + config.project_id);
        
        // Chemin du template
        var templatePath = basePath + "/indesign_templates/template-test-1708.indt";
        var templateFile = new File(templatePath);
        
        if (!templateFile.exists) {
            alert("❌ Template non trouvé: " + templatePath);
            return false;
        }
        
        // Ouvrir le template
        var doc = app.open(templateFile);
        
        // REMPLACER LE TEXTE "TEXTE"
        try {
            app.findTextPreferences = NothingEnum.NOTHING;
            app.changeTextPreferences = NothingEnum.NOTHING;
            
            app.findTextPreferences.findWhat = "TEXTE";
            
            var newText = config.prompt || "Nouveau titre";
            if (config.text_content) {
                newText += "\n\n" + config.text_content.substring(0, 300);
            }
            
            app.changeTextPreferences.changeTo = newText;
            doc.changeText();
            
            app.findTextPreferences = NothingEnum.NOTHING;
            app.changeTextPreferences = NothingEnum.NOTHING;
            
            alert("✅ Texte remplacé");
            
        } catch (textError) {
            alert("⚠️ Erreur texte: " + textError.toString());
        }
        
        // PLACER L'IMAGE
        if (config.images && config.images.length > 0) {
            try {
                var imageFile = new File(config.images[0]);
                
                if (imageFile.exists && doc.pages[0].rectangles.length > 0) {
                    var rectangle = doc.pages[0].rectangles[0];
                    rectangle.place(imageFile);
                    rectangle.fit(FitOptions.CONTENT_TO_FRAME);
                    rectangle.fit(FitOptions.CENTER_CONTENT);
                    
                    alert("✅ Image placée");
                }
            } catch (imageError) {
                alert("⚠️ Erreur image: " + imageError.toString());
            }
        }
        
        // SAUVEGARDER
        try {
            var outputFolder = new Folder(basePath + "/output");
            if (!outputFolder.exists) {
                outputFolder.create();
            }
            
            var outputFile = new File(outputFolder + "/" + config.project_id + ".indd");
            doc.save(outputFile);
            doc.close();
            
            alert("🎉 SUCCÈS! Document créé: " + config.project_id + ".indd");
            return true;
            
        } catch (saveError) {
            alert("❌ Erreur sauvegarde: " + saveError.toString());
            doc.close();
            return false;
        }
        
    } catch (error) {
        alert("❌ ERREUR: " + error.toString());
        return false;
    }
}

// Exécuter
main();