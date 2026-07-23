const fs = require('fs');
let code = fs.readFileSync('e:/videos/control-animal-selwo/js/views.js', 'utf8');

const renderGlobalTrainingViewCode = `  // ──────────────────────────────────────────────────────────
  // ENTRENAMIENTOS GENERALES
  // ──────────────────────────────────────────────────────────
  async function renderGlobalTrainingView(params) {
    const { deptId } = params;
    const dept = H.getDeptMeta(deptId);
    const app = document.getElementById('app');

    const { getTrainingRecordsByDept, getAnimals } = await import('../src/services/animalService.js?v=9');
    
    let records = [];
    let animalMap = {};
    let animalAvatars = {};

    try {
      records = await getTrainingRecordsByDept(deptId);
      const { data: animals } = await getAnimals({ departamentoId: deptId });
      
      for (const a of (animals || [])) {
        animalMap[a.id] = a.nombre;
        animalAvatars[a.id] = a.foto_url || await App.Photos.getPhotoUrl(a.id, a.especie);
      }
    } catch (err) {
      console.error('Error cargando entrenamientos globales:', err);
    }

    const ATTITUDE_ICONS = {
      'Excelente': '✨',
      'Bueno': '🟢',
      'Regular': '🟡',
      'Mal': '🟠',
      'Muy Mal': '🔴'
    };

    const getAttitudeBadge = (attitude) => {
      const clsMap = {
        'Excelente': 'success',
        'Bueno': 'primary',
        'Regular': 'warning',
        'Mal': 'danger',
        'Muy Mal': 'danger'
      };
      const cls = clsMap[attitude] || 'default';
      const icon = ATTITUDE_ICONS[attitude] || '📝';
      return \`<span class="badge badge-\${cls}">\${icon} \${attitude}</span>\`;
    };

    const todayStr = H.today();
    const todayRecords = records.filter(r => r.fecha === todayStr);
    
    const attitudeCounts = { 'Excelente': 0, 'Bueno': 0, 'Regular': 0, 'Mal': 0, 'Muy Mal': 0 };
    todayRecords.forEach(r => {
      if (attitudeCounts[r.resultado] !== undefined) {
        attitudeCounts[r.resultado]++;
      }
    });

    const summaryHtml = \`
      <div class="training-summary-cards">
        <div class="training-summary-item training-summary-item--total">
          <div class="training-summary-value">\${todayRecords.length}</div>
          <div class="training-summary-label">📋 Sesiones Hoy</div>
        </div>
        <div class="training-summary-item training-summary-item--excelente">
          <div class="training-summary-value">\${attitudeCounts['Excelente']}</div>
          <div class="training-summary-label">✨ Excelente</div>
        </div>
        <div class="training-summary-item training-summary-item--regular">
          <div class="training-summary-value">\${attitudeCounts['Regular']}</div>
          <div class="training-summary-label">🟡 Regular</div>
        </div>
        <div class="training-summary-item training-summary-item--mal">
          <div class="training-summary-value">\${attitudeCounts['Mal'] + attitudeCounts['Muy Mal']}</div>
          <div class="training-summary-label">🔴 Mala / Muy Mala</div>
        </div>
      </div>
    \`;

    const recentRecords = records.slice(0, 10);
    const listHtml = recentRecords.length > 0 ? recentRecords.map(r => \`
      <div class="modern-session-list-item" onclick="App.Router.navigate('/animal/\${r.animal_id}/trainings')" style="cursor:pointer">
        <div class="msl-animal">
          <img src="\${animalAvatars[r.animal_id]}" alt="" class="msl-avatar">
          <div class="msl-info">
            <span class="msl-name">\${H.escapeHtml(animalMap[r.animal_id] || 'Desconocido')}</span>
            <span class="msl-meta">\${H.formatDateTime(r.fecha)} (Sesión \${r.numero_sesion || 1}) — \${H.escapeHtml(r.conducta_entrenada || 'Sin entrenador')}</span>
          </div>
        </div>
        <div class="msl-attitude">
          \${getAttitudeBadge(r.resultado)}
        </div>
      </div>
    \`).join('') : '<p class="text-muted text-center" style="padding: 2rem;">No hay sesiones registradas.</p>';

    app.innerHTML = \`
      \${UI.renderHeader(\`\${dept.name} · Entrenamientos\`, \`/dept/\${deptId}\`)}
      \${UI.renderBreadcrumbs([
      { label: 'Inicio', path: '/menu' },
      { label: dept.name, path: \`/dept/\${deptId}\` },
      { label: 'Entrenamientos' },
    ])}
      <main class="main-content">
        <div class="modern-training-header">
          <h2 class="modern-training-title">🎯 Entrenamientos - Vista General</h2>
          <button class="btn btn-primary" onclick="App.Views.openTrainingForm(null, '\${deptId}')">+ Nuevo Entrenamiento</button>
        </div>
        
        <h3 style="margin-top:2rem;margin-bottom:1rem;color:var(--gray-700);font-size:1.1rem;">Resumen de Hoy (\${H.formatDateTime(todayStr)})</h3>
        \${summaryHtml}

        <h3 style="margin-top:2rem;margin-bottom:1rem;color:var(--gray-700);font-size:1.1rem;">Últimas Sesiones Registradas</h3>
        <div class="modern-session-list">
          \${listHtml}
        </div>
      </main>
    \`;
  }

  async function openTrainingForm(animalId, deptId, recordId = null) {
    const { getRecordById, createSupabaseRecord, updateSupabaseRecord, getTrainingRecords, getAnimals } = await import('../src/services/animalService.js?v=9');

    const isEdit = !!recordId;
    let defaults = { date: H.today(), result: 'Excelente', behavior: '', observations: '', numero_sesion: 1, animal_id: animalId || '' };

    let animalsList = [];
    if (!animalId) {
      try {
        const { data } = await getAnimals({ departamentoId: deptId });
        animalsList = data || [];
      } catch (err) {
        console.error('Error cargando animales:', err);
      }
    }

    if (isEdit) {
      try {
        const existing = await getRecordById('trainings', recordId);
        if (existing) {
          defaults = {
            date: existing.date || H.today(),
            result: existing.result || 'Excelente',
            behavior: existing.behavior || '',
            observations: existing.observations || '',
            numero_sesion: existing.numero_sesion || 1,
            animal_id: existing.animal_id || defaults.animal_id,
          };
        }
      } catch (err) {
        console.error('Error al cargar entrenamiento:', err);
      }
    } else if (animalId) {
      try {
        const records = await getTrainingRecords(animalId, 50);
        const todayStr = H.today();
        const todayRecords = records.filter(r => r.fecha === todayStr);
        if (todayRecords.length > 0) {
          const maxSession = Math.max(...todayRecords.map(r => r.numero_sesion || 1));
          defaults.numero_sesion = maxSession + 1;
        }
      } catch(err) {
        console.error('Error calculando sesión:', err);
      }
    }

    const ATTITUDE_OPTIONS = [
      { value: 'Excelente', emoji: '✨', label: 'Excelente' },
      { value: 'Bueno', emoji: '🟢', label: 'Bueno' },
      { value: 'Regular', emoji: '🟡', label: 'Regular' },
      { value: 'Mal', emoji: '🟠', label: 'Mal' },
      { value: 'Muy Mal', emoji: '🔴', label: 'Muy Mal' },
    ];

    const animalSelectHtml = !animalId && !isEdit ? \`
      <div class="form-group">
        <label class="form-label" for="leo-training-animal">Animal *</label>
        <select class="form-select" id="leo-training-animal" required>
          <option value="">Selecciona un animal...</option>
          \${animalsList.map(a => \`<option value="\${a.id}">\${H.escapeHtml(a.nombre)}</option>\`).join('')}
        </select>
      </div>
    \` : '';

    const formHtml = \`
      <form id="record-form" novalidate>
        \${animalSelectHtml}
        <div class="form-row" style="display:flex;gap:var(--sp-4);">
          <div class="form-group" style="flex:2;">
            <label class="form-label" for="leo-training-fecha">Fecha *</label>
            <input class="form-input" type="date" id="leo-training-fecha" value="\${defaults.date}" required>
          </div>
          <div class="form-group" style="flex:1;">
            <label class="form-label" for="leo-training-session">Nº Sesión</label>
            <input class="form-input" type="number" id="leo-training-session" value="\${defaults.numero_sesion}" min="1" required>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="leo-training-actitud">Actitud *</label>
          <select class="form-select" id="leo-training-actitud" required>
            \${ATTITUDE_OPTIONS.map(opt => \`
              <option value="\${opt.value}" \${defaults.result === opt.value ? 'selected' : ''}>
                \${opt.emoji} \${opt.label}
              </option>
            \`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="leo-training-entrenador">Entrenador(es)</label>
          <input class="form-input" type="text" id="leo-training-entrenador" 
            value="\${H.escapeHtml(defaults.behavior)}" 
            placeholder="Ej: Carlos M., Ana R.">
        </div>
        <div class="form-group">
          <label class="form-label" for="leo-training-obs">Sesión / Observaciones</label>
          <textarea class="form-textarea" id="leo-training-obs" rows="4"
            placeholder="Descripción de la sesión de entrenamiento...">\${H.escapeHtml(defaults.observations)}</textarea>
        </div>
      </form>
    \`;

    UI.showModal({
      title: isEdit ? '📝 Editar Entrenamiento' : '+ Registrar Entrenamiento',
      contentHtml: formHtml,
      saveLabel: isEdit ? 'Actualizar' : 'Guardar',
      onSave: async () => {
        const fecha = document.getElementById('leo-training-fecha')?.value;
        if (!fecha) { UI.showToast('La fecha es obligatoria', 'error'); return; }
        
        let finalAnimalId = animalId || defaults.animal_id;
        if (!animalId && !isEdit) {
          const selectEl = document.getElementById('leo-training-animal');
          finalAnimalId = selectEl ? selectEl.value : '';
          if (!finalAnimalId) {
            UI.showToast('Debes seleccionar un animal', 'error');
            return;
          }
        }

        const data = {
          date: fecha,
          numero_sesion: parseInt(document.getElementById('leo-training-session')?.value || '1', 10),
          result: document.getElementById('leo-training-actitud')?.value || 'Excelente',
          behavior: document.getElementById('leo-training-entrenador')?.value || '',
          observations: document.getElementById('leo-training-obs')?.value || '',
          animal_id: finalAnimalId,
        };

        try {
          if (isEdit) {
            await updateSupabaseRecord('trainings', recordId, data);
            UI.showToast('Entrenamiento actualizado', 'success');
          } else {
            await createSupabaseRecord('trainings', data);
            UI.showToast('Entrenamiento registrado', 'success');
          }
          UI.closeModal();
          App.Router.resolve();
        } catch (err) {
          UI.showToast('Error: ' + err.message, 'error');
        }
      },
    });
  }`;

