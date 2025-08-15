<<<<<<< HEAD
/**
 * Global Application State - Enhanced
 * Manages the state for the entire application, including selections and data context.
 */
var appState = {
=======
// Access the parameters that end-users filled in using webapp config
// For example, for a parameter called "input_dataset"
// input_dataset = dataiku.getWebAppConfig()['input_dataset']

// State management
const state = {
>>>>>>> 2b731181d46adad96dd6e19e6fe143592fd3604d
    selectedWells: [],
    selectedIntervals: [],
    savedSets: [],
    currentModule: null,
    plotData: null,
    parameters: [],
<<<<<<< HEAD
    isLoading: false,
    currentDataset: null,
    availableWells: [],
    availableIntervals: [],
    plotType: 'default',
    currentStructure: null, // IMPORTANT: Will hold the context of the selected structure
    selectedFilePath: null,
    plotFigure: { data: [], layout: {} },
    error: null,
    wellColumns: {}
};

/**
 * Mock data for testing when the backend is not available.
 */
var mockData = {
    wells: ['WELL-001', 'WELL-002', 'WELL-003', 'WELL-004', 'WELL-005'],
    markers: ['MARKER-A', 'MARKER-B', 'MARKER-C', 'MARKER-D'],
    plotData: {
        data: [
            {
                x: [50, 60, 70, 80, 90, 100, 110, 120],
                y: [3000, 3010, 3020, 3030, 3040, 3050, 3060, 3070],
                type: 'scatter',
                mode: 'lines',
                name: 'Gamma Ray',
                line: { color: 'green', width: 2 }
            },
            {
                x: [1, 2, 5, 10, 20, 50, 100, 200],
                y: [3000, 3010, 3020, 3030, 3040, 3050, 3060, 3070],
                type: 'scatter',
                mode: 'lines',
                name: 'Resistivity',
                line: { color: 'red', width: 2 },
                xaxis: 'x2'
            }
        ],
        layout: {
            title: 'Mock Well Log Plot',
            height: 600,
            xaxis: {
                title: 'Gamma Ray (API)',
                domain: [0, 0.45]
            },
            xaxis2: {
                title: 'Resistivity (ohm.m)',
                domain: [0.55, 1],
                type: 'log'
            },
            yaxis: {
                title: 'Depth (ft)',
                autorange: 'reversed'
            },
            showlegend: true
        }
    }
};

/**
 * Structures Mock Data - The main database for fields and structures.
 */
var structuresData = {
    fields: [
        {
            field_name: "Adera",
            structures_count: 4,
            structures: [
                {
                    structure_name: "Abab",
                    field_name: "Adera",
                    file_path: "/data/structures/Adera/Abab.xlsx",
                    wells_count: 12,
                    wells: ["ABB-001", "ABB-002", "ABB-003", "ABB-004", "ABB-005", "ABB-006", "ABB-007", "ABB-008", "ABB-009", "ABB-010", "ABB-011", "ABB-012"],
                    total_records: 1200,
                    columns: ["DEPTH", "GR", "NPHI", "RHOB", "RT"],
                    intervals: ["ABAB-TOP", "ABAB-MID", "ABAB-BOTTOM", "ABAB-RESERVOIR"],
                    data_types: { "DEPTH": "float64", "GR": "float64", "NPHI": "float64", "RHOB": "float64", "RT": "float64" },
                    statistics: {
                        "GR": { count: 1200, mean: 75.5, min: 10.2, max: 150.8 },
                        "NPHI": { count: 1200, mean: 0.25, min: 0.05, max: 0.45 },
                        "RHOB": { count: 1200, mean: 2.35, min: 1.95, max: 2.85 }
                    }
                },
                {
                    structure_name: "Benuang",
                    field_name: "Adera",
                    file_path: "/data/structures/Adera/Benuang.xlsx",
                    wells_count: 8,
                    wells: ["BNG-001", "BNG-002", "BNG-003", "BNG-004", "BNG-005", "BNG-006", "BNG-007", "BNG-008"],
                    total_records: 850,
                    columns: ["DEPTH", "GR", "NPHI", "RHOB"],
                    intervals: ["BNG-UPPER", "BNG-LOWER", "BNG-MAIN"],
                    data_types: { "DEPTH": "float64", "GR": "float64", "NPHI": "float64", "RHOB": "float64" },
                    statistics: {
                        "GR": { count: 850, mean: 68.2, min: 15.1, max: 145.3 },
                        "NPHI": { count: 850, mean: 0.22, min: 0.08, max: 0.42 }
                    }
                },
                {
                    structure_name: "Dewa",
                    field_name: "Adera",
                    file_path: "/data/structures/Adera/Dewa.xlsx",
                    wells_count: 15,
                    wells: ["DEW-001", "DEW-002", "DEW-003", "DEW-004", "DEW-005", "DEW-006", "DEW-007", "DEW-008", "DEW-009", "DEW-010", "DEW-011", "DEW-012", "DEW-013", "DEW-014", "DEW-015"],
                    total_records: 1600,
                    columns: ["DEPTH", "GR", "NPHI", "RHOB", "RT", "SP"],
                    intervals: ["DEWA-A", "DEWA-B", "DEWA-C", "DEWA-RESERVOIR", "DEWA-SEAL"],
                    data_types: { "DEPTH": "float64", "GR": "float64", "NPHI": "float64", "RHOB": "float64", "RT": "float64", "SP": "float64" },
                    statistics: {
                        "GR": { count: 1600, mean: 82.1, min: 12.5, max: 165.2 },
                        "RT": { count: 1600, mean: 15.8, min: 0.5, max: 250.0 }
                    }
                },
                {
                    structure_name: "Raja",
                    field_name: "Adera",
                    file_path: "/data/structures/Adera/Raja.xlsx",
                    wells_count: 10,
                    wells: ["RJA-001", "RJA-002", "RJA-003", "RJA-004", "RJA-005", "RJA-006", "RJA-007", "RJA-008", "RJA-009", "RJA-010"],
                    total_records: 980,
                    columns: ["DEPTH", "GR", "NPHI", "RHOB", "RT"],
                    intervals: ["RAJA-TOP", "RAJA-MIDDLE", "RAJA-BOTTOM"],
                    data_types: { "DEPTH": "float64", "GR": "float64", "NPHI": "float64", "RHOB": "float64", "RT": "float64" },
                    statistics: { "GR": { count: 980, mean: 71.3, min: 18.7, max: 142.9 } }
                }
            ]
        },
        {
            field_name: "Limau",
            structures_count: 5,
            structures: [
                {
                    structure_name: "Belimbing",
                    field_name: "Limau",
                    file_path: "/data/structures/Limau/Belimbing.xlsx",
                    wells_count: 18,
                    wells: ["LIM-BLB-001", "LIM-BLB-002", "LIM-BLB-003", "LIM-BLB-004", "LIM-BLB-005", "LIM-BLB-006", "LIM-BLB-007", "LIM-BLB-008", "LIM-BLB-009", "LIM-BLB-010", "LIM-BLB-011", "LIM-BLB-012", "LIM-BLB-013", "LIM-BLB-014", "LIM-BLB-015", "LIM-BLB-016", "LIM-BLB-017", "LIM-BLB-018"],
                    total_records: 2100,
                    columns: ["DEPTH", "GR", "NPHI", "RHOB", "RT", "SP"],
                    intervals: ["BLB-ZONE-1", "BLB-ZONE-2", "BLB-ZONE-3", "BLB-MAIN"],
                    data_types: { "DEPTH": "float64", "GR": "float64", "NPHI": "float64", "RHOB": "float64", "RT": "float64", "SP": "float64" },
                    statistics: { "GR": { count: 2100, mean: 78.9, min: 8.3, max: 158.7 } }
                },
                {
                    structure_name: "Karangan",
                    field_name: "Limau",
                    file_path: "/data/structures/Limau/Karangan.xlsx",
                    wells_count: 7,
                    wells: ["LIM-KRG-001", "LIM-KRG-002", "LIM-KRG-003", "LIM-KRG-004", "LIM-KRG-005", "LIM-KRG-006", "LIM-KRG-007"],
                    total_records: 750,
                    columns: ["DEPTH", "GR", "NPHI", "RHOB"],
                    intervals: ["KRG-UPPER", "KRG-LOWER"],
                    data_types: {},
                    statistics: {}
                },
                {
                    structure_name: "Limau Barat",
                    field_name: "Limau",
                    file_path: "/data/structures/Limau/Limau Barat.xlsx",
                    wells_count: 22,
                    wells: ["LIM-LB-001", "LIM-LB-002", "LIM-LB-003", "LIM-LB-004", "LIM-LB-005", "LIM-LB-006", "LIM-LB-007", "LIM-LB-008", "LIM-LB-009", "LIM-LB-010", "LIM-LB-011", "LIM-LB-012", "LIM-LB-013", "LIM-LB-014", "LIM-LB-015", "LIM-LB-016", "LIM-LB-017", "LIM-LB-018", "LIM-LB-019", "LIM-LB-020", "LIM-LB-021", "LIM-LB-022"],
                    total_records: 2800,
                    columns: ["DEPTH", "GR", "NPHI", "RHOB", "RT", "SP", "CALI"],
                    intervals: ["LB-A", "LB-B", "LB-C", "LB-D", "LB-MAIN"],
                    data_types: {},
                    statistics: {}
                },
                {
                    structure_name: "Limau Tengah",
                    field_name: "Limau",
                    file_path: "/data/structures/Limau/Limau Tengah.xlsx",
                    wells_count: 16,
                    wells: ["LIM-LT-001", "LIM-LT-002", "LIM-LT-003", "LIM-LT-004", "LIM-LT-005", "LIM-LT-006", "LIM-LT-007", "LIM-LT-008", "LIM-LT-009", "LIM-LT-010", "LIM-LT-011", "LIM-LT-012", "LIM-LT-013", "LIM-LT-014", "LIM-LT-015", "LIM-LT-016"],
                    total_records: 1950,
                    columns: ["DEPTH", "GR", "NPHI", "RHOB", "RT"],
                    intervals: ["LT-ZONE-1", "LT-ZONE-2", "LT-ZONE-3"],
                    data_types: {},
                    statistics: {}
                },
                {
                    structure_name: "Tanjung Miring Barat",
                    field_name: "Limau",
                    file_path: "/data/structures/Limau/Tanjung Miring Barat.xlsx",
                    wells_count: 14,
                    wells: ["LIM-TMB-001", "LIM-TMB-002", "LIM-TMB-003", "LIM-TMB-004", "LIM-TMB-005", "LIM-TMB-006", "LIM-TMB-007", "LIM-TMB-008", "LIM-TMB-009", "LIM-TMB-010", "LIM-TMB-011", "LIM-TMB-012", "LIM-TMB-013", "LIM-TMB-014"],
                    total_records: 1650,
                    columns: ["DEPTH", "GR", "NPHI", "RHOB", "RT", "SP"],
                    intervals: ["TMB-TOP", "TMB-MIDDLE", "TMB-BOTTOM"],
                    data_types: {},
                    statistics: {}
                }
            ]
        }
    ],
    summary: {
        total_fields: 2,
        total_structures: 9,
        total_wells: 385,
        total_records: 47500
    }
};

// Structures State
var structuresState = {
    selectedField: null,
    selectedStructure: null,
    fieldDetails: null,
    structureDetails: null,
    isLoadingField: false,
    isLoadingStructure: false
};

// Current page state
var currentPage = 'structures'; // 'structures' or 'dashboard'

// Structures Functions
function showPage(pageName) {
    var structuresPage = document.getElementById('structuresPage');
    var dashboardPage = document.getElementById('dashboardPage');
    
    if (pageName === 'structures') {
        structuresPage.classList.remove('hidden');
        dashboardPage.classList.add('hidden');
        currentPage = 'structures';
    } else if (pageName === 'dashboard') {
        structuresPage.classList.add('hidden');
        dashboardPage.classList.remove('hidden');
        currentPage = 'dashboard';
    }
}

function initializeStructuresPage() {
    console.log('Initializing structures page...');
    renderFieldsList();
    showEmptyStructuresState();
    showEmptyDetailsState();
}

function renderFieldsList() {
    var fieldsList = document.getElementById('fieldsList');
    fieldsList.innerHTML = '';
    
    structuresData.fields.forEach(function(field) {
        var fieldItem = document.createElement('button');
        fieldItem.className = 'field-item';
        fieldItem.setAttribute('data-field', field.field_name);
        
        fieldItem.innerHTML = 
            '<div class="field-info">' +
                '<svg class="field-icon" viewBox="0 0 24 24" fill="currentColor">' +
                    '<path d="M10 4H4c-1.11 0-2 .89-2 2v6c0 1.11.89 2 2 2h6c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm10 0h-6c-1.11 0-2 .89-2 2v6c0 1.11.89 2 2 2h6c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zM4 18h6c1.11 0 2-.89 2-2v-6c0-1.11-.89-2-2-2H4c-1.11 0-2 .89-2 2v6c0 1.11.89 2 2 2zm16 0h-6c-1.11 0-2-.89-2 2v-6c0-1.11.89-2 2-2h6c1.11 0 2 .89 2 2v6c0 1.11-.89 2-2 2z"/>' +
                '</svg>' +
                '<div class="field-details">' +
                    '<div class="field-name">' + field.field_name + '</div>' +
                    '<div class="field-count">' + field.structures.length + ' structures</div>' +
                '</div>' +
            '</div>';
        
        fieldItem.addEventListener('click', function() {
            handleFieldSelect(field.field_name);
        });
        
        fieldsList.appendChild(fieldItem);
    });
}

function handleFieldSelect(fieldName) {
    console.log('Field selected:', fieldName);
    
    // Update UI state
    structuresState.selectedField = fieldName;
    structuresState.selectedStructure = null;
    structuresState.structureDetails = null;
    
    // Update field selection UI
    var fieldItems = document.querySelectorAll('.field-item');
    fieldItems.forEach(function(item) {
        item.classList.remove('selected');
        if (item.getAttribute('data-field') === fieldName) {
            item.classList.add('selected');
        }
    });
    
    // Find field data
    var fieldData = structuresData.fields.find(function(f) {
        return f.field_name === fieldName;
    });
    
    if (fieldData) {
        structuresState.fieldDetails = {
            field_name: fieldName,
            structures: fieldData.structures,
            total_wells: fieldData.structures.reduce(function(sum, s) { return sum + s.wells_count; }, 0),
            total_records: fieldData.structures.reduce(function(sum, s) { return sum + s.total_records; }, 0)
        };
        
        renderStructuresList(fieldData.structures);
        showEmptyDetailsState();
        showMessage('Loaded ' + fieldData.structures.length + ' structures from ' + fieldName, 'success');
    }
}

function renderStructuresList(structures) {
    var structuresTitle = document.getElementById('structuresTitle');
    var structuresList = document.getElementById('structuresList');
    
    structuresTitle.textContent = 'Structures in "' + structuresState.selectedField + '"';
    
    var tableHTML = 
        '<div class="structures-table">' +
            '<table>' +
                '<thead>' +
                    '<tr>' +
                        '<th>Structure Name</th>' +
                    '</tr>' +
                '</thead>' +
                '<tbody>';
    
    structures.forEach(function(structure) {
        tableHTML += 
            '<tr data-structure="' + structure.structure_name + '">' +
                '<td>' +
                    '<div class="structure-info">' +
                        '<svg class="structure-icon" viewBox="0 0 24 24" fill="currentColor">' +
                            '<path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>' +
                        '</svg>' +
                        '<div class="structure-details">' +
                            '<div class="structure-name">' + structure.structure_name + '</div>' +
                            (structure.error ? '<div class="structure-error">(Error loading)</div>' : '') +
                        '</div>' +
                    '</div>' +
                '</td>' +
            '</tr>';
    });
    
    tableHTML += '</tbody></table></div>';
    structuresList.innerHTML = tableHTML;
    
    // Add click handlers
    var structureRows = structuresList.querySelectorAll('tr[data-structure]');
    structureRows.forEach(function(row) {
        row.addEventListener('click', function() {
            var structureName = row.getAttribute('data-structure');
            handleStructureSelect(structureName);
        });
    });
}

function handleStructureSelect(structureName) {
    console.log('Structure selected:', structureName);
    
    // Update UI state
    structuresState.selectedStructure = structureName;
    
    // Update structure selection UI
    var structureRows = document.querySelectorAll('tr[data-structure]');
    structureRows.forEach(function(row) {
        row.classList.remove('selected');
        if (row.getAttribute('data-structure') === structureName) {
            row.classList.add('selected');
        }
    });
    
    // Find structure data
    var fieldData = structuresData.fields.find(function(f) {
        return f.field_name === structuresState.selectedField;
    });
    
    if (fieldData) {
        var structureData = fieldData.structures.find(function(s) {
            return s.structure_name === structureName;
        });
        
        if (structureData) {
            structuresState.structureDetails = structureData;
            renderStructureDetails(structureData);
            
            // Store selected structure for dashboard
            localStorage.setItem('selectedStructure', JSON.stringify({
                fieldName: structuresState.selectedField,
                structureName: structureName,
                wells: structureData.wells,
                selectedAt: new Date().toISOString()
            }));
            
            showMessage('Structure "' + structureName + '" selected. Click Dashboard to analyze.', 'success');
        }
    }
}

function renderStructureDetails(structure) {
    var detailsTitle = document.getElementById('detailsTitle');
    var structureDetails = document.getElementById('structureDetails');

    detailsTitle.textContent = 'Details for "' + structure.structure_name + '"';

    var detailsHTML =
        '<div class="details-sections">' +
            // Basic Information
            '<div class="detail-section">' +
                '<h3>Basic Information</h3>' +
                '<div class="detail-grid">' +
                    '<div class="detail-item">' +
                        '<span>Field:</span>' +
                        '<span>' + structure.field_name + '</span>' +
                    '</div>' +
                    '<div class="detail-item">' +
                        '<span>Structure:</span>' +
                        '<span>' + structure.structure_name + '</span>' +
                    '</div>' +
                    '<div class="detail-item">' +
                        '<span>Wells Count:</span>' +
                        '<span>' + structure.wells_count + '</span>' +
                    '</div>' +
                    '<div class="detail-item">' +
                        '<span>Total Records:</span>' +
                        '<span>' + structure.total_records.toLocaleString() + '</span>' +
                    '</div>' +
                    '<div class="detail-item full-width">' +
                        '<span>File Path:</span>' +
                        '<span class="file-path">' + structure.file_path + '</span>' +
                    '</div>' +
                '</div>' +
            '</div>';

    // Wells section
    if (structure.wells && structure.wells.length > 0) {
        detailsHTML +=
            '<div class="detail-section">' +
                '<h3>Wells (' + structure.wells_count + ')</h3>' +
                '<div class="wells-grid">';

        structure.wells.forEach(function(well) {
            detailsHTML += '<div class="well-item">' + well + '</div>';
        });

        detailsHTML += '</div></div>';
    }

    // Columns section
    detailsHTML +=
        '<div class="detail-section">' +
            '<h3>Available Columns (' + structure.columns.length + ')</h3>' +
            '<div class="columns-grid">';

    structure.columns.forEach(function(column) {
        var dataType = structure.data_types && structure.data_types[column] ? structure.data_types[column] : 'Unknown';
        detailsHTML +=
            '<div class="column-item">' +
                '<div class="column-name">' + column + '</div>' +
                '<div class="column-type">Type: ' + dataType + '</div>' +
            '</div>';
    });

    detailsHTML += '</div></div>';

    // Statistics section
    if (structure.statistics && Object.keys(structure.statistics).length > 0) {
        detailsHTML +=
            '<div class="detail-section">' +
                '<h3>Column Statistics</h3>' +
                '<div class="statistics-grid">';

        Object.entries(structure.statistics).forEach(function(entry) {
            var column = entry[0];
            var stats = entry[1];

            detailsHTML +=
                '<div class="statistic-item">' +
                    '<h4>' + column + '</h4>' +
                    '<div class="statistic-details">' +
                        '<div class="statistic-row">' +
                            '<span>Count:</span>' +
                            '<span>' + stats.count + '</span>' +
                        '</div>';

            if (stats.mean !== null && stats.mean !== undefined) {
                detailsHTML +=
                    '<div class="statistic-row">' +
                        '<span>Mean:</span>' +
                        '<span>' + stats.mean.toFixed(2) + '</span>' +
                    '</div>';
            }

            if (stats.min !== null && stats.min !== undefined) {
                detailsHTML +=
                    '<div class="statistic-row">' +
                        '<span>Min:</span>' +
                        '<span>' + stats.min + '</span>' +
                    '</div>';
            }

            if (stats.max !== null && stats.max !== undefined) {
                detailsHTML +=
                    '<div class="statistic-row">' +
                        '<span>Max:</span>' +
                        '<span>' + stats.max + '</span>' +
                    '</div>';
            }

            detailsHTML += '</div></div>';
        });

        detailsHTML += '</div></div>';
    }

    // Navigation button
    detailsHTML +=
        '<div class="detail-section">' +
            '<button class="btn-primary" onclick="navigateToDashboard()" style="width: 100%; padding: 1rem; font-size: 1rem;">' +
                'Go to Dashboard for Analysis' +
            '</button>' +
        '</div>';

    detailsHTML += '</div>';

    structureDetails.innerHTML = detailsHTML;
}

/**
 * [MODIFIED] Navigates from the structures page to the main dashboard.
 * This function now passes the selected structure's context to the main app state.
 */
function navigateToDashboard() {
    console.log('🚀 Navigating to dashboard from structures page...');

    if (structuresState.structureDetails) {
        // 1. Load data from the selected structure into the main appState
        appState.availableWells = structuresState.structureDetails.wells || [];
        appState.availableIntervals = structuresState.structureDetails.intervals || [];
        appState.selectedWells = []; // Reset previous selections
        appState.selectedIntervals = [];

        // 2. Store the entire structure object as the current context
        appState.currentStructure = {
            fieldName: structuresState.selectedField,
            structureName: structuresState.selectedStructure,
            ...structuresState.structureDetails // Copy all details like wells, file_path, columns etc.
        };

        console.log('✅ Dashboard context set to:', appState.currentStructure);

        // 3. Switch the page view to the dashboard
        showPage('dashboard');
        handleNavigation('/dashboard');

        // 4. Initialize the dashboard with the new data from the structure
        // Use a short timeout to ensure the DOM is updated before rendering lists/plots
        setTimeout(function() {
            renderWellList(appState.availableWells);
            // Intervals are already loaded, so we can render them directly
            renderIntervalList(appState.availableIntervals);
            updateBadges();
            clearPlot(); // Clear any previous plot

            showSuccess('Dashboard loaded with ' + appState.availableWells.length + ' wells from ' + structuresState.structureDetails.structure_name);
        }, 100);

    } else {
        console.error('❌ No structure details available for navigation.');
        showError('No structure selected. Please select a structure first.');
    }
}

function showEmptyStructuresState() {
    var structuresList = document.getElementById('structuresList');
    structuresList.innerHTML =
        '<div class="empty-state-container">' +
            '<div class="empty-state-content">' +
                '<svg class="empty-state-icon" viewBox="0 0 24 24" fill="currentColor">' +
                    '<path d="M10 4H4c-1.11 0-2 .89-2 2v6c0 1.11.89 2 2 2h6c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm10 0h-6c-1.11 0-2 .89-2 2v6c0 1.11.89 2 2 2h6c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zM4 18h6c1.11 0 2-.89 2-2v-6c0-1.11-.89-2-2-2H4c-1.11 0-2 .89-2 2v6c0 1.11.89 2 2 2zm16 0h-6c-1.11 0-2-.89-2 2v-6c0-1.11.89-2 2-2h6c1.11 0 2 .89 2 2v6c0 1.11-.89 2-2 2z"/>' +
                '</svg>' +
                '<h3>Select a field to view structures</h3>' +
                '<p>Choose a field from the left panel to see its structures</p>' +
            '</div>' +
        '</div>';
}

function showEmptyDetailsState() {
    var structureDetails = document.getElementById('structureDetails');
    structureDetails.innerHTML =
        '<div class="empty-state-container">' +
            '<div class="empty-state-content">' +
                '<svg class="empty-state-icon" viewBox="0 0 24 24" fill="currentColor">' +
                    '<path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>' +
                '</svg>' +
                '<h3>Select a structure to view details</h3>' +
                '<p>Choose a structure from the middle panel to see its information</p>' +
            '</div>' +
        '</div>';
}

// Navigation Functions
function handleNavigation(path) {
    console.log('Navigating to:', path);

    // Update active states
    var navButtons = document.querySelectorAll('.nav-btn, .mobile-nav-btn');
    navButtons.forEach(function(btn) {
        btn.classList.remove('active');
        if (btn.getAttribute('data-path') === path) {
            btn.classList.add('active');
        }
    });

    // Close mobile menu
    closeMobileMenu();

    // Handle different routes
    switch(path) {
        case '/structures':
            showPage('structures');
            showMessage('Structures page loaded', 'success');
            break;
        case '/datapreparation':
            showMessage('Data Preparation page would load here', 'info');
            break;
        case '/dashboard':
            showPage('dashboard');
            // Check if we have structure data to load
            if (appState.currentStructure) {
                showSuccess('Dashboard loaded with data from ' + appState.currentStructure.structureName);
            } else {
                var savedStructure = localStorage.getItem('selectedStructure');
                if (savedStructure) {
                    var structureInfo = JSON.parse(savedStructure);
                    appState.availableWells = structureInfo.wells || [];
                    renderWellList(appState.availableWells);
                    updateBadges();
                    showSuccess('Dashboard loaded with data from ' + structureInfo.structureName);
                } else {
                    showMessage('Dashboard loaded - select a structure first to load well data', 'info');
                }
            }
            break;
        default:
            showMessage('Page not implemented: ' + path, 'warning');
    }
}

function setupNavigation() {
    // Desktop navigation
    var navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var path = button.getAttribute('data-path');
            if (path) {
                handleNavigation(path);
            }
        });
    });

    // Mobile navigation
    var mobileNavButtons = document.querySelectorAll('.mobile-nav-btn');
    mobileNavButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var path = button.getAttribute('data-path');
            if (path) {
                handleNavigation(path);
            }
        });
    });

    // Mobile menu toggle
    var mobileMenuBtn = document.getElementById('mobileMenuBtn');
    var mobileMenuClose = document.getElementById('mobileMenuClose');
    var mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', openMobileMenu);
    }

    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', closeMobileMenu);
    }

    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', function(e) {
            if (e.target === mobileMenuOverlay) {
                closeMobileMenu();
            }
        });
    }
}

