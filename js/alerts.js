/* ============================================================
   ALERTS - Automated alert system for Control Animal Selwo
   ============================================================ */
window.App = window.App || {};

App.Alerts = (() => {
  'use strict';

  const H = App.Helpers;
  const DB = App.DB;

  const THRESHOLDS = {
    diet_days: 3,
    training_days: 7,
    weight_days: 14,
    vet_review_days: 90,
  };

  /**
   * Analyze data and generate automatic alerts.
   */
  async function generateAlerts() {
    try {
      // Clear existing auto-generated alerts
      const existingAlerts = await DB.AlertService.getAll();
      const autoAlerts = existingAlerts.filter(a => a.auto_generated);
      for (const a of autoAlerts) {
        await DB.AlertService.remove(a.id);
      }

      const animals = await DB.AnimalService.getAll();
      const activeAnimals = animals.filter(a => a.status === 'Activo');
      const newAlerts = [];

      for (const animal of activeAnimals) {
        // Diet check
        const diets = await DB.DietService.getByAnimal(animal.id);
        const lastDiet = diets.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        const dietDays = lastDiet ? H.daysAgo(lastDiet.date) : Infinity;
        if (dietDays > THRESHOLDS.diet_days) {
          newAlerts.push({
            animal_id: animal.id,
            animal_name: animal.name,
            type: 'diet_pending',
            message: `Sin registro de dieta desde hace ${dietDays === Infinity ? 'nunca' : dietDays + ' días'}`,
            status: 'active',
            auto_generated: true,
            priority: dietDays > 7 ? 'high' : 'medium',
          });
        }

        // Training check
        const trainings = await DB.TrainingService.getByAnimal(animal.id);
        const lastTraining = trainings.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        const trainingDays = lastTraining ? H.daysAgo(lastTraining.date) : Infinity;
        if (trainingDays > THRESHOLDS.training_days) {
          newAlerts.push({
            animal_id: animal.id,
            animal_name: animal.name,
            type: 'training_pending',
            message: `Sin sesión de entreno desde hace ${trainingDays === Infinity ? 'nunca' : trainingDays + ' días'}`,
            status: 'active',
            auto_generated: true,
            priority: trainingDays > 14 ? 'high' : 'medium',
          });
        }

        // Weight check
        const weights = await DB.WeightService.getByAnimal(animal.id);
        const lastWeight = weights.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        const weightDays = lastWeight ? H.daysAgo(lastWeight.date) : Infinity;
        if (weightDays > THRESHOLDS.weight_days) {
          newAlerts.push({
            animal_id: animal.id,
            animal_name: animal.name,
            type: 'weight_control',
            message: `Sin control de peso desde hace ${weightDays === Infinity ? 'nunca' : weightDays + ' días'}`,
            status: 'active',
            auto_generated: true,
            priority: weightDays > 30 ? 'high' : 'medium',
          });
        }

        // Vet review check
        const vetRecords = await DB.VeterinaryService.getByAnimal(animal.id);
        const lastVet = vetRecords.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        const vetDays = lastVet ? H.daysAgo(lastVet.date) : Infinity;
        if (vetDays > THRESHOLDS.vet_review_days) {
          newAlerts.push({
            animal_id: animal.id,
            animal_name: animal.name,
            type: 'vet_review',
            message: `Sin revisión veterinaria desde hace ${vetDays === Infinity ? 'nunca' : vetDays + ' días'}`,
            status: 'active',
            auto_generated: true,
            priority: 'medium',
          });
        }

        // Medication check: recent vet records with medication that might need follow-up
        const recentVet = vetRecords.filter(v => {
          const d = H.daysAgo(v.date);
          return d <= 14 && v.medication && v.medication.trim() !== '';
        });
        for (const rv of recentVet) {
          newAlerts.push({
            animal_id: animal.id,
            animal_name: animal.name,
            type: 'medication',
            message: `Medicación activa: ${rv.medication}`,
            status: 'active',
            auto_generated: true,
            priority: 'high',
          });
        }
      }

      // Save new alerts
      for (const alert of newAlerts) {
        await DB.AlertService.create(alert);
      }

      return newAlerts;
    } catch (err) {
      console.error('[Alerts] Error generating alerts:', err);
      return [];
    }
  }

  /**
   * Get active alert count.
   */
  async function getActiveCount() {
    const alerts = await DB.AlertService.getActive();
    return alerts.length;
  }

  /**
   * Render alerts badge HTML.
   */
  async function renderAlertsBadge() {
    const count = await getActiveCount();
    if (count === 0) return '';
    return `<span class="alerts-badge" id="alerts-badge">${count > 99 ? '99+' : count}</span>`;
  }

  /**
   * Render alerts summary for the main menu.
   */
  async function renderAlertsSummary() {
    const alerts = await DB.AlertService.getActive();
    if (alerts.length === 0) {
      return `
        <div class="alerts-summary alerts-empty">
          <span class="alerts-summary-icon">✅</span>
          <span>Sin alertas pendientes</span>
        </div>
      `;
    }

    // Group by type
    const groups = {};
    alerts.forEach(a => {
      if (!groups[a.type]) groups[a.type] = [];
      groups[a.type].push(a);
    });

    let html = '<div class="alerts-panel">';
    html += '<h3 class="alerts-panel-title">⚠️ Alertas Activas</h3>';
    html += '<div class="alerts-list">';

    for (const [type, items] of Object.entries(groups)) {
      const meta = H.ALERT_TYPES[type] || { label: type, icon: '❓', color: 'var(--gray-500)' };
      for (const alert of items.slice(0, 5)) {
        html += `
          <div class="alert-item alert-item--${alert.priority || 'medium'}" onclick="App.Router.navigate('/animal/${alert.animal_id}/general')">
            <span class="alert-item-icon">${meta.icon}</span>
            <div class="alert-item-content">
              <div class="alert-item-animal">${H.escapeHtml(alert.animal_name)}</div>
              <div class="alert-item-message">${H.escapeHtml(alert.message)}</div>
            </div>
            <button class="alert-dismiss" onclick="event.stopPropagation(); App.Alerts.dismissAlert('${alert.id}')" title="Descartar">✕</button>
          </div>
        `;
      }
    }

    if (alerts.length > 10) {
      html += `<div class="alerts-more">+${alerts.length - 10} alertas más</div>`;
    }

    html += '</div></div>';
    return html;
  }

  /**
   * Dismiss an alert.
   */
  async function dismissAlert(alertId) {
    await DB.AlertService.dismiss(alertId);
    // Refresh view
    App.Router.resolve();
  }

  /**
   * Render alerts dropdown for the header.
   */
  async function renderAlertsDropdown() {
    const alerts = await DB.AlertService.getActive();

    let html = '<div class="alerts-dropdown" id="alerts-dropdown">';
    html += '<div class="alerts-dropdown-header"><h4>Alertas</h4></div>';

    if (alerts.length === 0) {
      html += '<div class="alerts-dropdown-empty">✅ Sin alertas pendientes</div>';
    } else {
      html += '<div class="alerts-dropdown-list">';
      for (const alert of alerts.slice(0, 8)) {
        const meta = H.ALERT_TYPES[alert.type] || { icon: '❓' };
        html += `
          <div class="alert-dropdown-item" onclick="App.Router.navigate('/animal/${alert.animal_id}/general'); App.Alerts.closeDropdown();">
            <span class="alert-dropdown-icon">${meta.icon}</span>
            <div class="alert-dropdown-content">
              <strong>${H.escapeHtml(alert.animal_name)}</strong>
              <small>${H.escapeHtml(alert.message)}</small>
            </div>
          </div>
        `;
      }
      html += '</div>';
      if (alerts.length > 8) {
        html += `<div class="alerts-dropdown-footer">+${alerts.length - 8} más</div>`;
      }
    }
    html += '</div>';
    return html;
  }

  function closeDropdown() {
    const dd = document.getElementById('alerts-dropdown');
    if (dd) dd.classList.remove('open');
  }

  return {
    generateAlerts,
    getActiveCount,
    renderAlertsBadge,
    renderAlertsSummary,
    renderAlertsDropdown,
    dismissAlert,
    closeDropdown,
    THRESHOLDS,
  };
})();
