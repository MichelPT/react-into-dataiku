# Prefer Dataiku custom webapp app; fall back to a local Flask app for linting/development
try:
    from dataiku.customwebapp import *  # provides `app` in Dataiku runtime
except Exception:
    from flask import Flask, request  # type: ignore
    app = Flask(__name__)  # minimal fallback so module can import outside Dataiku
else:
    from flask import request  # type: ignore
import json
import traceback
from datetime import datetime
import dataiku
import pandas as pd
import numpy as np
from dataiku import pandasutils as pdu
from scipy.stats import linregress
import os

# Import your services (assuming they exist)
try:
    from standardwebappv1.services.vsh_calculation import calculate_vsh_from_gr
    from standardwebappv1.services.porosity import calculate_porosity
    from standardwebappv1.services.depth_matching import depth_matching
    from standardwebappv1.services.rgsa import process_all_wells_rgsa
    from standardwebappv1.services.dgsa import process_all_wells_dgsa
    from standardwebappv1.services.ngsa import process_all_wells_ngsa
    from standardwebappv1.services.rgbe_rpbe import process_rgbe_rpbe
    from standardwebappv1.services.rt_r0 import process_rt_r0
    from standardwebappv1.services.swgrad import process_swgrad
    from standardwebappv1.services.dns_dnsv import process_dns_dnsv
    from standardwebappv1.services.sw import calculate_sw
    from standardwebappv1.services.rwa import calculate_rwa
    from standardwebappv1.services.vsh_dn import calculate_vsh_dn
    from standardwebappv1.services.histogram import plot_histogram
    from standardwebappv1.services.crossplot import generate_crossplot
    from standardwebappv1.services.data_processing import trim_data_auto
    from standardwebappv1.services.plotting_service import (
        extract_markers_with_mean_depth,
        normalize_xover,
        plot_gsa_main,
        plot_log_default,
        plot_smoothing,
        plot_phie_den,
        plot_normalization,
        plot_vsh_linear,
        plot_sw_indo,
        plot_rwa_indo
    )
except ImportError as e:
    print(f"Warning: Some services not available: {e}")
    # Create dummy functions for missing services
    def extract_markers_with_mean_depth(df):
        return df.groupby('MARKER')['DEPTH'].mean().reset_index() if 'MARKER' in df.columns else pd.DataFrame()
    
    def normalize_xover(df, col1, col2):
        return df
    
    def plot_log_default(df, df_marker=None, df_well_marker=None):
        import plotly.graph_objects as go
        from plotly.subplots import make_subplots
        
        fig = make_subplots(
            rows=1, cols=4,
            subplot_titles=('Gamma Ray', 'Resistivity', 'Neutron', 'Density'),
            shared_yaxes=True
        )
        
        if 'DEPTH' in df.columns and 'GR' in df.columns:
            fig.add_trace(go.Scatter(x=df['GR'], y=df['DEPTH'], mode='lines', name='GR'), row=1, col=1)
        if 'DEPTH' in df.columns and 'RT' in df.columns:
            fig.add_trace(go.Scatter(x=df['RT'], y=df['DEPTH'], mode='lines', name='RT'), row=1, col=2)
        if 'DEPTH' in df.columns and 'NPHI' in df.columns:
            fig.add_trace(go.Scatter(x=df['NPHI'], y=df['DEPTH'], mode='lines', name='NPHI'), row=1, col=3)
        if 'DEPTH' in df.columns and 'RHOB' in df.columns:
            fig.add_trace(go.Scatter(x=df['RHOB'], y=df['DEPTH'], mode='lines', name='RHOB'), row=1, col=4)
        
        if 'DEPTH' in df.columns and not df.empty:
            min_depth = df['DEPTH'].min()
            max_depth = df['DEPTH'].max()
            # Add small padding to the depth range
            depth_padding = (max_depth - min_depth) * 0.05
            fig.update_yaxes(
                autorange='reversed',
                range=[max_depth + depth_padding, min_depth - depth_padding]
            )
        else:
            fig.update_yaxes(autorange='reversed')
        
        fig.update_layout(height=800, title='Well Log Plot')
        return fig

    # Minimal placeholders for plotting functions referenced below
    def plot_vsh_linear(df=None, df_marker=None, df_well_marker=None):
        return plot_log_default(df)

    def plot_phie_den(df=None, df_marker=None, df_well_marker=None):
        return plot_log_default(df)

    def plot_gsa_main(df=None):
        return plot_log_default(df)

    def plot_normalization(df=None, df_marker=None, df_well_marker=None):
        return plot_log_default(df)

    def plot_sw_indo(df=None, df_marker=None, df_well_marker=None):
        return plot_log_default(df)

    def plot_rwa_indo(df=None, df_marker=None, df_well_marker=None):
        return plot_log_default(df)

    def plot_smoothing(df=None, df_marker=None, df_well_marker=None):
        return plot_log_default(df)

    # Fallback histogram and crossplot generators
    def plot_histogram(df: pd.DataFrame, log_column: str, n_bins: int):
        import plotly.graph_objects as go
        s = pd.to_numeric(df.get(log_column), errors='coerce').dropna()
        if s.empty:
            return plot_log_default(df)
        hist_y, hist_x = np.histogram(s, bins=n_bins, density=False)
        fig = go.Figure()
        fig.add_bar(x=hist_x[:-1], y=hist_y, name=f"Hist {log_column}")
        fig.update_layout(title=f"Histogram: {log_column}")
        return fig

    def generate_crossplot(df, x_col, y_col, *args, **kwargs):
        import plotly.express as px
        d = df[[c for c in [x_col, y_col] if c in df.columns]].dropna()
        if d.empty:
            return plot_log_default(df)
        fig = px.scatter(d, x=x_col, y=y_col, height=600)
        fig.update_layout(title=f"Crossplot {x_col} vs {y_col}")
        return fig

    # Minimal calculation fallbacks
    def _apply_interval_zone_filter(df, target_intervals=None, target_zones=None):
        mask = pd.Series(True, index=df.index)
        if target_intervals and 'MARKER' in df.columns:
            mask &= df['MARKER'].isin(target_intervals)
        if target_zones is not None:
            for zc in ['ZONE', 'ZONES', 'ZONE_NAME', 'Zone', 'zone']:
                if zc in df.columns:
                    mask &= df[zc].isin(target_zones)
                    break
        return mask

    def calculate_vsh_from_gr(df, gr_log='GR', gr_ma=30.0, gr_sh=120.0, output_col='VSH_GR', target_intervals=None, target_zones=None):
        if gr_log not in df.columns:
            raise ValueError(f"Input log {gr_log} not found")
        res = df.copy()
        igr = (pd.to_numeric(res[gr_log], errors='coerce') - float(gr_ma)) / max(1e-6, (float(gr_sh) - float(gr_ma)))
        vsh = igr.clip(0, 1)
        mask = _apply_interval_zone_filter(res, target_intervals, target_zones)
        res.loc[mask, output_col] = vsh[mask]
        return res

    def calculate_vsh_dn(df, params=None, target_intervals=None, target_zones=None):
        params = params or {}
        nphi_col = params.get('NPHI', 'NPHI')
        rhob_col = params.get('RHOB', 'RHOB')
        out_col = params.get('output_log', 'VSH_DN')
        nphi_ma = float(params.get('NPHI_MA', -0.02))
        nphi_sh = float(params.get('NPHI_SH', 0.4))
        rho_ma = float(params.get('RHO_MA', 2.65))
        rho_sh = float(params.get('RHO_SH', 2.3))
        if nphi_col not in df.columns or rhob_col not in df.columns:
            raise ValueError("NPHI and RHOB required for VSH-DN")
        res = df.copy()
        nphi = pd.to_numeric(res[nphi_col], errors='coerce')
        rhob = pd.to_numeric(res[rhob_col], errors='coerce')
        # Simple normalized blend toward shale signature (high NPHI, low RHOB)
        nphi_part = (nphi - nphi_ma) / max(1e-6, (nphi_sh - nphi_ma))
        rhob_part = (rho_ma - rhob) / max(1e-6, (rho_ma - rho_sh))
        vsh_dn = 0.5 * (nphi_part + rhob_part)
        vsh_dn = vsh_dn.clip(0, 1)
        mask = _apply_interval_zone_filter(res, target_intervals, target_zones)
        res.loc[mask, out_col] = vsh_dn[mask]
        return res

    # Fallback porosity calculation (density method)
    def calculate_porosity(df, params=None, target_intervals=None, target_zones=None):
        params = params or {}
        rho_ma = float(params.get('RHO_MA', 2.65))
        rho_fl = float(params.get('RHO_FL', 1.0))
        rhob_col = params.get('RHOB', 'RHOB')
        out_col = params.get('PHIE', 'PHIE')
        if rhob_col not in df.columns:
            return df.copy()
        res = df.copy()
        rhob = pd.to_numeric(res[rhob_col], errors='coerce')
        phie = (rho_ma - rhob) / max(1e-6, (rho_ma - rho_fl))
        phie = phie.clip(0, 1)
        mask = _apply_interval_zone_filter(res, target_intervals, target_zones)
        res.loc[mask, out_col] = phie[mask]
        # Also set PHIT as PHIE if absent
        if 'PHIT' not in res.columns:
            res.loc[mask, 'PHIT'] = res.loc[mask, out_col]
        # Den variants common in plotting_service
        if 'PHIE_DEN' not in res.columns:
            res.loc[mask, 'PHIE_DEN'] = res.loc[mask, out_col]
        if 'PHIT_DEN' not in res.columns:
            res.loc[mask, 'PHIT_DEN'] = res.loc[mask, 'PHIT']
        return res

    # Fallback SW (Archie)
    def calculate_sw(df, params=None, target_intervals=None, target_zones=None):
        params = params or {}
        rw = float(params.get('rw', 0.1))
        a = float(params.get('a', 1.0))
        m = float(params.get('m', 2.0))
        n = float(params.get('n', 2.0))
        rt_col = params.get('RT', 'RT')
        phie_col = params.get('PHIE', 'PHIE')
        out_col = params.get('SW', 'SW')
        if rt_col not in df.columns or phie_col not in df.columns:
            return df.copy()
        res = df.copy()
        rt = pd.to_numeric(res[rt_col], errors='coerce')
        phie = pd.to_numeric(res[phie_col], errors='coerce')
        with np.errstate(divide='ignore', invalid='ignore'):
            sw = ((a * rw) / (rt * (phie ** m))) ** (1.0 / n)
        sw = sw.clip(0, 1)
        mask = _apply_interval_zone_filter(res, target_intervals, target_zones)
        res.loc[mask, out_col] = sw[mask]
        # Alias expected by plotting_service
        if 'SWE_INDO' not in res.columns:
            res.loc[mask, 'SWE_INDO'] = res.loc[mask, out_col]
        return res

    # Fallback RWA producing three columns used by plotting_service
    def calculate_rwa(df, params=None, target_intervals=None, target_zones=None):
        params = params or {}
        rt_col = params.get('RT', 'RT')
        phie_col = params.get('PHIE', 'PHIE')
        a = float(params.get('a', 1.0))
        m = float(params.get('m', 2.0))
        # Simple Archie-based apparent Rw approximation: Rw_app ≈ RT * PHIE^m / a
        res = df.copy()
        if rt_col in res.columns and phie_col in res.columns:
            rt = pd.to_numeric(res[rt_col], errors='coerce')
            phie = pd.to_numeric(res[phie_col], errors='coerce').clip(lower=1e-6)
            rwa_val = (rt * (phie ** m)) / max(1e-6, a)
        else:
            # Default to NaN series of correct length
            rwa_val = pd.Series(np.nan, index=res.index)
        mask = _apply_interval_zone_filter(res, target_intervals, target_zones)
        for col in ['RWA_FULL', 'RWA_SIMPLE', 'RWA_TAR']:
            res.loc[mask, col] = rwa_val[mask]
        return res

