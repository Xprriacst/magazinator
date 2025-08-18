// Script InDesign qui crée vraiment un document
#target indesign

function main() {
    try {
        // Récupérer le chemin de config
        var configPath = "";
        if (typeof $.arguments !== 'undefined' && $.arguments.length > 0) {
            configPath = $.arguments[0];
        } else {
            // Fallback pour test direct
            configPath = "/Users/alexandreerrasti/Library/Mobile Documents/com~apple~CloudDocs/Indesign automation/uploads/test/config.json";
        }
        
        // Lire la configuration
        var configFile = new File(configPath);
        if (!configFile.exists) {
            alert("Fichier de configuration non trouvé: " + configPath);
            return;
        }
        
        configFile.open("r");
        var configData = configFile.read();
        configFile.close();
        
        var config = JSON.parse(configData);
        
        // Créer un nouveau document A4
        var doc = app.documents.add();
        var page = doc.pages[0];
        
        // Définir la taille de page (A4)
        doc.documentPreferences.pageWidth = "210mm";
        doc.documentPreferences.pageHeight = "297mm";
        
        // TITRE PRINCIPAL
        var titleFrame = page.textFrames.add();
        titleFrame.geometricBounds = ["20mm", "20mm", "40mm", "190mm"];
        titleFrame.contents = config.layout_instructions.title_text || config.prompt || "TITRE";
        
        // Style du titre
        var titleStyle = titleFrame.paragraphs[0];
        titleStyle.appliedFont = "Arial\tBold";
        titleStyle.pointSize = 24;
        titleStyle.justification = Justification.CENTER_ALIGN;
        
        // CONTENU PRINCIPAL
        var contentFrame = page.textFrames.add();
        contentFrame.geometricBounds = ["50mm", "20mm", "200mm", "100mm"];
        contentFrame.contents = config.text_content || "Contenu automatique généré";
        
        // Style du contenu
        var contentStyle = contentFrame.paragraphs[0];
        contentStyle.appliedFont = "Arial\tRegular";
        contentStyle.pointSize = 11;
        contentStyle.justification = Justification.LEFT_ALIGN;
        
        // PLACEMENT DES IMAGES (si disponibles)
        if (config.images && config.images.length > 0) {
            var imageY = 50;
            for (var i = 0; i < Math.min(config.images.length, 2); i++) {
                var imageFile = new File(config.images[i]);
                if (imageFile.exists) {
                    try {
                        var imageFrame = page.rectangles.add();
                        imageFrame.geometricBounds = [imageY + "mm", "110mm", (imageY + 60) + "mm", "190mm"];
                        imageFrame.place(imageFile);
                        imageFrame.fit(FitOptions.PROPORTIONALLY);
                        imageY += 70;
                    } catch (e) {
                        // Ignore les erreurs d'images
                    }
                }
            }
        }
        
        // INFORMATIONS DE GÉNÉRATION
        var infoFrame = page.textFrames.add();
        infoFrame.geometricBounds = ["260mm", "20mm", "280mm", "190mm"];
        infoFrame.contents = "Généré automatiquement le " + new Date().toLocaleDateString() + "\nProject ID: " + config.project_id;
        var infoStyle = infoFrame.paragraphs[0];
        infoStyle.appliedFont = "Arial\tRegular";
        infoStyle.pointSize = 8;
        infoStyle.justification = Justification.LEFT_ALIGN;
        
        // SAUVEGARDER LE DOCUMENT
        var outputFolder = new Folder(File(configPath).parent.parent + "/output");
        if (!outputFolder.exists) {
            outputFolder.create();
        }
        
        var outputFile = new File(outputFolder + "/" + config.project_id + ".indd");
        doc.save(outputFile);
        
        // Fermer le document pour libérer la mémoire
        doc.close();
        
        // Confirmation
        alert("✅ Document créé avec succès: " + outputFile.fsName);
        
    } catch (error) {
        alert("❌ Erreur: " + error.toString());
    }
}

// Exécuter
main();