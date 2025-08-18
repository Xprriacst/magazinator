// Script final qui marche vraiment avec votre template
#target indesign

function main() {
    try {
        // Trouver automatiquement le dernier projet comme template_simple_working.jsx
        var basePath = "/Users/alexandreerrasti/Library/Mobile Documents/com~apple~CloudDocs/Indesign automation";
        var uploadsFolder = new Folder(basePath + "/uploads");
        
        if (!uploadsFolder.exists) {
            alert("❌ Dossier uploads non trouvé");
            return false;
        }
        
        var projectFolders = uploadsFolder.getFiles();
        var latestProject = null;
        var latestTime = 0;
        
        for (var i = 0; i < projectFolders.length; i++) {
            if (projectFolders[i] instanceof Folder) {
                var modifiedTime = projectFolders[i].modified.getTime();
                if (modifiedTime > latestTime) {
                    latestTime = modifiedTime;
                    latestProject = projectFolders[i];
                }
            }
        }
        
        if (!latestProject) {
            alert("❌ Aucun projet trouvé");
            return false;
        }
        
        var configFile = new File(latestProject + "/config.json");
        if (!configFile.exists) {
            alert("❌ Config non trouvée: " + configFile.fsName);
            return false;
        }
        
        configFile.open("r");
        var configData = configFile.read();
        configFile.close();
        
        // Parser JSON manuellement car JSON.parse n'existe pas dans InDesign
        var config = {};
        
        // Extraire project_id
        var projectMatch = configData.match(/"project_id":\s*"([^"]+)"/);
        if (projectMatch) {
            config.project_id = projectMatch[1];
        }
        
        // Extraire prompt (titre)
        var promptMatch = configData.match(/"prompt":\s*"([^"]+)"/);
        if (promptMatch) {
            config.prompt = promptMatch[1];
        }
        
        // Extraire text_content
        var textMatch = configData.match(/"text_content":\s*"([^"]+)"/);
        if (textMatch) {
            config.text_content = textMatch[1];
        }
        
        // Extraire subtitle
        var subtitleMatch = configData.match(/"subtitle":\s*"([^"]+)"/);
        if (subtitleMatch) {
            config.subtitle = subtitleMatch[1];
        }
        
        // Extraire template
        var templateMatch = configData.match(/"template":\s*"([^"]+)"/);
        if (templateMatch) {
            config.template = templateMatch[1];
        }
        
        // Extraire images (chemins absolus)
        config.images = [];
        var imageMatches = configData.match(/"images":\s*\[(.*?)\]/);
        if (imageMatches) {
            var imageList = imageMatches[1];
            var imagePathMatches = imageList.match(/"([^"]+)"/g);
            if (imagePathMatches) {
                for (var i = 0; i < imagePathMatches.length; i++) {
                    var imagePath = imagePathMatches[i].replace(/"/g, '');
                    config.images.push(imagePath);
                }
            }
        }
        
        
        // Chemin du template - utiliser celui spécifié dans config ou par défaut
        var templateName = config.template || "template-mag-simple-1808";
        if (templateName.length < 5 || templateName.substring(templateName.length - 5) !== '.indt') {
            templateName += '.indt';
        }
        var templatePath = configFile.parent.parent + "/indesign_templates/" + templateName;
        var templateFile = new File(templatePath);
        
        if (!templateFile.exists) {
            alert("❌ Template non trouvé: " + templatePath);
            return false;
        }
        
        // Ouvrir le template
        var doc = app.open(templateFile);
        
        // REMPLACER LE TEXTE selon le template utilisé
        try {
            app.findChangeTextOptions = NothingEnum.NOTHING;
            app.changeTextPreferences = NothingEnum.NOTHING;
            
            // Détecter quel template on utilise
            if (templateName.indexOf("template-mag-simple-1808") !== -1) {
                // Template 1: {{TITRE}}, {{SOUS-TITRE}}, {{ARTICLE}}
                
                // 1. Remplacer "{{TITRE}}" 
                app.findTextPreferences.findWhat = "{{TITRE}}";
                app.changeTextPreferences.changeTo = config.prompt || "Nouveau titre";
                doc.changeText();
                
                app.findTextPreferences = NothingEnum.NOTHING;
                app.changeTextPreferences = NothingEnum.NOTHING;
                
                // 2. Remplacer "{{SOUS-TITRE}}"
                app.findTextPreferences.findWhat = "{{SOUS-TITRE}}";
                var subtitleText = config.subtitle || "Sous-titre par défaut";
                app.changeTextPreferences.changeTo = subtitleText;
                doc.changeText();
                
                app.findTextPreferences = NothingEnum.NOTHING;
                app.changeTextPreferences = NothingEnum.NOTHING;
                
                // 3. Remplacer "{{ARTICLE}}"
                app.findTextPreferences.findWhat = "{{ARTICLE}}";
                app.changeTextPreferences.changeTo = config.text_content || "Contenu de l'article";
                doc.changeText();
                
            } else if (templateName.indexOf("template-mag-simple-2-1808") !== -1) {
                // Template 2: seulement {{ARTICLE}}
                
                app.findTextPreferences.findWhat = "{{ARTICLE}}";
                var fullText = config.prompt || "Titre";
                if (config.text_content) {
                    fullText += "\n\n" + config.text_content;
                }
                app.changeTextPreferences.changeTo = fullText;
                doc.changeText();
                
            } else {
                // Template non reconnu, méthode par défaut
                app.findTextPreferences.findWhat = "TEXTE";
                var newText = config.prompt || "Nouveau titre";
                if (config.text_content) {
                    newText += "\n\n" + config.text_content.substring(0, 500);
                }
                app.changeTextPreferences.changeTo = newText;
                doc.changeText();
            }
            
            // Réinitialiser
            app.findTextPreferences = NothingEnum.NOTHING;
            app.changeTextPreferences = NothingEnum.NOTHING;
            
        } catch (textError) {
            alert("⚠️ Erreur remplacement texte: " + textError.toString());
        }
        
        // PLACER L'IMAGE dans le rectangle
        if (config.images && config.images.length > 0) {
            try {
                // Debug: écrire dans un fichier log 
                var logFile = new File(configFile.parent.parent + "/debug_indesign.log");
                logFile.open("a");
                
                logFile.writeln("=== DEBUG SESSION " + new Date() + " ===");
                logFile.writeln("📊 Rectangles trouvés: " + doc.pages[0].rectangles.length);
                logFile.writeln("📊 Cadres de texte: " + doc.pages[0].textFrames.length);
                
                // Utiliser le chemin d'image
                var imagePath = config.images[0];
                
                logFile.writeln("🔍 Chemin image config: " + imagePath);
                logFile.writeln("🔍 Chemin fichier config: " + configFile.fsName);
                
                var imageFile = new File(imagePath);
                
                logFile.writeln("📁 Fichier existe? " + imageFile.exists + " | Chemin: " + imageFile.fsName);
                
                if (imageFile.exists && doc.pages[0].rectangles.length > 0) {
                    logFile.writeln("✅ Tentative placement image dans rectangle 0");
                    var rectangle = doc.pages[0].rectangles[0];
                    rectangle.place(imageFile);
                    rectangle.fit(FitOptions.CONTENT_TO_FRAME);
                    rectangle.fit(FitOptions.CENTER_CONTENT);
                    logFile.writeln("✅ Image placée avec succès");
                } else {
                    logFile.writeln("❌ Pas d'image ou pas de rectangle disponible");
                }
                
            } catch (imageError) {
                var logFile = new File(configFile.parent.parent + "/debug_indesign.log");
                logFile.open("a");
                logFile.writeln("❌ ERREUR IMAGE: " + imageError.toString());
                logFile.close();
                alert("⚠️ Erreur placement image: " + imageError.toString());
            }
        }
        
        // SAUVEGARDER le document
        try {
            var outputFolder = new Folder(configFile.parent.parent + "/output");
            if (!outputFolder.exists) {
                outputFolder.create();
            }
            
            var outputFile = new File(outputFolder + "/" + config.project_id + ".indd");
            
            // Sauvegarder
            doc.save(outputFile);
            
            // Fermer le document
            doc.close();
            
            alert("✅ SUCCÈS! Document créé: " + config.project_id + ".indd");
            return true;
            
        } catch (saveError) {
            alert("❌ Erreur sauvegarde: " + saveError.toString());
            doc.close();
            return false;
        }
        
    } catch (error) {
        alert("❌ ERREUR GÉNÉRALE: " + error.toString());
        return false;
    }
}

// Exécuter le script
main();