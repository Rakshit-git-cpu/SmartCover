import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting warranty expiry check...');

    // Get products expiring in the next 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const { data: expiringProducts, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        brand,
        model,
        serial_number,
        warranty_expires_at,
        user_id,
        users!inner(
          id,
          email,
          user_metadata
        )
      `)
      .lte('warranty_expires_at', thirtyDaysFromNow.toISOString())
      .gt('warranty_expires_at', new Date().toISOString()); // Not expired yet

    if (productsError) {
      throw new Error(`Failed to fetch expiring products: ${productsError.message}`);
    }

    console.log(`Found ${expiringProducts?.length || 0} products expiring soon`);

    if (!expiringProducts || expiringProducts.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No products expiring soon',
          products_checked: 0,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Group products by user
    const userProductsMap = new Map();
    
    for (const product of expiringProducts) {
      const userId = product.user_id;
      const daysUntilExpiry = Math.ceil(
        (new Date(product.warranty_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      if (!userProductsMap.has(userId)) {
        userProductsMap.set(userId, {
          user: product.users,
          products: []
        });
      }

      userProductsMap.get(userId).products.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        model: product.model,
        serial_number: product.serial_number,
        warranty_expires_at: product.warranty_expires_at,
        days_until_expiry: daysUntilExpiry,
      });
    }

    // Process each user's expiring products
    const results = [];
    
    for (const [userId, userData] of userProductsMap) {
      try {
        // Check if we've already sent a notification for this user recently (within 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data: recentNotifications } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('title', 'Warranty Expiry Alert')
          .gte('created_at', sevenDaysAgo.toISOString())
          .limit(1);

        // Skip if we already sent a notification recently
        if (recentNotifications && recentNotifications.length > 0) {
          console.log(`Skipping user ${userId} - notification sent recently`);
          continue;
        }

        // Create in-app notification
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            title: 'Warranty Expiry Alert',
            message: `${userData.products.length} product(s) will expire soon. Check your dashboard for details.`,
            type: 'warning',
            read: false,
          });

        if (notificationError) {
          console.error(`Failed to create notification for user ${userId}:`, notificationError);
        }

        // Send email notification (in a real implementation)
        const expiryNotificationData = {
          user: userData.user,
          products: userData.products,
        };

        // Call the warranty expiry notification function
        const notificationResponse = await fetch(
          `${supabaseUrl}/functions/v1/warranty-expiry-notification`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(expiryNotificationData),
          }
        );

        if (!notificationResponse.ok) {
          console.error(`Failed to send email notification for user ${userId}`);
        }

        results.push({
          user_id: userId,
          user_email: userData.user.email,
          products_count: userData.products.length,
          notification_sent: true,
        });

        console.log(`Processed user ${userId} with ${userData.products.length} expiring products`);

      } catch (userError) {
        console.error(`Error processing user ${userId}:`, userError);
        results.push({
          user_id: userId,
          error: userError.message,
          notification_sent: false,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Warranty expiry check completed',
        total_products_checked: expiringProducts.length,
        users_notified: results.filter(r => r.notification_sent).length,
        results: results,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('Error in warranty expiry check:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to check expiring warranties',
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});