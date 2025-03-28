"""
Utility functions for the SynthWave Social application
"""
from urllib.parse import urlparse as urllib_urlparse

# Create a compatibility layer for url_parse
def url_parse(url):
    """
    Compatibility function for werkzeug.urls.url_parse
    Uses urllib.parse.urlparse instead
    """
    parsed = urllib_urlparse(url)
    
    # Create an object with the same interface as werkzeug's url_parse
    class ParsedURL:
        def __init__(self, parsed_url):
            self.parsed_url = parsed_url
            self.netloc = parsed_url.netloc
            self.path = parsed_url.path
            self.query = parsed_url.query
            self.fragment = parsed_url.fragment
            self.scheme = parsed_url.scheme
            
    return ParsedURL(parsed)
