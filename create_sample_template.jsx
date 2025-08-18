// Script pour créer un template InDesign de base
// À exécuter dans InDesign pour créer des templates de démonstration

#target indesign

function createMagazineTemplate() {
    try {
        // Créer un nouveau document
        var docPreset = app.documentPresets.add();
        docPreset.name = "Magazine Template";
        docPreset.pageWidth = "210mm";  // A4 width
        docPreset.pageHeight = "297mm"; // A4 height
        docPreset.facingPages = false;
        docPreset.pagesPerDocument = 1;
        
        var doc = app.documents.add(true, docPreset);
        
        // Configuration des marges
        var page = doc.pages[0];
        page.marginPreferences.top = "20mm";
        page.marginPreferences.bottom = "20mm";
        page.marginPreferences.left = "15mm";
        page.marginPreferences.right = "15mm";
        page.marginPreferences.columnCount = 2;
        page.marginPreferences.columnGutter = "5mm";
        
        // Créer des styles de paragraphe
        createParagraphStyles(doc);
        
        // Créer des nuanciers de couleurs
        createColorSwatches(doc);
        
        // Créer des blocs de texte de référence
        createTextFrames(page);
        
        // Créer des blocs d'images de référence
        createImageFrames(page);
        
        // Sauvegarder comme template
        var templateFolder = new Folder(Folder.desktop + "/InDesign Templates");
        if (!templateFolder.exists) {
            templateFolder.create();
        }
        
        var templateFile = new File(templateFolder + "/magazine_modern.indt");
        doc.save(templateFile);
        
        alert("Template 'magazine_modern.indt' créé avec succès sur le Bureau!");
        
    } catch (error) {
        alert("Erreur lors de la création du template: " + error.toString());
    }
}

function createParagraphStyles(doc) {
    // Style pour le titre principal
    var titleStyle = doc.paragraphStyles.add();
    titleStyle.name = "Title";
    titleStyle.appliedFont = app.fonts.item("Arial\tBold");
    titleStyle.pointSize = 28;
    titleStyle.spaceAfter = 10;
    titleStyle.justification = Justification.CENTER_ALIGN;
    
    // Style pour les sous-titres
    var subtitleStyle = doc.paragraphStyles.add();
    subtitleStyle.name = "Subtitle";
    subtitleStyle.appliedFont = app.fonts.item("Arial\tRegular");
    subtitleStyle.pointSize = 16;
    subtitleStyle.spaceAfter = 8;
    subtitleStyle.justification = Justification.LEFT_ALIGN;
    
    // Style pour le corps de texte
    var bodyStyle = doc.paragraphStyles.add();
    bodyStyle.name = "Body Text";
    bodyStyle.appliedFont = app.fonts.item("Arial\tRegular");
    bodyStyle.pointSize = 11;
    bodyStyle.leading = 14;
    bodyStyle.spaceAfter = 3;
    bodyStyle.justification = Justification.FULLY_JUSTIFIED;
    
    // Style pour les légendes
    var captionStyle = doc.paragraphStyles.add();
    captionStyle.name = "Caption";
    captionStyle.appliedFont = app.fonts.item("Arial\tItalic");
    captionStyle.pointSize = 9;
    captionStyle.leading = 11;
    captionStyle.justification = Justification.LEFT_ALIGN;
}

function createColorSwatches(doc) {
    // Couleur principale (bleu)
    var primaryColor = doc.colors.add();
    primaryColor.name = "Primary Blue";
    primaryColor.model = ColorModel.PROCESS;
    primaryColor.colorValue = [80, 40, 0, 0]; // CMYK
    
    // Couleur secondaire (orange)
    var secondaryColor = doc.colors.add();
    secondaryColor.name = "Secondary Orange";
    secondaryColor.model = ColorModel.PROCESS;
    secondaryColor.colorValue = [0, 60, 100, 0]; // CMYK
    
    // Gris foncé
    var darkGray = doc.colors.add();
    darkGray.name = "Dark Gray";
    darkGray.model = ColorModel.PROCESS;
    darkGray.colorValue = [0, 0, 0, 70]; // CMYK
}

function createTextFrames(page) {
    // Zone titre
    var titleFrame = page.textFrames.add();
    titleFrame.geometricBounds = ["20mm", "15mm", "40mm", "195mm"];
    titleFrame.contents = "[TITRE PRINCIPAL]";
    titleFrame.parentStory.paragraphs[0].appliedParagraphStyle = page.parent.paragraphStyles.item("Title");
    
    // Zone sous-titre
    var subtitleFrame = page.textFrames.add();
    subtitleFrame.geometricBounds = ["45mm", "15mm", "55mm", "195mm"];
    subtitleFrame.contents = "[Sous-titre de l'article]";
    subtitleFrame.parentStory.paragraphs[0].appliedParagraphStyle = page.parent.paragraphStyles.item("Subtitle");
    
    // Zone corps de texte
    var bodyFrame = page.textFrames.add();
    bodyFrame.geometricBounds = ["65mm", "15mm", "220mm", "100mm"];
    bodyFrame.contents = "[Corps de texte principal. Ce bloc sera automatiquement rempli avec le contenu fourni par l'utilisateur. Le texte sera formaté selon les styles définis.]";
    bodyFrame.parentStory.paragraphs[0].appliedParagraphStyle = page.parent.paragraphStyles.item("Body Text");
    
    // Configuration des colonnes pour le corps de texte
    bodyFrame.textFramePreferences.textColumnCount = 2;
    bodyFrame.textFramePreferences.textColumnGutter = "5mm";
}

function createImageFrames(page) {
    // Image principale (grande)
    var mainImageFrame = page.rectangles.add();
    mainImageFrame.geometricBounds = ["65mm", "105mm", "150mm", "195mm"];
    mainImageFrame.strokeWeight = 0.5;
    mainImageFrame.strokeColor = page.parent.colors.item("Dark Gray");
    
    // Ajouter un texte d'espace réservé
    var placeholderText = mainImageFrame.textFrames.add();
    placeholderText.geometricBounds = ["100mm", "130mm", "115mm", "170mm"];
    placeholderText.contents = "[IMAGE PRINCIPALE]";
    placeholderText.parentStory.paragraphs[0].justification = Justification.CENTER_ALIGN;
    
    // Image secondaire (petite)
    var secondImageFrame = page.rectangles.add();
    secondImageFrame.geometricBounds = ["160mm", "105mm", "220mm", "150mm"];
    secondImageFrame.strokeWeight = 0.5;
    secondImageFrame.strokeColor = page.parent.colors.item("Dark Gray");
    
    // Texte d'espace réservé pour la seconde image
    var placeholder2Text = secondImageFrame.textFrames.add();
    placeholder2Text.geometricBounds = ["175mm", "120mm", "185mm", "135mm"];
    placeholder2Text.contents = "[IMAGE 2]";
    placeholder2Text.parentStory.paragraphs[0].justification = Justification.CENTER_ALIGN;
    
    // Zone légende
    var captionFrame = page.textFrames.add();
    captionFrame.geometricBounds = ["225mm", "105mm", "235mm", "195mm"];
    captionFrame.contents = "[Légende des images]";
    captionFrame.parentStory.paragraphs[0].appliedParagraphStyle = page.parent.paragraphStyles.item("Caption");
}

// Exécuter la fonction
createMagazineTemplate();
