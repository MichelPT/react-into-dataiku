import pandas as pd
import numpy as np


def calculate_sw(df: pd.DataFrame, params: dict) -> pd.DataFrame:
    """
    Main function to calculate Water Saturation (SW Indonesia) and reservoir classification.
    """
    df_processed = df.copy()

    # Extract parameters from frontend with safe defaults
    RWS = float(params.get('RWS', 0.529))
    RWT = float(params.get('RWT', 227))
    FTEMP = float(params.get('FTEMP', 80))
    RT_SH = float(params.get('RT_SH', 2.2))
    A = float(params.get('A', 1.0))
    M = float(params.get('M', 2.0))
    N = float(params.get('N', 2.0))
    SW = 'SW'
    VSH = 'VSH'

    # Check required columns with flexible naming
    available_columns = list(df_processed.columns)
    missing_columns = []
    
    # Check for VSH column
    vsh_column = None
    for col_name in ['VSH', 'VSH_GR', 'VSH_DN']:
        if col_name in available_columns:
            vsh_column = col_name
            break
    if vsh_column is None:
        missing_columns.append('VSH (Volume of Shale)')
    
    # Check for resistivity column
    rt_column = None
    for col_name in ['RT', 'RES', 'RESISTIVITY']:
        if col_name in available_columns:
            rt_column = col_name
            break
    if rt_column is None:
        missing_columns.append('RT/RES/RESISTIVITY')
    
    # Check for effective porosity column
    phie_column = None
    for col_name in ['PHIE', 'PHIE_DEN', 'EFFECTIVE_POROSITY']:
        if col_name in available_columns:
            phie_column = col_name
            break
    if phie_column is None:
        missing_columns.append('PHIE (Effective Porosity)')
    
    # Check for Gamma Ray (needed for Indonesian method)
    if 'GR' not in available_columns:
        missing_columns.append('GR (Gamma Ray)')
    
    if missing_columns:
        suggestions = []
        if 'VSH (Volume of Shale)' in missing_columns:
            suggestions.append("Run VSH Calculation module first")
        if 'PHIE (Effective Porosity)' in missing_columns:
            suggestions.append("Run Porosity Calculation module first")
        if 'RT/RES/RESISTIVITY' in missing_columns:
            suggestions.append("Ensure your dataset contains resistivity log data")
        
        available_cols_info = f"Available columns: {', '.join(available_columns)}"
        suggestion_text = f" | Suggestions: {'; '.join(suggestions)}" if suggestions else ""
        raise ValueError(f"Missing required columns: {', '.join(missing_columns)}{suggestion_text} | {available_cols_info}")

    print("Calculating RW at formation temperature...")
    df_processed["RW_TEMP"] = RWS * (RWT + 21.5) / (FTEMP + 21.5)

    print("Calculating Water Saturation (SW Indonesia)...")
    v = df_processed[vsh_column] ** 2
    ff = A / df_processed[phie_column] ** M

    # Avoid division by zero
    ff_times_rw_temp = ff * df_processed["RW_TEMP"]
    ff_times_rw_temp[ff_times_rw_temp == 0] = np.nan

    f1 = 1 / ff_times_rw_temp
    f2 = 2 * np.sqrt(v / (ff_times_rw_temp * RT_SH))
    f3 = v / RT_SH

    denom = f1 + f2 + f3
    denom[denom == 0] = np.nan

    df_processed[SW] = (1 / (df_processed[rt_column] * denom)) ** (1 / N)
    df_processed.loc[df_processed[phie_column] < 0.005, SW] = 1.0
    df_processed[SW] = df_processed[SW].clip(lower=0, upper=1)

    return df_processed

    return df_processed
