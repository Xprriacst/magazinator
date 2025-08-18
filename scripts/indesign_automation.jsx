// InDesign Automation Script Simplifié
// Ce script remplit un template InDesign avec le contenu utilisateur

#target indesign

// Fonction principale
function main() {
    try {
        // Récupérer les arguments passés par le script Python
        var args = app.scriptArgs.getValue("config_path");
        // Fallback: supporte les arguments passés via "with arguments" -> $.arguments[0]
        if ((!args || args === "") && (typeof $.arguments !== 'undefined') && $.arguments.length > 0) {
            args = $.arguments[0];
        }
        if (!args) {
            alert("Erreur: Chemin de configuration non fourni. scriptArgs: " + app.scriptArgs.length + " arguments: " + (typeof $.arguments !== 'undefined' ? $.arguments.length : 'undefined'));
            return;
        }
        
        // Debug: Log du chemin reçu
        alert("DEBUG: Chemin reçu: " + args);
        
        // Lire le fichier de configuration
        var configFile = new File(args);
        alert("DEBUG: Fichier existe? " + configFile.exists + " - Chemin: " + configFile.fsName);
        
        if (!configFile.exists) {
            // Essayer des chemins alternatifs
            var altPaths = [
                args,
                args.replace(/^\/Users/, "/Users"),
                "/Users/alexandreerrasti/Library/Mobile Documents/com~apple~CloudDocs/Indesign automation/" + args
            ];
            
            for (var i = 0; i < altPaths.length; i++) {
                var testFile = new File(altPaths[i]);
                alert("DEBUG: Test chemin " + i + ": " + altPaths[i] + " = " + testFile.exists);
                if (testFile.exists) {
                    configFile = testFile;
                    break;
                }
            }
            
            if (!configFile.exists) {
                alert("Erreur: Fichier de configuration non trouvé après tous les tests: " + args);
                return;
            }
        }
        
        configFile.open("r");
        var configData = configFile.read();
        configFile.close();
        
        var config = JSON.parse(configData);
        
        // Ouvrir le template standard
        var doc = openTemplate();
        
        // Remplir le template avec le contenu
        fillTemplate(doc, config);
        
        // Sauvegarder le document
        saveDocument(doc, config.project_id);
        
    } catch (error) {
        alert("Erreur lors de l'exécution du script: " + error.toString());
    }
}

// Ouvrir le template standard
function openTemplate() {
    try {
        // Chercher le template dans plusieurs emplacements
        var templatePaths = [
            new File(Folder.desktop + "/InDesign_Templates/magazine_template.indt"),
            new File(app.activeScript.parent.parent + "/indesign_templates/magazine_template.indt"),
            new File(app.activeScript.parent.parent + "/templates/magazine_template.indt")
        ];
        
        for (var i = 0; i < templatePaths.length; i++) {
            if (templatePaths[i].exists) {
                return app.open(templatePaths[i]);
            }
        }
        
        // Si aucun template trouvé, créer un document basique
        alert("Template non trouvé, création d'un document basique");
        return createBasicDocument();
        
    } catch (error) {
        alert("Erreur lors de l'ouverture du template: " + error.toString());
        return createBasicDocument();
    }
}

// Créer un document basique si le template n'est pas trouvé
function createBasicDocument() {
    var doc = app.documents.add();
    var page = doc.pages[0];
    
    // Configuration basique
    page.marginPreferences.top = "20mm";
    page.marginPreferences.bottom = "20mm";
    page.marginPreferences.left = "15mm";
    page.marginPreferences.right = "15mm";
    
    return doc;
}

// Obtenir le chemin du template
function getTemplatePath(templateName) {
    var templatesFolder = new Folder(app.activeScript.parent.parent + "/indesign_templates");
    if (!templatesFolder.exists) {
        return null;
    }
    
    var templateFile = new File(templatesFolder + "/" + templateName + ".indt");
    return templateFile.exists ? templateFile : null;
}

// Configurer les paramètres par défaut du document
function setupDocumentDefaults(doc) {
    try {
        var page = doc.pages[0];
        
        // Définir les marges (en points)
        page.marginPreferences.top = 36; // 0.5 inch
        page.marginPreferences.bottom = 36;
        page.marginPreferences.left = 36;
        page.marginPreferences.right = 36;
        
        // Configurer les colonnes
        page.marginPreferences.columnCount = 2;
        page.marginPreferences.columnGutter = 12; // 1 pica
        
    } catch (error) {
        // Ignorer les erreurs de configuration par défaut
    }
}

