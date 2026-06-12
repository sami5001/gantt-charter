"""
Oxford University Plotly Theme
================================
Official Oxford University colors and styling for Plotly visualizations.
Based on Oxford University Brand Guidelines.

Oxford colours: https://communications.admin.ox.ac.uk/communications-resources/visual-identity/identity-guidelines/colours
Oxford theme packs: https://communications.admin.ox.ac.uk/communications-resources/visual-identity/identity-guidelines/theme-packs

Curated by Sami Adnan, 2025

Usage:
------
    from oxford_plotly_theme import (
        apply_oxford_theme,
        OXFORD_COLORS,
        get_color_palette,
        create_oxford_figure
    )
    
    # Apply theme globally
    apply_oxford_theme()
    
    # Or create individual figures with Oxford styling
    fig = create_oxford_figure()
    fig.add_trace(go.Scatter(x=[1,2,3], y=[1,2,3]))
    fig.show()
"""

import plotly.graph_objects as go
import plotly.io as pio
from typing import List, Optional, Dict, Any


# ============================================================================
# OXFORD UNIVERSITY OFFICIAL COLORS
# ============================================================================

class OxfordColors:
    """Official Oxford University brand colors."""
    
    # Primary Color
    OXFORD_BLUE = '#002147'  # RGB(0,33,71) - Pantone 282C
    
    # PHC Department Accent
    OXFORD_PHC = '#8A1751'  # RGB(138,23,81)
    
    # Secondary Colors
    MAUVE = '#776885'  # RGB(119,104,133) - Pantone 667C
    PEACH = '#E08D79'  # RGB(224,141,121) - Pantone 4051C
    POTTERS_PINK = '#ED9390'  # RGB(237,147,144) - Pantone 2339C
    DUSK = '#C4A29E'  # RGB(196,162,158) - Pantone 6030C
    LILAC = '#D1BDD5'  # RGB(209,189,213) - Pantone 524C
    SIENNA = '#994636'  # RGB(153,70,54) - Pantone 4036C
    RED = '#BE0F34'  # RGB(190,15,52) - Pantone 187C
    PLUM = '#7F055F'  # RGB(127,5,95) - Pantone 2425C
    CORAL = '#FE615A'  # RGB(254,97,90) - Pantone 178C
    LAVENDER = '#D4CDF4'  # RGB(212,205,244) - Pantone 2635C
    ORANGE = '#FB5607'  # RGB(251,86,7) - Pantone 1655C
    PINK = '#E6007E'  # RGB(230,0,126) - Pantone 2385C
    GREEN = '#426A5A'  # RGB(66,106,90) - Pantone 5545C
    OCEAN_GREY = '#789E9E'  # RGB(120,158,158) - Pantone 2211C
    YELLOW_OCHRE = '#E2C044'  # RGB(226,192,68) - Pantone 4016C
    COOL_GREY = '#E4F0EF'  # RGB(228,240,239) - Pantone 7541C
    SKY_BLUE = '#B9D6F2'  # RGB(185,214,242) - Pantone 277C
    SAGE_GREEN = '#A0AF84'  # RGB(160,175,132) - Pantone 7494C
    VIRIDIAN = '#15616D'  # RGB(21,97,109) - Pantone 5473C
    ROYAL_BLUE = '#1D42A6'  # RGB(29,66,166) - Pantone 2126C
    AQUA = '#00AAB4'  # RGB(0,170,180) - Pantone 7710C
    VIVID_GREEN = '#65E5AE'  # RGB(101,229,174) - Pantone 3385C
    LIME_GREEN = '#95C11F'  # RGB(149,193,31) - Pantone 2292C
    CERULEAN_BLUE = '#49B6FF'  # RGB(73,182,255) - Pantone 292C
    LEMON_YELLOW = '#F7EF66'  # RGB(247,239,102) - Pantone 3935C
    
    # Neutral Colors
    CHARCOAL = '#211D1C'  # RGB(33,29,28) - Pantone 419C
    ASH_GREY = '#61615F'  # RGB(97,97,95) - Pantone 6215C
    UMBER = '#89827A'  # RGB(137,130,122) - Pantone 403C
    STONE_GREY = '#D9D8D6'  # RGB(217,216,214) - Pantone Cool Gray 1C
    SHELL_GREY = '#F1EEE9'  # RGB(241,238,233) - Pantone Warm Gray 1C
    OFF_WHITE = '#F2F0F0'  # RGB(242,240,240) - Pantone 663C
    
    # Metallic Colors
    GOLD = '#FFD700'  # RGB(255,215,0) - Pantone 10122C
    SILVER = '#C0C0C0'  # RGB(192,192,192) - Pantone 10103C