function openMobileMenu() {
    var overlay = document.getElementById('mobileMenuOverlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

function closeMobileMenu() {
    var overlay = document.getElementById('mobileMenuOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

// Dropdown Functions
function setupDropdowns() {
    var dropdownButtons = document.querySelectorAll('.dropdown-btn');
    dropdownButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            var moduleName = button.getAttribute('data-module');
            var dropdownContent = document.querySelector('.dropdown-content[data-parent="' + moduleName + '"]');

            if (dropdownContent) {
                var isHidden = dropdownContent.classList.contains('hidden');

                // Close all other dropdowns
                var allDropdowns = document.querySelectorAll('.dropdown-content');
                allDropdowns.forEach(function(dropdown) {
                    dropdown.classList.add('hidden');
                });

                var allDropdownBtns = document.querySelectorAll('.dropdown-btn');
                allDropdownBtns.forEach(function(btn) {
                    btn.classList.remove('expanded');
                });

                // Toggle current dropdown
                if (isHidden) {
                    dropdownContent.classList.remove('hidden');
                    button.classList.add('expanded');
                } else {
                    dropdownContent.classList.add('hidden');
                    button.classList.remove('expanded');
                }
            }
        });
    });

    // Handle sub-module clicks
    var subModuleButtons = document.querySelectorAll('.sub-module-btn');
    subModuleButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var moduleName = button.getAttribute('data-module');
            if (moduleName) {
                // Update active states
                subModuleButtons.forEach(function(btn) {
                    btn.classList.remove('active');
                });
                button.classList.add('active');

                loadModule(moduleName);
            }
        });
    });
}