class WellLogAnalysis:
    def __init__(self, project_key=None):
        """Initialize with optional project key and auto-load fix_pass_qc dataset"""
        self.project_key = project_key
        if project_key:
            self.project = dataiku.Project(project_key)
        self.current_dataset = None
        self.current_well_data = None
        self.dataset_files_manifest = None  # Store dataset folder manifest
        self.available_datasets = []
        # Track selection coming from UI
        self.selected_intervals = []
        self.selected_zones = []
        self.selected_wells = []

        # Auto-load the fix_pass_qc dataset
        self.auto_load_default_dataset()

    # -----------------------------
    # Internal helpers
    # -----------------------------
    def _normalize_series(self, s):
        try:
            s = pd.to_numeric(s, errors='coerce')
            min_v = s.min()
            max_v = s.max()
            if pd.isna(min_v) or pd.isna(max_v) or max_v == min_v:
                return pd.Series(np.zeros(len(s)), index=s.index)
            return (s - min_v) / (max_v - min_v)
        except Exception:
            # Fallback to zeros on error to avoid breaking plots
            return pd.Series(np.zeros(len(s)), index=s.index)

    def _ensure_crossplot_norms(self, df):
        """Ensure columns expected by plotting_service data_col exist.
        This covers pairs: RT-RHOB, NPHI-RHOB, RT-GR.
        """
        new_df = df.copy()
        # RT vs RHOB -> expects RT_NORM, RHOB_NORM_RT
        if 'RT' in new_df.columns and 'RHOB' in new_df.columns:
            if 'RT_NORM' not in new_df.columns:
                new_df['RT_NORM'] = self._normalize_series(new_df['RT'])
            if 'RHOB_NORM_RT' not in new_df.columns:
                new_df['RHOB_NORM_RT'] = self._normalize_series(new_df['RHOB'])
        # NPHI vs RHOB -> expects NPHI_NORM, RHOB_NORM_NPHI
        if 'NPHI' in new_df.columns and 'RHOB' in new_df.columns:
            if 'NPHI_NORM' not in new_df.columns:
                new_df['NPHI_NORM'] = self._normalize_series(new_df['NPHI'])
            if 'RHOB_NORM_NPHI' not in new_df.columns:
                new_df['RHOB_NORM_NPHI'] = self._normalize_series(new_df['RHOB'])
        # RT vs GR -> expects RT_NORM (already above), GR_NORM_RT
        if 'RT' in new_df.columns and 'GR' in new_df.columns:
            if 'RT_NORM' not in new_df.columns:
                new_df['RT_NORM'] = self._normalize_series(new_df['RT'])
            if 'GR_NORM_RT' not in new_df.columns:
                new_df['GR_NORM_RT'] = self._normalize_series(new_df['GR'])
        return new_df
    
    def _local_csv_path(self, name='fix_pass_qc.csv'):
        """Resolve a local CSV path relative to this backend file.
        backend.py is at webapps/webappv1/backend.py; CSV is at dataiku_native/<name>.
        """
        base_dir = os.path.dirname(__file__)
        csv_path = os.path.normpath(os.path.join(base_dir, '..', '..', name))
        return csv_path

    def _load_local_fix_pass_qc(self):
        """Load fix_pass_qc.csv if present locally; return DataFrame or None."""
        try:
            csv_path = self._local_csv_path('fix_pass_qc.csv')
            if os.path.isfile(csv_path):
                df = pd.read_csv(csv_path)
                self.current_dataset = 'fix_pass_qc (csv)'
                self.current_well_data = df
                return df
        except Exception as e:
            print(f"Failed loading local fix_pass_qc.csv: {e}")
        return None

    def _load_dataset_files_csv(self):
        """Load a CSV from webapp dataset_files directory as the working dataset (if available).
        Looks for specific CSV files like fix_pass_qc_13k.csv, pass_qc.csv in dataset_files folder.
        Returns DataFrame or None.
        """
        base_dir = os.path.dirname(__file__)
        dataset_files_dir = os.path.join(base_dir, 'dataset_files')
        
        # List of candidate CSV files to look for in dataset_files directory
        candidate_files = [
            'fix_pass_qc_13k.csv',
            'fix_pass_qc.csv', 
            'pass_qc.csv',
            'data.csv'
        ]
        
        for filename in candidate_files:
            file_path = os.path.join(dataset_files_dir, filename)
            try:
                if os.path.isfile(file_path):
                    print(f"Loading CSV file: {file_path}")
                    df = pd.read_csv(file_path)
                    self.current_dataset = f'dataset_files ({filename})'
                    self.current_well_data = df
                    print(f"Loaded dataset from {file_path} as current_well_data - rows: {len(df)}")
                    return df
            except Exception as e:
                print(f"Failed loading {file_path}: {e}")
        
        print("No suitable CSV files found in dataset_files directory")
        return None

    def _load_well_csv_from_dataset_files(self, well_name: str, structure_context: dict | None = None):
        """Attempt to load a single-well CSV from dataset_files based on provided context.
        Supports both Dataiku dataset folder mode and local filesystem.
        Preferred order:
          1) If dataset folder manifest available, use Dataiku API to load file
          2) Local filesystem with structure-specific path when context present
          3) Recursive search in structures folder for the well CSV
          4) dataset_files/wells/<well_name>.csv as general fallback
        Returns a DataFrame or None.
        """
        try:
            # Method 1: Use dataset folder manifest (Dataiku mode)
            if self.dataset_files_manifest is not None:
                return self._load_well_csv_from_dataset_folder(well_name, structure_context)
            
            # Method 2: Local filesystem (original logic)
            return self._load_well_csv_from_local_files(well_name, structure_context)
            
        except Exception as e:
            print(f"Failed loading per-well CSV for {well_name}: {e}")
            return None

    def _load_well_csv_from_dataset_folder(self, well_name: str, structure_context: dict | None = None):
        """Load a well CSV from Dataiku dataset folder using the manifest."""
        try:
            manifest = self.dataset_files_manifest
            well_csv_filename = f"{well_name}.csv"
            
            # Find matching file path in manifest
            matching_paths = manifest[manifest['path'].str.contains(well_csv_filename, na=False)]
            
            if len(matching_paths) == 0:
                print(f"Well {well_name} not found in dataset folder manifest")
                return None
            
            if len(matching_paths) > 1:
                print(f"Multiple files found for well {well_name}: {matching_paths['path'].tolist()}")
                # If structure context provided, prefer matching structure path
                if structure_context:
                    field = structure_context.get('field_name') or structure_context.get('fieldName')
                    struct = structure_context.get('structure_name') or structure_context.get('structureName')
                    
                    if field and struct:
                        structure_matches = matching_paths[
                            matching_paths['path'].str.contains(f"/{field}/", na=False) &
                            matching_paths['path'].str.contains(f"/{struct}/", na=False)
                        ]
                        if len(structure_matches) > 0:
                            file_path = structure_matches.iloc[0]['path']
                        else:
                            file_path = matching_paths.iloc[0]['path']
                    else:
                        file_path = matching_paths.iloc[0]['path']
                else:
                    file_path = matching_paths.iloc[0]['path']
            else:
                file_path = matching_paths.iloc[0]['path']
            
            print(f"Loading well {well_name} from dataset folder: {file_path}")
            
            # Use Dataiku API to read the file from dataset folder
            # For dataset folders, files are accessible using get_dataframe() with path parameter
            # or get_download_stream() depending on Dataiku version
            try:
                # Method 1: Try using dataset folder file access
                dataset = dataiku.Dataset('dataset_files')
                
                # Get the specific file content from dataset folder
                # Note: Exact API depends on Dataiku version and dataset folder setup
                # This might need adjustment based on your Dataiku environment
                
                # Approach: Use dataset streaming to get specific file
                stream = dataset.get_download_stream(path=file_path)
                df = pd.read_csv(stream)
                print(f"Successfully loaded {well_name} from dataset folder: {len(df)} rows")
                return df
                
            except Exception as api_err:
                print(f"Dataset folder API access failed for {file_path}: {api_err}")
                return None
                
        except Exception as e:
            print(f"Failed loading well {well_name} from dataset folder: {e}")
            return None

    def _load_well_csv_from_local_files(self, well_name: str, structure_context: dict | None = None):
        """Load a well CSV from local filesystem (original logic)."""
        try:
            base_dir = os.path.dirname(__file__)
            
            # 1) Try structure-specific path if context present
            if structure_context and isinstance(structure_context, dict):
                field = structure_context.get('field_name') or structure_context.get('fieldName')
                struct = structure_context.get('structure_name') or structure_context.get('structureName')
                
                if field and struct:
                    # Direct path first (2-level: field/struct/well.csv)
                    p1 = os.path.join(base_dir, 'dataset_files', 'structures', str(field), str(struct), f"{well_name}.csv")
                    if os.path.isfile(p1):
                        print(f"Found well CSV at: {p1}")
                        return pd.read_csv(p1)
                    
                    # Recursive search within structure folder (for 3+ levels like field/struct/subdir/well.csv)
                    struct_root = os.path.join(base_dir, 'dataset_files', 'structures', str(field), str(struct))
                    if os.path.isdir(struct_root):
                        for r, _d, files in os.walk(struct_root):
                            for fn in files:
                                if fn.lower() == f"{well_name.lower()}.csv":
                                    full_path = os.path.join(r, fn)
                                    print(f"Found well CSV at: {full_path}")
                                    return pd.read_csv(full_path)
                
                # If only field is provided, search within that field folder
                elif field:
                    field_root = os.path.join(base_dir, 'dataset_files', 'structures', str(field))
                    if os.path.isdir(field_root):
                        for r, _d, files in os.walk(field_root):
                            for fn in files:
                                if fn.lower() == f"{well_name.lower()}.csv":
                                    full_path = os.path.join(r, fn)
                                    print(f"Found well CSV at: {full_path}")
                                    return pd.read_csv(full_path)
            
            # 2) Global recursive search in structures folder if no context or context search failed
            structures_dir = os.path.join(base_dir, 'dataset_files', 'structures')
            if os.path.isdir(structures_dir):
                for r, _d, files in os.walk(structures_dir):
                    for fn in files:
                        if fn.lower() == f"{well_name.lower()}.csv":
                            full_path = os.path.join(r, fn)
                            print(f"Found well CSV at: {full_path}")
                            return pd.read_csv(full_path)
            
            # 3) Fallback to global wells folder
            p2 = os.path.join(base_dir, 'dataset_files', 'wells', f"{well_name}.csv")
            if os.path.isfile(p2):
                print(f"Found well CSV at: {p2}")
                return pd.read_csv(p2)
                
        except Exception as e:
            print(f"Failed loading per-well CSV for {well_name}: {e}")
        return None

    def _list_wells_from_dataset_files(self):
        """Scan dataset_files for available well CSVs and return well names (no extension).
        This searches recursively under dataset_files/structures and flat under dataset_files/wells.
        Supports multi-level directory structures like: structures/adera/benuang/BNG-012.csv
        """
        wells = set()
        
        # Find the correct dataset_files directory
        dataset_files_dir = self._find_dataset_files_directory()
        if not dataset_files_dir:
            print("❌ dataset_files directory not found")
            return []
            
        try:
            # 1) From structures tree (recursive search) - handles multi-level directories
            structures_dir = os.path.join(dataset_files_dir, 'structures')
            if os.path.isdir(structures_dir):
                print(f"Scanning structures directory: {structures_dir}")
                # Use os.walk to traverse all subdirectories automatically,
                # no matter how deep the structure is (field/struct/subdir/...)
                for root, dirs, files in os.walk(structures_dir):
                    for fname in files:
                        if fname.lower().endswith('.csv'):
                            well_name = os.path.splitext(fname)[0]
                            wells.add(well_name)
                            # Print the relative path for debugging
                            rel_path = os.path.relpath(os.path.join(root, fname), structures_dir)
                            print(f"Found well: {well_name} at structures/{rel_path}")

            # 2) From global wells folder (flat structure)
            wells_dir = os.path.join(dataset_files_dir, 'wells')
            if os.path.isdir(wells_dir):
                print(f"Scanning wells directory: {wells_dir}")
                for fname in os.listdir(wells_dir):
                    if fname.lower().endswith('.csv'):
                        well_name = os.path.splitext(fname)[0]
                        wells.add(well_name)
                        print(f"Found well: {well_name} at wells/{fname}")
                        
        except Exception as e:
            print(f"Failed listing wells from dataset_files: {e}")
            import traceback
            traceback.print_exc()
            
        wells_list = sorted(list(wells))  # Convert set to sorted list
        print(f"Total wells found: {len(wells_list)}")
        return wells_list
    
    def _find_dataset_files_directory(self):
        """Find the correct path to dataset_files directory.
        Returns the absolute path to dataset_files directory or None if not found.
        """
        print("🔍 Searching for dataset_files directory...")
        
        # Get the backend.py file location (where this script is running)
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        print(f"Backend script location: {backend_dir}")
        
        # Possible locations to search for dataset_files (in order of preference)
        search_paths = [
            # 1. Same directory as backend.py (webappv1/dataset_files)
            os.path.join(backend_dir, 'dataset_files'),
            # 2. Parent directory (webapps/dataset_files) - unlikely but possible
            os.path.join(os.path.dirname(backend_dir), 'dataset_files'),
            # 3. Go up to dataiku_native root level
            os.path.join(os.path.dirname(os.path.dirname(backend_dir)), 'dataset_files'),
        ]
        
        # Special case: If running from Dataiku environment, try to find the actual project directory
        if 'DataScienceStudio' in backend_dir or 'dataiku' in backend_dir.lower():
            print("🎯 Detected Dataiku environment, searching for project directory...")
            # Common project locations when running from Dataiku
            possible_project_paths = [
                '/Users/macbookair/Documents/project-web/NextJs/dataiku_native/webapps/webappv1/dataset_files',
                '/Users/macbookair/Documents/project-web/NextJs/dataiku_native/dataset_files',
            ]
            search_paths = possible_project_paths + search_paths
        
        for search_path in search_paths:
            print(f"  Checking: {search_path}")
            if os.path.exists(search_path):
                # Verify it's a directory and has expected subdirectories
                if os.path.isdir(search_path):
                    structures_dir = os.path.join(search_path, 'structures')
                    wells_dir = os.path.join(search_path, 'wells')
                    
                    has_structures = os.path.isdir(structures_dir)
                    has_wells = os.path.isdir(wells_dir)
                    
                    if has_structures or has_wells:
                        print(f"✅ Found dataset_files directory: {search_path}")
                        print(f"   - structures: {has_structures}")
                        print(f"   - wells: {has_wells}")
                        return search_path
                    else:
                        print(f"   ❌ Directory exists but no structures/wells subdirectories")
                else:
                    print(f"   ❌ Path exists but is not a directory")
            else:
                print(f"   ❌ Path does not exist")
        
        print("❌ dataset_files directory not found in any expected location")
        return None

    def _list_wells_from_dataset_folder(self, manifest_df):
        """Extract well names from dataset folder manifest DataFrame.
        The manifest should have a 'path' column with file paths like '/structures/adera/abab/ABB-106.csv'
        """
        wells = set()
        
        if 'path' not in manifest_df.columns:
            print("❌ Manifest DataFrame does not have 'path' column")
            return []
        
        print(f"Extracting wells from {len(manifest_df)} files in dataset folder manifest...")
        
        for _, row in manifest_df.iterrows():
            path = row['path']
            if pd.isna(path) or not isinstance(path, str):
                continue
                
            # Extract filename from path and remove extension
            filename = os.path.basename(path)
            if filename.lower().endswith('.csv'):
                well_name = filename[:-4]  # Remove .csv extension
                wells.add(well_name)
                print(f"  Found well: {well_name} from {path}")
        
        wells_list = sorted(list(wells))
        print(f"Found {len(wells_list)} unique wells from dataset folder")
        return wells_list
    
    def get_structures_hierarchy(self):
        """Get the hierarchical structure of dataset_files/structures directory.
        Returns a nested dictionary representing the folder structure.
        Example: {"adera": {"benuang": ["BNG-012"], "abab": ["ABB-001"]}}
        """
        try:
            base_dir = os.path.dirname(__file__)
            structures_dir = os.path.join(base_dir, 'dataset_files', 'structures')
            
            if not os.path.isdir(structures_dir):
                return {"status": "error", "message": "Structures directory not found"}
            
            hierarchy = {}
            
            # Walk through all directories and build hierarchy
            for root, dirs, files in os.walk(structures_dir):
                # Get relative path from structures root
                rel_path = os.path.relpath(root, structures_dir)
                
                # Skip the root directory itself
                if rel_path == '.':
                    continue
                
                # Split path into components
                path_parts = rel_path.split(os.sep)
                
                # Find CSV files in current directory
                wells_in_dir = []
                for fname in files:
                    if fname.lower().endswith('.csv'):
                        wells_in_dir.append(os.path.splitext(fname)[0])
                
                # Build nested dictionary structure
                current_level = hierarchy
                for part in path_parts[:-1]:  # Navigate to parent directory
                    if part not in current_level:
                        current_level[part] = {}
                    current_level = current_level[part]
                
                # Add the final directory with its wells
                final_dir = path_parts[-1]
                if wells_in_dir:  # Only add if there are wells
                    if final_dir not in current_level:
                        current_level[final_dir] = {}
                    current_level[final_dir]['wells'] = sorted(wells_in_dir)
            
            return {
                "status": "success", 
                "hierarchy": hierarchy,
                "message": f"Structure hierarchy loaded successfully"
            }
            
        except Exception as e:
            return {"status": "error", "message": f"Error getting structures hierarchy: {str(e)}"}
    
    def auto_load_default_dataset(self):
        """Automatically load the default dataset on initialization.
        Priority order:
        1. dataset_files folder mode (if structures/wells directories exist)
        2. dataset_files Dataiku dataset (if available)
        3. Local CSV files in dataset_files
        4. fix_pass_qc dataset
        5. Fallback to any available raw well data dataset
        """
        try:
            print("=== AUTO LOAD DEFAULT DATASET START ===")
            
            # PRIORITY 1: If dataset_files folder exists (structures or wells), enable folder mode
            try:
                print("PRIORITY 1: Searching for dataset_files directory...")
                dataset_files_dir = self._find_dataset_files_directory()
                
                if dataset_files_dir:
                    dsf_struct = os.path.join(dataset_files_dir, 'structures')
                    dsf_wells = os.path.join(dataset_files_dir, 'wells')
                    
                    struct_exists = os.path.isdir(dsf_struct)
                    wells_exists = os.path.isdir(dsf_wells)
                    
                    print(f"PRIORITY 1: Using dataset_files directory: {dataset_files_dir}")
                    print(f"  - structures directory: {dsf_struct} -> exists: {struct_exists}")
                    print(f"  - wells directory: {dsf_wells} -> exists: {wells_exists}")
                else:
                    dsf_struct = None
                    dsf_wells = None
                    struct_exists = False
                    wells_exists = False
                    print("PRIORITY 1: ❌ dataset_files directory not found in any expected location")
                
                print(f"PRIORITY 1: Checking dataset_files directories:")
                if dsf_struct and dsf_wells:
                    print(f"  - structures directory: {dsf_struct} -> exists: {struct_exists}")
                    print(f"  - wells directory: {dsf_wells} -> exists: {wells_exists}")
                else:
                    print("  - No dataset_files directory found to check")
                
                if struct_exists or wells_exists:
                    print("PRIORITY 1: Found dataset_files directories, activating folder mode...")
                    try:
                        result = self.select_dataset('dataset_files')
                        print(f"PRIORITY 1: select_dataset returned: {result}")
                        if result.get("status") == "success":
                            print("PRIORITY 1: ✅ Successfully auto-loaded dataset: dataset_files (folder)")
                            print("=== AUTO LOAD DEFAULT DATASET END ===")
                            return
                        else:
                            print(f"PRIORITY 1: ❌ Failed to select dataset_files folder mode: {result}")
                    except Exception as select_error:
                        print(f"PRIORITY 1: ❌ Exception during select_dataset: {select_error}")
                        import traceback
                        traceback.print_exc()
                else:
                    print("PRIORITY 1: ❌ No dataset_files directories found")
            except Exception as e:
                print(f"PRIORITY 1: ❌ Exception in dataset_files folder mode: {e}")

            # PRIORITY 2: Prefer a Dataiku dataset named 'dataset_files' if present
            try:
                print("PRIORITY 2: Checking for Dataiku dataset named 'dataset_files'...")
                available_datasets = self.get_available_datasets()
                if available_datasets.get("status") == "success":
                    datasets = available_datasets.get("datasets", [])
                    dsf = [ds for ds in datasets if ds.lower() == 'dataset_files']
                    if dsf:
                        print(f"PRIORITY 2: Found Dataiku dataset: {dsf[0]}")
                        
                        # Test if it's a valid dataset folder with expected structure
                        try:
                            test_dataset = dataiku.Dataset(dsf[0])
                            test_df = test_dataset.get_dataframe()
                            
                            if 'path' in test_df.columns:
                                print(f"PRIORITY 2: ✅ 'dataset_files' is a valid dataset folder with {len(test_df)} files")
                                result = self.select_dataset(dsf[0])
                                if result.get("status") == "success":
                                    print("PRIORITY 2: ✅ Successfully auto-loaded dataset: dataset_files (Dataiku folder)")
                                    print("=== AUTO LOAD DEFAULT DATASET END ===")
                                    return
                                else:
                                    print(f"PRIORITY 2: ❌ Failed to select dataset_files Dataiku: {result}")
                            else:
                                print(f"PRIORITY 2: ❌ 'dataset_files' exists but not a folder dataset (no 'path' column)")
                                print(f"PRIORITY 2: Available columns: {list(test_df.columns)}")
                        except Exception as test_err:
                            print(f"PRIORITY 2: ❌ Error testing dataset_files structure: {test_err}")
                    else:
                        print("PRIORITY 2: ❌ No 'dataset_files' found in available datasets")
                else:
                    print(f"PRIORITY 2: ❌ Failed to get available datasets: {available_datasets}")
            except Exception as e:
                print(f"PRIORITY 2: ❌ Exception in dataset_files Dataiku selection: {e}")

            # PRIORITY 3: Try local dataset_files CSVs (if any specific CSV files exist)
            print("PRIORITY 3: Checking for local CSV files in dataset_files...")
            if self._load_dataset_files_csv() is not None:
                print("PRIORITY 3: ✅ Successfully auto-loaded dataset: dataset_files (csv)")
                print("=== AUTO LOAD DEFAULT DATASET END ===")
                return
            else:
                print("PRIORITY 3: ❌ No suitable CSV files found")

            # PRIORITY 4: Try explicit fix_pass_qc
            print("PRIORITY 4: Trying fix_pass_qc dataset...")
            dataset_name = "fix_pass_qc"
            result = self.select_dataset(dataset_name)
            if result.get("status") == "success":
                print(f"PRIORITY 4: ✅ Successfully auto-loaded dataset: {dataset_name}")
                print("=== AUTO LOAD DEFAULT DATASET END ===")
                return
            else:
                print(f"PRIORITY 4: ❌ Failed to load fix_pass_qc: {result}")

            # Fallback discovery
            try:
                available_datasets = self.get_available_datasets()
                if available_datasets.get("status") == "success":
                    datasets = available_datasets.get("datasets", [])
                    raw_datasets = [ds for ds in datasets if 'raw' in ds.lower() and ('well' in ds.lower() or 'data' in ds.lower())]
                    if raw_datasets:
                        fallback_dataset = raw_datasets[0]
                        result = self.select_dataset(fallback_dataset)
                        if result.get("status") == "success":
                            print(f"Successfully auto-loaded fallback dataset: {fallback_dataset}")
                        else:
                            print(f"Failed to auto-load fallback dataset {fallback_dataset}")
                    else:
                        print("No raw well data dataset found")
                else:
                    print("Failed to get available datasets for fallback")
            except Exception as fallback_error:
                print(f"Error during fallback dataset loading: {str(fallback_error)}")
        except Exception as e:
            print(f"Error auto-loading dataset: {str(e)}")
    
    def get_available_datasets(self):
        """Get list of available datasets in the project"""
        try:
            self.available_datasets = []
            try:
                if self.project:
                    datasets = self.project.list_datasets()
                    self.available_datasets = [ds['name'] for ds in datasets]
                else:
                    # For standalone usage, get all datasets via API client
                    client = dataiku.api_client()
                    datasets = client.list_datasets()
                    self.available_datasets = [ds['name'] for ds in datasets]
            except Exception as _:
                # Ignore Dataiku API errors in local mode
                pass
            # Ensure fix_pass_qc appears if local CSV exists
            if os.path.isfile(self._local_csv_path('fix_pass_qc.csv')) and 'fix_pass_qc' not in [d.lower() for d in self.available_datasets]:
                self.available_datasets.append('fix_pass_qc')
            
            return {
                "status": "success",
                "datasets": self.available_datasets,
                "message": f"Found {len(self.available_datasets)} datasets"
            }
        except Exception as e:
            return {"status": "error", "message": f"Error getting datasets: {str(e)}"}
    
    def select_dataset(self, dataset_name):
        """Select a dataset and load its basic info"""
        try:
            print(f"=== SELECT DATASET: {dataset_name} ===")
            
            # Special handling: folder-based dataset
            if str(dataset_name).lower() == 'dataset_files':
                print("DATASET_FILES MODE: Activating dataset_files mode...")
                
                # First try as Dataiku dataset folder
                try:
                    print("DATASET_FILES MODE: Trying Dataiku dataset folder...")
                    dataset = dataiku.Dataset('dataset_files')
                    df = dataset.get_dataframe()
                    
                    # Check if it's a dataset folder (has 'path' column)
                    if 'path' in df.columns:
                        print(f"DATASET_FILES MODE: ✅ Successfully loaded dataset folder with {len(df)} files")
                        self.current_dataset = 'dataset_files (Dataiku folder)'
                        self.current_well_data = None  # Use dataset folder mode
                        self.dataset_files_manifest = df  # Store the manifest for file access
                        
                        # List available wells from the manifest
                        try:
                            wells = self._list_wells_from_dataset_folder(df)
                            print(f"DATASET_FILES MODE: Found {len(wells)} wells from dataset folder: {wells[:5] if len(wells) > 5 else wells}...")
                        except Exception as wells_error:
                            print(f"DATASET_FILES MODE: ❌ Error listing wells from dataset folder: {wells_error}")
                        
                        return {"status": "success", "message": f"Loaded dataset_files (Dataiku folder) with {len(df)} files"}
                    else:
                        print(f"DATASET_FILES MODE: ❌ Dataset exists but not a folder dataset (no 'path' column)")
                        print(f"DATASET_FILES MODE: Available columns: {list(df.columns)}")
                        # Fall through to try local folder mode
                        
                except Exception as dataiku_err:
                    print(f"DATASET_FILES MODE: ❌ Dataiku dataset folder failed: {dataiku_err}")
                    # Fall through to try local folder mode
                
                # Fallback: Try local folder mode (original logic)
                print("DATASET_FILES MODE: Falling back to local folder mode...")
                
                # Use helper function to find dataset_files directory
                dataset_files_dir = self._find_dataset_files_directory()
                
                if not dataset_files_dir:
                    error_msg = "dataset_files not found as Dataiku dataset folder or local directory"
                    print(f"DATASET_FILES MODE: ❌ {error_msg}")
                    return {"status": "error", "message": error_msg}
                
                dsf_struct = os.path.join(dataset_files_dir, 'structures')
                dsf_wells = os.path.join(dataset_files_dir, 'wells')
                
                print(f"DATASET_FILES MODE: Using local dataset_files directory: {dataset_files_dir}")
                print(f"DATASET_FILES MODE: Structures path: {dsf_struct} -> exists: {os.path.isdir(dsf_struct)}")
                print(f"DATASET_FILES MODE: Wells path: {dsf_wells} -> exists: {os.path.isdir(dsf_wells)}")
                
                if not (os.path.isdir(dsf_struct) or os.path.isdir(dsf_wells)):
                    error_msg = f"Neither structures nor wells directory found in {dataset_files_dir}"
                    print(f"DATASET_FILES MODE: ❌ {error_msg}")
                    return {"status": "error", "message": error_msg}
                
                self.current_dataset = 'dataset_files (local folder)'
                self.current_well_data = None  # use per-well CSVs
                print("FOLDER MODE: Listing wells from local dataset_files...")
                
                try:
                    wells = self._list_wells_from_dataset_files()
                    print(f"FOLDER MODE: Found {len(wells)} wells: {wells[:5] if len(wells) > 5 else wells}...")
                except Exception as wells_error:
                    print(f"FOLDER MODE: ❌ Error listing wells: {wells_error}")
                    return {"status": "error", "message": f"Error listing wells: {str(wells_error)}"}
                
                result = {
                    "status": "success",
                    "dataset_name": self.current_dataset,
                    "wells": wells,
                    "markers": [],
                    "columns": [],
                    "total_rows": None,
                    "message": "Using dataset_files folder mode (per-well CSVs)"
                }
                print(f"FOLDER MODE: ✅ Success - {result['message']}")
                return result

            df = None
            # Try Dataiku dataset first
            try:
                dataset = dataiku.Dataset(dataset_name)
                df = dataset.get_dataframe()
                self.current_dataset = dataset_name
                self.current_well_data = df
            except Exception as di_err:
                print(f"Dataiku load failed for {dataset_name}: {di_err}")
                # Fallback to local CSV if requesting fix_pass_qc
                if str(dataset_name).lower() == 'fix_pass_qc':
                    df = self._load_local_fix_pass_qc()
                    if df is None:
                        raise
                else:
                    raise
            
            # Store current dataset info if not already set by fallback
            if self.current_dataset is None:
                self.current_dataset = dataset_name
            if self.current_well_data is None:
                self.current_well_data = df
            
            # Get basic info - check for different well column names
            wells = []
            for well_col in ['WELL_NAME', 'WELL', 'Well', 'well', 'WELLNAME']:
                if well_col in df.columns:
                    wells = df[well_col].unique().tolist()
                    break
            
            # Get markers - check for different marker column names
            markers = []
            for marker_col in ['MARKER', 'Marker', 'marker', 'FORMATION', 'Formation']:
                if marker_col in df.columns:
                    markers = df[marker_col].unique().tolist()
                    break
                    
            columns = df.columns.tolist()
            
            return {
                "status": "success",
                "dataset_name": dataset_name,
                "wells": wells,
                "markers": markers,
                "columns": columns,
                "total_rows": len(df),
                "message": f"Dataset {dataset_name} selected successfully"
            }
        except Exception as e:
            error_msg = str(e)
            # Make error messages more user-friendly
            if 'dataset does not exist' in error_msg.lower():
                user_msg = f"Dataset '{dataset_name}' does not exist in the project. Please check the dataset name or create the dataset first."
            elif 'unable to fetch schema' in error_msg.lower():
                user_msg = f"Unable to access dataset '{dataset_name}'. The dataset may not exist or you may not have permission to access it."
            elif os.path.isfile(self._local_csv_path('fix_pass_qc.csv')) and str(dataset_name).lower() == 'fix_pass_qc':
                # Provide local CSV hint
                user_msg = "Loaded local CSV for fix_pass_qc failed unexpectedly. Please verify fix_pass_qc.csv format."
            else:
                user_msg = f"Error accessing dataset '{dataset_name}': {error_msg}"
            
            return {"status": "error", "message": user_msg}
    
    def get_well_list(self):
        """Get list of wells from current dataset"""
        try:
            # Dataset folder mode: list wells from dataset folder manifest or local files
            if (self.current_dataset or '').startswith('dataset_files') and self.current_well_data is None:
                if self.dataset_files_manifest is not None:
                    # Use dataset folder manifest (Dataiku mode)
                    wells = self._list_wells_from_dataset_folder(self.dataset_files_manifest)
                else:
                    # Use local files (local folder mode)
                    wells = self._list_wells_from_dataset_files()
                return {"status": "success", "wells": wells, "count": len(wells)}

            if self.current_well_data is None:
                return {"status": "error", "message": "No dataset selected"}
            
            if 'WELL_NAME' not in self.current_well_data.columns:
                return {"status": "error", "message": "WELL_NAME column not found in dataset"}
            
            wells = self.current_well_data['WELL_NAME'].unique().tolist()
            return {
                "status": "success",
                "wells": wells,
                "count": len(wells)
            }
        except Exception as e:
            return {"status": "error", "message": f"Error getting well list: {str(e)}"}
    
    def create_log_plot(self, well_name, selected_intervals=None, structure_context=None):
        """Create log plot for a specific well with optional intervals filtering"""
        try:
            print(f"Creating log plot for well: {well_name}")
            if selected_intervals:
                print(f"Selected intervals: {selected_intervals}")
            if structure_context:
                print(f"Structure context: {structure_context.get('structure_name', 'N/A')}")
        
            # If no dataset is loaded, try to load from dataset_files per-well CSV
            if self.current_well_data is None:
                df_single = self._load_well_csv_from_dataset_files(well_name, structure_context)
                if df_single is None:
                    return {"status": "error", "message": "No dataset selected and no per-well CSV found"}
                # Proceed plotting with this dataframe only
                working_df = df_single
            else:
                working_df = self.current_well_data
        
            # Get well data
            if 'WELL_NAME' in working_df.columns:
                well_data = working_df[working_df['WELL_NAME'] == well_name]
            else:
                well_data = working_df.copy()
            print(f"Found {len(well_data)} rows for well {well_name}")
        
            if well_data.empty:
                # Attempt a per-well CSV fallback if dataset didn't contain this well
                df_fallback = self._load_well_csv_from_dataset_files(well_name, structure_context)
                if df_fallback is None:
                    available_wells = working_df['WELL_NAME'].unique().tolist() if 'WELL_NAME' in working_df.columns else []
                    return {"status": "error", "message": f"No data found for well {well_name}. Available wells: {available_wells}"}
                well_data = df_fallback
                print(f"Loaded per-well CSV for {well_name}: {len(well_data)} rows")
        
            # Filter by intervals if specified
            if selected_intervals and len(selected_intervals) > 0 and 'MARKER' in well_data.columns:
                print(f"Filtering data by selected intervals: {selected_intervals}")
                original_count = len(well_data)
                well_data = well_data[well_data['MARKER'].isin(selected_intervals)]
                print(f"After interval filtering: {len(well_data)} rows (was {original_count})")
            
            # Also support zone-based filtering if provided via request context
            # Note: selected zones are passed at endpoint level (see get_well_plot)
            if hasattr(self, '_tmp_selected_zones'):
                zones = getattr(self, '_tmp_selected_zones') or []
                if zones:
                    # Detect zone column among common variants
                    zone_cols = ['ZONE', 'ZONES', 'ZONE_NAME', 'Zone', 'zone']
                    zone_col = next((zc for zc in zone_cols if zc in well_data.columns), None)
                    if zone_col:
                        print(f"Filtering data by selected zones in column '{zone_col}': {zones}")
                        original_count2 = len(well_data)
                        well_data = well_data[well_data[zone_col].isin(zones)]
                        print(f"After zone filtering: {len(well_data)} rows (was {original_count2})")
            
                if well_data.empty:
                    available_intervals = self.current_well_data[self.current_well_data['WELL_NAME'] == well_name]['MARKER'].unique().tolist()
                    return {"status": "error", "message": f"No data found for well {well_name} in selected intervals {selected_intervals}. Available intervals: {available_intervals}"}
        
            if 'DEPTH' in well_data.columns:
                well_data = well_data.sort_values('DEPTH')
        
            # Check if we have essential columns
            required_cols = ['DEPTH']
            available_cols = [col for col in ['GR', 'RT', 'NPHI', 'RHOB'] if col in well_data.columns]
        
            if not available_cols:
                return {"status": "error", "message": "No log data columns found"}
        
            # Extract markers and ensure cross-plot normalized columns exist
            df_marker = extract_markers_with_mean_depth(well_data)
            well_data_normalized = self._ensure_crossplot_norms(well_data)

            # Create dashboard plot with Marker, GR, RT, and combined RHOB+NPHI
            fig = self._plot_dashboard_log(well_data_normalized)
        
            if selected_intervals and len(selected_intervals) > 0:
                current_title = fig.layout.title.text if fig.layout.title else f"Well Log - {well_name}"
                interval_info = f" (Intervals: {', '.join(selected_intervals)})"
                new_title = (current_title or "") + interval_info
                fig.update_layout(title={"text": new_title, "x": 0.5, "xanchor": "center", "y": 0.98, "yanchor": "top", "pad": {"b": 10}})
            
                if 'DEPTH' in well_data_normalized.columns:
                    depth_range = f" | Depth: {well_data_normalized['DEPTH'].min():.1f} - {well_data_normalized['DEPTH'].max():.1f} ft"
                    combined_title = (fig.layout.title.text or "") + depth_range
                    fig.update_layout(title={"text": combined_title, "x": 0.5, "xanchor": "center", "y": 0.98, "yanchor": "top", "pad": {"b": 10}})
        
            return {
                "status": "success",
                "figure": fig.to_dict(),
                "well_name": well_name,
                "selected_intervals": selected_intervals or [],
                "data_points": len(well_data_normalized)
            }
        except Exception as e:
            print(f"Error creating log plot: {str(e)}")
            traceback.print_exc()
            return {"status": "error", "message": f"Error creating log plot: {str(e)}"}
    
    def get_markers_list(self):
        """Get list of markers from current dataset"""
        try:
            if self.current_well_data is None:
                return {"status": "error", "message": "No dataset selected"}
            
            if 'MARKER' not in self.current_well_data.columns:
                return {"status": "error", "message": "MARKER column not found"}
            
            # Get unique markers and filter out NaN/null values
            markers_series = self.current_well_data['MARKER'].dropna().unique()
            markers = [str(marker) for marker in markers_series if pd.notna(marker) and str(marker).strip() != '']
            
            return {
                "status": "success",
                "markers": markers,
                "count": len(markers)
            }
        except Exception as e:
            return {"status": "error", "message": f"Error getting markers: {str(e)}"}

    def get_zones_list(self):
        """Get list of zones from current dataset (supports multiple possible column names)"""
        try:
            if self.current_well_data is None:
                return {"status": "error", "message": "No dataset selected"}

            zone_cols = ['ZONE', 'ZONES', 'ZONE_NAME', 'Zone', 'zone']
            found_col = None
            for zc in zone_cols:
                if zc in self.current_well_data.columns:
                    found_col = zc
                    break

            if not found_col:
                return {"status": "success", "zones": [], "count": 0}

            zones_series = self.current_well_data[found_col].dropna().unique()
            zones = [str(z) for z in zones_series if pd.notna(z) and str(z).strip() != '']

            return {
                "status": "success",
                "zones": zones,
                "count": len(zones),
                "column": found_col
            }
        except Exception as e:
            return {"status": "error", "message": f"Error getting zones: {str(e)}"}

    # -----------------------------
    # Additional data/params helpers
    # -----------------------------
    def get_calculation_parameters(self, calculation_type):
        """Return parameter definitions for a calculation type"""
        try:
            parameter_definitions = {
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
                "rgsa": {
                    "title": "RGSA Parameters",
                    "parameters": [
                        {"name": "SLIDING_WINDOW", "type": "int", "default": 100, "label": "Sliding Window", "min": 20, "max": 500},
                        {"name": "GR", "type": "select", "default": "GR", "label": "Gamma Ray Log", "options": ["GR", "CGR", "SGR"]},
                        {"name": "RES", "type": "select", "default": "RT", "label": "Resistivity Log", "options": ["RT", "ILD", "LLD"]}
                    ]
                },
                "dgsa": {
                    "title": "DGSA Parameters",
                    "parameters": [
                        {"name": "SLIDING_WINDOW", "type": "int", "default": 100, "label": "Sliding Window", "min": 20, "max": 500},
                        {"name": "GR", "type": "select", "default": "GR", "label": "Gamma Ray Log", "options": ["GR", "CGR", "SGR"]},
                        {"name": "DENS", "type": "select", "default": "RHOB", "label": "Density Log", "options": ["RHOB"]}
                    ]
                },
                "ngsa": {
                    "title": "NGSA Parameters",
                    "parameters": [
                        {"name": "SLIDING_WINDOW", "type": "int", "default": 100, "label": "Sliding Window", "min": 20, "max": 500},
                        {"name": "GR", "type": "select", "default": "GR", "label": "Gamma Ray Log", "options": ["GR", "CGR", "SGR"]},
                        {"name": "NEUT", "type": "select", "default": "NPHI", "label": "Neutron Log", "options": ["NPHI"]}
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
                "rwa": {
                    "title": "RWA Calculation Parameters",
                    "parameters": [
                        {"name": "method", "type": "select", "default": "full", "label": "RWA Method", "options": ["full", "simple", "tar"]},
                        {"name": "cutoff_porosity", "type": "float", "default": 0.08, "label": "Cutoff Porosity", "min": 0.01, "max": 0.5},
                        {"name": "cutoff_vsh", "type": "float", "default": 0.5, "label": "Cutoff VSH", "min": 0.0, "max": 1.0}
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
            }

            if calculation_type not in parameter_definitions:
                return {"status": "error", "message": f"Unknown calculation type: {calculation_type}"}

            return {
                "status": "success",
                "calculation_type": calculation_type,
                "parameters": parameter_definitions[calculation_type]
            }
        except Exception as e:
            return {"status": "error", "message": f"Error getting parameters: {str(e)}"}

    def get_available_columns(self):
        try:
            if self.current_well_data is None:
                return {"status": "error", "message": "No dataset selected"}
            return {"status": "success", "columns": self.current_well_data.columns.tolist()}
        except Exception as e:
            return {"status": "error", "message": f"Error getting columns: {str(e)}"}

    def get_dataset_info(self):
        try:
            if self.current_well_data is None:
                return {"status": "error", "message": "No dataset selected"}
            info = {
                "dataset_name": self.current_dataset,
                "total_rows": len(self.current_well_data),
                "columns": self.current_well_data.columns.tolist(),
                "wells": self.current_well_data['WELL_NAME'].unique().tolist() if 'WELL_NAME' in self.current_well_data.columns else [],
                "markers": self.current_well_data['MARKER'].unique().tolist() if 'MARKER' in self.current_well_data.columns else [],
                "depth_range": {
                    "min": float(self.current_well_data['DEPTH'].min()) if 'DEPTH' in self.current_well_data.columns else None,
                    "max": float(self.current_well_data['DEPTH'].max()) if 'DEPTH' in self.current_well_data.columns else None
                }
            }
            return {"status": "success", "info": info}
        except Exception as e:
            return {"status": "error", "message": f"Error getting dataset info: {str(e)}"}

    def validate_calculation_requirements(self, calculation_type):
        try:
            if self.current_well_data is None:
                return {"status": "error", "message": "No dataset selected"}
            requirements = {
                "vsh": ["GR"],
                "porosity": ["NPHI", "RHOB"],
                "gsa": ["GR", "RT", "NPHI", "RHOB"],
                "sw": ["RT", "PHIE"],
                "rwa": ["RT", "PHIE", "VSH"],
                "normalization": ["GR", "MARKER"]
            }
            if calculation_type not in requirements:
                return {"status": "error", "message": f"Unknown calculation type: {calculation_type}"}
            required_cols = requirements[calculation_type]
            missing = [c for c in required_cols if c not in self.current_well_data.columns]
            if missing:
                return {
                    "status": "error",
                    "message": f"Missing required columns: {', '.join(missing)}",
                    "missing_columns": missing,
                    "required_columns": required_cols
                }
            return {
                "status": "success",
                "message": f"All required columns available for {calculation_type}",
                "required_columns": required_cols
            }
        except Exception as e:
            return {"status": "error", "message": f"Error validating requirements: {str(e)}"}

    def save_results_to_new_dataset(self, dataset_name, data_dict=None):
        try:
            if data_dict is None and self.current_well_data is None:
                return {"status": "error", "message": "No data to save"}
            df_to_save = pd.DataFrame(data_dict) if data_dict else self.current_well_data
            new_dataset = dataiku.Dataset(dataset_name)
            new_dataset.write_with_schema(df_to_save)
            return {
                "status": "success",
                "message": f"Data saved to dataset '{dataset_name}' successfully",
                "dataset_name": dataset_name,
                "rows_saved": len(df_to_save)
            }
        except Exception as e:
            return {"status": "error", "message": f"Error saving dataset: {str(e)}"}
    
    def _process_interval_specific_params(self, params, selected_intervals):
        """Process interval-specific parameters into a unified format"""
        if not selected_intervals or not isinstance(params, dict):
            return params
        
        # If params contains interval-specific data
        if 'intervals' in params:
            interval_params = params['intervals']
            # For now, use the first interval's parameters as default
            # This can be enhanced to handle multi-interval calculations
            first_interval = selected_intervals[0] if selected_intervals else None
            if first_interval and first_interval in interval_params:
                return interval_params[first_interval]
        
        return params
    
    def run_calculation(self, calculation_type, params, output_dataset_name=None):
        """Run calculation with parameters on current dataset"""
        try:
            if self.current_well_data is None:
                return {"status": "error", "message": "No dataset selected"}
            
            # Process interval-specific parameters
            processed_params = self._process_interval_specific_params(params, self.selected_intervals)
            
            # Make a copy of current data
            df = self.current_well_data.copy()
            # Apply well filtering if selection exists
            if getattr(self, 'selected_wells', None):
                well_col = next((c for c in ['WELL_NAME','WELL','Well','well','WELLNAME'] if c in df.columns), None)
                if well_col:
                    df = df[df[well_col].isin(self.selected_wells)]
            
            # Run calculation based on type
            if calculation_type == "vsh":
                result_df = self._run_vsh_calculation(df, processed_params)
            elif calculation_type == "porosity":
                result_df = self._run_porosity_calculation(df, processed_params)
            elif calculation_type == "gsa":
                result_df = self._run_gsa_calculation(df, processed_params)
            elif calculation_type == "rgsa":
                result_df = self._run_rgsa_calculation(df, processed_params)
            elif calculation_type == "dgsa":
                result_df = self._run_dgsa_calculation(df, processed_params)
            elif calculation_type == "ngsa":
                result_df = self._run_ngsa_calculation(df, processed_params)
            elif calculation_type == "rgbe_rpbe":
                result_df = self._run_rgbe_rpbe_calculation(df, processed_params)
            elif calculation_type == "rt_r0":
                result_df = self._run_rt_r0_calculation(df, processed_params)
            elif calculation_type == "swgrad":
                result_df = self._run_swgrad_calculation(df, processed_params)
            elif calculation_type == "dns_dnsv":
                result_df = self._run_dns_dnsv_calculation(df, processed_params)
            elif calculation_type == "sw":
                result_df = self._run_sw_calculation(df, processed_params)
            elif calculation_type == "rwa":
                result_df = self._run_rwa_calculation(df, processed_params)
            elif calculation_type == "normalization":
                result_df = self._run_interval_normalization(df, processed_params)
            elif calculation_type == "trim_data":
                result_df = self._run_trim_data_calculation(df, processed_params)
            else:
                return {"status": "error", "message": f"Unknown calculation type: {calculation_type}"}
            
            # Update current data
            self.current_well_data = result_df
            
            return {
                "status": "success",
                "message": f"{calculation_type.upper()} calculation completed",
                "calculation_type": calculation_type,
                "rows_processed": len(result_df)
            }
        except Exception as e:
            return {"status": "error", "message": f"Error running calculation: {str(e)}"}

    def _run_trim_data_calculation(self, df, params):
        """Trim data by depth range, intervals, or quality filter.
        params keys (from UI):
          - start_depth: float
          - end_depth: float
          - method: 'depth_range' | 'interval_based' | 'quality_filter'
          - required_columns: optional list for quality filter
        Uses self.selected_intervals and self.selected_wells where relevant.
        """
        try:
            method = (params or {}).get('method', 'depth_range')
            start_depth = params.get('start_depth')
            end_depth = params.get('end_depth')
            required_cols = params.get('required_columns') or ['GR','RT','NPHI','RHOB']

            # Determine depth column
            depth_col = 'DEPTH' if 'DEPTH' in df.columns else ('DEPT' if 'DEPT' in df.columns else None)
            if not depth_col:
                raise ValueError("No DEPTH/DEPT column in dataset")

            out = df.copy()
            if method == 'depth_range':
                # numeric conversion
                if start_depth is None and end_depth is None:
                    raise ValueError("Please provide start_depth/end_depth for depth_range method")
                if start_depth is not None:
                    start_depth = float(start_depth)
                if end_depth is not None:
                    end_depth = float(end_depth)
                if start_depth is not None and end_depth is not None and start_depth > end_depth:
                    start_depth, end_depth = end_depth, start_depth
                if start_depth is not None:
                    out = out[out[depth_col] >= start_depth]
                if end_depth is not None:
                    out = out[out[depth_col] <= end_depth]
            elif method == 'interval_based':
                intervals = self.selected_intervals or params.get('intervals') or []
                if not intervals:
                    raise ValueError("No intervals selected for interval_based method")
                marker_col = next((c for c in ['MARKER','Marker','FORMATION','Formation'] if c in out.columns), None)
                if not marker_col:
                    raise ValueError("No marker column found for interval_based method")
                out = out[out[marker_col].isin(intervals)]
            elif method == 'quality_filter':
                # Keep continuous block between first and last valid rows across required columns
                valid_ranges = []
                for col in required_cols:
                    if col in out.columns:
                        series = pd.to_numeric(out[col], errors='coerce')
                        idx = out[(series != -999.0) & (~series.isna())].index
                        if len(idx) > 0:
                            valid_ranges.append((idx.min(), idx.max()))
                if valid_ranges:
                    start = min(s for s, _ in valid_ranges)
                    end = max(e for _, e in valid_ranges)
                    out = out.loc[start:end]
            else:
                raise ValueError(f"Unknown trim method: {method}")

            # Keep sorted by depth
            out = out.sort_values(depth_col)
            return out
        except Exception as e:
            raise Exception(f"Trim Data error: {str(e)}")
    
    def _run_vsh_calculation(self, df, params):
        """Run VSH calculation"""
        try:
            gr_ma = float(params.get('GR_MA', 30))
            gr_sh = float(params.get('GR_SH', 120))
            input_log = params.get('input_log', 'GR')
            output_log = params.get('output_log', 'VSH_GR')
            
            if input_log not in df.columns:
                raise ValueError(f"Input log {input_log} not found in dataset")
            
            # Simple VSH calculation
            df[output_log] = (df[input_log] - gr_ma) / (gr_sh - gr_ma)
            df[output_log] = df[output_log].clip(0, 1)
            
            return df
        except Exception as e:
            raise Exception(f"VSH calculation error: {str(e)}")
    
    def _run_porosity_calculation(self, df, params):
        """Run porosity calculation"""
        try:
            method = params.get('PHIE_METHOD', 'density')
            rho_ma = float(params.get('RHO_MA', 2.65))
            rho_fl = float(params.get('RHO_FL', 1.0))
            
            if method == 'density' and 'RHOB' in df.columns:
                df['PHIE'] = (rho_ma - df['RHOB']) / (rho_ma - rho_fl)
                df['PHIE'] = df['PHIE'].clip(0, 1)
            
            return df
        except Exception as e:
            raise Exception(f"Porosity calculation error: {str(e)}")
    
    def _run_gsa_calculation(self, df, params):
        """Run GSA calculation"""
        try:
            # Simple GSA implementation
            required_cols = ['GR', 'RT', 'NPHI', 'RHOB']
            missing_cols = [col for col in required_cols if col not in df.columns]
            if missing_cols:
                raise ValueError(f"Missing required columns: {missing_cols}")
            
            # Simple moving averages as GSA approximation
            window = params.get('window_size', 50)
            df['RGSA'] = df['RT'].rolling(window=window, center=True).mean()
            df['NGSA'] = df['NPHI'].rolling(window=window, center=True).mean()
            df['DGSA'] = df['RHOB'].rolling(window=window, center=True).mean()
            
            return df
        except Exception as e:
            raise Exception(f"GSA calculation error: {str(e)}")

    def _run_rgsa_calculation(self, df, params):
        try:
            return process_all_wells_rgsa(df, params, target_intervals=self.selected_intervals, target_zones=None)
        except Exception as e:
            raise Exception(f"RGSA calculation error: {str(e)}")

    def _run_dgsa_calculation(self, df, params):
        try:
            return process_all_wells_dgsa(df, params, target_intervals=self.selected_intervals, target_zones=None)
        except Exception as e:
            raise Exception(f"DGSA calculation error: {str(e)}")

    def _run_ngsa_calculation(self, df, params):
        try:
            return process_all_wells_ngsa(df, params, target_intervals=self.selected_intervals, target_zones=None)
        except Exception as e:
            raise Exception(f"NGSA calculation error: {str(e)}")

    def _run_rgbe_rpbe_calculation(self, df, params):
        try:
            return process_rgbe_rpbe(df, params)
        except Exception as e:
            raise Exception(f"RGBE-RPBE calculation error: {str(e)}")

    def _run_rt_r0_calculation(self, df, params):
        try:
            return process_rt_r0(df, params)
        except Exception as e:
            raise Exception(f"RT-R0 calculation error: {str(e)}")

    def _run_swgrad_calculation(self, df, params):
        try:
            return process_swgrad(df)
        except Exception as e:
            raise Exception(f"SWGRAD calculation error: {str(e)}")

    def _run_dns_dnsv_calculation(self, df, params):
        try:
            return process_dns_dnsv(df, params)
        except Exception as e:
            raise Exception(f"DNS-DNSV calculation error: {str(e)}")
    
    def _run_sw_calculation(self, df, params):
        """Run water saturation calculation"""
        try:
            rw = float(params.get('rw', 0.1))
            a = float(params.get('a', 1.0))
            m = float(params.get('m', 2.0))
            n = float(params.get('n', 2.0))
            
            if 'RT' not in df.columns or 'PHIE' not in df.columns:
                raise ValueError("RT and PHIE columns required for SW calculation")
            
            # Archie's equation
            df['SW'] = ((a * rw) / (df['RT'] * df['PHIE'] ** m)) ** (1/n)
            df['SW'] = df['SW'].clip(0, 1)
            
            return df
        except Exception as e:
            raise Exception(f"SW calculation error: {str(e)}")
    
    def _run_interval_normalization(self, df, params):
        """Run interval normalization"""
        try:
            log_in_col = params.get('LOG_IN', 'GR')
            log_out_col = params.get('LOG_OUT', 'GR_NORM')
            intervals = params.get('intervals', [])
            
            if log_in_col not in df.columns:
                raise ValueError(f"Input log {log_in_col} not found")
            
            # Initialize output column
            df[log_out_col] = df[log_in_col].copy()
            
            # Simple normalization for each interval
            for interval in intervals:
                interval_mask = df['MARKER'] == interval
                if interval_mask.sum() > 0:
                    interval_data = df.loc[interval_mask, log_in_col]
                    # Simple min-max normalization
                    min_val = interval_data.min()
                    max_val = interval_data.max()
                    if max_val > min_val:
                        df.loc[interval_mask, log_out_col] = (interval_data - min_val) / (max_val - min_val)
            
            return df
        except Exception as e:
            raise Exception(f"Normalization error: {str(e)}")
    
    def create_plot_for_calculation(self, calculation_type, well_name=None):
        """Create plot based on calculation type"""
        try:
            if self.current_well_data is None:
                return {"status": "error", "message": "No dataset selected"}
            
            # Filter by well if specified
            if well_name:
                df = self.current_well_data[self.current_well_data['WELL_NAME'] == well_name]
                if df.empty:
                    return {"status": "error", "message": f"No data found for well {well_name}"}
            else:
                df = self.current_well_data
            
            # Create plot based on calculation type
            if calculation_type in ["default", "log"]:
                return self._create_default_log_plot(df)
            elif calculation_type == "vsh":
                return self._create_vsh_plot(df)
            elif calculation_type == "porosity":
                return self._create_porosity_plot(df)
            elif calculation_type == "gsa":
                return self._create_gsa_plot(df)
            elif calculation_type in ["rgsa", "dgsa", "ngsa"]:
                # Map specific variants to the general GSA plot
                return self._create_gsa_plot(df)
            elif calculation_type == "normalization":
                return self._create_normalization_plot(df)
            elif calculation_type == "sw":
                return self._create_sw_plot(df)
            elif calculation_type == "rwa":
                return self._create_rwa_plot(df)
            elif calculation_type == "smoothing":
                return self._create_smoothing_plot(df)
            else:
                return {"status": "error", "message": f"Unknown plot type: {calculation_type}"}
                
        except Exception as e:
            return {"status": "error", "message": f"Error creating plot: {str(e)}"}
    
    def _create_default_log_plot(self, df):
        """Create default log plot"""
        try:
            # Ensure cross-plot normalized columns exist
            df_normalized = self._ensure_crossplot_norms(df)
            # Create dashboard-style plot
            fig = self._plot_dashboard_log(df_normalized)
            
            return {"status": "success", "figure": fig.to_dict()}
        except Exception as e:
            return {"status": "error", "message": f"Error creating default plot: {str(e)}"}

    def _plot_dashboard_log(self, df):
        """Render Marker, GR, RT, and combined RHOB+NPHI tracks.
        - Track 1: Marker labels along depth (if MARKER exists), otherwise just depth reference
        - Track 2: GR curve
        - Track 3: RT curve (log scale if values positive)
        - Track 4: RHOB and NPHI in the same track as two lines
        """
        import plotly.graph_objects as go
        from plotly.subplots import make_subplots

        # Prepare depth and available logs
        depth_col = 'DEPTH' if 'DEPTH' in df.columns else ('DEPT' if 'DEPT' in df.columns else None)
        if depth_col is None:
            # Fallback to existing default if no depth
            return plot_log_default(df)

        y = pd.to_numeric(df[depth_col], errors='coerce')
        # Build subplots: 4 columns
        fig = make_subplots(
            rows=1, cols=4,
            subplot_titles=('Marker', 'GR', 'RT', 'RHOB & NPHI'),
            shared_yaxes=True,
            horizontal_spacing=0.02
        )

        # Track 1: Marker annotations or placeholder
        if 'MARKER' in df.columns:
            try:
                markers_df = extract_markers_with_mean_depth(df)
            except Exception:
                markers_df = df[['MARKER', depth_col]].dropna().groupby('MARKER', as_index=False)[depth_col].mean()
            # Draw faint vertical baseline plus text labels
            fig.add_trace(
                go.Scatter(x=[0, 0], y=[y.min(), y.max()], mode='lines', line=dict(color='lightgray'), showlegend=False),
                row=1, col=1
            )
            for _, r in markers_df.iterrows():
                d = r[depth_col]
                name = str(r['MARKER'])
                fig.add_trace(
                    go.Scatter(x=[0], y=[d], mode='markers+text', text=[name],
                                textposition='middle right', marker=dict(size=6), showlegend=False),
                    row=1, col=1
                )
        else:
            # Just add depth baseline
            fig.add_trace(go.Scatter(x=[0, 0], y=[y.min(), y.max()], mode='lines', showlegend=False), row=1, col=1)

        # Track 2: GR
        if 'GR' in df.columns:
            fig.add_trace(go.Scatter(x=pd.to_numeric(df['GR'], errors='coerce'), y=y, mode='lines', name='GR', line=dict(color='#2ca02c')), row=1, col=2)

        # Track 3: RT
        if 'RT' in df.columns:
            fig.add_trace(go.Scatter(x=pd.to_numeric(df['RT'], errors='coerce'), y=y, mode='lines', name='RT', line=dict(color='#1f77b4')), row=1, col=3)
            # Apply log-x on RT track when positive
            try:
                if pd.to_numeric(df['RT'], errors='coerce').gt(0).any():
                    fig.update_xaxes(type='log', row=1, col=3)
            except Exception:
                pass

        # Track 4: RHOB + NPHI combined
        if 'RHOB' in df.columns:
            fig.add_trace(go.Scatter(x=pd.to_numeric(df['RHOB'], errors='coerce'), y=y, mode='lines', name='RHOB', line=dict(color='#9467bd', dash='solid')), row=1, col=4)
        if 'NPHI' in df.columns:
            fig.add_trace(go.Scatter(x=pd.to_numeric(df['NPHI'], errors='coerce'), y=y, mode='lines', name='NPHI', line=dict(color='#ff7f0e', dash='solid')), row=1, col=4)

        # Reverse depth axis and tidy layout
        dmin, dmax = float(y.min()), float(y.max())
        pad = (dmax - dmin) * 0.02 if dmax > dmin else 0
        fig.update_yaxes(autorange='reversed', range=[dmax + pad, dmin - pad])
        fig.update_layout(
            height=820,
            margin=dict(t=80, b=90, l=60, r=20),
            title={"text": "Well Log Dashboard", "x": 0.5, "xanchor": "center", "y": 0.98, "yanchor": "top", "pad": {"b": 12}},
            legend_orientation='h', legend_yanchor='top', legend_y=-0.12
        )
        return fig
    
    def _create_vsh_plot(self, df):
        """Create VSH plot"""
        try:
            # Show in the same dashboard layout for consistency
            df_normalized = self._ensure_crossplot_norms(df)
            fig = self._plot_dashboard_log(df_normalized)
            return {"status": "success", "figure": fig.to_dict()}
        except Exception as e:
            return {"status": "error", "message": f"Error creating VSH plot: {str(e)}"}
    
    def _create_porosity_plot(self, df):
        """Create porosity plot"""
        try:
            # Render using the unified dashboard layout
            df_normalized = self._ensure_crossplot_norms(df)
            fig = self._plot_dashboard_log(df_normalized)
            return {"status": "success", "figure": fig.to_dict()}
        except Exception as e:
            return {"status": "error", "message": f"Error creating porosity plot: {str(e)}"}
    
    def _create_gsa_plot(self, df):
        """Create GSA plot"""
        try:
            # Accept plot if any GSA-related column exists
            gsa_cols = [c for c in ['RGSA', 'NGSA', 'DGSA'] if c in df.columns]
            if len(gsa_cols) == 0:
                return {"status": "error", "message": "Missing GSA data"}
            fig = plot_gsa_main(df)
            return {"status": "success", "figure": fig.to_dict()}
        except Exception as e:
            return {"status": "error", "message": f"Error creating GSA plot: {str(e)}"}
    
    def _create_normalization_plot(self, df):
        """Create normalization plot"""
        try:
            if 'GR_NORM' not in df.columns:
                return {"status": "error", "message": "No normalization data found"}
            fig = plot_normalization(df)
            
            return {"status": "success", "figure": fig.to_dict()}
        except Exception as e:
            return {"status": "error", "message": f"Error creating normalization plot: {str(e)}"}
    
    def _create_sw_plot(self, df):
        """Create water saturation plot"""
        try:
            # Use the unified dashboard layout
            df_normalized = self._ensure_crossplot_norms(df)
            fig = self._plot_dashboard_log(df_normalized)
            return {"status": "success", "figure": fig.to_dict()}
        except Exception as e:
            return {"status": "error", "message": f"Error creating SW plot: {str(e)}"}

    def _create_rwa_plot(self, df):
        """Create RWA plot"""
        try:
            # Use the unified dashboard layout
            df_normalized = self._ensure_crossplot_norms(df)
            fig = self._plot_dashboard_log(df_normalized)
            return {"status": "success", "figure": fig.to_dict()}
        except Exception as e:
            return {"status": "error", "message": f"Error creating RWA plot: {str(e)}"}

    def _create_smoothing_plot(self, df):
        """Create smoothing plot"""
        try:
            required_cols = ['GR', 'GR_MovingAvg_5', 'GR_MovingAvg_10']
            if not all(col in df.columns for col in required_cols):
                return {"status": "error", "message": "Missing smoothing data"}
            fig = plot_smoothing(df, extract_markers_with_mean_depth(df), df)
            return {"status": "success", "figure": fig.to_dict()}
        except Exception as e:
            return {"status": "error", "message": f"Error creating smoothing plot: {str(e)}"}

# Global instance for webapp session management
_analysis_instance = None

def get_analysis_instance():
    """Get or create analysis instance"""
    global _analysis_instance
    if _analysis_instance is None:
        _analysis_instance = WellLogAnalysis()
    return _analysis_instance

def find_raw_data_dataset(structure_name=None):
    """Helper function to find the main raw data dataset, optionally for a specific structure"""
    try:
        project = dataiku.api_client().get_project(dataiku.default_project_key())
        dataset_names = [ds['name'] for ds in project.list_datasets()]
        
        print(f"Available datasets in project: {dataset_names}")
        
    # If structure name provided, look for structure-specific dataset first
        if structure_name:
            structure_lower = structure_name.lower()
            
            # Priority 1: raw_well_data_<structure>
            target_name = f'raw_well_data_{structure_lower}'
            for name in dataset_names:
                if name.lower() == target_name:
                    print(f"Found structure-specific dataset: {name}")
                    return name
            
            # Priority 2: raw_data_well_<structure> (legacy naming)
            target_name = f'raw_data_well_{structure_lower}'
            for name in dataset_names:
                if name.lower() == target_name:
                    print(f"Found structure-specific dataset: {name}")
                    return name
            
            # Priority 3: any dataset containing structure name and 'raw'/'well'/'data'
            for name in dataset_names:
                if (structure_lower in name.lower() and 
                    ('raw' in name.lower() or 'well' in name.lower() or 'data' in name.lower())):
                    print(f"Found matching dataset with structure name: {name}")
                    return name
        
        # Fallback to general dataset discovery - prioritize dataset_files/dataset_qc, then fix_pass_qc
        search_patterns = [
            'dataset_files',
            'dataset_qc',
            'fix_pass_qc',
            'raw_data_well',
            'raw_well_data', 
            'well_data',
            'data_well'
        ]
        
        for pattern in search_patterns:
            # Exact match first
            for name in dataset_names:
                if name.lower() == pattern:
                    print(f"Found exact match dataset: {name}")
                    return name
            
            # Partial match
            for name in dataset_names:
                if pattern in name.lower():
                    print(f"Found partial match dataset: {name}")
                    return name
        
        # If no specific pattern found, try any dataset with 'well' or 'data' in name
        for name in dataset_names:
            if 'well' in name.lower() or 'data' in name.lower():
                print(f"Found fallback dataset: {name}")
                return name
                
        print("No suitable dataset found")
        return None
    except Exception as e:
        print(f"Error finding raw data dataset: {str(e)}")
        # Try to get any available dataset as absolute fallback
        try:
            project = dataiku.api_client().get_project(dataiku.default_project_key())
            dataset_names = [ds['name'] for ds in project.list_datasets()]
            if dataset_names:
                fallback_dataset = dataset_names[0]  # Use first available dataset
                print(f"Using fallback dataset: {fallback_dataset}")
                return fallback_dataset
        except Exception as fallback_error:
            print(f"Error getting fallback dataset: {fallback_error}")
        return None

# -----------------------------
# Structures utilities
# -----------------------------
def _scan_structures_folder():
    try:
        base_dir = os.path.dirname(__file__)
        # Prefer scanning dataset_files/structures if present, else fallback to webapp local structures
        dsf_root = os.path.join(base_dir, 'dataset_files', 'structures')
        root = dsf_root if os.path.isdir(dsf_root) else os.path.join(base_dir, 'structures')
        fields = []
        total_structures = 0
        if not os.path.isdir(root):
            return {"fields": [], "total_fields": 0, "total_structures": 0}
        
        # If scanning dataset_files, we can directly enumerate field > structure folders > well CSVs
        if os.path.isdir(dsf_root):
            for field_name in sorted(os.listdir(dsf_root)):
                field_path = os.path.join(dsf_root, field_name)
                if not os.path.isdir(field_path):
                    continue
                structures = []
                # Pre-index any structure .xlsx files in the field root for easy lookup
                xlsx_map = {}
                try:
                    for item in os.listdir(field_path):
                        if item.lower().endswith('.xlsx'):
                            key = os.path.splitext(item)[0].lower()
                            xlsx_map[key] = item
                except Exception:
                    pass
                # Each subfolder under field is a structure containing well CSVs
                for struct_dir in sorted(os.listdir(field_path)):
                    struct_path = os.path.join(field_path, struct_dir)
                    if not os.path.isdir(struct_path):
                        continue
                    struct_key = struct_dir.lower()
                    # Preserve folder naming as provided (e.g., 'abab')
                    struct_display = struct_dir
                    # List wells by CSV files inside the structure folder (recursive)
                    wells = []
                    try:
                        for r, _d, files in os.walk(struct_path):
                            for f in files:
                                if f.lower().endswith('.csv'):
                                    wells.append(os.path.splitext(f)[0])
                    except Exception:
                        pass
                    wells = sorted(wells)
                    file_name = xlsx_map.get(struct_key)
                    web_file_path = f"/dataset_files/structures/{field_name}/{file_name}" if file_name else None
                    info = {
                        "structure_name": struct_display,
                        "field_name": field_name,
                        "file_path": web_file_path,
                        "wells_count": len(wells),
                        "wells": wells,
                        "total_records": 0,
                        "columns": [],
                        "intervals": []
                    }
                    structures.append(info)
                if structures:
                    total_structures += len(structures)
                    fields.append({
                        "field_name": field_name,
                        "structures_count": len(structures),
                        "structures": structures
                    })
            return {"fields": fields, "total_fields": len(fields), "total_structures": total_structures}
        
        # Try to get current dataset wells to enrich structures with availability info
        analysis = None
        try:
            analysis = get_analysis_instance()
        except Exception:
            analysis = None
        current_df = getattr(analysis, 'current_well_data', None) if analysis else None
        well_col = None
        if current_df is not None and isinstance(current_df, pd.DataFrame) and not current_df.empty:
            for c in ['WELL_NAME', 'WELL', 'Well', 'well']:
                if c in current_df.columns:
                    well_col = c
                    break
        # Simple mapping from structure name to well name prefix (extend as needed)
        structure_to_prefix = {
            'abab': 'abb',  # ABAB structure maps to ABB well prefix (e.g., ABB-036)
        }
        for fname in sorted(os.listdir(root)):
            fpath = os.path.join(root, fname)
            if not os.path.isdir(fpath):
                continue
            structures = []
            for entry in sorted(os.listdir(fpath)):
                if entry.lower().endswith('.xlsx'):
                    web_path = f"/structures/{fname}/{entry}"
                    structure_name = os.path.splitext(entry)[0]
                    # Default structure info
                    info = {
                        "structure_name": structure_name,
                        "field_name": fname.capitalize(),
                        "file_path": web_path,
                        "wells_count": 0,
                        "wells": [],
                        "total_records": 0,
                        "columns": [],
                        "intervals": []
                    }
                    # If we have a loaded dataset, try to detect wells for this structure
                    if current_df is not None and well_col is not None:
                        key = structure_name.lower()
                        prefix = structure_to_prefix.get(key)
                        if prefix:
                            # Case-insensitive startswith or token match (e.g., ABB-)
                            wells_series = current_df[well_col].astype(str)
                            mask = wells_series.str.upper().str.startswith(prefix.upper()) | wells_series.str.upper().str.contains(rf"\b{prefix.upper()}-", regex=True)
                            wells = sorted(wells_series[mask].unique().tolist())
                            if wells:
                                info["wells"] = wells
                                info["wells_count"] = len(wells)
                    structures.append(info)
            if structures:
                total_structures += len(structures)
                fields.append({
                    "field_name": fname.capitalize(),
                    "structures_count": len(structures),
                    "structures": structures
                })
        return {"fields": fields, "total_fields": len(fields), "total_structures": total_structures}
    except Exception:
        traceback.print_exc()
        return {"fields": [], "total_fields": 0, "total_structures": 0}

@app.route('/scan_structures')
def scan_structures():
    try:
        manifest = _scan_structures_folder()
        return json.dumps({"status": "success", **manifest})
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})

def _build_structures_from_dataset_folder():
    """Build structures index from dataset folder manifest if available."""
    try:
        analysis = get_analysis_instance()
        
        # Check if current dataset is dataset_files with manifest available
        if (analysis.current_dataset or '').startswith('dataset_files') and analysis.dataset_files_manifest is not None:
            print("Building structures index from loaded dataset folder manifest...")
            return _build_structures_from_manifest(analysis.dataset_files_manifest)
        
        # Fallback: try to load dataset_files directly  
        ds_info = analysis.get_available_datasets() or {}
        datasets = set([d.lower() for d in ds_info.get('datasets', [])])
        if 'dataset_files' in datasets:
            try:
                print("Loading dataset_files manifest to build structures index...")
                df_idx = dataiku.Dataset('dataset_files').get_dataframe()
                if 'path' in df_idx.columns:
                    return _build_structures_from_manifest(df_idx)
                else:
                    print("dataset_files exists but no 'path' column found")
            except Exception as ds_err:
                print(f"Failed to load dataset_files for structures index: {ds_err}")
        
        return None
        
    except Exception as manifest_err:
        print(f"dataset_files manifest processing failed: {manifest_err}")
        return None

def _build_structures_from_manifest(df_idx):
    """Build structures index from dataset folder manifest DataFrame."""
    try:
        # Build field -> structures -> wells from path strings like '/structures/adera/abab/ABB-106.csv'
        from collections import defaultdict
        fields_map = defaultdict(lambda: defaultdict(set))
        # Keep a representative path per structure for display
        struct_path_sample = defaultdict(dict)
        
        print(f"Processing {len(df_idx)} files from dataset folder manifest...")
        
        for _, row in df_idx.iterrows():
            p = str(row.get('path', '') or '').strip()
            if not p:
                continue
            if p.lower().endswith('.csv'):
                parts = [seg for seg in p.strip('/').split('/') if seg]
                # Find 'structures' anchor, then next two parts are field and structure when present
                try:
                    if 'structures' in [seg.lower() for seg in parts]:
                        idx = [seg.lower() for seg in parts].index('structures')
                        field_name = parts[idx+1] if len(parts) > idx+1 else None
                        struct_name = parts[idx+2] if len(parts) > idx+2 else None
                        file_name = parts[-1]
                        well_name = os.path.splitext(file_name)[0]
                        if field_name and struct_name and well_name:
                            fields_map[field_name][struct_name].add(well_name)
                            if struct_name not in struct_path_sample.get(field_name, {}):
                                struct_path_sample.setdefault(field_name, {})[struct_name] = p
                            print(f"  Added well {well_name} to {field_name}/{struct_name}")
                except Exception as parse_err:
                    print(f"  Error parsing path {p}: {parse_err}")
                    continue
        
        # Convert to expected API shape
        fields_list = []
        total_structures = 0
        for field_name in sorted(fields_map.keys()):
            struct_entries = []
            for struct_name in sorted(fields_map[field_name].keys()):
                wells = sorted(list(fields_map[field_name][struct_name]))
                # Use the first CSV path as a representative path for display purposes
                rep_path = None
                try:
                    rep_path = struct_path_sample.get(field_name, {}).get(struct_name)
                except Exception:
                    rep_path = None
                struct_entries.append({
                    "structure_name": struct_name,
                    "field_name": field_name,
                    "file_path": rep_path,
                    "wells_count": len(wells),
                    "wells": wells,
                    "total_records": 0,
                    "columns": [],
                    "intervals": []
                })
                total_structures += 1
            
            if struct_entries:
                fields_list.append({
                    "field_name": field_name,
                    "structures_count": len(struct_entries),
                    "structures": struct_entries
                })
        
        if fields_list:
            data = {
                "fields": fields_list,
                "total_fields": len(fields_list),
                "total_structures": total_structures
            }
            print(f"Built structures index from dataset folder: {len(fields_list)} fields, {total_structures} structures")
            return json.dumps({"status": "success", "source": "dataset:dataset_files[path]", "data": data})
        else:
            print("No valid structures found in dataset folder manifest")
            return json.dumps({"status": "error", "message": "No structures found in dataset folder"})
            
    except Exception as build_err:
        print(f"Failed building structures from manifest: {build_err}")
        import traceback
        traceback.print_exc()
        return json.dumps({"status": "error", "message": f"Error building structures index: {str(build_err)}"})

@app.route('/get_structures_index')
def get_structures_index():
    """Get the hierarchical index of fields and structures for the sidebar."""
    
    # Priority 1: Try dataset folder manifest (Dataiku dataset folder)
    dataset_folder_result = _build_structures_from_dataset_folder()
    if dataset_folder_result:
        return dataset_folder_result
    
    # Priority 2: Continue with original logic
    try:
        base_dir = os.path.dirname(__file__)

        # 0) Prefer dataset_files/structures if present for field > structure > wells sidebar
        try:
            dsf_root = os.path.join(base_dir, 'dataset_files', 'structures')
            if os.path.isdir(dsf_root):
                manifest = _scan_structures_folder()
                data = {
                    "fields": manifest.get("fields", []),
                    "total_fields": manifest.get("total_fields", 0),
                    "total_structures": manifest.get("total_structures", 0)
                }
                return json.dumps({"status": "success", "source": "dataset_files", "data": data})
        except Exception as scan_err:
            print(f"dataset_files structures scan failed: {scan_err}")

        # 0b) If a Dataiku dataset named 'dataset_files' exists with a 'path' column, build index from it
        try:
            analysis = get_analysis_instance()
            
            # Check if current dataset is dataset_files with manifest available
            if (analysis.current_dataset or '').startswith('dataset_files') and analysis.dataset_files_manifest is not None:
                print("Building structures index from loaded dataset folder manifest...")
                df_idx = analysis.dataset_files_manifest
                return _build_structures_from_manifest(df_idx)
            
            # Fallback: try to load dataset_files directly  
            ds_info = analysis.get_available_datasets() or {}
            datasets = set([d.lower() for d in ds_info.get('datasets', [])])
            if 'dataset_files' in datasets:
                try:
                    print("Loading dataset_files manifest to build structures index...")
                    df_idx = dataiku.Dataset('dataset_files').get_dataframe()
                    if 'path' in df_idx.columns:
                        return _build_structures_from_manifest(df_idx)
                    else:
                        print("dataset_files exists but no 'path' column found")
                except Exception as ds_err:
                    print(f"Failed to load dataset_files for structures index: {ds_err}")
        except Exception as manifest_err:
            print(f"dataset_files manifest processing failed: {manifest_err}")

def _build_structures_from_manifest(df_idx):
    """Build structures index from dataset folder manifest DataFrame."""
    try:
        # Build field -> structures -> wells from path strings like '/structures/adera/abab/ABB-106.csv'
        from collections import defaultdict
        fields_map = defaultdict(lambda: defaultdict(set))
        # Keep a representative path per structure for display
        struct_path_sample = defaultdict(dict)
        
        print(f"Processing {len(df_idx)} files from dataset folder manifest...")
        
        for _, row in df_idx.iterrows():
            p = str(row.get('path', '') or '').strip()
            if not p:
                continue
            if p.lower().endswith('.csv'):
                parts = [seg for seg in p.strip('/').split('/') if seg]
                # Find 'structures' anchor, then next two parts are field and structure when present
                try:
                    if 'structures' in [seg.lower() for seg in parts]:
                        idx = [seg.lower() for seg in parts].index('structures')
                        field_name = parts[idx+1] if len(parts) > idx+1 else None
                        struct_name = parts[idx+2] if len(parts) > idx+2 else None
                        file_name = parts[-1]
                        well_name = os.path.splitext(file_name)[0]
                        if field_name and struct_name and well_name:
                            fields_map[field_name][struct_name].add(well_name)
                            if struct_name not in struct_path_sample.get(field_name, {}):
                                struct_path_sample.setdefault(field_name, {})[struct_name] = p
                            print(f"  Added well {well_name} to {field_name}/{struct_name}")
                except Exception as parse_err:
                    print(f"  Error parsing path {p}: {parse_err}")
                    continue
        
        # Convert to expected API shape
        fields_list = []
        total_structures = 0
        for field_name in sorted(fields_map.keys()):
            struct_entries = []
            for struct_name in sorted(fields_map[field_name].keys()):
                wells = sorted(list(fields_map[field_name][struct_name]))
                # Use the first CSV path as a representative path for display purposes
                rep_path = None
                try:
                    rep_path = struct_path_sample.get(field_name, {}).get(struct_name)
                except Exception:
                    rep_path = None
                struct_entries.append({
                    "structure_name": struct_name,
                    "field_name": field_name,
                    "file_path": rep_path,
                    "wells_count": len(wells),
                    "wells": wells,
                    "total_records": 0,
                    "columns": [],
                                    "intervals": []
                                })
                            if struct_entries:
                                total_structures += len(struct_entries)
                                fields_list.append({
                                    "field_name": field_name,
                                    "structures_count": len(struct_entries),
                                    "structures": struct_entries
                                })
                        if fields_list:
                            data = {
                                "fields": fields_list,
                                "total_fields": len(fields_list),
                                "total_structures": total_structures
                            }
                            return json.dumps({"status": "success", "source": "dataset:dataset_files[path]", "data": data})
                except Exception as ds_err:
                    print(f"Failed building structures from dataset_files dataset: {ds_err}")
        except Exception:
            pass

        # 1) Prefer dataset-driven index from fix_pass_qc if available
        try:
            analysis = get_analysis_instance()
            df = getattr(analysis, 'current_well_data', None)
            if isinstance(df, pd.DataFrame) and not df.empty:
                # Required columns present?
                required_cols = ['STRUKTUR', 'WELL_NAME']
                missing = [c for c in required_cols if c not in df.columns]
                if not missing:
                    export_cols = ['STRUKTUR', 'WELL_NAME', 'DEPTH', 'CALI', 'SP', 'GR', 'RT', 'NPHI', 'RHOB', 'MARKER']
                    present_cols = [c for c in export_cols if c in df.columns]

                    structures_index = []
                    root = os.path.join(base_dir, 'structures', 'Dataset')
                    os.makedirs(root, exist_ok=True)

                    for struktur in sorted(df['STRUKTUR'].dropna().astype(str).unique().tolist()):
                        sdf = df[df['STRUKTUR'].astype(str) == struktur]
                        wells = sorted(sdf['WELL_NAME'].dropna().astype(str).unique().tolist())
                        total_records = int(len(sdf))
                        intervals = []
                        if 'MARKER' in sdf.columns:
                            intervals = sorted(sdf['MARKER'].dropna().astype(str).unique().tolist())

                        # Write per-structure Excel for reference/download
                        safe_name = ''.join(ch for ch in struktur if ch.isalnum() or ch in (' ', '_', '-', '.')).strip().replace(' ', '_')
                        file_name = f"{safe_name}.xlsx"
                        file_fs_path = os.path.join(root, file_name)
                        try:
                            if present_cols:
                                sdf.loc[:, present_cols].to_excel(file_fs_path, index=False)
                            else:
                                sdf.to_excel(file_fs_path, index=False)
                        except Exception as save_err:
                            print(f"Warning: failed to write structure file for {struktur}: {save_err}")
                            file_name = None

                        web_file_path = f"/structures/Dataset/{file_name}" if file_name else None

                        structures_index.append({
                            "structure_name": struktur,
                            "field_name": "Dataset",
                            "file_path": web_file_path,
                            "wells_count": len(wells),
                            "wells": wells,
                            "total_records": total_records,
                            "columns": present_cols if present_cols else df.columns.tolist(),
                            "intervals": intervals
                        })

                    data = {
                        "fields": [{
                            "field_name": "Dataset",
                            "structures_count": len(structures_index),
                            "structures": structures_index
                        }],
                        "total_fields": 1,
                        "total_structures": len(structures_index)
                    }
                    return json.dumps({"status": "success", "source": "dataset", "data": data})
        except Exception as build_err:
            # If dataset build fails, fall back to static files
            print(f"Dataset-driven structures build failed: {build_err}")

        # 2) Fallback: use static index.json if present
        candidates = [
            os.path.join(base_dir, 'data', 'structures', 'index.json'),
            os.path.join(base_dir, 'structures', 'index.json')
        ]
        for p in candidates:
            if os.path.isfile(p):
                with open(p, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                # Enrich with wells availability for ABAB if dataset is loaded
                try:
                    analysis = get_analysis_instance()
                    df = getattr(analysis, 'current_well_data', None)
                    well_col = None
                    if isinstance(df, pd.DataFrame) and not df.empty:
                        for c in ['WELL_NAME', 'WELL', 'Well', 'well']:
                            if c in df.columns:
                                well_col = c
                                break
                    if well_col:
                        for field in data.get('fields', []):
                            for struct in field.get('structures', []):
                                sname = str(struct.get('structure_name', '')).lower()
                                if sname == 'abab':
                                    wells_series = df[well_col].astype(str)
                                    mask = wells_series.str.upper().str.startswith('ABB') | wells_series.str.upper().str.contains(r"\bABB-", regex=True)
                                    wells = sorted(wells_series[mask].unique().tolist())
                                    if wells:
                                        struct['wells'] = wells
                                        struct['wells_count'] = len(wells)
                except Exception:
                    pass
                return json.dumps({"status": "success", "source": p, "data": data})

        # 3) Neither dataset nor static available
        return json.dumps({"status": "error", "message": "No structures index available (dataset missing required columns and no static index.json found)."})
    except Exception as e:
        traceback.print_exc()
        return json.dumps({"status": "error", "message": str(e)})

@app.route('/get_structures_hierarchy')
def get_structures_hierarchy():
    """API endpoint to get hierarchical structure of dataset_files/structures directory"""
    try:
        analysis = get_analysis_instance()
        result = analysis.get_structures_hierarchy()
        return json.dumps(result)
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})

# API Endpoints for Dataiku WebApp
@app.route('/get_datasets')
def get_datasets():
    """API endpoint to get available datasets"""
    try:
        analysis = get_analysis_instance()
        result = analysis.get_available_datasets()
        return json.dumps(result)
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})

