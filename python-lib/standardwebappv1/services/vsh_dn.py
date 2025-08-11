import pandas as pd
import numpy as np


def calculate_vsh_dn(df: pd.DataFrame, params: dict) -> pd.DataFrame:
    """
    Menghitung VSH dari crossplot Density-Neutron.
    Parameters match frontend implementation structure.
    """
    df_processed = df.copy()

    # Extract parameters with exact names from frontend
    RHOB_MA = float(params.get('rhob_ma', 2.65))
    RHOB_SH = float(params.get('rhob_sh', 2.61))
    RHOB_FL = float(params.get('rhob_fl', 0.85))
    NPHI_MA = float(params.get('nphi_ma', -0.02))
    NPHI_SH = float(params.get('nphi_sh', 0.398))
    NPHI_FL = float(params.get('nphi_fl', 0.85))

    # Get log column names from parameters (match frontend names)
    RHOB_LOG = params.get('rhob_log', 'RHOB')
    NPHI_LOG = params.get('nphi_log', 'NPHI')
    VSH_OUTPUT_LOG = 'VSH_DN'  # Standard output name

    # Check for required columns with flexible naming
    available_columns = list(df_processed.columns)
    missing_columns = []
    
    # Check for density log
    rhob_column = None
    for col_name in [RHOB_LOG, 'RHOB', 'DENSITY', 'DEN', 'RHOZ']:
        if col_name in available_columns:
            rhob_column = col_name
            break
    if rhob_column is None:
        missing_columns.append(f'{RHOB_LOG}/RHOB/DENSITY')
    
    # Check for neutron log
    nphi_column = None
    for col_name in [NPHI_LOG, 'NPHI', 'NEUTRON', 'NEU', 'TNPH']:
        if col_name in available_columns:
            nphi_column = col_name
            break
    if nphi_column is None:
        missing_columns.append(f'{NPHI_LOG}/NPHI/NEUTRON')
    
    if missing_columns:
        available_cols_info = f"Available columns: {', '.join(available_columns)}"
        raise ValueError(f"Missing required logs: {', '.join(missing_columns)} | {available_cols_info}")

    print(f"Calculating VSH-DN using {rhob_column} and {nphi_column}...")
    print(f"Parameters: RHOB_MA={RHOB_MA}, RHOB_SH={RHOB_SH}, NPHI_MA={NPHI_MA}, NPHI_SH={NPHI_SH}")
    
    # VSH calculation from Density-Neutron crossplot
    a = (RHOB_MA - RHOB_FL) * (NPHI_FL - df_processed[nphi_column])
    b = (df_processed[rhob_column] - RHOB_FL) * (NPHI_FL - NPHI_MA)
    c = (RHOB_MA - RHOB_FL) * (NPHI_FL - NPHI_SH)
    d = (RHOB_SH - RHOB_FL) * (NPHI_FL - NPHI_MA)

    denominator = c - d
    
    # Handle division by zero and invalid values
    with np.errstate(divide='ignore', invalid='ignore'):
        vsh_raw = np.where(
            np.abs(denominator) > 1e-10,  # Avoid near-zero values
            (a - b) / denominator,
            np.nan
        )
        
    # Clip values between 0 and 1, replacing invalid values with NaN
    df_processed[VSH_OUTPUT_LOG] = np.clip(vsh_raw, 0, 1)
    
    # Replace infinite or extremely large values with NaN
    df_processed.loc[~np.isfinite(df_processed[VSH_OUTPUT_LOG]), VSH_OUTPUT_LOG] = np.nan

    # Optional: Calculate difference if VSH_GR already exists
    if 'VSH_GR' in df_processed.columns:
        df_processed['VSH_DIFF'] = df_processed['VSH_GR'] - df_processed[VSH_OUTPUT_LOG]
        print("Added VSH_DIFF column (VSH_GR - VSH_DN)")

    print(f"VSH-DN calculation completed. Output column: {VSH_OUTPUT_LOG}")
    valid_count = (~df_processed[VSH_OUTPUT_LOG].isna()).sum()
    print(f"Valid VSH_DN values: {valid_count}/{len(df_processed)}")
    
    return df_processed
