const initialData = {
  user: {
    id: "123456",
    name: "",
    currentPoints: 0,
    nextGoal: 200,
    currentTier: "Bronzani",
    nextTier: "Srebrni",
    currentReward: "Nema",
    nextReward: "Besplatna Dostava",
    missions: []
  }
};

// Load data from localStorage or use initial data
function loadUserData() {
  const savedData = localStorage.getItem('loyaltyData');
  return savedData ? JSON.parse(savedData) : initialData;
}

// Save data to localStorage
function saveUserData(data) {
  localStorage.setItem('loyaltyData', JSON.stringify(data));
}

// Update tier, goal, and rewards based on points
function updateTierAndGoal(data) {
  const goals = [
    { points: 200, tier: "Bronzani", nextTier: "Srebrni", currentReward: "Besplatna Dostava", nextReward: "10% Popusta" },
    { points: 400, tier: "Srebrni", nextTier: "Zlatni", currentReward: "10% Popusta", nextReward: "VIP Podrška" },
    { points: 600, tier: "Zlatni", nextTier: null, currentReward: "VIP Podrška", nextReward: "Nema" }
  ];

  for (let i = 0; i < goals.length; i++) {
    if (data.user.currentPoints < goals[i].points) {
      data.user.currentTier = i === 0 ? "Bronzani" : goals[i - 1].tier;
      data.user.nextTier = goals[i].tier;
      data.user.nextGoal = goals[i].points;
      data.user.currentReward = i === 0 ? "Nema" : goals[i - 1].currentReward;
      data.user.nextReward = goals[i].currentReward;
      break;
    } else if (data.user.currentPoints >= goals[goals.length - 1].points) {
      data.user.currentTier = goals[goals.length - 1].tier;
      data.user.nextTier = goals[goals.length - 1].nextTier;
      data.user.nextGoal = goals[goals.length - 1].points;
      data.user.currentReward = goals[goals.length - 1].currentReward;
      data.user.nextReward = goals[goals.length - 1].nextReward;
      break;
    }
  }
  return data;
}

// Determine which tiers should be ticked
function getTickedTiers(points) {
  const tiers = ["Bronzani", "Srebrni", "Zlatni"];
  const ticked = [];
  if (points >= 600) {
    ticked.push("Bronzani", "Srebrni", "Zlatni");
  } else if (points >= 400) {
    ticked.push("Bronzani", "Srebrni");
  } else if (points >= 200) {
    ticked.push("Bronzani");
  }
  return ticked;
}

// Get points for a mission
function getMissionPoints(action) {
  const pointsMap = {
    "Kupite proizvod": 50,
    "Napišite recenziju": 20,
    "Preporučite prijatelja": 30
  };
  return pointsMap[action] || 0;
}

// Simulate action and update data
window.simulateAction = function(action, points) {
  let data = loadUserData();
  if (!data.user.name) return; // Prevent actions if not logged in
  data.user.currentPoints += points;
  data.user.missions.push({ title: action, completed: true, points: points });
  data = updateTierAndGoal(data);
  saveUserData(data);
  updateWidget(data);
};

// Handle login
window.handleLogin = function() {
  const nameInput = document.getElementById('login-name');
  const name = nameInput.value.trim();
  const errorElement = document.querySelector('.login-error');

  // Clear any existing error message
  if (errorElement) {
    errorElement.remove();
  }

  if (!name) {
    // Display error message if name is empty
    const loginSection = document.querySelector('.login-section');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'login-error';
    errorDiv.textContent = 'Molimo unesite vaše ime da se pridružite!';
    loginSection.appendChild(errorDiv);
    return;
  }

  let data = loadUserData();
  data.user.name = name;
  saveUserData(data);
  document.querySelector('.login-prompt').style.display = 'none';
  document.querySelector('.mock-content').style.display = 'block';
  updateWidget(data);
};

