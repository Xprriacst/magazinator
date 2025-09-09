// Script InDesign simple qui marche - sans JSON.parse
#target indesign

function parseSimpleJSON(jsonString) {
    // Parser JSON simple - extraction des valeurs clés
    try {
        // alert("🔍 Début parsing JSON...");
        
        // Méthode simple : extraire juste les valeurs dont on a besoin
        var config = {};
        
        // Extraire project_id
        var projectMatch = jsonString.match(/"project_id":\s*"([^"]+)"/);
        if (projectMatch) {
            config.project_id = projectMatch[1];
            // alert("✅ Project ID trouvé: " + config.project_id);
        }
        
        // Extraire template
        var templateMatch = jsonString.match(/"template":\s*"([^"]+)"/);
        if (templateMatch) {
            config.template = templateMatch[1];
        }
        
        // Extraire prompt
        var promptMatch = jsonString.match(/"prompt":\s*"([^"]+)"/);
        if (promptMatch) {
            config.prompt = promptMatch[1];
            // alert("✅ Prompt trouvé: " + config.prompt);
        }
        
        // Extraire text_content
        var textMatch = jsonString.match(/"text_content":\s*"([^"]+)"/);
        if (textMatch) {
            config.text_content = textMatch[1];
        }
        
        // Extraire subtitle
        var subtitleMatch = jsonString.match(/"subtitle":\s*"([^"]+)"/);
        if (subtitleMatch) {
            config.subtitle = subtitleMatch[1];
        }
        
        // Extraire rectangle_index
        var rectangleMatch = jsonString.match(/"rectangle_index":\s*"([^"]+)"/);
        config.rectangle_index = rectangleMatch ? parseInt(rectangleMatch[1]) : 0;
        // alert("🔍 Rectangle sélectionné: " + config.rectangle_index);
        
        // Extraire images (chercher les chemins absolus)
        config.images = [];
        var imageMatches = jsonString.match(/"\/[^"]+\.(jpg|jpeg|png|gif|tiff|psd)"/gi);
        if (imageMatches) {
            for (var i = 0; i < imageMatches.length; i++) {
                // Enlever les guillemets
                var imagePath = imageMatches[i].substring(1, imageMatches[i].length - 1);
                config.images.push(imagePath);
            }
            // alert("✅ Images trouvées: " + config.images.length);
        }
        
        // alert("✅ Parsing terminé avec succès");
        return config;
        
    } catch (e) {
        // alert("❌ Erreur parsing JSON: " + e.toString());
        return null;
    }
}