@app.route('/select_dataset', methods=['POST'])
def select_dataset():
    """API endpoint to select a dataset"""
    try:
        data = request.get_json()
        # Accept new key 'dataset_name' first, keep backward compatibility with older 'fix_pass_qc' key
        dataset_name = (data or {}).get('dataset_name') or (data or {}).get('fix_pass_qc')
        structure_name = (data or {}).get('structure_name')  # Optional structure name
        structure_context = (data or {}).get('structure_context')  # Optional structure context

        print(f"Dataset selection request - dataset_name: {dataset_name}, structure_name: {structure_name}")
        if structure_context:
            print(f"Structure context provided: {structure_context}")

        # If no dataset_name provided, prefer dataset_files folder mode when present
        if not dataset_name:
            base_dir = os.path.dirname(__file__)
            dsf_struct = os.path.join(base_dir, 'dataset_files', 'structures')
            dsf_wells = os.path.join(base_dir, 'dataset_files', 'wells')
            if os.path.isdir(dsf_struct) or os.path.isdir(dsf_wells):
                dataset_name = 'dataset_files'
            else:
                # If folder not available, prefer a project dataset named dataset_files, then dataset_qc
                try:
                    analysis = get_analysis_instance()
                    ds_info = analysis.get_available_datasets() or {}
                    datasets = [d.lower() for d in ds_info.get('datasets', [])]
                    if 'dataset_files' in datasets:
                        dataset_name = 'dataset_files'
                    elif 'dataset_qc' in datasets:
                        dataset_name = 'dataset_qc'
                except Exception as _:
                    pass

        analysis = get_analysis_instance()

        # If dataset_name indicates a structure pattern, try to find the actual dataset
        if dataset_name and 'raw_well_data_' in dataset_name:
            # Extract structure name from dataset_name
            structure_from_name = dataset_name.split('raw_well_data_')[-1]
            actual_dataset = find_raw_data_dataset(structure_from_name)
            if actual_dataset:
                dataset_name = actual_dataset
                print(f"Found structure-specific dataset: {actual_dataset}")
            else:
                # Fallback: prefer dataset_files folder mode if present, else general discovery
                base_dir = os.path.dirname(__file__)
                dsf_struct = os.path.join(base_dir, 'dataset_files', 'structures')
                dsf_wells = os.path.join(base_dir, 'dataset_files', 'wells')
                if os.path.isdir(dsf_struct) or os.path.isdir(dsf_wells):
                    dataset_name = 'dataset_files'
                    print("Falling back to dataset_files (folder) for structure selection")
                else:
                    fallback_dataset = find_raw_data_dataset()
                    if fallback_dataset:
                        dataset_name = fallback_dataset
                        print(f"Falling back to discovered dataset: {fallback_dataset}")
        elif structure_name:
            # Try to find dataset for specific structure
            structure_dataset = find_raw_data_dataset(structure_name)
            if structure_dataset:
                dataset_name = structure_dataset
                print(f"Found dataset for structure {structure_name}: {structure_dataset}")
            else:
                # Fallback to general dataset discovery
                fallback_dataset = find_raw_data_dataset()
                if fallback_dataset:
                    dataset_name = fallback_dataset
                    print(f"Using fallback dataset: {fallback_dataset}")

        if not dataset_name:
            # Last resort: try to find any suitable dataset
            dataset_name = find_raw_data_dataset()
            if not dataset_name:
                return json.dumps({"status": "error", "message": "No suitable dataset found in project"})

        print(f"Final dataset selection: {dataset_name}")
        result = analysis.select_dataset(dataset_name)
        return json.dumps(result)
    except Exception as e:
        error_msg = f"Error in select_dataset endpoint: {str(e)}"
        print(error_msg)
        return json.dumps({"status": "error", "message": error_msg})

