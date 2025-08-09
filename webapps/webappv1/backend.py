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

class WellLogAnalysis:
    def __init__(self, project_key=None):
        """Initialize with optional project key and auto-load fix_pass_qc dataset"""
        self.project_key = project_key
        if project_key:
            self.project = dataiku.Project(project_key)
        self.current_dataset = None
        self.current_well_data = None
        self.available_datasets = []
        
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
    
    def auto_load_default_dataset(self):
        """Automatically load the fix_pass_qc dataset on initialization"""
        try:
            dataset_name = "fix_pass_qc"
            result = self.select_dataset(dataset_name)
            if result.get("status") == "success":
                print(f"Successfully auto-loaded dataset: {dataset_name}")
            else:
                print(f"Failed to auto-load dataset {dataset_name}: {result.get('message', 'Unknown error')}")
        except Exception as e:
            print(f"Error auto-loading dataset: {str(e)}")
    
    def get_available_datasets(self):
        """Get list of available datasets in the project"""
        try:
            if self.project:
                datasets = self.project.list_datasets()
                self.available_datasets = [ds['name'] for ds in datasets]
            else:
                # For standalone usage, get all datasets
                client = dataiku.api_client()
                datasets = client.list_datasets()
                self.available_datasets = [ds['name'] for ds in datasets]
            
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
            dataset = dataiku.Dataset(dataset_name)
            df = dataset.get_dataframe()
            
            # Store current dataset info
            self.current_dataset = dataset_name
            self.current_well_data = df
            
            # Get basic info
            wells = df['WELL_NAME'].unique().tolist() if 'WELL_NAME' in df.columns else []
            markers = df['MARKER'].unique().tolist() if 'MARKER' in df.columns else []
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
            return {"status": "error", "message": f"Error selecting dataset: {str(e)}"}
    
    def get_well_list(self):
        """Get list of wells from current dataset"""
        try:
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
    
    def create_log_plot(self, well_name):
        """Create log plot for a specific well"""
        try:
            print(f"Creating log plot for well: {well_name}")
            
            if self.current_well_data is None:
                return {"status": "error", "message": "No dataset selected"}
            
            # Get well data
            well_data = self.current_well_data[self.current_well_data['WELL_NAME'] == well_name]
            print(f"Found {len(well_data)} rows for well {well_name}")
            
            if well_data.empty:
                available_wells = self.current_well_data['WELL_NAME'].unique().tolist()
                return {"status": "error", "message": f"No data found for well {well_name}. Available wells: {available_wells}"}
            
            # Check if we have essential columns
            required_cols = ['DEPTH']
            available_cols = [col for col in ['GR', 'RT', 'NPHI', 'RHOB'] if col in well_data.columns]
            
            if not available_cols:
                return {"status": "error", "message": "No log data columns found"}
            
            # Extract markers and ensure cross-plot normalized columns exist
            df_marker = extract_markers_with_mean_depth(well_data)
            well_data_normalized = self._ensure_crossplot_norms(well_data)
            
            # Create plot
            fig = plot_log_default(
                df=well_data_normalized,
                df_marker=df_marker,
                df_well_marker=well_data_normalized
            )
            
            return {
                "status": "success",
                "figure": fig.to_dict(),
                "well_name": well_name
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
    
    def run_calculation(self, calculation_type, params, output_dataset_name=None):
        """Run calculation with parameters on current dataset"""
        try:
            if self.current_well_data is None:
                return {"status": "error", "message": "No dataset selected"}
            
            # Make a copy of current data
            df = self.current_well_data.copy()
            
            # Run calculation based on type
            if calculation_type == "vsh":
                result_df = self._run_vsh_calculation(df, params)
            elif calculation_type == "porosity":
                result_df = self._run_porosity_calculation(df, params)
            elif calculation_type == "gsa":
                result_df = self._run_gsa_calculation(df, params)
            elif calculation_type == "rgbe_rpbe":
                result_df = self._run_rgbe_rpbe_calculation(df, params)
            elif calculation_type == "rt_r0":
                result_df = self._run_rt_r0_calculation(df, params)
            elif calculation_type == "swgrad":
                result_df = self._run_swgrad_calculation(df, params)
            elif calculation_type == "dns_dnsv":
                result_df = self._run_dns_dnsv_calculation(df, params)
            elif calculation_type == "sw":
                result_df = self._run_sw_calculation(df, params)
            elif calculation_type == "rwa":
                result_df = self._run_rwa_calculation(df, params)
            elif calculation_type == "normalization":
                result_df = self._run_interval_normalization(df, params)
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
            # Extract markers and ensure cross-plot normalized columns exist
            df_marker = extract_markers_with_mean_depth(df)
            df_normalized = self._ensure_crossplot_norms(df)
            
            # Create plot
            fig = plot_log_default(
                df=df_normalized,
                df_marker=df_marker,
                df_well_marker=df_normalized
            )
            
            return {"status": "success", "figure": fig.to_dict()}
        except Exception as e:
            return {"status": "error", "message": f"Error creating default plot: {str(e)}"}
    
    def _create_vsh_plot(self, df):
        """Create VSH plot"""
        try:
            vsh_col = 'VSH_LINEAR' if 'VSH_LINEAR' in df.columns else ('VSH_GR' if 'VSH_GR' in df.columns else None)
            if not vsh_col:
                return {"status": "error", "message": "No VSH data found"}
            df_marker = extract_markers_with_mean_depth(df)
            fig = plot_vsh_linear(df=df, df_marker=df_marker, df_well_marker=df)
            
            return {"status": "success", "figure": fig.to_dict()}
        except Exception as e:
            return {"status": "error", "message": f"Error creating VSH plot: {str(e)}"}
    
    def _create_porosity_plot(self, df):
        """Create porosity plot"""
        try:
            required_cols = ['VSH', 'PHIE', 'PHIT', 'PHIE_DEN', 'PHIT_DEN']
            if not all(col in df.columns for col in required_cols):
                return {"status": "error", "message": "Missing required porosity data"}
            df_marker = extract_markers_with_mean_depth(df)
            fig = plot_phie_den(df=df, df_marker=df_marker, df_well_marker=df)
            
            return {"status": "success", "figure": fig.to_dict()}
        except Exception as e:
            return {"status": "error", "message": f"Error creating porosity plot: {str(e)}"}
    
    def _create_gsa_plot(self, df):
        """Create GSA plot"""
        try:
            required_cols = ['RGSA', 'NGSA', 'DGSA']
            if not all(col in df.columns for col in required_cols):
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
            df_marker = extract_markers_with_mean_depth(df)
            fig = plot_normalization(df=df, df_marker=df_marker, df_well_marker=df)
            
            return {"status": "success", "figure": fig.to_dict()}
        except Exception as e:
            return {"status": "error", "message": f"Error creating normalization plot: {str(e)}"}
    
    def _create_sw_plot(self, df):
        """Create water saturation plot"""
        try:
            if 'SWE_INDO' not in df.columns and 'SW' not in df.columns:
                return {"status": "error", "message": "Missing water saturation data"}
            df_marker = extract_markers_with_mean_depth(df)
            fig = plot_sw_indo(df=df, df_marker=df_marker, df_well_marker=df)
            
            return {"status": "success", "figure": fig.to_dict()}
        except Exception as e:
            return {"status": "error", "message": f"Error creating SW plot: {str(e)}"}

    def _create_rwa_plot(self, df):
        """Create RWA plot"""
        try:
            required_cols = ['RWA_FULL', 'RWA_SIMPLE', 'RWA_TAR']
            if not all(col in df.columns for col in required_cols):
                return {"status": "error", "message": "Missing RWA data"}
            df_marker = extract_markers_with_mean_depth(df)
            fig = plot_rwa_indo(df=df, df_marker=df_marker, df_well_marker=df)
            return {"status": "success", "figure": fig.to_dict()}
        except Exception as e:
            return {"status": "error", "message": f"Error creating RWA plot: {str(e)}"}

    def _create_smoothing_plot(self, df):
        """Create smoothing plot"""
        try:
            required_cols = ['GR', 'GR_MovingAvg_5', 'GR_MovingAvg_10']
            if not all(col in df.columns for col in required_cols):
                return {"status": "error", "message": "Missing smoothing data"}
            df_marker = extract_markers_with_mean_depth(df)
            fig = plot_smoothing(df=df, df_marker=df_marker, df_well_marker=df)
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

# -----------------------------
# Structures utilities
# -----------------------------
def _scan_structures_folder():
    try:
        base_dir = os.path.dirname(__file__)
        root = os.path.join(base_dir, 'structures')
        fields = []
        total_structures = 0
        if not os.path.isdir(root):
            return {"fields": [], "total_fields": 0, "total_structures": 0}
        for fname in sorted(os.listdir(root)):
            fpath = os.path.join(root, fname)
            if not os.path.isdir(fpath):
                continue
            structures = []
            for entry in sorted(os.listdir(fpath)):
                if entry.lower().endswith('.xlsx'):
                    web_path = f"/structures/{fname}/{entry}"
                    structure_name = os.path.splitext(entry)[0]
                    structures.append({
                        "structure_name": structure_name,
                        "field_name": fname.capitalize(),
                        "file_path": web_path,
                        "wells_count": 0,
                        "wells": [],
                        "total_records": 0,
                        "columns": [],
                        "intervals": []
                    })
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

@app.route('/get_structures_index')
def get_structures_index():
    try:
        base_dir = os.path.dirname(__file__)
        candidates = [
            os.path.join(base_dir, 'data', 'structures', 'index.json'),
            os.path.join(base_dir, 'structures', 'index.json')
        ]
        for p in candidates:
            if os.path.isfile(p):
                with open(p, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                return json.dumps({"status": "success", "source": p, "data": data})
        return json.dumps({"status": "error", "message": "index.json not found"})
    except Exception as e:
        traceback.print_exc()
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
        dataset_name = data.get('dataset_name')
        analysis = get_analysis_instance()
        result = analysis.select_dataset(dataset_name)
        return json.dumps(result)
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})

@app.route('/get_wells')
def get_wells():
    """API endpoint to get wells from selected dataset"""
    try:
        analysis = get_analysis_instance()
        result = analysis.get_well_list()
        return json.dumps(result)
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})

@app.route('/get_well_plot', methods=['POST'])
def get_well_plot():
    """API endpoint to get well plot"""
    try:
        data = request.get_json()
        well_name = data.get('well_name')
        analysis = get_analysis_instance()
        result = analysis.create_log_plot(well_name)
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
        analysis = get_analysis_instance()
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

@app.route('/get_dataset_info')
def get_dataset_info():
    """API endpoint to get dataset info"""
    try:
        analysis = get_analysis_instance()
        result = analysis.get_dataset_info()
        return json.dumps(result)
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