// Remplir le template avec le contenu utilisateur
function fillTemplate(doc, config) {
    try {
        var page = doc.pages[0];
        var instructions = config.layout_instructions || {};
        
        // Remplir le titre
        fillTitle(doc, instructions.title_text || "Titre de l'article", instructions.title_style);
        
        // Remplir le contenu textuel
        if (config.text_content) {
            fillBodyText(doc, config.text_content, instructions.text_layout);
        }
        
        // Placer les images
        if (config.images && config.images.length > 0) {
            placeImages(doc, config.images);
        }
        
        // Appliquer les styles selon les instructions OpenAI
        applyAIStyles(doc, instructions);
        
    } catch (error) {
        alert("Erreur lors du remplissage du template: " + error.toString());
    }
}

// Remplir le bloc titre
function fillTitle(doc, titleText, titleStyle) {
    try {
        // Chercher le bloc titre par son nom
        var titleFrame = findTextFrameByName(doc, "AI_TITLE_BLOCK");
        if (titleFrame) {
            titleFrame.contents = titleText;
            
            // Appliquer le style si spécifié
            if (titleStyle && titleStyle.font_size) {
                titleFrame.parentStory.characters.everyItem().pointSize = titleStyle.font_size;
            }
        }
    } catch (error) {
        // Ignorer les erreurs de titre
    }
}

// Remplir le contenu textuel
function fillBodyText(doc, textContent, textLayout) {
    try {
        var bodyFrame = findTextFrameByName(doc, "AI_BODY_TEXT");
        if (bodyFrame) {
            bodyFrame.contents = textContent;
            
            // Appliquer les paramètres de mise en page
            if (textLayout) {
                if (textLayout.columns) {
                    bodyFrame.textFramePreferences.textColumnCount = Math.min(3, Math.max(1, textLayout.columns));
                }
                if (textLayout.font_size) {
                    bodyFrame.parentStory.characters.everyItem().pointSize = textLayout.font_size;
                }
                if (textLayout.line_spacing) {
                    bodyFrame.parentStory.characters.everyItem().leading = textLayout.line_spacing;
                }
            }
        }
    } catch (error) {
        // Ignorer les erreurs de texte
    }
}

// Placer les images dans les blocs prédéfinis
function placeImages(doc, imagePaths) {
    try {
        var imageBlocks = ["AI_IMAGE_1", "AI_IMAGE_2", "AI_IMAGE_3"];
        
        for (var i = 0; i < imagePaths.length && i < imageBlocks.length; i++) {
            var imageFrame = findRectangleByName(doc, imageBlocks[i]);
            if (imageFrame) {
                var imageFile = new File(imagePaths[i]);
                if (imageFile.exists) {
                    // Supprimer le texte placeholder s'il existe
                    if (imageFrame.textFrames.length > 0) {
                        imageFrame.textFrames[0].remove();
                    }
                    
                    // Placer l'image
                    imageFrame.place(imageFile);
                    imageFrame.fit(FitOptions.PROPORTIONALLY);
                    imageFrame.fit(FitOptions.CENTER_CONTENT);
                }
            }
        }
    } catch (error) {
        alert("Erreur lors du placement des images: " + error.toString());
    }
}

// Appliquer les styles générés par l'IA
function applyAIStyles(doc, instructions) {
    try {
        // Appliquer le schéma de couleurs si spécifié
        if (instructions.color_scheme && instructions.color_scheme.length > 0) {
            // Pour l'instant, appliquer la couleur principale au titre
            var titleFrame = findTextFrameByName(doc, "AI_TITLE_BLOCK");
            if (titleFrame && instructions.color_scheme[0]) {
                // Créer ou utiliser une couleur
                var colorValue = hexToRGB(instructions.color_scheme[0]);
                if (colorValue) {
                    // Appliquer la couleur (implémentation basique)
                    titleFrame.parentStory.characters.everyItem().fillColor = doc.colors.item("Black");
                }
            }
        }
    } catch (error) {
        // Ignorer les erreurs de style
    }
}