# Convenience dictionary for easy access
OXFORD_COLORS = {
    'oxford_blue': OxfordColors.OXFORD_BLUE,
    'oxford_phc': OxfordColors.OXFORD_PHC,
    'mauve': OxfordColors.MAUVE,
    'peach': OxfordColors.PEACH,
    'potters_pink': OxfordColors.POTTERS_PINK,
    'dusk': OxfordColors.DUSK,
    'lilac': OxfordColors.LILAC,
    'sienna': OxfordColors.SIENNA,
    'red': OxfordColors.RED,
    'plum': OxfordColors.PLUM,
    'coral': OxfordColors.CORAL,
    'lavender': OxfordColors.LAVENDER,
    'orange': OxfordColors.ORANGE,
    'pink': OxfordColors.PINK,
    'green': OxfordColors.GREEN,
    'ocean_grey': OxfordColors.OCEAN_GREY,
    'yellow_ochre': OxfordColors.YELLOW_OCHRE,
    'cool_grey': OxfordColors.COOL_GREY,
    'sky_blue': OxfordColors.SKY_BLUE,
    'sage_green': OxfordColors.SAGE_GREEN,
    'viridian': OxfordColors.VIRIDIAN,
    'royal_blue': OxfordColors.ROYAL_BLUE,
    'aqua': OxfordColors.AQUA,
    'vivid_green': OxfordColors.VIVID_GREEN,
    'lime_green': OxfordColors.LIME_GREEN,
    'cerulean_blue': OxfordColors.CERULEAN_BLUE,
    'lemon_yellow': OxfordColors.LEMON_YELLOW,
    'charcoal': OxfordColors.CHARCOAL,
    'ash_grey': OxfordColors.ASH_GREY,
    'umber': OxfordColors.UMBER,
    'stone_grey': OxfordColors.STONE_GREY,
    'shell_grey': OxfordColors.SHELL_GREY,
    'off_white': OxfordColors.OFF_WHITE,
    'gold': OxfordColors.GOLD,
    'silver': OxfordColors.SILVER,
}


# ============================================================================
# COLOR PALETTES
# ============================================================================

class ColorPalettes:
    """Pre-defined color palettes for different visualization needs."""
    
    # Primary palette - most commonly used colors
    PRIMARY = [
        OxfordColors.OXFORD_BLUE,
        OxfordColors.CORAL,
        OxfordColors.AQUA,
        OxfordColors.YELLOW_OCHRE,
        OxfordColors.PLUM,
        OxfordColors.SAGE_GREEN,
        OxfordColors.ORANGE,
        OxfordColors.SKY_BLUE,
        OxfordColors.PINK,
        OxfordColors.VIRIDIAN,
    ]
    
    # Professional palette - suitable for business/academic presentations
    PROFESSIONAL = [
        OxfordColors.OXFORD_BLUE,
        OxfordColors.ASH_GREY,
        OxfordColors.GREEN,
        OxfordColors.SIENNA,
        OxfordColors.ROYAL_BLUE,
        OxfordColors.UMBER,
    ]
    
    # Vibrant palette - for eye-catching visualizations
    VIBRANT = [
        OxfordColors.CORAL,
        OxfordColors.AQUA,
        OxfordColors.ORANGE,
        OxfordColors.PINK,
        OxfordColors.VIVID_GREEN,
        OxfordColors.CERULEAN_BLUE,
        OxfordColors.LEMON_YELLOW,
    ]
    
    # Pastel palette - for softer visualizations
    PASTEL = [
        OxfordColors.SKY_BLUE,
        OxfordColors.PEACH,
        OxfordColors.LILAC,
        OxfordColors.SAGE_GREEN,
        OxfordColors.POTTERS_PINK,
        OxfordColors.LAVENDER,
        OxfordColors.COOL_GREY,
    ]
    
    # Diverging palette - for data with a meaningful center point
    DIVERGING = [
        OxfordColors.CORAL,
        OxfordColors.PEACH,
        OxfordColors.STONE_GREY,
        OxfordColors.SKY_BLUE,
        OxfordColors.OXFORD_BLUE,
    ]
    
    # Sequential palette - for continuous data
    SEQUENTIAL_BLUE = [
        OxfordColors.SKY_BLUE,
        OxfordColors.CERULEAN_BLUE,
        OxfordColors.ROYAL_BLUE,
        OxfordColors.OXFORD_BLUE,
        OxfordColors.CHARCOAL,
    ]
    
    # Health/Medical palette - suitable for PHC department
    HEALTH = [
        OxfordColors.OXFORD_PHC,
        OxfordColors.PLUM,
        OxfordColors.CORAL,
        OxfordColors.AQUA,
        OxfordColors.SAGE_GREEN,
    ]

    # --- Oxford Theme Packs ---

    # Traditional Theme - Heritage and stability
    TRADITIONAL = [
        OxfordColors.OXFORD_BLUE,
        OxfordColors.RED,
        OxfordColors.GREEN,
        OxfordColors.GOLD,
        OxfordColors.CHARCOAL,
        OxfordColors.STONE_GREY
    ]

    # Contemporary Theme - Modern and clean
    CONTEMPORARY = [
        OxfordColors.MAUVE,
        OxfordColors.PEACH,
        OxfordColors.DUSK,
        OxfordColors.OCEAN_GREY,
        OxfordColors.SIENNA,
        OxfordColors.COOL_GREY
    ]

    # Celebratory Theme - Festive and bright
    CELEBRATORY = [
        OxfordColors.PINK,
        OxfordColors.ORANGE,
        OxfordColors.CORAL,
        OxfordColors.YELLOW_OCHRE,
        OxfordColors.VIVID_GREEN,
        OxfordColors.SKY_BLUE
    ]

    # Corporate Theme - Professional
    CORPORATE = [
        OxfordColors.OXFORD_BLUE,
        OxfordColors.ROYAL_BLUE,
        OxfordColors.CHARCOAL,
        OxfordColors.ASH_GREY,
        OxfordColors.STONE_GREY,
        OxfordColors.OFF_WHITE
    ]

    # Innovative Theme - Forward-looking and tech-focused
    INNOVATIVE = [
        OxfordColors.AQUA,
        OxfordColors.VIVID_GREEN,
        OxfordColors.CERULEAN_BLUE,
        OxfordColors.LIME_GREEN,
        OxfordColors.VIRIDIAN,
        OxfordColors.ELECTRIC_BLUE if hasattr(OxfordColors, 'ELECTRIC_BLUE') else OxfordColors.SKY_BLUE
    ]


