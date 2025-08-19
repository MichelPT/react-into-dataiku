# Structure Selection Test Plan

## Test Scenario: Structure Selection Flow

### Expected Behavior:
1. User navigates to Structures page
2. User sees fields like "adera", "limau", etc.
3. User clicks on a field (e.g., "adera") 
4. User sees structures within that field (e.g., "abab", "benuang", "dewa", "raja")
5. User clicks on a structure (e.g., "abab")
6. **NEW**: App automatically navigates to Dashboard
7. **NEW**: Dashboard shows wells specific to "abab" structure only
8. **NEW**: Dataset status shows "dataset_files - Structure: abab (adera)"
9. **NEW**: Wells list shows structure context header
10. **NEW**: Well plots load correctly using dataset folder files

### Key Fix Points:

#### Backend Fixes:
- ✅ `select_dataset()` now returns wells list properly
- ✅ `/select_dataset` endpoint filters wells by structure context
- ✅ `_load_well_csv_from_dataset_folder()` improved file access
- ✅ Structure-specific dataset selection working

#### Frontend Fixes:
- ✅ `handleStructureSelect()` auto-navigates to dashboard
- ✅ `autoLoadDefaultDataset()` passes structure context  
- ✅ `updateDatasetStatus()` shows structure information
- ✅ `renderWellList()` displays structure context
- ✅ CSS styling for structure context header

### Error Fixes:
- ✅ "No dataset selected and no per-well CSV found" should be resolved
- ✅ "Loaded 0 wells" should now show correct well count for selected structure
- ✅ Structure-specific wells should load properly in dashboard

### Test Steps:
1. Open webapp in Dataiku environment
2. Go to Structures page
3. Click on "adera" field
4. Click on "abab" structure
5. Verify auto-navigation to dashboard
6. Check that wells list only shows wells from "abab" structure
7. Verify structure context is displayed in UI
8. Test well plot loading for structure-specific wells

### Expected Results:
- Dashboard should show only wells from selected structure
- Status should indicate current structure
- Well plots should load without errors
- Structure context should be visible in wells panel
