// Script de test très simple
#target indesign

try {
    alert("🚀 Script de test démarré");
    
    // Test 1: Vérifier si le dossier uploads existe
    var basePath = "/Users/alexandreerrasti/Library/Mobile Documents/com~apple~CloudDocs/Indesign automation";
    var uploadsFolder = new Folder(basePath + "/uploads");
    
    if (uploadsFolder.exists) {
        alert("✅ Dossier uploads trouvé");
        
        // Test 2: Lister les projets
        var projectFolders = uploadsFolder.getFiles();
        alert("📁 Nombre de projets: " + projectFolders.length);
        
        if (projectFolders.length > 0) {
            for (var i = 0; i < projectFolders.length; i++) {
                if (projectFolders[i] instanceof Folder) {
                    alert("📂 Projet: " + projectFolders[i].name);
                    
                    var configFile = new File(projectFolders[i] + "/config.json");
                    if (configFile.exists) {
                        alert("⚙️ Config trouvée pour: " + projectFolders[i].name);
                        
                        // Test 3: Lire le contenu
                        configFile.open("r");
                        var configData = configFile.read();
                        configFile.close();
                        
                        alert("📄 Contenu config (premiers 100 chars): " + configData.substring(0, 100));
                        
                        // Test 4: Essayer de parser avec eval
                        try {
                            var cleanData = configData.replace(/\r\n/g, '\\n').replace(/\r/g, '\\n').replace(/\n/g, '\\n');
                            var config = eval('(' + cleanData + ')');
                            alert("✅ JSON parsé avec succès! Project ID: " + config.project_id);
                        } catch (parseError) {
                            alert("❌ Erreur parsing: " + parseError.toString());
                        }
                        
                        break; // Test avec le premier projet trouvé
                    }
                }
            }
        }
    } else {
        alert("❌ Dossier uploads non trouvé");
    }
    
    alert("🏁 Test terminé");
    
} catch (error) {
    alert("❌ ERREUR GÉNÉRALE: " + error.toString());
}