// Fonctions utilitaires pour trouver les éléments par nom
function findTextFrameByName(doc, name) {
    try {
        for (var i = 0; i < doc.textFrames.length; i++) {
            if (doc.textFrames[i].name === name) {
                return doc.textFrames[i];
            }
        }
        return null;
    } catch (error) {
        return null;
    }
}

function findRectangleByName(doc, name) {
    try {
        for (var i = 0; i < doc.rectangles.length; i++) {
            if (doc.rectangles[i].name === name) {
                return doc.rectangles[i];
            }
        }
        return null;
    } catch (error) {
        return null;
    }
}

// Créer le titre
function createTitle(page, prompt, titleStyle) {
    try {
        // Extraire un titre potentiel du prompt
        var title = extractTitleFromPrompt(prompt);
        if (!title) title = "Titre de l'article";
        
        // Créer un bloc de texte pour le titre
        var titleFrame = page.textFrames.add();
        
        // Position et taille du titre
        var pageWidth = page.bounds[3] - page.bounds[1];
        var pageHeight = page.bounds[2] - page.bounds[0];
        
        titleFrame.geometricBounds = [
            page.marginPreferences.top,
            page.marginPreferences.left,
            page.marginPreferences.top + 60, // Hauteur du titre
            page.bounds[3] - page.marginPreferences.right
        ];
        
        // Ajouter le texte
        titleFrame.contents = title;
        
        // Appliquer le style
        var titleText = titleFrame.parentStory.characters.everyItem();
        titleText.appliedFont = app.fonts.item("Arial\tBold") || app.fonts[0];
        titleText.pointSize = (titleStyle && titleStyle.font_size) || 24;
        titleText.justification = Justification.CENTER_ALIGN;
        
        if (titleStyle && titleStyle.color) {
            applyTextColor(titleText, titleStyle.color);
        }
        
    } catch (error) {
        // Ignorer les erreurs de création de titre
    }
}

// Extraire un titre du prompt
function extractTitleFromPrompt(prompt) {
    // Logique simple pour extraire un titre
    var words = prompt.split(" ");
    if (words.length > 3) {
        return words.slice(0, 4).join(" ") + "...";
    }
    return words.join(" ");
}

// Placer les images
function placeImages(page, imagePaths, imagePlacement) {
    try {
        var placementRules = imagePlacement || [
            {position: "top_right", width: "40%", height: "auto"},
            {position: "bottom_left", width: "60%", height: "auto"}
        ];
        
        for (var i = 0; i < imagePaths.length && i < placementRules.length; i++) {
            var imagePath = imagePaths[i];
            var placement = placementRules[i];
            
            var imageFile = new File(imagePath);
            if (imageFile.exists) {
                placeImage(page, imageFile, placement, i);
            }
        }
        
    } catch (error) {
        // Ignorer les erreurs de placement d'images
    }
}

// Placer une image individuelle
function placeImage(page, imageFile, placement, index) {
    try {
        var imageFrame = page.rectangles.add();
        
        // Calculer la position selon les règles
        var bounds = calculateImageBounds(page, placement, index);
        imageFrame.geometricBounds = bounds;
        
        // Placer l'image
        imageFrame.place(imageFile);
        
        // Ajuster l'image dans le cadre
        imageFrame.fit(FitOptions.PROPORTIONALLY);
        imageFrame.fit(FitOptions.CENTER_CONTENT);
        
    } catch (error) {
        // Ignorer les erreurs de placement d'image individuelle
    }
}

// Calculer les limites de l'image
function calculateImageBounds(page, placement, index) {
    var pageWidth = page.bounds[3] - page.bounds[1];
    var pageHeight = page.bounds[2] - page.bounds[0];
    var margin = page.marginPreferences.top;
    
    var width = pageWidth * 0.4; // 40% par défaut
    var height = 200; // Hauteur par défaut
    
    // Parser la largeur si spécifiée
    if (placement.width && placement.width.indexOf("%") > -1) {
        var percent = parseInt(placement.width.replace("%", "")) / 100;
        width = pageWidth * percent;
    }
    
    var x, y;
    
    // Déterminer la position
    switch (placement.position) {
        case "top_right":
            x = page.bounds[3] - page.marginPreferences.right - width;
            y = margin + 80; // Après le titre
            break;
        case "top_left":
            x = page.marginPreferences.left;
            y = margin + 80;
            break;
        case "bottom_left":
            x = page.marginPreferences.left;
            y = page.bounds[2] - page.marginPreferences.bottom - height;
            break;
        case "bottom_right":
            x = page.bounds[3] - page.marginPreferences.right - width;
            y = page.bounds[2] - page.marginPreferences.bottom - height;
            break;
        default:
            // Position par défaut basée sur l'index
            x = page.marginPreferences.left + (index * 20);
            y = margin + 100 + (index * 150);
    }
    
    return [y, x, y + height, x + width];
}

