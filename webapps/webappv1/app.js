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

            // Handle malformed JSON responses
            try {
                return await response.json();
            } catch (jsonError) {
                console.error('Invalid JSON response:', jsonError);
                const text = await response.text();
                console.error('Response text:', text);
                throw new Error('Server returned invalid JSON: ' + jsonError.message);
            }
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

            // Handle malformed JSON responses
            try {
                return await response.json();
            } catch (jsonError) {
                console.error('Invalid JSON response:', jsonError);
                const text = await response.text();
                console.error('Response text:', text);
                throw new Error('Server returned invalid JSON: ' + jsonError.message);
            }
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
    console.log('🔥 toggleWell called with:', wellId);
    console.log('🔥 Current selected wells before:', state.selectedWells);

    const index = state.selectedWells.indexOf(wellId);
    if (index === -1) {
        state.selectedWells.push(wellId);
        console.log('🔥 Well added to selection:', wellId);
        console.log('🔥 Selected wells after adding:', state.selectedWells);

        // Auto-load well plot when selected, then update intervals
        loadWellPlotAndUpdateIntervals(wellId);
    } else {
        state.selectedWells.splice(index, 1);
        console.log('🔥 Well removed from selection:', wellId);
        console.log('🔥 Selected wells after removing:', state.selectedWells);

        // Clear plot if no wells selected
        if (state.selectedWells.length === 0) {
            console.log('🔥 No wells selected, clearing plot and intervals');
            clearPlotArea();
            clearIntervals(); // Clear intervals when no wells selected
        } else {
            // Load plot for the last selected well
            const lastWell = state.selectedWells[state.selectedWells.length - 1];
            console.log('🔥 Loading plot for last selected well:', lastWell);
            loadWellPlotAndUpdateIntervals(lastWell);
        }
    }
    updateWellSelection();
}

// Load well plot and then update intervals
async function loadWellPlotAndUpdateIntervals(wellName) {
    try {
        console.log('🚀 Loading plot for well:', wellName);
        console.log('🚀 Fetching from endpoint: /get_well_plot');
        showLoading();

        const response = await fetchJson('/get_well_plot', {
            method: 'POST',
            body: JSON.stringify({ well_name: wellName })
        });

        console.log('🚀 Plot response received:', response);

        if (response.status === 'success') {
            // Display the plot using Plotly
            const plotArea = document.getElementById('plotArea');
            console.log('🚀 Plot area element:', plotArea);

            if (plotArea && response.figure) {
                console.log('🚀 Creating Plotly plot with data:', response.figure);
                console.log('🚀 Number of traces:', response.figure.data ? response.figure.data.length : 'undefined');
                console.log('🚀 Layout height:', response.figure.layout ? response.figure.layout.height : 'undefined');

                // Clear any existing plot completely
                Plotly.purge(plotArea);

                // Ensure the plot area is properly sized
                plotArea.style.width = '100%';
                plotArea.style.height = '70vh';
                plotArea.style.minHeight = '600px';

                // Create enhanced config for better performance
                const config = {
                    responsive: true,
                    displayModeBar: true,
                    modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d'],
                    scrollZoom: false,
                    doubleClick: 'reset',
                    toImageButtonOptions: {
                        format: 'png',
                        filename: `well_log_${wellName}`,
                        height: 1500,
                        width: 1200,
                        scale: 1
                    }
                };

                // Override layout for better display
                const enhancedLayout = {
                    ...response.figure.layout,
                    autosize: true,
                    height: 600, // Force a reasonable height
                    margin: { l: 60, r: 60, t: 60, b: 60 },
                    showlegend: false,
                    hovermode: 'closest'
                };

                try {
                    await Plotly.newPlot(plotArea, response.figure.data, enhancedLayout, config);
                    console.log('✅ Plot created successfully');

                    // Force a resize to ensure proper display
                    setTimeout(() => {
                        Plotly.Plots.resize(plotArea);
                        console.log('✅ Plot resized');
                    }, 100);

                    showSuccess(`Plot loaded for well: ${wellName}`);
                } catch (plotError) {
                    console.error('❌ Plotly newPlot failed:', plotError);
                    showError('Failed to create plot: ' + plotError.message);

                    // Fallback: try with reduced data
                    try {
                        console.log('� Trying with reduced trace set...');
                        const reducedData = response.figure.data.slice(0, 20); // Only first 20 traces
                        await Plotly.newPlot(plotArea, reducedData, enhancedLayout, config);
                        showSuccess(`Plot loaded for well: ${wellName} (simplified view)`);
                    } catch (fallbackError) {
                        console.error('❌ Fallback plot also failed:', fallbackError);
                        showError('Plot creation failed completely');
                    }
                }

                // After successful plot loading, update intervals for the selected well(s)
                await updateIntervalsForSelectedWells();
            } else {
                console.error('🚀 Missing plot area or figure data');
                showError('Plot area not found or missing figure data');
            }
        } else {
            console.error('🚀 Plot request failed:', response);
            showError('Failed to load plot: ' + (response.message || 'Unknown error'));
        }

        hideLoading();
    } catch (error) {
        console.error('🚀 Error loading well plot:', error);
        showError('Error loading well plot: ' + error.message);
        hideLoading();
    }
}// Legacy function for backward compatibility
async function loadWellPlot(wellName) {
    return loadWellPlotAndUpdateIntervals(wellName);
}