@app.route('/get_wells')
def get_wells():
    """API endpoint to get wells from selected dataset"""
    try:
        analysis = get_analysis_instance()
        result = analysis.get_well_list()
        # If folder mode is active or wells are empty, try scanning dataset_files directly as a safety net
        if (result.get('status') == 'success' and (result.get('wells') is None or len(result.get('wells')) == 0)) or \
           ((analysis.current_dataset or '').startswith('dataset_files') and analysis.current_well_data is None):
            base_dir = os.path.dirname(__file__)
            wells = set()
            try:
                dsf_struct = os.path.join(base_dir, 'dataset_files', 'structures')
                if os.path.isdir(dsf_struct):
                    for field_name in os.listdir(dsf_struct):
                        fpath = os.path.join(dsf_struct, field_name)
                        if not os.path.isdir(fpath):
                            continue
                        for struct_name in os.listdir(fpath):
                            spath = os.path.join(fpath, struct_name)
                            if not os.path.isdir(spath):
                                continue
                            for r, _d, files in os.walk(spath):
                                for fn in files:
                                    if fn.lower().endswith('.csv'):
                                        wells.add(os.path.splitext(fn)[0])
                dsf_wells = os.path.join(base_dir, 'dataset_files', 'wells')
                if os.path.isdir(dsf_wells):
                    for fn in os.listdir(dsf_wells):
                        if fn.lower().endswith('.csv'):
                            wells.add(os.path.splitext(fn)[0])
                # If still empty or to supplement, try Dataiku dataset 'dataset_files' with 'path' column
                if not wells:
                    try:
                        analysis2 = get_analysis_instance()
                        ds_info2 = analysis2.get_available_datasets() or {}
                        if 'dataset_files' in [d.lower() for d in ds_info2.get('datasets', [])]:
                            df_idx = dataiku.Dataset('dataset_files').get_dataframe()
                            col = 'basename' if 'basename' in df_idx.columns else None
                            if col:
                                for v in df_idx[col].dropna().astype(str).tolist():
                                    wells.add(v)
                            elif 'path' in df_idx.columns:
                                for p in df_idx['path'].dropna().astype(str).tolist():
                                    if p.lower().endswith('.csv'):
                                        wells.add(os.path.splitext(os.path.basename(p))[0])
                    except Exception as _:
                        pass
            except Exception as e:
                print(f"Fallback scan for wells failed: {e}")
            wells = sorted(wells)
            return json.dumps({"status": "success", "wells": wells, "count": len(wells)})
        return json.dumps(result)
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})