// Create and update widget
function createWidget() {
  const data = loadUserData();
  const root = document.getElementById('loyalty-widget-root');

  // Sticky Button
  const button = document.createElement('button');
  button.id = 'loyalty-widget-button';
  button.innerHTML = '🎁 Moje Nagrade';
  root.appendChild(button);

  // Slide-in Panel
  const panel = document.createElement('div');
  panel.id = 'loyalty-widget-panel';
  root.appendChild(panel);

  // Update widget content
  window.updateWidget = function(data) {
    if (!data.user.name) {
      // Show promotional content if not logged in
      panel.innerHTML = `
        <button class="close-button">✕</button>
        <div class="panel-content">
          <h2>Pridružite se Shoppster Nagradama!</h2>
          <div class="promo-section">
            <p class="promo-intro">Otključajte ekskluzivne pogodnosti sa svakom kupovinom!</p>
            <div class="promo-benefit">
              <span class="promo-icon">🛒</span>
              <div>
                <h3>Lako Zarađujte Bodove</h3>
                <p>Kupujte, pišite recenzije proizvoda ili preporučite prijatelje da biste zaradili bodove za sjajne nagrade.</p>
              </div>
            </div>
            <div class="promo-benefit">
              <span class="promo-icon">🏆</span>
              <div>
                <h3>Penjite se na Nivoe</h3>
                <p>Dosignite Bronzani, Srebrni i Zlatni nivo za veće pogodnosti kako zarađujete više bodova.</p>
              </div>
            </div>
            <div class="promo-benefit">
              <span class="promo-icon">🎁</span>
              <div>
                <h3>Otključajte Nagrade</h3>
                <p>Uživajte u besplatnoj dostavi, popustima i VIP podršci kako napredujete!</p>
              </div>
            </div>
            <p class="promo-cta">Kako funkcioniše: Prijavite se da počnete zarađivati bodove sa svakom akcijom i gledajte kako vaše nagrade rastu!</p>
            <div class="login-section">
              <input type="text" id="login-name" placeholder="Unesite vaše ime za početak" />
              <button onclick="handleLogin()">Pridruži se Sada</button>
            </div>
          </div>
        </div>
      `;
    } else {
      // Show loyalty progress if logged in
      const percentage = Math.min((data.user.currentPoints / data.user.nextGoal) * 100, 100);
      const tickedTiers = getTickedTiers(data.user.currentPoints);
      panel.innerHTML = `
        <button class="close-button">✕</button>
        <div class="panel-content">
          <h2>Vaš Napredak Lojalnosti, ${data.user.name}</h2>
          <div class="progress-section">
            <p>${data.user.currentPoints} / ${data.user.nextGoal} bodova</p>
            <div class="progress-bar">
              <div class="progress-bar-fill" style="width: 0%"></div>
            </div>
            <p>Trenutna nagrada: ${data.user.currentReward} 🎉</p>
            <p>Sledeća nagrada: ${data.user.nextReward} 🚀</p>
          </div>
          <div class="tier-section">
            <h3>Vaš Nivo</h3>
            <div class="tier-container">
              ${['Bronzani', 'Srebrni', 'Zlatni'].map(tier => `
                <div class="tier">
                  <div class="tier-badge tier-${tier.toLowerCase() === 'bronzani' ? 'bronze' : tier.toLowerCase() === 'srebrni' ? 'silver' : 'gold'} ${!tickedTiers.includes(tier) ? 'tier-locked' : ''}">
                    ${tickedTiers.includes(tier) ? '✓' : '🔒'}
                  </div>
                  <p>${tier}</p>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="missions-section">
            <h3>Načini za Više Bodova</h3>
            <div class="missions-grid">
              ${data.user.missions.length > 0 ? data.user.missions.map(mission => `
                <div class="mission">
                  <span>${mission.points}p -</span>
                  <span>${mission.title}</span>
                </div>
              `).join('') : '<p class="mission-empty">Još uvijek nema završenih misija.</p>'}
            </div>
          </div>
        </div>
      `;
      // Animate progress bar
      setTimeout(() => {
        const progressBar = panel.querySelector('.progress-bar-fill');
        progressBar.style.width = `${percentage}%`;
      }, 100);
    }

    // Re-attach close button event listener
    panel.querySelector('.close-button').addEventListener('click', () => {
      panel.classList.remove('open');
    });
  };

  // Initial render
  updateWidget(data);

  // Show/hide mock content based on login state
  if (data.user.name) {
    document.querySelector('.login-prompt').style.display = 'none';
    document.querySelector('.mock-content').style.display = 'block';
  } else {
    document.querySelector('.login-prompt').style.display = 'block';
    document.querySelector('.mock-content').style.display = 'none';
  }

  // Event Listener for button
  button.addEventListener('click', () => {
    panel.classList.add('open');
    updateWidget(loadUserData());
  });
}

document.addEventListener('DOMContentLoaded', createWidget);