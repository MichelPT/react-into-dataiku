from dataiku.customwebapp import *
import json
import traceback
from datetime import datetime
import dataiku
import pandas as pd
import numpy as np
from dataiku import pandasutils as pdu
from scipy.stats import linregress

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
            
            # Extract markers and normalize data
            df_marker = extract_markers_with_mean_depth(well_data)
            well_data_normalized = normalize_xover(well_data, 'NPHI', 'RHOB') if 'NPHI' in well_data.columns and 'RHOB' in well_data.columns else well_data
            
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
            elif calculation_type == "sw":
                result_df = self._run_sw_calculation(df, params)
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
            else:
                return {"status": "error", "message": f"Unknown plot type: {calculation_type}"}
                
        except Exception as e:
            return {"status": "error", "message": f"Error creating plot: {str(e)}"}
    
    def _create_default_log_plot(self, df):
        """Create default log plot"""
        try:
            # Extract markers and normalize data
            df_marker = extract_markers_with_mean_depth(df)
            df_normalized = normalize_xover(df, 'NPHI', 'RHOB') if 'NPHI' in df.columns and 'RHOB' in df.columns else df
            
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
            vsh_col = 'VSH_GR' if 'VSH_GR' in df.columns else None
            if not vsh_col:
                return {"status": "error", "message": "No VSH data found"}
            
            df_marker = extract_markers_with_mean_depth(df)
            fig = plot_log_default(df, df_marker, df)
            
            return {"status": "success", "figure": fig.to_dict()}
        except Exception as e:
            return {"status": "error", "message": f"Error creating VSH plot: {str(e)}"}
    
    def _create_porosity_plot(self, df):
        """Create porosity plot"""
        try:
            if 'PHIE' not in df.columns:
                return {"status": "error", "message": "No porosity data found"}
            
            df_marker = extract_markers_with_mean_depth(df)
            fig = plot_log_default(df, df_marker, df)
            
            return {"status": "success", "figure": fig.to_dict()}
        except Exception as e:
            return {"status": "error", "message": f"Error creating porosity plot: {str(e)}"}
    
    def _create_gsa_plot(self, df):
        """Create GSA plot"""
        try:
            required_cols = ['RGSA', 'NGSA', 'DGSA']
            if not all(col in df.columns for col in required_cols):
                return {"status": "error", "message": "Missing GSA data"}
            
            fig = plot_log_default(df, None, df)
            return {"status": "success", "figure": fig.to_dict()}
        except Exception as e:
            return {"status": "error", "message": f"Error creating GSA plot: {str(e)}"}
    
    def _create_normalization_plot(self, df):
        """Create normalization plot"""
        try:
            if 'GR_NORM' not in df.columns:
                return {"status": "error", "message": "No normalization data found"}
            
            df_marker = extract_markers_with_mean_depth(df)
            fig = plot_log_default(df, df_marker, df)
            
            return {"status": "success", "figure": fig.to_dict()}
        except Exception as e:
            return {"status": "error", "message": f"Error creating normalization plot: {str(e)}"}
    
    def _create_sw_plot(self, df):
        """Create water saturation plot"""
        try:
            if 'SW' not in df.columns:
                return {"status": "error", "message": "No water saturation data found"}
            
            df_marker = extract_markers_with_mean_depth(df)
            fig = plot_log_default(df, df_marker, df)
            
            return {"status": "success", "figure": fig.to_dict()}
        except Exception as e:
            return {"status": "error", "message": f"Error creating SW plot: {str(e)}"}

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
        # Return basic parameter structure
        return json.dumps({
            "status": "success",
            "calculation_type": calculation_type,
            "parameters": {"title": f"{calculation_type.upper()} Parameters"}
        })
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
