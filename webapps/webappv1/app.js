// Global Application State - Enhanced
var appState = {
    selectedWells: [],
    selectedIntervals: [],
    savedSets: [],
    currentModule: null,
    plotData: null,
    parameters: [],
    isLoading: false,
    currentDataset: null,
    availableWells: [],
    availableIntervals: [],
    plotType: 'default',
    currentStructure: null,
    selectedFilePath: null, // Added for file-based plots
    plotFigure: { data: [], layout: {} }, // Added for plot state
    error: null, // Added for error handling
    wellColumns: {} // Added for well columns
};

// Mock data untuk testing ketika backend tidak tersedia
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

// Structures Mock Data - Restored original rich mock for structures UI
var structuresData = {
    fields: [
        {
            field_name: "Adera",
            structures_count: 4,
            structures: [
                { structure_name: "Abab", field_name: "Adera", file_path: "/data/structures/Adera/Abab.xlsx", wells_count: 12, wells: ["ABB-001","ABB-002","ABB-003","ABB-004","ABB-005","ABB-006","ABB-007","ABB-008","ABB-009","ABB-010","ABB-011","ABB-012"], total_records: 1200, columns: ["DEPTH","GR","NPHI","RHOB","RT"], intervals: ["ABAB-TOP","ABAB-MID","ABAB-BOTTOM","ABAB-RESERVOIR"] },
                { structure_name: "Benuang", field_name: "Adera", file_path: "/data/structures/Adera/Benuang.xlsx", wells_count: 8, wells: ["BNG-001","BNG-002","BNG-003","BNG-004","BNG-005","BNG-006","BNG-007","BNG-008"], total_records: 850, columns: ["DEPTH","GR","NPHI","RHOB"], intervals: ["BNG-UPPER","BNG-LOWER","BNG-MAIN"] },
                { structure_name: "Dewa", field_name: "Adera", file_path: "/data/structures/Adera/Dewa.xlsx", wells_count: 15, wells: ["DEW-001","DEW-002","DEW-003","DEW-004","DEW-005","DEW-006","DEW-007","DEW-008","DEW-009","DEW-010","DEW-011","DEW-012","DEW-013","DEW-014","DEW-015"], total_records: 1600, columns: ["DEPTH","GR","NPHI","RHOB","RT","SP"], intervals: ["DEWA-A","DEWA-B","DEWA-C","DEWA-RESERVOIR","DEWA-SEAL"] },
                { structure_name: "Raja", field_name: "Adera", file_path: "/data/structures/Adera/Raja.xlsx", wells_count: 10, wells: ["RJA-001","RJA-002","RJA-003","RJA-004","RJA-005","RJA-006","RJA-007","RJA-008","RJA-009","RJA-010"], total_records: 980, columns: ["DEPTH","GR","NPHI","RHOB","RT"], intervals: ["RAJA-TOP","RAJA-MIDDLE","RAJA-BOTTOM"] }
            ]
        },
        {
            field_name: "Limau",
            structures_count: 5,
            structures: [
                { structure_name: "Belimbing", field_name: "Limau", file_path: "/data/structures/Limau/Belimbing.xlsx", wells_count: 18, wells: ["LIM-BLB-001","LIM-BLB-002","LIM-BLB-003","LIM-BLB-004","LIM-BLB-005","LIM-BLB-006","LIM-BLB-007","LIM-BLB-008","LIM-BLB-009","LIM-BLB-010","LIM-BLB-011","LIM-BLB-012","LIM-BLB-013","LIM-BLB-014","LIM-BLB-015","LIM-BLB-016","LIM-BLB-017","LIM-BLB-018"], total_records: 2100, columns: ["DEPTH","GR","NPHI","RHOB","RT","SP"], intervals: ["BLB-ZONE-1","BLB-ZONE-2","BLB-ZONE-3","BLB-MAIN"] },
                { structure_name: "Karangan", field_name: "Limau", file_path: "/data/structures/Limau/Karangan.xlsx", wells_count: 7, wells: ["LIM-KRG-001","LIM-KRG-002","LIM-KRG-003","LIM-KRG-004","LIM-KRG-005","LIM-KRG-006","LIM-KRG-007"], total_records: 750, columns: ["DEPTH","GR","NPHI","RHOB"], intervals: ["KRG-UPPER","KRG-LOWER"] },
                { structure_name: "Limau Barat", field_name: "Limau", file_path: "/data/structures/Limau/Limau Barat.xlsx", wells_count: 22, wells: ["LIM-LB-001","LIM-LB-002","LIM-LB-003","LIM-LB-004","LIM-LB-005","LIM-LB-006","LIM-LB-007","LIM-LB-008","LIM-LB-009","LIM-LB-010","LIM-LB-011","LIM-LB-012","LIM-LB-013","LIM-LB-014","LIM-LB-015","LIM-LB-016","LIM-LB-017","LIM-LB-018","LIM-LB-019","LIM-LB-020","LIM-LB-021","LIM-LB-022"], total_records: 2800, columns: ["DEPTH","GR","NPHI","RHOB","RT","SP","CALI"], intervals: ["LB-A","LB-B","LB-C","LB-D","LB-MAIN"] },
                { structure_name: "Limau Tengah", field_name: "Limau", file_path: "/data/structures/Limau/Limau Tengah.xlsx", wells_count: 16, wells: ["LIM-LT-001","LIM-LT-002","LIM-LT-003","LIM-LT-004","LIM-LT-005","LIM-LT-006","LIM-LT-007","LIM-LT-008","LIM-LT-009","LIM-LT-010","LIM-LT-011","LIM-LT-012","LIM-LT-013","LIM-LT-014","LIM-LT-015","LIM-LT-016"], total_records: 1950, columns: ["DEPTH","GR","NPHI","RHOB","RT"], intervals: ["LT-ZONE-1","LT-ZONE-2","LT-ZONE-3"] },
                { structure_name: "Tanjung Miring Barat", field_name: "Limau", file_path: "/data/structures/Limau/Tanjung Miring Barat.xlsx", wells_count: 14, wells: ["LIM-TMB-001","LIM-TMB-002","LIM-TMB-003","LIM-TMB-004","LIM-TMB-005","LIM-TMB-006","LIM-TMB-007","LIM-TMB-008","LIM-TMB-009","LIM-TMB-010","LIM-TMB-011","LIM-TMB-012","LIM-TMB-013","LIM-TMB-014"], total_records: 1650, columns: ["DEPTH","GR","NPHI","RHOB","RT","SP"], intervals: ["TMB-TOP","TMB-MIDDLE","TMB-BOTTOM"] }
            ]
        }
    ],
    total_fields: 2,
    total_structures: 7
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
// Normalize file paths from index.json to actual served URLs under this webapp
function resolveFilePath(p) {
    if (!p) return '';
    var url = String(p).trim();
    // Pass through absolute URLs
    if (/^https?:\/\//i.test(url)) return url;
    // Normalize slashes
    url = url.replace(/\\/g, '/');
    // Remove leading slash to make it relative to webapp root
    if (url.startsWith('/')) url = url.slice(1);
    // Handle legacy 'data/structures/**' by stripping 'data/'
    if (url.toLowerCase().startsWith('data/structures/')) {
        url = url.substring('data/'.length);
    }
    // Ensure it is under 'structures/'
    if (!url.toLowerCase().startsWith('structures/')) {
        url = 'structures/' + url;
    }
    // Encode each segment to handle spaces and special chars
    url = url.split('/').map(function(seg){ return encodeURIComponent(seg); }).join('/');
    return url;
}

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
    // Prefer backend in Dataiku, then fallback to local index.json, else mock
    loadStructuresFromBackend()
        .then(function(loaded) {
            if (loaded) return true;
            return loadStructuresFromFolder();
        })
        .then(function(loaded) {
            if (!loaded) {
                console.warn('Using embedded structuresData mock');
            }
            renderFieldsList();
            showEmptyStructuresState();
            showEmptyDetailsState();
        })
        .catch(function(err){
            console.warn('Failed to initialize structures from backend/folder:', err && err.message ? err.message : err);
            renderFieldsList();
            showEmptyStructuresState();
            showEmptyDetailsState();
        });
}

// Load structures definition from /data/structures/index.json (served statically)
function loadStructuresFromFolder() {
    var url = 'data/structures/index.json';
    return fetch(url, { cache: 'no-cache' })
        .then(function(res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        })
        .then(function(json) {
            var normalized = normalizeStructuresPayload(json);
            if (normalized) {
                structuresData = normalized;
                console.log('Loaded structures from folder:', json);
                return true;
            }
            return false;
        })
        .catch(function(err) {
            console.warn('Could not load structures from folder:', err.message || err);
            return false;
        });
}

// Try to load structures using Dataiku backend endpoint
function loadStructuresFromBackend() {
    try {
        // Use existing fetchJson helper to honor Dataiku backend base URL
        return fetchJson('/structures/tree', { method: 'GET' })
            .then(function(resp){
                if (!resp) return false;
                var normalized = normalizeStructuresPayload(resp);
                if (normalized) {
                    structuresData = normalized;
                    console.log('Loaded structures from backend tree');
                    return true;
                }
                return false;
            })
            .catch(function(err){
                console.warn('Could not load structures from backend:', err && err.message ? err.message : err);
                return false;
            });
    } catch(e) {
        console.warn('Backend structures load threw:', e && e.message ? e.message : e);
        return Promise.resolve(false);
    }
}

// Normalize various payload shapes into { fields: [...], total_fields, total_structures }
function normalizeStructuresPayload(payload) {
    if (!payload) return null;
    // If already in expected shape
    if (Array.isArray(payload.fields)) {
        return {
            fields: payload.fields,
            total_fields: typeof payload.total_fields === 'number' ? payload.total_fields : payload.fields.length,
            total_structures: typeof payload.total_structures === 'number' ? payload.total_structures : payload.fields.reduce(function(sum, f){ return sum + (Array.isArray(f.structures) ? f.structures.length : 0); }, 0)
        };
    }
    // If payload has a 'tree' or similar structure
    if (Array.isArray(payload.tree)) {
        var fields = payload.tree.map(function(node){
            return {
                field_name: node.field_name || node.name || node.field || 'Unknown Field',
                structures: (node.structures || node.children || []).map(function(s){
                    return {
                        structure_name: s.structure_name || s.name || 'Unknown',
                        field_name: node.field_name || node.name || node.field || 'Unknown Field',
                        file_path: s.file_path || s.path || s.url || '',
                        wells_count: s.wells_count || (Array.isArray(s.wells) ? s.wells.length : 0),
                        wells: s.wells || [],
                        total_records: s.total_records || 0,
                        columns: s.columns || [],
                        intervals: s.intervals || []
                    };
                })
            };
        });
        return {
            fields: fields,
            total_fields: fields.length,
            total_structures: fields.reduce(function(sum, f){ return sum + (Array.isArray(f.structures) ? f.structures.length : 0); }, 0)
        };
    }
    // If payload is a flat list of structures grouped by field_name
    if (Array.isArray(payload.structures)) {
        var grouped = {};
        payload.structures.forEach(function(s){
            var field = s.field_name || s.field || 'Unknown Field';
            if (!grouped[field]) grouped[field] = [];
            grouped[field].push({
                structure_name: s.structure_name || s.name || 'Unknown',
                field_name: field,
                file_path: s.file_path || s.path || s.url || '',
                wells_count: s.wells_count || (Array.isArray(s.wells) ? s.wells.length : 0),
                wells: s.wells || [],
                total_records: s.total_records || 0,
                columns: s.columns || [],
                intervals: s.intervals || []
            });
        });
        var fields = Object.keys(grouped).map(function(fname){
            return { field_name: fname, structures: grouped[fname] };
        });
        return {
            fields: fields,
            total_fields: fields.length,
            total_structures: fields.reduce(function(sum, f){ return sum + (Array.isArray(f.structures) ? f.structures.length : 0); }, 0)
        };
    }
    return null;
}
// Original fields/structures rendering
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
                    '<path d="M10 4H4c-1.11 0-2 .89-2 2v6c0 1.11.89 2 2 2h6c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm10 0h-6c-1.11 0-2 .89-2 2v6c0 1.11.89 2 2 2h6c1.11 0 2 .89 2 2v6c0 1.11-.89 2-2 2z"/>' +
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

// Handle selecting a structure in the table
function handleStructureSelect(structureName) {
    console.log('Structure selected:', structureName);
    structuresState.selectedStructure = structureName;

    // Highlight selected row
    var rows = document.querySelectorAll('#structuresList tr[data-structure]');
    rows.forEach(function(row) {
        if (row.getAttribute('data-structure') === structureName) {
            row.classList.add('selected');
        } else {
            row.classList.remove('selected');
        }
    });

    // Find selected structure details
    var fieldData = structuresData.fields.find(function(f) { return f.field_name === structuresState.selectedField; });
    if (!fieldData) {
        showError('Field data not found');
        return;
    }
    var structure = fieldData.structures.find(function(s) { return s.structure_name === structureName; });
    if (!structure) {
        showError('Structure details not found');
        return;
    }

    structuresState.structureDetails = structure;
    renderStructureDetails(structure);

    // Persist selection for dashboard navigation
    var selectedInfo = {
        fieldName: structuresState.selectedField,
        structureName: structure.structure_name,
        filePath: structure.file_path,
    wells: structure.wells || [],
    columns: structure.columns || [],
    intervals: structure.intervals || []
    };
    localStorage.setItem('selectedStructure', JSON.stringify(selectedInfo));
    console.log('Saved selectedStructure to localStorage:', selectedInfo);
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

function renderStructureDetails(structure) {
    var detailsTitle = document.getElementById('detailsTitle');
    var structureDetails = document.getElementById('structureDetails');
    var filePathResolved = resolveFilePath(structure.file_path);
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
                        '<span>' + ((structure.wells && structure.wells.length) ? structure.wells.length : (structure.wells_count || 0)) + '</span>' +
                    '</div>' +
                    '<div class="detail-item">' +
                        '<span>Total Records:</span>' +
                        '<span>' + ((structure.total_records || 0).toLocaleString ? (structure.total_records || 0).toLocaleString() : (structure.total_records || 0)) + '</span>' +
                    '</div>' +
                    '<div class="detail-item full-width">' +
                        '<span>File Path:</span>' +
                        '<span class="file-path">' + filePathResolved + '</span>' +
                        '<a class="btn-link" style="margin-left:8px" href="' + filePathResolved + '" target="_blank" rel="noopener">Open file</a>' +
                    '</div>' +
                '</div>' +
            '</div>';
    
    // Wells section
    if (structure.wells && structure.wells.length > 0) {
        detailsHTML += 
            '<div class="detail-section">' +
                '<h3>Wells (' + (structure.wells ? structure.wells.length : (structure.wells_count || 0)) + ')</h3>' +
                '<div class="wells-grid">';
        
        structure.wells.forEach(function(well) {
            detailsHTML += '<div class="well-item">' + well + '</div>';
        });
        
        detailsHTML += '</div></div>';
    }
    
    // Columns section
    detailsHTML += 
        '<div class="detail-section">' +
            '<h3>Available Columns (' + (structure.columns ? structure.columns.length : 0) + ')</h3>' +
            '<div class="columns-grid">';
    
    (structure.columns || []).forEach(function(column) {
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

    // If columns/wells not populated yet, try to enrich by reading the Excel file
    if ((!(structure.columns && structure.columns.length) || !(structure.wells && structure.wells.length) || (structure.wells_count|0) === 0) && filePathResolved && typeof XLSX !== 'undefined') {
        // Show nicer inline loader inside details panel
        var loadingDiv = document.createElement('div');
        loadingDiv.className = 'detail-section details-loader';
        loadingDiv.innerHTML = '' +
            '<div class="loader-content">' +
                '<div class="spinner" aria-hidden="true"></div>' +
                '<div class="loader-text">Loading structure details...</div>' +
                '<div class="skeleton-list" aria-hidden="true">' +
                    '<div class="skeleton-row" style="width: 80%"></div>' +
                    '<div class="skeleton-row" style="width: 60%"></div>' +
                    '<div class="skeleton-row" style="width: 70%"></div>' +
                '</div>' +
            '</div>';
        structureDetails.appendChild(loadingDiv);

        enrichStructureFromExcel(filePathResolved)
            .then(function(meta){
                // Merge metadata into structure
                if (meta.columns) structure.columns = meta.columns;
                if (meta.wells) {
                    structure.wells = meta.wells;
                    structure.wells_count = meta.wells.length;
                }
                if (typeof meta.total_records === 'number') structure.total_records = meta.total_records;
                if (meta.data_types) structure.data_types = meta.data_types;
                if (meta.intervals) structure.intervals = meta.intervals;
                if (meta.statistics) structure.statistics = meta.statistics;

                // Persist updated intervals/wells into localStorage if this structure is selected
                try {
                    var savedSel2 = localStorage.getItem('selectedStructure');
                    if (savedSel2) {
                        var parsedSel2 = JSON.parse(savedSel2);
                        if (parsedSel2 && parsedSel2.structureName === structure.structure_name && parsedSel2.fieldName === structure.field_name) {
                            if (structure.wells) parsedSel2.wells = structure.wells.slice();
                            if (structure.intervals) parsedSel2.intervals = structure.intervals.slice();
                            parsedSel2.wells_count = (structure.wells ? structure.wells.length : (structure.wells_count||0));
                            localStorage.setItem('selectedStructure', JSON.stringify(parsedSel2));
                        }
                    }
                } catch(e) {}

                // Re-render with enriched info
                renderStructureDetails(structure);
            })
            .catch(function(err){
                console.warn('Failed to parse Excel for metadata:', err);
            });
    }
}

// Read minimal metadata from Excel: columns, wells, intervals, row count, basic stats
function enrichStructureFromExcel(filePath) {
    return fetch(filePath).then(function(res){
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.arrayBuffer();
    }).then(function(buf){
        var wb = XLSX.read(buf, { type: 'array' });
        if (!wb.SheetNames || wb.SheetNames.length === 0) throw new Error('No sheets found');

        // Pick the best sheet: prefer one with many rows and plausible headers
        function scoreSheet(name) {
            var ws = wb.Sheets[name];
            var aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
            if (!aoa || aoa.length === 0) return { score: 0, aoa: aoa };
            // compute non-empty counts for first few rows
            var headerIdx = -1, bestNonEmpty = -1;
            for (var r=0; r<Math.min(10, aoa.length); r++) {
                var row = aoa[r] || [];
                var nonEmpty = row.reduce(function(acc, cell){ return acc + ((cell!==null && cell!==undefined && (''+cell).trim()!=='') ? 1 : 0); }, 0);
                if (nonEmpty > bestNonEmpty) { bestNonEmpty = nonEmpty; headerIdx = r; }
            }
            var header = (headerIdx >= 0 ? aoa[headerIdx] : []);
            var canon = function(s){ return (s||'').toString().toLowerCase().replace(/[^a-z0-9]/g,''); };
            var ch = (header||[]).map(canon);
            var hasWell = ['well','wellname','wellid','wellno','sumur','namasumur','wellborename'].some(function(k){ return ch.indexOf(k) >= 0; });
            var hasDepth = ['depth','md','tvd'].some(function(k){ return ch.indexOf(k) >= 0; });
            var rowsCount = Math.max(0, (aoa.length - (headerIdx>=0?headerIdx+1:1)));
            var score = bestNonEmpty + (hasWell?10:0) + (hasDepth?4:0) + Math.min(20, Math.floor(rowsCount/100));
            return { score: score, aoa: aoa, headerIdx: headerIdx };
        }

        var best = { name: wb.SheetNames[0], score: -1, aoa: null, headerIdx: 0 };
        for (var si=0; si<wb.SheetNames.length; si++) {
            var nm = wb.SheetNames[si];
            var s = scoreSheet(nm);
            if (s.score > best.score) { best = { name: nm, score: s.score, aoa: s.aoa, headerIdx: s.headerIdx } }
        }

        var ws = wb.Sheets[best.name];
        // Get AoA from best sheet
        var aoa = best.aoa || XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
        if (!aoa || aoa.length === 0) return {};
        // Find the first non-empty row to use as header
        var headerRowIdx = (typeof best.headerIdx === 'number' && best.headerIdx >=0) ? best.headerIdx : 0;
        if (headerRowIdx === 0) {
            for (var r2 = 0; r2 < aoa.length; r2++) {
                var nonEmpty2 = 0;
                var rowArr2 = aoa[r2] || [];
                for (var c2 = 0; c2 < rowArr2.length; c2++) {
                    var cell2 = rowArr2[c2];
                    if (cell2 !== null && cell2 !== undefined && (''+cell2).trim() !== '') nonEmpty2++;
                }
                if (nonEmpty2 >= 2) { headerRowIdx = r2; break; }
            }
        }
        var header = (aoa[headerRowIdx] || []).map(function(h){ return (h === null || h === undefined) ? '' : (''+h).trim(); });
        var rows = aoa.slice(headerRowIdx + 1);
        var totalRecords = rows.length;

        // Determine column data types by sampling
        var dataTypes = {};
        var sampleCount = Math.min(rows.length, 200);
        var numericCols = new Set();
        header.forEach(function(col, idx){
            if (!col) return;
            var isNumeric = false;
            for (var i=0;i<sampleCount;i++) {
                var v = rows[i] ? rows[i][idx] : null;
                if (v !== null && v !== '' && v !== undefined) {
                    var n = Number(v);
                    if (!isNaN(n)) { isNumeric = true; break; }
                }
            }
            dataTypes[col] = isNumeric ? 'number' : 'string';
            if (isNumeric) numericCols.add(col);
        });

        // Collect wells and intervals by robust column-name matching
        function canon(s){ return (s||'').toString().toLowerCase().replace(/[^a-z0-9]/g,''); }
        var canonHeader = header.map(canon);
        function findCol(candidates){
            var canonCandidates = candidates.map(canon);
            for (var i=0; i<canonCandidates.length; i++) {
                var cc = canonCandidates[i];
                var idx = canonHeader.indexOf(cc);
                if (idx >= 0) return idx;
            }
            return -1;
        }
        var wellIdx = findCol(['WELL_NAME','WELL NAME','WELL','WELLNAME','WELL_ID','WELL ID','WELLNO','WELL NO','WELL_CODE','WELL CODE','WELL_BORE_NAME','WELLBORENAME','SUMUR','NAMA SUMUR','NAMA_SUMUR']);
        var intervalIdx = findCol(['MARKER','INTERVAL','ZONE','ZONE_NAME','LAYER','FORMATION','FORMASI','ZONA']);

        // If well column not found by header, try pattern-based detection
        if (wellIdx < 0) {
            var bestIdx = -1, bestScore = 0;
            var wellPattern = /^(?:[A-Za-z]{2,6})[-_ ]?\d{1,4}$/; // e.g., ABB-035, LIM 12
            for (var ci=0; ci<header.length; ci++) {
                var hits = 0, total = 0;
                for (var rr=0; rr<Math.min(rows.length, 2000); rr++) {
                    var v = rows[rr] ? rows[rr][ci] : null;
                    if (v === null || v === undefined || (''+v).trim() === '') continue;
                    total++;
                    if (wellPattern.test((''+v).trim())) hits++;
                }
                if (total > 0) {
                    var ratio = hits/total;
                    var score = hits + ratio*10;
                    if (score > bestScore && hits >= 3 && ratio >= 0.4) { bestScore = score; bestIdx = ci; }
                }
            }
            if (bestIdx >= 0) wellIdx = bestIdx;
        }

        var wellsOrdered = [];
        var wellsSeen = new Set();
        var intervalsSet = new Set();
        for (var r=0;r<rows.length;r++) {
            var row = rows[r] || [];
            if (wellIdx >= 0) {
                var w = row[wellIdx];
                if (w !== null && w !== undefined) {
                    var ws = (''+w).trim();
                    if (ws !== '' && !wellsSeen.has(ws)) { wellsSeen.add(ws); wellsOrdered.push(ws); }
                }
            }
            if (intervalIdx >= 0) {
                var it = row[intervalIdx];
                if (it !== null && it !== undefined && (''+it).trim() !== '') intervalsSet.add((''+it).trim());
            }
        }

        // Basic statistics for a few common logs if present
        function statsFor(colName){
            var idx = header.indexOf(colName);
            if (idx < 0) return null;
            var count=0, min=Infinity, max=-Infinity, sum=0;
            for (var r=0;r<rows.length;r++) {
                var v = rows[r] ? rows[r][idx] : null;
                var n = Number(v);
                if (!isNaN(n)) {
                    count++; sum += n; if (n<min) min=n; if (n>max) max=n;
                }
            }
            if (count===0) return { count: 0, min: null, max: null, mean: null };
            return { count: count, min: min, max: max, mean: sum/count };
        }
        var commonLogs = ['GR','RT','NPHI','RHOB'];
        var statistics = {};
        commonLogs.forEach(function(log){
            var st = statsFor(log);
            if (st) statistics[log] = st;
        });

        return {
            columns: header.filter(function(h){ return h && h.length>0; }),
            data_types: dataTypes,
            wells: wellsOrdered,
            intervals: Array.from(intervalsSet),
            total_records: totalRecords,
            statistics: statistics
        };
    });
}

// Lightweight details panel for CSV-driven structures
// keep original detailed renderer

function navigateToDashboard() {
    console.log('🚀 Navigating to dashboard from structures...');
    
    var savedStructure = localStorage.getItem('selectedStructure');
    if (savedStructure) {
        var info = JSON.parse(savedStructure);
        // Load wells into dashboard state
        appState.availableWells = info.wells || [];
        appState.selectedWells = [];
        appState.availableIntervals = [];
        appState.selectedIntervals = [];

        // Minimal structure context
        appState.currentStructure = {
            fieldName: info.fieldName,
            structureName: info.structureName,
            filePath: info.filePath,
            wells: info.wells || [],
            columns: info.columns || [],
            intervals: info.intervals || []
        };

        // Switch to dashboard
        showPage('dashboard');
        handleNavigation('/dashboard');

        // Ensure wells/intervals are populated for folder-based structures before rendering lists
        ensureStructureDataLoaded().then(function(){
            renderWellList(appState.availableWells);
            updateBadges();
            // Optionally auto-select first well to load intervals immediately
            if (appState.availableWells.length > 0 && appState.selectedWells.length === 0) {
                appState.selectedWells = [appState.availableWells[0]];
                updateWellSelection();
                // Load a default plot and intervals
                loadWellPlot(appState.selectedWells[0]);
            }
            updateIntervalsForSelectedWells();
            clearPlot();
            showSuccess('Dashboard loaded with ' + appState.availableWells.length + ' wells from ' + info.structureName);
        }).catch(function(){
            renderWellList(appState.availableWells);
            updateBadges();
        });
        
    } else {
        console.error('🚀 No structure details available for navigation');
        showError('No structure selected. Please select a structure first.');
    }
}

// Ensure currentStructure has wells (for folder-based structures) and updates availableWells
function ensureStructureDataLoaded() {
    return new Promise(function(resolve) {
        var cs = appState.currentStructure || {};
        var isFolder = /\/$/.test(cs.filePath || '');
        // If folder-based and no wells yet, fetch from backend
        if (isFolder && (!cs.wells || cs.wells.length === 0)) {
            fetchJson('/structures/list_wells', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ folder_path: cs.filePath })
            }).then(function(resp){
                if (resp && resp.status === 'success') {
                    cs.wells = resp.wells || [];
                    appState.currentStructure = cs;
                    appState.availableWells = cs.wells.slice();
                    // Update persisted selection
                    try {
                        var saved = localStorage.getItem('selectedStructure');
                        if (saved) {
                            var parsed = JSON.parse(saved);
                            if (parsed && parsed.structureName === cs.structureName && parsed.fieldName === cs.fieldName) {
                                parsed.wells = cs.wells.slice();
                                parsed.wells_count = cs.wells.length;
                                localStorage.setItem('selectedStructure', JSON.stringify(parsed));
                            }
                        }
                    } catch(e) {}
                }
            }).finally(function(){ resolve(); });
        } else {
            // Not a folder or wells already present
            if (cs.wells && cs.wells.length > 0) {
                appState.availableWells = cs.wells.slice();
            }
            resolve();
        }
    });
}

// Empty states for structures UI
function showEmptyStructuresState() {
    var structuresList = document.getElementById('structuresList');
    if (structuresList) {
        structuresList.innerHTML = '<div class="empty-state">Select a field to view structures</div>';
    }
}
function showEmptyDetailsState() {
    var details = document.getElementById('structureDetails');
    if (details) {
        details.innerHTML = '<div class="empty-state">Select a structure to view details</div>';
    }
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
            if (!appState.currentStructure) {
                var savedStructure = localStorage.getItem('selectedStructure');
                if (savedStructure) {
                    var structureInfo = JSON.parse(savedStructure);
                    appState.currentStructure = {
                        fieldName: structureInfo.fieldName,
                        structureName: structureInfo.structureName,
                        filePath: structureInfo.filePath,
                        wells: structureInfo.wells || [],
                        columns: structureInfo.columns || [],
                        intervals: structureInfo.intervals || []
                    };
                }
            }
            if (!appState.currentStructure) {
                showMessage('Dashboard loaded - select a structure first to load well data', 'info');
            } else {
                ensureStructureDataLoaded().then(function(){
                    if (!appState.availableWells || appState.availableWells.length === 0) {
                        showMessage('No wells found for the selected structure', 'warning');
                    }
                    renderWellList(appState.availableWells);
                    updateBadges();
                });
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

// Improved fetchJson with Dataiku backend URL support, better error handling, and fallback
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

    // Use Dataiku helper when available to build the correct backend URL
    var useDataiku = (typeof window !== 'undefined') && window.dataiku && typeof window.dataiku.getWebAppBackendUrl === 'function';
    var url = useDataiku ? window.dataiku.getWebAppBackendUrl(endpoint) : endpoint;

    console.log('Making API call to:', url, '(raw endpoint:', endpoint + ') with options:', finalOptions);
    
    return fetch(url, finalOptions)
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

// Add connection test function
function testBackendConnection() {
    console.log('Testing backend connection...');
    updateStatus('Testing connection...');

    // Try a simple fetch to test connectivity using the same helper
    return fetchJson('/first_api_call')
        .then(function(response) {
            if (response && response.status === 'success') {
                console.log('✅ Backend connection successful');
                updateStatus('Backend connected');
                showSuccess('Backend connection established');
                return true;
            }
            throw new Error('Unexpected response');
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
}

function hideLoading() {
    document.getElementById('loadingSpinner').classList.add('hidden');
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
    
    if (wells.length === 0) {
        wellList.innerHTML = '<div class="empty-state">No wells available</div>';
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
            var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
            // If the click originated from the checkbox or its label, let the checkbox change handler manage it
            if (e.target === checkbox || tag === 'label') {
                return;
            }
            // Toggle manually when clicking the row
            checkbox.checked = !checkbox.checked;
            toggleWell(wellName);
        });
        
        checkbox.addEventListener('change', function(e) {
            // Prevent bubbling to parent click handler to avoid double toggling
            e.stopPropagation();
            toggleWell(wellName);
        });
        
        wellList.appendChild(wellItem);
    });
}

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

// Enhanced plot loading dengan structure context
function loadWellPlot(wellName) {
    console.log('🚀 Loading plot for well:', wellName);
    setIsLoading(true);
    setError(null);
    
    // Prepare request data with structure context
    var requestData = {
        well_name: wellName
    };
    
    // Add structure context if available
    if (appState.currentStructure) {
        requestData.structure_context = {
            field_name: appState.currentStructure.fieldName,
            structure_name: appState.currentStructure.structureName,
            file_path: appState.currentStructure.filePath,
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
            // Handle different response formats
            var plotObject;
            if (typeof response.figure === 'string') {
                plotObject = JSON.parse(response.figure);
            } else {
                plotObject = response.figure;
            }
            
            // Update plot state
            appState.plotFigure = {
                data: plotObject.data || [],
                layout: plotObject.layout || {}
            };
            
            createPlot(plotObject);
            
            var contextMsg = appState.currentStructure ? 
                ' from ' + appState.currentStructure.structureName : '';
            showSuccess('Plot loaded for well: ' + wellName + contextMsg);
        } else {
            throw new Error(response.message || 'Failed to load plot');
        }
    })
    .catch(function(error) {
        console.error('🚀 Error loading well plot:', error);
        setError(error.message);
        showError('Error loading well plot: ' + error.message);
    })
    .finally(function() {
        setIsLoading(false);
    });
}

// Helper function untuk menentukan endpoint berdasarkan plot type
function getPlotEndpoint(plotType) {
    switch (plotType) {
        case 'normalization':
            return '/api/get-normalization-plot';
        case 'smoothing':
            return '/api/get-smoothing-plot';
        case 'splicing':
            return '/api/get-splicing-plot';
        case 'porosity':
            return '/api/get-porosity-plot';
        case 'gsa':
            return '/api/get-gsa-plot';
        case 'vsh':
            return '/api/get-vsh-plot';
        case 'sw':
            return '/api/get-sw-plot';
        case 'rwa':
            return '/api/get-rwa-plot';
        case 'module2':
            return '/api/get-module2-plot';
        case 'rpbe-rgbe':
            return '/api/get-rgbe-rpbe-plot';
        case 'iqual':
            return '/api/get-iqual';
        case 'swgrad':
            return '/api/get-swgrad-plot';
        case 'dns-dnsv':
            return '/api/get-dns-dnsv-plot';
        case 'rt-ro':
            return '/api/get-rt-r0-plot';
        case 'get-module1-plot':
            return '/api/get-module1-plot';
        case 'default':
        default:
            return '/get_well_plot';
    }
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
        selectAllCheckbox.checked = appState.selectedWells.length === appState.availableWells.length;
    }
}

