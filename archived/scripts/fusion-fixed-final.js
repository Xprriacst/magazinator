// 🔗 Fusion données - SOLUTION FINALE v6
// CORRECTIONS: Accès OpenAI + Validation binaires

// Input actuel (OpenAI)
const currentInput = $input.item;

// Accès direct aux nœuds précédents
const webhookData = $node["🎯 Webhook Trigger"];
const openAIData = $node["🤖 Analyse OpenAI"];

console.log('🎯 DONNÉES DISPONIBLES:');
console.log('- Webhook exists:', !!webhookData);
console.log('- OpenAI exists:', !!openAIData);
console.log('- Current input:', !!currentInput);

// Extraction contenu du webhook
const webhookBody = webhookData?.json?.body;
const contenu = webhookBody?.contenu || 'Contenu webhook manquant';
const subtitle = webhookBody?.subtitle || '';

console.log('📝 CONTENU WEBHOOK:');
console.log('- Body trouvé:', !!webhookBody);
console.log('- Contenu:', contenu?.substring(0, 100));

// Parse OpenAI - plusieurs sources possibles
let aiTitle = 'Titre IA manquant';
let aiSubtitle = 'Sous-titre IA manquant';
let aiBody = contenu;

// Sources possibles pour les données OpenAI
const aiSources = [
  { name: 'currentInput', data: currentInput?.json },
  { name: 'openAINode', data: openAIData?.json }
];

let aiContent = null;
let aiSource = 'none';

for (const source of aiSources) {
  if (source.data && Array.isArray(source.data) && source.data[0]?.message?.content) {
    aiContent = source.data[0].message.content;
    aiSource = source.name;
    break;
  }
}

console.log('🤖 AI DETECTION:');
console.log('- AI source:', aiSource);
console.log('- AI content found:', !!aiContent);

if (aiContent) {
  console.log('🤖 AI CONTENT BRUT:', aiContent.substring(0, 200));
  
  try {
    const cleanJson = aiContent
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    
    const parsed = JSON.parse(cleanJson);
    console.log('🤖 AI PARSED SUCCESS:', parsed);
    
    if (parsed.title) aiTitle = parsed.title;
    if (parsed.subtitle) aiSubtitle = parsed.subtitle;
    if (parsed.body) aiBody = parsed.body;
    
  } catch (error) {
    console.log('❌ AI parsing FAILED:', error.message);
  }
}

// Récupération binaires avec validation stricte
const finalBinary = {};
let binaryFound = false;

console.log('📎 RECHERCHE BINAIRES:');

// Sources possibles pour les binaires
const binarySources = [
  { name: 'webhook', data: webhookData?.binary },
  { name: 'current', data: currentInput?.binary }
];

for (const source of binarySources) {
  if (source.data && Object.keys(source.data).length > 0) {
    console.log(`📎 Checking ${source.name} binary:`, Object.keys(source.data));
    
    Object.keys(source.data).forEach(key => {
      const binaryData = source.data[key];
      console.log(`📎 Binary [${key}]:`, {
        exists: !!binaryData,
        hasData: !!(binaryData?.data),
        type: typeof binaryData,
        keys: binaryData ? Object.keys(binaryData) : []
      });
      
      // Validation stricte des données binaires
      if (binaryData && (binaryData.data || binaryData.id)) {
        if (!finalBinary.images) {
          finalBinary.images = binaryData;
          console.log(`✅ BINARY VALID from ${source.name}[${key}] → images`);
          binaryFound = true;
        }
      }
    });
  }
}

if (!binaryFound) {
  console.log('⚠️ AUCUN BINARY VALIDE DÉTECTÉ');
}

const result = {
  json: {
    contenu: contenu,
    subtitle: subtitle,
    ai_title: aiTitle,
    ai_subtitle: aiSubtitle,
    ai_body: aiBody,
    debug: {
      webhook_found: !!webhookData,
      openai_found: !!openAIData,
      ai_source: aiSource,
      ai_content_found: !!aiContent,
      binary_found: binaryFound,
      binary_count: Object.keys(finalBinary).length,
      webhook_binary_keys: webhookData?.binary ? Object.keys(webhookData.binary) : [],
      current_binary_keys: currentInput?.binary ? Object.keys(currentInput.binary) : []
    }
  },
  binary: finalBinary
};

console.log('🎯 RÉSULTAT FINAL:');
console.log('- AI Title:', result.json.ai_title);
console.log('- Binary count:', Object.keys(result.binary).length);
console.log('- Binary valid:', !!result.binary.images?.data);

return result;