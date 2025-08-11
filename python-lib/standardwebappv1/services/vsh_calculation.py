import pandas as pd
import numpy as np


def calculate_vsh_from_gr(df: pd.DataFrame, gr_log: str, gr_ma: float, gr_sh: float, output_col: str) -> pd.DataFrame:
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
    # Pastikan kolom yang dibutuhkan ada
    if gr_log not in df.columns:
        print(
            f"Peringatan: Kolom '{gr_log}' tidak ditemukan. Melewatkan kalkulasi VSH.")
        df[output_col] = np.nan
        return df

    # Salin untuk menghindari SettingWithCopyWarning
    df_processed = df.copy()

    # Hitung VSH dengan rumus linear
    v_gr = (df_processed[gr_log] - gr_ma) / (gr_sh - gr_ma)

    # Batasi nilai antara 0 dan 1
    df_processed[output_col] = v_gr.clip(0, 1)

    return df_processed


def calculate_vsh_from_gr_with_params(df: pd.DataFrame, parameters: dict) -> pd.DataFrame:
    """
    Wrapper function for calculate_vsh_from_gr that takes parameters dictionary.
    Compatible with backend endpoint calls.
    
    Args:
        df (pd.DataFrame): DataFrame input yang berisi data log.
        parameters (dict): Dictionary containing VSH calculation parameters.
    
    Returns:
        pd.DataFrame: DataFrame asli dengan tambahan kolom VSH.
    """
    # Extract parameters with defaults
    gr_log = parameters.get('gr_log', parameters.get('input_log', 'GR'))
    gr_ma = float(parameters.get('gr_ma', parameters.get('GR_MA', 30)))
    gr_sh = float(parameters.get('gr_sh', parameters.get('GR_SH', 120))) 
    output_col = parameters.get('output_log', parameters.get('VSH_GR', 'VSH_GR'))
    
    print(f"VSH-GR Calculation Parameters:")
    print(f"  Input Log: {gr_log}")
    print(f"  GR Matrix: {gr_ma}")
    print(f"  GR Shale: {gr_sh}")
    print(f"  Output Column: {output_col}")
    
    return calculate_vsh_from_gr(df, gr_log, gr_ma, gr_sh, output_col)
