const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://xpruilcramomtkenovpt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwcnVpbGNyYW1vbXRrZW5vdnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MjA4NDcsImV4cCI6MjA5MDQ5Njg0N30._hsQp7hCgNJ9sfdsu2InrIoo9fviAy6Oa-cdiHgi300'
);

async function migrate() {
  const data = JSON.parse(fs.readFileSync('./src/data/db.json', 'utf8'));
  console.log('--- Iniciando Migração para Supabase ---');

  for (const project of data) {
    console.log('PROJETANDO:', project.title);
    
    // Inserir Projeto (onConflict para não duplicar)
    const { data: p_data, error: p_error } = await supabase
      .from('projects')
      .upsert({
        id: project.id,
        title: project.title,
        budget: project.budget,
        actual: project.actual,
        coverage: project.coverage,
        deviation_reliable: project.deviationReliable,
        room_count: project.roomCount,
        thematic_count: project.thematicCount,
        adult_count: project.adultCount,
        loft_count: project.loftCount,
        game_room_count: project.gameRoomCount,
        has_lanai: project.hasLanai
      })
      .select()
      .single();

    if (p_error) { console.error('Erro no Projeto:', p_error); continue; }

    for (const room of project.rooms) {
      console.log('  CÔMODO:', room.name);
      const { data: r_data, error: r_error } = await supabase
        .from('rooms')
        .insert({
          project_id: project.id,
          name: room.name,
          type: room.type,
          total_budget: room.totalBudget,
          total_actual: room.totalActual,
          coverage: room.coverage
        })
        .select()
        .single();

      if (r_error) { console.error('Erro no Cômodo:', r_error); continue; }

      const itemsToInsert = room.items.map(item => ({
        room_id: r_data.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        price_cost: item.priceCost,
        actual_cost: item.actualCost,
        link: item.link
      }));

      if (itemsToInsert.length > 0) {
        const { error: i_error } = await supabase.from('items').insert(itemsToInsert);
        if (i_error) console.error('Erro nos Itens:', i_error);
      }
    }
  }
  console.log('--- Migração Concluída com Sucesso! ---');
}

migrate();