// Clear the plot area
function clearPlotArea() {
    const plotArea = document.getElementById('plotArea');
    if (plotArea) {
        plotArea.innerHTML = '';
    }
}

function updateWellSelection() {
    console.log('🎨 Updating well selection visual feedback');
    const wells = document.querySelectorAll('#wellList .list-item');
    wells.forEach(well => {
        const wellId = well.getAttribute('data-id');
        if (state.selectedWells.includes(wellId)) {
            well.classList.add('selected');
            well.style.backgroundColor = '#007bff';
            well.style.color = 'white';
            console.log('🎨 Marked well as selected:', wellId);
        } else {
            well.classList.remove('selected');
            well.style.backgroundColor = '#f9f9f9';
            well.style.color = 'black';
        }
    });
    console.log('🎨 Updated visual feedback for', wells.length, 'wells');
}

function updateIntervalSelection() {
    console.log('🎨 Updating interval selection visual feedback');
    const intervals = document.querySelectorAll('#intervalList .list-item');
    intervals.forEach(interval => {
        const intervalId = interval.getAttribute('data-id');
        if (state.selectedIntervals.includes(intervalId)) {
            interval.classList.add('selected');
            interval.style.backgroundColor = '#28a745';
            interval.style.color = 'white';
            console.log('🎨 Marked interval as selected:', intervalId);
        } else {
            interval.classList.remove('selected');
            interval.style.backgroundColor = '#f9f9f9';
            interval.style.color = 'black';
        }
    });
    console.log('🎨 Updated visual feedback for', intervals.length, 'intervals');
}

// Test function to verify Plotly is working
function createTestPlot() {
    console.log('🧪 Creating test plot...');
    const plotArea = document.getElementById('plotArea');
    if (!plotArea) {
        console.error('❌ Plot area not found');
        return;
    }

    const testData = [{
        x: [1, 2, 3, 4, 5],
        y: [10, 11, 12, 13, 14],
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Test Line'
    }];

    const layout = {
        title: 'Test Plot - Plotly is Working!',
        xaxis: { title: 'X Axis' },
        yaxis: { title: 'Y Axis' },
        height: 400,
        margin: { l: 50, r: 50, t: 50, b: 50 }
    };

    const config = { responsive: true };

    Plotly.newPlot(plotArea, testData, layout, config)
        .then(() => {
            console.log('✅ Test plot created successfully');
            showSuccess('Test plot created - Plotly is working!');
        })
        .catch(error => {
            console.error('❌ Test plot failed:', error);
            showError('Test plot failed: ' + error.message);
        });
}

