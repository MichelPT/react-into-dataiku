// Access the parameters that end-users filled in using webapp config
// For example, for a parameter called "input_dataset"
// input_dataset = dataiku.getWebAppConfig()['input_dataset']

// State management
const state = {
    selectedWells: [],
    selectedIntervals: [],
    savedSets: [],
    currentModule: null,
    plotData: null,
    parameters: [],
    isLoading: false
};

// Utility functions
function getDataikuAppConfig() {
    // This gets the Dataiku webapp configuration from the global window object
    // Dataiku automatically injects this when serving the webapp
    return window.dataiku && window.dataiku.config ? window.dataiku.config : null;
}

function getApiBaseUrl() {
    // For Dataiku standard webapps, use the standard backend URL pattern
    if (window.dataiku && window.dataiku.getWebAppBackendUrl) {
        return window.dataiku.getWebAppBackendUrl('');
    }
    // Fallback to relative path
    return '';
}

async function fetchJson(endpoint, options = {}) {
    try {
        // For Dataiku standard webapps, use the built-in helper if available
        if (window.dataiku && window.dataiku.getWebAppBackendUrl) {
            const url = window.dataiku.getWebAppBackendUrl(endpoint);

            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Network error' }));
                throw new Error(error.error || `Server error: ${response.status}`);
            }
            return response.json();
        } else {
            // Fallback for direct relative paths
            const response = await fetch(endpoint, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Network error' }));
                throw new Error(error.error || `Server error: ${response.status}`);
            }
            return response.json();
        }
    } catch (error) {
        console.error('fetchJson error:', error);
        throw error;
    }
}

function showLoading() {
    document.getElementById('loadingSpinner').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingSpinner').classList.add('hidden');
}