// Update badge counts
function updateBadges() {
    var wellsBadge = document.getElementById('wellsBadge');
    var intervalsBadge = document.getElementById('intervalsBadge');
    var selectedWellsCount = document.getElementById('selectedWellsCount');
    var selectedIntervalsCount = document.getElementById('selectedIntervalsCount');

    if (wellsBadge) {
        wellsBadge.textContent = appState.selectedWells.length + '/' + appState.availableWells.length;
    }

    if (intervalsBadge) {
        intervalsBadge.textContent = appState.selectedIntervals.length + '/' + appState.availableIntervals.length;
    }

    if (selectedWellsCount) {
        selectedWellsCount.textContent = appState.selectedWells.length;
    }

    if (selectedIntervalsCount) {
        selectedIntervalsCount.textContent = appState.selectedIntervals.length;
    }
}

// Plot type handling
function setupPlotTypeSelect() {
    var plotTypeSelect = document.getElementById('plotTypeSelect');
    if (plotTypeSelect) {
        plotTypeSelect.addEventListener('change', function() {
            appState.plotType = plotTypeSelect.value;
            showMessage('Plot type changed to: ' + plotTypeSelect.value, 'info');
        });
    }
}

// Analysis tools handling
function setupAnalysisTools() {
    var toolButtons = document.querySelectorAll('.tool-btn');
    toolButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var tool = button.getAttribute('data-tool');
            if (tool) {
                showMessage('Opening ' + tool + ' tool...', 'info');
                // Add tool-specific logic here
            }
        });
    });
}

