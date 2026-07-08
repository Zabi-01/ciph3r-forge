import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { page_path, module, operation, details, recipe_name } = await req.json();
    
    // Create activity log
    await base44.entities.UserActivityLog.create({
      user_email: user.email,
      module: module || 'Navigation',
      operation: operation || 'page_visit',
      timestamp: new Date().toISOString(),
      page_path: page_path || window.location.pathname,
      details: details || `Visited ${page_path}`,
      recipe_name: recipe_name || null
    });
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});