def get_color_palette(palette_name: str = 'primary', n_colors: Optional[int] = None) -> List[str]:
    """
    Get a color palette by name.
    
    Parameters:
    -----------
    palette_name : str
        Name of the palette ('primary', 'professional', 'vibrant', 'pastel', 
        'diverging', 'sequential_blue', 'health', 'traditional', 'contemporary',
        'celebratory', 'corporate', 'innovative')
    n_colors : int, optional
        Number of colors to return. If None, returns all colors in palette.
        If more colors requested than available, cycles through the palette.
    
    Returns:
    --------
    List[str]
        List of color hex codes
    
    Example:
    --------
    >>> colors = get_color_palette('vibrant', n_colors=5)
    >>> fig.update_traces(marker=dict(color=colors))
    """
    palettes = {
        'primary': ColorPalettes.PRIMARY,
        'professional': ColorPalettes.PROFESSIONAL,
        'vibrant': ColorPalettes.VIBRANT,
        'pastel': ColorPalettes.PASTEL,
        'diverging': ColorPalettes.DIVERGING,
        'sequential_blue': ColorPalettes.SEQUENTIAL_BLUE,
        'health': ColorPalettes.HEALTH,
        'traditional': ColorPalettes.TRADITIONAL,
        'contemporary': ColorPalettes.CONTEMPORARY,
        'celebratory': ColorPalettes.CELEBRATORY,
        'corporate': ColorPalettes.CORPORATE,
        'innovative': ColorPalettes.INNOVATIVE,
    }
    
    palette = palettes.get(palette_name.lower(), ColorPalettes.PRIMARY)
    
    if n_colors is None:
        return palette
    
    # If requesting more colors than available, cycle through
    if n_colors > len(palette):
        return [palette[i % len(palette)] for i in range(n_colors)]
    
    return palette[:n_colors]


# ============================================================================
# OXFORD PLOTLY THEME
# ============================================================================