// Improved fetchJson with better error handling and fallback
function fetchJson(endpoint, options) {
    options = options || {};

    var defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    };

    // Merge options
    var finalOptions = {
        method: options.method || 'GET',
        headers: Object.assign({}, defaultOptions.headers, options.headers || {}),
        credentials: defaultOptions.credentials
    };

    if (options.body) {
        finalOptions.body = options.body;
    }

    console.log('Making API call to:', endpoint, 'with options:', finalOptions);

    return fetch(endpoint, finalOptions)
        .then(function(response) {
            console.log('Response status:', response.status, 'OK:', response.ok);

            // If response is not OK (e.g., 404, 500), try to use mock data
            if (!response.ok) {
                console.warn('Server responded with status ' + response.status + ' for ' + endpoint + '. Attempting to use mock data.');
                // For 404 or other server errors, directly return mock data
                return getMockResponse(endpoint, options);
            }

            // If response is OK, parse JSON
            return response.text().then(function(text) {
                console.log('Response text:', text.substring(0, 200) + '...');
                try {
                    return JSON.parse(text);
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    throw new Error('Invalid JSON response from server');
                }
            });
        })
        .catch(function(error) {
            console.error('Fetch error for', endpoint, ':', error);

            // This catch block is primarily for network errors (e.g., server unreachable)
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                console.warn('Backend not available (network error), using mock data for:', endpoint);
                return getMockResponse(endpoint, options);
            }

            throw error; // Re-throw other unexpected errors
        });
}

// Mock response generator - Updated to match actual backend
function getMockResponse(endpoint, options) {
    console.log('Generating mock response for:', endpoint);

    switch (endpoint) {
        case '/first_api_call':
            return {
                status: 'success',
                message: 'Well Log Analysis backend is running',
                timestamp: new Date().toISOString(),
                backend_version: '1.0.0-mock',
                current_dataset: 'fix_pass_qc',
                dataset_loaded: true,
                wells: mockData.wells,
                well_count: mockData.wells.length,
                total_rows: 1000
            };

        case '/get_wells':
            return {
                status: 'success',
                wells: mockData.wells,
                count: mockData.wells.length
            };

        case '/get_markers':
            // Return structure-specific intervals if we have structure context
            if (appState.currentStructure) {
                var structureData = findStructureData(appState.currentStructure.fieldName, appState.currentStructure.structureName);
                if (structureData && structureData.intervals) {
                    return {
                        status: 'success',
                        markers: structureData.intervals,
                        count: structureData.intervals.length
                    };
                }
            }
            return {
                status: 'success',
                markers: mockData.markers,
                count: mockData.markers.length
            };

        case '/get_well_plot':
            var requestData = options.body ? JSON.parse(options.body) : {};
            return {
                status: 'success',
                figure: mockData.plotData,
                well_name: requestData.well_name || 'MOCK-WELL'
            };

        case '/select_dataset':
            return {
                status: 'success',
                dataset_name: 'fix_pass_qc',
                wells: mockData.wells,
                markers: mockData.markers,
                columns: ['WELL_NAME', 'DEPTH', 'GR', 'RT', 'NPHI', 'RHOB', 'MARKER'],
                total_rows: 1000,
                message: 'Mock dataset selected successfully'
            };

        case '/get_calculation_params':
            var requestData = options.body ? JSON.parse(options.body) : {};
            var calculationType = requestData.calculation_type;
            return getMockCalculationParams(calculationType);

        case '/run_calculation_endpoint':
            var requestData = options.body ? JSON.parse(options.body) : {};
            return {
                status: 'success',
                message: requestData.calculation_type + ' calculation completed (mock)',
                calculation_type: requestData.calculation_type,
                rows_processed: 1000
            };

        case '/get_plot_for_calculation':
            var requestData = options.body ? JSON.parse(options.body) : {};
            return {
                status: 'success',
                figure: mockData.plotData,
                calculation_type: requestData.calculation_type
            };

        case '/get_dataset_info':
            return {
                status: 'success',
                info: {
                    dataset_name: 'fix_pass_qc',
                    total_rows: 1000,
                    columns: ['WELL_NAME', 'DEPTH', 'GR', 'RT', 'NPHI', 'RHOB', 'MARKER'],
                    wells: mockData.wells,
                    markers: mockData.markers,
                    depth_range: { min: 3000, max: 4000 }
                }
            };

        case '/get_available_columns':
            return {
                status: 'success',
                columns: ['WELL_NAME', 'DEPTH', 'GR', 'RT', 'NPHI', 'RHOB', 'MARKER', 'VSH_GR', 'PHIE', 'SW']
            };

        case '/validate_calculation':
            var requestData = options.body ? JSON.parse(options.body) : {};
            return {
                status: 'success',
                message: 'All required columns available for ' + requestData.calculation_type,
                required_columns: getRequiredColumns(requestData.calculation_type)
            };

        case '/get_current_status':
            return {
                status: 'success',
                dataset_loaded: true,
                current_dataset: 'fix_pass_qc',
                wells: mockData.wells,
                well_count: mockData.wells.length,
                markers: mockData.markers,
                marker_count: mockData.markers.length,
                total_rows: 1000
            };

        default:
            return {
                status: 'error',
                message: 'Mock endpoint not implemented: ' + endpoint
            };
    }
}

