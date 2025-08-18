// Script de test simple pour InDesign
// Ce script teste que InDesign est accessible et peut créer un document

#target indesign

function main() {
    try {
        // Récupérer les arguments
        var args = app.scriptArgs.getValue("config_path");
        if ((!args || args === "") && (typeof $.arguments !== 'undefined') && $.arguments.length > 0) {
            args = $.arguments[0];
        }
        
        if (!args) {
            // Écrire dans un fichier de log au lieu d'alert
            writeLog("ERREUR: Pas de chemin de configuration fourni");
            return;
        }
        
        writeLog("DÉBUT: Test InDesign avec config: " + args);
        
        // Lire le fichier de configuration
        var configFile = new File(args);
        if (!configFile.exists) {
            writeLog("ERREUR: Fichier config non trouvé: " + args);
            return;
        }
        
        configFile.open("r");
        var configData = configFile.read();
        configFile.close();
        
        var config = JSON.parse(configData);
        writeLog("CONFIG: Prompt = " + config.prompt);
        writeLog("CONFIG: Images = " + config.images.length);
        
        // Créer un document simple
        var doc = app.documents.add();
        writeLog("DOCUMENT: Créé avec succès");
        
        // Ajouter un bloc de texte simple
        var page = doc.pages[0];
        var textFrame = page.textFrames.add();
        textFrame.geometricBounds = [50, 50, 200, 400];
        textFrame.contents = "TEST INDESIGN\n\n" + 
                           "Prompt: " + config.prompt + "\n\n" + 
                           "Contenu: " + config.text_content + "\n\n" + 
                           "Images: " + config.images.length + " fichier(s)";
        
        writeLog("TEXTE: Ajouté avec succès");
        
        // Sauvegarder le document
        var outputFolder = new Folder(app.activeScript.parent.parent + "/output");
        if (!outputFolder.exists) {
            outputFolder.create();
        }
        
        var outputFile = new File(outputFolder + "/" + config.project_id + ".indd");
        doc.save(outputFile);
        doc.close();
        
        writeLog("SUCCÈS: Document sauvegardé: " + outputFile.fsName);
        
    } catch (error) {
        writeLog("ERREUR: " + error.toString());
    }
}

function writeLog(message) {
    try {
        var logFile = new File(app.activeScript.parent.parent + "/indesign_test.log");
        logFile.open("a");
        logFile.writeln(new Date().toISOString() + " - " + message);
        logFile.close();
    } catch (e) {
        // Si impossible d'écrire le log, ne rien faire
    }
}

// Exécuter le script
main();