def get_oxford_template() -> go.layout.Template:
    """
    Create a Plotly template with Oxford University styling.
    
    Returns:
    --------
    go.layout.Template
        Plotly template object with Oxford styling
    """
    template = go.layout.Template()
    
    # Set color sequence
    template.layout.colorway = ColorPalettes.PRIMARY
    
    # Layout styling
    template.layout.update(
        font=dict(
            family="Arial, sans-serif",
            size=12,
            color=OxfordColors.ASH_GREY
        ),
        title=dict(
            font=dict(
                family="Arial, sans-serif",
                size=18,
                color=OxfordColors.ASH_GREY,
                weight='bold'
            ),
            x=0.5,
            xanchor='center'
        ),
        paper_bgcolor=OxfordColors.OFF_WHITE,
        plot_bgcolor='white',
        
        # Axis styling
        xaxis=dict(
            showgrid=True,
            gridcolor=OxfordColors.STONE_GREY,
            gridwidth=1,
            showline=True,
            linecolor=OxfordColors.ASH_GREY,
            linewidth=1.5,
            mirror=False,
            zeroline=False,
            title=dict(
                font=dict(
                    size=14,
                    color=OxfordColors.ASH_GREY
                )
            ),
            tickfont=dict(
                size=11,
                color=OxfordColors.ASH_GREY
            )
        ),
        yaxis=dict(
            showgrid=True,
            gridcolor=OxfordColors.STONE_GREY,
            gridwidth=1,
            showline=True,
            linecolor=OxfordColors.ASH_GREY,
            linewidth=1.5,
            mirror=False,
            zeroline=False,
            title=dict(
                font=dict(
                    size=14,
                    color=OxfordColors.ASH_GREY
                )
            ),
            tickfont=dict(
                size=11,
                color=OxfordColors.ASH_GREY
            )
        ),
        
        # Legend styling
        legend=dict(
            bgcolor='rgba(255,255,255,0.8)',
            bordercolor=OxfordColors.STONE_GREY,
            borderwidth=1,
            font=dict(
                size=11,
                color=OxfordColors.ASH_GREY
            )
        ),
        
        # Hover label styling
        hoverlabel=dict(
            bgcolor='white',
            bordercolor=OxfordColors.OXFORD_BLUE,
            font=dict(
                family="Arial, sans-serif",
                size=11,
                color=OxfordColors.ASH_GREY
            )
        )
    )
    
    # Trace styling defaults
    template.data.scatter = [go.Scatter(
        marker=dict(
            line=dict(width=0.5, color='white')
        )
    )]
    
    template.data.bar = [go.Bar(
        marker=dict(
            line=dict(width=0.5, color='white')
        )
    )]
    
    return template


def apply_oxford_theme(as_default: bool = True):
    """
    Apply the Oxford University theme to Plotly.
    
    Parameters:
    -----------
    as_default : bool
        If True, sets Oxford theme as the default template.
        If False, registers the theme but doesn't set it as default.
    
    Example:
    --------
    >>> apply_oxford_theme()
    >>> fig = go.Figure(data=go.Scatter(x=[1,2,3], y=[1,2,3]))
    >>> fig.show()  # Will use Oxford styling automatically
    """
    oxford_template = get_oxford_template()
    pio.templates['oxford'] = oxford_template
    
    if as_default:
        pio.templates.default = 'oxford'


# ============================================================================
# CONVENIENCE FUNCTIONS
# ============================================================================

def create_oxford_figure(
    title: Optional[str] = None,
    xaxis_title: Optional[str] = None,
    yaxis_title: Optional[str] = None,
    width: Optional[int] = None,
    height: Optional[int] = None,
    palette: str = 'primary',
    **kwargs
) -> go.Figure:
    """
    Create a Plotly figure with Oxford styling.
    
    Parameters:
    -----------
    title : str, optional
        Figure title
    xaxis_title : str, optional
        X-axis label
    yaxis_title : str, optional
        Y-axis label
    width : int, optional
        Figure width in pixels
    height : int, optional
        Figure height in pixels
    palette : str, optional
        Color palette to use ('primary', 'professional', 'vibrant', 'traditional',
        'contemporary', 'celebratory', 'corporate', 'innovative', etc.)
    **kwargs
        Additional keyword arguments passed to go.Figure()
    
    Returns:
    --------
    go.Figure
        Configured Plotly figure
    
    Example:
    --------
    >>> fig = create_oxford_figure(
    ...     title="Sales Over Time",
    ...     xaxis_title="Month",
    ...     yaxis_title="Revenue (£)",
    ...     palette='professional'
    ... )
    >>> fig.add_trace(go.Scatter(x=months, y=sales))
    >>> fig.show()
    """
    # Ensure oxford template is available
    if 'oxford' not in pio.templates:
        apply_oxford_theme(as_default=False)
    
    # Create base figure, apply template afterward to avoid constructor issues
    fig = go.Figure(**kwargs)
    fig.update_layout(template=pio.templates['oxford'])
    
    # Update layout
    layout_updates = {}
    if title:
        layout_updates['title'] = title
    if xaxis_title:
        layout_updates['xaxis_title'] = xaxis_title
    if yaxis_title:
        layout_updates['yaxis_title'] = yaxis_title
    if width:
        layout_updates['width'] = width
    if height:
        layout_updates['height'] = height
    
    # Set color palette
    layout_updates['colorway'] = get_color_palette(palette)
    
    if layout_updates:
        fig.update_layout(**layout_updates)
    
    return fig


