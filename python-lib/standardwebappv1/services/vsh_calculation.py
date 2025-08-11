# import pandas as pd
# import numpy as np


# def calculate_vsh_from_gr(df: pd.DataFrame, parameters: dict) -> pd.DataFrame:
#     """
#     Calculate VSH from Gamma Ray using linear method.

#     Args:
#         df (pd.DataFrame): Input DataFrame containing log data.
#         parameters (dict): Dictionary containing:
#             - gr_log: Name of Gamma Ray column
#             - gr_ma: Clean GR value (matrix)
#             - gr_sh: Shale GR value
#             - opt_gr: Method (LINEAR)

#     Returns:
#         pd.DataFrame: Original DataFrame with added VSH_GR column.
#     """
#     gr_log = parameters.get('gr_log', 'GR')
#     gr_ma = float(parameters.get('gr_ma', 30))
#     gr_sh = float(parameters.get('gr_sh', 120))
#     output_col = 'VSH_GR'

#     # Check if required column exists
#     if gr_log not in df.columns:
#         print(f"Warning: Column '{gr_log}' not found. Skipping VSH calculation.")
#         df[output_col] = np.nan
#         return df

#     # Copy to avoid SettingWithCopyWarning
#     df_processed = df.copy()

#     # Calculate VSH using linear formula: VSH = (GR - GR_clean) / (GR_shale - GR_clean)
#     v_gr = (df_processed[gr_log] - gr_ma) / (gr_sh - gr_ma)

#     # Clip values between 0 and 1
#     df_processed[output_col] = v_gr.clip(0, 1)

#     return df_processed


# def calculate_vsh_from_gr_legacy(df: pd.DataFrame, gr_log: str, gr_ma: float, gr_sh: float, output_col: str) -> pd.DataFrame:
#     """
#     Legacy function for backwards compatibility.
#     Calculate VSH from Gamma Ray using linear method.
#     """
#     parameters = {
#         'gr_log': gr_log,
#         'gr_ma': gr_ma,
#         'gr_sh': gr_sh
#     }
#     result = calculate_vsh_from_gr(df, parameters)
#     if output_col != 'VSH_GR':
#         result[output_col] = result['VSH_GR']
#         result.drop('VSH_GR', axis=1, inplace=True)
#     return result
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