// Debug function to check plot area state
function debugPlotArea() {
    const plotArea = document.getElementById('plotArea');
    console.log('🔍 Plot Area Debug:');
    console.log('  - Element:', plotArea);
    console.log('  - innerHTML length:', plotArea ? plotArea.innerHTML.length : 'N/A');
    console.log('  - Style width:', plotArea ? plotArea.style.width : 'N/A');
    console.log('  - Style height:', plotArea ? plotArea.style.height : 'N/A');
    console.log('  - Computed style:', plotArea ? window.getComputedStyle(plotArea) : 'N/A');
    console.log('  - Children count:', plotArea ? plotArea.children.length : 'N/A');

    if (plotArea && plotArea.children.length > 0) {
        console.log('  - First child:', plotArea.children[0]);
        console.log('  - First child classes:', plotArea.children[0].className);
    }

    // Check if Plotly data exists
    if (plotArea && plotArea.data) {
        console.log('  - Plotly data traces:', plotArea.data.length);
    } else {
        console.log('  - No Plotly data found');
    }

    // Check if there are any SVG elements
    const svgs = plotArea ? plotArea.querySelectorAll('svg') : [];
    console.log('  - SVG elements found:', svgs.length);
    svgs.forEach((svg, i) => {
        console.log(`    SVG ${i}:`, svg.getAttribute('width'), 'x', svg.getAttribute('height'));
    });
}

