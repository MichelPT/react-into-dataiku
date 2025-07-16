# When creating plugins, it is a good practice to put the specific logic in libraries and keep plugin components (recipes, etc) short. 
# You can add functionalities to this package and/or create new packages under "python-lib"

# Import all services to make them available at package level
from .services.vsh_calculation import calculate_vsh_from_gr
from .services.porosity import calculate_porosity
from .services.depth_matching import depth_matching
from .services.rgsa import process_all_wells_rgsa
from .services.dgsa import process_all_wells_dgsa
from .services.ngsa import process_all_wells_ngsa
from .services.rgbe_rpbe import process_rgbe_rpbe
from .services.rt_r0 import process_rt_r0
from .services.swgrad import process_swgrad
from .services.dns_dnsv import process_dns_dnsv
from .services.sw import calculate_sw
from .services.rwa import calculate_rwa
from .services.vsh_dn import calculate_vsh_dn
from .services.plotting_service import (
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