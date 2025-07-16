from dataiku.customwebapp import *

# Access the parameters that end-users filled in using webapp config
# For example, for a parameter called "input_dataset"
# input_dataset = get_webapp_config()["input_dataset"]

import dataiku
import pandas as pd
import numpy as np
from dataiku import pandasutils as pdu
from scipy.stats import linregress
from services.vsh_calculation import calculate_vsh_from_gr
from services.porosity import calculate_porosity
from services.depth_matching import depth_matching
from services.rgsa import process_all_wells_rgsa
from services.dgsa import process_all_wells_dgsa
from services.ngsa import process_all_wells_ngsa
from services.rgbe_rpbe import process_rgbe_rpbe
from services.rt_r0 import process_rt_r0
from services.swgrad import process_swgrad
from services.dns_dnsv import process_dns_dnsv
from services.sw import calculate_sw
from services.rwa import calculate_rwa
from services.vsh_dn import calculate_vsh_dn
from services.plotting_service import (
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
    
    def get_well_data(self, dataset_name):
        """Get well data from Dataiku dataset"""
        dataset = dataiku.Dataset(dataset_name)
        return dataset.get_dataframe()
    
    def save_well_data(self, df, dataset_name):
        """Save well data to Dataiku dataset"""
        dataset = dataiku.Dataset(dataset_name)
        dataset.write_with_schema(df)

    def run_vsh_calculation(self, input_dataset_name, output_dataset_name, params):
        """Run VSH calculation on well data"""
        try:
            # Get input data
            df = self.get_well_data(input_dataset_name)
            
            # Extract parameters
            gr_ma = float(params.get('GR_MA', 30))
            gr_sh = float(params.get('GR_SH', 120))
            input_log = params.get('input_log', 'GR')
            output_log = params.get('output_log', 'VSH_GR')
            
            # Process VSH calculation
            df_processed = calculate_vsh_from_gr(df, input_log, gr_ma, gr_sh, output_log)
            
            # Save results
            self.save_well_data(df_processed, output_dataset_name)
            
            return {"status": "success", "message": "VSH calculation completed"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def run_porosity_calculation(self, input_dataset_name, output_dataset_name, params):
        """Run porosity calculation"""
        try:
            df = self.get_well_data(input_dataset_name)
            df_processed = calculate_porosity(df, params)
            self.save_well_data(df_processed, output_dataset_name)
            return {"status": "success", "message": "Porosity calculation completed"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def run_gsa_calculation(self, input_dataset_name, output_dataset_name, params):
        """Run GSA calculations"""
        try:
            df = self.get_well_data(input_dataset_name)
            
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
            
            # Save results
            self.save_well_data(df_dgsa, output_dataset_name)
            
            return {"status": "success", "message": "GSA calculation completed"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def run_rgbe_rpbe_calculation(self, input_dataset_name, output_dataset_name, params):
        """Run RGBE-RPBE calculations"""
        try:
            df = self.get_well_data(input_dataset_name)
            df_processed = process_rgbe_rpbe(df, params)
            self.save_well_data(df_processed, output_dataset_name)
            return {"status": "success", "message": "RGBE-RPBE calculation completed"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def run_rt_r0_calculation(self, input_dataset_name, output_dataset_name, params):
        """Run RT-R0 calculations"""
        try:
            df = self.get_well_data(input_dataset_name)
            df_processed = process_rt_r0(df, params)
            self.save_well_data(df_processed, output_dataset_name)
            return {"status": "success", "message": "RT-R0 calculation completed"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def run_swgrad_calculation(self, input_dataset_name, output_dataset_name):
        """Run SWGRAD calculations"""
        try:
            df = self.get_well_data(input_dataset_name)
            
            # Drop existing SWGRAD columns if they exist
            cols_to_drop = ['SWGRAD'] + [f'SWARRAY_{i}' for i in range(1, 26)]
            df = df.drop(columns=[col for col in cols_to_drop if col in df.columns])
            
            # Process SWGRAD
            df_processed = process_swgrad(df)
            self.save_well_data(df_processed, output_dataset_name)
            
            return {"status": "success", "message": "SWGRAD calculation completed"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def run_dns_dnsv_calculation(self, input_dataset_name, output_dataset_name, params):
        """Run DNS-DNSV calculations"""
        try:
            df = self.get_well_data(input_dataset_name)
            df_processed = process_dns_dnsv(df, params)
            self.save_well_data(df_processed, output_dataset_name)
            return {"status": "success", "message": "DNS-DNSV calculation completed"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def run_sw_calculation(self, input_dataset_name, output_dataset_name, params):
        """Run water saturation calculations"""
        try:
            df = self.get_well_data(input_dataset_name)
            df_processed = calculate_sw(df, params)
            self.save_well_data(df_processed, output_dataset_name)
            return {"status": "success", "message": "Water saturation calculation completed"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def run_rwa_calculation(self, input_dataset_name, output_dataset_name, params):
        """Run RWA calculations"""
        try:
            df = self.get_well_data(input_dataset_name)
            df_processed = calculate_rwa(df, params)
            self.save_well_data(df_processed, output_dataset_name)
            return {"status": "success", "message": "RWA calculation completed"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def run_interval_normalization(self, input_dataset_name, output_dataset_name, params, intervals):
        """Run interval normalization"""
        try:
            df = self.get_well_data(input_dataset_name)
            
            log_in_col = params.get('LOG_IN', 'GR')
            log_out_col = params.get('LOG_OUT', 'GR_NORM')
            
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
            
            # Save results
            self.save_well_data(df, output_dataset_name)
            return {"status": "success", "message": "Interval normalization completed"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    # Plotting Methods
    def create_default_log_plot(self, input_dataset_name):
        """Create default log plot"""
        try:
            df = self.get_well_data(input_dataset_name)
            
            # Extract markers and normalize data
            df_marker = extract_markers_with_mean_depth(df)
            df = normalize_xover(df, 'NPHI', 'RHOB')
            df = normalize_xover(df, 'RT', 'RHOB')
            
            # Create plot
            fig = plot_log_default(
                df=df,
                df_marker=df_marker,
                df_well_marker=df
            )
            
            return {"status": "success", "figure": fig.to_dict()}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def create_normalization_plot(self, input_dataset_name):
        """Create normalization plot"""
        try:
            df = self.get_well_data(input_dataset_name)
            
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
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def create_vsh_plot(self, input_dataset_name):
        """Create VSH plot"""
        try:
            df = self.get_well_data(input_dataset_name)
            
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
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def create_porosity_plot(self, input_dataset_name):
        """Create porosity plot"""
        try:
            df = self.get_well_data(input_dataset_name)
            
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
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def create_gsa_plot(self, input_dataset_name):
        """Create GSA plot"""
        try:
            df = self.get_well_data(input_dataset_name)
            
            # Check required columns
            required_cols = ['GR', 'RT', 'NPHI', 'RHOB', 'RGSA', 'NGSA', 'DGSA']
            if not all(col in df.columns for col in required_cols):
                return {"status": "error", "message": "Missing required GSA data"}
            
            # Create plot
            fig = plot_gsa_main(df)
            
            return {"status": "success", "figure": fig.to_dict()}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def create_smoothing_plot(self, input_dataset_name):
        """Create smoothing plot"""
        try:
            df = self.get_well_data(input_dataset_name)
            
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
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def create_sw_plot(self, input_dataset_name):
        """Create water saturation plot"""
        try:
            df = self.get_well_data(input_dataset_name)
            
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
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def create_rwa_plot(self, input_dataset_name):
        """Create RWA plot"""
        try:
            df = self.get_well_data(input_dataset_name)
            
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
        except Exception as e:
            return {"status": "error", "message": str(e)}

# Example usage in Dataiku:
"""
# In your Dataiku Python recipe:
from api import WellLogAnalysis

# Initialize the analysis object
analysis = WellLogAnalysis()

# Run VSH calculation
params = {
    'GR_MA': 30,
    'GR_SH': 120,
    'input_log': 'GR',
    'output_log': 'VSH_GR'
}
result = analysis.run_vsh_calculation('input_dataset', 'output_dataset', params)
print(result)

# Run porosity calculation
porosity_params = {
    'PHIE_METHOD': 'density',
    'RHO_MA': 2.65,
    'RHO_FL': 1.0
}
result = analysis.run_porosity_calculation('input_dataset', 'porosity_results', porosity_params)
print(result)

# Run GSA calculation
gsa_params = {
    'window_size': 50,
    'overlap': 25
}
result = analysis.run_gsa_calculation('input_dataset', 'gsa_results', gsa_params)
print(result)
"""