// Insert the code just before `async function openRecordForm`
code = code.replace("  async function openRecordForm(type, animalId, recordId = null) {", renderGlobalTrainingViewCode + "\n\n  async function openRecordForm(type, animalId, recordId = null) {");

// Modify renderDeptSection
code = code.replace(
  "if (sectionId === 'reports') { return renderReports(params); }",
  "if (sectionId === 'reports') { return renderReports(params); }\n    if (sectionId === 'trainings') { return renderGlobalTrainingView(params); }"
);

// Add openTrainingForm to exports
code = code.replace(
  "openRecordForm,",
  "openRecordForm,\n    openTrainingForm,"
);

// In renderAnimalCard -> renderTrainingTab: there was a button calling openRecordForm('trainings', ...). We need to change it to openTrainingForm(..., ...)
code = code.replace(
  /openRecordForm\('trainings', '\$\{animal\.id\}'\)/g,
  "openTrainingForm('${animal.id}', '${animal.department}')"
);
code = code.replace(
  /openRecordForm\('trainings', '\$\{animal\.id\}', '\$\{r\.id\}'\)/g,
  "openTrainingForm('${animal.id}', '${animal.department}', '${r.id}')"
);

fs.writeFileSync('e:/videos/control-animal-selwo/js/views.js', code, 'utf8');