// Créer le contenu textuel
function createTextContent(page, textContent, textLayout) {
    try {
        // Calculer la zone disponible pour le texte
        var textBounds = calculateTextBounds(page);
        
        // Créer le bloc de texte
        var textFrame = page.textFrames.add();
        textFrame.geometricBounds = textBounds;
        
        // Ajouter le contenu
        textFrame.contents = textContent;
        
        // Appliquer le style
        var bodyText = textFrame.parentStory.characters.everyItem();
        bodyText.appliedFont = app.fonts.item("Arial\tRegular") || app.fonts[0];
        bodyText.pointSize = (textLayout && textLayout.font_size) || 11;
        bodyText.leading = (textLayout && textLayout.line_spacing) || 14;
        
        // Justification
        if (textLayout && textLayout.alignment === "justified") {
            bodyText.justification = Justification.FULLY_JUSTIFIED;
        } else {
            bodyText.justification = Justification.LEFT_ALIGN;
        }
        
        // Colonnes
        if (textLayout && textLayout.columns > 1) {
            textFrame.textFramePreferences.textColumnCount = textLayout.columns;
            textFrame.textFramePreferences.textColumnGutter = 12;
        }
        
    } catch (error) {
        // Ignorer les erreurs de création de texte
    }
}

// Calculer les limites du texte
function calculateTextBounds(page) {
    var margin = page.marginPreferences.top;
    var leftMargin = page.marginPreferences.left;
    var rightMargin = page.marginPreferences.right;
    var bottomMargin = page.marginPreferences.bottom;
    
    // Zone de texte en évitant les images (approximation)
    return [
        margin + 150, // Après titre et première image
        leftMargin,
        page.bounds[2] - bottomMargin - 50,
        page.bounds[3] - rightMargin
    ];
}

// Appliquer une couleur au texte
function applyTextColor(textObject, colorHex) {
    try {
        // Créer une couleur spot si elle n'existe pas
        var colorName = "CustomColor_" + colorHex.replace("#", "");
        var color;
        
        try {
            color = app.activeDocument.colors.item(colorName);
            if (!color.isValid) {
                throw new Error("Color not found");
            }
        } catch (e) {
            color = app.activeDocument.colors.add();
            color.name = colorName;
            color.model = ColorModel.SPOT;
            color.colorValue = hexToRGB(colorHex);
        }
        
        textObject.fillColor = color;
        
    } catch (error) {
        // Ignorer les erreurs de couleur
    }
}

// Convertir hex en RGB
function hexToRGB(hex) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
}

// Appliquer le schéma de couleurs
function applyColorScheme(doc, colorScheme) {
    try {
        // Créer des couleurs personnalisées dans le document
        for (var i = 0; i < colorScheme.length; i++) {
            var colorHex = colorScheme[i];
            var colorName = "Scheme_" + i;
            
            var color = doc.colors.add();
            color.name = colorName;
            color.model = ColorModel.PROCESS;
            color.colorValue = hexToRGB(colorHex);
        }
    } catch (error) {
        // Ignorer les erreurs de schéma de couleurs
    }
}

// Sauvegarder le document
function saveDocument(doc, projectId) {
    try {
        var outputFolder = new Folder(app.activeScript.parent.parent + "/output");
        if (!outputFolder.exists) {
            outputFolder.create();
        }
        
        var saveFile = new File(outputFolder + "/" + projectId + ".indd");
        doc.save(saveFile);
        
    } catch (error) {
        alert("Erreur lors de la sauvegarde: " + error.toString());
    }
}

// Exécuter le script principal
main();