def add_oxford_branding(
    fig: go.Figure,
    add_watermark: bool = False,
    watermark_text: str = "Oxford University",
    position: str = "bottom_right"
) -> go.Figure:
    """
    Add Oxford branding elements to a figure.
    
    Parameters:
    -----------
    fig : go.Figure
        The figure to add branding to
    add_watermark : bool
        Whether to add a text watermark
    watermark_text : str
        Text for the watermark
    position : str
        Position of watermark ('bottom_right', 'bottom_left', 'top_right', 'top_left')
    
    Returns:
    --------
    go.Figure
        Figure with branding elements added
    
    Example:
    --------
    >>> fig = create_oxford_figure()
    >>> fig.add_trace(go.Bar(x=['A','B','C'], y=[1,2,3]))
    >>> fig = add_oxford_branding(fig, add_watermark=True)
    """
    if add_watermark:
        positions = {
            'bottom_right': dict(x=0.99, y=0.01, xanchor='right', yanchor='bottom'),
            'bottom_left': dict(x=0.01, y=0.01, xanchor='left', yanchor='bottom'),
            'top_right': dict(x=0.99, y=0.99, xanchor='right', yanchor='top'),
            'top_left': dict(x=0.01, y=0.99, xanchor='left', yanchor='top'),
        }
        
        pos = positions.get(position, positions['bottom_right'])
        
        fig.add_annotation(
            text=watermark_text,
            xref="paper",
            yref="paper",
            x=pos['x'],
            y=pos['y'],
            xanchor=pos['xanchor'],
            yanchor=pos['yanchor'],
            showarrow=False,
            font=dict(
                size=10,
                color=OxfordColors.STONE_GREY
            ),
            opacity=0.5
        )
    
    return fig


def save_oxford_figure(
    fig: go.Figure,
    filename: str,
    format: str = 'png',
    width: Optional[int] = None,
    height: Optional[int] = None,
    scale: float = 2.0
):
    """
    Save a figure with high quality settings suitable for publications.
    
    Parameters:
    -----------
    fig : go.Figure
        Figure to save
    filename : str
        Output filename (without extension)
    format : str
        Output format ('png', 'pdf', 'svg', 'html')
    width : int, optional
        Width in pixels
    height : int, optional
        Height in pixels
    scale : float
        Scale factor for raster formats (higher = better quality)
    
    Example:
    --------
    >>> fig = create_oxford_figure()
    >>> save_oxford_figure(fig, 'my_plot', format='pdf', width=800, height=600)
    """
    if format.lower() == 'html':
        fig.write_html(f"{filename}.html")
    else:
        fig.write_image(
            f"{filename}.{format}",
            width=width,
            height=height,
            scale=scale
        )


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

def _example_usage():
    """Demonstrate the usage of the Oxford Plotly theme."""
    import numpy as np
    
    # Apply theme globally
    apply_oxford_theme()
    
    # Example 1: Simple line plot
    x = np.linspace(0, 10, 100)
    fig1 = create_oxford_figure(
        title="Example Line Plot",
        xaxis_title="Time (s)",
        yaxis_title="Value",
        palette='primary'
    )
    fig1.add_trace(go.Scatter(x=x, y=np.sin(x), name='sin(x)', mode='lines'))
    fig1.add_trace(go.Scatter(x=x, y=np.cos(x), name='cos(x)', mode='lines'))
    
    # Example 2: Bar chart with professional palette
    categories = ['Category A', 'Category B', 'Category C', 'Category D']
    values = [23, 45, 56, 78]
    fig2 = create_oxford_figure(
        title="Example Bar Chart",
        xaxis_title="Category",
        yaxis_title="Count",
        palette='professional'
    )
    fig2.add_trace(go.Bar(x=categories, y=values))
    
    # Example 3: Using specific colors
    fig3 = go.Figure(template='oxford')
    fig3.add_trace(go.Scatter(
        x=[1, 2, 3, 4],
        y=[10, 11, 12, 13],
        marker=dict(color=OxfordColors.OXFORD_BLUE),
        name='Oxford Blue'
    ))
    fig3.add_trace(go.Scatter(
        x=[1, 2, 3, 4],
        y=[16, 5, 11, 9],
        marker=dict(color=OxfordColors.CORAL),
        name='Coral'
    ))
    fig3.update_layout(title="Example with Specific Colors")
    
    return fig1, fig2, fig3