function main() {
    try {
        // alert("🚀 Début du script InDesign");
        
        // Chemin de base fixe
        var basePath = "/Users/alexandreerrasti/Library/Mobile Documents/com~apple~CloudDocs/Indesign automation";
        
        // Trouver le dernier projet
        var uploadsFolder = new Folder(basePath + "/uploads");
        if (!uploadsFolder.exists) {
            // alert("❌ Dossier uploads non trouvé");
            return false;
        }
        
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
            // alert("❌ Aucun projet trouvé");
            return false;
        }
        
        // alert("✅ Projet trouvé: " + latestProject.name);
        
        // Lire la config
        var configFile = new File(latestProject + "/config.json");
        configFile.open("r");
        var configData = configFile.read();
        configFile.close();
        
        // Parser le JSON avec notre fonction
        var config = parseSimpleJSON(configData);
        if (!config) {
            // alert("❌ Erreur parsing config");
            return false;
        }
        
        alert("✅ Config parsée: " + config.project_id);
        alert("📋 Template: " + config.template);
        alert("📝 Prompt: " + config.prompt);
        alert("📄 Text: " + (config.text_content ? config.text_content.substring(0, 50) + "..." : "VIDE"));
        
        // Utiliser le template spécifié dans la config, ou par défaut Magazine art template 2
        var templateName = config.template || "Magazine art template 2.indt";
        
        // Normaliser le nom du template pour éviter les problèmes d'encodage
        if (templateName.indexOf("Magazine art template page 2") !== -1) {
            templateName = "Magazine art template 2.indt";
        }
        
        // Forcer l'extension .indt
        if (templateName.indexOf('.idml') !== -1) {
            templateName = templateName.replace('.idml', '.indt');
        } else if (templateName.indexOf('.indt') === -1) {
            templateName += '.indt';
        }
        
        // Ouvrir le template
        alert("🔍 Recherche template: " + templateName);
        var templatePath = basePath + "/indesign_templates/" + templateName;
        alert("📁 Chemin complet: " + templatePath);
        var templateFile = new File(templatePath);
        
        if (!templateFile.exists) {
            alert("❌ Template non trouvé: " + templatePath);
            alert("🔍 Templates disponibles:");
            var templatesFolder = new Folder(basePath + "/indesign_templates");
            var files = templatesFolder.getFiles("*.indt");
            for (var i = 0; i < files.length; i++) {
                alert("  - " + files[i].name);
            }
            return false;
        }
        
        alert("✅ Template trouvé, taille: " + templateFile.length + " bytes");
        
        // alert("📄 Template trouvé, taille: " + templateFile.length + " bytes");
        
        try {
            var doc = app.open(templateFile);
            alert("✅ Template ouvert avec succès!");
            alert("📄 Document pages: " + doc.pages.length);
            alert("🔍 Début traitement du texte...");
        } catch (openError) {
            alert("❌ Erreur ouverture template: " + openError.toString());
            return false;
        }
        
        // Remplacer le texte selon le template utilisé
        try {
            app.findTextPreferences = NothingEnum.NOTHING;
            app.changeTextPreferences = NothingEnum.NOTHING;
            
            // Détecter quel template on utilise depuis le nom du fichier
            var templateName = templateFile.name;
            alert("🔍 Template détecté: " + templateName);
            
            // Décoder les caractères URL encodés
            templateName = decodeURIComponent(templateName);
            
            if (templateName.indexOf("Magazine art template 2") !== -1) {
                // Template Art Page 2: Recherche des vrais placeholders du template
                alert("🔍 Template 2 détecté - Recherche des placeholders réels");
                
                // Titre (limité à 12 caractères)
                var titre = config.title || config.prompt || "TITRE";
                if (titre.length > 12) {
                    titre = titre.substring(0, 12);
                }
                app.findTextPreferences.findWhat = "{{TITRE}}";
                app.changeTextPreferences.changeTo = titre;
                var foundTitre = doc.changeText();
                alert("✅ {{TITRE}} remplacé: " + foundTitre.length + " occurrence(s)");
                app.findTextPreferences = NothingEnum.NOTHING;
                app.changeTextPreferences = NothingEnum.NOTHING;
                
                // Encadré 1
                app.findTextPreferences.findWhat = "{{ENCADRE_1}}";
                app.changeTextPreferences.changeTo = config.encadre_1 || config.subtitle || "Encadré 1";
                var foundEncadre1 = doc.changeText();
                alert("✅ {{ENCADRE_1}} remplacé: " + foundEncadre1.length + " occurrence(s)");
                app.findTextPreferences = NothingEnum.NOTHING;
                app.changeTextPreferences = NothingEnum.NOTHING;
                
                // Encadré 2
                app.findTextPreferences.findWhat = "{{ENCADRE_2}}";
                app.changeTextPreferences.changeTo = config.encadre_2 || "Encadré 2";
                var foundEncadre2 = doc.changeText();
                alert("✅ {{ENCADRE_2}} remplacé: " + foundEncadre2.length + " occurrence(s)");
                app.findTextPreferences = NothingEnum.NOTHING;
                app.changeTextPreferences = NothingEnum.NOTHING;
                
                // Encadré 3
                app.findTextPreferences.findWhat = "{{ENCADRE_3}}";
                app.changeTextPreferences.changeTo = config.encadre_3 || "Encadré 3";
                var foundEncadre3 = doc.changeText();
                alert("✅ {{ENCADRE_3}} remplacé: " + foundEncadre3.length + " occurrence(s)");
                app.findTextPreferences = NothingEnum.NOTHING;
                app.changeTextPreferences = NothingEnum.NOTHING;
                
                // Article principal
                app.findTextPreferences.findWhat = "{{ARTICLE_PRINCIPAL}}";
                app.changeTextPreferences.changeTo = config.article_principal || config.text_content || "Article principal";
                var foundArticlePrincipal = doc.changeText();
                alert("✅ {{ARTICLE_PRINCIPAL}} remplacé: " + foundArticlePrincipal.length + " occurrence(s)");
                
                // Si aucun placeholder trouvé, essayer les placeholders par défaut
                if (foundTitre.length === 0 && foundEncadre1.length === 0 && foundEncadre2.length === 0) {
                    alert("⚠️ Aucun placeholder {{}} trouvé - Test des textes par défaut");
                    
                    // Essayer "MAGAZINE" pour surtitre
                    app.findTextPreferences.findWhat = "MAGAZINE";
                    app.changeTextPreferences.changeTo = config.category || "TECHNOLOGIE";
                    var foundMag = doc.changeText();
                    alert("✅ 'MAGAZINE' remplacé: " + foundMag.length + " occurrence(s)");
                    app.findTextPreferences = NothingEnum.NOTHING;
                    app.changeTextPreferences = NothingEnum.NOTHING;
                }
                
            } else if (templateName.indexOf("Magazine art template page 2") !== -1) {
                // Magazine Art Template Page 2: Essayer différents placeholders
                alert("🔍 Template Page 2 détecté - Test des placeholders");
                
                // Essayer de remplacer "TITRE PAR DÉFAUT" directement
                app.findTextPreferences.findWhat = "TITRE PAR DÉFAUT";
                app.changeTextPreferences.changeTo = config.title || config.prompt || "NOUVEAU TITRE";
                var foundTitreDefaut = doc.changeText();
                alert("✅ 'TITRE PAR DÉFAUT' remplacé: " + foundTitreDefaut.length + " occurrence(s)");
                app.findTextPreferences = NothingEnum.NOTHING;
                app.changeTextPreferences = NothingEnum.NOTHING;
                
                // Essayer de remplacer "Sous-titre par défaut"
                app.findTextPreferences.findWhat = "Sous-titre par défaut";
                app.changeTextPreferences.changeTo = config.subtitle || "Nouveau sous-titre";
                var foundSousTitreDefaut = doc.changeText();
                alert("✅ 'Sous-titre par défaut' remplacé: " + foundSousTitreDefaut.length + " occurrence(s)");
                app.findTextPreferences = NothingEnum.NOTHING;
                app.changeTextPreferences = NothingEnum.NOTHING;
                
                // Essayer de remplacer le texte avec lettrine (commence par "L'intelligence artificielle")
                app.findTextPreferences.findWhat = "L'intelligence artificielle";
                var articleText = config.article_principal || config.text_content || "Nouveau contenu d'article";
                app.changeTextPreferences.changeTo = articleText;
                var foundArticleIA = doc.changeText();
                alert("✅ Texte IA remplacé: " + foundArticleIA.length + " occurrence(s) avec: " + articleText.substring(0, 30) + "...");
                app.findTextPreferences = NothingEnum.NOTHING;
                app.changeTextPreferences = NothingEnum.NOTHING;
                
                // Essayer les placeholders standards aussi
                app.findTextPreferences.findWhat = "{{TITRE}}";
                app.changeTextPreferences.changeTo = config.title || config.prompt || "TITRE REMPLACÉ";
                var foundTitre = doc.changeText();
                alert("✅ {{TITRE}} remplacé: " + foundTitre.length + " occurrence(s)");
                app.findTextPreferences = NothingEnum.NOTHING;
                app.changeTextPreferences = NothingEnum.NOTHING;
                
                // Article principal
                app.findTextPreferences.findWhat = "{{ARTICLE_PRINCIPAL}}";
                app.changeTextPreferences.changeTo = articleText;
                var foundArticle = doc.changeText();
                alert("✅ {{ARTICLE_PRINCIPAL}} remplacé: " + foundArticle.length + " occurrence(s)");
                
            } else if (templateName.indexOf("Template art page 2") !== -1) {
                // Template Art Page 2: {{TITRE}}, {{SOUS-TITRE}}, {{ARTICLE}}
                
                // 1. Remplacer "{{TITRE}}" 
                app.findTextPreferences.findWhat = "{{TITRE}}";
                app.changeTextPreferences.changeTo = config.prompt || "Nouveau titre";
                var foundTitre = doc.changeText();
                // alert("✅ {{TITRE}} remplacé: " + foundTitre.length + " occurrence(s)");
                
                app.findTextPreferences = NothingEnum.NOTHING;
                app.changeTextPreferences = NothingEnum.NOTHING;
                
                // 2. Remplacer "{{SOUS-TITRE}}"
                app.findTextPreferences.findWhat = "{{SOUS-TITRE}}";
                var subtitleText = config.subtitle || "Sous-titre par défaut";
                app.changeTextPreferences.changeTo = subtitleText;
                var foundSousTitre = doc.changeText();
                // alert("✅ {{SOUS-TITRE}} remplacé: " + foundSousTitre.length + " occurrence(s)");
                
                app.findTextPreferences = NothingEnum.NOTHING;
                app.changeTextPreferences = NothingEnum.NOTHING;
                
                // 3. Remplacer "{{ARTICLE}}"
                app.findTextPreferences.findWhat = "{{ARTICLE}}";
                app.changeTextPreferences.changeTo = config.text_content || "Contenu de l'article";
                var foundArticle = doc.changeText();
                // alert("✅ {{ARTICLE}} remplacé: " + foundArticle.length + " occurrence(s)");
                
            } else if (templateName.indexOf("template-mag-simple-1808") !== -1) {
                // Template 1: {{TITRE}}, {{SOUS-TITRE}}, {{ARTICLE}}
                
                // 1. Remplacer "{{TITRE}}" 
                app.findTextPreferences.findWhat = "{{TITRE}}";
                app.changeTextPreferences.changeTo = config.prompt || "Nouveau titre";
                var foundTitre = doc.changeText();
                // alert("✅ {{TITRE}} remplacé: " + foundTitre.length + " occurrence(s)");
                
                app.findTextPreferences = NothingEnum.NOTHING;
                app.changeTextPreferences = NothingEnum.NOTHING;
                
                // 2. Remplacer "{{SOUS-TITRE}}"
                app.findTextPreferences.findWhat = "{{SOUS-TITRE}}";
                var subtitleText = config.subtitle || "Sous-titre par défaut";
                app.changeTextPreferences.changeTo = subtitleText;
                var foundSousTitre = doc.changeText();
                // alert("✅ {{SOUS-TITRE}} remplacé: " + foundSousTitre.length + " occurrence(s)");
                
                app.findTextPreferences = NothingEnum.NOTHING;
                app.changeTextPreferences = NothingEnum.NOTHING;
                
                // 3. Remplacer "{{ARTICLE}}"
                app.findTextPreferences.findWhat = "{{ARTICLE}}";
                app.changeTextPreferences.changeTo = config.text_content || "Contenu de l'article";
                var foundArticle = doc.changeText();
                // alert("✅ {{ARTICLE}} remplacé: " + foundArticle.length + " occurrence(s)");
                
            } else if (templateName.indexOf("Template art page 1.indt") !== -1) {
                // Template Magazine Complexe (6 blocs): structure avancée
                
                // 1. Titre principal (INTRODUCTION)
                app.findTextPreferences.findWhat = "{{TITRE_PRINCIPAL}}";
                app.changeTextPreferences.changeTo = config.prompt || "INTRODUCTION";
                doc.changeText();
                
                app.findTextPreferences = NothingEnum.NOTHING;
                app.changeTextPreferences = NothingEnum.NOTHING;
                
                // 2. Surtitre (MAGAZINE)
                app.findTextPreferences.findWhat = "{{SURTITRE}}";
                app.changeTextPreferences.changeTo = config.category || "MAGAZINE";
                doc.changeText();
                
                app.findTextPreferences = NothingEnum.NOTHING;
                app.changeTextPreferences = NothingEnum.NOTHING;
                
                // 3. Article principal (colonne gauche)
                app.findTextPreferences.findWhat = "{{ARTICLE_PRINCIPAL}}";
                app.changeTextPreferences.changeTo = config.text_content || config.article_principal || "Article principal";
                doc.changeText();
                
                app.findTextPreferences = NothingEnum.NOTHING;
                app.changeTextPreferences = NothingEnum.NOTHING;
                
                // 4. Encadré 1 (droite haut)
                app.findTextPreferences.findWhat = "{{ENCADRE_1}}";
                app.changeTextPreferences.changeTo = config.encadre_1 || "Premier point clé de l'article";
                doc.changeText();
                
                app.findTextPreferences = NothingEnum.NOTHING;
                app.changeTextPreferences = NothingEnum.NOTHING;
                
                // 5. Encadré 2 (droite milieu)
                app.findTextPreferences.findWhat = "{{ENCADRE_2}}";
                app.changeTextPreferences.changeTo = config.encadre_2 || "Deuxième point important";
                doc.changeText();
                
                app.findTextPreferences = NothingEnum.NOTHING;
                app.changeTextPreferences = NothingEnum.NOTHING;
                
                // 6. Encadré 3 (droite bas)
                app.findTextPreferences.findWhat = "{{ENCADRE_3}}";
                app.changeTextPreferences.changeTo = config.encadre_3 || "Conclusion ou point final";
                doc.changeText();
                
            } else if (templateName.indexOf("Template art page 1") !== -1) {
                // Template Art Page 1 ou 2: {{TITRE}}, {{SOUS-TITRE}}, {{ARTICLE}}
                
                // 1. Remplacer "{{TITRE}}" 
                app.findTextPreferences.findWhat = "{{TITRE}}";
                app.changeTextPreferences.changeTo = config.prompt || "Nouveau titre";
                var foundTitre = doc.changeText();
                // alert("✅ {{TITRE}} remplacé: " + foundTitre.length + " occurrence(s)");
                
                app.findTextPreferences = NothingEnum.NOTHING;
                app.changeTextPreferences = NothingEnum.NOTHING;
                
                // 2. Remplacer "{{SOUS-TITRE}}"
                app.findTextPreferences.findWhat = "{{SOUS-TITRE}}";
                var subtitleText = config.subtitle || "Sous-titre par défaut";
                app.changeTextPreferences.changeTo = subtitleText;
                var foundSousTitre = doc.changeText();
                // alert("✅ {{SOUS-TITRE}} remplacé: " + foundSousTitre.length + " occurrence(s)");
                
                app.findTextPreferences = NothingEnum.NOTHING;
                app.changeTextPreferences = NothingEnum.NOTHING;
                
                // 3. Remplacer "{{ARTICLE}}"
                app.findTextPreferences.findWhat = "{{ARTICLE}}";
                app.changeTextPreferences.changeTo = config.text_content || "Contenu de l'article";
                var foundArticle = doc.changeText();
                // alert("✅ {{ARTICLE}} remplacé: " + foundArticle.length + " occurrence(s)");
                
            } else if (templateName.indexOf("template-mag-simple-2-1808") !== -1) {
                // Template 2: seulement {{ARTICLE}}
                
                app.findTextPreferences.findWhat = "{{ARTICLE}}";
                var fullText = config.prompt || "Titre";
                if (config.text_content) {
                    fullText += "\n\n" + config.text_content;
                }
                app.changeTextPreferences.changeTo = fullText;
                var foundArticle = doc.changeText();
                // alert("✅ {{ARTICLE}} remplacé: " + foundArticle.length + " occurrence(s)");
                
            } else {
                // Template non reconnu, essayer l'ancienne méthode
                // alert("⚠️ Template non reconnu, utilisation méthode par défaut");
                app.findTextPreferences.findWhat = "TEXTE";
                var defaultText = config.prompt || "Nouveau titre";
                if (config.text_content) {
                    defaultText += "\n\n" + config.text_content;
                }
                app.changeTextPreferences.changeTo = defaultText;
                doc.changeText();
            }
            
            app.findTextPreferences = NothingEnum.NOTHING;
            app.changeTextPreferences = NothingEnum.NOTHING;
            
        } catch (textError) {
            // alert("⚠️ Erreur texte: " + textError.toString());
        }
        
        // Debug: vérifier qu'on arrive à la partie image
        // alert("🔍 DEBUT section image - Images config: " + (config.images ? config.images.length : 0));
        
        // Placer l'image (si elle existe)
        if (config.images && config.images.length > 0) {
            try {
                // Debug: écrire dans log
                var logFile = new File(basePath + "/debug_indesign.log");
                logFile.open("a");
                logFile.writeln("=== DEBUG IMAGE " + new Date() + " ===");
                logFile.writeln("📊 Rectangles: " + doc.pages[0].rectangles.length);
                logFile.writeln("🔍 Image path: " + config.images[0]);
                logFile.close();
                
                var imageFile = new File(config.images[0]);
                
                if (imageFile.exists) {
                    if (doc.pages[0].rectangles.length > 0) {
                        // Utiliser le rectangle choisi par l'utilisateur
                        var rectangleIndex = config.rectangle_index || 0;
                        
                        if (rectangleIndex < doc.pages[0].rectangles.length) {
                            var rectangle = doc.pages[0].rectangles[rectangleIndex];
                            rectangle.place(imageFile);
                            rectangle.fit(FitOptions.CONTENT_TO_FRAME);
                            rectangle.fit(FitOptions.CENTER_CONTENT);
                            // alert("✅ Image placée dans rectangle " + rectangleIndex);
                        } else {
                            // alert("❌ Rectangle " + rectangleIndex + " n'existe pas");
                        }
                    } else {
                        // alert("⚠️ Pas de rectangle pour l'image");
                    }
                } else {
                    // alert("⚠️ Image non trouvée: " + config.images[0]);
                }
            } catch (imageError) {
                // alert("⚠️ Erreur image: " + imageError.toString());
            }
        }
        
        // Sauvegarder
        try {
            alert("💾 Début sauvegarde...");
            var outputFolder = new Folder(basePath + "/output");
            if (!outputFolder.exists) {
                outputFolder.create();
                alert("📁 Dossier output créé");
            }
            
            var outputFile = new File(outputFolder + "/" + config.project_id + ".indd");
            alert("💾 Sauvegarde vers: " + outputFile.fsName);
            doc.save(outputFile);
            doc.close();
            
            alert("🎉 SUCCÈS! Document créé: " + config.project_id + ".indd");
            return true;
            
        } catch (saveError) {
            alert("❌ Erreur sauvegarde: " + saveError.toString());
            try { doc.close(); } catch(e) {}
            return false;
        }
        
    } catch (error) {
        // alert("❌ ERREUR GÉNÉRALE: " + error.toString());
        return false;
    }
}

// Exécuter
main();