function showError(message) {
    const mainContent = document.getElementById('mainContent');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    mainContent.insertBefore(errorDiv, mainContent.firstChild);
    setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(message) {
    const mainContent = document.getElementById('mainContent');
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    mainContent.insertBefore(successDiv, mainContent.firstChild);
    setTimeout(() => successDiv.remove(), 5000);
}

// Well management
async function loadWells() {
    try {
        const wells = await fetchJson('/wells');  // Endpoints now relative to plugin base
        const wellList = document.getElementById('wellList');
        wellList.innerHTML = wells.map(well => `
            <div class="list-item" data-id="${well.id}" onclick="toggleWell('${well.id}')">
                ${well.name}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading wells:', error);
        showError('Failed to load wells');
    }
}

function toggleWell(wellId) {
    const index = state.selectedWells.indexOf(wellId);
    if (index === -1) {
        state.selectedWells.push(wellId);
    } else {
        state.selectedWells.splice(index, 1);
    }
    updateWellSelection();
}

function updateWellSelection() {
    const wells = document.querySelectorAll('#wellList .list-item');
    wells.forEach(well => {
        const wellId = well.getAttribute('data-id');
        well.classList.toggle('selected', state.selectedWells.includes(wellId));
    });
}

// Module handling
async function loadModule(moduleName) {
    if (state.selectedWells.length === 0) {
        showError('Please select at least one well');
        return;
    }

    state.currentModule = moduleName;
    showLoading();

    try {
        switch (moduleName) {
            case 'rgbe-rpbe':
                await handleRgbeRpbe();
                break;
            case 'swgrad':
                await handleSwgrad();
                break;
            case 'dns-dnsv':
                await handleDnsDnsv();
                break;
            case 'rt-ro':
                await handleRtRo();
                break;
            case 'histogram':
                await handleHistogram();
                break;
            // Add other modules...
            default:
                showError('Module not implemented yet');
        }
    } catch (error) {
        console.error(`Error in module ${moduleName}:`, error);
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Module implementations
async function handleRgbeRpbe() {
    const response = await fetchJson('/run-rgbe-rpbe', {
        method: 'POST',
        body: JSON.stringify({
            selected_wells: state.selectedWells
        })
    });

    updatePlot(response.plotData);
    showSuccess('RGBE-RPBE calculation completed');
}

async function handleSwgrad() {
    // Show parameter form for SWGRAD
    document.getElementById('parameterForm').classList.remove('hidden');
    const parameters = await fetchJson('/get-swgrad-parameters');
    createParameterForm(parameters);
}

async function handleDnsDnsv() {
    const response = await fetchJson('/run-dns-dnsv', {
        method: 'POST',
        body: JSON.stringify({
            selected_wells: state.selectedWells
        })
    });

    updatePlot(response.plotData);
    showSuccess('DNS-DNSV calculation completed');
}

async function handleRtRo() {
    const response = await fetchJson('/run-rt-ro', {
        method: 'POST',
        body: JSON.stringify({
            selected_wells: state.selectedWells
        })
    });

    updatePlot(response.plotData);
    showSuccess('RT-RO calculation completed');
}

async function handleHistogram() {
    const response = await fetchJson('/get-histogram', {
        method: 'POST',
        body: JSON.stringify({
            selected_wells: state.selectedWells
        })
    });

    updatePlot(response.plotData);
}

// Plotting
function updatePlot(plotData) {
    const plotArea = document.getElementById('plotArea');
    Plotly.newPlot(plotArea, plotData.data, plotData.layout, {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        scrollZoom: true,
        modeBarButtonsToRemove: ['lasso2d', 'select2d']
    });
}

// Parameter handling
function createParameterForm(parameters) {
    state.parameters = parameters;
    const tbody = document.getElementById('parameterRows');

    tbody.innerHTML = parameters.map(param => {
        const rowClass = param.isEnabled
            ? `param-row-${param.location.toLowerCase()}-${param.mode.toLowerCase()}`
            : 'param-row-disabled';

        return `
        <tr class="${rowClass}">
            <td>${param.id}</td>
            <td>${param.location}</td>
            <td>${param.mode}</td>
            <td>${param.comment}</td>
            <td>${param.unit}</td>
            <td>${param.name}</td>
            <td>
                <input type="checkbox" 
                       ${param.isEnabled ? 'checked' : ''} 
                       onchange="toggleParameter(${param.id})" />
            </td>
            ${state.selectedIntervals.map(interval => `
                <td>
                    <input type="number" 
                           value="${param.values[interval] || ''}"
                           onchange="updateParameterValue(${param.id}, '${interval}', this.value)"
                           ${!param.isEnabled ? 'disabled' : ''} />
                </td>
            `).join('')}
        </tr>
    `}).join('');
}

function toggleParameter(paramId) {
    const param = state.parameters.find(p => p.id === paramId);
    if (param) {
        param.isEnabled = !param.isEnabled;
        createParameterForm(state.parameters);
    }
}

function updateParameterValue(paramId, interval, value) {
    const param = state.parameters.find(p => p.id === paramId);
    if (param) {
        param.values[interval] = parseFloat(value) || 0;
    }
}

async function submitParameters() {
    showLoading();
    try {
        const response = await fetchJson('/submit-parameters', {
            method: 'POST',
            body: JSON.stringify({
                parameters: state.parameters,
                selected_wells: state.selectedWells
            })
        });

        updatePlot(response.plotData);
        showSuccess('Parameters processed successfully');
        document.getElementById('parameterForm').classList.add('hidden');
    } catch (error) {
        showError('Failed to process parameters: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Initialize
window.onload = function () {
    initializeApp();
};

async function initializeApp() {
    try {
        console.log('Initializing webapp...');

        // Test if Dataiku APIs are available
        if (window.dataiku && window.dataiku.getWebAppBackendUrl) {
            console.log('Dataiku APIs available');
        } else {
            console.log('Using fallback mode');
        }

        // Test backend connection and check if dataset is already loaded
        const response = await fetchJson('/first_api_call');
        console.log('Backend connected:', response);

        if (response.dataset_loaded && response.wells) {
            // Dataset is already loaded from backend initialization
            console.log('Dataset already loaded:', response.current_dataset);
            await loadWellsFromDataset(response.wells);
            showSuccess(`Application initialized with ${response.well_count} wells from ${response.current_dataset} dataset`);
        } else {
            // Auto-load fix_pass_qc dataset if not already loaded
            await autoLoadDefaultDataset();
        }
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError('Failed to connect to backend: ' + error.message);
    }
}

// Auto-load the fix_pass_qc dataset
async function autoLoadDefaultDataset() {
    try {
        console.log('Auto-loading fix_pass_qc dataset...');

        // Select the fix_pass_qc dataset
        const selectResponse = await fetchJson('/select_dataset', {
            method: 'POST',
            body: JSON.stringify({ dataset_name: 'fix_pass_qc' })
        });

        if (selectResponse.status === 'success') {
            console.log('Successfully loaded fix_pass_qc dataset:', selectResponse);

            // Load wells from the dataset
            await loadWellsFromDataset(selectResponse.wells);

            showSuccess(`Loaded ${selectResponse.wells.length} wells from fix_pass_qc dataset`);
        } else {
            console.error('Failed to load fix_pass_qc dataset:', selectResponse.message);
            showError('Failed to load fix_pass_qc dataset: ' + selectResponse.message);
        }
    } catch (error) {
        console.error('Error auto-loading dataset:', error);
        showError('Error loading dataset: ' + error.message);
    }
}

// Load wells into the UI
async function loadWellsFromDataset(wells) {
    try {
        console.log('Loading wells into UI:', wells);

        // Update the well list in the UI
        const wellList = document.getElementById('wellList');
        if (wellList) {
            wellList.innerHTML = ''; // Clear existing wells

            wells.forEach(wellName => {
                const wellItem = document.createElement('div');
                wellItem.className = 'well-item';
                wellItem.innerHTML = `
                    <input type="checkbox" id="well_${wellName}" value="${wellName}">
                    <label for="well_${wellName}">${wellName}</label>
                `;
                wellList.appendChild(wellItem);
            });

            console.log(`Added ${wells.length} wells to the UI`);
        }
    } catch (error) {
        console.error('Error loading wells into UI:', error);
    }
}

// Add dataset loading function (kept for compatibility)
async function loadDatasets() {
    try {
        const response = await fetchJson('/get_datasets');
        console.log('Available datasets:', response);

        if (response.status === 'success') {
            // Update UI with available datasets
            updateDatasetList(response.datasets);
        }
    } catch (error) {
        console.error('Failed to load datasets:', error);
    }
}

function updateDatasetList(datasets) {
    // You can implement this to show datasets in your UI
    console.log('Datasets loaded:', datasets);
}
