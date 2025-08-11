import pandas as pd
import numpy as np


def calculate_vsh_from_gr(df: pd.DataFrame, gr_log: str, gr_ma: float, gr_sh: float, output_col: str = 'VSH_GR') -> pd.DataFrame:
    """
    Menghitung VSH dari Gamma Ray menggunakan metode linear.

    Args:
        df (pd.DataFrame): DataFrame input yang berisi data log.
        gr_log (str): Nama kolom Gamma Ray yang akan digunakan.
        gr_ma (float): Nilai GR matriks (zona bersih).
        gr_sh (float): Nilai GR shale.
        output_col (str): Nama kolom baru untuk menyimpan hasil VSH.

    Returns:
        pd.DataFrame: DataFrame asli dengan tambahan kolom VSH.
    """
    df_processed = df.copy()
    
    # Check for gamma ray column with flexible naming
    available_columns = list(df_processed.columns)
    gr_column = None
    
    for col_name in [gr_log, 'GR', 'GAMMA_RAY', 'CGR', 'GRD']:
        if col_name in available_columns:
            gr_column = col_name
            break
    
    if gr_column is None:
        available_gr_cols = [col for col in available_columns if 'GR' in col.upper()]
        if available_gr_cols:
            gr_column = available_gr_cols[0]
            print(f"Using available GR column: {gr_column}")
        else:
            print(f"Warning: No gamma ray column found. Available columns: {', '.join(available_columns)}")
            df_processed[output_col] = np.nan
            return df_processed

    print(f"Calculating VSH-GR using {gr_column} with GR_MA={gr_ma}, GR_SH={gr_sh}")
    
    # Calculate VSH using linear method
    # V_gr = (GR - GR_ma) / (GR_sh - GR_ma)
    v_gr = (df_processed[gr_column] - gr_ma) / (gr_sh - gr_ma)

    # Clip values between 0 and 1
    df_processed[output_col] = v_gr.clip(0, 1)

    valid_count = (~df_processed[output_col].isna()).sum()
    print(f"VSH-GR calculation completed. Valid values: {valid_count}/{len(df_processed)}")
    
    return df_processed


def calculate_vsh_gr_with_params(df: pd.DataFrame, params: dict) -> pd.DataFrame:
    """
    Wrapper function to calculate VSH from GR using parameter dict from frontend.
    This matches the frontend parameter structure.
    """
    # Extract parameters with exact names from frontend
    gr_ma = float(params.get('gr_ma', 30))
    gr_sh = float(params.get('gr_sh', 120))
    gr_log = params.get('gr_log', 'GR')
    opt_gr = params.get('opt_gr', 'LINEAR')  # Currently only LINEAR supported
    output_col = 'VSH_GR'
    
    print(f"VSH-GR Parameters: GR_MA={gr_ma}, GR_SH={gr_sh}, Method={opt_gr}, Input={gr_log}")
    
    return calculate_vsh_from_gr(df, gr_log, gr_ma, gr_sh, output_col)