@app.route('/get_well_plot', methods=['POST'])
def get_well_plot():
    """API endpoint to get well plot"""
    try:
        data = request.get_json()
        well_name = data.get('well_name')
        selected_intervals = data.get('selected_intervals', [])
        selected_zones = data.get('selected_zones', [])
        structure_context = data.get('structure_context')
        
        analysis = get_analysis_instance()
        # Pass zones transiently to analysis for this call only
        analysis._tmp_selected_zones = selected_zones
        
        # Pass intervals and structure context to plot creation
        result = analysis.create_log_plot(well_name, selected_intervals, structure_context)
        # Clean up transient attribute
        if hasattr(analysis, '_tmp_selected_zones'):
            delattr(analysis, '_tmp_selected_zones')
        return json.dumps(result)
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})

@app.route('/get_calculation_params', methods=['POST'])
def get_calculation_params():
    """API endpoint to get calculation parameters"""
    try:
        data = request.get_json()
        calculation_type = data.get('calculation_type')
        analysis = get_analysis_instance()
        result = analysis.get_calculation_parameters(calculation_type)
        return json.dumps(result)
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})

@app.route('/run_calculation_endpoint', methods=['POST'])
def run_calculation_endpoint():
    """API endpoint to run calculation"""
    try:
        data = request.get_json()
        calculation_type = data.get('calculation_type')
        params = data.get('params', {})
        output_dataset = data.get('output_dataset')
        selected_intervals = data.get('selected_intervals', [])
        selected_zones = data.get('selected_zones', [])
        selected_wells = data.get('selected_wells', [])

        analysis = get_analysis_instance()

        # Update selected intervals if provided
        if selected_intervals:
            analysis.selected_intervals = selected_intervals
        if selected_zones:
            analysis.selected_zones = selected_zones
        if selected_wells:
            analysis.selected_wells = selected_wells

        result = analysis.run_calculation(calculation_type, params, output_dataset)
        return json.dumps(result)
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})

