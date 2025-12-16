// Cloudflare Worker for cross-domain cookie bridge
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    
    // Enable CORS for all origins
    const corsHeaders = {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true'
    };
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Handle both GET and POST requests
    let domain = null;
    
    if (request.method === 'GET') {
      // Extract domain from query parameter
      domain = url.searchParams.get('domain');
    } else if (request.method === 'POST') {
      // Extract domain from POST body
      try {
        const data = await request.json();
        domain = data.domain;
      } catch (e) {
        // Fallback to query parameter
        domain = url.searchParams.get('domain');
      }
    }
    
    if (!domain || domain === '' || domain === 'null') {
      // If no domain or empty, extract from Origin header as fallback
      if (origin) {
        try {
          const originUrl = new URL(origin);
          domain = originUrl.hostname;
        } catch (e) {
          domain = 'unknown-domain.com';
        }
      } else {
        domain = 'localhost';
      }
    }
    
    // Get existing cookie from request
    const cookieHeader = request.headers.get('Cookie') || '';
    const cookieMatch = cookieHeader.match(/ft_first_domain=([^;]+)/);
    const existingFirst = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
    
    let firstDomain = existingFirst;
    let setNow = false;
    
    // Set first domain cookie if not exists
    if (!existingFirst) {
      firstDomain = domain.toLowerCase();
      setNow = true;
    }
    
    const response = {
      type: 'GLOBAL_FIRST_DOMAIN',
      first_domain: firstDomain,
      set_now: setNow
    };
    
    const responseHeaders = {
      ...corsHeaders,
      'Content-Type': 'application/json'
    };
    
    // Set cookie if this is the first visit
    if (setNow) {
      const maxAge = 365 * 24 * 60 * 60; // 365 days in seconds
      responseHeaders['Set-Cookie'] = `ft_first_domain=${encodeURIComponent(firstDomain)}; Max-Age=${maxAge}; Path=/; SameSite=None; Secure`;
    }
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: responseHeaders
    });
  }
};