// Simple function to test basic well log plotting
function createSimpleWellPlot() {
    console.log('📊 Creating simple well log plot...');
    const plotArea = document.getElementById('plotArea');
    if (!plotArea) {
        console.error('❌ Plot area not found');
        return;
    }

    // Clear existing plot
    Plotly.purge(plotArea);

    // Create simple well log data
    const depths = [];
    const gr = [];
    const rt = [];

    for (let i = 0; i < 100; i++) {
        depths.push(3000 + i * 2); // Depth from 3000 to 3200
        gr.push(50 + Math.random() * 100); // GR values 50-150
        rt.push(1 + Math.random() * 10); // RT values 1-11
    }

    const traces = [
        {
            x: gr,
            y: depths,
            type: 'scatter',
            mode: 'lines',
            name: 'Gamma Ray',
            line: { color: 'green', width: 2 },
            xaxis: 'x',
            yaxis: 'y'
        },
        {
            x: rt,
            y: depths,
            type: 'scatter',
            mode: 'lines',
            name: 'Resistivity',
            line: { color: 'red', width: 2 },
            xaxis: 'x2',
            yaxis: 'y'
        }
    ];

    const layout = {
        title: 'Simple Well Log Test',
        height: 600,
        xaxis: {
            title: 'Gamma Ray (API)',
            domain: [0, 0.45],
            range: [0, 200]
        },
        xaxis2: {
            title: 'Resistivity (ohm.m)',
            domain: [0.55, 1],
            range: [0.1, 100],
            type: 'log'
        },
        yaxis: {
            title: 'Depth (ft)',
            autorange: 'reversed',
            side: 'right'
        },
        showlegend: true,
        margin: { l: 60, r: 60, t: 60, b: 60 }
    };

    const config = { responsive: true };

    Plotly.newPlot(plotArea, traces, layout, config)
        .then(() => {
            console.log('✅ Simple well log plot created successfully');
            showSuccess('Simple well log plot created successfully!');
        })
        .catch(error => {
            console.error('❌ Simple plot failed:', error);
            showError('Simple plot failed: ' + error.message);
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
        // Get the first selected well for single-well operations
        const wellName = state.selectedWells[0];

        switch (moduleName) {
            case 'default-log':
            case 'log-plot':
                await createDefaultLogPlot(wellName);
                break;
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
            case 'vsh-calculation':
                await handleVshCalculation();
                break;
            case 'porosity-calculation':
                await handlePorosityCalculation();
                break;
            case 'sw-calculation':
                await handleSwCalculation();
                break;
            case 'rgsa-ngsa-dgsa':
                await handleGsaCalculation();
                break;
            case 'normalization':
                await handleNormalization();
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

// Create default log plot for selected well
async function createDefaultLogPlot(wellName) {
    try {
        console.log('📊 Creating default log plot for well:', wellName);

        const response = await fetchJson('/get_plot_for_calculation', {
            method: 'POST',
            body: JSON.stringify({
                calculation_type: 'default',
                well_name: wellName
            })
        });

        console.log('📊 Plot response:', response);

        if (response.status === 'success') {
            const plotArea = document.getElementById('plotArea');
            if (plotArea && response.figure) {
                console.log('📊 Figure data structure:', {
                    data: response.figure.data ? response.figure.data.length : 'undefined',
                    layout: response.figure.layout ? 'present' : 'undefined'
                });

                // Debug the data traces
                if (response.figure.data) {
                    response.figure.data.forEach((trace, index) => {
                        console.log(`📊 Trace ${index}:`, {
                            type: trace.type,
                            name: trace.name,
                            x_length: trace.x ? trace.x.length : 0,
                            y_length: trace.y ? trace.y.length : 0,
                            x_sample: trace.x ? trace.x.slice(0, 3) : 'no x data',
                            y_sample: trace.y ? trace.y.slice(0, 3) : 'no y data'
                        });
                    });
                }

                // Clear any existing plot
                plotArea.innerHTML = '';

                // Create the plot with enhanced configuration
                const config = {
                    responsive: true,
                    displayModeBar: true,
                    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
                    toImageButtonOptions: {
                        format: 'png',
                        filename: `well_log_${wellName}`,
                        height: 1500,
                        width: 1200,
                        scale: 1
                    }
                };

                await Plotly.newPlot(plotArea, response.figure.data, response.figure.layout, config);
                console.log('📊 Plot created successfully');
                showSuccess(`Default log plot created for ${wellName}`);

                // Verify the plot was created
                const plotDiv = document.getElementById('plotArea');
                if (plotDiv && plotDiv.data && plotDiv.data.length > 0) {
                    console.log('✅ Plot verification: Plot has', plotDiv.data.length, 'traces');
                } else {
                    console.log('⚠️ Plot verification: No traces found in plot');
                }

            } else {
                console.error('❌ Missing plot area or figure data');
                showError('Plot area not found or no figure data received');
            }
        } else {
            console.error('❌ Backend error:', response.message);
            showError('Failed to create log plot: ' + response.message);
        }
    } catch (error) {
        console.error('❌ Error creating default log plot:', error);
        showError('Error creating log plot: ' + error.message);
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
    console.log('🚀 Window loaded, starting initialization...');

    // Test if Plotly is available
    if (typeof Plotly !== 'undefined') {
        console.log('✅ Plotly.js is loaded, version:', Plotly.version);
        // Test basic Plotly functionality
        try {
            const testDiv = document.createElement('div');
            testDiv.style.display = 'none';
            document.body.appendChild(testDiv);
            Plotly.newPlot(testDiv, [{ x: [1, 2, 3], y: [1, 2, 3], type: 'scatter' }]);
            console.log('✅ Plotly basic functionality test passed');
            document.body.removeChild(testDiv);
        } catch (e) {
            console.error('❌ Plotly basic functionality test failed:', e);
        }
    } else {
        console.error('❌ Plotly.js is not loaded!');
    }

    // Test if functions are available
    console.log('🚀 toggleWell function available:', typeof toggleWell);
    console.log('🚀 state object available:', typeof state);
    console.log('🚀 fetchJson function available:', typeof fetchJson);

    // Make functions globally accessible for debugging and HTML onclick handlers
    window.toggleWell = toggleWell;
    window.state = state;
    window.fetchJson = fetchJson;
    window.createDefaultLogPlot = createDefaultLogPlot;
    window.loadModule = loadModule;
    window.toggleAllWells = toggleAllWells;
    window.toggleAllIntervals = toggleAllIntervals;
    window.toggleAllSets = toggleAllSets;
    window.createTestPlot = createTestPlot;
    window.debugPlotArea = debugPlotArea;
    window.createSimpleWellPlot = createSimpleWellPlot;
    window.Plotly = Plotly; // Make sure Plotly is accessible globally

    console.log('✅ All functions exposed globally');

    initializeApp();
};

async function initializeApp() {
    try {
        console.log('🚀 Initializing webapp...');

        // Test if Dataiku APIs are available
        if (window.dataiku && window.dataiku.getWebAppBackendUrl) {
            console.log('🚀 Dataiku APIs available');
        } else {
            console.log('🚀 Using fallback mode (no Dataiku APIs)');
        }

        // Test backend connection and check if dataset is already loaded
        const response = await fetchJson('/first_api_call');
        console.log('🚀 Backend connected:', response);

        if (response.dataset_loaded && response.wells) {
            // Dataset is already loaded from backend initialization
            console.log('🚀 Dataset already loaded:', response.current_dataset);
            await loadWellsFromDataset(response.wells);
            showSuccess(`Application initialized with ${response.well_count} wells from ${response.current_dataset} dataset`);
        } else {
            // Auto-load fix_pass_qc dataset if not already loaded
            await autoLoadDefaultDataset();
        }
    } catch (error) {
        console.error('🚀 Failed to initialize app:', error);
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

// Load wells into the UI with proper integration
async function loadWellsFromDataset(wells) {
    try {
        console.log('🏗️ Loading wells into UI:', wells);

        // Update the well list in the UI
        const wellList = document.getElementById('wellList');
        if (wellList) {
            wellList.innerHTML = ''; // Clear existing wells

            wells.forEach(wellName => {
                const wellItem = document.createElement('div');
                wellItem.className = 'list-item';
                wellItem.setAttribute('data-id', wellName);
                wellItem.textContent = wellName;
                wellItem.style.cursor = 'pointer'; // Make it clear it's clickable
                wellItem.style.padding = '8px';
                wellItem.style.margin = '2px 0';
                wellItem.style.border = '1px solid #ddd';
                wellItem.style.borderRadius = '4px';
                wellItem.style.backgroundColor = '#f9f9f9';

                // Add click event listener - THIS IS THE FIX!
                wellItem.addEventListener('click', function () {
                    console.log('🔥 Well clicked via event listener:', wellName);
                    toggleWell(wellName);
                });

                // Add hover effect
                wellItem.addEventListener('mouseenter', function () {
                    this.style.backgroundColor = '#e9e9e9';
                });
                wellItem.addEventListener('mouseleave', function () {
                    if (!state.selectedWells.includes(wellName)) {
                        this.style.backgroundColor = '#f9f9f9';
                    }
                });

                wellList.appendChild(wellItem);
                console.log('🏗️ Added well with click listener:', wellName);
            });

            console.log(`🏗️ Added ${wells.length} wells to the UI with click handlers`);
        } else {
            console.error('🏗️ Well list element not found in DOM');
        }

        // Don't load intervals initially - they will be loaded when wells are selected

    } catch (error) {
        console.error('🏗️ Error loading wells into UI:', error);
    }
}

// Update intervals based on selected wells
async function updateIntervalsForSelectedWells() {
    try {
        console.log('📋 Updating intervals for selected wells:', state.selectedWells);

        if (state.selectedWells.length === 0) {
            console.log('📋 No wells selected, clearing intervals');
            clearIntervals();
            return;
        }

        // Get intervals/markers from the API
        console.log('📋 Fetching markers from /get_markers endpoint');
        const response = await fetchJson('/get_markers');
        console.log('📋 Markers response:', response);

        if (response.status === 'success') {
            const intervalList = document.getElementById('intervalList');
            console.log('📋 Interval list element:', intervalList);

            if (intervalList) {
                intervalList.innerHTML = ''; // Clear existing intervals

                response.markers.forEach(marker => {
                    const intervalItem = document.createElement('div');
                    intervalItem.className = 'list-item';
                    intervalItem.setAttribute('data-id', marker);
                    intervalItem.textContent = marker;
                    intervalItem.style.cursor = 'pointer';
                    intervalItem.style.padding = '8px';
                    intervalItem.style.margin = '2px 0';
                    intervalItem.style.border = '1px solid #ddd';
                    intervalItem.style.borderRadius = '4px';
                    intervalItem.style.backgroundColor = '#f9f9f9';

                    // Add click event listener for intervals
                    intervalItem.addEventListener('click', function () {
                        console.log('📋 Interval clicked via event listener:', marker);
                        toggleInterval(marker);
                    });

                    // Add hover effect for intervals
                    intervalItem.addEventListener('mouseenter', function () {
                        this.style.backgroundColor = '#e9e9e9';
                    });
                    intervalItem.addEventListener('mouseleave', function () {
                        if (!state.selectedIntervals.includes(marker)) {
                            this.style.backgroundColor = '#f9f9f9';
                        }
                    });

                    intervalList.appendChild(intervalItem);
                });

                console.log(`📋 Updated ${response.markers.length} intervals for selected wells`);
                showSuccess(`Loaded ${response.markers.length} intervals for selected wells`);
            } else {
                console.error('📋 Interval list element not found');
            }
        } else {
            console.error('📋 Failed to get markers:', response);
            showError('Failed to load intervals: ' + (response.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('📋 Error updating intervals:', error);
        showError('Error loading intervals: ' + error.message);
    }
}// Clear intervals list
function clearIntervals() {
    const intervalList = document.getElementById('intervalList');
    if (intervalList) {
        intervalList.innerHTML = '';
    }
    state.selectedIntervals = []; // Clear selected intervals state
    console.log('Intervals cleared');
}

// Toggle interval selection
function toggleInterval(intervalId) {
    console.log('📋 toggleInterval called with:', intervalId);
    console.log('📋 Current selected intervals before:', state.selectedIntervals);

    const index = state.selectedIntervals.indexOf(intervalId);
    if (index === -1) {
        state.selectedIntervals.push(intervalId);
        console.log('📋 Interval added to selection:', intervalId);
    } else {
        state.selectedIntervals.splice(index, 1);
        console.log('📋 Interval removed from selection:', intervalId);
    }
    console.log('📋 Selected intervals after:', state.selectedIntervals);
    updateIntervalSelection();
}

// Update interval selection display
function updateIntervalSelection() {
    console.log('🎨 Updating interval selection visual feedback');
    const intervals = document.querySelectorAll('#intervalList .list-item');
    intervals.forEach(interval => {
        const intervalId = interval.getAttribute('data-id');
        if (state.selectedIntervals.includes(intervalId)) {
            interval.classList.add('selected');
            interval.style.backgroundColor = '#007bff';
            interval.style.color = 'white';
            console.log('🎨 Marked interval as selected:', intervalId);
        } else {
            interval.classList.remove('selected');
            interval.style.backgroundColor = '#f9f9f9';
            interval.style.color = 'black';
        }
    });
    console.log('🎨 Updated visual feedback for', intervals.length, 'intervals');
}// Add dataset loading function (kept for compatibility)
// Handle VSH calculation
async function handleVshCalculation() {
    try {
        // Get calculation parameters
        const paramResponse = await fetchJson('/get_calculation_params', {
            method: 'POST',
            body: JSON.stringify({ calculation_type: 'vsh' })
        });

        if (paramResponse.status === 'success') {
            // For now, use default parameters
            const defaultParams = {
                GR_MA: 30,
                GR_SH: 120,
                input_log: 'GR',
                output_log: 'VSH_GR'
            };

            // Run the calculation
            const calcResponse = await fetchJson('/run_calculation_endpoint', {
                method: 'POST',
                body: JSON.stringify({
                    calculation_type: 'vsh',
                    params: defaultParams
                })
            });

            if (calcResponse.status === 'success') {
                showSuccess('VSH calculation completed');
                // Create VSH plot
                await createCalculationPlot('vsh');
            } else {
                showError('VSH calculation failed: ' + calcResponse.message);
            }
        }
    } catch (error) {
        console.error('Error in VSH calculation:', error);
        showError('VSH calculation error: ' + error.message);
    }
}

// Handle porosity calculation
async function handlePorosityCalculation() {
    try {
        const defaultParams = {
            PHIE_METHOD: 'density',
            RHO_MA: 2.65,
            RHO_FL: 1.0,
            NPHI_MA: 0.0
        };

        const calcResponse = await fetchJson('/run_calculation_endpoint', {
            method: 'POST',
            body: JSON.stringify({
                calculation_type: 'porosity',
                params: defaultParams
            })
        });

        if (calcResponse.status === 'success') {
            showSuccess('Porosity calculation completed');
            await createCalculationPlot('porosity');
        } else {
            showError('Porosity calculation failed: ' + calcResponse.message);
        }
    } catch (error) {
        console.error('Error in porosity calculation:', error);
        showError('Porosity calculation error: ' + error.message);
    }
}

// Handle GSA calculation
async function handleGsaCalculation() {
    try {
        const defaultParams = {
            window_size: 50,
            overlap: 25,
            min_samples: 10
        };

        const calcResponse = await fetchJson('/run_calculation_endpoint', {
            method: 'POST',
            body: JSON.stringify({
                calculation_type: 'gsa',
                params: defaultParams
            })
        });

        if (calcResponse.status === 'success') {
            showSuccess('GSA calculation completed');
            await createCalculationPlot('gsa');
        } else {
            showError('GSA calculation failed: ' + calcResponse.message);
        }
    } catch (error) {
        console.error('Error in GSA calculation:', error);
        showError('GSA calculation error: ' + error.message);
    }
}

// Handle SW calculation
async function handleSwCalculation() {
    try {
        const defaultParams = {
            rw: 0.1,
            a: 1.0,
            m: 2.0,
            n: 2.0
        };

        const calcResponse = await fetchJson('/run_calculation_endpoint', {
            method: 'POST',
            body: JSON.stringify({
                calculation_type: 'sw',
                params: defaultParams
            })
        });

        if (calcResponse.status === 'success') {
            showSuccess('Water saturation calculation completed');
            await createCalculationPlot('sw');
        } else {
            showError('SW calculation failed: ' + calcResponse.message);
        }
    } catch (error) {
        console.error('Error in SW calculation:', error);
        showError('SW calculation error: ' + error.message);
    }
}

// Handle normalization
async function handleNormalization() {
    try {
        const defaultParams = {
            LOG_IN: 'GR',
            LOG_OUT: 'GR_NORM',
            LOW_REF: 40,
            HIGH_REF: 140,
            LOW_IN: 3,
            HIGH_IN: 97,
            CUTOFF_MIN: 0.0,
            CUTOFF_MAX: 250.0,
            intervals: state.selectedIntervals
        };

        const calcResponse = await fetchJson('/run_calculation_endpoint', {
            method: 'POST',
            body: JSON.stringify({
                calculation_type: 'normalization',
                params: defaultParams
            })
        });

        if (calcResponse.status === 'success') {
            showSuccess('Normalization completed');
            await createCalculationPlot('normalization');
        } else {
            showError('Normalization failed: ' + calcResponse.message);
        }
    } catch (error) {
        console.error('Error in normalization:', error);
        showError('Normalization error: ' + error.message);
    }
}

// Create plot for calculation results
async function createCalculationPlot(calculationType) {
    try {
        const wellName = state.selectedWells.length > 0 ? state.selectedWells[0] : null;

        const response = await fetchJson('/get_plot_for_calculation', {
            method: 'POST',
            body: JSON.stringify({
                calculation_type: calculationType,
                well_name: wellName
            })
        });

        if (response.status === 'success') {
            const plotArea = document.getElementById('plotArea');
            if (plotArea && response.figure) {
                Plotly.newPlot(plotArea, response.figure.data, response.figure.layout, { responsive: true });
            }
        } else {
            console.error('Failed to create plot:', response.message);
        }
    } catch (error) {
        console.error('Error creating calculation plot:', error);
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

// Select All / Deselect All functions
function toggleAllWells() {
    const checkbox = document.getElementById('selectAllWells');
    const wellItems = document.querySelectorAll('#wellList .list-item');

    console.log('🔄 Toggle All Wells:', checkbox.checked);

    if (checkbox.checked) {
        // Select all wells
        state.selectedWells = [];
        wellItems.forEach(item => {
            const wellId = item.getAttribute('data-id');
            if (wellId && !state.selectedWells.includes(wellId)) {
                state.selectedWells.push(wellId);
            }
        });
        console.log('✅ Selected all wells:', state.selectedWells);
    } else {
        // Deselect all wells
        state.selectedWells = [];
        clearPlotArea();
        clearIntervals();
        console.log('❌ Deselected all wells');
    }

    updateWellSelection();

    // Load plot for first selected well if any
    if (state.selectedWells.length > 0) {
        loadWellPlotAndUpdateIntervals(state.selectedWells[0]);
    }
}

function toggleAllIntervals() {
    const checkbox = document.getElementById('selectAllIntervals');
    const intervalItems = document.querySelectorAll('#intervalList .list-item');

    console.log('🔄 Toggle All Intervals:', checkbox.checked);

    if (checkbox.checked) {
        // Select all intervals
        state.selectedIntervals = [];
        intervalItems.forEach(item => {
            const intervalId = item.getAttribute('data-id');
            if (intervalId && !state.selectedIntervals.includes(intervalId)) {
                state.selectedIntervals.push(intervalId);
            }
        });
        console.log('✅ Selected all intervals:', state.selectedIntervals);
    } else {
        // Deselect all intervals
        state.selectedIntervals = [];
        console.log('❌ Deselected all intervals');
    }

    updateIntervalSelection();
}

function toggleAllSets() {
    const checkbox = document.getElementById('selectAllSets');
    // TODO: Implement saved sets functionality
    console.log('🔄 Toggle All Sets:', checkbox.checked);
}
