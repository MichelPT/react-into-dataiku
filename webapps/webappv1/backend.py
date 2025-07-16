from dataiku.customwebapp import *
import json
import traceback
from datetime import datetime

# Access the parameters that end-users filled in using webapp config
# For example, for a parameter called "input_dataset"
# input_dataset = get_webapp_config()["input_dataset"]

import dataiku
import pandas as pd
import numpy as np
from dataiku import pandasutils as pdu
from scipy.stats import linregress
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

class WellLogAnalysis:
    def __init__(self, project_key=None):
        """Initialize with optional project key"""
        self.project_key = project_key
        if project_key:
            self.project = dataiku.Project(project_key)
        self.current_dataset = None
        self.current_well_data = None
        self.available_datasets = []
    
    # Dataset Management Methods
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
    
    def get_well_data_for_plot(self, well_name):
        """Get well data for plotting"""
        try:
            if self.current_well_data is None:
                return {"status": "error", "message": "No dataset selected"}
            
            # Filter data for specific well
            well_data = self.current_well_data[self.current_well_data['WELL_NAME'] == well_name]
            
            if well_data.empty:
                return {"status": "error", "message": f"No data found for well {well_name}"}
            
            # Convert to JSON-serializable format
            well_data_dict = well_data.to_dict('records')
            
            # Get markers for this well
            markers = well_data['MARKER'].unique().tolist() if 'MARKER' in well_data.columns else []
            
            return {
                "status": "success",
                "well_name": well_name,
                "data": well_data_dict,
                "markers": markers,
                "row_count": len(well_data)
            }
        except Exception as e:
            return {"status": "error", "message": f"Error getting well data: {str(e)}"}
    
    def create_log_plot(self, well_name):
        """Create log plot for a specific well"""
        try:
            if self.current_well_data is None:
                return {"status": "error", "message": "No dataset selected"}
            
            # Get well data
            well_data = self.current_well_data[self.current_well_data['WELL_NAME'] == well_name]
            
            if well_data.empty:
                return {"status": "error", "message": f"No data found for well {well_name}"}
            
            # Extract markers and normalize data
            df_marker = extract_markers_with_mean_depth(well_data)
            well_data_normalized = normalize_xover(well_data, 'NPHI', 'RHOB')
            well_data_normalized = normalize_xover(well_data_normalized, 'RT', 'RHOB')
            
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
            return {"status": "error", "message": f"Error creating log plot: {str(e)}"}
    
    def save_results_to_new_dataset(self, dataset_name, data_dict=None):
        """Save current results to a new dataset"""
        try:
            if data_dict is None and self.current_well_data is None:
                return {"status": "error", "message": "No data to save"}
            
            # Use provided data or current well data
            df_to_save = pd.DataFrame(data_dict) if data_dict else self.current_well_data
            
            # Create new dataset
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
    
    # Parameter Management Methods
    def get_calculation_parameters(self, calculation_type):
        """Get parameter definitions for different calculation types"""
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
                "rgbe_rpbe": {
                    "title": "RGBE-RPBE Calculation Parameters",
                    "parameters": [
                        {"name": "fluid_type", "type": "select", "default": "water", "label": "Fluid Type", "options": ["water", "oil", "gas"]},
                        {"name": "temperature", "type": "float", "default": 75, "label": "Temperature (°C)", "min": 0, "max": 200},
                        {"name": "salinity", "type": "float", "default": 50000, "label": "Salinity (ppm)", "min": 0, "max": 300000}
                    ]
                },
                "rt_r0": {
                    "title": "RT-R0 Calculation Parameters",
                    "parameters": [
                        {"name": "rw", "type": "float", "default": 0.1, "label": "Water Resistivity", "min": 0.001, "max": 10},
                        {"name": "temperature", "type": "float", "default": 75, "label": "Temperature (°C)", "min": 0, "max": 200},
                        {"name": "a", "type": "float", "default": 1.0, "label": "Archie's 'a'", "min": 0.1, "max": 10},
                        {"name": "m", "type": "float", "default": 2.0, "label": "Archie's 'm'", "min": 1.0, "max": 5.0}
                    ]
                },
                "swgrad": {
                    "title": "SWGRAD Calculation Parameters",
                    "parameters": [
                        {"name": "gradient_method", "type": "select", "default": "linear", "label": "Gradient Method", "options": ["linear", "polynomial", "exponential"]},
                        {"name": "depth_reference", "type": "float", "default": 0, "label": "Reference Depth", "min": -1000, "max": 10000}
                    ]
                },
                "dns_dnsv": {
                    "title": "DNS-DNSV Calculation Parameters",
                    "parameters": [
                        {"name": "fluid_contact", "type": "float", "default": 2000, "label": "Fluid Contact Depth", "min": 0, "max": 10000},
                        {"name": "gradient", "type": "float", "default": 0.01, "label": "Gradient", "min": 0.001, "max": 0.1}
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
        """Get available columns from current dataset"""
        try:
            if self.current_well_data is None:
                return {"status": "error", "message": "No dataset selected"}
            
            columns = self.current_well_data.columns.tolist()
            return {
                "status": "success",
                "columns": columns
            }
        except Exception as e:
            return {"status": "error", "message": f"Error getting columns: {str(e)}"}
    
    def get_well_data(self, dataset_name):
        """Get well data from Dataiku dataset"""
        try:
            dataset = dataiku.Dataset(dataset_name)
            return dataset.get_dataframe()
        except Exception as e:
            raise Exception(f"Error getting well data: {str(e)}")
    
    def save_well_data(self, df, dataset_name):
        """Save well data to Dataiku dataset"""
        try:
            dataset = dataiku.Dataset(dataset_name)
            dataset.write_with_schema(df)
            return True
        except Exception as e:
            raise Exception(f"Error saving well data: {str(e)}")

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
            
            # Save to new dataset if specified
            if output_dataset_name:
                self.save_well_data(result_df, output_dataset_name)
                save_message = f" and saved to dataset '{output_dataset_name}'"
            else:
                save_message = ""
            
            return {
                "status": "success",
                "message": f"{calculation_type.upper()} calculation completed{save_message}",
                "calculation_type": calculation_type,
                "rows_processed": len(result_df)
            }
        except Exception as e:
            return {"status": "error", "message": f"Error running calculation: {str(e)}"}

    def _run_vsh_calculation(self, df, params):
        """Run VSH calculation"""
        gr_ma = float(params.get('GR_MA', 30))
        gr_sh = float(params.get('GR_SH', 120))
        input_log = params.get('input_log', 'GR')
        output_log = params.get('output_log', 'VSH_GR')
        
        return calculate_vsh_from_gr(df, input_log, gr_ma, gr_sh, output_log)

    def _run_porosity_calculation(self, df, params):
        """Run porosity calculation"""
        return calculate_porosity(df, params)

    def _run_gsa_calculation(self, df, params):
        """Run GSA calculations"""
        # Run GSA pipeline
        df_rgsa = process_all_wells_rgsa(df, params)
        df_ngsa = process_all_wells_ngsa(df_rgsa, params)
        df_dgsa = process_all_wells_dgsa(df_ngsa, params)
        
        # Process GSA results
        required_cols = ['GR', 'RT', 'NPHI', 'RHOB', 'RGSA', 'NGSA', 'DGSA']
        df_dgsa = df_dgsa.dropna(subset=required_cols)
        
        # Calculate anomalies
        df_dgsa['RGSA_ANOM'] = df_dgsa['RT'] > df_dgsa['RGSA']
        df_dgsa['NGSA_ANOM'] = df_dgsa['NPHI'] < df_dgsa['NGSA']
        df_dgsa['DGSA_ANOM'] = df_dgsa['RHOB'] < df_dgsa['DGSA']
        df_dgsa['SCORE'] = df_dgsa[['RGSA_ANOM', 'NGSA_ANOM', 'DGSA_ANOM']].sum(axis=1)
        
        # Classify zones
        def classify_zone(score):
            if score == 3: return 'Zona Prospek Kuat'
            elif score == 2: return 'Zona Menarik'
            elif score == 1: return 'Zona Lemah'
            else: return 'Non Prospek'
        
        df_dgsa['ZONA'] = df_dgsa['SCORE'].apply(classify_zone)
        
        return df_dgsa

    def _run_rgbe_rpbe_calculation(self, df, params):
        """Run RGBE-RPBE calculations"""
        return process_rgbe_rpbe(df, params)

    def _run_rt_r0_calculation(self, df, params):
        """Run RT-R0 calculations"""
        return process_rt_r0(df, params)

    def _run_swgrad_calculation(self, df, params):
        """Run SWGRAD calculations"""
        # Drop existing SWGRAD columns if they exist
        cols_to_drop = ['SWGRAD'] + [f'SWARRAY_{i}' for i in range(1, 26)]
        df = df.drop(columns=[col for col in cols_to_drop if col in df.columns])
        
        return process_swgrad(df)

    def _run_dns_dnsv_calculation(self, df, params):
        """Run DNS-DNSV calculations"""
        return process_dns_dnsv(df, params)

    def _run_sw_calculation(self, df, params):
        """Run water saturation calculations"""
        return calculate_sw(df, params)

    def _run_rwa_calculation(self, df, params):
        """Run RWA calculations"""
        return calculate_rwa(df, params)

    def _run_interval_normalization(self, df, params):
        """Run interval normalization"""
        log_in_col = params.get('LOG_IN', 'GR')
        log_out_col = params.get('LOG_OUT', 'GR_NORM')
        intervals = params.get('intervals', [])
        
        # Initialize output column
        df[log_out_col] = np.nan
        
        # Process each interval
        for interval in intervals:
            interval_mask = df['MARKER'] == interval
            if interval_mask.sum() == 0:
                continue
                
            log_data = df.loc[interval_mask, log_in_col].dropna().values
            if len(log_data) == 0:
                continue
                
            # Normalize the interval
            low_ref = float(params.get('LOW_REF', 40))
            high_ref = float(params.get('HIGH_REF', 140))
            low_in = int(params.get('LOW_IN', 3))
            high_in = int(params.get('HIGH_IN', 97))
            cutoff_min = float(params.get('CUTOFF_MIN', 0.0))
            cutoff_max = float(params.get('CUTOFF_MAX', 250.0))
            
            normalized = pdu.normalize_numeric_array(
                log_data,
                low_ref=low_ref,
                high_ref=high_ref,
                low_in=low_in,
                high_in=high_in,
                cutoff_min=cutoff_min,
                cutoff_max=cutoff_max
            )
            
            df.loc[interval_mask, log_out_col] = normalized
        
        return df

    # Plotting Methods
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
            if calculation_type == "default" or calculation_type == "log":
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
        # Extract markers and normalize data
        df_marker = extract_markers_with_mean_depth(df)
        df_normalized = normalize_xover(df, 'NPHI', 'RHOB')
        df_normalized = normalize_xover(df_normalized, 'RT', 'RHOB')
        
        # Create plot
        fig = plot_log_default(
            df=df_normalized,
            df_marker=df_marker,
            df_well_marker=df_normalized
        )
        
        return {"status": "success", "figure": fig.to_dict()}

    def _create_normalization_plot(self, df):
        """Create normalization plot"""
        # Validate normalization data
        if 'GR_NORM' not in df.columns or df['GR_NORM'].isnull().all():
            return {"status": "error", "message": "No valid normalization data found"}
        
        # Create plot
        df_marker = extract_markers_with_mean_depth(df)
        fig = plot_normalization(
            df=df,
            df_marker=df_marker,
            df_well_marker=df
        )
        
        return {"status": "success", "figure": fig.to_dict()}

    def _create_vsh_plot(self, df):
        """Create VSH plot"""
        # Check for VSH data
        vsh_col = 'VSH_LINEAR' if 'VSH_LINEAR' in df.columns else 'VSH_GR'
        if vsh_col not in df.columns:
            return {"status": "error", "message": "No VSH data found"}
        
        # Create plot
        df_marker = extract_markers_with_mean_depth(df)
        fig = plot_vsh_linear(
            df=df,
            df_marker=df_marker,
            df_well_marker=df
        )
        
        return {"status": "success", "figure": fig.to_dict()}

    def _create_porosity_plot(self, df):
        """Create porosity plot"""
        # Check required columns
        required_cols = ['VSH', 'PHIE', 'PHIT', 'PHIE_DEN', 'PHIT_DEN']
        if not all(col in df.columns for col in required_cols):
            return {"status": "error", "message": "Missing required porosity data"}
        
        # Create plot
        df_marker = extract_markers_with_mean_depth(df)
        fig = plot_phie_den(
            df=df,
            df_marker=df_marker,
            df_well_marker=df
        )
        
        return {"status": "success", "figure": fig.to_dict()}

    def _create_gsa_plot(self, df):
        """Create GSA plot"""
        # Check required columns
        required_cols = ['GR', 'RT', 'NPHI', 'RHOB', 'RGSA', 'NGSA', 'DGSA']
        if not all(col in df.columns for col in required_cols):
            return {"status": "error", "message": "Missing required GSA data"}
        
        # Create plot
        fig = plot_gsa_main(df)
        
        return {"status": "success", "figure": fig.to_dict()}

    def _create_smoothing_plot(self, df):
        """Create smoothing plot"""
        # Check required columns
        required_cols = ['GR', 'GR_MovingAvg_5', 'GR_MovingAvg_10']
        if not all(col in df.columns for col in required_cols):
            return {"status": "error", "message": "Missing smoothing data"}
        
        # Create plot
        df_marker = extract_markers_with_mean_depth(df)
        fig = plot_smoothing(
            df=df,
            df_marker=df_marker,
            df_well_marker=df
        )
        
        return {"status": "success", "figure": fig.to_dict()}

    def _create_sw_plot(self, df):
        """Create water saturation plot"""
        # Check required columns
        if 'SWE_INDO' not in df.columns:
            return {"status": "error", "message": "Missing water saturation data"}
        
        # Create plot
        df_marker = extract_markers_with_mean_depth(df)
        fig = plot_sw_indo(
            df=df,
            df_marker=df_marker,
            df_well_marker=df
        )
        
        return {"status": "success", "figure": fig.to_dict()}

    def _create_rwa_plot(self, df):
        """Create RWA plot"""
        # Check required columns
        required_cols = ['RWA_FULL', 'RWA_SIMPLE', 'RWA_TAR']
        if not all(col in df.columns for col in required_cols):
            return {"status": "error", "message": "Missing RWA data"}
        
        # Create plot
        df_marker = extract_markers_with_mean_depth(df)
        fig = plot_rwa_indo(
            df=df,
            df_marker=df_marker,
            df_well_marker=df
        )
        
        return {"status": "success", "figure": fig.to_dict()}

    # Additional Helper Methods
    def get_markers_list(self):
        """Get list of markers from current dataset"""
        try:
            if self.current_well_data is None:
                return {"status": "error", "message": "No dataset selected"}
            
            if 'MARKER' not in self.current_well_data.columns:
                return {"status": "error", "message": "MARKER column not found"}
            
            markers = self.current_well_data['MARKER'].unique().tolist()
            return {
                "status": "success",
                "markers": markers,
                "count": len(markers)
            }
        except Exception as e:
            return {"status": "error", "message": f"Error getting markers: {str(e)}"}

    def get_dataset_info(self):
        """Get current dataset information"""
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
        """Validate if current dataset has required columns for calculation"""
        try:
            if self.current_well_data is None:
                return {"status": "error", "message": "No dataset selected"}
            
            requirements = {
                "vsh": ["GR"],
                "porosity": ["NPHI", "RHOB"],
                "gsa": ["GR", "RT", "NPHI", "RHOB"],
                "rgbe_rpbe": ["RT", "PHIE"],
                "rt_r0": ["RT", "PHIE"],
                "swgrad": ["DEPTH", "SW"],
                "dns_dnsv": ["DEPTH", "RT"],
                "sw": ["RT", "PHIE"],
                "rwa": ["RT", "PHIE", "VSH"],
                "normalization": ["GR", "MARKER"]
            }
            
            if calculation_type not in requirements:
                return {"status": "error", "message": f"Unknown calculation type: {calculation_type}"}
            
            required_cols = requirements[calculation_type]
            missing_cols = [col for col in required_cols if col not in self.current_well_data.columns]
            
            if missing_cols:
                return {
                    "status": "error",
                    "message": f"Missing required columns: {', '.join(missing_cols)}",
                    "missing_columns": missing_cols,
                    "required_columns": required_cols
                }
            
            return {
                "status": "success",
                "message": f"All required columns available for {calculation_type}",
                "required_columns": required_cols
            }
        except Exception as e:
            return {"status": "error", "message": f"Error validating requirements: {str(e)}"}

# Global instance for webapp session management
_analysis_instance = None

def get_analysis_instance():
    """Get or create analysis instance"""
    global _analysis_instance
    if _analysis_instance is None:
        _analysis_instance = WellLogAnalysis()
    return _analysis_instance

# API Endpoints for Dataiku WebApp
@app.route('/get_datasets')
def get_datasets():
    """API endpoint to get available datasets"""
    try:
        analysis = get_analysis_instance()
        return analysis.get_available_datasets()
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.route('/select_dataset', methods=['POST'])
def select_dataset():
    """API endpoint to select a dataset"""
    try:
        data = request.get_json()
        dataset_name = data.get('dataset_name')
        analysis = get_analysis_instance()
        return analysis.select_dataset(dataset_name)
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_wells():
    """API endpoint to get wells from selected dataset"""
    try:
        analysis = get_analysis_instance()
        return analysis.get_well_list()
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_well_plot(well_name):
    """API endpoint to get well plot"""
    try:
        analysis = get_analysis_instance()
        return analysis.create_log_plot(well_name)
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_calculation_params(calculation_type):
    """API endpoint to get calculation parameters"""
    try:
        analysis = get_analysis_instance()
        return analysis.get_calculation_parameters(calculation_type)
    except Exception as e:
        return {"status": "error", "message": str(e)}

def run_calculation_endpoint(calculation_type, params, output_dataset=None):
    """API endpoint to run calculation"""
    try:
        analysis = get_analysis_instance()
        return analysis.run_calculation(calculation_type, params, output_dataset)
    except Exception as e:
        return {"status": "error", "message": str(e)}

def save_dataset(dataset_name, data=None):
    """API endpoint to save dataset"""
    try:
        analysis = get_analysis_instance()
        return analysis.save_results_to_new_dataset(dataset_name, data)
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_plot_for_calculation(calculation_type, well_name=None):
    """API endpoint to get plot for calculation"""
    try:
        analysis = get_analysis_instance()
        return analysis.create_plot_for_calculation(calculation_type, well_name)
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_markers():
    """API endpoint to get markers"""
    try:
        analysis = get_analysis_instance()
        return analysis.get_markers_list()
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_dataset_info():
    """API endpoint to get dataset info"""
    try:
        analysis = get_analysis_instance()
        return analysis.get_dataset_info()
    except Exception as e:
        return {"status": "error", "message": str(e)}

def validate_calculation(calculation_type):
    """API endpoint to validate calculation requirements"""
    try:
        analysis = get_analysis_instance()
        return analysis.validate_calculation_requirements(calculation_type)
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_available_columns():
    """API endpoint to get available columns"""
    try:
        analysis = get_analysis_instance()
        return analysis.get_available_columns()
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.route('/first_api_call')
def first_api_call():
    """First API call endpoint for webapp initialization"""
    try:
        return {
            "status": "success", 
            "message": "Well Log Analysis backend is running",
            "timestamp": datetime.now().isoformat(),
            "backend_version": "1.0.0"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Example usage in Dataiku WebApp:
"""
Frontend JavaScript Integration Examples:

1. Get available datasets:
   fetch('/get_datasets')
   .then(response => response.json())
   .then(data => {
       if (data.status === 'success') {
           // Populate dataset dropdown
           populateDatasetDropdown(data.datasets);
       }
   });

2. Select dataset:
   fetch('/select_dataset', {
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify({dataset_name: 'your_dataset_name'})
   })
   .then(response => response.json())
   .then(data => {
       if (data.status === 'success') {
           // Update wells list
           updateWellsList(data.wells);
       }
   });

3. Get well plot:
   fetch('/get_well_plot', {
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify({well_name: 'WELL-001'})
   })
   .then(response => response.json())
   .then(data => {
       if (data.status === 'success') {
           // Display plot using Plotly
           Plotly.newPlot('plot-div', data.figure);
       }
   });

4. Get calculation parameters:
   fetch('/get_calculation_params', {
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify({calculation_type: 'vsh'})
   })
   .then(response => response.json())
   .then(data => {
       if (data.status === 'success') {
           // Display parameter form
           displayParameterForm(data.parameters);
       }
   });

5. Run calculation:
   fetch('/run_calculation_endpoint', {
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify({
           calculation_type: 'vsh',
           params: {GR_MA: 30, GR_SH: 120, input_log: 'GR', output_log: 'VSH_GR'},
           output_dataset: 'vsh_results'
       })
   })
   .then(response => response.json())
   .then(data => {
       if (data.status === 'success') {
           // Show success message and update plot
           showSuccessMessage(data.message);
           updatePlot();
       }
   });

6. Save dataset:
   fetch('/save_dataset', {
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify({dataset_name: 'my_results'})
   })
   .then(response => response.json())
   .then(data => {
       if (data.status === 'success') {
           showSuccessMessage('Dataset saved successfully');
       }
   });

Python Usage Examples:

# Initialize analysis
analysis = WellLogAnalysis()

# Get available datasets
datasets = analysis.get_available_datasets()
print(datasets)

# Select dataset
result = analysis.select_dataset('well_logs_dataset')
print(result)

# Get well list
wells = analysis.get_well_list()
print(wells)

# Get well plot
plot_result = analysis.create_log_plot('WELL-001')
print(plot_result)

# Get calculation parameters
params = analysis.get_calculation_parameters('vsh')
print(params)

# Run VSH calculation
vsh_params = {
    'GR_MA': 30,
    'GR_SH': 120,
    'input_log': 'GR',
    'output_log': 'VSH_GR'
}
result = analysis.run_calculation('vsh', vsh_params, 'vsh_results')
print(result)

# Save results to new dataset
save_result = analysis.save_results_to_new_dataset('final_results')
print(save_result)

# Get plot for calculation
plot_result = analysis.create_plot_for_calculation('vsh', 'WELL-001')
print(plot_result)

# Get markers
markers = analysis.get_markers_list()
print(markers)

# Get dataset info
info = analysis.get_dataset_info()
print(info)

# Validate calculation requirements
validation = analysis.validate_calculation_requirements('vsh')
print(validation)

# Get available columns
columns = analysis.get_available_columns()
print(columns)
"""
