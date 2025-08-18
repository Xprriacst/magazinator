// Script simple pour remplir le template d'Alexandre
#target indesign

function main() {
    try {
        // Récupérer le chemin de config
        var configPath = "";
        if (typeof $.arguments !== 'undefined' && $.arguments.length > 0) {
            configPath = $.arguments[0];
        }
        
        if (!configPath) {
            alert("❌ Pas de fichier de configuration fourni");
            return;
        }
        
        // Lire la configuration
        var configFile = new File(configPath);
        if (!configFile.exists) {
            alert("❌ Fichier de configuration non trouvé: " + configPath);
            return;
        }
        
        configFile.open("r");
        var configData = configFile.read();
        configFile.close();
        
        var config = JSON.parse(configData);
        
        // Ouvrir le template
        var templatePath = File(configPath).parent.parent + "/indesign_templates/template-mag-simple-1808.indt";
        var templateFile = new File(templatePath);
        
        if (!templateFile.exists) {
            alert("❌ Template non trouvé: " + templatePath);
            return;
        }
        
        // Ouvrir le template
        var doc = app.open(templateFile);
        var page = doc.pages[0];
        
        // REMPLIR LE TEXTE
        // Chercher le texte "TEXTE" et le remplacer
        if (page.textFrames.length > 0) {
            var textFrame = page.textFrames[0]; // Premier bloc de texte
            
            // Remplacer le contenu
            var newText = config.prompt || "Titre automatique";
            if (config.text_content) {
                newText += "\n\n" + config.text_content;
            }
            
            textFrame.contents = newText;
            
            // Améliorer le style
            var para = textFrame.paragraphs[0];
            para.appliedFont = "Arial\tBold";
            para.pointSize = 16;
        }
        
        // PLACER L'IMAGE
        // Chercher le premier rectangle vide et y placer l'image
        if (config.images && config.images.length > 0 && page.rectangles.length > 0) {
            var imageFile = new File(config.images[0]);
            
            if (imageFile.exists) {
                var imageFrame = page.rectangles[0]; // Premier rectangle
                
                try {
                    // Placer l'image
                    imageFrame.place(imageFile);
                    
                    // Ajuster l'image au cadre
                    imageFrame.fit(FitOptions.CONTENT_TO_FRAME);
                    imageFrame.fit(FitOptions.CENTER_CONTENT);
                    
                } catch (e) {
                    alert("⚠️ Erreur placement image: " + e.toString());
                }
            }
        }
        
        // SAUVEGARDER
        var outputFolder = new Folder(File(configPath).parent.parent + "/output");
        if (!outputFolder.exists) {
            outputFolder.create();
        }
        
        var outputFile = new File(outputFolder + "/" + config.project_id + ".indd");
        doc.save(outputFile);
        
        // Fermer le document
        doc.close();
        
        alert("✅ SUCCÈS! Document créé: " + config.project_id + ".indd");
        
    } catch (error) {
        alert("❌ ERREUR: " + error.toString());
    }
}

// Exécuter
main();