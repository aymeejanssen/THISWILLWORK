
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactData {
  email: string;
  firstName?: string;
  lastName?: string;
  source?: string;
  tags?: string[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, source = 'pre-launch-signup', tags = [] }: ContactData = await req.json();
    
    const hubspotApiKey = Deno.env.get('HUBSPOT_API_KEY');
    
    if (!hubspotApiKey) {
      throw new Error('HubSpot API key not configured');
    }

    // Prepare contact properties
    const properties = {
      email,
      ...(firstName && { firstname: firstName }),
      ...(lastName && { lastname: lastName }),
      lifecyclestage: 'lead',
      lead_source: source,
      ...(tags.length > 0 && { hs_lead_status: tags.join(', ') })
    };

    console.log('Creating/updating HubSpot contact:', { email, source, tags });

    // Create or update contact in HubSpot
    const hubspotResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hubspotApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties }),
    });

    let responseData;
    const responseText = await hubspotResponse.text();
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText };
    }

    if (!hubspotResponse.ok) {
      // If contact already exists, try to update instead
      if (hubspotResponse.status === 409) {
        console.log('Contact exists, attempting to update...');
        
        // First, search for the contact by email
        const searchResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/search`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${hubspotApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filterGroups: [{
              filters: [{
                propertyName: 'email',
                operator: 'EQ',
                value: email
              }]
            }]
          }),
        });

        const searchData = await searchResponse.json();
        
        if (searchData.results && searchData.results.length > 0) {
          const contactId = searchData.results[0].id;
          
          // Update the existing contact
          const updateResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${hubspotApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ properties }),
          });

          responseData = await updateResponse.json();
          
          if (!updateResponse.ok) {
            throw new Error(`Failed to update contact: ${JSON.stringify(responseData)}`);
          }
          
          console.log('Contact updated successfully:', responseData);
        }
      } else {
        throw new Error(`HubSpot API error: ${JSON.stringify(responseData)}`);
      }
    } else {
      console.log('Contact created successfully:', responseData);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      contactId: responseData.id,
      message: 'Contact successfully added to HubSpot'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in HubSpot contact function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