@app.route('/get_plot_for_calculation', methods=['POST'])
def get_plot_for_calculation():
    """API endpoint to get plot for calculation"""
    try:
        data = request.get_json()
        calculation_type = data.get('calculation_type')
        well_name = data.get('well_name')
        analysis = get_analysis_instance()
        result = analysis.create_plot_for_calculation(calculation_type, well_name)
        return json.dumps(result)
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})

@app.route('/get_markers')
def get_markers():
    """API endpoint to get markers"""
    try:
        analysis = get_analysis_instance()
        result = analysis.get_markers_list()
        return json.dumps(result)
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})

@app.route('/get_zones')
def get_zones():
    """API endpoint to get zones"""
    try:
        analysis = get_analysis_instance()
        result = analysis.get_zones_list()
        return json.dumps(result)
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})

@app.route('/get_dataset_info')
def get_dataset_info():
    """API endpoint to get dataset info"""
    try:
        analysis = get_analysis_instance()
        result = analysis.get_dataset_info()
        return json.dumps(result)
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})

# -----------------------------
# Data Prep helper endpoints used by app.js
# -----------------------------
@app.route('/get_data_prep_files')
def get_data_prep_files():
    try:
        analysis = get_analysis_instance()
        files = []
        # Avoid suggesting pseudo names like 'dataset_files (folder)' for Data Prep
        current = analysis.current_dataset or ''
        if current and '(' not in current:
            files.append(current)
        else:
            # Prefer real project datasets in this order
            ds = find_raw_data_dataset()
            if ds:
                files.append(ds)
        return json.dumps({"status": "success", "files": files})
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})

