// 🔗 Fusion données - Version corrigée
// Stratégie: Identifier clairement webhook vs OpenAI par leur structure

const allInputs = $input.all();
console.log(`📊 Nombre d'inputs reçus: ${allInputs.length}`);

// Sépare webhook (avec binary) vs OpenAI (avec response text)
let webhookData = null;
let aiData = null;

allInputs.forEach((input, index) => {
  console.log(`Input ${index}:`, {
    hasJson: !!input.json,
    hasBinary: !!input.binary && Object.keys(input.binary).length > 0,
    jsonKeys: input.json ? Object.keys(input.json) : [],
    binaryKeys: input.binary ? Object.keys(input.binary) : []
  });
  
  // Webhook = a des données binaires OU contient 'contenu' 
  if ((input.binary && Object.keys(input.binary).length > 0) || 
      (input.json && input.json.contenu)) {
    webhookData = input;
    console.log('✅ Identifié comme webhook data');
  } else {
    aiData = input;
    console.log('🤖 Identifié comme AI data');
  }
});

// Fallback si pas trouvé
if (!webhookData) {
  webhookData = allInputs[0];
  console.log('⚠️ Fallback: premier input comme webhook');
}
if (!aiData) {
  aiData = allInputs[1] || allInputs[0];
  console.log('⚠️ Fallback: dernier input comme AI');
}

// Parse la réponse OpenAI
let parsedContent = {
  title: 'Titre par défaut',
  subtitle: 'Sous-titre par défaut', 
  body: webhookData.json?.contenu || 'Corps par défaut'
};

if (aiData && aiData.json) {
  let aiResponse = '';
  
  if (typeof aiData.json === 'string') {
    aiResponse = aiData.json;
  } else if (aiData.json.message?.content) {
    aiResponse = aiData.json.message.content;
  } else if (aiData.json.response) {
    aiResponse = aiData.json.response;
  }
  
  if (aiResponse) {
    try {
      let cleanResponse = aiResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      parsedContent = JSON.parse(cleanResponse);
      console.log('✅ AI content parsé avec succès');
    } catch (error) {
      console.log('❌ Erreur parsing AI:', error.message);
    }
  }
}

// CRUCIAL: Préserve explicitement les données binaires
const finalBinary = {};
if (webhookData.binary) {
  Object.keys(webhookData.binary).forEach(key => {
    finalBinary[key] = webhookData.binary[key];
    console.log(`📎 Binary préservé: ${key}`);
  });
}

const result = {
  json: {
    ...webhookData.json,
    ai_title: parsedContent.title || 'Titre par défaut',
    ai_subtitle: parsedContent.subtitle || 'Sous-titre par défaut',
    ai_body: parsedContent.body || webhookData.json?.contenu || 'Corps par défaut'
  },
  binary: finalBinary
};

console.log('🎯 Résultat final:', {
  jsonKeys: Object.keys(result.json),
  binaryKeys: Object.keys(result.binary),
  hasImages: Object.keys(result.binary).length > 0
});

return result;