function toggleAllWells() {
    var checkbox = document.getElementById('selectAllWells');
    
    if (checkbox.checked) {
        // Select all wells
        appState.selectedWells = appState.availableWells.slice(); // Copy array
        if (appState.selectedWells.length > 0) {
            loadWellPlot(appState.selectedWells[0]);
        }
    } else {
        // Deselect all wells
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

    // Prefer structure-specific intervals if present
    if (appState.currentStructure && Array.isArray(appState.currentStructure.intervals) && appState.currentStructure.intervals.length > 0) {
        appState.availableIntervals = appState.currentStructure.intervals.slice();
        renderIntervalList(appState.availableIntervals);
        updateBadges();
        return;
    }

    // Otherwise, load from backend dataset markers
    fetchJson('/get_markers')
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

// Helper function untuk mencari structure data pada mock
function findStructureData(fieldName, structureName) {
    if (!fieldName || !structureName) return null;
    var field = structuresData.fields.find(function(f) { return f.field_name === fieldName; });
    if (!field) return null;
    var structure = field.structures.find(function(s) { return s.structure_name === structureName; });
    return structure || null;
}

function renderIntervalList(intervals) {
    var intervalList = document.getElementById('intervalList');
    intervalList.innerHTML = '';
    
    if (intervals.length === 0) {
        intervalList.innerHTML = '<div class="empty-state">No intervals available</div>';
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
        
        // Add click event listener
        intervalItem.addEventListener('click', function(e) {
            var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
            if (e.target === checkbox || tag === 'label') {
                return;
            }
            checkbox.checked = !checkbox.checked;
            toggleInterval(intervalName);
        });
        
        checkbox.addEventListener('change', function(e) {
            e.stopPropagation();
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
    
    // Update select all checkbox
    var selectAllCheckbox = document.getElementById('selectAllIntervals');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = appState.selectedIntervals.length === appState.availableIntervals.length;
    }
}

function toggleAllIntervals() {
    var checkbox = document.getElementById('selectAllIntervals');
    
    if (checkbox.checked) {
        appState.selectedIntervals = appState.availableIntervals.slice(); // Copy array
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
    
    // Clear existing content
    plotArea.innerHTML = '';
    
    try {
        // Normalize layout to fit container height
        figureData = figureData || { data: [], layout: {} };
        figureData.layout = figureData.layout || {};
        // Remove any fixed width/height from backend
        if (figureData.layout.height) delete figureData.layout.height;
        if (figureData.layout.width) delete figureData.layout.width;
        figureData.layout.autosize = true;
        // Optional margins to avoid clipping modebar/title
        figureData.layout.margin = Object.assign({ t: 40, r: 20, b: 40, l: 50 }, figureData.layout.margin || {});
        
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
        // Set height to container height to ensure full visibility
        var containerHeight = plotArea.clientHeight || plotArea.getBoundingClientRect().height;
        if (containerHeight && containerHeight > 0) {
            figureData.layout.height = containerHeight;
        }
        
        Plotly.newPlot(plotArea, figureData.data, figureData.layout, config).then(function(){
            // Keep plot fitting on resize
            function handleResize() {
                var h = plotArea.clientHeight || plotArea.getBoundingClientRect().height;
                if (h && h > 0) {
                    Plotly.relayout(plotArea, { height: h });
                } else {
                    Plotly.Plots.resize(plotArea);
                }
            }
            window.addEventListener('resize', handleResize);
        });
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
                cellHtml += '<option value="' + option + '" ' + selected + '>' + option + '" ' + selected + '>' + option + '</option>';
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
    
    // Check if Plotly is available
    if (typeof Plotly === 'undefined') {
        showError('Plotly.js is not loaded');
        return;
    }
    
    // Initialize structures page first
    initializeStructuresPage();
    showPage('structures');
    
    // Test backend connection
    testBackendConnection();
    
    // Initialize with timeout to allow connection test
    setTimeout(function() {
        // Test backend connection for dashboard functionality
        fetchJson('/first_api_call')
            .then(function(response) {
                console.log('Backend connection established:', response);
                setupEventListeners();
                updateStatus('Ready');
            })
            .catch(function(error) {
                console.error('Failed to initialize application:', error);
                showError('Backend connection failed - using mock data for testing');
                
                // Initialize with mock data for dashboard
                setupEventListeners();
                updateStatus('Ready (Mock Mode)');
            });
    }, 1000);
}

function autoLoadDefaultDataset() {
    console.log('Auto-loading fix_pass_qc dataset...');
    
    return fetchJson('/select_dataset', {
        method: 'POST',
        body: JSON.stringify({ dataset_name: 'fix_pass_qc' })
    })
    .then(function(response) {
        if (response.status === 'success') {
            appState.availableWells = response.wells;
            renderWellList(response.wells);
            updateBadges();
            showSuccess('Loaded ' + response.wells.length + ' wells from fix_pass_qc dataset');
        } else {
            throw new Error(response.message || 'Failed to load dataset');
        }
    })
    .catch(function(error) {
        console.error('Error auto-loading dataset:', error);
        showError('Error loading dataset: ' + error.message);
    });
}

function setupEventListeners() {
    // Setup navigation
    setupNavigation();
    
    // Setup dropdowns
    setupDropdowns();
    
    // Setup plot type select
    setupPlotTypeSelect();
    
    // Setup analysis tools
    setupAnalysisTools();
    
    // Select All checkboxes
    var selectAllWells = document.getElementById('selectAllWells');
    if (selectAllWells) {
        selectAllWells.addEventListener('change', toggleAllWells);
    }
    
    var selectAllIntervals = document.getElementById('selectAllIntervals');
    if (selectAllIntervals) {
        selectAllIntervals.addEventListener('change', toggleAllIntervals);
    }
    
    // Module buttons
    var moduleButtons = document.querySelectorAll('.module-btn:not(.dropdown-btn)');
    moduleButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var moduleName = button.getAttribute('data-module');
            if (moduleName) {
                // Update button state
                moduleButtons.forEach(function(btn) {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
                
                loadModule(moduleName);
            }
        });
    });
    
    // Refresh button
    var refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadWells);
    }
    
    // Parameter form handlers
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
    
    // Add to setupEventListeners function
    var submitParams = document.getElementById('submitParams');
    if (submitParams) {
        submitParams.addEventListener('click', submitCalculationParameters);
    }
    
    // Global error handler
    window.addEventListener('error', function(event) {
        console.error('Global error:', event.error);
        showError('An unexpected error occurred: ' + event.error.message);
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled promise rejection:', event.reason);
        showError('An unexpected error occurred: ' + event.reason);
    });
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

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
    
    // Test backend endpoints
    console.log('Testing backend endpoints...');
    debugApiCall('/first_api_call');
}

// Make debug functions available globally
window.debugApiCall = debugApiCall;
window.showDebugInfo = showDebugInfo;
window.testBackendConnection = testBackendConnection;

// Make navigateToDashboard available globally
window.navigateToDashboard = navigateToDashboard;