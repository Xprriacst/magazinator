// Script simple pour créer un template InDesign de base
// À exécuter dans InDesign pour créer le template standard

#target indesign

function createSimpleTemplate() {
    try {
        // Créer un nouveau document A4
        var doc = app.documents.add();
        
        // Configuration de la page
        var page = doc.pages[0];
        page.marginPreferences.top = "20mm";
        page.marginPreferences.bottom = "20mm";
        page.marginPreferences.left = "15mm";
        page.marginPreferences.right = "15mm";
        
        // Créer les styles de base
        createBasicStyles(doc);
        
        // Créer les blocs de contenu avec des noms spécifiques
        createContentBlocks(page);
        
        // Sauvegarder le template
        var templateFolder = new Folder(Folder.desktop + "/InDesign_Templates");
        if (!templateFolder.exists) {
            templateFolder.create();
        }
        
        var templateFile = new File(templateFolder + "/magazine_template.indt");
        doc.save(templateFile);
        
        alert("Template 'magazine_template.indt' créé avec succès sur le Bureau dans le dossier InDesign_Templates!");
        
    } catch (error) {
        alert("Erreur lors de la création du template: " + error.toString());
    }
}

function createBasicStyles(doc) {
    // Style titre principal
    var titleStyle = doc.paragraphStyles.add();
    titleStyle.name = "AI_Title";
    titleStyle.appliedFont = app.fonts.item("Arial\tBold") || app.fonts[0];
    titleStyle.pointSize = 28;
    titleStyle.spaceAfter = 15;
    titleStyle.justification = Justification.CENTER_ALIGN;
    
    // Style corps de texte
    var bodyStyle = doc.paragraphStyles.add();
    bodyStyle.name = "AI_Body";
    bodyStyle.appliedFont = app.fonts.item("Arial\tRegular") || app.fonts[0];
    bodyStyle.pointSize = 11;
    bodyStyle.leading = 14;
    bodyStyle.spaceAfter = 5;
    bodyStyle.justification = Justification.FULLY_JUSTIFIED;
    
    // Style légende
    var captionStyle = doc.paragraphStyles.add();
    captionStyle.name = "AI_Caption";
    captionStyle.appliedFont = app.fonts.item("Arial\tItalic") || app.fonts[0];
    captionStyle.pointSize = 9;
    captionStyle.leading = 11;
    captionStyle.justification = Justification.LEFT_ALIGN;
}

function createContentBlocks(page) {
    // Bloc titre - sera rempli par l'IA
    var titleFrame = page.textFrames.add();
    titleFrame.name = "AI_TITLE_BLOCK";
    titleFrame.geometricBounds = ["20mm", "15mm", "45mm", "195mm"];
    titleFrame.contents = "[TITRE - sera remplacé par l'IA]";
    titleFrame.parentStory.paragraphs[0].appliedParagraphStyle = page.parent.paragraphStyles.item("AI_Title");
    
    // Bloc image principale
    var mainImageFrame = page.rectangles.add();
    mainImageFrame.name = "AI_IMAGE_1";
    mainImageFrame.geometricBounds = ["55mm", "105mm", "140mm", "195mm"];
    mainImageFrame.strokeWeight = 0.5;
    mainImageFrame.strokeColor = page.parent.colors.item("Black");
    
    // Texte placeholder pour l'image
    var imagePlaceholder = mainImageFrame.textFrames.add();
    imagePlaceholder.geometricBounds = ["90mm", "130mm", "105mm", "170mm"];
    imagePlaceholder.contents = "[IMAGE 1]";
    imagePlaceholder.parentStory.paragraphs[0].justification = Justification.CENTER_ALIGN;
    imagePlaceholder.parentStory.paragraphs[0].pointSize = 12;
    
    // Bloc texte principal
    var bodyFrame = page.textFrames.add();
    bodyFrame.name = "AI_BODY_TEXT";
    bodyFrame.geometricBounds = ["55mm", "15mm", "200mm", "100mm"];
    bodyFrame.contents = "[CONTENU TEXTE - sera remplacé par le contenu utilisateur]";
    bodyFrame.parentStory.paragraphs[0].appliedParagraphStyle = page.parent.paragraphStyles.item("AI_Body");
    
    // Configuration en colonnes
    bodyFrame.textFramePreferences.textColumnCount = 2;
    bodyFrame.textFramePreferences.textColumnGutter = "5mm";
    
    // Bloc image secondaire (optionnel)
    var secondImageFrame = page.rectangles.add();
    secondImageFrame.name = "AI_IMAGE_2";
    secondImageFrame.geometricBounds = ["150mm", "105mm", "200mm", "140mm"];
    secondImageFrame.strokeWeight = 0.5;
    secondImageFrame.strokeColor = page.parent.colors.item("Black");
    
    // Placeholder pour image 2
    var image2Placeholder = secondImageFrame.textFrames.add();
    image2Placeholder.geometricBounds = ["165mm", "115mm", "175mm", "130mm"];
    image2Placeholder.contents = "[IMG 2]";
    image2Placeholder.parentStory.paragraphs[0].justification = Justification.CENTER_ALIGN;
    image2Placeholder.parentStory.paragraphs[0].pointSize = 10;
    
    // Bloc légende
    var captionFrame = page.textFrames.add();
    captionFrame.name = "AI_CAPTION";
    captionFrame.geometricBounds = ["205mm", "105mm", "215mm", "195mm"];
    captionFrame.contents = "[Légende des images]";
    captionFrame.parentStory.paragraphs[0].appliedParagraphStyle = page.parent.paragraphStyles.item("AI_Caption");
    
    // Bloc image 3 (pour plus d'images)
    var thirdImageFrame = page.rectangles.add();
    thirdImageFrame.name = "AI_IMAGE_3";
    thirdImageFrame.geometricBounds = ["220mm", "15mm", "260mm", "50mm"];
    thirdImageFrame.strokeWeight = 0.5;
    thirdImageFrame.strokeColor = page.parent.colors.item("Black");
    
    // Placeholder pour image 3
    var image3Placeholder = thirdImageFrame.textFrames.add();
    image3Placeholder.geometricBounds = ["230mm", "25mm", "240mm", "40mm"];
    image3Placeholder.contents = "[IMG 3]";
    image3Placeholder.parentStory.paragraphs[0].justification = Justification.CENTER_ALIGN;
    image3Placeholder.parentStory.paragraphs[0].pointSize = 10;
}

// Exécuter la création du template
createSimpleTemplate();
