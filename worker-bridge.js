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
    
    // Extract domain from Origin header (primary method)
    let domain = null;
    
    if (origin) {
      try {
        const originUrl = new URL(origin);
        domain = originUrl.hostname.toLowerCase();
      } catch (e) {
        domain = 'unknown-domain.com';
      }
    } else {
      // Fallback: try to get from request body/query if Origin missing
      if (request.method === 'POST') {
        try {
          const data = await request.json();
          domain = data.domain || 'no-origin.com';
        } catch (e) {
          domain = 'no-origin.com';
        }
      } else if (request.method === 'GET') {
        domain = url.searchParams.get('domain') || 'no-origin.com';
      } else {
        domain = 'unknown-domain.com';
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