@app.route('/get_data_prep_columns', methods=['POST'])
def get_data_prep_columns():
    try:
        data = request.get_json() or {}
        files = data.get('files') or []
        analysis = get_analysis_instance()
        dataset_name = files[0] if files else (analysis.current_dataset or find_raw_data_dataset())
        if not dataset_name:
            return json.dumps({"status": "error", "message": "No dataset available"})
        # If we're in folder/csv pseudo mode, infer columns from a sample CSV under dataset_files
        if '(' in dataset_name and dataset_name.lower().startswith('dataset_files'):
            try:
                base_dir = os.path.dirname(__file__)
                # Prefer a sample from global wells, else first CSV found under structures
                candidates = []
                wells_dir = os.path.join(base_dir, 'dataset_files', 'wells')
                if os.path.isdir(wells_dir):
                    for fn in os.listdir(wells_dir):
                        if fn.lower().endswith('.csv'):
                            candidates.append(os.path.join(wells_dir, fn))
                if not candidates:
                    struct_root = os.path.join(base_dir, 'dataset_files', 'structures')
                    if os.path.isdir(struct_root):
                        for r, _d, files_in in os.walk(struct_root):
                            for fn in files_in:
                                if fn.lower().endswith('.csv'):
                                    candidates.append(os.path.join(r, fn))
                                    if len(candidates) >= 1:
                                        break
                            if candidates:
                                break
                if candidates:
                    sample = candidates[0]
                    df = pd.read_csv(sample, nrows=1)
                    return json.dumps({"status": "success", "columns": df.columns.tolist(), "source": sample})
                else:
                    return json.dumps({"status": "error", "message": "No CSV files found in dataset_files to infer columns"})
            except Exception as infer_err:
                return json.dumps({"status": "error", "message": f"Failed to infer columns from dataset_files: {infer_err}"})
        # Otherwise use Dataiku dataset normally
        df = dataiku.Dataset(dataset_name).get_dataframe()
        return json.dumps({"status": "success", "columns": df.columns.tolist()})
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})

@app.route('/get_available_columns')
def get_available_columns():
    """API endpoint to get available columns"""
    try:
        analysis = get_analysis_instance()
        result = analysis.get_available_columns()
        return json.dumps(result)
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})

@app.route('/validate_calculation', methods=['POST'])
def validate_calculation():
    """API endpoint to validate calculation requirements"""
    try:
        data = request.get_json()
        calculation_type = data.get('calculation_type')
        analysis = get_analysis_instance()
        result = analysis.validate_calculation_requirements(calculation_type)
        return json.dumps(result)
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})

@app.route('/save_dataset', methods=['POST'])
def save_dataset():
    """API endpoint to save dataset"""
    try:
        data = request.get_json()
        dataset_name = data.get('dataset_name')
        dataset_data = data.get('data')
        analysis = get_analysis_instance()
        result = analysis.save_results_to_new_dataset(dataset_name, dataset_data)
        return json.dumps(result)
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})

@app.route('/get_current_status')
def get_current_status():
    """Get current dataset and well loading status"""
    try:
        analysis = get_analysis_instance()
        if not analysis.current_dataset:
            return json.dumps({
                "status": "success",
                "dataset_loaded": False,
                "message": "No dataset currently loaded"
            })
        wells = []
        markers = []
        if analysis.current_well_data is not None:
            wells = analysis.current_well_data['WELL_NAME'].unique().tolist() if 'WELL_NAME' in analysis.current_well_data.columns else []
            markers = analysis.current_well_data['MARKER'].unique().tolist() if 'MARKER' in analysis.current_well_data.columns else []
        return json.dumps({
            "status": "success",
            "dataset_loaded": True,
            "current_dataset": analysis.current_dataset,
            "wells": wells,
            "well_count": len(wells),
            "markers": markers,
            "marker_count": len(markers),
            "total_rows": len(analysis.current_well_data) if analysis.current_well_data is not None else 0
        })
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})

@app.route('/first_api_call')
def first_api_call():
    """First API call endpoint for webapp initialization"""
    try:
        analysis = get_analysis_instance()
        
        result = {
            "status": "success",
            "message": "Well Log Analysis backend is running",
            "timestamp": datetime.now().isoformat(),
            "backend_version": "1.0.0",
            "current_dataset": analysis.current_dataset,
            "dataset_loaded": analysis.current_dataset is not None
        }
        
        # If dataset is loaded, include basic info
        if analysis.current_dataset and analysis.current_well_data is not None:
            wells = analysis.current_well_data['WELL_NAME'].unique().tolist() if 'WELL_NAME' in analysis.current_well_data.columns else []
            result["wells"] = wells
            result["well_count"] = len(wells)
            result["total_rows"] = len(analysis.current_well_data)
        
        return json.dumps(result)
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})