// Helper function for mock calculation parameters
function getMockCalculationParams(calculationType) {
    var parameterDefinitions = {
        "vsh": {
            "title": "VSH Calculation Parameters",
            "parameters": [
                {"name": "GR_MA", "type": "float", "default": 30, "label": "GR Matrix Value", "min": 0, "max": 200},
                {"name": "GR_SH", "type": "float", "default": 120, "label": "GR Shale Value", "min": 0, "max": 300},
                {"name": "input_log", "type": "select", "default": "GR", "label": "Input Log", "options": ["GR", "CGR", "SGR"]},
                {"name": "output_log", "type": "text", "default": "VSH_GR", "label": "Output Log Name"}
            ]
        },
        "porosity": {
            "title": "Porosity Calculation Parameters",
            "parameters": [
                {"name": "PHIE_METHOD", "type": "select", "default": "density", "label": "Porosity Method", "options": ["density", "neutron", "combined"]},
                {"name": "RHO_MA", "type": "float", "default": 2.65, "label": "Matrix Density", "min": 1.0, "max": 4.0},
                {"name": "RHO_FL", "type": "float", "default": 1.0, "label": "Fluid Density", "min": 0.5, "max": 2.0},
                {"name": "NPHI_MA", "type": "float", "default": 0.0, "label": "Matrix Neutron", "min": 0.0, "max": 1.0}
            ]
        },
        "gsa": {
            "title": "GSA Calculation Parameters",
            "parameters": [
                {"name": "window_size", "type": "int", "default": 50, "label": "Window Size", "min": 10, "max": 200},
                {"name": "overlap", "type": "int", "default": 25, "label": "Overlap", "min": 5, "max": 100},
                {"name": "min_samples", "type": "int", "default": 10, "label": "Minimum Samples", "min": 5, "max": 50}
            ]
        },
        "sw": {
            "title": "Water Saturation Calculation Parameters",
            "parameters": [
                {"name": "rw", "type": "float", "default": 0.1, "label": "Water Resistivity", "min": 0.001, "max": 10},
                {"name": "a", "type": "float", "default": 1.0, "label": "Archie's 'a'", "min": 0.1, "max": 10},
                {"name": "m", "type": "float", "default": 2.0, "label": "Archie's 'm'", "min": 1.0, "max": 5.0},
                {"name": "n", "type": "float", "default": 2.0, "label": "Archie's 'n'", "min": 1.0, "max": 5.0}
            ]
        },
        "normalization": {
            "title": "Interval Normalization Parameters",
            "parameters": [
                {"name": "LOG_IN", "type": "select", "default": "GR", "label": "Input Log", "options": ["GR", "CGR", "SGR", "NPHI", "RHOB"]},
                {"name": "LOG_OUT", "type": "text", "default": "GR_NORM", "label": "Output Log Name"},
                {"name": "LOW_REF", "type": "float", "default": 40, "label": "Low Reference", "min": 0, "max": 1000},
                {"name": "HIGH_REF", "type": "float", "default": 140, "label": "High Reference", "min": 0, "max": 1000},
                {"name": "LOW_IN", "type": "int", "default": 3, "label": "Low Percentile", "min": 0, "max": 50},
                {"name": "HIGH_IN", "type": "int", "default": 97, "label": "High Percentile", "min": 50, "max": 100},
                {"name": "CUTOFF_MIN", "type": "float", "default": 0.0, "label": "Cutoff Min", "min": -1000, "max": 1000},
                {"name": "CUTOFF_MAX", "type": "float", "default": 250.0, "label": "Cutoff Max", "min": -1000, "max": 1000}
            ]
        }
    };

    if (calculationType && parameterDefinitions[calculationType]) {
        return {
            status: 'success',
            calculation_type: calculationType,
            parameters: parameterDefinitions[calculationType]
        };
    } else {
        return {
            status: 'error',
            message: 'Unknown calculation type: ' + calculationType
        };
    }
}

// Helper function for required columns
function getRequiredColumns(calculationType) {
    var requirements = {
        "vsh": ["GR"],
        "porosity": ["NPHI", "RHOB"],
        "gsa": ["GR", "RT", "NPHI", "RHOB"],
        "sw": ["RT", "PHIE"],
        "normalization": ["GR", "MARKER"]
    };

    return requirements[calculationType] || [];
}

// Helper function untuk mencari structure data
function findStructureData(fieldName, structureName) {
    var field = structuresData.fields.find(function(f) {
        return f.field_name === fieldName;
    });

    if (field) {
        return field.structures.find(function(s) {
            return s.structure_name === structureName;
        });
    }

    return null;
}

// Add connection test function
function testBackendConnection() {
    console.log('Testing backend connection...');
    updateStatus('Testing connection...');

    // Try a simple fetch to test connectivity
    fetch('/first_api_call', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    })
    .then(function(response) {
        if (response.ok) {
            console.log('✅ Backend connection successful');
            updateStatus('Backend connected');
            showSuccess('Backend connection established');
            return true;
        } else {
            throw new Error('Backend returned status: ' + response.status);
        }
    })
    .catch(function(error) {
        console.log('❌ Backend connection failed:', error.message);
        updateStatus('Using mock data');
        showWarning('Backend not available - using mock data for testing');
        return false;
    });
}

// UI Management Functions
function showLoading() {
    document.getElementById('loadingSpinner').classList.remove('hidden');
    updateStatus('Processing...');
=======
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
>>>>>>> 2b731181d46adad96dd6e19e6fe143592fd3604d
}

function hideLoading() {
    document.getElementById('loadingSpinner').classList.add('hidden');
<<<<<<< HEAD
    updateStatus('Ready');
}

function updateStatus(message) {
    document.getElementById('statusText').textContent = message;
}

