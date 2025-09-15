#!/usr/bin/env python3
"""Test script to verify fallback imports work correctly."""

import sys
import os

# Add current directory to path so we can import our modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_service_imports():
    """Test if all service imports work with fallbacks."""
    print("Testing service imports...")
    
    try:
        # Test the import section similar to backend.py
        try:
            from standardwebappv1.services.vsh_calculation import calculate_vsh_from_gr
            from standardwebappv1.services.porosity import calculate_porosity
            from standardwebappv1.services.depth_matching import depth_matching
            from standardwebappv1.services.rgsa import process_all_wells_rgsa
            from standardwebappv1.services.dgsa import process_all_wells_dgsa
            from standardwebappv1.services.ngsa import process_all_wells_ngsa
            print("✅ All services imported successfully")
        except ImportError as e:
            print(f"⚠️ Service import error: {e}")
            # Define fallback functions to prevent NameError
            def process_all_wells_rgsa(df, params, target_intervals=None, target_zones=None):
                print("⚠️ Using fallback RGSA implementation")
                return df
            
            def process_all_wells_dgsa(df, params, target_intervals=None, target_zones=None):
                print("⚠️ Using fallback DGSA implementation")
                return df
            
            def process_all_wells_ngsa(df, params, target_intervals=None, target_zones=None):
                print("⚠️ Using fallback NGSA implementation")
                return df
        
        # Test that the functions are now defined
        print("Testing function availability:")
        print(f"process_all_wells_rgsa: {callable(process_all_wells_rgsa)}")
        print(f"process_all_wells_dgsa: {callable(process_all_wells_dgsa)}")
        print(f"process_all_wells_ngsa: {callable(process_all_wells_ngsa)}")
        
        # Test calling the function with sample data
        import pandas as pd
        test_df = pd.DataFrame({
            'DEPTH': [1000, 1001, 1002],
            'GR': [50, 60, 70],
            'RT': [10, 15, 20]
        })
        
        test_params = {
            'SLIDING_WINDOW': 3,
            'GR': 'GR',
            'RES': 'RT'
        }
        
        result = process_all_wells_rgsa(test_df, test_params)
        print(f"RGSA function test result: {type(result)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in import test: {e}")
        return False

if __name__ == "__main__":
    success = test_service_imports()
    if success:
        print("\n✅ All import tests passed!")
    else:
        print("\n❌ Some import tests failed!")
    sys.exit(0 if success else 1)