# New calculation endpoints for specific modules
@app.route('/vsh_calculation', methods=['POST'])
def vsh_calculation_endpoint():
    """Handle VSH calculation (both GR and DN methods)"""
    try:
        data = request.get_json()
        method = data.get('method', 'vsh_gr')
        parameters = data.get('parameters', {})
        selected_wells = data.get('selected_wells', [])
        selected_intervals = data.get('selected_intervals', [])
        interval_specific_params = data.get('interval_specific_params')
        selected_zones = data.get('selected_zones', [])
        
        print(f"VSH Calculation Request:")
        print(f"  Method: {method}")
        print(f"  Parameters: {parameters}")
        print(f"  Selected Wells: {selected_wells}")
        print(f"  Selected Intervals: {selected_intervals}")
        print(f"  Interval-Specific Params: {interval_specific_params}")
        
        # Get analysis instance and process interval-specific parameters if available
        analysis = get_analysis_instance()
        if selected_intervals:
            analysis.selected_intervals = selected_intervals
        
        # Process interval-specific parameters
        final_params = parameters
        if interval_specific_params and isinstance(interval_specific_params, dict) and selected_intervals:
            # Use first interval's parameters as primary
            first_interval = selected_intervals[0] if selected_intervals else None
            if first_interval and first_interval in interval_specific_params:
                final_params = interval_specific_params[first_interval]
                print(f"Using interval-specific params for {first_interval}: {final_params}")
        # Prefer the currently loaded dataset; else find one (prioritize fix_pass_qc)
        raw_data_name = analysis.current_dataset or find_raw_data_dataset()
        if not raw_data_name:
            return json.dumps({"success": False, "error": "Raw well data dataset not found. Please ensure you have a dataset named 'fix_pass_qc' or a similar well log dataset."})

        print(f"Using dataset: {raw_data_name}")
        dataset = dataiku.Dataset(raw_data_name)
        df = dataset.get_dataframe()
        
        # Filter for selected wells if specified (check different well column names)
        if selected_wells:
            well_col = None
            for col in ['WELL', 'WELL_NAME', 'Well', 'well']:
                if col in df.columns:
                    well_col = col
                    break
            if well_col:
                df = df[df[well_col].isin(selected_wells)]
        
        if method == 'vsh_gr':
            # VSH from Gamma Ray calculation
            try:
                # Map incoming params to service signature
                gr_ma = float(final_params.get('GR_MA', final_params.get('gr_ma', 30)))
                gr_sh = float(final_params.get('GR_SH', final_params.get('gr_sh', 120)))
                input_log = final_params.get('input_log') or final_params.get('GR_LOG', 'GR')
                output_log = final_params.get('output_log', 'VSH_GR')
                result_df = calculate_vsh_from_gr(
                    df=df,
                    gr_log=input_log,
                    gr_ma=gr_ma,
                    gr_sh=gr_sh,
                    output_col=output_log,
                    target_intervals=selected_intervals,
                    target_zones=selected_zones or None
                )
                
                # Update current data in analysis instance
                analysis.current_well_data = result_df
                
                return json.dumps({
                    "status": "success", 
                    "message": "VSH-GR calculation completed",
                    "calculation_type": "vsh",
                    "rows_processed": len(result_df),
                    "selected_intervals": selected_intervals,
                    "selected_wells": selected_wells
                })
            except Exception as e:
                return json.dumps({"status": "error", "message": f"VSH-GR calculation failed: {str(e)}"})
        
        elif method == 'vsh_dn':
            # VSH from Density-Neutron calculation
            try:
                result_df = calculate_vsh_dn(df, final_params, target_intervals=selected_intervals, target_zones=selected_zones or None)
                
                # Update current data in analysis instance
                analysis.current_well_data = result_df
                
                return json.dumps({
                    "status": "success", 
                    "message": "VSH-DN calculation completed",
                    "calculation_type": "vsh",
                    "rows_processed": len(result_df),
                    "selected_intervals": selected_intervals,
                    "selected_wells": selected_wells
                })
            except Exception as e:
                return json.dumps({"status": "error", "message": f"VSH-DN calculation failed: {str(e)}"})
        
        return json.dumps({"status": "error", "message": "Unknown VSH method"})

    except Exception as e:
        traceback.print_exc()
        return json.dumps({"status": "error", "message": str(e)})

@app.route('/porosity_calculation', methods=['POST'])
def porosity_calculation_endpoint():
    """Handle Porosity calculation using Bateman/Konen method"""
    try:
        data = request.get_json()
        parameters = data.get('parameters', {})
        selected_wells = data.get('selected_wells', [])
        selected_intervals = data.get('selected_intervals', [])
        # Prefer the currently loaded dataset; else find one (prioritize fix_pass_qc)
        analysis = get_analysis_instance()
        raw_data_name = analysis.current_dataset or find_raw_data_dataset()
        if not raw_data_name:
            return json.dumps({"success": False, "error": "Raw well data dataset not found. Please ensure you have a dataset named 'fix_pass_qc' or a similar well log dataset."})

        print(f"Using dataset: {raw_data_name}")
        dataset = dataiku.Dataset(raw_data_name)
        df = dataset.get_dataframe()

        # Filter for selected wells if specified (check different well column names)
        if selected_wells:
            well_col = None
            for col in ['WELL', 'WELL_NAME', 'Well', 'well']:
                if col in df.columns:
                    well_col = col
                    break
            if well_col:
                df = df[df[well_col].isin(selected_wells)]

        # Perform porosity calculation (interval-aware)
        result_df = calculate_porosity(df, parameters, target_intervals=selected_intervals, target_zones=None)
        
        # Update current data in analysis instance for downstream plotting
        analysis.current_well_data = result_df
        
        return json.dumps({
            "success": True, 
            "message": "Porosity calculation completed",
            "rows_processed": len(result_df),
            "source_dataset": raw_data_name
        })
        
    except Exception as e:
        traceback.print_exc()
        return json.dumps({"success": False, "error": str(e)})

@app.route('/sw_calculation', methods=['POST'])
def sw_calculation_endpoint():
    """Handle Water Saturation calculation (Indonesia and Simandoux methods)"""
    try:
        data = request.get_json()
        method = data.get('method', 'sw_indonesia')
        parameters = data.get('parameters', {})
        selected_wells = data.get('selected_wells', [])
        selected_intervals = data.get('selected_intervals', [])
        
        # Prefer the currently loaded dataset; else find one (prioritize fix_pass_qc)
        analysis = get_analysis_instance()
        raw_data_name = analysis.current_dataset or find_raw_data_dataset()
        if not raw_data_name:
            return json.dumps({"success": False, "error": "Raw well data dataset not found. Please ensure you have a dataset named 'fix_pass_qc' or a similar well log dataset."})

        print(f"Using dataset: {raw_data_name}")
        dataset = dataiku.Dataset(raw_data_name)
        df = dataset.get_dataframe()

        # Filter for selected wells if specified (check different well column names)
        if selected_wells:
            well_col = None
            for col in ['WELL', 'WELL_NAME', 'Well', 'well']:
                if col in df.columns:
                    well_col = col
                    break
            if well_col:
                df = df[df[well_col].isin(selected_wells)]

        if method == 'sw_indonesia':
            # Normalize incoming params to service schema (uppercase keys)
            svc_params = {
                'A': float(parameters.get('A') or parameters.get('a') or 1.0),
                'M': float(parameters.get('M') or parameters.get('m') or 2.0),
                'N': float(parameters.get('N') or parameters.get('n') or 2.0),
                'RWS': float(parameters.get('RWS') or parameters.get('rws') or 0.529),
                'RWT': float(parameters.get('RWT') or parameters.get('rwt') or 227),
                'RT_SH': float(parameters.get('RT_SH') or parameters.get('rt_sh') or 2.2),
            }
            # Derive FTEMP: prefer explicit numeric; else try median of a provided column name; fallback default 80
            ftemp_value = parameters.get('FTEMP') or parameters.get('ftemp')
            if ftemp_value is None:
                ftemp_col = parameters.get('ftemp_log') or 'FTEMP'
                if ftemp_col in df.columns:
                    try:
                        ftemp_value = float(pd.to_numeric(df[ftemp_col], errors='coerce').median())
                    except Exception:
                        ftemp_value = None
            svc_params['FTEMP'] = float(ftemp_value) if ftemp_value is not None else 80.0

            # Ensure minimal required columns exist for service calculation (PHIE, VSH, RT, GR)
            # PHIE from density if missing
            if 'PHIE' not in df.columns and 'RHOB' in df.columns:
                try:
                    rho_ma = float(parameters.get('RHO_MA', 2.65))
                    rho_fl = float(parameters.get('RHO_FL', 1.0))
                    rhob = pd.to_numeric(df['RHOB'], errors='coerce')
                    phie = (rho_ma - rhob) / max(1e-6, (rho_ma - rho_fl))
                    df['PHIE'] = phie.clip(0, 1)
                except Exception:
                    pass
            # VSH from GR quantiles if missing
            if 'VSH' not in df.columns and 'GR' in df.columns:
                try:
                    gr = pd.to_numeric(df['GR'], errors='coerce')
                    gr_ma = gr.quantile(0.05)
                    gr_sh = gr.quantile(0.95)
                    if gr_sh > gr_ma:
                        vsh = (gr - gr_ma) / max(1e-6, (gr_sh - gr_ma))
                        df['VSH'] = vsh.clip(0, 1)
                except Exception:
                    pass

            # SW Indonesia calculation using service
            result_df = calculate_sw(df, svc_params, target_intervals=selected_intervals, target_zones=None)
        elif method == 'sw_simandoux':
            # SW Simandoux calculation (placeholder - implement when needed)
            # result_df = calculate_sw_simandoux(df, parameters)
            result_df = df.copy()  # Placeholder
            result_df['SW_SIMANDOUX'] = 0.5  # Placeholder value
        else:
            return json.dumps({"success": False, "error": "Unknown SW method"})
        
        # Update current data in analysis instance for downstream plotting
        analysis.current_well_data = result_df
        
        return json.dumps({
            "success": True, 
            "message": f"SW {method.replace('sw_', '').upper()} calculation completed",
            "rows_processed": len(result_df),
            "source_dataset": raw_data_name
        })
        
    except Exception as e:
        traceback.print_exc()
        return json.dumps({"success": False, "error": str(e)})

@app.route('/rwa_calculation', methods=['POST'])
def rwa_calculation_endpoint():
    """Handle Water Resistivity calculation"""
    try:
        data = request.get_json()
        parameters = data.get('parameters', {})
        selected_wells = data.get('selected_wells', [])
        selected_intervals = data.get('selected_intervals', [])
        
        # Prefer the currently loaded dataset; else find one (prioritize fix_pass_qc)
        analysis = get_analysis_instance()
        raw_data_name = analysis.current_dataset or find_raw_data_dataset()
        if not raw_data_name:
            return json.dumps({"success": False, "error": "Raw well data dataset not found. Please ensure you have a dataset named 'fix_pass_qc' or a similar well log dataset."})

        print(f"Using dataset: {raw_data_name}")
        dataset = dataiku.Dataset(raw_data_name)
        df = dataset.get_dataframe()

        # Filter for selected wells if specified (check different well column names)
        if selected_wells:
            well_col = None
            for col in ['WELL', 'WELL_NAME', 'Well', 'well']:
                if col in df.columns:
                    well_col = col
                    break
            if well_col:
                df = df[df[well_col].isin(selected_wells)]

        # Perform water resistivity calculation (interval-aware)
        result_df = calculate_rwa(df, parameters, target_intervals=selected_intervals, target_zones=None)

        # Update current data in analysis instance for downstream plotting
        analysis.current_well_data = result_df

        return json.dumps({
            "success": True, 
            "message": "Water Resistivity calculation completed",
            "rows_processed": len(result_df),
            "source_dataset": raw_data_name
        })
        
    except Exception as e:
        traceback.print_exc()
        return json.dumps({"success": False, "error": str(e)})

# -----------------------------
# Analysis endpoints: histogram and crossplot
# -----------------------------
@app.route('/histogram', methods=['POST'])
def histogram_endpoint():
    """Generate a histogram for a specified column with optional filters."""
    try:
        data = request.get_json() or {}
        log_column = data.get('column') or data.get('log_column')
        n_bins = int(data.get('bins', 30))
        selected_wells = data.get('selected_wells', [])
        selected_intervals = data.get('selected_intervals', [])
        selected_zones = data.get('selected_zones', [])

        if not log_column:
            return json.dumps({"status": "error", "message": "Missing 'column' parameter"})

        analysis = get_analysis_instance()
        raw_data_name = analysis.current_dataset or find_raw_data_dataset()
        if not raw_data_name:
            return json.dumps({"status": "error", "message": "No dataset available"})

        df = dataiku.Dataset(raw_data_name).get_dataframe()

        # Filter wells
        if selected_wells:
            for col in ['WELL', 'WELL_NAME', 'Well', 'well']:
                if col in df.columns:
                    df = df[df[col].isin(selected_wells)]
                    break
        # Filter intervals
        if selected_intervals and 'MARKER' in df.columns:
            df = df[df['MARKER'].isin(selected_intervals)]
        # Filter zones
        if selected_zones:
            for zc in ['ZONE', 'ZONES', 'ZONE_NAME', 'Zone', 'zone']:
                if zc in df.columns:
                    df = df[df[zc].isin(selected_zones)]
                    break

        fig = plot_histogram(df, log_column, n_bins)
        return json.dumps({"status": "success", "figure": fig.to_dict()})
    except Exception as e:
        traceback.print_exc()
        return json.dumps({"status": "error", "message": str(e)})


@app.route('/crossplot', methods=['POST'])
def crossplot_endpoint():
    """Generate a crossplot for two columns; supports special NPHI-RHOB overlays."""
    try:
        data = request.get_json() or {}
        x_col = data.get('x') or data.get('x_col')
        y_col = data.get('y') or data.get('y_col')
        nbins = int(data.get('bins', 25))
        # Optional model params used by service for special overlays
        gr_ma = float(data.get('gr_ma', 30))
        gr_sh = float(data.get('gr_sh', 120))
        rho_ma = float(data.get('rho_ma', 2.65))
        rho_sh = float(data.get('rho_sh', 2.3))
        nphi_ma = float(data.get('nphi_ma', 0.0))
        nphi_sh = float(data.get('nphi_sh', 0.4))
        prcnt_qz = float(data.get('prcnt_qz', 10))
        prcnt_wtr = float(data.get('prcnt_wtr', 10))

        selected_wells = data.get('selected_wells', [])
        selected_intervals = data.get('selected_intervals', [])
        selected_zones = data.get('selected_zones', [])

        if not x_col or not y_col:
            return json.dumps({"status": "error", "message": "Missing x or y column"})

        analysis = get_analysis_instance()
        raw_data_name = analysis.current_dataset or find_raw_data_dataset()
        if not raw_data_name:
            return json.dumps({"status": "error", "message": "No dataset available"})

        df = dataiku.Dataset(raw_data_name).get_dataframe()

        # Filter wells
        if selected_wells:
            for col in ['WELL', 'WELL_NAME', 'Well', 'well']:
                if col in df.columns:
                    df = df[df[col].isin(selected_wells)]
                    break
        # Filter intervals
        if selected_intervals and 'MARKER' in df.columns:
            df = df[df['MARKER'].isin(selected_intervals)]
        # Filter zones
        if selected_zones:
            for zc in ['ZONE', 'ZONES', 'ZONE_NAME', 'Zone', 'zone']:
                if zc in df.columns:
                    df = df[df[zc].isin(selected_zones)]
                    break

        fig = generate_crossplot(
            df=df,
            x_col=x_col,
            y_col=y_col,
            gr_ma=gr_ma,
            gr_sh=gr_sh,
            rho_ma=rho_ma,
            rho_sh=rho_sh,
            nphi_ma=nphi_ma,
            nphi_sh=nphi_sh,
            prcnt_qz=prcnt_qz,
            prcnt_wtr=prcnt_wtr,
            selected_intervals=selected_intervals,
            nbins=nbins
        )
        return json.dumps({"status": "success", "figure": fig.to_dict()})
    except Exception as e:
        traceback.print_exc()
        return json.dumps({"status": "error", "message": str(e)})