function showMessage(message, type) {
    type = type || 'info';
    var mainContent = document.getElementById('mainContent');
    var messageDiv = document.createElement('div');
    messageDiv.className = 'message ' + type + '-message';
    messageDiv.textContent = message;

    // Insert at the top of main content
    mainContent.insertBefore(messageDiv, mainContent.firstChild);

    // Auto-remove after 5 seconds
    setTimeout(function() {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

function showError(message) {
    showMessage(message, 'error');
}

function showSuccess(message) {
    showMessage(message, 'success');
}

function showWarning(message) {
    showMessage(message, 'warning');
}

// Well Management Functions
function loadWells() {
    showLoading();

    fetchJson('/get_wells')
        .then(function(response) {
            if (response.status === 'success') {
                appState.availableWells = response.wells;
                renderWellList(response.wells);
                updateBadges();
                showSuccess('Loaded ' + response.wells.length + ' wells');
            } else {
                throw new Error(response.message || 'Failed to load wells');
            }
        })
        .catch(function(error) {
            console.error('Error loading wells:', error);
            showError('Failed to load wells: ' + error.message);
        })
        .finally(function() {
            hideLoading();
        });
}

function renderWellList(wells) {
    var wellList = document.getElementById('wellList');
    wellList.innerHTML = '';

    if (!wells || wells.length === 0) {
        wellList.innerHTML = '<div class="empty-state">No wells available for this structure.</div>';
        return;
    }

    wells.forEach(function(wellName) {
        var wellItem = document.createElement('div');
        wellItem.className = 'list-item';
        wellItem.setAttribute('data-id', wellName);

        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'well-' + wellName;
        checkbox.checked = appState.selectedWells.indexOf(wellName) !== -1;

        var label = document.createElement('label');
        label.htmlFor = 'well-' + wellName;
        label.textContent = wellName;

        var statusDot = document.createElement('div');
        statusDot.className = 'status-dot';
        statusDot.style.display = checkbox.checked ? 'block' : 'none';

        wellItem.appendChild(checkbox);
        wellItem.appendChild(label);
        wellItem.appendChild(statusDot);

        // Add click event listener
        wellItem.addEventListener('click', function(e) {
            if (e.target.type !== 'checkbox') {
                checkbox.checked = !checkbox.checked;
            }
            toggleWell(wellName);
        });

        checkbox.addEventListener('change', function() {
            toggleWell(wellName);
        });

        wellList.appendChild(wellItem);
    });
}

// FIXED: Define toggleWell function properly
function toggleWell(wellId) {
    console.log('Toggling well:', wellId);

    var index = appState.selectedWells.indexOf(wellId);
    if (index === -1) {
        appState.selectedWells.push(wellId);
        loadWellPlot(wellId);
    } else {
        appState.selectedWells.splice(index, 1);
        if (appState.selectedWells.length === 0) {
            clearPlot();
            clearIntervals();
        } else {
            // Load plot for the last selected well
            var lastWell = appState.selectedWells[appState.selectedWells.length - 1];
            loadWellPlot(lastWell);
        }
    }

    updateWellSelection();
    updateIntervalsForSelectedWells();
    updateBadges();
}

// Enhanced plot loading with structure context
function loadWellPlot(wellName) {
    console.log('🚀 Loading plot for well:', wellName);
    showLoading();

    // Prepare request data with structure context
    var requestData = {
        well_name: wellName
    };

    // Add structure context if available
    if (appState.currentStructure) {
        requestData.structure_context = {
            field_name: appState.currentStructure.fieldName,
            structure_name: appState.currentStructure.structureName,
            file_path: appState.currentStructure.file_path,
            wells: appState.currentStructure.wells,
            columns: appState.currentStructure.columns
        };
        console.log('🚀 Adding structure context:', requestData.structure_context);
    }

    fetchJson('/get_well_plot', {
        method: 'POST',
        body: JSON.stringify(requestData)
    })
    .then(function(response) {
        console.log('🚀 Plot response received:', response);
        if (response.status === 'success' && response.figure) {
            var plotObject = typeof response.figure === 'string' ? JSON.parse(response.figure) : response.figure;

            appState.plotFigure = {
                data: plotObject.data || [],
                layout: plotObject.layout || {}
            };

            createPlot(plotObject);

            var contextMsg = appState.currentStructure ? ' from ' + appState.currentStructure.structureName : '';
            showSuccess('Plot loaded for well: ' + wellName + contextMsg);
        } else {
            throw new Error(response.message || 'Failed to load plot');
        }
    })
    .catch(function(error) {
        console.error('🚀 Error loading well plot:', error);
        showError('Error loading well plot: ' + error.message);
    })
    .finally(function() {
        hideLoading();
    });
}

function updateWellSelection() {
    var wellItems = document.querySelectorAll('#wellList .list-item');
    wellItems.forEach(function(item) {
        var wellId = item.getAttribute('data-id');
        var checkbox = item.querySelector('input[type="checkbox"]');
        var statusDot = item.querySelector('.status-dot');

        if (appState.selectedWells.indexOf(wellId) !== -1) {
            item.classList.add('selected');
            if (checkbox) checkbox.checked = true;
            if (statusDot) statusDot.style.display = 'block';
        } else {
            item.classList.remove('selected');
            if (checkbox) checkbox.checked = false;
            if (statusDot) statusDot.style.display = 'none';
        }
    });

    // Update select all checkbox
    var selectAllCheckbox = document.getElementById('selectAllWells');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = appState.selectedWells.length === appState.availableWells.length && appState.availableWells.length > 0;
    }
}

function toggleAllWells() {
    var checkbox = document.getElementById('selectAllWells');

    if (checkbox.checked) {
        appState.selectedWells = appState.availableWells.slice();
        if (appState.selectedWells.length > 0) {
            loadWellPlot(appState.selectedWells[0]);
        }
    } else {
        appState.selectedWells = [];
        clearPlot();
        clearIntervals();
    }

    updateWellSelection();
    updateIntervalsForSelectedWells();
    updateBadges();
}

// Update intervals berdasarkan structure yang dipilih
function updateIntervalsForSelectedWells() {
    console.log('📋 Updating intervals for selected wells:', appState.selectedWells);
    if (appState.selectedWells.length === 0) {
        console.log('📋 No wells selected, clearing intervals');
        clearIntervals();
        return;
    }

    // Jika ada structure context, gunakan intervals dari structure
    if (appState.currentStructure) {
        var structureData = findStructureData(appState.currentStructure.fieldName, appState.currentStructure.structureName);
        if (structureData && structureData.intervals) {
            console.log('📋 Using intervals from structure:', structureData.intervals);
            appState.availableIntervals = structureData.intervals;
            renderIntervalList(structureData.intervals);
            updateBadges();
            showSuccess('Loaded ' + structureData.intervals.length + ' intervals for ' + structureData.structure_name);
            return;
        }
    }

    // Fallback ke API call jika tidak ada structure context
    var requestData = {
        selected_wells: appState.selectedWells
    };

    if (appState.currentStructure) {
        requestData.structure_context = appState.currentStructure;
    }

    fetchJson('/get_markers', {
        method: 'POST',
        body: JSON.stringify(requestData)
    })
    .then(function(response) {
        if (response.status === 'success') {
            appState.availableIntervals = response.markers;
            renderIntervalList(response.markers);
            updateBadges();
        } else {
            throw new Error(response.message || 'Failed to load intervals');
        }
    })
    .catch(function(error) {
        console.error('Error loading intervals:', error);
        showError('Error loading intervals: ' + error.message);
    });
}

function renderIntervalList(intervals) {
    var intervalList = document.getElementById('intervalList');
    intervalList.innerHTML = '';

    if (!intervals || intervals.length === 0) {
        intervalList.innerHTML = '<div class="empty-state">No intervals for this structure.</div>';
        return;
    }

    intervals.forEach(function(intervalName) {
        var intervalItem = document.createElement('div');
        intervalItem.className = 'list-item';
        intervalItem.setAttribute('data-id', intervalName);

        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'interval-' + intervalName;
        checkbox.checked = appState.selectedIntervals.indexOf(intervalName) !== -1;

        var label = document.createElement('label');
        label.htmlFor = 'interval-' + intervalName;
        label.textContent = intervalName;

        var statusDot = document.createElement('div');
        statusDot.className = 'status-dot';
        statusDot.style.display = checkbox.checked ? 'block' : 'none';

        intervalItem.appendChild(checkbox);
        intervalItem.appendChild(label);
        intervalItem.appendChild(statusDot);

        intervalItem.addEventListener('click', function(e) {
            if (e.target.type !== 'checkbox') {
                checkbox.checked = !checkbox.checked;
            }
            toggleInterval(intervalName);
        });

        checkbox.addEventListener('change', function() {
            toggleInterval(intervalName);
        });

        intervalList.appendChild(intervalItem);
    });
}

function toggleInterval(intervalId) {
    console.log('Toggling interval:', intervalId);

    var index = appState.selectedIntervals.indexOf(intervalId);
    if (index === -1) {
        appState.selectedIntervals.push(intervalId);
    } else {
        appState.selectedIntervals.splice(index, 1);
    }

    updateIntervalSelection();
    updateBadges();
}

function updateIntervalSelection() {
    var intervalItems = document.querySelectorAll('#intervalList .list-item');
    intervalItems.forEach(function(item) {
        var intervalId = item.getAttribute('data-id');
        var checkbox = item.querySelector('input[type="checkbox"]');
        var statusDot = item.querySelector('.status-dot');

        if (appState.selectedIntervals.indexOf(intervalId) !== -1) {
            item.classList.add('selected');
            if (checkbox) checkbox.checked = true;
            if (statusDot) statusDot.style.display = 'block';
        } else {
            item.classList.remove('selected');
            if (checkbox) checkbox.checked = false;
            if (statusDot) statusDot.style.display = 'none';
        }
    });

    var selectAllCheckbox = document.getElementById('selectAllIntervals');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = appState.selectedIntervals.length === appState.availableIntervals.length && appState.availableIntervals.length > 0;
    }
}

function toggleAllIntervals() {
    var checkbox = document.getElementById('selectAllIntervals');

    if (checkbox.checked) {
        appState.selectedIntervals = appState.availableIntervals.slice();
    } else {
        appState.selectedIntervals = [];
    }

    updateIntervalSelection();
    updateBadges();
}

function clearIntervals() {
    var intervalList = document.getElementById('intervalList');
    intervalList.innerHTML = '<div class="empty-state">Select wells to view intervals</div>';
    appState.selectedIntervals = [];
    appState.availableIntervals = [];
    updateBadges();
}

// Plot Management Functions
function createPlot(figureData) {
    var plotArea = document.getElementById('plotArea');

    if (!plotArea) {
        console.error('Plot area not found');
        return;
    }

    plotArea.innerHTML = '';

    try {
        var config = {
            responsive: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ['lasso2d', 'select2d'],
            toImageButtonOptions: {
                format: 'png',
                filename: 'well_log_plot',
                height: 1200,
                width: 1000,
                scale: 1
            }
        };

        Plotly.newPlot(plotArea, figureData.data, figureData.layout, config);
        console.log('Plot created successfully');
    } catch (error) {
        console.error('Error creating plot:', error);
        showError('Error creating plot: ' + error.message);
    }
}

function clearPlot() {
    var plotArea = document.getElementById('plotArea');
    if (plotArea) {
        plotArea.innerHTML = '<div class="empty-plot-state"><h3>Select a well to view log data</h3><p>Choose one or more wells from the left sidebar to begin analysis</p></div>';
    }
}

// Get calculation parameters from backend
function getCalculationParameters(calculationType) {
    return fetchJson('/get_calculation_params', {
        method: 'POST',
        body: JSON.stringify({ calculation_type: calculationType })
    })
    .then(function(response) {
        if (response.status === 'success') {
            return response.parameters;
        } else {
            throw new Error(response.message || 'Failed to get parameters');
        }
    });
}

// Show parameter form for calculations
function showParameterForm(calculationType, parameters) {
    var parameterForm = document.getElementById('parameterForm');
    var parameterRows = document.getElementById('parameterRows');

    // Clear existing parameters
    parameterRows.innerHTML = '';

    // Set form title
    var formTitle = document.querySelector('#parameterForm .form-header h3');
    if (formTitle) {
        formTitle.textContent = parameters.title || (calculationType.toUpperCase() + ' Parameters');
    }

    // Create parameter rows
    parameters.parameters.forEach(function(param, index) {
        var row = document.createElement('tr');

        var cellHtml = '<td>' + (index + 1) + '</td>' +
                      '<td>' + param.label + '</td>' +
                      '<td>';

        if (param.type === 'select') {
            cellHtml += '<select name="' + param.name + '" class="select-input">';
            param.options.forEach(function(option) {
                var selected = option === param.default ? 'selected' : '';
                cellHtml += '<option value="' + option + '" ' + selected + '>' + option + '</option>';
            });
            cellHtml += '</select>';
        } else if (param.type === 'float' || param.type === 'int') {
            var step = param.type === 'float' ? '0.01' : '1';
            var min = param.min !== undefined ? 'min="' + param.min + '"' : '';
            var max = param.max !== undefined ? 'max="' + param.max + '"' : '';
            cellHtml += '<input type="number" name="' + param.name + '" value="' + param.default + '" step="' + step + '" ' + min + ' ' + max + ' class="select-input">';
        } else {
            cellHtml += '<input type="text" name="' + param.name + '" value="' + param.default + '" class="select-input">';
        }

        cellHtml += '</td>' +
                   '<td>' + (param.description || '') + '</td>' +
                   '<td>' + (param.unit || '') + '</td>' +
                   '<td>' + param.name + '</td>' +
                   '<td><input type="checkbox" checked></td>';

        row.innerHTML = cellHtml;
        parameterRows.appendChild(row);
    });

    // Show the form
    parameterForm.classList.remove('hidden');

    // Store current calculation type
    appState.currentCalculationType = calculationType;
}

// Submit calculation parameters
function submitCalculationParameters() {
    var parameterForm = document.getElementById('parameterForm');
    var formData = new FormData(parameterForm.querySelector('form') || parameterForm);

    var params = {};
    var inputs = parameterForm.querySelectorAll('input, select');

    inputs.forEach(function(input) {
        if (input.name && input.type !== 'checkbox') {
            var value = input.value;
            if (input.type === 'number') {
                value = input.step === '1' ? parseInt(value) : parseFloat(value);
            }
            params[input.name] = value;
        }
    });

    // Add intervals for normalization
    if (appState.currentCalculationType === 'normalization') {
        params.intervals = appState.selectedIntervals;
    }

    console.log('🚀 Submitting calculation with params:', params);

    var requestData = {
        calculation_type: appState.currentCalculationType,
        params: params
    };

    // Add structure context if available
    if (appState.currentStructure) {
        requestData.structure_context = appState.currentStructure;
    }

    setIsLoading(true);

    fetchJson('/run_calculation_endpoint', {
        method: 'POST',
        body: JSON.stringify(requestData)
    })
    .then(function(response) {
        if (response.status === 'success') {
            showSuccess(response.message);
            parameterForm.classList.add('hidden');

            // Create plot for the calculation
            return createCalculationPlot(appState.currentCalculationType);
        } else {
            throw new Error(response.message || 'Calculation failed');
        }
    })
    .catch(function(error) {
        showError('Calculation error: ' + error.message);
    })
    .finally(function() {
        setIsLoading(false);
    });
}

// Enhanced error handling functions
function setError(message) {
    appState.error = message;
    if (message) {
        showError(message);
    }
}

function setIsLoading(loading) {
    appState.isLoading = loading;
    if (loading) {
        showLoading();
    } else {
        hideLoading();
    }
}

// Module Management Functions
function loadModule(moduleName) {
    if (appState.selectedWells.length === 0) {
        showError('Please select at least one well');
        return;
    }

    appState.currentModule = moduleName;
    showLoading();
    var wellName = appState.selectedWells[0];

    switch (moduleName) {
        case 'log-plot':
            handleLogPlot(wellName);
            break;
        case 'vsh-calculation':
        case 'vsh-gr':
            handleVshCalculation();
            break;
        case 'vsh-dn':
            handleVshDnCalculation();
            break;
        case 'porosity-calculation':
            handlePorosityCalculation();
            break;
        case 'sw-calculation':
        case 'sw-indonesia':
            handleSwCalculation();
            break;
        case 'sw-simandoux':
            handleSwSimandouxCalculation();
            break;
        case 'rgsa-ngsa-dgsa':
        case 'rgsa':
        case 'dgsa':
        case 'ngsa':
            handleGsaCalculation();
            break;
        case 'normalization':
            handleNormalization();
            break;
        case 'histogram':
            handleHistogram();
            break;
        default:
            showWarning('Module "' + moduleName + '" is not implemented yet');
            hideLoading();
    }
}

function handleLogPlot(wellName) {
    var requestData = {
        calculation_type: 'default',
        well_name: wellName
    };

    // Add structure context if available
    if (appState.currentStructure) {
        requestData.structure_context = appState.currentStructure;
    }

    fetchJson('/get_plot_for_calculation', {
        method: 'POST',
        body: JSON.stringify(requestData)
    })
    .then(function(response) {
        if (response.status === 'success' && response.figure) {
            createPlot(response.figure);
            showSuccess('Log plot created for ' + wellName);
        } else {
            throw new Error(response.message || 'Failed to create log plot');
        }
    })
    .catch(function(error) {
        showError('Error in log plot: ' + error.message);
    })
    .finally(function() {
        hideLoading();
    });
}

// Enhanced module handlers with parameter forms
function handleVshCalculation() {
    getCalculationParameters('vsh')
        .then(function(parameters) {
            showParameterForm('vsh', parameters);
        })
        .catch(function(error) {
            showError('Error getting VSH parameters: ' + error.message);
        });
}

function handlePorosityCalculation() {
    getCalculationParameters('porosity')
        .then(function(parameters) {
            showParameterForm('porosity', parameters);
        })
        .catch(function(error) {
            showError('Error getting porosity parameters: ' + error.message);
        });
}

function handleSwCalculation() {
    getCalculationParameters('sw')
        .then(function(parameters) {
            showParameterForm('sw', parameters);
        })
        .catch(function(error) {
            showError('Error getting SW parameters: ' + error.message);
        });
}

function handleNormalization() {
    if (appState.selectedIntervals.length === 0) {
        showError('Please select at least one interval for normalization');
        return;
    }

    getCalculationParameters('normalization')
        .then(function(parameters) {
            showParameterForm('normalization', parameters);
        })
        .catch(function(error) {
            showError('Error getting normalization parameters: ' + error.message);
        });
}

function handleGsaCalculation() {
    getCalculationParameters('gsa')
        .then(function(parameters) {
            showParameterForm('gsa', parameters);
        })
        .catch(function(error) {
            showError('Error getting GSA parameters: ' + error.message);
        });
}

function handleVshDnCalculation() {
    var defaultParams = {
        RHOB_MA: 2.65,
        RHOB_SH: 2.2,
        input_log: 'RHOB',
        output_log: 'VSH_DN'
    };

    var requestData = {
        calculation_type: 'vsh',
        params: defaultParams
    };

    // Add structure context if available
    if (appState.currentStructure) {
        requestData.structure_context = appState.currentStructure;
    }

    fetchJson('/run_calculation_endpoint', {
        method: 'POST',
        body: JSON.stringify(requestData)
    })
    .then(function(response) {
        if (response.status === 'success') {
            showSuccess('VSH-DN calculation completed');
            return createCalculationPlot('vsh');
        } else {
            throw new Error(response.message || 'VSH-DN calculation failed');
        }
    })
    .catch(function(error) {
        showError('Error in VSH-DN calculation: ' + error.message);
    })
    .finally(function() {
        hideLoading();
    });
}

function handleSwSimandouxCalculation() {
    var defaultParams = {
        rw: 0.1,
        a: 1.0,
        m: 2.0,
        n: 2.0,
        method: 'simandoux'
    };

    var requestData = {
        calculation_type: 'sw',
        params: defaultParams
    };

    // Add structure context if available
    if (appState.currentStructure) {
        requestData.structure_context = appState.currentStructure;
    }

    fetchJson('/run_calculation_endpoint', {
        method: 'POST',
        body: JSON.stringify(requestData)
    })
    .then(function(response) {
        if (response.status === 'success') {
            showSuccess('SW Simandoux calculation completed');
            return createCalculationPlot('sw');
        } else {
            throw new Error(response.message || 'SW Simandoux calculation failed');
        }
    })
    .catch(function(error) {
        showError('Error in SW Simandoux calculation: ' + error.message);
    })
    .finally(function() {
        hideLoading();
    });
}

function handleHistogram() {
    showWarning('Histogram module is under development');
    hideLoading();
}

function createCalculationPlot(calculationType) {
    var wellName = appState.selectedWells.length > 0 ? appState.selectedWells[0] : null;

    var requestData = {
        calculation_type: calculationType,
        well_name: wellName
    };

    // Add structure context if available
    if (appState.currentStructure) {
        requestData.structure_context = appState.currentStructure;
    }

    return fetchJson('/get_plot_for_calculation', {
        method: 'POST',
        body: JSON.stringify(requestData)
    })
    .then(function(response) {
        if (response.status === 'success' && response.figure) {
            createPlot(response.figure);
        } else {
            console.error('Failed to create calculation plot:', response.message);
        }
    })
    .catch(function(error) {
        console.error('Error creating calculation plot:', error);
    });
}

// Get current logs from plot data untuk analysis
function getCurrentLogs() {
    console.log("Getting current logs from plot data:", appState.plotFigure.data);

    // Filter valid log curves (type: scattergl)
    var logTraces = appState.plotFigure.data.filter(function(trace) {
        return trace.type === 'scattergl' &&
               trace.name &&
               !trace.name.toLowerCase().includes('xover') &&
               trace.name !== 'MARKER';
    });

    console.log("Found log curves:", logTraces.map(function(t) { return t.name; }));

    var logs = [];

    for (var i = 0; i < logTraces.length; i++) {
        var trace = logTraces[i];
        if (!trace.name) continue;

        try {
            // Get x and y data arrays
            var xData = [];
            var yData = [];

            // Extract x values
            if (trace.x && trace.x._inputArray instanceof Float64Array) {
                xData = Array.from(trace.x._inputArray);
            } else if (Array.isArray(trace.x)) {
                xData = trace.x;
            } else if (trace.x && Array.isArray(trace.x.data)) {
                xData = trace.x.data;
            }

            // Extract y values
            if (trace.y && trace.y._inputArray instanceof Float64Array) {
                yData = Array.from(trace.y._inputArray);
            } else if (Array.isArray(trace.y)) {
                yData = trace.y;
            } else if (trace.y && Array.isArray(trace.y.data)) {
                yData = trace.y.data;
            }

            if (xData.length === 0 || yData.length === 0) {
                console.log('No valid data arrays for log ' + trace.name);
                continue;
            }

            // Create pairs of depth (y) and value (x)
            var pairs = [];
            for (var j = 0; j < yData.length; j++) {
                var depth = Number(yData[j]);
                var value = xData[j];
                var numValue = value !== undefined && value !== null ? Number(value) : null;

                if (!isNaN(depth) && (numValue === null || !isNaN(numValue))) {
                    pairs.push([depth, numValue]);
                }
            }

            if (pairs.length === 0) {
                console.log('No valid data points found for log ' + trace.name);
                continue;
            }

            console.log('Processed ' + pairs.length + ' points for log ' + trace.name);

            logs.push({
                curveName: trace.name,
                data: pairs,
                wellName: appState.selectedWells[0] || 'Unknown Well',
                plotData: appState.plotFigure.data
            });
        } catch (err) {
            console.error('Error processing log ' + trace.name + ': ' + err);
        }
    }

    console.log("Transformed logs:", logs);
    return logs;
}

// Application Initialization
function initializeApp() {
    console.log('Initializing Well Log Analysis application...');

    if (typeof Plotly === 'undefined') {
        showError('Plotly.js is not loaded');
        return;
    }

    initializeStructuresPage();
    showPage('structures');

    testBackendConnection();

    setTimeout(function() {
        fetchJson('/first_api_call')
            .then(function(response) {
                console.log('Backend connection established:', response);
                setupEventListeners();
                updateStatus('Ready');
            })
            .catch(function(error) {
                console.error('Failed to initialize application:', error);
                showError('Backend connection failed - using mock data for testing');

                setupEventListeners();
                updateStatus('Ready (Mock Mode)');
            });
    }, 1000);
}

function setupEventListeners() {
    setupNavigation();
    setupDropdowns();
    setupPlotTypeSelect();
    setupAnalysisTools();

    var selectAllWells = document.getElementById('selectAllWells');
    if (selectAllWells) {
        selectAllWells.addEventListener('change', toggleAllWells);
    }

    var selectAllIntervals = document.getElementById('selectAllIntervals');
    if (selectAllIntervals) {
        selectAllIntervals.addEventListener('change', toggleAllIntervals);
    }

    var moduleButtons = document.querySelectorAll('.module-btn:not(.dropdown-btn)');
    moduleButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var moduleName = button.getAttribute('data-module');
            if (moduleName) {
                moduleButtons.forEach(function(btn) {
                    btn.classList.remove('active');
                });
                button.classList.add('active');

                loadModule(moduleName);
            }
        });
    });

    var refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            if (appState.currentStructure) {
                renderWellList(appState.availableWells);
                renderIntervalList(appState.availableIntervals);
                updateBadges();
                showSuccess('Data refreshed successfully');
            } else {
                loadWells();
            }
        });
    }

    var submitParams = document.getElementById('submitParams');
    if (submitParams) {
        submitParams.addEventListener('click', submitCalculationParameters);
    }

    var closeFormBtn = document.getElementById('closeFormBtn');
    if (closeFormBtn) {
        closeFormBtn.addEventListener('click', function() {
            document.getElementById('parameterForm').classList.add('hidden');
        });
    }

    var cancelParams = document.getElementById('cancelParams');
    if (cancelParams) {
        cancelParams.addEventListener('click', function() {
            document.getElementById('parameterForm').classList.add('hidden');
        });
    }

    window.addEventListener('error', function(event) {
        console.error('Global error:', event.error);
        showError('An unexpected error occurred: ' + event.error.message);
    });

    window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled promise rejection:', event.reason);
        showError('An unexpected error occurred: ' + event.reason);
    });
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Debug functions
function debugApiCall(endpoint) {
    console.log('=== DEBUG API CALL ===');
    console.log('Endpoint:', endpoint);
    console.log('Current URL:', window.location.href);
    console.log('Base URL:', window.location.origin);

    fetchJson(endpoint)
        .then(function(response) {
            console.log('✅ Success response:', response);
        })
        .catch(function(error) {
            console.log('❌ Error response:', error);
        });
}

