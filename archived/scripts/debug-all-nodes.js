// 🔍 Debug complet - À ajouter comme nœud final temporaire
const result = {
  webhook_output: $('ad616c64-b67e-46ee-ac1b-17b82e27db39').all(),
  openai_output: $('9e72bd72-c23d-4057-99ed-2bcd822a03c6').all(),
  fusion_output: $('8502f4bd-c7b3-4755-8812-93680a76152d').all(),
  flask_output: $('9966c30e-fc54-4b3d-9f51-112d5e50b460').all(),
  current_input: $input.item,
  timestamp: new Date().toISOString()
};

console.log('🔍 EXPORT COMPLET:', JSON.stringify(result, null, 2));
return result;