function showDebugInfo() {
    console.log('=== DEBUG INFO ===');
    console.log('App State:', appState);
    console.log('Current URL:', window.location.href);
    console.log('Plotly available:', typeof Plotly !== 'undefined');
    console.log('Selected Wells:', appState.selectedWells);
    console.log('Selected Intervals:', appState.selectedIntervals);
    console.log('Current Structure:', appState.currentStructure);

    // Test backend endpoints
    console.log('Testing backend endpoints...');
    debugApiCall('/first_api_call');
}

// Export functions for debugging (global scope)
window.appState = appState;
window.toggleWell = toggleWell;
window.toggleInterval = toggleInterval;
window.loadModule = loadModule;
window.toggleAllWells = toggleAllWells;
window.toggleAllIntervals = toggleAllIntervals;
window.loadWells = loadWells;
window.createPlot = createPlot;
window.clearPlot = clearPlot;
window.navigateToDashboard = navigateToDashboard;
window.debugApiCall = debugApiCall;
window.showDebugInfo = showDebugInfo;
window.testBackendConnection = testBackendConnection;
=======
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
// Load well plot and then update intervals
async function loadWellPlotAndUpdateIntervals(wellName) {
    try {
        console.log('🚀 Loading plot for well:', wellName);
        showLoading();

        const response = await fetchJson('/get_well_plot', {
            method: 'POST',
            body: JSON.stringify({ well_name: wellName })
        });

        console.log('🚀 Plot response received:', response);

        if (response.status === 'success') {
            const plotArea = document.getElementById('plotArea');
            console.log('🚀 Plot area element:', plotArea);

            if (plotArea && response.figure) {
                console.log('🚀 Creating Plotly plot with data:', response.figure);

                // Simple, clean plot creation
                Plotly.newPlot(plotArea, response.figure.data, response.figure.layout, {
                    responsive: true,
                    displayModeBar: true
                });

                console.log('✅ Plot created successfully');
                showSuccess(`Plot loaded for well: ${wellName}`);

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
}

// Legacy function for backward compatibility


// Legacy function for backward compatibility
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
>>>>>>> 2b731181d46adad96dd6e19e6fe143592fd3604d
